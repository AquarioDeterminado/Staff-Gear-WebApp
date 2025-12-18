class UserDTO
{
    constructor({UserID, Username, EmployeeId, IsActive, Role}) {
        this.UserID = UserID;
        this.Username = Username || null;
        this.EmployeeId = EmployeeId || null;
        this.IsActive = IsActive || null;
        this.Role = Role || null;
    }
}

export default UserDTO;
