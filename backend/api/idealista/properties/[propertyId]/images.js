const axios = require('axios');
const { cacheManager } = require('../../../../src/utils/cacheManager');

// Función para obtener token de Idealista
const getIdealistaToken = async () => {
    try {
        const credentials = {
            apikey: process.env.IDEALISTA_CLIENT_ID,
            secret: process.env.IDEALISTA_CLIENT_SECRET
        };

        if (!credentials.apikey || !credentials.secret) {
            throw new Error('Credenciales de Idealista no configuradas');
        }

        const isSandbox = process.env.IDEALISTA_ENVIRONMENT !== 'production';
        const baseUrl = isSandbox
            ? 'https://partners-sandbox.idealista.com/'
            : 'https://partners.idealista.com/';

        const response = await axios.post(`${baseUrl}oauth/token`, 
            'grant_type=client_credentials&scope=read',
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': `Basic ${Buffer.from(`${credentials.apikey}:${credentials.secret}`).toString('base64')}`
                }
            }
        );

        return response.data.access_token;
    } catch (error) {
        console.error('Error obteniendo token de Idealista:', error.message);
        throw error;
    }
};

// Función para obtener headers de API
const getApiHeaders = async () => {
    const token = await getIdealistaToken();

    return {
        feedKey: process.env.IDEALISTA_FEED_KEY,
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        Accept: 'application/json'
    };
};

// Función para obtener imágenes de una propiedad específica
const getPropertyImages = async (propertyId) => {
    try {
        if (!propertyId) {
            throw new Error('PropertyId es requerido');
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
        throw error;
    }
};

module.exports = async (req, res) => {
    // Configurar CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'GET') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
    }

    try {
        const { propertyId } = req.query;

        if (!propertyId) {
            return res.status(400).json({
                success: false,
                message: "ID de propiedad requerido"
            });
        }

        // Verificar configuración de Idealista
        if (!process.env.IDEALISTA_CLIENT_ID || !process.env.IDEALISTA_CLIENT_SECRET) {
            return res.status(500).json({
                success: false,
                message: "Credenciales de Idealista no configuradas",
                data: {
                    propertyId,
                    images: []
                }
            });
        }

        // Intentar obtener del caché primero
        let images = await cacheManager.getPropertyImages(propertyId);
        
        if (images) {
            console.log(`📦 Imágenes obtenidas del caché para propiedad: ${propertyId}`);
        } else {
            console.log(`🔍 Buscando imágenes en API de Idealista para propiedad: ${propertyId}`);
            images = await getPropertyImages(propertyId);
            
            // Guardar en caché para futuras consultas
            if (images && images.length > 0) {
                await cacheManager.setPropertyImages(propertyId, images);
                console.log(`💾 Imágenes guardadas en caché para propiedad: ${propertyId}`);
            }
        }

        res.status(200).json({
            success: true,
            data: {
                propertyId,
                images: images || []
            },
            message: images && images.length > 0 ? "Imágenes obtenidas exitosamente" : "No se encontraron imágenes para esta propiedad"
        });

    } catch (error) {
        console.error('Error en getPropertyImages:', error);
        
        res.status(500).json({
            success: false,
            message: "Error obteniendo imágenes de la propiedad",
            error: error.message,
            data: {
                propertyId: req.query.propertyId,
                images: []
            }
        });
    }
};