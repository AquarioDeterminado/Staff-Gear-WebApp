class EmployeeViewModel 
{
    constructor({
        BusinessEntityID, FirstName, MiddleName, LastName, JobTitle, Department, Email, PassWord, HireDate, Role, IsActive, ProfilePhoto }) {
        this.BusinessEntityID = BusinessEntityID;
        this.FirstName = FirstName;
        this.MiddleName = MiddleName;
        this.LastName = LastName;
        this.JobTitle = JobTitle;
        this.Department = Department;
        this.Email = Email;
        this.PassWord = PassWord;
        this.HireDate = HireDate;
        this.Role = Role;
        this.IsActive = IsActive;
        this.ProfilePhoto = ProfilePhoto;
    }
}

export default EmployeeViewModel;
