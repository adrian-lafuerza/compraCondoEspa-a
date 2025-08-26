const axios = require('axios');
const { cacheManager } = require('../../src/utils/cacheManager');
const fs = require('fs').promises;
const path = require('path');

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

// Función para obtener imágenes de una propiedad con caché
const getPropertyImagesWithCache = async (propertyId) => {
    try {
        // Intentar obtener desde caché primero
        const cachedImages = await cacheManager.getPropertyImages(propertyId);
        
        if (cachedImages) {
            console.log(`📸 Imágenes obtenidas del caché para propiedad ${propertyId}`);
            return cachedImages;
        }

        // Si no está en caché, obtener de la API
        const images = await getPropertyImages(propertyId);
        
        // Guardar en caché
        await cacheManager.setPropertyImages(propertyId, images);
        
        return images;
    } catch (error) {
        console.error(`❌ Error obteniendo imágenes para propiedad ${propertyId}:`, error.message);
        return [];
    }
};

// Función para leer propiedades desde memoria global rápida
const readPropertiesFromCacheFast = async () => {
    try {
        // Verificar si hay datos en memoria global rápida
        if (!global.propertiesCacheFast) {
            console.log('📄 No hay datos rápidos en memoria global');
            return null;
        }
        
        const data = global.propertiesCacheFast;
        
        // Verificar si los datos son recientes (menos de 2 horas)
        const lastUpdated = new Date(data.lastUpdated);
        const now = new Date();
        const hoursDiff = (now - lastUpdated) / (1000 * 60 * 60);
        
        if (hoursDiff > 2) {
            console.log(`⏰ Datos rápidos en caché desactualizados (${hoursDiff.toFixed(1)} horas), usando API`);
            return null;
        }
        
        console.log(`⚡ Propiedades rápidas leídas desde memoria global: ${data.totalProperties} (actualizado hace ${hoursDiff.toFixed(1)} horas)`);
        return data;
        
    } catch (error) {
        console.error('❌ Error leyendo datos rápidos de memoria global:', error.message);
        return null;
    }
};

// Función para buscar propiedades CON imágenes (desde caché)
const searchIdealistaPropertiesFast = async (options = {}) => {
    try {
        const searchParams = {
            page: options.page || 1,
            size: options.size || 100,
            state: options.state || 'active'
        };

        console.log('🚀 Búsqueda desde caché - CON imágenes');
        
        const isSandbox = process.env.IDEALISTA_ENVIRONMENT !== 'production';
        const baseUrl = isSandbox
            ? 'https://partners-sandbox.idealista.com/'
            : 'https://partners.idealista.com/';

        const headers = await getApiHeaders();
        const endpoint = 'v1/properties';
        const queryString = new URLSearchParams(searchParams).toString();
        const fullUrl = `${baseUrl}${endpoint}?${queryString}`;

        const response = await axios.get(fullUrl, { headers });

        if (response.status === 200) {
            // Enriquecer propiedades con imágenes desde caché
            if (response.data && response.data.properties) {
                const enrichedProperties = await Promise.all(
                    response.data.properties.map(async (property) => {
                        const images = await getPropertyImagesWithCache(property.propertyId);
                        return {
                            ...property,
                            images: images || []
                        };
                    })
                );
                
                const enrichedData = {
                    ...response.data,
                    properties: enrichedProperties
                };
                
                console.log(`⚡ Propiedades obtenidas con imágenes: ${enrichedData.properties.length}`);
                return enrichedData;
            }
            
            return response.data;
        } else {
            throw new Error(`Error buscando propiedades: ${response.status}`);
        }
    } catch (error) {
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
        // Extraer parámetros de búsqueda del request
        const searchOptions = {
            page: parseInt(req.query.page) || 1,
            size: parseInt(req.query.size) || 100,
            state: req.query.state || 'active'
        };

        // Verificar configuración de Idealista
        if (!process.env.IDEALISTA_CLIENT_ID || !process.env.IDEALISTA_CLIENT_SECRET) {
            // Devolver datos de fallback si no está configurado
            const fallbackProperties = [
                {
                    id: 'fallback-1',
                    title: "Propiedad de ejemplo - API no disponible",
                    price: 0,
                    currency: "EUR",
                    size: 0,
                    rooms: 0,
                    bathrooms: 0,
                    location: {
                        address: "Dirección no disponible",
                        city: "Madrid",
                        province: "Madrid",
                        postalCode: "00000",
                        coordinates: {
                            latitude: 40.4168,
                            longitude: -3.7038
                        }
                    },
                    description: "La API de Idealista no está disponible en este momento. Por favor, configure las credenciales correctas.",
                    features: [],
                    images: [],
                    propertyType: "homes",
                    operation: "sale",
                    energyRating: "N/A",
                    publishedDate: new Date().toISOString().split('T')[0],
                    contact: {
                        phone: null,
                        email: null
                    }
                }
            ];

            return res.status(200).json({
                success: false,
                data: {
                    properties: fallbackProperties,
                    total: 1,
                    totalPages: 1,
                    actualPage: 1,
                    itemsPerPage: 50
                },
                message: "Credenciales de Idealista no configuradas. Mostrando datos de ejemplo."
            });
        }

        // Intentar leer desde memoria global rápida primero
        console.log('🔍 Verificando datos rápidos en memoria global...');
        const cachedData = await readPropertiesFromCacheFast();
        
        if (cachedData) {
            // Datos en caché disponibles y actualizados (con imágenes)
            console.log('📦 ✅ Propiedades obtenidas desde memoria global (instantáneo, CON imágenes)');
            return res.status(200).json({
                success: true,
                data: cachedData,
                message: `Propiedades obtenidas instantáneamente desde caché en memoria (CON imágenes). Última actualización: ${cachedData.lastUpdated}`,
                source: 'memory-cache-fast'
            });
        }

        // Si no hay datos en caché, buscar en API CON imágenes desde caché
        console.log('🚀 Buscando en API de Idealista (CON imágenes desde caché)...');
        const startTime = Date.now();
        
        const idealistaData = await searchIdealistaPropertiesFast(searchOptions);
        
        const endTime = Date.now();
        const duration = (endTime - startTime) / 1000;
        
        console.log(`⚡ ✅ Propiedades obtenidas desde Idealista API (${duration.toFixed(2)}s, CON imágenes)`);
        
        return res.status(200).json({
            success: true,
            data: idealistaData,
            message: `Propiedades obtenidas exitosamente desde Idealista API en ${duration.toFixed(2)} segundos (CON imágenes desde caché)`,
            source: 'idealista-api-fast',
            performance: {
                duration: `${duration.toFixed(2)}s`,
                withImages: true
            }
        });

    } catch (error) {
        console.error('Error en getProperties:', error);

        // Si hay error con la API de Idealista, devolver datos de fallback
        const fallbackProperties = [
            {
                id: 'fallback-1',
                title: "Propiedad de ejemplo - API no disponible",
                price: 0,
                currency: "EUR",
                size: 0,
                rooms: 0,
                bathrooms: 0,
                location: {
                    address: "Dirección no disponible",
                    city: "Madrid",
                    province: "Madrid",
                    postalCode: "00000",
                    coordinates: {
                        latitude: 40.4168,
                        longitude: -3.7038
                    }
                },
                description: "La API de Idealista no está disponible en este momento. Por favor, configure las credenciales correctas.",
                features: [],
                images: [],
                propertyType: "homes",
                operation: "sale",
                energyRating: "N/A",
                publishedDate: new Date().toISOString().split('T')[0],
                contact: {
                    phone: null,
                    email: null
                }
            }
        ];

        res.status(200).json({
            success: false,
            data: {
                properties: fallbackProperties,
                total: 1,
                totalPages: 1,
                actualPage: 1,
                itemsPerPage: 50
            },
            message: "Error conectando con Idealista API. Mostrando datos de ejemplo.",
            error: error.message
        });
    }
};