const express = require('express');
const router = express.Router();
const {
  getInstagramData,
  getInstagramPostById,
  getInstagramStats,
  getProperties,
  getPropertiesByZone
} = require('../controllers/contentfulController');

/**
 * @route GET /api/contentful/instagram
 * @desc Obtener todos los posts de Instagram desde Contentful
 * @access Public
 */
router.get('/instagram', getInstagramData);

/**
 * @route GET /api/contentful/instagram/:id
 * @desc Obtener un post específico de Instagram por ID
 * @access Public
 */
router.get('/instagram/:id', getInstagramPostById);

/**
 * @route GET /api/contentful/instagram-stats
 * @desc Obtener estadísticas de los posts de Instagram
 * @access Public
 */
router.get('/instagram-stats', getInstagramStats);

/**
 * @route GET /api/contentful/properties
 * @desc Obtener propiedades desde Contentful
 * @access Public
 */
router.get('/properties', getProperties);

/**
 * @route GET /api/contentful/properties/zone/:zone
 * @desc Obtener propiedades filtradas por zona específica
 * @access Public
 */
router.get('/properties/zone/:zone', getPropertiesByZone);

/**
 * @route GET /api/contentful/health
 * @desc Verificar el estado de la conexión con Contentful
 * @access Public
 */
router.get('/health', (req, res) => {
  const hasConfig = process.env.CONTENTFUL_SPACE_ID && process.env.CONTENTFUL_ACCESS_TOKEN;
  
  res.json({
    success: true,
    message: 'Rutas de Contentful funcionando',
    configured: hasConfig,
    endpoints: [
      'GET /api/contentful/instagram - Obtener posts de Instagram',
      'GET /api/contentful/instagram/:id - Obtener post específico',
      'GET /api/contentful/instagram-stats - Obtener estadísticas',
      'GET /api/contentful/properties - Obtener propiedades',
      'GET /api/contentful/health - Estado de la conexión'
    ]
  });
});

module.exports = router;