module.exports = async (req, res) => {
  // Headers CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Manejar preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Solo permitir GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const { campaignId } = req.query;

    // Validar que se proporcione el campaignId
    if (!campaignId) {
      return res.status(400).json({
        success: false,
        error: 'Campaign ID es requerido'
      });
    }

    // Configuración de Mailchimp
    const MAILCHIMP_API_KEY = process.env.MAILCHIMP_API_KEY;
    const MAILCHIMP_SERVER_PREFIX = process.env.MAILCHIMP_SERVER_PREFIX;
    const MAILCHIMP_LIST_ID = process.env.MAILCHIMP_LIST_ID;

    // Verificar variables de entorno
    if (!MAILCHIMP_API_KEY || !MAILCHIMP_SERVER_PREFIX || !MAILCHIMP_LIST_ID) {
      console.log('⚠️ Variables de entorno de Mailchimp no configuradas');
      return res.status(200).json({
        success: true,
        content: {
          html: '<h1>Contenido de ejemplo</h1><p>Este es un contenido de campaña de ejemplo.</p>',
          plain_text: 'Contenido de ejemplo\n\nEste es un contenido de campaña de ejemplo.',
          template: {
            id: 'example',
            type: 'user'
          }
        },
        config_status: {
          MAILCHIMP_API_KEY: !!MAILCHIMP_API_KEY,
          MAILCHIMP_SERVER_PREFIX: !!MAILCHIMP_SERVER_PREFIX,
          MAILCHIMP_LIST_ID: !!MAILCHIMP_LIST_ID
        },
        message: 'Variables de entorno no configuradas - usando datos de fallback'
      });
    }

    // Si las variables están configuradas, intentar obtener el contenido real
    const axios = require('axios');
    const MAILCHIMP_BASE_URL = `https://${MAILCHIMP_SERVER_PREFIX}.api.mailchimp.com/3.0`;

    const response = await axios.get(
      `${MAILCHIMP_BASE_URL}/campaigns/${campaignId}/content`,
      {
        headers: {
          'Authorization': `Bearer ${MAILCHIMP_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
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

    const responseData = {
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
    };

    return res.status(200).json(responseData);


  } catch (error) {
    console.error('❌ Error en handler de contenido de campaña:', error.message);

    if (error.response) {
      const status = error.response.status;

      if (status === 404) {
        return res.status(404).json({
          success: false,
          error: 'Contenido de campaña no encontrado',
          message: `No se encontró el contenido para la campaña con ID: ${req.query.campaignId}`
        });
      }

      if (status === 401) {
        return res.status(401).json({
          success: false,
          error: 'Error de autenticación con Mailchimp',
          message: 'Verifica tu API key de Mailchimp'
        });
      }
    }

    return res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      message: error.message
    });
  }
};