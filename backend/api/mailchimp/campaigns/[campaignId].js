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
        campaign: {
          id: campaignId,
          title: 'Campaña de ejemplo',
          status: 'sent',
          send_time: new Date().toISOString(),
          settings: {
            subject_line: 'Ejemplo de campaña',
            from_name: 'CompraCondoEspaña',
            reply_to: 'info@compracondoespana.com'
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

    // Si las variables están configuradas, intentar obtener la campaña real
    const axios = require('axios');
    const MAILCHIMP_BASE_URL = `https://${MAILCHIMP_SERVER_PREFIX}.api.mailchimp.com/3.0`;

    const response = await axios.get(
      `${MAILCHIMP_BASE_URL}/campaigns/${campaignId}`,
      {
        headers: {
          'Authorization': `Bearer ${MAILCHIMP_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      }
    );

      const campaign = response.data;

    const responseData = {
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
    };

    return res.status(200).json(responseData);

  } catch (error) {
    console.error('❌ Error en handler de campaña:', error.message);
    
    if (error.response) {
      const status = error.response.status;
      
      if (status === 404) {
        return res.status(404).json({
          success: false,
          error: 'Campaña no encontrada',
          message: `No se encontró la campaña con ID: ${req.query.campaignId}`
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