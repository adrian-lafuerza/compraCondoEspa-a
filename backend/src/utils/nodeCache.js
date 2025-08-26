const NodeCache = require('node-cache');

// Configuración de Node Cache
class MemoryCache {
    constructor() {
        // Crear instancias de caché con diferentes TTL
        this.propertiesCache = new NodeCache({ 
            stdTTL: 1800, // 30 minutos
            checkperiod: 600, // Verificar cada 10 minutos
            useClones: false // Mejor rendimiento
        });
        
        this.imagesCache = new NodeCache({ 
            stdTTL: 3600, // 1 hora
            checkperiod: 600,
            useClones: false
        });
        
        this.mailchimpCache = new NodeCache({ 
            stdTTL: 1800, // 30 minutos
            checkperiod: 600,
            useClones: false
        });
        
        this.isConnected = true; // Siempre disponible
        console.log('✅ Caché en memoria inicializado correctamente');
        
        // Eventos para monitoreo
        this.propertiesCache.on('set', (key, value) => {
            // Propiedades guardadas en caché
        });
        
        this.imagesCache.on('set', (key, value) => {
            // Imágenes guardadas en caché
        });
        
        this.propertiesCache.on('expired', (key, value) => {
            console.log(`⏰ Caché de propiedades expirado: ${key}`);
        });
        
        this.imagesCache.on('expired', (key, value) => {
            console.log(`⏰ Caché de imágenes expirado: ${key}`);
        });
        
        this.mailchimpCache.on('expired', (key, value) => {
            console.log(`⏰ Caché de Mailchimp expirado: ${key}`);
        });
    }

    // Obtener datos del caché
    async get(key) {
        try {
            if (key.startsWith('properties:')) {
                const data = this.propertiesCache.get(key);
                if (data) {
                    // Propiedades obtenidas del caché
                }
                return data;
            } else if (key.startsWith('images:')) {
                const data = this.imagesCache.get(key);
                if (data) {
                    // Imágenes obtenidas del caché
                }
                return data;
            } else if (key.startsWith('mailchimp:')) {
                const data = this.mailchimpCache.get(key);
                if (data) {
                    console.log(`📦 Datos de Mailchimp obtenidos del caché: ${key}`);
                }
                return data;
            }
            return null;
        } catch (error) {
            console.log('❌ Error al obtener del caché:', error.message);
            return null;
        }
    }

    // Guardar datos en el caché
    async set(key, data, ttlSeconds = null) {
        try {
            if (key.startsWith('properties:')) {
                this.propertiesCache.set(key, data, ttlSeconds || 1800);
            } else if (key.startsWith('images:')) {
                this.imagesCache.set(key, data, ttlSeconds || 3600);
            } else if (key.startsWith('mailchimp:')) {
                this.mailchimpCache.set(key, data, ttlSeconds || 1800);
                console.log(`💾 Datos de Mailchimp guardados en caché: ${key}`);
            }
            return true;
        } catch (error) {
            console.log('❌ Error al guardar en caché:', error.message);
            return false;
        }
    }

    // Eliminar una clave específica
    async del(key) {
        try {
            if (key.startsWith('properties:')) {
                return this.propertiesCache.del(key) > 0;
            } else if (key.startsWith('images:')) {
                return this.imagesCache.del(key) > 0;
            } else if (key.startsWith('mailchimp:')) {
                return this.mailchimpCache.del(key) > 0;
            }
            return false;
        } catch (error) {
            console.log('❌ Error al eliminar del caché:', error.message);
            return false;
        }
    }

    // Limpiar todo el caché
    async flush() {
        try {
            this.propertiesCache.flushAll();
            this.imagesCache.flushAll();
            this.mailchimpCache.flushAll();
            console.log('🧹 Caché completamente limpiado');
            return true;
        } catch (error) {
            console.log('❌ Error al limpiar caché:', error.message);
            return false;
        }
    }

    // Verificar si existe una clave
    async exists(key) {
        try {
            if (key.startsWith('properties:')) {
                return this.propertiesCache.has(key);
            } else if (key.startsWith('images:')) {
                return this.imagesCache.has(key);
            } else if (key.startsWith('mailchimp:')) {
                return this.mailchimpCache.has(key);
            }
            return false;
        } catch (error) {
            return false;
        }
    }

    // Obtener TTL de una clave
    async ttl(key) {
        try {
            if (key.startsWith('properties:')) {
                return this.propertiesCache.getTtl(key);
            } else if (key.startsWith('images:')) {
                return this.imagesCache.getTtl(key);
            } else if (key.startsWith('mailchimp:')) {
                return this.mailchimpCache.getTtl(key);
            }
            return -1;
        } catch (error) {
            return -1;
        }
    }

    // Cerrar conexión (no necesario para node-cache)
    async close() {
        this.propertiesCache.close();
        this.imagesCache.close();
        this.mailchimpCache.close();
        console.log('🔌 Caché cerrado');
    }

    // Obtener estadísticas del caché
    async getStats() {
        try {
            const propertiesStats = this.propertiesCache.getStats();
            const imagesStats = this.imagesCache.getStats();
            const mailchimpStats = this.mailchimpCache.getStats();
            
            return {
                connected: this.isConnected,
                properties: {
                    keys: propertiesStats.keys,
                    hits: propertiesStats.hits,
                    misses: propertiesStats.misses,
                    ksize: propertiesStats.ksize,
                    vsize: propertiesStats.vsize
                },
                images: {
                    keys: imagesStats.keys,
                    hits: imagesStats.hits,
                    misses: imagesStats.misses,
                    ksize: imagesStats.ksize,
                    vsize: imagesStats.vsize
                },
                mailchimp: {
                    keys: mailchimpStats.keys,
                    hits: mailchimpStats.hits,
                    misses: mailchimpStats.misses,
                    ksize: mailchimpStats.ksize,
                    vsize: mailchimpStats.vsize
                },
                total_keys: propertiesStats.keys + imagesStats.keys + mailchimpStats.keys,
                total_hits: propertiesStats.hits + imagesStats.hits + mailchimpStats.hits,
                total_misses: propertiesStats.misses + imagesStats.misses + mailchimpStats.misses
            };
        } catch (error) {
            return {
                connected: false,
                error: error.message
            };
        }
    }

    // Limpiar solo caché de propiedades
    async clearProperties() {
        try {
            this.propertiesCache.flushAll();
            console.log('🧹 Caché de propiedades limpiado');
            return true;
        } catch (error) {
            console.log('❌ Error al limpiar caché de propiedades:', error.message);
            return false;
        }
    }

    // Limpiar solo caché de imágenes
    async clearImages() {
        try {
            this.imagesCache.flushAll();
            console.log('🧹 Caché de imágenes limpiado');
            return true;
        } catch (error) {
            console.log('❌ Error al limpiar caché de imágenes:', error.message);
            return false;
        }
    }

    // Limpiar solo caché de Mailchimp
    async clearMailchimp() {
        try {
            this.mailchimpCache.flushAll();
            console.log('🧹 Caché de Mailchimp limpiado');
            return true;
        } catch (error) {
            console.log('❌ Error al limpiar caché de Mailchimp:', error.message);
            return false;
        }
    }
}

// Crear instancia única del caché
const memoryCache = new MemoryCache();

// Definir claves de caché
const CacheKeys = {
    PROPERTIES: 'properties',
    IMAGES: 'images'
};

// Definir TTL (Time To Live) en segundos
const CacheTTL = {
    PROPERTIES: 1800, // 30 minutos
    IMAGES: 3600,     // 1 hora
    PROPERTY_DETAIL: 1800 // 30 minutos
};

module.exports = {
    redisCache: memoryCache, // Mantener el mismo nombre para compatibilidad
    CacheKeys,
    CacheTTL
};