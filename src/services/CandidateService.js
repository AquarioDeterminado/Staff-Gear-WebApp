
// src/services/CandidateService.js
import api from '../utils/axiosClient';

// Usa apenas uma variável base do .env (ex.: VITE_API_CANDIDATE=/api/v1/candidate)
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

        // POST para /api/v1/candidate/apply
        return api.post(`${CANDIDATE_BASE}/apply`, fd, {
            headers: { 'Content-Type': 'multipart/form-data' },
            ...opts
        });
    },

    /**
     * Lista candidatos (RH) com paginação e filtros.
     * params: { page?: number, pageSize?: number, q?: string }
     */
    list: (params = {}, opts = {}) => {
        return api.get(CANDIDATE_BASE, { params, ...opts });
    },

    /**
     * Aceita candidato e integra como funcionário.
     * Mantém GET enquanto o backend estiver com [HttpGet("accept/{id}")].
     */
    accept: (id, opts = {}) => {
        return api.get(`${CANDIDATE_BASE}/accept/${id}`, opts);
    },

    /**
     * Download do CV (binário) de um candidato (só RH).
     * Retorna Blob — usa URL.createObjectURL(blob) para abrir/guardar.
     */
    downloadResume: async (id, opts = {}) => {
        const res = await api.get(`${CANDIDATE_BASE}/${id}/resume`, {
            responseType: 'blob',
            ...opts
        });
        return res.data; // Blob
    }
};

export default CandidateService;
