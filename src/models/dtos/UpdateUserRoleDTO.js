export default class UpdateUserRoleDTO {
    constructor({ UserID, Role, Reason } = {}) {
        this.userID = UserID;
        this.role = Role;
        this.reason = Reason;
    }
}
