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
        } catch {
          console.error('Error removing auth token during 401 handling');
        }
        
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

export function buildFiltersQuery(filters) {
    return filters.filter(f => {
      return (f.Values !== null && f.Values !== undefined && f.Values.length > 0 && f.Values.some(v => v !== '')) &&
             (f.Fields !== null && f.Fields !== undefined && f.Fields.length > 0);
    }).map((f, idx) => {
            if (f.Values === null || f.Values === undefined) return '';
            var filterBase = `Filters[${idx}]`
            
            var filterValues = f.Values.filter(value => value !== '').map((value, index) => `${filterBase}.Values[${index}]=${encodeURIComponent(value)}`).join('&');

            var filterFields = f.Fields.map((field, index) => `${filterBase}.Fields[${index}]=${encodeURIComponent(field)}`).join('&');

            return `${filterValues}&${filterFields}`;
        }).filter(f => f !== '').join('&');
}

export default api;

