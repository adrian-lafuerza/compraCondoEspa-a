const axios = require('axios');

// Configuración de Contentful
const CONTENTFUL_SPACE_ID = process.env.CONTENTFUL_SPACE_ID;
const CONTENTFUL_ACCESS_TOKEN = process.env.CONTENTFUL_ACCESS_TOKEN;
const CONTENTFUL_BASE_URL = `https://cdn.contentful.com/spaces/${CONTENTFUL_SPACE_ID}`;

// Configurar CORS
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Credentials': 'true'
};

// Función para resolver imágenes desde Contentful
const resolveImages = async (imageRefs, includes) => {
  if (!imageRefs || !Array.isArray(imageRefs)) {
    return [];
  }

  const images = [];

  for (const imgRef of imageRefs) {
    try {
      let asset = null;

      // Primero intentar buscar en includes si están disponibles
      if (includes?.Asset) {
        asset = includes.Asset.find(a => a.sys.id === imgRef.sys.id);
      }

      // Si no hay includes o no se encontró el asset, hacer consulta directa
      if (!asset) {
        const assetResponse = await axios.get(`${CONTENTFUL_BASE_URL}/assets/${imgRef.sys.id}`, {
          params: {
            access_token: CONTENTFUL_ACCESS_TOKEN
          }
        });
        asset = assetResponse.data;
      }

      if (asset?.fields?.file?.url) {
        images.push({
          url: `https:${asset.fields.file.url}`,
          title: asset.fields.title || '',
          description: asset.fields.description || '',
          width: asset.fields.file.details?.image?.width,
          height: asset.fields.file.details?.image?.height,
          size: asset.fields.file.details?.size
        });
      }
    } catch (error) {
      console.error(`❌ Error al resolver imagen ${imgRef.sys.id}:`, error.message);
      // Continuar con las demás imágenes aunque una falle
    }
  }

  return images;
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
    const { propertyId } = req.query;

    if (!propertyId) {
      return res.status(400).json({
        success: false,
        message: "ID de propiedad requerido"
      });
    }

    // Verificar configuración
    if (!CONTENTFUL_SPACE_ID || !CONTENTFUL_ACCESS_TOKEN) {
      console.log('⚠️ Contentful no configurado para propiedades');
      return res.status(500).json({
        success: false,
        error: 'Configuración de Contentful incompleta',
        message: 'CONTENTFUL_SPACE_ID y CONTENTFUL_ACCESS_TOKEN son requeridos'
      });
    }

    console.log(`🔍 Obteniendo propiedad ${propertyId} desde Contentful...`);

    // Realizar petición a Contentful para obtener la entrada específica
    const response = await axios.get(`${CONTENTFUL_BASE_URL}/entries/${propertyId}`, {
      params: {
        access_token: CONTENTFUL_ACCESS_TOKEN,
        include: 2 // Incluir assets relacionados (imágenes)
      }
    });

    const item = response.data;

    // Verificar que sea del content type correcto
    if (item.sys.contentType.sys.id !== 'properties') {
      return res.status(404).json({
        success: false,
        message: `La entrada ${propertyId} no es una propiedad válida`
      });
    }

    // Transformar datos al formato esperado por el frontend
    const property = {
      propertyId: item.sys.id,
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
      images: await resolveImages(item.fields.images, response.data.includes),
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

    console.log(`✅ Propiedad ${propertyId} obtenida exitosamente desde Contentful`);

    return res.status(200).json({
      success: true,
      data: property,
      message: `Propiedad ${propertyId} obtenida desde Contentful`
    });

  } catch (error) {
    console.error(`❌ Error al obtener propiedad ${req.query.propertyId} desde Contentful:`, error.message);

    // Manejo específico de errores
    if (error.response?.status === 404) {
      return res.status(404).json({
        success: false,
        message: `Propiedad ${req.query.propertyId} no encontrada en Contentful`,
        error: 'Propiedad no encontrada'
      });
    }

    if (error.response?.status === 401) {
      return res.status(401).json({
        success: false,
        message: 'Token de acceso a Contentful inválido',
        error: 'No autorizado'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor al obtener la propiedad',
      error: error.message
    });
  }
};