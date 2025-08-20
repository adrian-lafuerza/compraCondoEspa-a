const API_BASE_URL = 'http://localhost:3000/api';

export const mailchimpService = {
  /**
   * Obtener todas las campañas de Mailchimp
   * @param {Object} params - Parámetros de filtrado
   * @param {string} params.status - Estado de la campaña ('sent', 'draft', 'scheduled', etc.)
   * @param {string} params.type - Tipo de campaña ('regular', 'plaintext', 'absplit', etc.)
   * @param {number} params.count - Número de campañas a obtener (máximo 1000)
   * @param {number} params.offset - Número de campañas a omitir
   * @returns {Promise<Object>} Respuesta de la API con las campañas
   */
  async getCampaigns(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      // Parámetros por defecto
      const defaultParams = {
        status: 'sent', // Solo campañas enviadas por defecto
        count: 3,
        offset: 0,
        ...params
      };

      // Agregar parámetros a la URL
      Object.entries(defaultParams).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value);
        }
      });

      const response = await fetch(`${API_BASE_URL}/mailchimp/campaigns?${queryParams}`);
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      // El backend devuelve {success: true, data: {campaigns: [...], total_items: ...}}
      return result.data || result;
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      throw error;
    }
  },

  /**
   * Obtener una campaña específica por ID
   * @param {string} campaignId - ID de la campaña
   * @returns {Promise<Object>} Datos de la campaña
   */
  async getCampaignById(campaignId) {
    try {
      const response = await fetch(`${API_BASE_URL}/mailchimp/campaigns/${campaignId}`);
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching campaign:', error);
      throw error;
    }
  },

  /**
   * Obtener el contenido completo de una campaña
   * @param {string} campaignId - ID de la campaña
   * @returns {Promise<Object>} Contenido HTML, texto plano e imágenes
   */
  async getCampaignContent(campaignId) {
    try {
      const response = await fetch(`${API_BASE_URL}/mailchimp/campaigns/${campaignId}/content`);
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching campaign content:', error);
      throw error;
    }
  },

  /**
   * Obtener solo las imágenes de una campaña
   * @param {string} campaignId - ID de la campaña
   * @returns {Promise<Object>} Lista de imágenes con metadatos
   */
  async getCampaignImages(campaignId) {
    try {
      const response = await fetch(`${API_BASE_URL}/mailchimp/campaigns/${campaignId}/images`);
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      // El backend devuelve {success: true, data: {images: [...], thumbnail: ...}}
      if (result.success && result.data) {
        return result;
      } else {
        // Si no tiene la estructura esperada, asumir que result es directamente la data
        return { success: true, data: result };
      }
    } catch (error) {
      console.error('Error fetching campaign images:', error);
      throw error;
    }
  },

  /**
   * Obtener estadísticas de la lista de Mailchimp
   * @returns {Promise<Object>} Estadísticas de la lista
   */
  async getListStats() {
    try {
      const response = await fetch(`${API_BASE_URL}/mailchimp/list/stats`);
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching list stats:', error);
      throw error;
    }
  },

  /**
   * Verificar el estado de la conexión con Mailchimp
   * @returns {Promise<Object>} Estado de la conexión
   */
  async healthCheck() {
    try {
      const response = await fetch(`${API_BASE_URL}/mailchimp/health`);
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error checking Mailchimp health:', error);
      throw error;
    }
  },

  /**
   * Transformar datos de campaña para el frontend
   * @param {Object} campaign - Datos de campaña de la API
   * @returns {Object} Datos transformados para el frontend
   */
  transformCampaign(campaign) {
    return {
      id: campaign.id,
      title: campaign.settings?.title || campaign.title || 'Sin título',
      subject: campaign.settings?.subject_line || campaign.subject_line || 'Sin asunto',
      preview: campaign.settings?.preview_text || campaign.preview_text || '',
      status: campaign.status,
      type: campaign.type,
      createTime: campaign.create_time ? new Date(campaign.create_time) : null,
      sendTime: campaign.send_time ? new Date(campaign.send_time) : null,
      emailsSent: campaign.emails_sent || 0,
      opens: campaign.report_summary?.opens || 0,
      clicks: campaign.report_summary?.clicks || 0,
      openRate: campaign.report_summary?.open_rate || 0,
      clickRate: campaign.report_summary?.click_rate || 0,
      webId: campaign.web_id,
      archiveUrl: campaign.archive_url,
      longArchiveUrl: campaign.long_archive_url,
      // Nuevos campos del controlador actualizado
      images: campaign.images || [],
      descriptions: campaign.descriptions || [],
      thumbnail: campaign.images && campaign.images.length > 0 ? campaign.images[0] : null,
      from_name: campaign.from_name,
      reply_to: campaign.reply_to
    };
  },

  /**
   * Obtener campañas con imágenes (thumbnail)
   * @param {Object} params - Parámetros de filtrado
   * @returns {Promise<Array>} Array de campañas con thumbnails
   */
  async getCampaignsWithThumbnails(params = {}) {
    try {
      const campaignsResponse = await this.getCampaigns(params);
      const campaigns = campaignsResponse.campaigns || [];

      // Transformar campañas - ya incluyen imágenes y descripciones del backend
      const campaignsWithThumbnails = campaigns.map(campaign => {
        return this.transformCampaign(campaign);
      });

      return {
        campaigns: campaignsWithThumbnails,
        total_items: campaignsResponse.total_items || campaigns.length
      };
    } catch (error) {
      console.error('Error fetching campaigns with thumbnails:', error);
      throw error;
    }
  }
};

export default mailchimpService;