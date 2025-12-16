const UserSession = {
    getToken: function() {
        return localStorage.getItem('access_token');
    },
    getBusinessID: function(navigator) {
        var businessEntityID = localStorage.getItem('BusinessID');
        if (businessEntityID != null && businessEntityID !== undefined) {
            return businessEntityID;
        } else {
            navigator('/', { replace: true });
        }
    },
}

export default UserSession;
