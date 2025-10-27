const FTP = require('ftp');
const fs = require('fs');
const fsPromises = require('fs').promises;
const path = require('path');
const xml2js = require('xml2js');
const IdealistaDataParser = require('../utils/idealistaDataParser');

/**
 * Servicio para conectar y descargar archivos de Idealista vía FTP
 * Reemplaza la funcionalidad de la API de Idealista
 */
class IdealistaFtpService {
    constructor() {
        this.ftpConfig = {
            host: process.env.IDEALISTA_FTP_HOST || 'ftp.habitania.com',
            user: process.env.IDEALISTA_FTP_USER || 'es1',
            password: process.env.IDEALISTA_FTP_PASSWORD || 'J7M',
            port: process.env.IDEALISTA_FTP_PORT || 21,
            connTimeout: 60000,
            pasvTimeout: 60000,
            keepalive: 60000
        };

        this.localDataPath = path.join(__dirname, '../../data/idealista');
        this.cache = new Map();
        this.cacheExpiry = 24 * 60 * 60 * 1000; // 24 horas en milisegundos
        this.parser = new IdealistaDataParser();
        
        // Variables para el archivo actual
        this.currentDataFile = null;
        this.lastDownloadDate = null;
        this.propertiesCache = null;
        this.cacheTimestamp = null;
        
        this.initializeLocalDirectory();
        this.initializeCurrentFile();
    }

    /**
     * Inicializa los directorios necesarios
     */
    async initializeLocalDirectory() {
        try {
            await fsPromises.mkdir(this.localDataPath, { recursive: true });
        } catch (error) {
            console.error('Error inicializando directorio:', error);
        }
    }

    /**
     * Inicializa el archivo actual buscando archivos locales existentes
     */
    async initializeCurrentFile() {
        try {
            const localFiles = await this.getLocalFiles();
            if (localFiles.length > 0) {
                // Usar el archivo más reciente
                const latestFile = localFiles[0]; // getLocalFiles ya debería ordenar por fecha
                this.currentDataFile = path.join(this.localDataPath, latestFile);
            }
        } catch (error) {
            console.error('Error inicializando archivo actual:', error);
        }
    }

    /**
     * Descarga y procesa el archivo más reciente
     */
    async downloadAndProcessLatestFile() {
        try {
            const filePath = await this.downloadLatestFile();
            
            let rawData;
            const fileExtension = path.extname(filePath).toLowerCase();
            
            if (fileExtension === '.xml') {
                rawData = await this.parseXmlFile(filePath);
            } else if (fileExtension === '.json') {
                rawData = await this.parseJsonFile(filePath);
            } else {
                throw new Error(`Formato de archivo no soportado: ${fileExtension}`);
            }

            return this.normalizePropertyData(rawData);
        } catch (error) {
            console.error('Error descargando y procesando archivo:', error);
            return null;
        }
    }

    /**
     * Carga el último archivo local disponible
     */
    async loadLatestLocalFile() {
        try {
            const files = await fsPromises.readdir(this.localDataPath);
            const dataFiles = files.filter(file => 
                file.toLowerCase().endsWith('.xml') || 
                file.toLowerCase().endsWith('.json')
            );

            if (dataFiles.length === 0) {
                return null;
            }

            // Obtener el archivo más reciente
            const latestFile = dataFiles[dataFiles.length - 1];
            const filePath = path.join(this.localDataPath, latestFile);
            
            let rawData;
            const fileExtension = path.extname(filePath).toLowerCase();
            
            if (fileExtension === '.xml') {
                rawData = await this.parseXmlFile(filePath);
            } else if (fileExtension === '.json') {
                rawData = await this.parseJsonFile(filePath);
            }

            return this.normalizePropertyData(rawData);
        } catch (error) {
            console.error('Error cargando archivo local:', error);
            return null;
        }
    }

    /**
     * Conecta al servidor FTP
     */
    async connectFtp() {
        return new Promise((resolve, reject) => {
            const client = new FTP();
            
            client.on('ready', () => {
                console.log('✅ Conectado al servidor FTP de Idealista');
                resolve(client);
            });

            client.on('error', (err) => {
                console.error('❌ Error de conexión FTP:', err);
                reject(err);
            });

            client.connect(this.ftpConfig);
        });
    }

    /**
     * Lista archivos disponibles en el servidor FTP
     */
    async listFiles() {
        const client = await this.connectFtp();
        
        return new Promise((resolve, reject) => {
            client.list((err, list) => {
                if (err) {
                    client.end();
                    reject(err);
                    return;
                }

                // Filtrar archivos XML y JSON
                const dataFiles = list.filter(file => 
                    file.type === '-' && 
                    (file.name.toLowerCase().endsWith('.xml') || 
                     file.name.toLowerCase().endsWith('.json'))
                );

                client.end();
                resolve(dataFiles);
            });
        });
    }

    /**
     * Descarga el archivo más reciente del FTP
     */
    async downloadLatestFile() {
        try {
            console.log('🔍 Buscando archivos en el servidor FTP...');
            const files = await this.listFiles();
            
            if (files.length === 0) {
                throw new Error('No se encontraron archivos XML/JSON en el servidor FTP');
            }

            // Ordenar por fecha de modificación (más reciente primero)
            files.sort((a, b) => new Date(b.date) - new Date(a.date));
            const latestFile = files[0];

            console.log(`📥 Descargando archivo: ${latestFile.name}`);
            
            const client = await this.connectFtp();
            const localFilePath = path.join(this.localDataPath, latestFile.name);

            return new Promise((resolve, reject) => {
                client.get(latestFile.name, (err, stream) => {
                    if (err) {
                        client.end();
                        reject(err);
                        return;
                    }

                    const writeStream = require('fs').createWriteStream(localFilePath);
                    
                    stream.on('close', () => {
                        client.end();
                        this.currentDataFile = localFilePath;
                        this.lastDownloadDate = new Date();
                        console.log(`✅ Archivo descargado: ${localFilePath}`);
                        resolve(localFilePath);
                    });

                    stream.on('error', (streamErr) => {
                        client.end();
                        reject(streamErr);
                    });

                    stream.pipe(writeStream);
                });
            });

        } catch (error) {
            console.error('Error descargando archivo:', error);
            throw error;
        }
    }

    /**
     * Procesa archivo XML descargado
     */
    async parseXmlFile(filePath) {
        try {
            const xmlData = fs.readFileSync(filePath, 'utf8');
            
            const xmlParser = new xml2js.Parser({ 
                explicitArray: true,
                mergeAttrs: true,
                normalize: true,
                normalizeTags: true,
                trim: true
            });
            const result = await xmlParser.parseStringPromise(xmlData);
            
            // Solo devolver el resultado del XML parser, no procesarlo aquí
            return result;
        } catch (error) {
            console.error('Error procesando archivo XML:', error);
            throw error;
        }
    }

    /**
     * Procesa archivo JSON descargado
     */
    async parseJsonFile(filePath) {
        try {
            const jsonData = fs.readFileSync(filePath, 'utf8');
            const data = JSON.parse(jsonData);
            
            // Solo devolver los datos parseados, no procesarlos aquí
            return data;
        } catch (error) {
            console.error('Error procesando archivo JSON:', error);
            throw error;
        }
    }

    /**
     * Normaliza los datos de propiedades al formato esperado por el frontend
     */
    normalizePropertyData(rawData) {
        // Esta función adaptará los datos del XML/JSON al formato que espera el frontend
        // Necesitaremos ver la estructura real del archivo para implementar esto correctamente
        
        if (!rawData) return [];

        // Placeholder - se implementará según la estructura real del archivo
        console.log('🔄 Normalizando datos de propiedades...');
        
        // Ejemplo de estructura esperada:
        return {
            properties: [],
            total: 0,
            totalPages: 1,
            actualPage: 1,
            itemsPerPage: 50,
            lastUpdated: new Date().toISOString()
        };
    }

    /**
     * Obtiene la lista de archivos locales
     */
    async getLocalFiles() {
        try {
            const files = await fsPromises.readdir(this.localDataPath);
            return files.filter(file => file.endsWith('.xml') || file.endsWith('.json'));
        } catch (error) {
            console.error('Error obteniendo archivos locales:', error);
            return [];
        }
    }

    /**
     * Obtiene todas las propiedades (método principal)
     */
    async getProperties(options = {}) {
        try {
            // Si no tenemos archivo local, intentar descargar
            if (!this.currentDataFile) {
                try {
                    await this.downloadLatestFile();
                } catch (downloadError) {
                    console.error('❌ Error descargando archivo:', downloadError.message);
                    // Si falla la descarga pero tenemos archivos locales, usar el más reciente
                    await this.initializeCurrentFile();
                }
            }

            // Verificar si tenemos datos en caché y son recientes
            // Temporalmente deshabilitado para forzar reprocesamiento después de corrección de precios
            if (false && this.propertiesCache && this.cacheTimestamp && 
                (Date.now() - this.cacheTimestamp) < 60 * 60 * 1000) { // 1 hora
                return this.propertiesCache;
            }

            // Procesar el archivo
            let rawData;
            const fileExtension = path.extname(this.currentDataFile).toLowerCase();
            
            if (fileExtension === '.xml') {
                rawData = await this.parseXmlFile(this.currentDataFile);
            } else if (fileExtension === '.json') {
                rawData = await this.parseJsonFile(this.currentDataFile);
            } else {
                throw new Error(`Formato de archivo no soportado: ${fileExtension}`);
            }

            // Procesar los datos crudos con parseProperties
            let normalizedData = this.parser.parseProperties(rawData);

            // Aplicar filtros si se proporcionan
            if (options && Object.keys(options).length > 0) {
                normalizedData = this.parser.applyFilters(normalizedData, options);
            }
            
            // Actualizar caché
            this.propertiesCache = normalizedData;
            this.cacheTimestamp = Date.now();
            return normalizedData;

        } catch (error) {
            console.error('Error obteniendo propiedades desde FTP:', error);
            
            // Fallback: devolver datos de ejemplo si hay error
            return {
                properties: [{
                    propertyId: 'ftp-example-1',
                    title: 'Propiedad de ejemplo (FTP)',
                    price: 250000,
                    currency: 'EUR',
                    size: 75,
                    rooms: 2,
                    bathrooms: 1,
                    location: {
                        address: 'Dirección desde FTP no disponible',
                        city: 'Madrid',
                        province: 'Madrid',
                        postalCode: '28001'
                    },
                    description: 'Error conectando con servidor FTP de Idealista. Mostrando datos de ejemplo.',
                    features: [],
                    images: [],
                    propertyType: 'homes',
                    operation: 'sale',
                    energyRating: 'N/A',
                    publishedDate: new Date().toISOString().split('T')[0]
                }],
                total: 1,
                totalPages: 1,
                actualPage: 1,
                itemsPerPage: 50,
                lastUpdated: new Date().toISOString(),
                source: 'fallback-ftp-error'
            };
        }
    }

    /**
     * Obtiene una propiedad específica por ID
     */
    async getPropertyById(propertyId) {
        try {
            const allProperties = await this.getProperties();
            
            if (!allProperties.properties) {
                throw new Error('No hay propiedades disponibles');
            }

            const property = allProperties.properties.find(prop => 
                prop.propertyId === propertyId || 
                prop.propertyId === parseInt(propertyId) ||
                prop.id === propertyId ||
                prop.id === parseInt(propertyId)
            );

            if (!property) {
                throw new Error(`Propiedad con ID ${propertyId} no encontrada`);
            }

            return property;
        } catch (error) {
            console.error(`Error obteniendo propiedad ${propertyId}:`, error);
            throw error;
        }
    }

    /**
     * Obtiene información del estado del servicio
     */
    getServiceStatus() {
        return {
            currentDataFile: this.currentDataFile,
            lastDownloadDate: this.lastDownloadDate,
            cacheTimestamp: this.cacheTimestamp,
            propertiesInCache: this.propertiesCache?.properties?.length || 0,
            ftpHost: this.ftpConfig.host,
            ftpUser: this.ftpConfig.user
        };
    }

    /**
     * Fuerza la descarga de un nuevo archivo
     */
    async forceRefresh() {
        this.propertiesCache = null;
        this.cacheTimestamp = null;
        await this.downloadLatestFile();
        return await this.getProperties();
    }
}

module.exports = IdealistaFtpService;