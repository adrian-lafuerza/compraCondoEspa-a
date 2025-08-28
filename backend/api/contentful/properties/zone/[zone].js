const axios = require('axios');

// Función para normalizar tipos de operación
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

// Validar configuración
if (!CONTENTFUL_SPACE_ID || !CONTENTFUL_ACCESS_TOKEN) {
  console.error('❌ ERROR: Debes configurar CONTENTFUL_SPACE_ID y CONTENTFUL_ACCESS_TOKEN en .env');
}

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
    res.status(200).end();
    return;
  }

  // Solo permitir GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const { zone } = req.query;

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

    const mappedZone = zoneMapping[zone];

    if (!mappedZone) {
      return res.status(400).json({
        success: false,
        error: 'Zona no válida',
        message: 'Las zonas válidas son: barcelona, costa-del-sol, costa-blanca, inversion, preconstruccion'
      });
    }

    // Determinar si es una búsqueda por newProperty o propertyZone
    const isNewPropertySearch = zone === 'inversion' || zone === 'preconstruccion';
    const filterField = isNewPropertySearch ? 'fields.newProperty' : 'fields.propertyZone';

    // Hacer la solicitud a Contentful con filtro dinámico
    const response = await axios.get(`${CONTENTFUL_BASE_URL}/entries`, {
      params: {
        access_token: CONTENTFUL_ACCESS_TOKEN,
        content_type: 'properties',
        limit: req.query.limit || 100,
        skip: req.query.skip || 0,
        order: req.query.order || '-sys.createdAt',
        include: 2, // Incluir assets relacionados (imágenes)
        [filterField]: mappedZone
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
        total: properties.length,
        totalInContentful: response.data.total,
        limit: response.data.limit,
        skip: response.data.skip,
        zone: mappedZone
      },
      message: `Se obtuvieron ${properties.length} propiedades de ${mappedZone} desde Contentful`
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

    return res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      message: error.message
    });
  }
}