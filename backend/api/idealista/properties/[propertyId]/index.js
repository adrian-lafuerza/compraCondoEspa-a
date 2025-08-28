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

// Función para obtener imágenes de una propiedad
const getPropertyImages = async (propertyId) => {
    try {
        console.log(`🖼️ Obteniendo imágenes para propiedad: ${propertyId}`);
        
        // Verificar que propertyId no sea undefined
        if (!propertyId) {
            console.error('❌ PropertyId es undefined o null');
            return [];
        }

        // Verificar caché primero
        const cachedImages = await cacheManager.getPropertyImages(propertyId);

        if (cachedImages && cachedImages.length > 0) {
            console.log(`✅ Imágenes encontradas en caché: ${cachedImages.length} imágenes`);
            return cachedImages;
        }
        
        console.log(`🔍 Imágenes no encontradas en caché, consultando API...`);

        // Si no está en caché, consultar API
        const isSandbox = process.env.IDEALISTA_ENVIRONMENT !== 'production';
        const baseUrl = isSandbox
            ? 'https://partners-sandbox.idealista.com/'
            : 'https://partners.idealista.com/';

        const headers = await getApiHeaders();
        const endpoint = `v1/properties/${propertyId}/images`;
        const fullUrl = `${baseUrl}${endpoint}`;

        const response = await axios.get(fullUrl, { headers });
        console.log(`📡 Respuesta de API de imágenes - Status: ${response.status}`);

        if (response.status === 200) {
            // Extraer las imágenes de la respuesta
            const images = response.data?.images || [];
            console.log(`📸 Imágenes obtenidas de API: ${images.length} imágenes`);

            // Guardar en caché
            if (images.length > 0) {
                await cacheManager.setPropertyImages(propertyId, images);
            }
            return images;
        } else {
            throw new Error(`Error obteniendo imágenes: ${response.status}`);
        }
    } catch (error) {
        console.error(`Error obteniendo imágenes para propiedad ${propertyId}:`, error.message);
        return []; // Devolver array vacío si no se pueden obtener imágenes
    }
};

// Función para buscar propiedad por ID en Idealista
const searchPropertyByIdInIdealista = async (propertyId) => {
    try {
        const headers = await getApiHeaders();
        const isSandbox = process.env.IDEALISTA_ENVIRONMENT !== 'production';
        const baseUrl = isSandbox
            ? 'https://partners-sandbox.idealista.com/'
            : 'https://partners.idealista.com/';

        console.log(`🔍 Buscando propiedad ${propertyId} en API de Idealista`);
        
        const response = await axios.get(`${baseUrl}v1/properties/${propertyId}`, {
            headers
        });

        if (response.data && response.data.property) {
            console.log(`✅ Propiedad ${propertyId} encontrada en Idealista`);
            return response.data.property;
        } else {
            console.log(`❌ Propiedad ${propertyId} no encontrada en Idealista`);
            return null;
        }
    } catch (error) {
        console.error(`Error buscando propiedad ${propertyId} en Idealista:`, error.message);
        return null;
    }
};

// Función para buscar en todas las propiedades como fallback
const searchInAllProperties = async (propertyId) => {
    try {
        console.log(`🔍 Búsqueda específica fallida, buscando en todas las propiedades...`);
        
        const headers = await getApiHeaders();
        const isSandbox = process.env.IDEALISTA_ENVIRONMENT !== 'production';
        const baseUrl = isSandbox
            ? 'https://partners-sandbox.idealista.com/'
            : 'https://partners.idealista.com/';

        const searchOptions = {
            page: 1,
            size: 1000,
            state: 'active'
        };

        const queryParams = new URLSearchParams({
            page: searchOptions.page,
            size: searchOptions.size,
            state: searchOptions.state
        });

        const response = await axios.get(`${baseUrl}v1/properties?${queryParams}`, {
            headers
        });

        if (response.data && response.data.properties) {
            const property = response.data.properties.find(prop => 
                prop.propertyCode === propertyId || 
                prop.propertyCode === parseInt(propertyId) ||
                prop.propertyId === propertyId || 
                prop.propertyId === parseInt(propertyId) ||
                prop.id === propertyId ||
                prop.id === parseInt(propertyId)
            );
            
            if (property) {
                console.log(`✅ Propiedad ${propertyId} encontrada en búsqueda general`);
                // Obtener imágenes de la propiedad
                const images = await getPropertyImages(propertyId);
                return {
                    ...property,
                    images: images
                };
            }
        }
        
        return null;
    } catch (error) {
        console.error(`Error en búsqueda general para propiedad ${propertyId}:`, error.message);
        return null;
    }
};

// Función para generar datos de fallback
const generateFallbackProperty = (propertyId) => {
    return {
        propertyCode: propertyId,
        thumbnail: 'https://img4.idealista.com/blur/WEB_LISTING-M/0/id.pro.es.image.master/6b/32/33/1293133167.webp',
        externalReference: propertyId,
        numPhotos: 10,
        floor: '2',
        price: 850000,
        priceInfo: {
            price: {
                amount: 850000,
                currencySuffix: '€'
            }
        },
        propertyType: 'flat',
        operation: 'sale',
        size: 120,
        exterior: true,
        rooms: 3,
        bathrooms: 2,
        address: 'Calle Ejemplo, Madrid',
        province: 'Madrid',
        municipality: 'Madrid',
        district: 'Centro',
        country: 'es',
        neighborhood: 'Sol',
        latitude: 40.4168,
        longitude: -3.7038,
        description: `Propiedad de ejemplo para ID ${propertyId}. Esta es una descripción generada automáticamente.`,
        hasVideo: false,
        status: 'good',
        newDevelopment: false,
        hasLift: true,
        parkingSpace: {
            hasParkingSpace: true,
            isParkingSpaceIncludedInPrice: true
        },
        detailedType: {
            typology: 'flat'
        },
        suggestedTexts: {
            subtitle: `Piso en venta en ${propertyId}`,
            title: `Piso de 3 habitaciones en venta en Centro, Madrid`
        },
        hasplan: false,
        has3DTour: false,
        has360: false,
        hasStaging: false,
        topNewDevelopment: false
    };
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

        console.log(`🔍 Buscando propiedad con ID: ${propertyId}`);

        // 1. Verificar caché individual primero
        console.log(`🔍 Verificando caché individual para propiedad ${propertyId}...`);
        const cacheKey = `properties:${propertyId}`;
        const cachedProperty = await cacheManager.cache.get(cacheKey);
        
        if (cachedProperty) {
            console.log(`✅ Propiedad ${propertyId} encontrada en caché individual`);
            
            // Obtener imágenes de la propiedad
            const images = await getPropertyImages(propertyId);
            
            return res.status(200).json({
                success: true,
                data: {
                    ...cachedProperty,
                    images: images
                },
                message: `Property ${propertyId} found in cache`,
                source: 'cache'
            });
        }

        // 2. Buscar en caché de todas las propiedades
        console.log(`🔍 Buscando en caché de todas las propiedades...`);
        const allPropertiesKey = 'properties';
        const allProperties = await cacheManager.cache.get(allPropertiesKey);
        
        if (allProperties && allProperties.properties) {
            const property = allProperties.properties.find(prop => 
                prop.propertyId === propertyId || 
                prop.propertyId === parseInt(propertyId) ||
                prop.id === propertyId ||
                prop.id === parseInt(propertyId)
            );
            
            if (property) {
                // Guardar en caché individual
                await cacheManager.cache.set(cacheKey, property, cacheManager.ttl.PROPERTIES);
                
                // Obtener imágenes de la propiedad
                const images = await getPropertyImages(propertyId);
                
                console.log(`✅ Propiedad ${propertyId} encontrada en caché de todas las propiedades`);
                return res.status(200).json({
                    success: true,
                    data: {
                        ...property,
                        images: images
                    },
                    message: `Property ${propertyId} found successfully`,
                    source: 'all-properties-cache'
                });
            }
        }

        // Si no está en caché, buscar en la API de Idealista
        console.log(`🔍 Propiedad no encontrada en caché, consultando API de Idealista...`);

        // Verificar configuración de Idealista
        console.log(`🔍 Verificando credenciales de Idealista...`);
        console.log(`CLIENT_ID exists: ${!!process.env.IDEALISTA_CLIENT_ID}`);
        console.log(`CLIENT_SECRET exists: ${!!process.env.IDEALISTA_CLIENT_SECRET}`);
        
        if (!process.env.IDEALISTA_CLIENT_ID || !process.env.IDEALISTA_CLIENT_SECRET) {
            console.log(`⚠️ Credenciales de Idealista no configuradas, usando datos de fallback para ${propertyId}`);
            const fallbackProperty = generateFallbackProperty(propertyId);
            
            return res.status(200).json({
                success: true,
                data: {
                    message: "Propiedad no encontrada, datos de ejemplo",
                    success: true,
                    property: fallbackProperty,
                    images: [],
                    source: 'fallback'
                }
            });
        }

        // Si no está en caché, buscar en la API de Idealista
        console.log(`🔍 Buscando propiedad ${propertyId} en API de Idealista...`);
        
        try {
            const specificProperty = await searchPropertyByIdInIdealista(propertyId);
            
            if (specificProperty) {
                console.log(`✅ Propiedad ${propertyId} encontrada en API de Idealista`);
                
                // Obtener imágenes de la propiedad
                const images = await getPropertyImages(propertyId);
                
                // Guardar en caché individual
                await cacheManager.cache.set(cacheKey, specificProperty, cacheManager.ttl.PROPERTIES);
                
                return res.status(200).json({
                    success: true,
                    data: {
                        message: "Propiedad encontrada en Idealista",
                        success: true,
                        ...specificProperty,
                        images: images
                    }
                });
            }
        } catch (apiError) {
            console.error(`Error consultando API de Idealista para propiedad ${propertyId}:`, apiError.message);
        }
        
        // 3. Si no se encuentra con búsqueda específica, buscar en todas las propiedades como fallback
        console.log(`🔍 Búsqueda específica fallida, buscando en todas las propiedades...`);
        
        try {
            const fallbackProperty = await searchInAllProperties(propertyId);
            
            if (fallbackProperty) {
                // Guardar en caché individual
                await cacheManager.cache.set(cacheKey, fallbackProperty, cacheManager.ttl.PROPERTIES);
                
                console.log(`✅ Propiedad ${propertyId} encontrada en API`);
                return res.status(200).json({
                    success: true,
                    data: fallbackProperty,
                    message: `Property ${propertyId} found successfully`,
                    source: 'idealista-api'
                });
            }
        } catch (fallbackError) {
            console.error(`Error en búsqueda de fallback para propiedad ${propertyId}:`, fallbackError.message);
        }
        
        // Si no se encuentra la propiedad
        return res.status(404).json({
            success: false,
            error: `Property with ID ${propertyId} not found`
        });

    } catch (error) {
        console.error('Error en getPropertyById:', error);
        
        // Si hay error con la API de Idealista, devolver datos de fallback usando la función existente
        console.log(`⚠️ Error en API, usando datos de fallback para ${propertyId}`);
        const fallbackProperty = generateFallbackProperty(propertyId);
        
        return res.status(200).json({
            success: true,
            data: {
                message: "Propiedad no encontrada, datos de ejemplo",
                success: true,
                property: fallbackProperty,
                images: [],
                source: 'fallback'
            }
        });
    }
};