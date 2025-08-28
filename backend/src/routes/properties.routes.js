const express = require('express');
const { getProperties, getPropertyImagesController, getPropertyById } = require('../controllers/idealista.controller');
const { idealistaAuth } = require('../utils/idealistaAuth.middleware');
const { redisCache } = require('../utils/nodeCache');

const router = express.Router();

// Aplicar middleware de autenticación de Idealista a todas las rutas de propiedades
router.use(idealistaAuth.middleware());

// Ruta para obtener propiedades (ahora con autenticación automática)
router.get('/properties', getProperties);

// Ruta para obtener una propiedad específica por ID
router.get('/properties/:propertyId', getPropertyById);

// Ruta para obtener imágenes de una propiedad específica
router.get('/properties/:propertyId/images', getPropertyImagesController);

// Ruta para verificar el estado de autenticación (útil para debugging)
router.get('/auth/status', (req, res) => {
    const cacheInfo = idealistaAuth.getCacheInfo();
    res.json({
        message: 'Estado de autenticación Idealista',
        ...cacheInfo,
        tokenPresent: !!req.idealistaToken
    });
});

// Ruta para limpiar cache de token (útil para testing)
router.post('/auth/clear-cache', (req, res) => {
    idealistaAuth.clearCache();
    res.json({
        message: 'Cache de token limpiado exitosamente',
        timestamp: new Date().toISOString()
    });
});

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