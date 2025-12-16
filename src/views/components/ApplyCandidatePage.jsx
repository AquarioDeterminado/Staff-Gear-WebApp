
// src/pages/ApplyCandidatePage.jsx
import React, { useState, useRef } from 'react';
import CandidateService from '../../services/CandidateService';

export default function ApplyCandidatePage() {
    const [form, setForm] = useState({
        firstName: '',
        middleName: '',
        lastName: '',
        email: '',
        phone: '',
        message: '',
        resumeFile: null, // ficheiro binário
    });

    const [resumeFileName, setResumeFileName] = useState('');
    const [loading, setLoading] = useState(false);
    const [feedback, setFeedback] = useState(null);
    const abortRef = useRef(null);

    const onChange = (e) => {
        const { name, value, files } = e.target;

        // Upload de ficheiro
        if (name === 'resumeFile') {
            const file = files?.[0] || null;
            setForm((prev) => ({ ...prev, resumeFile: file }));
            setResumeFileName(file ? file.name : '');
            setFeedback(null);
            return;
        }

        // Campos de texto
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const validate = () => {
        if (!form.firstName?.trim()) return 'First Name é obrigatório.';
        if (!form.email?.trim()) return 'E-mail é obrigatório.';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return 'E-mail inválido.';
        if (!form.message?.trim()) return 'Mensagem é obrigatória.';
        if (!form.resumeFile) return 'CV é obrigatório.';

        // Tipos permitidos: PDF/DOC/DOCX (+ XML se quiseres manter)
        const allowed = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'text/xml',          // opcional
            'application/xml',   // opcional
        ];
        if (form.resumeFile && !allowed.includes(form.resumeFile.type)) {
            return 'CV deve ser PDF/DOC/DOCX (ou XML, se permitido).';
        }

        // Tamanho máx: 10MB (ajusta conforme)
        if (form.resumeFile && form.resumeFile.size > 10 * 1024 * 1024) {
            return 'CV excede 10MB.';
        }

        return null;
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        setFeedback(null);

        const err = validate();
        if (err) {
            setFeedback({ type: 'error', text: err });
            return;
        }

        setLoading(true);
        abortRef.current = new AbortController();

        try {
            // Envio via multipart/form-data (FormData é construído no service)
            const res = await CandidateService.apply(
                {
                    FirstName: form.firstName.trim(),
                    MiddleName: form.middleName?.trim(),
                    LastName: form.lastName?.trim(),
                    Email: form.email.trim().toLowerCase(),
                    Phone: form.phone?.trim(),
                    Message: form.message.trim(),
                    ResumeFile: form.resumeFile, // File
                },
                { signal: abortRef.current.signal }
            );

            const ok = res?.WasSaved ?? res?.data?.WasSaved ?? true;
            if (ok) {
                setFeedback({ type: 'success', text: 'Candidatura enviada com sucesso!' });
                setForm({
                    firstName: '',
                    middleName: '',
                    lastName: '',
                    email: '',
                    phone: '',
                    message: '',
                    resumeFile: null,
                });
                setResumeFileName('');
            } else {
                setFeedback({ type: 'error', text: 'Não foi possível confirmar a candidatura.' });
            }
        } catch (error) {

            let msg;
            const data = error?.response?.data;
            if (typeof data === 'string') {
                msg = data; 
            } else if (data && typeof data === 'object') {
                msg = data.detail || data.title || data.message
                            || (data.errors ? Object.values(data.errors).flat().join(' · ') : null);
            }
            if (!msg) msg = error?.message || 'Falha ao submeter candidatura.';
            setFeedback({ type: 'error', text: msg });
        } finally {
            setLoading(false);
        }
    };

    const onCancel = () => {
        abortRef.current?.abort();
        setLoading(false);
    };

    return (
        <section style={{ maxWidth: 720, margin: '24px auto', padding: 16 }}>
            <h1>Candidatura</h1>

            <form onSubmit={onSubmit} noValidate style={{ display: 'grid', gap: 12 }}>
                <div style={{ display: 'grid', gap: 12 }}>
                    <input
                        name="firstName"
                        placeholder="First Name"
                        value={form.firstName}
                        onChange={onChange}
                    />
                    <input
                        name="middleName"
                        placeholder="Middle Name"
                        value={form.middleName}
                        onChange={onChange}
                    />
                    <input
                        name="lastName"
                        placeholder="Last Name"
                        value={form.lastName}
                        onChange={onChange}
                    />
                    <input
                        type="email"
                        name="email"
                        placeholder="E-mail"
                        value={form.email}
                        onChange={onChange}
                    />
                    <input
                        name="phone"
                        placeholder="Telemóvel"
                        value={form.phone}
                        onChange={onChange}
                    />
                    <textarea
                        name="message"
                        placeholder="Mensagem"
                        rows={5}
                        value={form.message}
                        onChange={onChange}
                    />
                </div>

                {/* Upload de ficheiro: mantém o botão “+” e o rótulo ao lado */}
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'auto 1fr',
                        gap: 12,
                        alignItems: 'center',
                    }}
                >
                    <label
                        htmlFor="resumeFile"
                        style={{
                            width: 42,
                            height: 42,
                            display: 'grid',
                            placeItems: 'center',
                            borderRadius: 10,
                            background: 'rgba(0,118,255,0.12)',
                            color: '#0057b7',
                            fontWeight: 700,
                            cursor: 'pointer',
                            border: '1px solid #e6e6e6',
                        }}
                        title="Anexar CV"
                    >
                        +
                    </label>
                    <input
                        id="resumeFile"
                        type="file"
                        name="resumeFile"
                        accept=".pdf,.doc,.docx,.xml" // ajusta conforme política
                        onChange={onChange}
                        hidden
                    />
                    <div
                        style={{
                            border: '1px solid #e6e6e6',
                            borderRadius: 10,
                            padding: '12px 14px',
                            color: '#666',
                        }}
                    >
                        {resumeFileName || 'Anexar CV (.pdf/.doc/.docx)'}
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    style={{
                        width: '100%',
                        borderRadius: 12,
                        padding: '14px 16px',
                        background: 'linear-gradient(90deg,#1565c0,#1e88e5)',
                        color: '#fff',
                        fontWeight: 700,
                        border: 'none',
                    }}
                >
                    {loading ? 'A enviar...' : 'Candidate-se'}
                </button>

                {loading && (
                    <button
                        type="button"
                        onClick={onCancel}
                        style={{
                            width: '100%',
                            borderRadius: 12,
                            padding: '10px 12px',
                            background: '#f5f5f5',
                            color: '#333',
                            fontWeight: 600,
                            border: '1px solid #ddd',
                        }}
                    >
                        Cancelar
                    </button>
                )}

                {feedback && (
                    <div
                        style={{
                            marginTop: 12,
                            borderRadius: 10,
                            padding: '12px 14px',
                            background: feedback.type === 'success' ? '#e9f7ec' : '#fdecea',
                            color: feedback.type === 'success' ? '#1e7e34' : '#b03a2e',
                            fontWeight: 600,
                        }}
                    >
                        {feedback.text}
                    </div>
                )}
            </form>
        </section >
    );
}