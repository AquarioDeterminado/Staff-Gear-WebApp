
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL
});

// Token em memória ou localStorage
export function setAuthToken(token) {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    localStorage.setItem('access_token', token);
  } else {
    delete api.defaults.headers.common['Authorization'];
    localStorage.removeItem('access_token');
  }
}

// Restaurar token do localStorage ao inicializar
const storedToken = localStorage.getItem('access_token');
if (storedToken) {
  setAuthToken(storedToken);
  console.log('Token restaurado do localStorage ao iniciar a aplicação');
}

// Interceptor para erros globais
api.interceptors.response.use(
  response => response,
  error => {
    const status = error.response?.status;
    if (status === 401) {
      console.warn('Sessão expirada ou inválida.');
      // opcional: redirect para login
    }
    
    // Se a resposta de erro é um Blob, tenta converter para texto/JSON
    if (error.response?.data instanceof Blob) {
      return error.response.data.text().then(text => {
        try {
          error.response.data = JSON.parse(text);
        } catch {
          // Se não for JSON, guarda o texto como string
          error.response.data = text;
        }
        return Promise.reject(error);
      });
    }
    
    return Promise.reject(error);
  }
);

export default api;

