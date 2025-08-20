const API_BASE_URL = 'http://localhost:3000/api';

export const propertyService = {
  /**
   * Obtener propiedades desde la API de Idealista
   * @param {Object} params - Parámetros de búsqueda
   * @param {string} params.location - Ubicación (ej: 'Madrid')
   * @param {string} params.operation - Tipo de operación ('sale' o 'rent')
   * @param {string} params.propertyType - Tipo de propiedad ('homes', 'offices', etc.)
   * @param {number} params.maxItems - Número máximo de resultados
   * @param {number} params.numPage - Número de página
   * @returns {Promise<Object>} Respuesta de la API con propiedades
   */
  async getProperties(params = {}) {
    try {
      // Construir parámetros de consulta
      const queryParams = new URLSearchParams();
      
      // Parámetros por defecto
      const defaultParams = {
        operation: 'sale',
        propertyType: 'homes',
        maxItems: 50,
        numPage: 1,
        ...params
      };

      // Agregar parámetros a la URL
      Object.entries(defaultParams).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value);
        }
      });

      // Si se especifica una ubicación como Madrid, agregar coordenadas
      if (params.location && params.location.toLowerCase() === 'madrid') {
        queryParams.set('center', '40.4168,-3.7038');
        queryParams.set('distance', '15000'); // 15km de radio
      }

      const response = await fetch(`${API_BASE_URL}/idealista/properties?${queryParams}`);
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching properties:', error);
      throw error;
    }
  },

  /**
   * Obtener una propiedad específica por ID
   * @param {string|number} id - ID de la propiedad
   * @returns {Promise<Object>} Datos de la propiedad
   */
  async getPropertyById(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/idealista/properties/${id}`);
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching property:', error);
      throw error;
    }
  },

  /**
   * Buscar propiedades por ubicación específica
   * @param {string} location - Nombre de la ubicación
   * @param {Object} additionalParams - Parámetros adicionales
   * @returns {Promise<Object>} Respuesta de la API
   */
  async searchByLocation(location, additionalParams = {}) {
    return this.getProperties({
      location,
      ...additionalParams
    });
  },

  /**
   * Obtener propiedades por zona desde Contentful
   * @param {string} zone - Zona específica (ej: 'costa-del-sol', 'costa-blanca', 'barcelona')
   * @returns {Promise<Object>} Respuesta de la API con propiedades de Contentful
   */
  async getPropertiesByZone(zone) {
    try {
      const response = await fetch(`${API_BASE_URL}/contentful/properties/zone/${encodeURIComponent(zone)}`);
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching properties by zone:', error);
      throw error;
    }
  },

  /**
   * Transformar datos de la API de Idealista al formato esperado por el frontend
   * @param {Object} apiProperty - Propiedad desde la API
   * @returns {Object} Propiedad transformada
   */
  transformProperty(apiProperty) {
    
    return {
      id: apiProperty.propertyCode || apiProperty.id,
      propertyId: apiProperty.propertyId || apiProperty.propertyCode || apiProperty.id,
      title: apiProperty.title || `${apiProperty.propertyType} en ${apiProperty.location?.city || 'Madrid'}`,
      price: apiProperty.price || 0,
      currency: apiProperty.currency || 'EUR',
      address: apiProperty.location?.address || 'Dirección no disponible',
      city: apiProperty.location?.city || 'Madrid',
      rooms: apiProperty.rooms || 0,
      bathrooms: apiProperty.bathrooms || 0,
      size: apiProperty.size || 0,
      descriptions: apiProperty.descriptions || 'Descripción no disponible',
      thumbnail: apiProperty.images?.[0]?.url || '/images/default-property.jpg',
      images: apiProperty.images || [],
      features: apiProperty.features || [],
      propertyCode: apiProperty.propertyCode || 'N/A',
      propertyType: apiProperty.propertyType || 'homes',
      operation: apiProperty.operation || 'sale',
      energyRating: apiProperty.energyRating || 'N/A',
      publishedDate: apiProperty.publishedDate || new Date().toISOString().split('T')[0],
      contact: apiProperty.contact || { phone: null, email: null },
      coordinates: apiProperty.location?.coordinates || { latitude: 40.4168, longitude: -3.7038 }
    };
  }
};

export default propertyService;