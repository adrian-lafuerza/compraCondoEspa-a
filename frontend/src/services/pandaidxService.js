const API_BASE_URL = 'http://localhost:3000/api';

export const pandaidxService = {
  /**
   * Obtener todas las stories de PandaIDX
   * @param {Object} params - Parámetros de filtrado
   * @param {number} params.limit - Número de stories a obtener
   * @param {number} params.offset - Número de stories a omitir
   * @param {string} params.category - Categoría de las stories
   * @returns {Promise<Object>} Respuesta de la API con las stories
   */
  async getStories(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      // Parámetros por defecto
      const defaultParams = {
        limit: 20,
        offset: 0,
        ...params
      };

      // Agregar parámetros a la URL
      Object.entries(defaultParams).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value);
        }
      });

      const response = await fetch(`${API_BASE_URL}/pandaidx/stories?${queryParams}`);
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      return result.data || result;
    } catch (error) {
      console.error('Error fetching stories:', error);
      throw error;
    }
  },

  /**
   * Obtener una story específica por ID
   * @param {string} storyId - ID de la story
   * @returns {Promise<Object>} Datos de la story
   */
  async getStoryById(storyId) {
    try {
      if (!storyId) {
        throw new Error('Story ID es requerido');
      }

      const response = await fetch(`${API_BASE_URL}/pandaidx/stories/${storyId}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Story no encontrada');
        }
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      return result.data || result;
    } catch (error) {
      console.error('Error fetching story by ID:', error);
      throw error;
    }
  },

  /**
   * Buscar stories por término
   * @param {string} query - Término de búsqueda
   * @param {Object} params - Parámetros adicionales
   * @param {number} params.limit - Número de resultados
   * @param {number} params.offset - Número de resultados a omitir
   * @returns {Promise<Object>} Resultados de la búsqueda
   */
  async searchStories(query, params = {}) {
    try {
      if (!query || query.trim() === '') {
        throw new Error('Término de búsqueda es requerido');
      }

      const queryParams = new URLSearchParams();
      queryParams.append('q', query.trim());
      
      // Parámetros adicionales
      const defaultParams = {
        limit: 20,
        offset: 0,
        ...params
      };

      Object.entries(defaultParams).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value);
        }
      });

      const response = await fetch(`${API_BASE_URL}/pandaidx/stories/search?${queryParams}`);
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      return result.data || result;
    } catch (error) {
      console.error('Error searching stories:', error);
      throw error;
    }
  },

  /**
   * Obtener todas las categorías disponibles
   * @returns {Promise<Array>} Lista de categorías
   */
  async getCategories() {
    try {
      const response = await fetch(`${API_BASE_URL}/pandaidx/stories/categories`);
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      return result.data || result;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  },

  /**
   * Obtener stories por categoría
   * @param {string} category - Nombre de la categoría
   * @param {Object} params - Parámetros adicionales
   * @param {number} params.limit - Número de stories a obtener
   * @param {number} params.offset - Número de stories a omitir
   * @returns {Promise<Object>} Stories de la categoría
   */
  async getStoriesByCategory(category, params = {}) {
    try {
      if (!category) {
        throw new Error('Categoría es requerida');
      }

      const queryParams = new URLSearchParams();
      
      // Parámetros por defecto
      const defaultParams = {
        limit: 20,
        offset: 0,
        ...params
      };

      Object.entries(defaultParams).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value);
        }
      });

      const response = await fetch(`${API_BASE_URL}/pandaidx/stories/category/${encodeURIComponent(category)}?${queryParams}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Categoría no encontrada');
        }
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      return result.data || result;
    } catch (error) {
      console.error('Error fetching stories by category:', error);
      throw error;
    }
  },

  /**
   * Verificar el estado del servicio PandaIDX
   * @returns {Promise<Object>} Estado del servicio
   */
  async healthCheck() {
    try {
      const response = await fetch(`${API_BASE_URL}/pandaidx/health`);
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error checking PandaIDX health:', error);
      throw error;
    }
  }
};

export default pandaidxService;