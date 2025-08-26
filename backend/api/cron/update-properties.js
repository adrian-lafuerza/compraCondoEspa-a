const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');

// Configuración CORS
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Función para obtener token de Idealista (igual que properties.js)
const getIdealistaToken = async () => {
    try {
        const credentials = {
            apikey: process.env.IDEALISTA_CLIENT_ID,
            secret: process.env.IDEALISTA_CLIENT_SECRET
        };

        if (!credentials.apikey || !credentials.secret) {
            throw new Error('Credenciales de Idealista no configuradas');
        }

        const isSandbox = process.env.IDEALISTA_ENVIRONMENT !== 'production';
        const baseUrl = isSandbox
            ? 'https://partners-sandbox.idealista.com/'
            : 'https://partners.idealista.com/';

        const response = await axios.post(`${baseUrl}oauth/token`, 
            'grant_type=client_credentials&scope=read',
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': `Basic ${Buffer.from(`${credentials.apikey}:${credentials.secret}`).toString('base64')}`
                }
            }
        );

        return response.data.access_token;
    } catch (error) {
        console.error('Error obteniendo token de Idealista:', error.message);
        throw error;
    }
};

// Función para obtener headers de API
const getApiHeaders = async () => {
    const token = await getIdealistaToken();

    return {
        feedKey: process.env.IDEALISTA_FEED_KEY,
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        Accept: 'application/json'
    };
};

// Función para obtener imágenes de una propiedad
const getPropertyImages = async (propertyId) => {
    try {
        if (!propertyId) {
            return [];
        }

        const isSandbox = process.env.IDEALISTA_ENVIRONMENT !== 'production';
        const baseUrl = isSandbox
            ? 'https://partners-sandbox.idealista.com/'
            : 'https://partners.idealista.com/';

        const headers = await getApiHeaders();
        const endpoint = `v1/properties/${propertyId}/images`;
        const fullUrl = `${baseUrl}${endpoint}`;

        const response = await axios.get(fullUrl, { headers });

        if (response.status === 200) {
            return response.data?.images || [];
        } else {
            throw new Error(`Error obteniendo imágenes: ${response.status}`);
        }
    } catch (error) {
        console.error(`Error obteniendo imágenes para propiedad ${propertyId}:`, error.message);
        return [];
    }
};

// Función para obtener datos de Idealista (usando la misma lógica que properties.js)
async function fetchIdealistaData() {
  try {
    console.log('🔄 Iniciando descarga de datos de Idealista...');
    
    const searchParams = {
        page: 1,
        size: 100,
        state: 'active'
    };
    
    const isSandbox = process.env.IDEALISTA_ENVIRONMENT !== 'production';
    const baseUrl = isSandbox
        ? 'https://partners-sandbox.idealista.com/'
        : 'https://partners.idealista.com/';

    const headers = await getApiHeaders();
    const endpoint = 'v1/properties';
    const queryString = new URLSearchParams(searchParams).toString();
    const fullUrl = `${baseUrl}${endpoint}?${queryString}`;

    const response = await axios.get(fullUrl, { headers });

    if (response.status === 200) {
        // Enriquecer propiedades con imágenes
        if (response.data && response.data.properties) {
            console.log(`📊 Obtenidas ${response.data.properties.length} propiedades, descargando imágenes...`);
            
            const enrichedProperties = await Promise.all(
                response.data.properties.map(async (property) => {
                    const images = await getPropertyImages(property.propertyId);
                    return {
                        ...property,
                        images: images || []
                    };
                })
            );
            
            const enrichedData = {
                ...response.data,
                properties: enrichedProperties
            };
            
            console.log(`✅ Datos obtenidos: ${enrichedData.properties.length} propiedades con imágenes`);
            return enrichedData;
        }
        
        console.log(`✅ Datos obtenidos: ${response.data.properties?.length || 0} propiedades`);
        return response.data;
    } else {
        throw new Error(`Error buscando propiedades: ${response.status}`);
    }
  } catch (error) {
    console.error('❌ Error al obtener datos de Idealista:', error.message);
    throw error;
  }
}

// Función para guardar datos usando variable de entorno (compatible con serverless)
async function saveDataToEnvironment(data) {
  try {
    // Preparar datos con timestamp
    const dataToSave = {
      lastUpdated: new Date().toISOString(),
      totalProperties: data.properties?.length || 0,
      properties: data.properties || [],
      summary: data.summary || {},
      metadata: {
        source: 'idealista-api',
        generatedAt: new Date().toISOString(),
        version: '1.0'
      }
    };
    
    // En un entorno serverless, podríamos usar una base de datos externa
    // Por ahora, guardamos en memoria global para esta sesión
    global.propertiesCache = dataToSave;
    
    // Almacenar versión rápida con imágenes (mismos datos que la versión completa)
    global.propertiesCacheFast = {
      ...dataToSave,
      properties: data.properties || [],
      metadata: {
        ...dataToSave.metadata,
        cacheType: 'memory-fast'
      }
    };
    
    console.log(`💾 Datos guardados en memoria global`);
    console.log(`📊 Total propiedades guardadas: ${dataToSave.totalProperties} (completas + rápidas)`);
    
    return 'memory-cache';
  } catch (error) {
    console.error('❌ Error al guardar datos:', error.message);
    throw error;
  }
}

// Handler principal del cron job
module.exports = async (req, res) => {
  // Configurar CORS
  Object.entries(corsHeaders).forEach(([key, value]) => {
    res.setHeader(key, value);
  });

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    console.log('🚀 Cron job iniciado:', new Date().toISOString());
    
    // Verificar que sea una llamada de cron o manual
    const isCronCall = req.headers['user-agent']?.includes('vercel-cron') || req.query.manual === 'true';
    
    if (!isCronCall && req.method !== 'GET') {
      return res.status(405).json({
        success: false,
        message: 'Método no permitido. Use GET para ejecución manual.'
      });
    }

    // Obtener datos de Idealista
    const idealistaData = await fetchIdealistaData();
    
    // Guardar en memoria global
    const storageLocation = await saveDataToEnvironment(idealistaData);
    
    const result = {
      success: true,
      message: 'Datos actualizados correctamente',
      timestamp: new Date().toISOString(),
      propertiesCount: idealistaData.properties?.length || 0,
      storageLocation: storageLocation,
      executionType: isCronCall ? 'cron' : 'manual'
    };
    
    console.log('✅ Cron job completado exitosamente');
    return res.status(200).json(result);
    
  } catch (error) {
    console.error('❌ Error en cron job:', error);
    
    const errorResult = {
      success: false,
      message: 'Error al actualizar datos',
      error: error.message,
      timestamp: new Date().toISOString()
    };
    
    return res.status(500).json(errorResult);
  }
};