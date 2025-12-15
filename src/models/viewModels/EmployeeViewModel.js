class EmployeeViewModel 
{
    constructor({
        BusinessEntityID, FirstName, MiddleName, LastName, JobTitle, Department, Email, PassWord, HireDate, Role }) {
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
    }
}

export default EmployeeViewModel;
