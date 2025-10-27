const { handleCors } = require('../../src/utils/corsHandler');
const IdealistaFtpService = require('../../src/services/idealistaFtp.service');

// Instancia global del servicio FTP para reutilizar conexiones
let ftpService = null;

// Función para obtener o crear la instancia del servicio FTP
const getFtpService = () => {
    if (!ftpService) {
        ftpService = new IdealistaFtpService();
    }
    return ftpService;
};

// Función para aplicar paginación a los resultados
const applyPagination = (properties, page = 1, size = 50) => {
    const startIndex = (page - 1) * size;
    const endIndex = startIndex + size;
    const paginatedProperties = properties.slice(startIndex, endIndex);
    
    return {
        properties: paginatedProperties,
        total: properties.length,
        totalPages: Math.ceil(properties.length / size),
        actualPage: page,
        itemsPerPage: size
    };
};

// Función para crear timeout con Promise.race
const withTimeout = (promise, timeoutMs) => {
    return Promise.race([
        promise,
        new Promise((_, reject) => 
            setTimeout(() => reject(new Error(`Timeout después de ${timeoutMs}ms`)), timeoutMs)
        )
    ]);
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
        // Extraer parámetros de búsqueda del request
        const searchOptions = {
            page: parseInt(req.query.page) || 1,
            size: parseInt(req.query.size) || 50,
            state: req.query.state || 'active',
            // Parámetros adicionales de filtrado
            minPrice: req.query.minPrice ? parseInt(req.query.minPrice) : undefined,
            maxPrice: req.query.maxPrice ? parseInt(req.query.maxPrice) : undefined,
            propertyType: req.query.propertyType || undefined,
            operation: req.query.operation || undefined,
            city: req.query.city || undefined,
            province: req.query.province || undefined,
            minSize: req.query.minSize ? parseInt(req.query.minSize) : undefined,
            maxSize: req.query.maxSize ? parseInt(req.query.maxSize) : undefined,
            rooms: req.query.rooms ? parseInt(req.query.rooms) : undefined,
            bathrooms: req.query.bathrooms ? parseInt(req.query.bathrooms) : undefined
        };

        console.log('🚀 Obteniendo propiedades desde sistema FTP de Idealista...');
        const startTime = Date.now();
        
        // Obtener el servicio FTP
        const service = getFtpService();
        
        // Timeout de 8 segundos para Vercel (límite de 10s)
        const timeoutMs = 8000;
        
        // Obtener propiedades desde el sistema FTP con timeout
        const ftpData = await withTimeout(
            service.getProperties(searchOptions),
            timeoutMs
        );
        
        if (!ftpData || !ftpData.properties) {
            throw new Error('No se pudieron obtener datos del sistema FTP');
        }

        // Aplicar paginación a los resultados
        const paginatedData = applyPagination(
            ftpData.properties, 
            searchOptions.page, 
            searchOptions.size
        );

        const endTime = Date.now();
        const duration = (endTime - startTime) / 1000;
        
        console.log(`⚡ ✅ Propiedades obtenidas desde sistema FTP (${duration.toFixed(2)}s)`);
        
        return res.status(200).json({
            success: true,
            data: {
                ...paginatedData,
                lastUpdated: ftpData.lastUpdated || new Date().toISOString(),
                source: ftpData.source || 'idealista-ftp'
            },
            message: `Propiedades obtenidas exitosamente desde sistema FTP de Idealista en ${duration.toFixed(2)} segundos`,
            source: 'idealista-ftp',
            performance: {
                duration: `${duration.toFixed(2)}s`,
                totalProperties: ftpData.properties.length,
                returnedProperties: paginatedData.properties.length
            }
        });

    } catch (error) {
        console.error('❌ Error en función serverless de propiedades:', error);

        // Datos de fallback en caso de error
        const fallbackProperties = [
            {
                propertyId: 'fallback-ftp-1',
                title: "Propiedad de ejemplo - Sistema FTP no disponible",
                price: 250000,
                currency: "EUR",
                size: 75,
                rooms: 2,
                bathrooms: 1,
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
                description: "El sistema FTP de Idealista no está disponible en este momento. Por favor, verifique la configuración del servidor.",
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
                itemsPerPage: 50,
                lastUpdated: new Date().toISOString(),
                source: 'fallback-ftp-error'
            },
            message: error.message.includes('Timeout') 
                ? "Timeout en sistema FTP de Idealista. Mostrando datos de ejemplo."
                : "Error conectando con sistema FTP de Idealista. Mostrando datos de ejemplo.",
            error: error.message
        });
    }
};