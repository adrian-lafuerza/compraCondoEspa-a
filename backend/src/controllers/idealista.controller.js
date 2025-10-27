/**
 * Controlador de Idealista con integración al sistema FTP
 * Reemplaza la integración con la API por descarga de archivos XML/JSON desde FTP
 */
const IdealistaFtpService = require('../services/idealistaFtp.service');
const { redisCache, CacheKeys, CacheTTL } = require('../utils/nodeCache');

// Instancia del servicio FTP
const ftpService = new IdealistaFtpService();

/**
 * Obtiene todas las propiedades con filtros opcionales
 */
const getProperties = async (req, res) => {
    try {
        // Extraer parámetros de búsqueda del request
        const filters = {
            page: parseInt(req.query.page) || 1,
            size: parseInt(req.query.size) || 50,
            propertyType: req.query.propertyType,
            operation: req.query.operation || 'sale',
            minPrice: req.query.minPrice,
            maxPrice: req.query.maxPrice,
            city: req.query.city,
            state: req.query.state || 'active'
        };

        // Obtener propiedades del servicio FTP
        const idealistaData = await ftpService.getProperties(filters);

        // Respuesta exitosa con los datos del FTP
        res.status(200).json({
            success: true,
            data: idealistaData,
            message: "Propiedades obtenidas exitosamente desde FTP de Idealista",
            source: idealistaData.source || 'ftp'
        });

    } catch (error) {
        console.error('❌ Error en getProperties:', error);

        // Datos de fallback en caso de error
        const fallbackData = {
            properties: [{
                propertyId: 'fallback-1',
                title: "Servicio FTP de Idealista no disponible",
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
                description: "El servicio FTP de Idealista no está disponible en este momento. Por favor, verifique la configuración de conexión.",
                features: [],
                images: [],
                propertyType: "homes",
                operation: "sale",
                energyRating: "N/A",
                publishedDate: new Date().toISOString().split('T')[0],
                contact: {
                    phone: null,
                    email: null,
                    name: null
                },
                status: 'active'
            }],
            total: 1,
            totalPages: 1,
            actualPage: 1,
            itemsPerPage: 50,
            lastUpdated: new Date().toISOString(),
            source: 'fallback'
        };

        res.status(200).json({
            success: false,
            data: fallbackData,
            message: "Error conectando con el servicio FTP de Idealista. Mostrando datos de ejemplo.",
            error: error.message
        });
    }
};

/**
 * Obtiene una propiedad específica por ID
 */
const getPropertyById = async (req, res) => {
    const { propertyId } = req.params;
    
    try {
        if (!propertyId) {
            return res.status(400).json({
                success: false,
                error: 'Property ID is required'
            });
        }

        console.log(`🔍 Buscando propiedad con ID: ${propertyId}`);
        
        // Verificar caché primero
        const cacheKey = `${CacheKeys.PROPERTIES}:${propertyId}`;
        const cachedProperty = await redisCache.get(cacheKey);
        
        if (cachedProperty) {
            return res.status(200).json({
                success: true,
                data: cachedProperty,
                message: `Property ${propertyId} found in cache`,
                source: 'cache'
            });
        }

        // Obtener todas las propiedades y buscar la específica
        
        const allPropertiesData = await ftpService.getProperties({ size: 10000 });
        
        if (allPropertiesData && allPropertiesData.properties) {
            const property = allPropertiesData.properties.find(prop => 
                prop.propertyId === propertyId || 
                prop.propertyId === parseInt(propertyId) ||
                prop.id === propertyId ||
                prop.id === parseInt(propertyId)
            );
            
            if (property) {
                // Guardar en caché individual
                await redisCache.set(cacheKey, property, CacheTTL.PROPERTIES);
                
                return res.status(200).json({
                    success: true,
                    data: property,
                    message: `Property ${propertyId} found successfully`,
                    source: 'ftp'
                });
            }
        }

        // Si no se encuentra la propiedad
        return res.status(404).json({
            success: false,
            error: `Property with ID ${propertyId} not found`
        });

    } catch (error) {
        console.error('❌ Error en getPropertyById:', error);
        
        // Datos de fallback para la propiedad específica
        const fallbackProperty = {
            propertyId: propertyId,
            title: `Propiedad ${propertyId} - Servicio no disponible`,
            price: 350000,
            currency: "EUR",
            size: 85,
            rooms: 3,
            bathrooms: 2,
            location: {
                address: "Dirección no disponible",
                city: "Madrid",
                province: "Madrid",
                postalCode: "28001",
                coordinates: {
                    latitude: 40.4168,
                    longitude: -3.7038
                }
            },
            description: `Esta es una propiedad de ejemplo para el ID ${propertyId}. El servicio FTP de Idealista no está disponible en este momento.`,
            features: ["Ascensor", "Calefacción", "Aire acondicionado"],
            images: [],
            propertyType: "homes",
            operation: "sale",
            energyRating: "N/A",
            publishedDate: new Date().toISOString().split('T')[0],
            contact: {
                phone: null,
                email: null,
                name: null
            },
            status: 'active'
        };
        
        return res.status(200).json({
            success: false,
            data: fallbackProperty,
            message: `Error conectando con el servicio FTP de Idealista. Mostrando datos de ejemplo para la propiedad ${propertyId}.`,
            error: error.message,
            source: 'fallback'
        });
    }
};

/**
 * Obtiene imágenes de una propiedad específica
 * Nota: Las imágenes ahora vienen incluidas en los datos del FTP
 */
const getPropertyImagesController = async (req, res) => {
    try {
        const { propertyId } = req.params;

        if (!propertyId) {
            return res.status(400).json({
                success: false,
                message: "ID de propiedad requerido"
            });
        }

        console.log(`🖼️ Obteniendo imágenes para propiedad: ${propertyId}`);

        // Verificar caché de imágenes primero
        const cacheKey = `${CacheKeys.IMAGES}:${propertyId}`;
        const cachedImages = await redisCache.get(cacheKey);

        if (cachedImages) {
            console.log(`✅ Imágenes encontradas en caché: ${cachedImages.length} imágenes`);
            return res.status(200).json({
                success: true,
                data: {
                    propertyId,
                    images: cachedImages
                },
                message: "Imágenes obtenidas desde caché"
            });
        }

        // Buscar la propiedad para obtener sus imágenes
        const allPropertiesData = await ftpService.getProperties({ size: 10000 });
        
        if (allPropertiesData && allPropertiesData.properties) {
            const property = allPropertiesData.properties.find(prop => 
                prop.propertyId === propertyId || 
                prop.propertyId === parseInt(propertyId) ||
                prop.id === propertyId ||
                prop.id === parseInt(propertyId)
            );
            
            if (property && property.images) {
                // Guardar imágenes en caché
                await redisCache.set(cacheKey, property.images, CacheTTL.IMAGES);
                
                console.log(`✅ Imágenes obtenidas: ${property.images.length} imágenes`);
                return res.status(200).json({
                    success: true,
                    data: {
                        propertyId,
                        images: property.images
                    },
                    message: "Imágenes obtenidas exitosamente"
                });
            }
        }

        // Si no se encuentran imágenes
        console.log(`❌ No se encontraron imágenes para la propiedad ${propertyId}`);
        res.status(200).json({
            success: true,
            data: {
                propertyId,
                images: []
            },
            message: "No se encontraron imágenes para esta propiedad"
        });

    } catch (error) {
        console.error('❌ Error en getPropertyImagesController:', error);
        res.status(500).json({
            success: false,
            message: "Error obteniendo imágenes de la propiedad",
            error: error.message
        });
    }
};

/**
 * Fuerza la descarga de nuevos datos desde el FTP
 */
const refreshData = async (req, res) => {
    try {
        console.log('🔄 Forzando actualización de datos desde FTP...');
        
        // Limpiar caché
        await redisCache.flush();
        
        // Forzar descarga de nuevos datos
        const newData = await ftpService.downloadAndProcessLatestFile();
        
        if (newData) {
            console.log(`✅ Datos actualizados: ${newData.properties.length} propiedades`);
            res.status(200).json({
                success: true,
                data: {
                    propertiesCount: newData.properties.length,
                    lastUpdated: newData.lastUpdated
                },
                message: "Datos actualizados exitosamente desde FTP"
            });
        } else {
            res.status(500).json({
                success: false,
                message: "Error actualizando datos desde FTP"
            });
        }

    } catch (error) {
        console.error('❌ Error en refreshData:', error);
        res.status(500).json({
            success: false,
            message: "Error actualizando datos",
            error: error.message
        });
    }
};

/**
 * Obtiene el estado del servicio FTP
 */
const getServiceStatus = async (req, res) => {
    try {
        // Verificar si hay datos en caché
        const hasCache = ftpService.cache.size > 0;
        
        // Verificar si hay archivos locales
        const localFiles = await ftpService.getLocalFiles();
        
        res.status(200).json({
            success: true,
            data: {
                ftpConnected: true, // Se verificará en la próxima conexión
                cacheSize: ftpService.cache.size,
                hasLocalFiles: localFiles.length > 0,
                localFilesCount: localFiles.length,
                lastCacheUpdate: hasCache ? 'Datos en caché disponibles' : 'Sin datos en caché'
            },
            message: "Estado del servicio FTP obtenido"
        });

    } catch (error) {
        console.error('❌ Error en getServiceStatus:', error);
        res.status(500).json({
            success: false,
            message: "Error obteniendo estado del servicio",
            error: error.message
        });
    }
};

module.exports = {
    getProperties,
    getPropertyById,
    getPropertyImagesController,
    refreshData,
    getServiceStatus
};