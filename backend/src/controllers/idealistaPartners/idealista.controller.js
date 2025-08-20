// Controlador de Idealista con integración a la API real
const axios = require('axios');
const { getIdealistaToken } = require('../../utils/idealistaAuth.middleware');
const { redisCache, CacheKeys, CacheTTL } = require('../../utils/nodeCache');

// Map para almacenar promesas pendientes y evitar llamadas duplicadas
const pendingRequests = new Map();

// Nota: La función getIdealistaToken ahora viene del middleware de autenticación
// que maneja automáticamente el cache y renovación de tokens

const getApiHeaders = async () => {
    const token = await getIdealistaToken();

    return {
        feedKey: process.env.IDEALISTA_FEED_KEY,
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        Accept: 'application/json'
    };
}

// Función para obtener imágenes de una propiedad específica
const getPropertyImages = async (propertyId) => {
    try {
        // Verificar que propertyId no sea undefined
        if (!propertyId) {
            console.error('❌ PropertyId es undefined o null');
            return [];
        }

        // Verificar caché primero
        const cacheKey = `${CacheKeys.IMAGES}:${propertyId}`;
        const cachedImages = await redisCache.get(cacheKey);

        if (cachedImages) {
            return cachedImages;
        }

        // Si no está en caché, consultar API

        const isSandbox = process.env.IDEALISTA_ENVIRONMENT !== 'production';
        const baseUrl = isSandbox
            ? 'https://partners-sandbox.idealista.com/'
            : 'https://partners.idealista.com/';

        const headers = await getApiHeaders();
        const endpoint = `v1/properties/${propertyId}/images`;
        const fullUrl = `${baseUrl}${endpoint}`;

        const response = await axios.get(fullUrl, { headers });

        if (response.status === 200) {
            // Extraer las imágenes de la respuesta
            const images = response.data?.images || [];

            // Guardar en caché
            await redisCache.set(cacheKey, images, CacheTTL.IMAGES);
            return images;
        } else {
            throw new Error(`Error obteniendo imágenes: ${response.status}`);
        }
    } catch (error) {
        console.error(`Error obteniendo imágenes para propiedad ${propertyId}:`, error.message);
        return []; // Devolver array vacío si no se pueden obtener imágenes
    }
};

// Función para buscar propiedades en la API de Idealista
const searchIdealistaProperties = async (options = {}) => {
    try {
        // Crear clave de caché basada en los parámetros de búsqueda
        const searchParams = {
            page: options.page || 1,
            size: options.size || 100,
            state: options.state || 'active'
        };

        const cacheKey = `${CacheKeys.PROPERTIES}:${JSON.stringify(searchParams)}`;

        // Verificar caché primero
        const cachedData = await redisCache.get(cacheKey);
        
        if (cachedData) {
            return cachedData;
        }

        // Verificar si ya hay una petición pendiente para esta clave
        if (pendingRequests.has(cacheKey)) {
            // Esperar a que termine la petición pendiente
            return await pendingRequests.get(cacheKey);
        }

        // Crear promesa para la petición a la API
        const apiPromise = (async () => {
            try {
                // Usar la API de Partners de Idealista
                const isSandbox = process.env.IDEALISTA_ENVIRONMENT !== 'production';
                const baseUrl = isSandbox
                    ? 'https://partners-sandbox.idealista.com/'
                    : 'https://partners.idealista.com/';

                const headers = await getApiHeaders();

                const endpoint = 'v1/properties';
                const queryString = new URLSearchParams(searchParams).toString();
                const fullUrl = `${baseUrl}${endpoint}?${queryString}`;

                const response = await axios.get(fullUrl, {
                    headers,
                });

                return response;
            } finally {
                // Limpiar la petición pendiente cuando termine
                pendingRequests.delete(cacheKey);
            }
        })();

        // Almacenar la promesa en el Map
        pendingRequests.set(cacheKey, apiPromise.then(async (response) => {
            console.log("esta aqui hizo la consulta", response.status);
            
            if (response.status === 200) {
                // Enriquecer propiedades con imágenes
                if (response.data && response.data.properties) {
                    const enrichedProperties = await Promise.all(
                        response.data.properties.map(async (property) => {
                            const images = await getPropertyImages(property.propertyId);
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
                    
                    // Guardar en caché
                    await redisCache.set(cacheKey, enrichedData, CacheTTL.PROPERTIES);
                    
                    return enrichedData;
                }
                
                return response.data;
            } else {
                throw new Error(`Error buscando propiedades: ${response.status}`);
            }
        }));

        // Retornar el resultado de la promesa
        return await pendingRequests.get(cacheKey);
    } catch (error) {
        // console.error('Error en searchIdealistaProperties:', error.message);
        throw error;
    }
};

// Controlador para obtener imágenes de una propiedad específica
const getPropertyImagesController = async (req, res) => {
    try {
        const { propertyId } = req.params;

        if (!propertyId) {
            return res.status(400).json({
                success: false,
                message: "ID de propiedad requerido"
            });
        }

        const images = await getPropertyImages(propertyId);

        res.status(200).json({
            success: true,
            data: {
                propertyId,
                images
            },
            message: "Imágenes obtenidas exitosamente"
        });

    } catch (error) {
        console.error('Error en getPropertyImagesController:', error);
        res.status(500).json({
            success: false,
            message: "Error obteniendo imágenes de la propiedad",
            error: error.message
        });
    }
};

const getProperties = async (req, res) => {
    try {
        // Extraer parámetros de búsqueda del request
        const searchOptions = {
            page: parseInt(req.query.page) || 1,
            size: parseInt(req.query.size) || 100,
            state: req.query.state || 'active'
        };

        // Buscar propiedades en la API de Idealista
        const idealistaData = await searchIdealistaProperties(searchOptions);

        // Respuesta exitosa con los datos de la API de Idealista
        res.status(200).json({
            success: true,
            data: idealistaData,
            message: "Propiedades obtenidas exitosamente desde Idealista API"
        });

    } catch (error) {
        // console.error('Error en getProperties:', error);

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

module.exports = {
    getProperties,
    getPropertyImagesController
};