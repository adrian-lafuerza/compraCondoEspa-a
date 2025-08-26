const { redisCache, CacheKeys, CacheTTL } = require('./nodeCache');

/**
 * CacheManager - Clase unificada para manejo de caché
 * Proporciona una interfaz simplificada y consistente para operaciones de caché
 * Compatible con la implementación anterior de node-cache
 */
class CacheManager {
    constructor() {
        this.cache = redisCache;
        this.keys = CacheKeys;
        this.ttl = CacheTTL;
    }

    /**
     * Generar clave de caché para propiedades
     * @param {Object} params - Parámetros de búsqueda
     * @returns {string} Clave de caché
     */
    generatePropertiesKey(params = {}) {
        const { page = 1, size = 20, state = '', location = '', propertyType = '' } = params;
        const keyParts = [
            this.keys.PROPERTIES,
            `page:${page}`,
            `size:${size}`,
            state && `state:${state}`,
            location && `location:${location}`,
            propertyType && `type:${propertyType}`
        ].filter(Boolean);
        
        return keyParts.join(':');
    }

    /**
     * Generar clave de caché para imágenes de propiedad
     * @param {string} propertyId - ID de la propiedad
     * @returns {string} Clave de caché
     */
    generateImagesKey(propertyId) {
        return `${this.keys.IMAGES}:${propertyId}`;
    }

    /**
     * Obtener propiedades del caché
     * @param {Object} params - Parámetros de búsqueda
     * @returns {Promise<Object|null>} Datos de propiedades o null
     */
    async getProperties(params = {}) {
        try {
            const key = this.generatePropertiesKey(params);
            
            // Implementar timeout para evitar bloqueos
            const cachePromise = this.cache.get(key);
            const timeoutPromise = new Promise((resolve) => 
                setTimeout(() => {
                    console.log('⚠️ Cache timeout, continuando sin caché');
                    resolve(null);
                }, 3000)
            );
            
            const data = await Promise.race([cachePromise, timeoutPromise]);
            
            if (data) {
                console.log(`📦 Propiedades obtenidas del caché: ${key}`);
                return data;
            }
            
            return null;
        } catch (error) {
            console.log('⚠️ Error al obtener propiedades del caché, continuando sin caché:', error.message);
            return null;
        }
    }

    /**
     * Guardar propiedades en el caché
     * @param {Object} params - Parámetros de búsqueda
     * @param {Object} data - Datos de propiedades
     * @param {number} ttlSeconds - TTL personalizado (opcional)
     * @returns {Promise<boolean>} Éxito de la operación
     */
    async setProperties(params = {}, data, ttlSeconds = null) {
        try {
            const key = this.generatePropertiesKey(params);
            const ttl = ttlSeconds || this.ttl.PROPERTIES;
            
            // Implementar timeout para evitar bloqueos
            const cachePromise = this.cache.set(key, data, ttl);
            const timeoutPromise = new Promise((resolve) => 
                setTimeout(() => {
                    console.log('⚠️ Cache set timeout, continuando sin guardar en caché');
                    resolve(false);
                }, 3000)
            );
            
            const success = await Promise.race([cachePromise, timeoutPromise]);
            
            if (success) {
                console.log(`💾 Propiedades guardadas en caché: ${key} (TTL: ${ttl}s)`);
            } else {
                console.log('⚠️ No se pudieron guardar propiedades en caché');
            }
            
            return success;
        } catch (error) {
            console.log('⚠️ Error al guardar propiedades en caché, continuando sin caché:', error.message);
            return false;
        }
    }

    /**
     * Obtener imágenes de propiedad del caché
     * @param {string} propertyId - ID de la propiedad
     * @returns {Promise<Array|null>} Array de imágenes o null
     */
    async getPropertyImages(propertyId) {
        try {
            const key = this.generateImagesKey(propertyId);
            const data = await this.cache.get(key);
            
            if (data) {
                console.log(`📦 Imágenes obtenidas del caché: ${propertyId}`);
                return data;
            }
            
            return null;
        } catch (error) {
            console.log('❌ Error al obtener imágenes del caché:', error.message);
            return null;
        }
    }

    /**
     * Guardar imágenes de propiedad en el caché
     * @param {string} propertyId - ID de la propiedad
     * @param {Array} images - Array de imágenes
     * @param {number} ttlSeconds - TTL personalizado (opcional)
     * @returns {Promise<boolean>} Éxito de la operación
     */
    async setPropertyImages(propertyId, images, ttlSeconds = null) {
        try {
            const key = this.generateImagesKey(propertyId);
            const ttl = ttlSeconds || this.ttl.IMAGES;
            
            const success = await this.cache.set(key, images, ttl);
            
            if (success) {
                console.log(`💾 Imágenes guardadas en caché: ${propertyId} (TTL: ${ttl}s)`);
            }
            
            return success;
        } catch (error) {
            console.log('❌ Error al guardar imágenes en caché:', error.message);
            return false;
        }
    }

    /**
     * Eliminar propiedades específicas del caché
     * @param {Object} params - Parámetros de búsqueda
     * @returns {Promise<boolean>} Éxito de la operación
     */
    async deleteProperties(params = {}) {
        try {
            const key = this.generatePropertiesKey(params);
            const success = await this.cache.del(key);
            
            if (success) {
                console.log(`🗑️ Propiedades eliminadas del caché: ${key}`);
            }
            
            return success;
        } catch (error) {
            console.log('❌ Error al eliminar propiedades del caché:', error.message);
            return false;
        }
    }

    /**
     * Eliminar imágenes de propiedad del caché
     * @param {string} propertyId - ID de la propiedad
     * @returns {Promise<boolean>} Éxito de la operación
     */
    async deletePropertyImages(propertyId) {
        try {
            const key = this.generateImagesKey(propertyId);
            const success = await this.cache.del(key);
            
            if (success) {
                console.log(`🗑️ Imágenes eliminadas del caché: ${propertyId}`);
            }
            
            return success;
        } catch (error) {
            console.log('❌ Error al eliminar imágenes del caché:', error.message);
            return false;
        }
    }

    /**
     * Limpiar todo el caché de propiedades
     * @returns {Promise<boolean>} Éxito de la operación
     */
    async clearAllProperties() {
        try {
            const success = await this.cache.clearProperties();
            return success;
        } catch (error) {
            console.log('❌ Error al limpiar caché de propiedades:', error.message);
            return false;
        }
    }

    /**
     * Limpiar todo el caché de imágenes
     * @returns {Promise<boolean>} Éxito de la operación
     */
    async clearAllImages() {
        try {
            const success = await this.cache.clearImages();
            return success;
        } catch (error) {
            console.log('❌ Error al limpiar caché de imágenes:', error.message);
            return false;
        }
    }

    /**
     * Limpiar todo el caché
     * @returns {Promise<boolean>} Éxito de la operación
     */
    async clearAll() {
        try {
            const success = await this.cache.flush();
            return success;
        } catch (error) {
            console.log('❌ Error al limpiar todo el caché:', error.message);
            return false;
        }
    }

    /**
     * Verificar si existen propiedades en caché
     * @param {Object} params - Parámetros de búsqueda
     * @returns {Promise<boolean>} True si existe
     */
    async hasProperties(params = {}) {
        try {
            const key = this.generatePropertiesKey(params);
            return await this.cache.exists(key);
        } catch (error) {
            return false;
        }
    }

    /**
     * Verificar si existen imágenes en caché
     * @param {string} propertyId - ID de la propiedad
     * @returns {Promise<boolean>} True si existe
     */
    async hasPropertyImages(propertyId) {
        try {
            const key = this.generateImagesKey(propertyId);
            return await this.cache.exists(key);
        } catch (error) {
            return false;
        }
    }

    /**
     * Obtener TTL de propiedades
     * @param {Object} params - Parámetros de búsqueda
     * @returns {Promise<number>} TTL en segundos (-1 si no existe)
     */
    async getPropertiesTTL(params = {}) {
        try {
            const key = this.generatePropertiesKey(params);
            return await this.cache.ttl(key);
        } catch (error) {
            return -1;
        }
    }

    /**
     * Obtener TTL de imágenes
     * @param {string} propertyId - ID de la propiedad
     * @returns {Promise<number>} TTL en segundos (-1 si no existe)
     */
    async getImagesTTL(propertyId) {
        try {
            const key = this.generateImagesKey(propertyId);
            return await this.cache.ttl(key);
        } catch (error) {
            return -1;
        }
    }

    /**
     * Obtener estadísticas del caché
     * @returns {Promise<Object>} Estadísticas del caché
     */
    async getStats() {
        try {
            return await this.cache.getStats();
        } catch (error) {
            return {
                connected: false,
                error: error.message
            };
        }
    }

    /**
     * Verificar estado de conexión
     * @returns {boolean} Estado de conexión
     */
    isConnected() {
        return this.cache.isConnected;
    }

    /**
     * Cerrar conexión del caché
     * @returns {Promise<void>}
     */
    async close() {
        try {
            await this.cache.close();
        } catch (error) {
            console.log('❌ Error al cerrar conexión del caché:', error.message);
        }
    }

    /**
     * Método de utilidad para obtener datos con fallback
     * @param {string} key - Clave de caché
     * @param {Function} fetchFunction - Función para obtener datos si no están en caché
     * @param {number} ttlSeconds - TTL personalizado
     * @returns {Promise<any>} Datos obtenidos
     */
    async getOrSet(key, fetchFunction, ttlSeconds = null) {
        try {
            // Intentar obtener del caché primero
            let data = await this.cache.get(key);
            
            if (data) {
                return data;
            }
            
            // Si no está en caché, obtener usando la función
            data = await fetchFunction();
            
            if (data) {
                // Guardar en caché para futuras consultas
                await this.cache.set(key, data, ttlSeconds);
            }
            
            return data;
        } catch (error) {
            console.log('❌ Error en getOrSet:', error.message);
            // En caso de error, intentar obtener directamente
            try {
                return await fetchFunction();
            } catch (fetchError) {
                console.log('❌ Error en función de fallback:', fetchError.message);
                return null;
            }
        }
    }

    /**
     * Invalidar caché relacionado con una propiedad específica
     * @param {string} propertyId - ID de la propiedad
     * @returns {Promise<boolean>} Éxito de la operación
     */
    async invalidateProperty(propertyId) {
        try {
            // Eliminar imágenes de la propiedad
            await this.deletePropertyImages(propertyId);
            
            // Eliminar todas las búsquedas de propiedades (ya que pueden incluir esta propiedad)
            await this.clearAllProperties();
            
            console.log(`🔄 Caché invalidado para propiedad: ${propertyId}`);
            return true;
        } catch (error) {
            console.log('❌ Error al invalidar caché de propiedad:', error.message);
            return false;
        }
    }
}

// Crear instancia única del CacheManager
const cacheManager = new CacheManager();

module.exports = {
    CacheManager,
    cacheManager, // Instancia singleton
    CacheKeys,
    CacheTTL
};