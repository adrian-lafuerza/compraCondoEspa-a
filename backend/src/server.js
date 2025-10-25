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
      'http://localhost:5175', // Desarrollo local Vite
      'http://localhost:3000', // Desarrollo local alternativo
      'https://localhost:5173', // Desarrollo local HTTPS
      process.env.FRONTEND_URL, // URL de producción del frontend
      process.env.FRONTEND_URL_VITE, // URL de producción del frontend Vite
      ...(process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : [])
    ].filter(Boolean);

    console.log('Origin:', origin);
    console.log('Allowed origins:', allowedOrigins);

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      // En desarrollo, permitir cualquier localhost
      if (process.env.NODE_ENV !== 'production' && origin && origin.includes('localhost')) {
        callback(null, true);
      } else {
        console.log('CORS blocked origin:', origin);
        callback(new Error('No permitido por CORS'));
      }
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  optionsSuccessStatus: 200 // Para soportar navegadores legacy
};

// Middlewares
app.use(cors(corsOptions));

// Middleware adicional para manejar preflight requests
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin);
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin,X-Requested-With,Content-Type,Accept,Authorization');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

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