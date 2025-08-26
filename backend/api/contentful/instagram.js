const axios = require('axios');

// Configuración de Contentful
const CONTENTFUL_SPACE_ID = process.env.CONTENTFUL_SPACE_ID;
const CONTENTFUL_ACCESS_TOKEN = process.env.CONTENTFUL_ACCESS_TOKEN;
const CONTENTFUL_BASE_URL = `https://cdn.contentful.com/spaces/${CONTENTFUL_SPACE_ID}`;

// Datos de prueba para Instagram con URLs reales
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

// Configurar CORS
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Credentials': 'true'
};

module.exports = async function handler(req, res) {
  // Configurar CORS headers
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

  try {
    // Validar configuración
    if (!CONTENTFUL_SPACE_ID || !CONTENTFUL_ACCESS_TOKEN) {
      console.error('❌ ERROR: Debes configurar CONTENTFUL_SPACE_ID y CONTENTFUL_ACCESS_TOKEN');
      return res.status(200).json({
        success: true,
        data: mockInstagramData,
        message: 'Usando datos de prueba - Configura Contentful para datos reales'
      });
    }

    console.log('🔍 Obteniendo datos de Instagram desde Contentful...');
    
    const response = await axios.get(`${CONTENTFUL_BASE_URL}/entries`, {
      params: {
        access_token: CONTENTFUL_ACCESS_TOKEN,
        content_type: 'instagramPost',
        include: 1
      }
    });

    // Procesar datos
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
        createdAt: item.sys.createdAt,
        updatedAt: item.sys.updatedAt
      };
    });

    res.json({
      success: true,
      data: instagramPosts,
      total: response.data.total,
      message: `Se obtuvieron ${instagramPosts.length} posts de Instagram`
    });
  } catch (error) {
    console.error('❌ Error al obtener datos de Instagram:', error.message);
    
    return res.status(200).json({
      success: true,
      data: mockInstagramData,
      message: 'Error en Contentful - Usando datos de prueba',
      error: error.message
    });
  }
}