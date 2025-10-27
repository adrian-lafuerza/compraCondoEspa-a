const { handleCors } = require('../../../../src/utils/corsHandler');
const IdealistaFtpService = require('../../../../src/services/idealistaFtp.service');

// Instancia global del servicio FTP para reutilizar conexiones
let ftpService = null;

// Función para obtener o crear la instancia del servicio FTP
const getFtpService = () => {
    if (!ftpService) {
        ftpService = new IdealistaFtpService();
    }
    return ftpService;
};

// Función para generar datos de fallback
const generateFallbackProperty = (propertyId) => {
    return {
        propertyId: propertyId,
        propertyCode: propertyId,
        thumbnail: 'https://img4.idealista.com/blur/WEB_LISTING-M/0/id.pro.es.image.master/6b/32/33/1293133167.webp',
        externalReference: propertyId,
        numPhotos: 0,
        floor: '2',
        price: 250000,
        priceInfo: {
            price: {
                amount: 250000,
                currencySuffix: '€'
            }
        },
        propertyType: 'flat',
        operation: 'sale',
        size: 75,
        exterior: true,
        rooms: 2,
        bathrooms: 1,
        address: 'Dirección no disponible',
        province: 'Madrid',
        municipality: 'Madrid',
        district: 'Centro',
        country: 'es',
        neighborhood: 'Sol',
        latitude: 40.4168,
        longitude: -3.7038,
        description: `Propiedad de ejemplo para ID ${propertyId}. El sistema FTP de Idealista no está disponible en este momento.`,
        hasVideo: false,
        status: 'good',
        newDevelopment: false,
        hasLift: true,
        parkingSpace: {
            hasParkingSpace: false,
            isParkingSpaceIncludedInPrice: false
        },
        detailedType: {
            typology: 'flat'
        },
        suggestedTexts: {
            subtitle: `Propiedad en ${propertyId}`,
            title: `Propiedad de ejemplo - Sistema FTP no disponible`
        },
        hasplan: false,
        has3DTour: false,
        has360: false,
        hasStaging: false,
        topNewDevelopment: false,
        images: []
    };
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
        const { propertyId } = req.query;

        if (!propertyId) {
            return res.status(400).json({
                success: false,
                message: "ID de propiedad requerido"
            });
        }

        console.log(`🔍 Buscando propiedad con ID: ${propertyId} desde sistema FTP`);
        const startTime = Date.now();

        // Obtener el servicio FTP
        const service = getFtpService();
        
        // Buscar la propiedad específica en el sistema FTP
        const property = await service.getPropertyById(propertyId);
        
        const endTime = Date.now();
        const duration = (endTime - startTime) / 1000;

        if (property) {
            console.log(`✅ Propiedad ${propertyId} encontrada en sistema FTP en ${duration.toFixed(2)}s`);
            
            return res.status(200).json({
                success: true,
                data: {
                    ...property,
                    message: "Propiedad encontrada en sistema FTP",
                    success: true
                },
                source: 'idealista-ftp',
                performance: {
                    duration: `${duration.toFixed(2)}s`
                }
            });
        } else {
            console.log(`❌ Propiedad ${propertyId} no encontrada en sistema FTP`);
            
            // Si no se encuentra la propiedad, devolver datos de fallback
            const fallbackProperty = generateFallbackProperty(propertyId);
            
            return res.status(200).json({
                success: true,
                data: {
                    ...fallbackProperty,
                    message: "Propiedad no encontrada en sistema FTP, datos de ejemplo",
                    success: true
                },
                source: 'fallback-ftp',
                performance: {
                    duration: `${duration.toFixed(2)}s`
                }
            });
        }

    } catch (error) {
        console.error('❌ Error en getPropertyById desde FTP:', error);
        
        // Si hay error con el sistema FTP, devolver datos de fallback
        console.log(`⚠️ Error en sistema FTP, usando datos de fallback para ${req.query.propertyId}`);
        const fallbackProperty = generateFallbackProperty(req.query.propertyId || 'unknown');
        
        return res.status(200).json({
            success: false,
            data: {
                ...fallbackProperty,
                message: "Error en sistema FTP de Idealista, datos de ejemplo",
                success: false
            },
            error: error.message,
            source: 'fallback-ftp-error'
        });
    }
};