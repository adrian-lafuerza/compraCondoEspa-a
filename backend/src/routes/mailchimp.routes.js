const express = require('express');
const router = express.Router();
const {
  getCampaigns,
  getCampaignById,
  getCampaignContent,
} = require('../controllers/mailchimpController');
const { mailchimpCache } = require('../utils/mailchimpCache');

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


module.exports = router;