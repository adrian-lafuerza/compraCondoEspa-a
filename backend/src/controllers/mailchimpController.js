const axios = require('axios');

// Configuración de Mailchimp
const MAILCHIMP_API_KEY = process.env.MAILCHIMP_API_KEY;
const MAILCHIMP_SERVER_PREFIX = process.env.MAILCHIMP_SERVER_PREFIX; // ej: us1, us2, etc.
const MAILCHIMP_LIST_ID = process.env.MAILCHIMP_LIST_ID;

// Validar configuración
if (!MAILCHIMP_API_KEY || !MAILCHIMP_SERVER_PREFIX || !MAILCHIMP_LIST_ID) {
  console.error('❌ ERROR: Debes configurar MAILCHIMP_API_KEY, MAILCHIMP_SERVER_PREFIX y MAILCHIMP_LIST_ID en .env');
}

const MAILCHIMP_BASE_URL = `https://${MAILCHIMP_SERVER_PREFIX}.api.mailchimp.com/3.0`;

/**
 * Suscribir un email a la lista de Mailchimp
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
const subscribeToNewsletter = async (req, res) => {
  try {
    const { email, firstName, lastName, tags } = req.body;

    // Validar email
    if (!email || !email.includes('@')) {
      return res.status(400).json({
        success: false,
        message: 'Email válido es requerido'
      });
    }

    // Preparar datos para Mailchimp
    const memberData = {
      email_address: email,
      status: 'subscribed',
      merge_fields: {
        FNAME: firstName || '',
        LNAME: lastName || ''
      }
    };

    // Agregar tags si se proporcionan
    if (tags && Array.isArray(tags)) {
      memberData.tags = tags;
    }

    // Realizar petición a Mailchimp
    const response = await axios.post(
      `${MAILCHIMP_BASE_URL}/lists/${MAILCHIMP_LIST_ID}/members`,
      memberData,
      {
        headers: {
          'Authorization': `Bearer ${MAILCHIMP_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ Usuario suscrito exitosamente:', email);

    res.status(200).json({
      success: true,
      message: 'Suscripción exitosa',
      data: {
        email: response.data.email_address,
        status: response.data.status,
        id: response.data.id
      }
    });

  } catch (error) {
    console.error('❌ Error al suscribir usuario:', error.response?.data || error.message);

    // Manejar errores específicos de Mailchimp
    if (error.response?.status === 400 && error.response?.data?.title === 'Member Exists') {
      return res.status(409).json({
        success: false,
        message: 'Este email ya está suscrito a nuestra lista'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al procesar la suscripción'
    });
  }
};

/**
 * Obtener información de un suscriptor
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
const getSubscriberInfo = async (req, res) => {
  try {
    const { email } = req.params;

    if (!email || !email.includes('@')) {
      return res.status(400).json({
        success: false,
        message: 'Email válido es requerido'
      });
    }

    // Crear hash MD5 del email (requerido por Mailchimp)
    const crypto = require('crypto');
    const emailHash = crypto.createHash('md5').update(email.toLowerCase()).digest('hex');

    const response = await axios.get(
      `${MAILCHIMP_BASE_URL}/lists/${MAILCHIMP_LIST_ID}/members/${emailHash}`,
      {
        headers: {
          'Authorization': `Bearer ${MAILCHIMP_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    res.status(200).json({
      success: true,
      data: {
        email: response.data.email_address,
        status: response.data.status,
        firstName: response.data.merge_fields.FNAME,
        lastName: response.data.merge_fields.LNAME,
        subscribeDate: response.data.timestamp_signup
      }
    });

  } catch (error) {
    console.error('❌ Error al obtener información del suscriptor:', error.response?.data || error.message);

    if (error.response?.status === 404) {
      return res.status(404).json({
        success: false,
        message: 'Suscriptor no encontrado'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

/**
 * Desuscribir un email de la lista
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
const unsubscribeFromNewsletter = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !email.includes('@')) {
      return res.status(400).json({
        success: false,
        message: 'Email válido es requerido'
      });
    }

    // Crear hash MD5 del email
    const crypto = require('crypto');
    const emailHash = crypto.createHash('md5').update(email.toLowerCase()).digest('hex');

    await axios.patch(
      `${MAILCHIMP_BASE_URL}/lists/${MAILCHIMP_LIST_ID}/members/${emailHash}`,
      { status: 'unsubscribed' },
      {
        headers: {
          'Authorization': `Bearer ${MAILCHIMP_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ Usuario desuscrito exitosamente:', email);

    res.status(200).json({
      success: true,
      message: 'Desuscripción exitosa'
    });

  } catch (error) {
    console.error('❌ Error al desuscribir usuario:', error.response?.data || error.message);

    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al procesar la desuscripción'
    });
  }
};

/**
 * Obtener estadísticas de la lista
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
const getListStats = async (req, res) => {
  try {
    const response = await axios.get(
      `${MAILCHIMP_BASE_URL}/lists/${MAILCHIMP_LIST_ID}`,
      {
        headers: {
          'Authorization': `Bearer ${MAILCHIMP_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    res.status(200).json({
      success: true,
      data: {
        totalMembers: response.data.stats.member_count,
        subscribedMembers: response.data.stats.member_count,
        unsubscribedMembers: response.data.stats.unsubscribe_count,
        listName: response.data.name,
        dateCreated: response.data.date_created
      }
    });

  } catch (error) {
    console.error('❌ Error al obtener estadísticas:', error.response?.data || error.message);

    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al obtener estadísticas'
    });
  }
};

/**
 * Obtener todas las campañas de Mailchimp
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
const getCampaigns = async (req, res) => {
  try {
    const { status, type, count = 10, offset = 0, includeHtml = 'false' } = req.query;

    // Construir parámetros de consulta
    const params = new URLSearchParams({
      count: count.toString(),
      offset: offset.toString(),
      sort_field: 'create_time',
      sort_dir: 'DESC'
    });

    // Agregar filtros opcionales
    if (status) {
      params.append('status', status);
    }
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

    console.log(response.data.campaigns);
    
    // Helper function to extract all images and descriptions from HTML content
    const extractImagesAndDescriptions = (htmlContent) => {
      if (!htmlContent) return { images: [], descriptions: [] };
      
      // Extract all images
      const imgRegex = /<img[^>]+src=["']([^"']+)["'][^>]*(?:alt=["']([^"']*)["'])?[^>]*>/gi;
      const images = [];
      let imgMatch;
      
      while ((imgMatch = imgRegex.exec(htmlContent)) !== null) {
        images.push({
          url: imgMatch[1],
          alt: imgMatch[2] || ''
        });
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
      const divRegex = /<div[^>]*>([^<]+(?:<(?!div|img|script|style)[^>]+>[^<]*)*?)<\/div>/gi;
      let divMatch;
      while ((divMatch = divRegex.exec(htmlContent)) !== null) {
        const text = divMatch[1].replace(/<[^>]+>/g, '').trim();
        if (text && text.length > 20 && !descriptions.includes(text)) {
          descriptions.push(text);
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

    // Obtener información detallada de cada campaña
    const campaignsWithDetails = [];
    
    for (const campaign of response.data.campaigns) {
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

    res.status(200).json({
      success: true,
      data: {
        campaigns: campaignsWithDetails,
        total_items: response.data.total_items,
        count: campaignsWithDetails.length,
        offset: parseInt(offset)
      }
    });

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

    const response = await axios.get(
      `${MAILCHIMP_BASE_URL}/campaigns/${campaignId}`,
      {
        headers: {
          'Authorization': `Bearer ${MAILCHIMP_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const campaign = response.data;

    res.status(200).json({
      success: true,
      data: {
        id: campaign.id,
        type: campaign.type,
        status: campaign.status,
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
    });

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

    // Extraer imágenes del HTML
    const extractImages = (html) => {
      if (!html) return [];
      
      const imageRegex = /<img[^>]+src="([^">]+)"/gi;
      const images = [];
      let match;
      
      while ((match = imageRegex.exec(html)) !== null) {
        images.push({
          url: match[1],
          alt: (match[0].match(/alt="([^"]*)"/) || [])[1] || '',
          title: (match[0].match(/title="([^"]*)"/) || [])[1] || ''
        });
      }
      
      return images;
    };

    const htmlContent = content.html || '';
    const plainTextContent = content.plain_text || '';
    const images = extractImages(htmlContent);

    res.status(200).json({
      success: true,
      data: {
        campaign_id: campaignId,
        html: htmlContent,
        plain_text: plainTextContent,
        images: images,
        image_count: images.length,
        archive_html: content.archive_html || '',
        _links: content._links || []
      }
    });

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

/**
 * Obtener solo las imágenes de una campaña
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
const getCampaignImages = async (req, res) => {
  try {
    const { campaignId } = req.params;

    if (!campaignId) {
      return res.status(400).json({
        success: false,
        message: 'ID de campaña es requerido'
      });
    }

    // Obtener el contenido de la campaña
    const contentResponse = await axios.get(
      `${MAILCHIMP_BASE_URL}/campaigns/${campaignId}/content`,
      {
        headers: {
          'Authorization': `Bearer ${MAILCHIMP_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    // Obtener información básica de la campaña
    const campaignResponse = await axios.get(
      `${MAILCHIMP_BASE_URL}/campaigns/${campaignId}`,
      {
        headers: {
          'Authorization': `Bearer ${MAILCHIMP_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const htmlContent = contentResponse.data.html || '';
    const campaign = campaignResponse.data;

    // Extraer imágenes del HTML con más detalles
    const extractImagesDetailed = (html) => {
      if (!html) return [];
      
      const imageRegex = /<img[^>]*>/gi;
      const images = [];
      let match;
      
      while ((match = imageRegex.exec(html)) !== null) {
        const imgTag = match[0];
        const srcMatch = imgTag.match(/src="([^"]+)"/i);
        const altMatch = imgTag.match(/alt="([^"]*)"/i);
        const titleMatch = imgTag.match(/title="([^"]*)"/i);
        const widthMatch = imgTag.match(/width="?(\d+)"?/i);
        const heightMatch = imgTag.match(/height="?(\d+)"?/i);
        const classMatch = imgTag.match(/class="([^"]*)"/i);
        
        if (srcMatch) {
          images.push({
            url: srcMatch[1],
            alt: altMatch ? altMatch[1] : '',
            title: titleMatch ? titleMatch[1] : '',
            width: widthMatch ? parseInt(widthMatch[1]) : null,
            height: heightMatch ? parseInt(heightMatch[1]) : null,
            class: classMatch ? classMatch[1] : '',
            full_tag: imgTag
          });
        }
      }
      
      return images;
    };

    const images = extractImagesDetailed(htmlContent);

    res.status(200).json({
      success: true,
      data: {
        campaign_id: campaignId,
        campaign_title: campaign.settings?.title || 'Sin título',
        campaign_subject: campaign.settings?.subject_line || 'Sin asunto',
        campaign_status: campaign.status,
        images: images,
        image_count: images.length,
        thumbnail: images.length > 0 ? images[0].url : null, // Primera imagen como thumbnail
        created_at: campaign.create_time,
        sent_at: campaign.send_time
      }
    });

  } catch (error) {
    console.error('❌ Error al obtener imágenes de campaña:', error.response?.data || error.message);

    if (error.response?.status === 404) {
      return res.status(404).json({
        success: false,
        message: 'Campaña no encontrada'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al obtener imágenes de campaña'
    });
  }
};

/**
 * Obtener todas las imágenes de todas las campañas
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
const getAllCampaignImages = async (req, res) => {
  try {
    const { count = 50, status = 'sent' } = req.query;

    // Primero obtener todas las campañas
    const campaignsResponse = await axios.get(
      `${MAILCHIMP_BASE_URL}/campaigns?count=${count}&status=${status}&sort_field=create_time&sort_dir=DESC`,
      {
        headers: {
          'Authorization': `Bearer ${MAILCHIMP_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const campaigns = campaignsResponse.data.campaigns;
    const allImages = [];

    // Función para extraer imágenes del HTML
    const extractImagesDetailed = (html) => {
      if (!html) return [];
      
      const imageRegex = /<img[^>]*>/gi;
      const images = [];
      let match;
      
      while ((match = imageRegex.exec(html)) !== null) {
        const imgTag = match[0];
        const srcMatch = imgTag.match(/src="([^"]+)"/i);
        const altMatch = imgTag.match(/alt="([^"]*)"/i);
        const titleMatch = imgTag.match(/title="([^"]*)"/i);
        const widthMatch = imgTag.match(/width="?(\d+)"?/i);
        const heightMatch = imgTag.match(/height="?(\d+)"?/i);
        const classMatch = imgTag.match(/class="([^"]*)"/i);
        
        if (srcMatch) {
          images.push({
            url: srcMatch[1],
            alt: altMatch ? altMatch[1] : '',
            title: titleMatch ? titleMatch[1] : '',
            width: widthMatch ? parseInt(widthMatch[1]) : null,
            height: heightMatch ? parseInt(heightMatch[1]) : null,
            class: classMatch ? classMatch[1] : '',
            full_tag: imgTag
          });
        }
      }
      
      return images;
    };

    // Procesar cada campaña para obtener sus imágenes
    for (const campaign of campaigns) {
      try {
        // Obtener el contenido de cada campaña
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
        const images = extractImagesDetailed(htmlContent);

        if (images.length > 0) {
          allImages.push({
            campaign_id: campaign.id,
            campaign_title: campaign.settings?.title || 'Sin título',
            campaign_subject: campaign.settings?.subject_line || 'Sin asunto',
            campaign_status: campaign.status,
            created_at: campaign.create_time,
            sent_at: campaign.send_time,
            images: images,
            image_count: images.length,
            thumbnail: images[0]?.url || null
          });
        }
      } catch (error) {
        console.warn(`⚠️ Error al obtener contenido de campaña ${campaign.id}:`, error.message);
        // Continuar con la siguiente campaña si hay error
        continue;
      }
    }

    // Crear un array plano de todas las imágenes con información de campaña
    const flatImages = [];
    allImages.forEach(campaignData => {
      campaignData.images.forEach(image => {
        flatImages.push({
          ...image,
          campaign_id: campaignData.campaign_id,
          campaign_title: campaignData.campaign_title,
          campaign_subject: campaignData.campaign_subject,
          campaign_created_at: campaignData.created_at,
          campaign_sent_at: campaignData.sent_at
        });
      });
    });

    res.status(200).json({
      success: true,
      data: {
        campaigns_processed: campaigns.length,
        campaigns_with_images: allImages.length,
        total_images: flatImages.length,
        campaigns: allImages,
        all_images: flatImages
      }
    });

  } catch (error) {
    console.error('❌ Error al obtener todas las imágenes de campañas:', error.response?.data || error.message);

    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al obtener imágenes de campañas'
    });
  }
};

module.exports = {
  subscribeToNewsletter,
  getSubscriberInfo,
  unsubscribeFromNewsletter,
  getListStats,
  getCampaigns,
  getCampaignById,
  getCampaignContent,
  getCampaignImages,
  getAllCampaignImages
};