import NotificationDTO from "../models/dtos/NotificationDTO";
import api from "../utils/axiosClient"
;

const NOTIFICATION_PATH = import.meta.env.VITE_API_URL + import.meta.env.VITE_API_NOTIFICATION;

const NotificationService = {

    getAllNotifications: async (userId) => {
        const response = await api.get(NOTIFICATION_PATH + `/${userId}`);

        if (!response || response.status !== 200 && response.status !== 204) {
            throw new Error('Error fetching notifications! Error code: ' + response?.status);
        } 

        var notifications = [];
        for (let notif of response.data) {
            var newNotif = new NotificationDTO({NotificationID: notif.notificationID, Message: notif.message, CreatedAt: notif.createdAt, BusinessEntityID: notif.businessEntityID});
            notifications.push(newNotif);
        }

        return notifications;
    },

    deleteNotification: async (notificationId) => {
        const response =  await api.delete(NOTIFICATION_PATH + `/${notificationId}`);

        if (!response || response.status !== 204) {
            throw new Error('Error deleting notification! Error code: ' + response?.status);
        }   else {
            console.log('Notification deleted with success!');
        }
    }
}

export default NotificationService;