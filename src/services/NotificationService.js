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
    },

    deleteMultipleNotifications: async (notificationIds) => {
        try {
            const deletePromises = notificationIds.map(id => 
                api.delete(NOTIFICATION_PATH + `/${id}`)
            );
            
            const responses = await Promise.all(deletePromises);
            
            // Verify all deletions were successful
            const allSuccessful = responses.every(response => response.status === 204);
            
            if (!allSuccessful) {
                throw new Error('Error deleting some notifications');
            }
            
            console.log('Multiple notifications deleted with success!');
            return true;
        } catch (error) {
            console.error('Error deleting multiple notifications:', error);
            throw error;
        }
    }
}

export default NotificationService;