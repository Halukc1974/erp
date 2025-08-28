// Environment config for API endpoints
// If VITE_API_BASE_URL is provided at build time use it, otherwise
// default to an empty string so fetch uses relative URLs (works when
// frontend and backend are served from the same domain).
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

export default API_BASE_URL;
