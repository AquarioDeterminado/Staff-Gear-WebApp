class JobListingDTO {
    constructor({
        jobListingID,
        jobTitle,
        location,
        jobType,
        description,
        numberOfPositions,
        departmentID,
        status,
        postedDate,
        modifiedDate,
        department,
        departmentName,
        applicationCount,
        acceptedCount
    }) {
        this.jobListingID = jobListingID || null;
        this.jobTitle = jobTitle || null;
        this.location = location || null;
        this.jobType = jobType || null;
        this.description = description || null;
        this.numberOfPositions = numberOfPositions || null;
        this.departmentID = departmentID || null;
        this.status = status || 0;
        this.postedDate = postedDate || null;
        this.modifiedDate = modifiedDate || null;
        this.department = department || null;
        this.departmentName = departmentName || null;
        this.applicationCount = applicationCount || 0;
        this.acceptedCount = acceptedCount || 0;
    }

    get availablePositions() {
        return this.numberOfPositions - this.acceptedCount;
    }
}

export default JobListingDTO;
