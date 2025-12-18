import api from '../utils/axiosClient';
import LogInRequest from '../models/viewModels/LogInRequest.JS';
import AuthTokenViewModel from '../models/viewModels/AuthTokenViewModel.js';
import { setAuthToken } from '../utils/axiosClient.js';

const AUTH_PATH = import.meta.env.VITE_API_URL + import.meta.env.VITE_API_AUTH_LOGIN;

const AuthService = {
    login: async (credentials) => {
        var response = await api.post(AUTH_PATH, credentials);

        if (!response || response.status !== 200) {
            throw new Error('Erro ao efetuar login! Error code: ' + response?.status);
        } else {
            console.log('Login efetuado com sucesso!');
        }

        var token = new AuthTokenViewModel({
            access_token: response.data.access_token,
            role: response.data.role,
            user_id: response.data.user_id,
            employee_id: response.data.employee_id
        });
        localStorage.setItem('BusinessID', token.employee_id);
        localStorage.setItem('user_role', token.role);
        setAuthToken(token.access_token);
        return token;
    },

    logout: async () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('BusinessID');
        localStorage.removeItem('user_role');
        console.log('Logout efetuado com sucesso!');
    }
}

export default AuthService;