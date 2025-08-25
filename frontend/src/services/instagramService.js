import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api/contentful';

// Crear instancia de axios con configuración base
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para manejar errores globalmente
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);

    if (error.response) {
      // El servidor respondió con un código de error
      throw new Error(`Error ${error.response.status}: ${error.response.data.message || 'Error del servidor'}`);
    } else if (error.request) {
      // La petición fue hecha pero no se recibió respuesta
      throw new Error('No se pudo conectar con el servidor. Verifica que el backend esté ejecutándose.');
    } else {
      // Algo pasó al configurar la petición
      throw new Error('Error al configurar la petición');
    }
  }
);

export const instagramService = {
  // Obtener todos los posts de Instagram
  async getAllPosts() {
    try {
      // const response = await api.get('/instagram');

      // console.log('Instagram API Response:', response.data);

      // // El backend devuelve { success: true, data: [...], total: number, message: string }
      // return response.data.data || [];

      return [{
        "id": "1TZfwZnqoGK9TyMkLZ09JV",
        "title": "Reel 3",
        "instagramUrl": "https://www.instagram.com/p/DNYbJuANH6-/",
        "embedUrl": "https://www.instagram.com/p/DNYbJuANH6-/embed",
        "likes": 0,
        "comments": 0,
        "createdAt": "2025-08-21T21:47:39.258Z",
        "updatedAt": "2025-08-21T21:47:39.258Z"
      },
      {
        "id": "70E8ASU3LpfqBrWXNUtr1y",
        "title": "Reel 2",
        "instagramUrl": "https://www.instagram.com/p/DNa9_ddOvY8/",
        "embedUrl": "https://www.instagram.com/p/DNa9_ddOvY8/embed",
        "likes": 0,
        "comments": 0,
        "createdAt": "2025-08-21T21:47:17.733Z",
        "updatedAt": "2025-08-21T21:47:17.733Z"
      },
      {
        "id": "6MkW2yuFyk7BlKlCxL3sTn",
        "title": "Reel 1",
        "instagramUrl": "https://www.instagram.com/p/DNjX8A-xiEW/",
        "embedUrl": "https://www.instagram.com/p/DNjX8A-xiEW/embed",
        "likes": 0,
        "comments": 0,
        "createdAt": "2025-08-21T21:46:48.261Z",
        "updatedAt": "2025-08-21T21:46:48.261Z"
      },
      {
        "id": "7NlX3zvGzl8CmLmDyM4uTo",
        "title": "Reel 2",
        "instagramUrl": "https://www.instagram.com/p/DNjX8A-xiEW/",
        "embedUrl": "https://www.instagram.com/p/DNjX8A-xiEW/embed",
        "likes": 0,
        "comments": 0,
        "createdAt": "2025-08-21T21:46:48.261Z",
        "updatedAt": "2025-08-21T21:46:48.261Z"
      },
      {
        "id": "8OmY4awHam9DnNnEzN5vUp",
        "title": "Reel 3",
        "instagramUrl": "https://www.instagram.com/p/DNjX8A-xiEW/",
        "embedUrl": "https://www.instagram.com/p/DNjX8A-xiEW/embed",
        "likes": 0,
        "comments": 0,
        "createdAt": "2025-08-21T21:46:48.261Z",
        "updatedAt": "2025-08-21T21:46:48.261Z"
      }]
    } catch (error) {
      console.error('Error in getAllPosts:', error);
      throw error;
    }
  },

  // Obtener un post específico por ID
  async getPostById(id) {
    try {
      const response = await api.get(`/instagram/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Obtener estadísticas de Instagram
  async getInstagramStats() {
    try {
      const response = await api.get('/instagram-stats');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Verificar la conexión con Contentful
  async checkHealth() {
    try {
      const response = await api.get('/health');
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default instagramService;