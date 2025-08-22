require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Configuración de CORS para producción
const corsOptions = {
  origin: function (origin, callback) {
    // Permitir requests sin origin (mobile apps, etc.)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:5173', // Desarrollo local
      'http://localhost:5174', // Desarrollo local Vite
      'http://localhost:3000', // Desarrollo local alternativo
      process.env.FRONTEND_URL, // URL de producción del frontend
      ...(process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : [])
    ].filter(Boolean);

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('No permitido por CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// Middlewares
app.use(cors(corsOptions));
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

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});

module.exports = app;