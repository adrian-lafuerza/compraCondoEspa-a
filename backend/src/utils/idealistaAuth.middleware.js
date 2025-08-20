const axios = require('axios');

// Cache para almacenar el token y su tiempo de expiración
let tokenCache = {
    token: null,
    expiresAt: null
};

/**
 * Middleware para autenticación OAuth con la API de Partners de Idealista
 * Maneja automáticamente la obtención y renovación de tokens
 */
class IdealistaAuthMiddleware {
    constructor() {
        this.clientId = process.env.IDEALISTA_CLIENT_ID;
        this.clientSecret = process.env.IDEALISTA_CLIENT_SECRET;
        this.isSandbox = process.env.IDEALISTA_ENVIRONMENT !== 'production';
        this.tokenUrl = this.isSandbox
            ? 'https://partners-sandbox.idealista.com/oauth/token'
            : 'https://partners.idealista.com/oauth/token';
    }

    /**
     * Valida que las credenciales estén configuradas
     */
    validateCredentials() {
        if (!this.clientId || !this.clientSecret) {
            throw new Error('Credenciales de Idealista no configuradas en variables de entorno');
        }
    }

    /**
     * Verifica si el token actual es válido y no ha expirado
     */
    isTokenValid() {
        if (!tokenCache.token || !tokenCache.expiresAt) {
            return false;
        }
        
        // Verificar si el token expira en los próximos 5 minutos (margen de seguridad)
        const now = Date.now();
        const fiveMinutesFromNow = now + (5 * 60 * 1000);
        
        return tokenCache.expiresAt > fiveMinutesFromNow;
    }

    /**
     * Obtiene un nuevo token OAuth2 de Idealista
     */
    async fetchNewToken() {
        try {
            this.validateCredentials();

            // Codificar credenciales en Base64
            const credentials = `${this.clientId}:${this.clientSecret}`;
            const encodedCredentials = Buffer.from(credentials).toString('base64');

            const response = await axios.post(
                this.tokenUrl,
                'grant_type=client_credentials&scope=read',
                {
                    headers: {
                        'Authorization': `Basic ${encodedCredentials}`,
                        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
                    },
                    timeout: 10000 // 10 segundos de timeout
                }
            );

            if (response.status === 200 && response.data.access_token) {
                const { access_token, expires_in } = response.data;
                
                // Calcular tiempo de expiración (expires_in viene en segundos)
                const expiresAt = Date.now() + (expires_in * 1000);
                
                // Actualizar cache
                tokenCache = {
                    token: access_token,
                    expiresAt: expiresAt
                };

                // Token obtenido exitosamente
                return access_token;
            } else {
                throw new Error(`Error obteniendo token: ${response.status} - ${response.statusText}`);
            }
        } catch (error) {
            console.error('Error en fetchNewToken:', error.message);
            
            // Limpiar cache en caso de error
            tokenCache = { token: null, expiresAt: null };
            
            if (error.response) {
                throw new Error(`Error de API Idealista: ${error.response.status} - ${error.response.data?.error || error.response.statusText}`);
            } else if (error.request) {
                throw new Error('Error de conexión con la API de Idealista');
            } else {
                throw error;
            }
        }
    }

    /**
     * Obtiene un token válido (desde cache o solicitando uno nuevo)
     */
    async getValidToken() {
        try {
            // Si el token es válido, devolverlo desde cache
            if (this.isTokenValid()) {
                return tokenCache.token;
            }

            // Si no es válido, obtener uno nuevo
            return await this.fetchNewToken();
        } catch (error) {
            console.error('Error obteniendo token válido:', error.message);
            throw error;
        }
    }

    /**
     * Middleware de Express para inyectar el token en las requests
     */
    middleware() {
        return async (req, res, next) => {
            try {
                const token = await this.getValidToken();
                
                // Inyectar el token en el objeto request
                req.idealistaToken = token;
                
                // También agregar headers de autorización listos para usar
                req.idealistaHeaders = {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                };

                next();
            } catch (error) {
                console.error('Error en middleware de autenticación Idealista:', error.message);
                
                return res.status(500).json({
                    error: 'Error de autenticación con Idealista',
                    message: error.message,
                    timestamp: new Date().toISOString()
                });
            }
        };
    }

    /**
     * Método para limpiar manualmente el cache (útil para testing)
     */
    clearCache() {
        tokenCache = { token: null, expiresAt: null };
        console.log('Cache de token limpiado');
    }

    /**
     * Método para obtener información del estado del cache
     */
    getCacheInfo() {
        return {
            hasToken: !!tokenCache.token,
            expiresAt: tokenCache.expiresAt ? new Date(tokenCache.expiresAt).toISOString() : null,
            isValid: this.isTokenValid(),
            environment: this.isSandbox ? 'sandbox' : 'production'
        };
    }
}

// Crear instancia singleton
const idealistaAuth = new IdealistaAuthMiddleware();

// Exportar tanto la clase como la instancia
module.exports = {
    IdealistaAuthMiddleware,
    idealistaAuth,
    // Método directo para obtener token (compatibilidad con código existente)
    getIdealistaToken: () => idealistaAuth.getValidToken()
};