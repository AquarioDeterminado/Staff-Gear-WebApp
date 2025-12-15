class NotificationDTO {
    constructor(data) {
        this.NotificationID = data?.NotificationID || null;
        this.Message = data?.Message || null;  
        this.CreatedAt = data?.CreatedAt || null;
        this.BusinessEntityID = data?.BusinessEntityID || null;
    }
}

export default NotificationDTO;