import axios from "axios";
import UserSession from "../utils/UserSession";

const API_BASE_URL = import.meta.env.VITE_API_URL ?? window.location.origin;

const dashboardAPI = axios.create({
  baseURL: `${API_BASE_URL}/api/v1/dashboard`,
});

dashboardAPI.interceptors.request.use((config) => {
  const token = UserSession.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const DashboardService = {
  getProfileDashboard: async () => {
    try {
      const response = await dashboardAPI.get("/profile");
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getEmployeeDashboard: async (employeeId) => {
    try {
      const response = await dashboardAPI.get(`/${employeeId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default DashboardService;
