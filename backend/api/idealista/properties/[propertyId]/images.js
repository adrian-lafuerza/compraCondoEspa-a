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

        console.log(`🖼️ Obteniendo imágenes para propiedad: ${propertyId} desde sistema FTP`);
        const startTime = Date.now();

        // Obtener el servicio FTP
        const service = getFtpService();
        
        // Obtener las imágenes de la propiedad desde el sistema FTP
        const images = await service.getPropertyImages(propertyId);
        
        const endTime = Date.now();
        const duration = (endTime - startTime) / 1000;

        console.log(`📸 Imágenes obtenidas desde sistema FTP: ${images.length} imágenes en ${duration.toFixed(2)}s`);

        return res.status(200).json({
            success: true,
            data: {
                propertyId: propertyId,
                images: images,
                count: images.length,
                message: "Imágenes obtenidas desde sistema FTP"
            },
            source: 'idealista-ftp',
            performance: {
                duration: `${duration.toFixed(2)}s`
            }
        });

    } catch (error) {
        console.error(`❌ Error obteniendo imágenes para propiedad ${req.query.propertyId} desde FTP:`, error);
        
        // En caso de error, devolver array vacío
        return res.status(200).json({
            success: false,
            data: {
                propertyId: req.query.propertyId || 'unknown',
                images: [],
                count: 0,
                message: "Error obteniendo imágenes desde sistema FTP"
            },
            error: error.message,
            source: 'fallback-ftp-error'
        });
    }
};