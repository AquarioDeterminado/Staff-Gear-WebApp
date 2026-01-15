import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL
});

// Token in local storage
export function setAuthToken(token) {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    localStorage.setItem('access_token', token);
  } else {
    delete api.defaults.headers.common['Authorization'];
    localStorage.removeItem('access_token');
  }
}

// Restoring token from the local storage when initializing
const storedToken = localStorage.getItem('access_token');
if (storedToken) {
  setAuthToken(storedToken);
}

api.interceptors.response.use(
  response => response,
  error => {
    const status = error.response?.status;
    if (status === 401 && window.location.pathname !== '/' && window.location.pathname !== '/login') {
        console.warn('Invalid session or expired');
        // Guardar o caminho atual antes de remover o token
        sessionStorage.setItem('last_non_login_path', window.location.pathname);
        try {
          setAuthToken(null);
        } catch {}
        // Redirecionar para login
        if (typeof window !== 'undefined') window.location.replace('/login');
    }
    
    // If the answer gives an error it's a blob, tried to convert to text/JSON
    if (error.response?.data instanceof Blob) {
      return error.response.data.text().then(text => {
        try {
          error.response.data = JSON.parse(text);
        } catch {
          // If it's not JSON saves the text as a string
          error.response.data = text;
        }
        return Promise.reject(error);
      });
    }
    
    return Promise.reject(error);
  }
);

export default api;

