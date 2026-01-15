import api from "../utils/axiosClient";
import UserDTO from "../models/dtos/UserDTO.js";
import LogDTO from "../models/dtos/LogDTO.js";
import UpdateUserRoleDTO from "../models/dtos/UpdateUserRoleDTO.js";

const API_ADMIN_BASE = import.meta.env.VITE_API_ADMIN ?? '/api/v1/admin';

const AdminService = {
    getUsers: async () => {
        const response = await api.get(`${API_ADMIN_BASE}/users`);
        return response.data.map(user => (new UserDTO({UserID : user.userID, Username: user.username, EmployeeId: user.employeeId, IsActive: user.isActive, Role: user.role})));
    },

    updateUserRole: async (userID, newRole, reason) => {
        const response = await api.put(`${API_ADMIN_BASE}/users`, new UpdateUserRoleDTO({ UserID: userID, Role: newRole, Reason: reason }));
        return response.data;
    },
    getLogs: async () => {
        const response = await api.get(`${API_ADMIN_BASE}/logs`);
        return response.data.map(log => (new LogDTO({LogID: log.logID, ActorID: log.actorID, Target: log.target, Action: log.action, Description: log.description, CreatedAt: log.createdAt})));
    },
};

export default AdminService;