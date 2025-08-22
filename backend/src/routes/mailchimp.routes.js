const express = require('express');
const router = express.Router();
const {
  subscribeToNewsletter,
  getSubscriberInfo,
  unsubscribeFromNewsletter,
  getListStats,
  getCampaigns,
  getCampaignById,
  getCampaignContent,
  getCampaignImages,
  getAllCampaignImages
} = require('../controllers/mailchimpController');
const { mailchimpCache } = require('../utils/mailchimpCache');

/**
 * @route POST /api/mailchimp/subscribe
 * @desc Suscribir un email a la newsletter
 * @access Public
 * @body { email, firstName?, lastName?, tags? }
 */
router.post('/subscribe', subscribeToNewsletter);

/**
 * @route GET /api/mailchimp/subscriber/:email
 * @desc Obtener información de un suscriptor
 * @access Public
 */
router.get('/subscriber/:email', getSubscriberInfo);

/**
 * @route POST /api/mailchimp/unsubscribe
 * @desc Desuscribir un email de la newsletter
 * @access Public
 * @body { email }
 */
router.post('/unsubscribe', unsubscribeFromNewsletter);

/**
 * @route GET /api/mailchimp/stats
 * @desc Obtener estadísticas de la lista de suscriptores
 * @access Public
 */
router.get('/stats', getListStats);

/**
 * @route GET /api/mailchimp/campaigns
 * @desc Obtener todas las campañas de Mailchimp
 * @access Public
 * @query { status?, type?, count?, offset? }
 */
router.get('/campaigns', getCampaigns);

/**
 * @route GET /api/mailchimp/campaigns/:campaignId
 * @desc Obtener detalles de una campaña específica
 * @access Public
 */
router.get('/campaigns/:campaignId', getCampaignById);

/**
 * @route GET /api/mailchimp/campaigns/:campaignId/content
 * @desc Obtener el contenido completo de una campaña (HTML, texto e imágenes)
 * @access Public
 */
router.get('/campaigns/:campaignId/content', getCampaignContent);

/**
 * @route GET /api/mailchimp/campaigns/:campaignId/images
 * @desc Obtener solo las imágenes de una campaña
 * @access Public
 */
router.get('/campaigns/:campaignId/images', getCampaignImages);

/**
 * @route GET /api/mailchimp/campaigns/all/images
 * @desc Obtener todas las imágenes de todas las campañas
 * @access Public
 * @query { count?, status? }
 */
router.get('/campaigns/all/images', getAllCampaignImages);

/**
 * @route GET /api/mailchimp/cache/stats
 * @desc Obtener estadísticas del caché de Mailchimp
 * @access Public
 */
router.get('/cache/stats', async (req, res) => {
  try {
    const stats = await mailchimpCache.getStats();
    res.status(200).json({
      success: true,
      message: 'Estadísticas del caché de Mailchimp obtenidas',
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas del caché',
      error: error.message
    });
  }
});

/**
 * @route POST /api/mailchimp/cache/clear
 * @desc Limpiar todo el caché de Mailchimp
 * @access Public
 */
router.post('/cache/clear', async (req, res) => {
  try {
    await mailchimpCache.flush();
    res.status(200).json({
      success: true,
      message: 'Caché de Mailchimp limpiado exitosamente',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al limpiar el caché',
      error: error.message
    });
  }
});

/**
 * @route DELETE /api/mailchimp/cache/campaigns
 * @desc Limpiar solo el caché de campañas
 * @access Public
 */
router.delete('/cache/campaigns', async (req, res) => {
  try {
    await mailchimpCache.clearCampaigns();
    res.status(200).json({
      success: true,
      message: 'Caché de campañas limpiado exitosamente',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al limpiar el caché de campañas',
      error: error.message
    });
  }
});

/**
 * @route DELETE /api/mailchimp/cache/content
 * @desc Limpiar solo el caché de contenido
 * @access Public
 */
router.delete('/cache/content', async (req, res) => {
  try {
    await mailchimpCache.clearContent();
    res.status(200).json({
      success: true,
      message: 'Caché de contenido limpiado exitosamente',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al limpiar el caché de contenido',
      error: error.message
    });
  }
});

/**
 * @route GET /api/mailchimp/health
 * @desc Health check para el servicio de Mailchimp
 * @access Public
 */
router.get('/health', (req, res) => {
  try {
    const requiredEnvVars = [
      'MAILCHIMP_API_KEY',
      'MAILCHIMP_SERVER_PREFIX',
      'MAILCHIMP_LIST_ID'
    ];

    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

    if (missingVars.length > 0) {
      return res.status(500).json({
        success: false,
        message: 'Configuración de Mailchimp incompleta',
        missingVariables: missingVars,
        timestamp: new Date().toISOString()
      });
    }

    res.status(200).json({
      success: true,
      message: 'Servicio de Mailchimp configurado correctamente',
      service: 'mailchimp',
      timestamp: new Date().toISOString(),
      config: {
        serverPrefix: process.env.MAILCHIMP_SERVER_PREFIX,
        listId: process.env.MAILCHIMP_LIST_ID,
        apiKeyConfigured: !!process.env.MAILCHIMP_API_KEY
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error en health check de Mailchimp',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;