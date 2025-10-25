require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

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

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});

module.exports = app;