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

// Variables de entorno para Contentful
const CONTENTFUL_SPACE_ID = process.env.CONTENTFUL_SPACE_ID;
const CONTENTFUL_ACCESS_TOKEN = process.env.CONTENTFUL_ACCESS_TOKEN;

// Configuración de CORS
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization'
};

module.exports = async function handler(req, res) {
  // Configurar headers CORS
  Object.keys(corsHeaders).forEach(key => {
    res.setHeader(key, corsHeaders[key]);
  });

  // Manejar solicitudes OPTIONS (preflight)
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Solo permitir método GET
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Método no permitido' });
    return;
  }

  try {
    // Validar variables de entorno
    if (!CONTENTFUL_SPACE_ID || !CONTENTFUL_ACCESS_TOKEN) {
      console.error('Variables de entorno de Contentful no configuradas');
      res.status(500).json({ error: 'Error de configuración del servidor' });
      return;
    }

    const { newProperty, location } = req.query;

    // Validar parámetro newProperty
    if (!newProperty || !['inversion', 'preconstruccion'].includes(newProperty)) {
      res.status(400).json({
        error: 'newProperty no válido',
        validValues: ['inversion', 'preconstruccion']
      });
      return;
    }

    // Construir la URL de la API de Contentful
    const contentfulUrl = `https://cdn.contentful.com/spaces/${CONTENTFUL_SPACE_ID}/entries`;

    // Mapear valores
    const newPropertyMapping = {
      'inversion': 'Inversion',
      'preconstruccion': 'Preconstruccion'
    };

    const mappedNewProperty = newPropertyMapping[newProperty.toLowerCase()];
    const mappedLocation = location ? locationMapping[location.toLowerCase()] : null;

    const params = {
      access_token: CONTENTFUL_ACCESS_TOKEN,
      content_type: 'properties',
      'fields.newProperty': mappedNewProperty,
      include: 2
    };

    console.log('Consultando Contentful con parámetros:', params);

    // Realizar la solicitud a Contentful
    const response = await axios.get(contentfulUrl, { params });

    const properties = response.data.items.map(item => {
      return {
        propertyId: item.fields.propertyId || item.sys.id,
        title: item.fields.title,
        reference: 'ex-' + (item.sys.id ? item.sys.id.slice(-4) : ''),
        descriptions: [item.fields.description] || [],
        currency: item.fields.currency || 'EUR',
        address: {
          streetName: item.fields.address || 'Dirección no disponible'
        },
        features: {
          areaConstructed: item.fields.areaConstructed || 0,
          energyCertificateRating: item.fields.energyCertificateRating || 0,
          rooms: item.fields.rooms || 0,
          bathroomNumber: item.fields.bathroomNumber || 0
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
        propertyType: item.fields.propertyType || 'Apartamento',
        propertyZone: item.fields.propertyZone || '',
        newProperty: item.fields.newProperty || '',
        operation: {
          type: normalizeOperationType(item.fields.operationType) || 'sell',
          price: item.fields.price || 0,
          features: item.fields.operationFeatures || []
        },
        state: item.fields.state || 'Activo',
        isActive: item.fields.isActive !== false,
        createdAt: item.sys.createdAt,
        updatedAt: item.sys.updatedAt
      };
    });

    console.log(`Propiedades encontradas para ${newProperty}:`, properties.length);

    res.status(200).json({
      success: true,
      data: {
        properties: properties,
        total: response.data.total,
        limit: response.data.limit,
        skip: response.data.skip,
        filters: {
          newProperty: mappedNewProperty,
          location: mappedLocation
        }
      },
      message: `Se obtuvieron ${properties.length} propiedades desde Contentful`
    });

  } catch (error) {
    console.error('Error al obtener propiedades de Contentful:', error.message);

    if (error.response) {
      console.error('Respuesta de error de Contentful:', error.response.data);
      res.status(error.response.status).json({
        error: 'Error en la respuesta de Contentful',
        details: error.response.data
      });
    } else if (error.request) {
      console.error('Error de red:', error.request);
      res.status(503).json({ error: 'Error de conexión con Contentful' });
    } else {
      console.error('Error general:', error.message);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }
};