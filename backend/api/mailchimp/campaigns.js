const axios = require('axios');
const { mailchimpCacheManager } = require('../../src/utils/mailchimpCacheManager');

// Configuración de Mailchimp
const MAILCHIMP_API_KEY = process.env.MAILCHIMP_API_KEY;
const MAILCHIMP_SERVER_PREFIX = process.env.MAILCHIMP_SERVER_PREFIX;
const MAILCHIMP_LIST_ID = process.env.MAILCHIMP_LIST_ID;
const MAILCHIMP_BASE_URL = `https://${MAILCHIMP_SERVER_PREFIX}.api.mailchimp.com/3.0`;

// Headers CORS
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Credentials': 'true'
};

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

module.exports = async (req, res) => {
  try {
    // Establecer headers CORS
    Object.keys(corsHeaders).forEach(key => {
      res.setHeader(key, corsHeaders[key]);
    });
    
    // Manejar preflight OPTIONS request
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    // Solo permitir GET requests
    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Método no permitido' });
    }

    // Verificar variables de entorno
    if (!MAILCHIMP_API_KEY || !MAILCHIMP_SERVER_PREFIX || !MAILCHIMP_LIST_ID) {
      console.log('⚠️ Variables de entorno de Mailchimp no configuradas');
      return res.status(200).json({
        success: true,
        campaigns: [],
        total_items: 0,
        config_status: {
          MAILCHIMP_API_KEY: !!MAILCHIMP_API_KEY,
          MAILCHIMP_SERVER_PREFIX: !!MAILCHIMP_SERVER_PREFIX,
          MAILCHIMP_LIST_ID: !!MAILCHIMP_LIST_ID
        },
        message: 'Variables de entorno no configuradas - usando datos de fallback'
      });
    }

    const { status, type, count = 10, offset = 0, includeHtml = 'false' } = req.query;

    // Crear parámetros de búsqueda para el caché
    const searchParams = {
      status: status || 'all',
      type: type || 'all',
      count: parseInt(count),
      offset: parseInt(offset),
      includeHtml: includeHtml
    };

    // Verificar caché primero usando el cache manager global
    const cachedData = await mailchimpCacheManager.getCampaigns(searchParams);
    
    if (cachedData) {
      console.log('📋 Campañas obtenidas del caché global');
      return res.status(200).json(cachedData);
    }

    console.log('🔄 Consultando API de Mailchimp para campañas...');

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
        },
        timeout: 10000
      }
    );

    // Obtener información detallada de cada campaña
    const campaignsWithDetails = [];
    
    for (const campaign of response.data.campaigns) {
      try {
        // Verificar caché de contenido primero usando el cache manager global
        let contentResponse = await mailchimpCacheManager.getCampaignContent(campaign.id);
        
        if (!contentResponse) {
          // Obtener el contenido de la campaña desde la API
          const apiResponse = await axios.get(
            `${MAILCHIMP_BASE_URL}/campaigns/${campaign.id}/content`,
            {
              headers: {
                'Authorization': `Bearer ${MAILCHIMP_API_KEY}`,
                'Content-Type': 'application/json'
              }
            }
          );
          
          contentResponse = apiResponse.data;
          
          // Guardar en caché el contenido usando el cache manager global
          await mailchimpCacheManager.setCampaignContent(campaign.id, contentResponse, 3600); // 1 hora
          console.log(`💾 Contenido de campaña guardado en caché global: ${campaign.id}`);
        } else {
          console.log(`📄 Contenido de campaña obtenido del caché global: ${campaign.id}`);
        }

        const htmlContent = contentResponse.html || '';
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

    // Guardar en caché la respuesta usando el cache manager global
    await mailchimpCacheManager.setCampaigns(searchParams, responseData, 1800); // 30 minutos
    console.log(`💾 Campañas guardadas en caché global`);

    return res.status(200).json(responseData);

  } catch (error) {
    console.error('❌ Error en handler de campañas:', error.message);
    
    return res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      message: error.message
    });
  }
};