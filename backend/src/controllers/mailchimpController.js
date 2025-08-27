const axios = require('axios');
const { mailchimpCache, MailchimpCacheKeys, MailchimpCacheTTL } = require('../utils/mailchimpCache');

// Configuración de Mailchimp
const MAILCHIMP_API_KEY = process.env.MAILCHIMP_API_KEY;
const MAILCHIMP_SERVER_PREFIX = process.env.MAILCHIMP_SERVER_PREFIX; // ej: us1, us2, etc.
const MAILCHIMP_LIST_ID = process.env.MAILCHIMP_LIST_ID;

// Validar configuración
if (!MAILCHIMP_API_KEY || !MAILCHIMP_SERVER_PREFIX || !MAILCHIMP_LIST_ID) {
  console.error('❌ ERROR: Debes configurar MAILCHIMP_API_KEY, MAILCHIMP_SERVER_PREFIX y MAILCHIMP_LIST_ID en .env');
}

const MAILCHIMP_BASE_URL = `https://${MAILCHIMP_SERVER_PREFIX}.api.mailchimp.com/3.0`;

const extractImagesAndDescriptions = (htmlContent) => {
  if (!htmlContent) return { images: [], descriptions: [] };

  // Extract all images
  const images = [];
  const imageUrls = new Set(); // Para evitar duplicados
  
  // Usar matchAll para evitar problemas con el estado del regex global
  const imgMatches = htmlContent.matchAll(/<img[^>]+src=["']([^"']+)["'][^>]*(?:alt=["']([^"']*)["'])?[^>]*>/gi);
  
  for (const imgMatch of imgMatches) {
    const url = imgMatch[1];
    const alt = imgMatch[2] || '';
    
    // Solo agregar si la URL no está duplicada
    if (!imageUrls.has(url)) {
      imageUrls.add(url);
      images.push({
        url: url,
        alt: alt
      });
    }
  }

  // Extract descriptions from common HTML elements
  const descriptions = [];

  // Extract from p tags
  const pRegex = /<p[^>]*>([^<]+(?:<[^>]+>[^<]*)*?)<\/p>/gi;
  let pMatch;
  while ((pMatch = pRegex.exec(htmlContent)) !== null) {
    const text = pMatch[1].replace(/<[^>]+>/g, '').trim();
    if (text && text.length > 20) { // Only meaningful descriptions
      descriptions.push(text);
    }
  }

  // Extract from div tags with text content
  const divRegex = /<span[^>]*>([^<]+(?:<(?!div|img|script|style)[^>]+>[^<]*)*?)<\/span>/gi;
  let divMatch;
  while ((divMatch = divRegex.exec(htmlContent)) !== null) {
    const text = divMatch[1].replace(/<[^>]+>/g, '').trim();
    if (text && text.length > 20 && !descriptions.includes(text)) {
      descriptions.push({ text: text });
    }
  }

  // Extract from h1, h2, h3 tags
  const headingRegex = /<h[1-6][^>]*>([^<]+)<\/h[1-6]>/gi;
  let headingMatch;
  while ((headingMatch = headingRegex.exec(htmlContent)) !== null) {
    const text = headingMatch[1].trim();
    if (text && !descriptions.includes(text)) {
      descriptions.push(text);
    }
  }

  return { images, descriptions };
};


/**
 * Obtener todas las campañas de Mailchimp
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
const getCampaigns = async (req, res) => {
  try {
    const { status, type, count = 10, offset = 0, includeHtml = 'false' } = req.query;

    // Crear clave de caché basada en los parámetros de búsqueda
    const searchParams = {
      type: type || 'all',
      count: parseInt(count),
      offset: parseInt(offset),
      includeHtml: includeHtml
    };

    const cacheKey = `${MailchimpCacheKeys.CAMPAIGNS}:${JSON.stringify(searchParams)}`;

    // Verificar caché primero
    const cachedData = await mailchimpCache.get(cacheKey);

    if (cachedData) {
      console.log('📋 Campañas obtenidas del caché');
      return res.status(200).json(cachedData);
    }

    console.log('🔄 Consultando API de Mailchimp para campañas...');

    // Construir parámetros de consulta
    const params = new URLSearchParams({
      count: count.toString(),
      offset: offset.toString(),
      sort_field: 'create_time',
      sort_dir: 'DESC',
    });

    // Agregar filtros opcionales
    if (type) {
      params.append('type', type);
    }



    const response = await axios.get(
      `${MAILCHIMP_BASE_URL}/campaigns?${params.toString()}`,
      {
        headers: {
          'Authorization': `Bearer ${MAILCHIMP_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const storyDrafts = response.data.campaigns.filter(c => c.settings.title.includes("[STORY]"));


    // Helper function to extract all images and descriptions from HTML content

    // Obtener información detallada de cada campaña
    const campaignsWithDetails = [];

    for (const campaign of storyDrafts) {
      try {
        // Obtener el contenido de la campaña
        const contentResponse = await axios.get(
          `${MAILCHIMP_BASE_URL}/campaigns/${campaign.id}/content`,
          {
            headers: {
              'Authorization': `Bearer ${MAILCHIMP_API_KEY}`,
              'Content-Type': 'application/json'
            }
          }
        );

        const htmlContent = contentResponse.data.html || '';
        const { images, descriptions } = extractImagesAndDescriptions(htmlContent);


        const campaignData = {
          id: campaign.id,
          type: campaign.type,
          status: campaign.status,
          // Subject line como título del artículo
          subject_line: campaign.settings?.subject_line || 'Sin asunto',
          title: campaign.settings?.title || 'Sin título',
          // Preview text como descripción corta
          preview_text: campaign.settings?.preview_text || '',
          // Imágenes extraídas del contenido
          images: images,
          // Descripciones extraídas del contenido
          descriptions: descriptions,
          from_name: campaign.settings?.from_name || 'Sin remitente',
          reply_to: campaign.settings?.reply_to || 'Sin respuesta',
          create_time: campaign.create_time,
          send_time: campaign.send_time,
          emails_sent: campaign.emails_sent || 0,
          recipients: {
            list_id: campaign.recipients?.list_id,
            list_name: campaign.recipients?.list_name,
            recipient_count: campaign.recipients?.recipient_count || 0
          },
          report_summary: {
            opens: campaign.report_summary?.opens || 0,
            unique_opens: campaign.report_summary?.unique_opens || 0,
            open_rate: campaign.report_summary?.open_rate || 0,
            clicks: campaign.report_summary?.clicks || 0,
            subscriber_clicks: campaign.report_summary?.subscriber_clicks || 0,
            click_rate: campaign.report_summary?.click_rate || 0
          }
        };

        // Solo incluir HTML si se solicita explícitamente
        if (includeHtml === 'true') {
          campaignData.content_html = htmlContent;
        }

        campaignsWithDetails.push(campaignData);
      } catch (error) {
        console.warn(`⚠️ Error al obtener contenido de campaña ${campaign.id}:`, error.message);
        // Si falla obtener el contenido, agregar la campaña sin imágenes ni descripciones
        const fallbackCampaign = {
          id: campaign.id,
          type: campaign.type,
          status: campaign.status,
          subject_line: campaign.settings?.subject_line || 'Sin asunto',
          title: campaign.settings?.title || 'Sin título',
          preview_text: campaign.settings?.preview_text || '',
          images: [],
          descriptions: [],
          from_name: campaign.settings?.from_name || 'Sin remitente',
          reply_to: campaign.settings?.reply_to || 'Sin respuesta',
          create_time: campaign.create_time,
          send_time: campaign.send_time,
          emails_sent: campaign.emails_sent || 0,
          recipients: {
            list_id: campaign.recipients?.list_id,
            list_name: campaign.recipients?.list_name,
            recipient_count: campaign.recipients?.recipient_count || 0
          },
          report_summary: {
            opens: campaign.report_summary?.opens || 0,
            unique_opens: campaign.report_summary?.unique_opens || 0,
            open_rate: campaign.report_summary?.open_rate || 0,
            clicks: campaign.report_summary?.clicks || 0,
            subscriber_clicks: campaign.report_summary?.subscriber_clicks || 0,
            click_rate: campaign.report_summary?.click_rate || 0
          }
        };

        // Solo incluir HTML vacío si se solicita explícitamente
        if (includeHtml === 'true') {
          fallbackCampaign.content_html = '';
        }

        campaignsWithDetails.push(fallbackCampaign);
      }
    }

    const responseData = {
      success: true,
      data: {
        campaigns: campaignsWithDetails,
        total_items: response.data.total_items,
        count: campaignsWithDetails.length,
        offset: parseInt(offset)
      }
    };

    // Guardar en caché
    await mailchimpCache.set(cacheKey, responseData, MailchimpCacheTTL.CAMPAIGNS);
    console.log('💾 Campañas guardadas en caché');

    res.status(200).json(responseData);

  } catch (error) {
    console.error('❌ Error al obtener campañas:', error.response?.data || error.message);

    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al obtener campañas'
    });
  }
};

/**
 * Obtener detalles de una campaña específica
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
const getCampaignById = async (req, res) => {
  try {
    const { campaignId } = req.params;

    if (!campaignId) {
      return res.status(400).json({
        success: false,
        message: 'ID de campaña es requerido'
      });
    }

    // Verificar caché primero
    const cacheKey = `${MailchimpCacheKeys.CAMPAIGNS}:detail:${campaignId}`;
    const cachedData = await mailchimpCache.get(cacheKey);

    if (cachedData) {
      console.log(`📋 Detalles de campaña ${campaignId} obtenidos del caché`);
      return res.status(200).json(cachedData);
    }

    console.log(`🔄 Consultando API de Mailchimp para campaña ${campaignId}...`);

    const response = await axios.get(
      `${MAILCHIMP_BASE_URL}/campaigns/${campaignId}`,
      {
        headers: {
          'Authorization': `Bearer ${MAILCHIMP_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.data) {
      return res.status(404).json({
        success: false,
        message: 'Campaña no encontrada'
      });
    }

    const contentResponse = await axios.get(
      `${MAILCHIMP_BASE_URL}/campaigns/${response.data.id}/content`,
      {
        headers: {
          'Authorization': `Bearer ${MAILCHIMP_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const htmlContent = contentResponse.data.html || '';


    const { images, descriptions } = extractImagesAndDescriptions(htmlContent);

    const campaign = response.data;


    const responseData = {
      success: true,
      data: {
        id: campaign.id,
        type: campaign.type,
        status: campaign.status,
        images, descriptions,
        settings: {
          subject_line: campaign.settings?.subject_line,
          title: campaign.settings?.title,
          from_name: campaign.settings?.from_name,
          reply_to: campaign.settings?.reply_to,
          to_name: campaign.settings?.to_name,
          folder_id: campaign.settings?.folder_id,
          authenticate: campaign.settings?.authenticate,
          auto_footer: campaign.settings?.auto_footer,
          inline_css: campaign.settings?.inline_css
        },
        recipients: campaign.recipients,
        create_time: campaign.create_time,
        send_time: campaign.send_time,
        content_type: campaign.content_type,
        emails_sent: campaign.emails_sent,
        report_summary: campaign.report_summary,
        delivery_status: campaign.delivery_status
      }
    };

    // Guardar en caché
    await mailchimpCache.set(cacheKey, responseData, MailchimpCacheTTL.CAMPAIGN_DETAIL);
    console.log(`💾 Detalles de campaña ${campaignId} guardados en caché`);

    res.status(200).json(responseData);

  } catch (error) {
    console.error('❌ Error al obtener campaña:', error.response?.data || error.message);

    if (error.response?.status === 404) {
      return res.status(404).json({
        success: false,
        message: 'Campaña no encontrada'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al obtener campaña'
    });
  }
};

/**
 * Obtener el contenido de una campaña (incluyendo imágenes)
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
const getCampaignContent = async (req, res) => {
  try {
    const { campaignId } = req.params;

    if (!campaignId) {
      return res.status(400).json({
        success: false,
        message: 'ID de campaña es requerido'
      });
    }

    // Verificar caché primero
    const cacheKey = `${MailchimpCacheKeys.CONTENT}:${campaignId}`;
    const cachedData = await mailchimpCache.get(cacheKey);

    if (cachedData) {
      console.log(`📄 Contenido de campaña ${campaignId} obtenido del caché`);
      return res.status(200).json(cachedData);
    }

    console.log(`🔄 Consultando API de Mailchimp para contenido de campaña ${campaignId}...`);

    const response = await axios.get(
      `${MAILCHIMP_BASE_URL}/campaigns/${campaignId}/content`,
      {
        headers: {
          'Authorization': `Bearer ${MAILCHIMP_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const content = response.data;

    const htmlContent = content.html || '';
    const plainTextContent = content.plain_text || '';
    const { images, descriptions } = extractImagesAndDescriptions(htmlContent);

    console.log(content);


    const responseData = {
      success: true,
      data: {
        campaign_id: campaignId,
        settings: {
          subject_line: content.settings?.subject_line,
          title: content.settings?.title,
          from_name: content.settings?.from_name,
          reply_to: content.settings?.reply_to,
          to_name: content.settings?.to_name,
          folder_id: content.settings?.folder_id,
          authenticate: content.settings?.authenticate,
          auto_footer: content.settings?.auto_footer,
          inline_css: content.settings?.inline_css
        },
        plain_text: plainTextContent,
        images: images,
        descriptions,
        image_count: images.length,
        _links: content._links || []
      }
    };

    // Guardar en caché
    await mailchimpCache.set(cacheKey, responseData, MailchimpCacheTTL.CONTENT);
    console.log(`💾 Contenido de campaña ${campaignId} guardado en caché`);

    res.status(200).json(responseData);

  } catch (error) {
    console.error('❌ Error al obtener contenido de campaña:', error.response?.data || error.message);

    if (error.response?.status === 404) {
      return res.status(404).json({
        success: false,
        message: 'Campaña no encontrada'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al obtener contenido de campaña'
    });
  }
};


module.exports = {
  getCampaigns,
  getCampaignById,
  getCampaignContent,
};