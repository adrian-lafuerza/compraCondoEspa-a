const axios = require('axios');
const cacheManager = require('../../src/utils/cacheManager');
const { handleCors } = require('../../src/utils/corsHandler');

// Función para obtener token de acceso
const getAccessToken = async () => {
    try {
        const clientId = process.env.IDEALISTA_CLIENT_ID;
        const clientSecret = process.env.IDEALISTA_CLIENT_SECRET;
        
        if (!clientId || !clientSecret) {
            throw new Error('Credenciales de Idealista no configuradas');
        }

        const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
        const isSandbox = process.env.IDEALISTA_ENVIRONMENT !== 'production';
        const baseUrl = isSandbox
            ? 'https://partners-sandbox.idealista.com/'
            : 'https://partners.idealista.com/';

        const response = await axios.post(
            `${baseUrl}oauth/token`,
            'grant_type=client_credentials',
            {
                headers: {
                    'Authorization': `Basic ${credentials}`,
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
        );

        return response.data.access_token;
    } catch (error) {
        console.error('Error obteniendo token de acceso:', error.message);
        throw error;
    }
};

// Función para obtener headers de API
const getApiHeaders = async () => {
    const token = await getAccessToken();
    return {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    };
};

// Función para obtener imágenes de una propiedad
const getPropertyImages = async (propertyId) => {
    try {
        if (!propertyId) {
            return [];
        }

        const isSandbox = process.env.IDEALISTA_ENVIRONMENT !== 'production';
        const baseUrl = isSandbox
            ? 'https://partners-sandbox.idealista.com/'
            : 'https://partners.idealista.com/';

        const headers = await getApiHeaders();
        const endpoint = `v1/properties/${propertyId}/images`;
        const fullUrl = `${baseUrl}${endpoint}`;

        const response = await axios.get(fullUrl, { headers });

        if (response.status === 200) {
            return response.data?.images || [];
        } else {
            throw new Error(`Error obteniendo imágenes: ${response.status}`);
        }
    } catch (error) {
        console.error(`Error obteniendo imágenes para propiedad ${propertyId}:`, error.message);
        return [];
    }
};

// Función para obtener imágenes con caché
const getPropertyImagesWithCache = async (propertyId) => {
    try {
        if (!propertyId) {
            return [];
        }

        // Intentar obtener del caché primero
        const cachedImages = await cacheManager.getPropertyImages(propertyId);
        if (cachedImages) {
            console.log(`📦 Imágenes obtenidas del caché para propiedad ${propertyId}`);
            return cachedImages;
        }

        // Si no está en caché, obtener de la API
        console.log(`🔍 Descargando imágenes para propiedad ${propertyId}...`);
        const images = await getPropertyImages(propertyId);
        
        // Guardar en caché para futuras consultas
        if (images && images.length > 0) {
            await cacheManager.setPropertyImages(propertyId, images);
            console.log(`💾 Imágenes guardadas en caché para propiedad ${propertyId}`);
        }
        
        return images;
    } catch (error) {
        console.error(`Error obteniendo imágenes con caché para propiedad ${propertyId}:`, error.message);
        return [];
    }
};

module.exports = async (req, res) => {
    // Manejar CORS
    if (!handleCors(req, res)) {
        return; // Ya respondió o bloqueó la request
    }

    if (req.method !== 'GET') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
    }

    try {
        // Obtener propertyId de los parámetros de consulta
        const propertyId = req.query.propertyId;
        
        if (!propertyId) {
            return res.status(400).json({
                success: false,
                error: 'propertyId es requerido',
                message: 'Debe proporcionar un propertyId en los parámetros de consulta'
            });
        }

        // Verificar configuración de Idealista
        if (!process.env.IDEALISTA_CLIENT_ID || !process.env.IDEALISTA_CLIENT_SECRET) {
            return res.status(200).json({
                success: true,
                data: {
                    propertyId: propertyId,
                    images: []
                },
                message: 'Credenciales de Idealista no configuradas - sin imágenes disponibles',
                source: 'fallback'
            });
        }

        console.log(`🖼️ Solicitando imágenes para propiedad: ${propertyId}`);
        const startTime = Date.now();
        
        const images = await getPropertyImagesWithCache(propertyId);
        
        const endTime = Date.now();
        const duration = (endTime - startTime) / 1000;
        
        console.log(`✅ Imágenes obtenidas para propiedad ${propertyId}: ${images.length} imágenes en ${duration.toFixed(2)}s`);
        
        return res.status(200).json({
            success: true,
            data: {
                propertyId: propertyId,
                images: images,
                totalImages: images.length
            },
            message: `Imágenes obtenidas exitosamente en ${duration.toFixed(2)} segundos`,
            source: 'idealista-api',
            performance: {
                duration: `${duration.toFixed(2)}s`,
                imageCount: images.length
            }
        });
        
    } catch (error) {
        console.error('❌ Error en endpoint de imágenes:', error.message);
        
        return res.status(500).json({
            success: false,
            error: 'Error interno del servidor',
            message: error.message,
            source: 'error'
        });
    }
};