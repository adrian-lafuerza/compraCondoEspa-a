const { handleCors } = require('../../src/utils/cors');
const { getFtpService } = require('../../src/services/serviceManager');

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
        // Obtener propertyId de los parámetros de consulta
        const propertyId = req.query.propertyId;
        
        if (!propertyId) {
            return res.status(400).json({
                success: false,
                error: 'propertyId es requerido',
                message: 'Debe proporcionar un propertyId en los parámetros de consulta'
            });
        }

        console.log(`🖼️ Solicitando imágenes para propiedad: ${propertyId} desde sistema FTP`);
        const startTime = Date.now();
        
        // Obtener el servicio FTP
        const service = getFtpService();
        
        // Timeout de 8 segundos para Vercel (límite de 10s)
        const timeoutMs = 8000;
        
        // Obtener imágenes de propiedades desde el sistema FTP con timeout
        const images = await withTimeout(
            service.getPropertyImages(propertyId),
            timeoutMs
        );
        
        const endTime = Date.now();
        const duration = (endTime - startTime) / 1000;
        
        console.log(`✅ Imágenes obtenidas para propiedad ${propertyId}: ${images.length} imágenes en ${duration.toFixed(2)}s desde FTP`);
        
        return res.status(200).json({
            success: true,
            data: {
                propertyId: propertyId,
                images: images,
                totalImages: images.length
            },
            message: `Imágenes obtenidas exitosamente desde sistema FTP en ${duration.toFixed(2)} segundos`,
            source: 'idealista-ftp',
            performance: {
                duration: `${duration.toFixed(2)}s`,
                imageCount: images.length
            }
        });
        
    } catch (error) {
        console.error('❌ Error en endpoint de imágenes FTP:', error.message);
        
        return res.status(200).json({
            success: false,
            data: {
                propertyId: req.query.propertyId || 'unknown',
                images: []
            },
            error: 'Error obteniendo imágenes desde sistema FTP',
            message: `Error: ${error.message}. Devolviendo lista vacía de imágenes.`,
            source: 'ftp-error'
        });
    }
};