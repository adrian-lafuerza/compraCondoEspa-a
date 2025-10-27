/**
 * Servicio de Cron Job para Idealista FTP
 * Descarga automáticamente los archivos diarios del FTP de Idealista
 */
const cron = require('node-cron');
const IdealistaFtpService = require('./idealistaFtp.service');
const { redisCache } = require('../utils/nodeCache');

class IdealistaCronService {
    constructor() {
        this.ftpService = new IdealistaFtpService();
        this.isRunning = false;
        this.lastExecution = null;
        this.nextExecution = null;
        this.cronJob = null;
        
        // Configuración del cron job
        this.cronExpression = process.env.IDEALISTA_CRON_SCHEDULE || '0 6 * * *'; // Diario a las 6:00 AM por defecto
        
        console.log(`📅 Cron job configurado para ejecutarse: ${this.cronExpression}`);
    }

    /**
     * Inicia el cron job
     */
    start() {
        if (this.cronJob) {
            console.log('⚠️ Cron job ya está ejecutándose');
            return;
        }

        console.log('🚀 Iniciando cron job de Idealista FTP...');
        
        this.cronJob = cron.schedule(this.cronExpression, async () => {
            await this.executeJob();
        }, {
            scheduled: true,
            timezone: "Europe/Madrid"
        });

        // Calcular próxima ejecución
        this.updateNextExecution();
        
        console.log(`✅ Cron job iniciado. Próxima ejecución: ${this.nextExecution}`);
    }

    /**
     * Detiene el cron job
     */
    stop() {
        if (this.cronJob) {
            this.cronJob.stop();
            this.cronJob = null;
            console.log('🛑 Cron job detenido');
        }
    }

    /**
     * Ejecuta manualmente el job
     */
    async executeManually() {
        console.log('🔧 Ejecutando job manualmente...');
        return await this.executeJob();
    }

    /**
     * Ejecuta la tarea principal del cron job
     */
    async executeJob() {
        if (this.isRunning) {
            console.log('⚠️ Job ya está ejecutándose, saltando esta ejecución');
            return;
        }

        this.isRunning = true;
        this.lastExecution = new Date();
        
        try {
            console.log('🏠 Iniciando descarga automática de datos de Idealista...');
            
            // Limpiar caché antes de la actualización
            console.log('🧹 Limpiando caché...');
            await redisCache.flush();
            
            // Descargar y procesar nuevos datos
            const result = await this.ftpService.downloadAndProcessLatestFile();
            
            if (result && result.properties) {
                console.log(`✅ Descarga automática completada: ${result.properties.length} propiedades procesadas`);
                
                // Opcional: Enviar notificación o log del resultado
                await this.logExecutionResult({
                    success: true,
                    propertiesCount: result.properties.length,
                    source: result.source,
                    timestamp: this.lastExecution
                });
                
                return {
                    success: true,
                    propertiesCount: result.properties.length,
                    timestamp: this.lastExecution
                };
            } else {
                throw new Error('No se pudieron obtener datos del FTP');
            }
            
        } catch (error) {
            console.error('❌ Error en la ejecución del cron job:', error);
            
            await this.logExecutionResult({
                success: false,
                error: error.message,
                timestamp: this.lastExecution
            });
            
            return {
                success: false,
                error: error.message,
                timestamp: this.lastExecution
            };
        } finally {
            this.isRunning = false;
            this.updateNextExecution();
        }
    }

    /**
     * Registra el resultado de la ejecución
     */
    async logExecutionResult(result) {
        try {
            // Guardar en caché el resultado de la última ejecución
            await redisCache.set('idealista:cron:last_execution', result, 86400); // 24 horas
            
            // Log detallado
            if (result.success) {
                console.log(`📊 Ejecución exitosa: ${result.propertiesCount} propiedades actualizadas`);
            } else {
                console.error(`📊 Ejecución fallida: ${result.error}`);
            }
        } catch (error) {
            console.error('Error guardando resultado de ejecución:', error);
        }
    }

    /**
     * Actualiza la fecha de próxima ejecución
     */
    updateNextExecution() {
        if (this.cronJob) {
            // Calcular próxima ejecución basada en la expresión cron
            const now = new Date();
            const cronParser = require('node-cron');
            
            // Para simplificar, calculamos la próxima ejecución manualmente
            // Si es diario a las 6:00 AM
            const tomorrow = new Date(now);
            tomorrow.setDate(tomorrow.getDate() + 1);
            tomorrow.setHours(6, 0, 0, 0);
            
            this.nextExecution = tomorrow.toISOString();
        }
    }

    /**
     * Obtiene el estado del cron job
     */
    getStatus() {
        return {
            isRunning: this.isRunning,
            cronExpression: this.cronExpression,
            lastExecution: this.lastExecution,
            nextExecution: this.nextExecution,
            jobActive: !!this.cronJob
        };
    }

    /**
     * Obtiene el historial de ejecuciones
     */
    async getExecutionHistory() {
        try {
            const lastExecution = await redisCache.get('idealista:cron:last_execution');
            return {
                lastExecution: lastExecution || null,
                status: this.getStatus()
            };
        } catch (error) {
            console.error('Error obteniendo historial de ejecuciones:', error);
            return {
                lastExecution: null,
                status: this.getStatus()
            };
        }
    }

    /**
     * Actualiza la configuración del cron
     */
    updateSchedule(newCronExpression) {
        if (!cron.validate(newCronExpression)) {
            throw new Error('Expresión cron inválida');
        }

        this.stop();
        this.cronExpression = newCronExpression;
        this.start();
        
        console.log(`📅 Horario de cron actualizado: ${newCronExpression}`);
    }
}

module.exports = IdealistaCronService;