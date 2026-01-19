import api from "../utils/axiosClient";
import UpdateUserRoleDTO from "../models/dtos/UpdateUserRoleDTO.js";
import { buildFiltersQuery } from "../utils/axiosClient.js";

const API_ADMIN_BASE = import.meta.env.VITE_API_ADMIN ?? '/api/v1/admin';

const AdminService = {
    getUsers: async (pageNumber, pageSize, filters, sort) => {
        const filtersQuery = buildFiltersQuery(filters);
        const sortingQuery = sort ? `Sort.SortBy=${sort.SortBy}&Sort.Direction=${sort.Direction}` : '';
        
        const response = await api.get(`${API_ADMIN_BASE}/users?${sortingQuery}&${filtersQuery}`, {
            params: {
                pageNumber,
                pageSize,
            }
        });
        return response.data;
    },

    updateUserRole: async (userID, newRole, reason) => {
        const response = await api.put(`${API_ADMIN_BASE}/users`, new UpdateUserRoleDTO({ UserID: userID, Role: newRole, Reason: reason }));
        return response.data;
    },
    getLogs: async (pageNumber, pageSize, filters, sort) => {
        const filtersQuery = buildFiltersQuery(filters);
        const sortingQuery = sort ? `Sort.SortBy=${sort.SortBy}&Sort.Direction=${sort.Direction}` : '';

        const response = await api.get(`${API_ADMIN_BASE}/logs?${sortingQuery}&${filtersQuery}`, {
            params: {
                pageNumber,
                pageSize
            }
        });
        return response.data;
    },
};

export default AdminService;