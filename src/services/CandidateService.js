import api from '../utils/axiosClient';

const CANDIDATE_BASE = import.meta.env.VITE_API_CANDIDATE ?? '/api/v1/candidate';

const CandidateService = {

    apply: (payload, opts = {}) => {
        const fd = new FormData();
        fd.append('FirstName', payload.FirstName);
        fd.append('MiddleName', payload.MiddleName ?? '');
        fd.append('LastName', payload.LastName ?? '');
        fd.append('Email', payload.Email);
        fd.append('Phone', payload.Phone ?? '');
        fd.append('Message', payload.Message);
        fd.append('ResumeFile', payload.ResumeFile); // File
        if (payload.JobListingID) {
            fd.append('JobListingID', payload.JobListingID);
        }

        // POST para /api/v1/candidate/apply
        return api.post(`${CANDIDATE_BASE}/apply`, fd, {
            headers: { 'Content-Type': 'multipart/form-data' },
            ...opts
        });
    },

    list: (params = {}, opts = {}) => {
        return api.get(CANDIDATE_BASE, { params, ...opts });
    },

    accept: (id, data = {}, opts = {}) => {
        return api.post(`${CANDIDATE_BASE}/accept/${id}`, {
            jobTitle: data.jobTitle || null,
            department: data.department || null,
            defaultPassword: data.defaultPassword || null
        }, opts);
    },

    reject: (id, opts = {}) => {
        return api.delete(`${CANDIDATE_BASE}/${id}`, opts);
    },

    downloadResume: async (id, opts = {}) => {
        const res = await api.get(`${CANDIDATE_BASE}/${id}/resume`, {
            responseType: 'blob',
            headers: { Accept: 'application/octet-stream' },
            ...opts
        });
        return res.data;
    }
};

export default CandidateService;
