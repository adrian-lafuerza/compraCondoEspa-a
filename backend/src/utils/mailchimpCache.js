const NodeCache = require('node-cache');

// Configuración de Node Cache para Mailchimp
class MailchimpMemoryCache {
    constructor() {
        // Crear instancias de caché con diferentes TTL
        this.campaignsCache = new NodeCache({ 
            stdTTL: 1800, // 30 minutos
            checkperiod: 600, // Verificar cada 10 minutos
            useClones: false // Mejor rendimiento
        });
        
        this.campaignContentCache = new NodeCache({ 
            stdTTL: 3600, // 1 hora
            checkperiod: 600,
            useClones: false
        });
        
        this.isConnected = true; // Siempre disponible
        console.log('✅ Caché de Mailchimp en memoria inicializado correctamente');
        
        // Eventos para monitoreo
        this.campaignsCache.on('set', (key, value) => {
            // Campañas guardadas en caché
        });
        
        this.campaignContentCache.on('set', (key, value) => {
            // Contenido de campañas guardado en caché
        });
        
        this.campaignsCache.on('expired', (key, value) => {
            console.log(`⏰ Caché de campañas expirado: ${key}`);
        });
        
        this.campaignContentCache.on('expired', (key, value) => {
            console.log(`⏰ Caché de contenido de campañas expirado: ${key}`);
        });
    }

    // Obtener datos del caché
    async get(key) {
        try {
            if (key.startsWith('campaigns:')) {
                const data = this.campaignsCache.get(key);
                if (data) {
                    console.log(`📋 Campañas obtenidas del caché: ${key}`);
                }
                return data;
            } else if (key.startsWith('content:')) {
                const data = this.campaignContentCache.get(key);
                if (data) {
                    console.log(`📄 Contenido de campaña obtenido del caché: ${key}`);
                }
                return data;
            }
            return null;
        } catch (error) {
            console.log('❌ Error al obtener del caché de Mailchimp:', error.message);
            return null;
        }
    }

    // Guardar datos en el caché
    async set(key, data, ttlSeconds = null) {
        try {
            if (key.startsWith('campaigns:')) {
                this.campaignsCache.set(key, data, ttlSeconds || 1800);
                console.log(`💾 Campañas guardadas en caché: ${key}`);
            } else if (key.startsWith('content:')) {
                this.campaignContentCache.set(key, data, ttlSeconds || 3600);
                console.log(`💾 Contenido de campaña guardado en caché: ${key}`);
            }
            return true;
        } catch (error) {
            console.log('❌ Error al guardar en caché de Mailchimp:', error.message);
            return false;
        }
    }

    // Eliminar una clave específica
    async del(key) {
        try {
            if (key.startsWith('campaigns:')) {
                return this.campaignsCache.del(key) > 0;
            } else if (key.startsWith('content:')) {
                return this.campaignContentCache.del(key) > 0;
            }
            return false;
        } catch (error) {
            console.log('❌ Error al eliminar del caché de Mailchimp:', error.message);
            return false;
        }
    }

    // Limpiar todo el caché
    async flush() {
        try {
            this.campaignsCache.flushAll();
            this.campaignContentCache.flushAll();
            console.log('🧹 Caché de Mailchimp completamente limpiado');
            return true;
        } catch (error) {
            console.log('❌ Error al limpiar caché de Mailchimp:', error.message);
            return false;
        }
    }

    // Verificar si existe una clave
    async exists(key) {
        try {
            if (key.startsWith('campaigns:')) {
                return this.campaignsCache.has(key);
            } else if (key.startsWith('content:')) {
                return this.campaignContentCache.has(key);
            }
            return false;
        } catch (error) {
            return false;
        }
    }

    // Obtener TTL de una clave
    async ttl(key) {
        try {
            if (key.startsWith('campaigns:')) {
                return this.campaignsCache.getTtl(key);
            } else if (key.startsWith('content:')) {
                return this.campaignContentCache.getTtl(key);
            }
            return -1;
        } catch (error) {
            return -1;
        }
    }

    // Cerrar conexión (no necesario para node-cache)
    async close() {
        this.campaignsCache.close();
        this.campaignContentCache.close();
        console.log('🔌 Caché de Mailchimp cerrado');
    }

    // Obtener estadísticas del caché
    async getStats() {
        try {
            const campaignsStats = this.campaignsCache.getStats();
            const contentStats = this.campaignContentCache.getStats();
            
            return {
                connected: this.isConnected,
                campaigns: {
                    keys: campaignsStats.keys,
                    hits: campaignsStats.hits,
                    misses: campaignsStats.misses,
                    ksize: campaignsStats.ksize,
                    vsize: campaignsStats.vsize
                },
                content: {
                    keys: contentStats.keys,
                    hits: contentStats.hits,
                    misses: contentStats.misses,
                    ksize: contentStats.ksize,
                    vsize: contentStats.vsize
                },
                total_keys: campaignsStats.keys + contentStats.keys,
                total_hits: campaignsStats.hits + contentStats.hits,
                total_misses: campaignsStats.misses + contentStats.misses
            };
        } catch (error) {
            return {
                connected: false,
                error: error.message
            };
        }
    }

    // Limpiar solo caché de campañas
    async clearCampaigns() {
        try {
            this.campaignsCache.flushAll();
            console.log('🧹 Caché de campañas limpiado');
            return true;
        } catch (error) {
            console.log('❌ Error al limpiar caché de campañas:', error.message);
            return false;
        }
    }

    // Limpiar solo caché de contenido
    async clearContent() {
        try {
            this.campaignContentCache.flushAll();
            console.log('🧹 Caché de contenido de campañas limpiado');
            return true;
        } catch (error) {
            console.log('❌ Error al limpiar caché de contenido:', error.message);
            return false;
        }
    }
}

// Crear instancia única del caché
const mailchimpMemoryCache = new MailchimpMemoryCache();

// Definir claves de caché
const MailchimpCacheKeys = {
    CAMPAIGNS: 'campaigns',
    CONTENT: 'content'
};

// Definir TTL (Time To Live) en segundos
const MailchimpCacheTTL = {
    CAMPAIGNS: 1800, // 30 minutos
    CONTENT: 3600,   // 1 hora
    CAMPAIGN_DETAIL: 1800 // 30 minutos
};

module.exports = {
    mailchimpCache: mailchimpMemoryCache,
    MailchimpCacheKeys,
    MailchimpCacheTTL
};