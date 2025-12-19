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

    verifyAuthorize : function(navigator, status) {
        console.log('Verifying authorization for status:', status);
        // Treat 401, 403 and 405 as authorization failures and redirect to login/root
        if (status === 401 || status === 403 || status === 405 || status === 500 || status === undefined) {
            try {
                localStorage.removeItem('access_token');
            } catch (e) {
                console.error('Error removing access_token from localStorage:', e);
            }
            navigator('/', { replace: true });
        } 
    }
}

export default UserSession;
