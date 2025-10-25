const axios = require('axios');
const { handleCors } = require('../../src/utils/corsHandler');

// Función para normalizar el tipo de operación
const normalizeOperationType = (operationType) => {
  if (!operationType) return 'sell';
  
  const type = operationType.toLowerCase();
  
  // Mapear valores de Contentful a valores estándar
  const operationMap = {
    'venta': 'sell',
    'alquiler': 'rent',
    'sell': 'sell',
    'rent': 'rent',
    'sale': 'sell'
  };
  
  return operationMap[type] || 'sell';
};

// Configuración de Contentful
const CONTENTFUL_SPACE_ID = process.env.CONTENTFUL_SPACE_ID;
const CONTENTFUL_ACCESS_TOKEN = process.env.CONTENTFUL_ACCESS_TOKEN;
const CONTENTFUL_BASE_URL = `https://cdn.contentful.com/spaces/${CONTENTFUL_SPACE_ID}`;

module.exports = async function handler(req, res) {
  // Manejar CORS
  if (!handleCors(req, res)) {
    return; // Ya respondió o bloqueó la request
  }

  // Solo permitir GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

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
          type: normalizeOperationType(item.fields.operationType) || 'sell',
          price: item.fields.price,
          features: item.fields.features,
        },
        state: item.fields.status || 'active',
        isActive: item.fields.isActive !== false, // Por defecto true
        createdAt: item.sys.createdAt,
        updatedAt: item.sys.updatedAt
      };
    });

    return res.status(200).json({
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
        message: 'El content type "properties" no existe en Contentful'
      });
    }

    if (error.response?.status === 401) {
      return res.status(401).json({
        success: false,
        error: 'Token de acceso inválido',
        message: 'Verifica tu CONTENTFUL_ACCESS_TOKEN'
      });
    }

    return res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      message: error.message
    });
  }
}