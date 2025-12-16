// CandidateService.js
import api from '../utils/axiosClient';

const CANDIDATE_PATH = import.meta.env.VITE_API_CANDIDATE ?? '/api/v1/candidate';

function ensurePayload(payload) {
    const required = ['FirstName', 'Email', 'Message', 'Resume', 'MiddleName'];
    const missing = required.filter(k => !payload?.[k]);
    if (missing.length) {
        throw new Error(`Campos obrigatórios em falta: ${missing.join(', ')}`);
    }
    // opcional: validar XML bem-formado antes de enviar
    return payload;
}

const CandidateService = {
    apply: (payload, opts = {}) => {
        ensurePayload(payload);
        return api.post(CANDIDATE_PATH, payload, opts);
    },
    list: (params = {}, opts = {}) => {
        // ex.: paginação, q (query), page, pageSize
        return api.get(CANDIDATE_PATH, { params, ...opts });
    },
    accept: (id, opts = {}) => {
        return api.get(`${CANDIDATE_PATH}/accept/${id}`, opts);
    }
};

export default CandidateService;
