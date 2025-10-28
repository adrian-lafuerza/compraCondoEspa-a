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

    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      message: error.message
    });
  }
};

/**
 * Obtener stories desde Contentful
 */
const getStories = async (req, res) => {
  try {
    console.log('🔍 Obteniendo stories de Contentful...');

    // Verificar configuración
    if (!CONTENTFUL_SPACE_ID || !CONTENTFUL_ACCESS_TOKEN) {
      console.log('⚠️ Contentful no configurado para stories');
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
        content_type: 'stories',
        limit: req.query.limit || 100,
        skip: req.query.skip || 0,
        order: req.query.order || '-sys.createdAt',
        include: 2 // Incluir assets relacionados (imágenes)
      }
    });

    // Procesar datos de stories
    const stories = response.data.items.map(item => {
      // Procesar imágenes
      let backgroundImage = [];
      if (item.fields.images && Array.isArray(item.fields.images)) {
        backgroundImage = item.fields.backgroundImage.map(imgRef => {
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
        }).filter(img => img.url); // Filtrar imágenes sin URL
      } else if (item.fields.backgroundImage && item.fields.backgroundImage.sys) {
        // Si es una sola imagen en lugar de array
        const asset = response.data.includes?.Asset?.find(asset => asset.sys.id === item.fields.backgroundImage.sys.id);
        if (asset) {
          backgroundImage = [{
            url: asset?.fields?.file?.url ? `https:${asset.fields.file.url}` : null,
            title: asset?.fields?.title,
            description: asset?.fields?.description,
            width: asset?.fields?.file?.details?.image?.width,
            height: asset?.fields?.file?.details?.image?.height,
            size: asset?.fields?.file?.details?.size
          }];
        }
      }

      return {
        id: item.sys.id,
        name: item.fields.name || '',
        positionJob: item.fields.positionJob || '',
        backgroundImage: backgroundImage[0]?.url,
        video: item.fields.video || '',
        createdAt: item.sys.createdAt,
        updatedAt: item.sys.updatedAt
      };
    });

    console.log(`✅ Encontradas ${stories.length} stories`);

    res.json({
      success: true,
      data: {
        stories: stories,
        total: response.data.total,
        limit: response.data.limit,
        skip: response.data.skip
      },
      message: `Se obtuvieron ${stories.length} stories desde Contentful`
    });

  } catch (error) {
    console.error('❌ Error al obtener stories desde Contentful:', error.message);

    // Manejo específico de errores
    if (error.response?.status === 404) {
      return res.status(404).json({
        success: false,
        error: 'Content type no encontrado',
        message: 'El content type "story" no existe en Contentful'
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

// Obtener propiedades filtradas por newProperty y localidad
const getPropertiesByNewPropertyAndLocation = async (req, res) => {
  try {
    const { newProperty, location } = req.params;

    // Validar parámetros requeridos
    if (!newProperty) {
      return res.status(400).json({
        success: false,
        error: 'newProperty requerido',
        message: 'Debe proporcionar un valor de newProperty (Inversión o Preconstrucción)'
      });
    }

    // Validar valores permitidos para newProperty
    const allowedNewProperties = ['inversion', 'preconstruccion'];
    if (!allowedNewProperties.includes(newProperty.toLowerCase())) {
      return res.status(400).json({
        success: false,
        error: 'newProperty no válido',
        message: 'Los valores válidos para newProperty son: inversion, preconstruccion'
      });
    }

    // Mapear valores
    const newPropertyMapping = {
      'inversion': 'Inversion',
      'preconstruccion': 'Preconstruccion'
    };

    const locationMapping = {
      'costa-blanca': 'Costa Blanca',
      'costa-del-sol': 'Costa del Sol',
      'madrid': 'Madrid',
      'barcelona': 'Barcelona'
    };

    const mappedNewProperty = newPropertyMapping[newProperty.toLowerCase()];
    const mappedLocation = location ? locationMapping[location.toLowerCase()] : null;

    // Construir parámetros de filtro
    const filterParams = {
      access_token: CONTENTFUL_ACCESS_TOKEN,
      content_type: 'properties',
      limit: req.query.limit || 100,
      skip: req.query.skip || 0,
      order: req.query.order || '-sys.createdAt',
      include: 2,
      'fields.newProperty': mappedNewProperty
    };

    // Agregar filtro de localidad si se proporciona
    if (mappedLocation) {
      filterParams['fields.propertyZone'] = mappedLocation;
    }

    // Hacer la solicitud a Contentful
    const response = await axios.get(`${CONTENTFUL_BASE_URL}/entries`, {
      params: filterParams
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

    console.log(`✅ Encontradas ${properties.length} propiedades para newProperty: ${mappedNewProperty}${mappedLocation ? ` y localidad: ${mappedLocation}` : ''}`);

    res.json({
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
    console.error('❌ Error al obtener propiedades por newProperty y localidad:', error.message);

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

    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      message: error.message
    });
  }
};

/**
 * Obtener una propiedad específica por ID desde Contentful
 */
const getPropertyById = async (req, res) => {
  try {
    const { propertyId } = req.params;

    // Validar que se proporcione el ID
    if (!propertyId) {
      return res.status(400).json({
        success: false,
        error: 'ID de propiedad requerido',
        message: 'Debe proporcionar un ID de propiedad'
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

    // Realizar petición a Contentful para obtener la entrada específica
    const response = await axios.get(`${CONTENTFUL_BASE_URL}/entries/${propertyId}`, {
      params: {
        access_token: CONTENTFUL_ACCESS_TOKEN,
        include: 2 // Incluir assets relacionados (imágenes)
      }
    });

    const item = response.data;

    console.log(response);
    

    // Verificar que sea del content type correcto
    if (item.sys.contentType.sys.id !== 'properties') {
      return res.status(404).json({
        success: false,
        error: 'Propiedad no encontrada',
        message: `La entrada con ID ${propertyId} no es una propiedad`
      });
    }

    // Procesar la propiedad
    const property = {
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
      images: await resolveImages(item.fields.images, response.data.includes),
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

    res.json({
      success: true,
      data: property,
      message: `Propiedad ${propertyId} obtenida desde Contentful`
    });

  } catch (error) {
    console.error(`❌ Error al obtener propiedad ${req.params.propertyId} desde Contentful:`, error.message);

    // Manejo específico de errores
    if (error.response?.status === 404) {
      return res.status(404).json({
        success: false,
        error: 'Propiedad no encontrada',
        message: `La propiedad con ID ${req.params.propertyId} no existe en Contentful`
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
  getProperties,
  getPropertiesByZone,
  getPropertiesByNewPropertyAndLocation,
  getStories,
  getPropertyById
};