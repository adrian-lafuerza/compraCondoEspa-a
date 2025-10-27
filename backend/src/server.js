require('dotenv').config();
const express = require('express');
const cors = require('cors');
const IdealistaCronService = require('./services/idealistaCron.service');

const app = express();
const PORT = process.env.PORT || 3000;

// Inicializar servicio de cron para Idealista FTP
const idealistaCron = new IdealistaCronService();

// Configuración básica de CORS
app.use(cors({
  origin: true, // Permite todos los orígenes
  credentials: true, // Permite cookies y credenciales
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rutas
app.get('/', (req, res) => {
  res.json({ message: 'Servidor funcionando correctamente' });
});

// Importar rutas
const contentfulRoutes = require('./routes/contentful.routes');
const idealistaRoutes = require('./routes/properties.routes');
const mailchimpRoutes = require('./routes/mailchimp.routes');
app.use('/api/contentful', contentfulRoutes);
app.use('/api/idealista', idealistaRoutes);
app.use('/api/mailchimp', mailchimpRoutes);

// === RUTAS DE GESTIÓN DEL CRON JOB ===
app.get('/api/cron/status', async (req, res) => {
  try {
    const status = idealistaCron.getStatus();
    const history = await idealistaCron.getExecutionHistory();
    res.json({
      success: true,
      data: { ...status, ...history },
      message: 'Estado del cron job obtenido'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error obteniendo estado del cron job',
      error: error.message
    });
  }
});

app.post('/api/cron/execute', async (req, res) => {
  try {
    const result = await idealistaCron.executeManually();
    res.json({
      success: true,
      data: result,
      message: 'Cron job ejecutado manualmente'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error ejecutando cron job manualmente',
      error: error.message
    });
  }
});

app.post('/api/cron/start', (req, res) => {
  try {
    idealistaCron.start();
    res.json({
      success: true,
      message: 'Cron job iniciado',
      status: idealistaCron.getStatus()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error iniciando cron job',
      error: error.message
    });
  }
});

app.post('/api/cron/stop', (req, res) => {
  try {
    idealistaCron.stop();
    res.json({
      success: true,
      message: 'Cron job detenido',
      status: idealistaCron.getStatus()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deteniendo cron job',
      error: error.message
    });
  }
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  
  // Iniciar cron job automáticamente si está habilitado
  if (process.env.IDEALISTA_CRON_ENABLED !== 'false') {
    console.log('📅 Iniciando cron job de Idealista FTP...');
    idealistaCron.start();
  } else {
    console.log('📅 Cron job de Idealista FTP deshabilitado por configuración');
  }
});

module.exports = app;