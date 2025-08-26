// Caché en memoria simple y rápido para serverless
class MemoryCache {
    constructor() {
        this.cache = new Map();
        this.ttlMap = new Map();
        this.maxSize = 100; // Límite de entradas para evitar uso excesivo de memoria
    }

    // Generar clave de caché
    generateKey(prefix, params) {
        const sortedParams = Object.keys(params)
            .sort()
            .reduce((result, key) => {
                result[key] = params[key];
                return result;
            }, {});
        return `${prefix}:${JSON.stringify(sortedParams)}`;
    }

    // Verificar si una entrada ha expirado
    isExpired(key) {
        const ttl = this.ttlMap.get(key);
        if (!ttl) return false;
        return Date.now() > ttl;
    }

    // Limpiar entradas expiradas
    cleanExpired() {
        for (const [key, ttl] of this.ttlMap.entries()) {
            if (Date.now() > ttl) {
                this.cache.delete(key);
                this.ttlMap.delete(key);
            }
        }
    }

    // Obtener datos del caché
    get(key) {
        try {
            // Limpiar entradas expiradas ocasionalmente
            if (Math.random() < 0.1) {
                this.cleanExpired();
            }

            if (this.isExpired(key)) {
                this.cache.delete(key);
                this.ttlMap.delete(key);
                return null;
            }

            const data = this.cache.get(key);
            if (data) {
                console.log(`📦 ✅ Memory cache hit: ${key}`);
                return data;
            }

            console.log(`📦 ❌ Memory cache miss: ${key}`);
            return null;
        } catch (error) {
            console.error('Error obteniendo del caché en memoria:', error);
            return null;
        }
    }

    // Guardar datos en el caché
    set(key, data, ttlSeconds = 300) {
        try {
            // Si el caché está lleno, eliminar entradas más antiguas
            if (this.cache.size >= this.maxSize) {
                const firstKey = this.cache.keys().next().value;
                this.cache.delete(firstKey);
                this.ttlMap.delete(firstKey);
            }

            this.cache.set(key, data);
            this.ttlMap.set(key, Date.now() + (ttlSeconds * 1000));
            
            console.log(`💾 ✅ Datos guardados en memory cache: ${key} (TTL: ${ttlSeconds}s)`);
            return true;
        } catch (error) {
            console.error('Error guardando en caché en memoria:', error);
            return false;
        }
    }

    // Eliminar entrada específica
    delete(key) {
        this.cache.delete(key);
        this.ttlMap.delete(key);
    }

    // Limpiar todo el caché
    clear() {
        this.cache.clear();
        this.ttlMap.clear();
    }

    // Obtener estadísticas del caché
    getStats() {
        return {
            size: this.cache.size,
            maxSize: this.maxSize,
            keys: Array.from(this.cache.keys())
        };
    }
}

// Instancia global del caché
const memoryCache = new MemoryCache();

module.exports = { memoryCache };