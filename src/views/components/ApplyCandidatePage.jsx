
import React, { useState, useRef } from 'react';
import {
    Box,
    Typography,
    TextField,
    Button,
    Stack,
    Alert,
} from '@mui/material';
import CandidateService from '../../services/CandidateService';
import useNotification from '../../utils/UseNotification';

const ui = {
    title: {
        fontSize: 32,
        fontWeight: 700,
        color: '#000',
        textAlign: 'center',
        mb: 3,
    },
    button: {
        bgcolor: '#000',
        color: '#fff',
        py: 1.25,
        fontWeight: 600,
        borderRadius: 2,
        textTransform: 'none',
        fontSize: 16,
        '&:hover': { bgcolor: '#FF9800', color: '#000' },
    },
    attach: {
        bgcolor: 'rgba(0,0,0,0.06)',
        color: '#000',
        fontWeight: 600,
        borderRadius: 2,
        textTransform: 'none',
        '&:hover': { bgcolor: 'rgba(255,152,0,0.25)' },
    },
};

export default function ApplyCandidatePage() {
    const [form, setForm] = useState({
        firstName: '',
        middleName: '',
        lastName: '',
        email: '',
        phone: '',
        message: '',
        resumeFile: null,
    });
    const [resumeFileName, setResumeFileName] = useState('');
    const [feedback, setFeedback] = useState(null);
    const [loading, setLoading] = useState(false);
    const abortRef = useRef(null);

    const notif = useNotification();

    const onChange = (e) => {
        const { name, value, files } = e.target;
        if (name === 'resumeFile') {
            const file = files?.[0] ?? null;
            setForm((prev) => ({ ...prev, resumeFile: file }));
            setResumeFileName(file ? file.name : '');
            setFeedback(null);
            return;
        }
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const validate = () => {
        if (!form.firstName?.trim()) return 'First Name é obrigatório.';
        if (!form.email?.trim()) return 'E-mail é obrigatório.';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return 'E-mail inválido.';
        if (!form.message?.trim()) return 'Mensagem é obrigatória.';
        if (!form.resumeFile) return 'CV é obrigatório.';
        const allowed = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ];
        if (form.resumeFile && !allowed.includes(form.resumeFile.type)) {
            return 'CV deve ser PDF/DOC/DOCX.';
        }
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
            const res = await CandidateService.apply(
                {
                    FirstName: form.firstName.trim(),
                    MiddleName: form.middleName?.trim(),
                    LastName: form.lastName?.trim(),
                    Email: form.email.trim().toLowerCase(),
                    Phone: form.phone?.trim(),
                    Message: form.message.trim(),
                    ResumeFile: form.resumeFile,
                },
                { signal: abortRef.current.signal }
            );

            const ok = res?.data?.WasSaved ?? res?.WasSaved ?? true;
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
                setFeedback({
                    type: 'error',
                    text: 'Não foi possível confirmar a candidatura.',
                });
            }
        } catch (error) {
            let msg;
            const data = error?.response?.data;
            if (typeof data === 'string') {
                msg = data;
            } else if (data && typeof data === 'object') {
                msg =
                    data.detail ||
                    data.title ||
                    data.message ||
                    (data.errors ? Object.values(data.errors).flat().join(' · ') : null);
            }
            if (!msg) msg = error?.message || 'Falha ao submeter candidatura.';
            notif({ severity: 'error', message: msg });
        } finally {
            setLoading(false);
        }
    };

    const onCancel = () => {
        abortRef.current?.abort();
        setLoading(false);
    };

    return (
        <Box component="form" onSubmit={onSubmit} noValidate>
            <Typography variant="h4" sx={ui.title}>
                Apply for a Job
            </Typography>

            {feedback && (
                <Alert
                    severity={feedback.type === 'success' ? 'success' : 'error'}
                    sx={{ mb: 2 }}
                >
                    {feedback.text}
                </Alert>
            )}

            <Stack spacing={2} sx={{ mb: 2 }}>
                <TextField
                    name="firstName"
                    label="First Name"
                    value={form.firstName}
                    onChange={onChange}
                    fullWidth
                    sx={{ bgcolor: '#fff', borderRadius: 1 }}
                />
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    <TextField
                        name="middleName"
                        label="Middle Name"
                        value={form.middleName}
                        onChange={onChange}
                        fullWidth
                        sx={{ bgcolor: '#fff', borderRadius: 1 }}
                    />
                    <TextField
                        name="lastName"
                        label="Last Name"
                        value={form.lastName}
                        onChange={onChange}
                        fullWidth
                        sx={{ bgcolor: '#fff', borderRadius: 1 }}
                    />
                </Stack>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    <TextField
                        type="email"
                        name="email"
                        label="E-mail"
                        value={form.email}
                        onChange={onChange}
                        fullWidth
                        sx={{ bgcolor: '#fff', borderRadius: 1 }}
                    />
                    <TextField
                        name="phone"
                        label="Phone"
                        value={form.phone}
                        onChange={onChange}
                        fullWidth
                        sx={{ bgcolor: '#fff', borderRadius: 1 }}
                    />
                </Stack>
                <TextField
                    name="message"
                    label="Message"
                    value={form.message}
                    onChange={onChange}
                    fullWidth
                    multiline
                    rows={5}
                    sx={{ bgcolor: '#fff', borderRadius: 1 }}
                />
            </Stack>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3 }}>
                <Button component="label" variant="contained" sx={ui.attach}>
                    Attach Resume (.pdf/.doc/.docx)
                    <input
                        hidden
                        id="resumeFile"
                        name="resumeFile"
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={onChange}
                    />
                </Button>
                <Box
                    sx={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        border: '1px solid #e6e6e6',
                        borderRadius: 2,
                        px: 2,
                        color: resumeFileName ? '#333' : '#888',
                        minHeight: 40,
                        bgcolor: '#fff',
                    }}
                >
                    {resumeFileName || 'No file selected'}
                </Box>
            </Stack>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    disabled={loading}
                    sx={ui.button}
                >
                    {loading ? 'Sending...' : 'Apply Now'}
                </Button>

                {loading && (
                    <Button
                        type="button"
                        variant="outlined"
                        onClick={onCancel}
                        fullWidth
                        sx={{
                            borderColor: '#000',
                            color: '#000',
                            fontWeight: 600,
                            textTransform: 'none',
                            '&:hover': { borderColor: '#FF9800', color: '#FF9800' },
                        }}
                    >
                        Cancel
                    </Button>
                )}
            </Stack>
        </Box>
    );
}