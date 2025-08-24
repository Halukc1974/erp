// Environment config for API endpoints
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 
  (import.meta.env.PROD 
    ? 'https://your-backend-domain.com' // Production backend URL'ini buraya yaz
    : ''); // Development'ta relative URLs kullan

export default API_BASE_URL;
