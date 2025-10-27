const express = require('express');
const { getProperties, getPropertyImagesController, getPropertyById, refreshData, getServiceStatus } = require('../controllers/idealista.controller');
const { redisCache } = require('../utils/nodeCache');

const router = express.Router();

// === RUTAS PRINCIPALES DE PROPIEDADES ===

// Ruta para obtener propiedades (ahora desde FTP)
router.get('/properties', getProperties);

// Ruta para obtener una propiedad específica por ID
router.get('/properties/:propertyId', getPropertyById);

// Ruta para obtener imágenes de una propiedad específica
router.get('/properties/:propertyId/images', getPropertyImagesController);

// === RUTAS DE GESTIÓN DEL SERVICIO FTP ===

// Ruta para verificar el estado del servicio FTP
router.get('/ftp/status', getServiceStatus);

// Ruta para forzar actualización de datos desde FTP
router.post('/ftp/refresh', refreshData);

// === RUTAS DE GESTIÓN DE CACHÉ ===

// Obtener estadísticas del caché
router.get('/cache/stats', async (req, res) => {
    try {
        const stats = await redisCache.getStats();
        res.json({
            success: true,
            message: 'Estadísticas del caché obtenidas',
            data: stats
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error obteniendo estadísticas del caché',
            error: error.message
        });
    }
});

// Limpiar todo el caché
router.post('/cache/clear', async (req, res) => {
    try {
        await redisCache.flush();
        res.json({
            success: true,
            message: 'Caché completamente limpiado',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error limpiando el caché',
            error: error.message
        });
    }
});

// Limpiar solo caché de propiedades
router.delete('/cache/properties', async (req, res) => {
    try {
        await redisCache.clearProperties();
        res.json({
            success: true,
            message: 'Caché de propiedades limpiado',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error limpiando caché de propiedades',
            error: error.message
        });
    }
});

// Limpiar solo caché de imágenes
router.delete('/cache/images', async (req, res) => {
    try {
        await redisCache.clearImages();
        res.json({
            success: true,
            message: 'Caché de imágenes limpiado',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error limpiando caché de imágenes',
            error: error.message
        });
    }
});

module.exports = router;