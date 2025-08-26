const { redisCache, CacheKeys, CacheTTL } = require('./nodeCache');

/**
 * MailchimpCacheManager - Clase unificada para manejo de caché de Mailchimp
 * Proporciona una interfaz simplificada y consistente para operaciones de caché
 * Compatible con la implementación de node-cache
 */
class MailchimpCacheManager {
    constructor() {
        this.cache = redisCache;
        this.keys = {
            CAMPAIGNS: 'mailchimp:campaigns',
            CAMPAIGN_CONTENT: 'mailchimp:content'
        };
        this.ttl = {
            CAMPAIGNS: 1800, // 30 minutos
            CAMPAIGN_CONTENT: 3600, // 1 hora
            CAMPAIGN_DETAIL: 1800 // 30 minutos
        };
    }

    /**
     * Generar clave de caché para campañas
     * @param {Object} params - Parámetros de búsqueda
     * @returns {string} Clave de caché
     */
    generateCampaignsKey(params = {}) {
        const { status = 'all', type = 'all', count = 10, offset = 0, includeHtml = 'false' } = params;
        const keyParts = [
            this.keys.CAMPAIGNS,
            `status:${status}`,
            `type:${type}`,
            `count:${count}`,
            `offset:${offset}`,
            `html:${includeHtml}`
        ];
        
        return keyParts.join(':');
    }

    /**
     * Generar clave de caché para contenido de campaña
     * @param {string} campaignId - ID de la campaña
     * @returns {string} Clave de caché
     */
    generateContentKey(campaignId) {
        return `${this.keys.CAMPAIGN_CONTENT}:${campaignId}`;
    }

    /**
     * Obtener campañas del caché
     * @param {Object} params - Parámetros de búsqueda
     * @returns {Promise<Object|null>} Datos de campañas o null
     */
    async getCampaigns(params = {}) {
        try {
            const key = this.generateCampaignsKey(params);
            const data = await this.cache.get(key);
            
            if (data) {
                console.log(`📦 Campañas obtenidas del caché: ${key}`);
                return data;
            }
            
            return null;
        } catch (error) {
            console.log('⚠️ Error al obtener campañas del caché, continuando sin caché:', error.message);
            return null;
        }
    }

    /**
     * Guardar campañas en el caché
     * @param {Object} params - Parámetros de búsqueda
     * @param {Object} data - Datos de campañas
     * @param {number} ttlSeconds - TTL personalizado (opcional)
     * @returns {Promise<boolean>} Éxito de la operación
     */
    async setCampaigns(params = {}, data, ttlSeconds = null) {
        try {
            const key = this.generateCampaignsKey(params);
            const ttl = ttlSeconds || this.ttl.CAMPAIGNS;
            
            const success = await this.cache.set(key, data, ttl);
            
            if (success) {
                console.log(`💾 Campañas guardadas en caché: ${key}`);
            }
            
            return success;
        } catch (error) {
            console.log('⚠️ Error al guardar campañas en caché:', error.message);
            return false;
        }
    }

    /**
     * Obtener contenido de campaña del caché
     * @param {string} campaignId - ID de la campaña
     * @returns {Promise<Object|null>} Contenido de campaña o null
     */
    async getCampaignContent(campaignId) {
        try {
            const key = this.generateContentKey(campaignId);
            const data = await this.cache.get(key);
            
            if (data) {
                console.log(`📄 Contenido de campaña obtenido del caché: ${campaignId}`);
            }
            
            return data;
        } catch (error) {
            console.log('⚠️ Error al obtener contenido del caché:', error.message);
            return null;
        }
    }

    /**
     * Guardar contenido de campaña en el caché
     * @param {string} campaignId - ID de la campaña
     * @param {Object} content - Contenido de la campaña
     * @param {number} ttlSeconds - TTL personalizado (opcional)
     * @returns {Promise<boolean>} Éxito de la operación
     */
    async setCampaignContent(campaignId, content, ttlSeconds = null) {
        try {
            const key = this.generateContentKey(campaignId);
            const ttl = ttlSeconds || this.ttl.CAMPAIGN_CONTENT;
            
            const success = await this.cache.set(key, content, ttl);
            
            if (success) {
                console.log(`💾 Contenido de campaña guardado en caché: ${campaignId} (TTL: ${ttl}s)`);
            }
            
            return success;
        } catch (error) {
            console.log('⚠️ Error al guardar contenido en caché:', error.message);
            return false;
        }
    }

    /**
     * Eliminar campañas del caché
     * @param {Object} params - Parámetros de búsqueda
     * @returns {Promise<boolean>} Éxito de la operación
     */
    async deleteCampaigns(params = {}) {
        try {
            const key = this.generateCampaignsKey(params);
            const success = await this.cache.del(key);
            
            if (success) {
                console.log(`🗑️ Campañas eliminadas del caché: ${key}`);
            }
            
            return success;
        } catch (error) {
            console.log('⚠️ Error al eliminar campañas del caché:', error.message);
            return false;
        }
    }

    /**
     * Eliminar contenido de campaña del caché
     * @param {string} campaignId - ID de la campaña
     * @returns {Promise<boolean>} Éxito de la operación
     */
    async deleteCampaignContent(campaignId) {
        try {
            const key = this.generateContentKey(campaignId);
            const success = await this.cache.del(key);
            
            if (success) {
                console.log(`🗑️ Contenido de campaña eliminado del caché: ${campaignId}`);
            }
            
            return success;
        } catch (error) {
            console.log('⚠️ Error al eliminar contenido del caché:', error.message);
            return false;
        }
    }

    /**
     * Limpiar todas las campañas del caché
     * @returns {Promise<boolean>} Éxito de la operación
     */
    async clearAllCampaigns() {
        try {
            // Obtener todas las claves que empiecen con el prefijo de campañas
            const stats = await this.cache.getStats();
            let cleared = 0;
            
            // En NodeCache no hay una forma directa de obtener claves por patrón
            // Por lo que usaremos flush para limpiar todo
            await this.cache.flush();
            console.log('🧹 Todas las campañas de Mailchimp limpiadas del caché');
            
            return true;
        } catch (error) {
            console.log('⚠️ Error al limpiar campañas del caché:', error.message);
            return false;
        }
    }

    /**
     * Limpiar todo el contenido de campañas del caché
     * @returns {Promise<boolean>} Éxito de la operación
     */
    async clearAllContent() {
        try {
            await this.cache.flush();
            console.log('🧹 Todo el contenido de campañas de Mailchimp limpiado del caché');
            
            return true;
        } catch (error) {
            console.log('⚠️ Error al limpiar contenido del caché:', error.message);
            return false;
        }
    }

    /**
     * Limpiar todo el caché de Mailchimp
     * @returns {Promise<boolean>} Éxito de la operación
     */
    async clearAll() {
        try {
            await this.cache.flush();
            console.log('🧹 Todo el caché de Mailchimp limpiado');
            
            return true;
        } catch (error) {
            console.log('⚠️ Error al limpiar todo el caché:', error.message);
            return false;
        }
    }

    /**
     * Verificar si existen campañas en caché
     * @param {Object} params - Parámetros de búsqueda
     * @returns {Promise<boolean>} True si existe
     */
    async hasCampaigns(params = {}) {
        try {
            const key = this.generateCampaignsKey(params);
            return await this.cache.exists(key);
        } catch (error) {
            return false;
        }
    }

    /**
     * Verificar si existe contenido de campaña en caché
     * @param {string} campaignId - ID de la campaña
     * @returns {Promise<boolean>} True si existe
     */
    async hasCampaignContent(campaignId) {
        try {
            const key = this.generateContentKey(campaignId);
            return await this.cache.exists(key);
        } catch (error) {
            return false;
        }
    }

    /**
     * Obtener TTL de campañas
     * @param {Object} params - Parámetros de búsqueda
     * @returns {Promise<number>} TTL en segundos
     */
    async getCampaignsTTL(params = {}) {
        try {
            const key = this.generateCampaignsKey(params);
            return await this.cache.ttl(key);
        } catch (error) {
            return -1;
        }
    }

    /**
     * Obtener TTL de contenido de campaña
     * @param {string} campaignId - ID de la campaña
     * @returns {Promise<number>} TTL en segundos
     */
    async getContentTTL(campaignId) {
        try {
            const key = this.generateContentKey(campaignId);
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
            console.log('⚠️ Error al obtener estadísticas del caché:', error.message);
            return {
                keys: 0,
                hits: 0,
                misses: 0,
                ksize: 0,
                vsize: 0
            };
        }
    }

    /**
     * Verificar si el caché está conectado
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
            console.log('🔌 Conexión de caché de Mailchimp cerrada');
        } catch (error) {
            console.log('⚠️ Error al cerrar conexión del caché:', error.message);
        }
    }

    /**
     * Método helper para obtener o establecer datos en caché
     * @param {string} key - Clave del caché
     * @param {Function} fetchFunction - Función para obtener datos si no están en caché
     * @param {number} ttlSeconds - TTL personalizado
     * @returns {Promise<any>} Datos del caché o de la función
     */
    async getOrSet(key, fetchFunction, ttlSeconds = null) {
        try {
            // Intentar obtener del caché primero
            let data = await this.cache.get(key);
            
            if (data) {
                return data;
            }
            
            // Si no está en caché, ejecutar función de obtención
            data = await fetchFunction();
            
            if (data) {
                // Guardar en caché
                await this.cache.set(key, data, ttlSeconds || this.ttl.CAMPAIGNS);
            }
            
            return data;
        } catch (error) {
            console.log('⚠️ Error en getOrSet:', error.message);
            // En caso de error, intentar ejecutar la función directamente
            return await fetchFunction();
        }
    }

    /**
     * Invalidar caché relacionado con una campaña específica
     * @param {string} campaignId - ID de la campaña
     * @returns {Promise<boolean>} Éxito de la operación
     */
    async invalidateCampaign(campaignId) {
        try {
            // Eliminar contenido de la campaña
            await this.deleteCampaignContent(campaignId);
            
            // También podríamos eliminar todas las listas de campañas que podrían contener esta campaña
            // Pero por simplicidad, solo eliminamos el contenido específico
            
            console.log(`🗑️ Caché invalidado para campaña: ${campaignId}`);
            return true;
        } catch (error) {
            console.log('⚠️ Error al invalidar caché de campaña:', error.message);
            return false;
        }
    }
}

// Crear instancia singleton
const mailchimpCacheManager = new MailchimpCacheManager();

module.exports = {
    MailchimpCacheManager,
    mailchimpCacheManager, // Instancia singleton
    MailchimpCacheKeys: {
        CAMPAIGNS: 'mailchimp:campaigns',
        CAMPAIGN_CONTENT: 'mailchimp:content'
    },
    MailchimpCacheTTL: {
        CAMPAIGNS: 1800, // 30 minutos
        CAMPAIGN_CONTENT: 3600, // 1 hora
        CAMPAIGN_DETAIL: 1800 // 30 minutos
    }
};