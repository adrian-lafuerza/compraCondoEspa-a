import axios from 'axios';

// Configuración de Contentful
const CONTENTFUL_SPACE_ID = import.meta.env.VITE_CONTENTFUL_SPACE_ID;
const CONTENTFUL_ACCESS_TOKEN = import.meta.env.VITE_CONTENTFUL_ACCESS_TOKEN;
const CONTENTFUL_BASE_URL = `https://cdn.contentful.com/spaces/${CONTENTFUL_SPACE_ID}`;

// Datos de Instagram de respaldo (fallback)
const mockInstagramData = [
  {
    id: 'default-1',
    title: 'Mi último proyecto',
    instagramUrl: 'https://www.instagram.com/reel/DIG2gOWt2lt/',
    embedUrl: 'https://www.instagram.com/reel/DIG2gOWt2lt/embed',
    description: 'Descubre mi último proyecto inmobiliario',
    isActive: true,
    order: 1
  },
  {
    id: 'default-2',
    title: 'LAY PROCENTE',
    instagramUrl: 'https://www.instagram.com/reel/DKXUPyLodQP/',
    embedUrl: 'https://www.instagram.com/reel/DKXUPyLodQP/embed',
    description: 'Consejos inmobiliarios importantes',
    isActive: true,
    order: 2
  },
  {
    id: 'default-3',
    title: 'HOY TENGO EL HONOR DE ESTAR',
    instagramUrl: 'https://www.instagram.com/reel/DKhhoIkto9G/',
    embedUrl: 'https://www.instagram.com/reel/DKhhoIkto9G/embed',
    description: 'Experiencias profesionales',
    isActive: true,
    order: 3
  },
  {
    id: 'default-4',
    title: 'HOY TENGO EL HONOR DE ESTAR',
    instagramUrl: 'https://www.instagram.com/reel/DKhhoIkto9G/',
    embedUrl: 'https://www.instagram.com/reel/DKhhoIkto9G/embed',
    description: 'Experiencias profesionales',
    isActive: true,
    order: 4
  }
];

export const instagramService = {
  // Obtener todos los posts de Instagram
  async getAllPosts() {
    try {
      // Validar configuración de Contentful
      if (!CONTENTFUL_SPACE_ID || !CONTENTFUL_ACCESS_TOKEN) {
        console.warn('⚠️ Contentful no configurado, usando datos de prueba');
        return mockInstagramData.filter(post => post.isActive).sort((a, b) => a.order - b.order);
      }

      console.log('🔍 Obteniendo datos de Instagram desde Contentful...');
      
      const response = await axios.get(`${CONTENTFUL_BASE_URL}/entries`, {
        params: {
          access_token: CONTENTFUL_ACCESS_TOKEN,
          content_type: 'instagramPost',
          include: 1
        }
      });

      // Procesar datos de Contentful
      const instagramPosts = response.data.items.map(item => {
        const instagramUrl = item.fields.instagramUrl;
        const embedUrl = instagramUrl ? `${instagramUrl}embed` : null;

        return {
          id: item.sys.id,
          title: item.fields.title,
          description: item.fields.description,
          imageUrl: item.fields.image?.fields?.file?.url,
          instagramUrl: instagramUrl,
          embedUrl: embedUrl,
          likes: item.fields.likes || 0,
          comments: item.fields.comments || 0,
          isActive: item.fields.isActive !== false,
          order: item.fields.order || 1,
          createdAt: item.sys.createdAt,
          updatedAt: item.sys.updatedAt
        };
      });

      console.log(`✅ Se obtuvieron ${instagramPosts.length} posts de Instagram desde Contentful`);

      // Filtrar solo posts activos y ordenar por order
      const activePosts = instagramPosts
        .filter(post => post.isActive)
        .sort((a, b) => a.order - b.order);

      return activePosts;

    } catch (error) {
      console.error('❌ Error al obtener datos de Instagram desde Contentful:', error.message);
      console.warn('🔄 Usando datos de prueba como fallback');
      
      // Retornar datos mock como fallback
      return mockInstagramData.filter(post => post.isActive).sort((a, b) => a.order - b.order);
    }
  },

  // Obtener un post específico por ID
  async getPostById(id) {
    try {
      // Primero intentar obtener todos los posts
      const allPosts = await this.getAllPosts();
      
      const post = allPosts.find(post => post.id === id);
      
      if (!post) {
        throw new Error(`Post con ID ${id} no encontrado`);
      }
      
      return post;
    } catch (error) {
      console.error('Error in getPostById:', error);
      throw error;
    }
  },

  // Obtener estadísticas de Instagram
  async getInstagramStats() {
    try {
      const allPosts = await this.getAllPosts();
      
      return {
        totalPosts: allPosts.length,
        activePosts: allPosts.length,
        inactivePosts: 0, // Ya están filtrados los activos
        lastUpdated: new Date().toISOString(),
        source: CONTENTFUL_SPACE_ID && CONTENTFUL_ACCESS_TOKEN ? 'contentful' : 'mock'
      };
    } catch (error) {
      console.error('Error in getInstagramStats:', error);
      
      // Fallback con datos mock
      const activePosts = mockInstagramData.filter(post => post.isActive);
      return {
        totalPosts: activePosts.length,
        activePosts: activePosts.length,
        inactivePosts: mockInstagramData.length - activePosts.length,
        lastUpdated: new Date().toISOString(),
        source: 'mock'
      };
    }
  },

  // Verificar estado del servicio
  async checkHealth() {
    try {
      const hasContentfulConfig = !!(CONTENTFUL_SPACE_ID && CONTENTFUL_ACCESS_TOKEN);
      
      if (hasContentfulConfig) {
        // Probar conexión con Contentful
        const response = await axios.get(`${CONTENTFUL_BASE_URL}/entries`, {
          params: {
            access_token: CONTENTFUL_ACCESS_TOKEN,
            content_type: 'instagramPost',
            limit: 1
          }
        });
        
        return {
          status: 'healthy',
          service: 'instagram-frontend-contentful',
          timestamp: new Date().toISOString(),
          postsAvailable: response.data.total,
          source: 'contentful'
        };
      } else {
        return {
          status: 'healthy',
          service: 'instagram-frontend-mock',
          timestamp: new Date().toISOString(),
          postsAvailable: mockInstagramData.length,
          source: 'mock',
          warning: 'Contentful no configurado, usando datos de prueba'
        };
      }
    } catch (error) {
      console.error('Error in checkHealth:', error);
      
      return {
        status: 'degraded',
        service: 'instagram-frontend-fallback',
        timestamp: new Date().toISOString(),
        postsAvailable: mockInstagramData.length,
        source: 'mock',
        error: error.message
      };
    }
  }
};

export default instagramService;