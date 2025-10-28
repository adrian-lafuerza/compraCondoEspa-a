const axios = require('axios');
const { handleCors } = require('../../src/utils/corsHandler');

// Configuración de Contentful
const CONTENTFUL_SPACE_ID = process.env.CONTENTFUL_SPACE_ID;
const CONTENTFUL_ACCESS_TOKEN = process.env.CONTENTFUL_ACCESS_TOKEN;
const CONTENTFUL_BASE_URL = `https://cdn.contentful.com/spaces/${CONTENTFUL_SPACE_ID}`;

module.exports = async (req, res) => {
  // Manejar CORS
  if (!handleCors(req, res)) {
    return; // Ya respondió o bloqueó la request
  }

  // Solo permitir GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

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
      let video = [];
      if (item.fields.backgroundImage && Array.isArray(item.fields.backgroundImage)) {
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

      if (item.fields.video && Array.isArray(item.fields.video)) {
        video = item.fields.video.map(videoRef => {
          // Buscar el asset en los includes
          const asset = response.data.includes?.Asset?.find(asset => asset.sys.id === videoRef.sys.id);
          return {
            url: asset?.fields?.file?.url ? `https:${asset.fields.file.url}` : null,
            title: asset?.fields?.title,
            description: asset?.fields?.description,
            width: asset?.fields?.file?.details?.image?.width,
            height: asset?.fields?.file?.details?.image?.height,
            size: asset?.fields?.file?.details?.size
          };
        }).filter(video => video.url); // Filtrar videos sin URL
      } else if (item.fields.video && item.fields.video.sys) {
        // Si es un solo video en lugar de array
        const asset = response.data.includes?.Asset?.find(asset => asset.sys.id === item.fields.video.sys.id);
        if (asset) {
          video = [{
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

    return res.status(200).json({
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
        message: 'El content type "stories" no existe en Contentful'
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