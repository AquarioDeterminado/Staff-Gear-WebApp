import api from "../utils/axiosClient";
import UserDTO from "../models/dtos/UserDTO.js";
import LogDTO from "../models/dtos/LogDTO.js";

const API_ADMIN_BASE = import.meta.env.VITE_API_ADMIN ?? '/api/v1/admin';

const AdminService = {
    getUsers: async (pageNumber, pageSize) => {
        const response = await api.get(`${API_ADMIN_BASE}/users`, {
            params: {
                pageNumber,
                pageSize
            }
        });
        return response.data;
    },

    updateUserRole: async (user) => {
        const response = await api.put(`${API_ADMIN_BASE}/users`, new UserDTO(user));
        return response.data;
    },
    getLogs: async (pageNumber, pageSize) => {
        const response = await api.get(`${API_ADMIN_BASE}/logs`, {
            params: {
                pageNumber,
                pageSize
            }
        });
        return response.data;
    },
};

export default AdminService;