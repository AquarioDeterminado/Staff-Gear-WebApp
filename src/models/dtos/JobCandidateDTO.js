class JobCandidateDTO 
{
    constructor(data) {
        this.JobCandidateId = data?.JobCandidateId || null;
        this.FirstName = data?.FirstName || null;
        this.MiddleName = data?.MiddleName || null;
        this.LastName = data?.LastName || null;
        this.Email = data?.Email || null;
        this.Phone = data?.Phone || null;
        this.Resume = data?.Resume || null;
        this.Message = data?.Message || null;
        this.JobListingId = data?.JobListingId || null;
    }
}

export default JobCandidateDTO;