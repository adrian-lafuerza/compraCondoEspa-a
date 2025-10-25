// Utilidad para manejar CORS en serverless functions de Vercel

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5175', 
  'http://localhost:3000',
  'https://localhost:5173',
  'https://ruben-alfonso-wheat.vercel.app',
  'https://compra-condo-espa-a.vercel.app'
];

/**
 * Configura headers CORS para una respuesta
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @returns {boolean} - true si el origen está permitido, false si no
 */
function setCorsHeaders(req, res) {
  const origin = req.headers.origin;
  
  // Verificar si el origen está permitido
  const isAllowed = !origin || allowedOrigins.includes(origin) || 
                   (origin && origin.includes('.vercel.app')) ||
                   (origin && origin.includes('localhost'));
  
  if (isAllowed) {
    // Si el origen está permitido, usarlo específicamente
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
  } else {
    // Si no está permitido, no establecer el header
    res.setHeader('Access-Control-Allow-Origin', 'null');
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Max-Age', '86400'); // Cache preflight por 24 horas
  
  return isAllowed;
}

/**
 * Maneja requests OPTIONS (preflight)
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @returns {boolean} - true si es un request OPTIONS, false si no
 */
function handlePreflight(req, res) {
  if (req.method === 'OPTIONS') {
    setCorsHeaders(req, res);
    res.status(200).end();
    return true;
  }
  return false;
}

/**
 * Middleware completo de CORS para serverless functions
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @returns {boolean} - true si debe continuar, false si ya respondió
 */
function handleCors(req, res) {
  // Configurar headers CORS
  const isAllowed = setCorsHeaders(req, res);
  
  // Manejar preflight
  if (handlePreflight(req, res)) {
    return false; // Ya respondió, no continuar
  }
  
  // Si el origen no está permitido, bloquear
  if (!isAllowed) {
    res.status(403).json({
      success: false,
      error: 'CORS: Origen no permitido',
      message: 'Tu dominio no está autorizado para acceder a esta API'
    });
    return false;
  }
  
  return true; // Continuar con el procesamiento
}

module.exports = {
  setCorsHeaders,
  handlePreflight,
  handleCors,
  allowedOrigins
};