const axios = require('axios');

// Configuración de Contentful
const CONTENTFUL_SPACE_ID = process.env.CONTENTFUL_SPACE_ID;
const CONTENTFUL_ACCESS_TOKEN = process.env.CONTENTFUL_ACCESS_TOKEN;
const CONTENTFUL_BASE_URL = `https://cdn.contentful.com/spaces/${CONTENTFUL_SPACE_ID}`;

// Validar configuración
if (!CONTENTFUL_SPACE_ID || !CONTENTFUL_ACCESS_TOKEN) {
  console.error('❌ ERROR: Debes configurar CONTENTFUL_SPACE_ID y CONTENTFUL_ACCESS_TOKEN en .env');
}

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
    id: 'default-3',
    title: 'HOY TENGO EL HONOR DE ESTAR',
    instagramUrl: 'https://www.instagram.com/reel/DKhhoIkto9G/',
    embedUrl: 'https://www.instagram.com/reel/DKhhoIkto9G/embed',
    description: 'Experiencias profesionales',
    isActive: true,
    order: 3
  }
];

/**
 * Obtener datos de Instagram desde Contentful
 */
const getInstagramData = async (req, res) => {
  try {
    // Verificar configuración - si no está configurado, usar datos mock
    if (!CONTENTFUL_SPACE_ID || !CONTENTFUL_ACCESS_TOKEN) {
      console.log('⚠️ Contentful no configurado, usando datos de prueba');
      return res.json({
        success: true,
        data: mockInstagramData,
        total: mockInstagramData.length,
        message: `Se obtuvieron ${mockInstagramData.length} posts de Instagram (datos de prueba)`
      });
    }

    // Realizar petición a Contentful
    const response = await axios.get(`${CONTENTFUL_BASE_URL}/entries`, {
      params: {
        access_token: CONTENTFUL_ACCESS_TOKEN,
        content_type: 'instagramPost', // Ajusta según tu content type
        limit: 100,
        order: '-sys.createdAt'
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
    console.error('❌ Error al obtener datos de Instagram desde Contentful:', error.message);
    console.log('⚠️ Usando datos de prueba como fallback');

    // En caso de error, devolver datos mock como fallback
    res.json({
      success: true,
      data: mockInstagramData,
      total: mockInstagramData.length,
      message: `Se obtuvieron ${mockInstagramData.length} posts de Instagram (datos de prueba - fallback por error)`
    });
  }
};

/**
 * Obtener un post específico de Instagram
 */
const getInstagramPostById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!CONTENTFUL_SPACE_ID || !CONTENTFUL_ACCESS_TOKEN) {
      return res.status(500).json({
        error: 'Configuración de Contentful incompleta'
      });
    }

    const response = await axios.get(`${CONTENTFUL_BASE_URL}/entries/${id}`, {
      params: {
        access_token: CONTENTFUL_ACCESS_TOKEN
      }
    });

    const post = {
      id: response.data.sys.id,
      title: response.data.fields.title,
      description: response.data.fields.description,
      imageUrl: response.data.fields.image?.fields?.file?.url,
      instagramUrl: response.data.fields.instagramUrl,
      likes: response.data.fields.likes || 0,
      comments: response.data.fields.comments || 0,
      createdAt: response.data.sys.createdAt,
      updatedAt: response.data.sys.updatedAt
    };

    res.json({
      success: true,
      data: post
    });

  } catch (error) {
    console.error('❌ Error al obtener post específico:', error.message);

    if (error.response?.status === 404) {
      return res.status(404).json({
        error: 'Post no encontrado',
        message: `No se encontró un post con ID: ${req.params.id}`
      });
    }

    res.status(500).json({
      error: 'Error interno del servidor',
      message: error.message
    });
  }
};

/**
 * Obtener estadísticas de Instagram
 */
const getInstagramStats = async (req, res) => {
  try {
    if (!CONTENTFUL_SPACE_ID || !CONTENTFUL_ACCESS_TOKEN) {
      return res.status(500).json({
        error: 'Configuración de Contentful incompleta'
      });
    }

    const response = await axios.get(`${CONTENTFUL_BASE_URL}/entries`, {
      params: {
        access_token: CONTENTFUL_ACCESS_TOKEN,
        content_type: 'instagramPost',
        limit: 1000 // Obtener todos para calcular estadísticas
      }
    });

    const posts = response.data.items;
    const totalPosts = posts.length;
    const totalLikes = posts.reduce((sum, post) => sum + (post.fields.likes || 0), 0);
    const totalComments = posts.reduce((sum, post) => sum + (post.fields.comments || 0), 0);
    const avgLikes = totalPosts > 0 ? Math.round(totalLikes / totalPosts) : 0;
    const avgComments = totalPosts > 0 ? Math.round(totalComments / totalPosts) : 0;

    res.json({
      success: true,
      data: {
        totalPosts,
        totalLikes,
        totalComments,
        avgLikes,
        avgComments,
        engagement: totalPosts > 0 ? ((totalLikes + totalComments) / totalPosts).toFixed(2) : 0
      }
    });

  } catch (error) {
    console.error('❌ Error al obtener estadísticas:', error.message);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: error.message
    });
  }
};

/**
 * Obtener propiedades desde Contentful
 */
const getProperties = async (req, res) => {
  try {
    // Verificar configuración
    if (!CONTENTFUL_SPACE_ID || !CONTENTFUL_ACCESS_TOKEN) {
      console.log('⚠️ Contentful no configurado para propiedades');
      return res.status(500).json({
        success: false,
        error: 'Configuración de Contentful incompleta',
        message: 'CONTENTFUL_SPACE_ID y CONTENTFUL_ACCESS_TOKEN son requeridos'
      });
    }

    // Realizar petición a Contentful
    const response = await axios.get(`${CONTENTFUL_BASE_URL}/entries`, {
      params: {
        access_token: CONTENTFUL_ACCESS_TOKEN,
        content_type: 'properties',
        limit: req.query.limit || 100,
        skip: req.query.skip || 0,
        order: req.query.order || '-sys.createdAt',
        include: 2 // Incluir assets relacionados (imágenes)
      }
    });
    // Procesar datos de propiedades
    const properties = response.data.items.map(item => {
      return {
        propertyId: item.fields.propertyId || item.sys.id,
        title: item.fields.title,
        reference: 'ex-' + (item.sys.id ? item.sys.id.slice(-4) : ''),
        descriptions: [item.fields.description] || [],
        currency: item.fields.currency || 'EUR',
        address: {
          streetName: item.fields.address,
        },
        features: {
          areaConstructed: item.fields.areaConstructed || 0,
          energyCertificateRating: item.fields.energyCertificateRating || 0,
          rooms: item.fields.rooms || 0,
          bathroomNumber: item.fields.bathroomNumber || 0,
        },
        images: item.fields.images ? item.fields.images.map(imgRef => {
          // Buscar el asset en los includes
          const asset = response.data.includes?.Asset?.find(asset => asset.sys.id === imgRef.sys.id);
          return {
            url: asset?.fields?.file?.url ? `https:${asset.fields.file.url}` : null,
            title: asset?.fields?.title,
            description: asset?.fields?.description,
            width: asset?.fields?.file?.details?.image?.width,
            height: asset?.fields?.file?.details?.image?.height,
            size: asset?.fields?.file?.details?.size
          };
        }).filter(img => img.url) : [], // Filtrar imágenes sin URL
        propertyType: item.fields.propertyType,
        propertyZone: item.fields.propertyZone,
        operation: {
          type: item.fields.operationType || 'sale',
          price: item.fields.price,
          features: item.fields.features,
        },
        state: item.fields.status || 'active',
        isActive: item.fields.isActive !== false, // Por defecto true
        createdAt: item.sys.createdAt,
        updatedAt: item.sys.updatedAt
      };
    });

    res.json({
      success: true,
      data: {
        properties: properties,
        total: response.data.total,
        limit: response.data.limit,
        skip: response.data.skip
      },
      message: `Se obtuvieron ${properties.length} propiedades desde Contentful`
    });

  } catch (error) {
    console.error('❌ Error al obtener propiedades desde Contentful:', error.message);

    // Manejo específico de errores
    if (error.response?.status === 404) {
      return res.status(404).json({
        success: false,
        error: 'Content type no encontrado',
        message: 'El content type "Properties" no existe en Contentful'
      });
    }

    if (error.response?.status === 401) {
      return res.status(401).json({
        success: false,
        error: 'Token de acceso inválido',
        message: 'Verifica tu CONTENTFUL_ACCESS_TOKEN'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      message: error.message
    });
  }
};

// Obtener propiedades filtradas por zona específica
const getPropertiesByZone = async (req, res) => {
  try {
    const { zone } = req.params;

    // Validar que se proporcione la zona
    if (!zone) {
      return res.status(400).json({
        success: false,
        error: 'Zona requerida',
        message: 'Debe proporcionar una zona para filtrar las propiedades'
      });
    }

    // Mapear nombres de zona a valores exactos en Contentful
    const zoneMapping = {
      'barcelona': 'Barcelona',
      'costa-del-sol': 'Costa del Sol',
      'costa-blanca': 'Costa Blanca',
      'inversion': 'Inversion',
      'preconstruccion': 'Preconstruccion'
    };

    const propertyZone = zoneMapping[zone];


    if (!propertyZone) {
      return res.status(400).json({
        success: false,
        error: 'Zona no válida',
        message: 'Las zonas válidas son: barcelona, costa-del-sol, costa-blanca, inversion, preconstruccion'
      });
    }

    // Hacer la solicitud a Contentful con filtro directo por propertyZone
    const response = await axios.get(`${CONTENTFUL_BASE_URL}/entries`, {
      params: {
        access_token: CONTENTFUL_ACCESS_TOKEN,
        content_type: 'properties',
        limit: req.query.limit || 100,
        skip: req.query.skip || 0,
        order: req.query.order || '-sys.createdAt',
        include: 2, // Incluir assets relacionados (imágenes)
        [`fields.propertyZone`]: propertyZone
      }
    });

    // Procesar datos de propiedades (mismo procesamiento que getProperties)
    const properties = response.data.items.map(item => {
      return {
        propertyId: item.fields.propertyId || item.sys.id,
        title: item.fields.title,
        reference: 'ex-' + (item.sys.id ? item.sys.id.slice(-4) : ''),
        descriptions: [item.fields.description] || [],
        currency: item.fields.currency || 'EUR',
        address: {
          streetName: item.fields.address,
        },
        features: {
          areaConstructed: item.fields.areaConstructed || 0,
          energyCertificateRating: item.fields.energyCertificateRating || 0,
          rooms: item.fields.rooms || 0,
          bathroomNumber: item.fields.bathroomNumber || 0,
        },
        images: item.fields.images ? item.fields.images.map(imgRef => {
          // Buscar el asset en los includes
          const asset = response.data.includes?.Asset?.find(asset => asset.sys.id === imgRef.sys.id);
          return {
            url: asset?.fields?.file?.url ? `https:${asset.fields.file.url}` : null,
            title: asset?.fields?.title,
            description: asset?.fields?.description,
            width: asset?.fields?.file?.details?.image?.width,
            height: asset?.fields?.file?.details?.image?.height,
            size: asset?.fields?.file?.details?.size
          };
        }).filter(img => img.url) : [], // Filtrar imágenes sin URL
        propertyType: item.fields.propertyType,
        propertyZone: item.fields.propertyZone,
        operation: {
          type: item.fields.operationType || 'sale',
          price: item.fields.price,
          features: item.fields.features,
        },
        state: item.fields.status || 'active',
        isActive: item.fields.isActive !== false, // Por defecto true
        createdAt: item.sys.createdAt,
        updatedAt: item.sys.updatedAt
      };
    });

    res.json({
      success: true,
      data: {
        properties: properties,
        total: properties.length,
        totalInContentful: response.data.total,
        limit: response.data.limit,
        skip: response.data.skip,
        zone: propertyZone
      },
      message: `Se obtuvieron ${properties.length} propiedades de ${propertyZone} desde Contentful`
    });

  } catch (error) {
    console.error('Error al obtener propiedades por zona:', error.message);

    if (error.response?.status === 400) {
      return res.status(400).json({
        success: false,
        error: 'Solicitud inválida',
        message: 'Verifica los parámetros de la consulta'
      });
    }

    if (error.response?.status === 401) {
      return res.status(401).json({
        success: false,
        error: 'Token de acceso inválido',
        message: 'Verifica tu CONTENTFUL_ACCESS_TOKEN'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      message: error.message
    });
  }
};

module.exports = {
  getInstagramData,
  getInstagramPostById,
  getInstagramStats,
  getProperties,
  getPropertiesByZone
};