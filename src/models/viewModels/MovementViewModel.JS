class MovementViewModel 
{
    constructor({BusinessEntityID, FullName, DepartmentName, JobTitle, StartDate, EndDate}) {
        this.BusinessEntityID = BusinessEntityID || null;
        this.FullName = FullName || null;
        this.DepartmentName = DepartmentName || null;
        this.JobTitle = JobTitle || null;
        this.StartDate = StartDate || null;
        this.EndDate = EndDate || null;
    }
}

export default MovementViewModel;