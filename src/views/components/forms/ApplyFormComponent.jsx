import React, { useState, useRef } from 'react';
import {
    Box,
    Typography,
    TextField,
    Button,
    Stack,
    Alert,
} from '@mui/material';
import { Send } from '@mui/icons-material';
import CandidateService from '../../../services/CandidateService';
import useNotification from '../../../utils/UseNotification';

const ui = {
    title: {
        fontSize: 32,
        fontWeight: 700,
        color: '#000',
        textAlign: 'center',
        mb: 3,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 600,
        color: '#000',
        mb: 2,
    },
    button: {
        bgcolor: '#ff9800',
        color: '#fff',
        py: 1.25,
        fontWeight: 600,
        borderRadius: 2,
        textTransform: 'none',
        fontSize: 16,
        '&:hover': { bgcolor: '#e68a00', color: '#fff' },
    },
    attach: {
        bgcolor: 'rgba(255,152,0,0.1)',
        color: '#ff9800',
        fontWeight: 600,
        borderRadius: 2,
        textTransform: 'none',
        border: '1px solid rgba(255,152,0,0.3)',
        '&:hover': { bgcolor: 'rgba(255,152,0,0.2)' },
    },
};

export default function ApplyFormComponent({ jobListingId = null }) {
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
    const [feedback, setFeedback] = useState({"firstName":"","middleName":"","lastName":"","email":"","phone":"","message":"","resumeFile":""});
    const [loading, setLoading] = useState(false);
    const abortRef = useRef(null);

    const notif = useNotification();

    const onChange = (e) => {
        const { name, value, files } = e.target;
        if (name === 'resumeFile') {
            const file = files?.[0] ?? null;
            setForm((prev) => ({ ...prev, resumeFile: file }));
            setResumeFileName(file ? file.name : '');
            setFeedback((prev) => ({ ...prev, resumeFile: '' }));
            return;
        }
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const validate = () => {
        let isValid = true;
        setFeedback({"firstName":"","middleName":"","lastName":"","email":"","phone":"","message":"","resumeFile":""});

        if (!form.firstName?.trim()) {
            setFeedback((prev) => ({ ...prev, firstName: 'First Name required.' }));
            isValid = false;
        }
        if (!form.email?.trim()) {
            setFeedback((prev) => ({ ...prev, email: 'E-mail is required.' }));
            isValid = false;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
            setFeedback((prev) => ({ ...prev, email: 'Invalid e-mail.' }));
            isValid = false;
        }
        if (!form.message?.trim()) {
            setFeedback((prev) => ({ ...prev, message: 'Message is required.' }));
            isValid = false;
        }
        if (!form.resumeFile) {
            setFeedback((prev) => ({ ...prev, resumeFile: 'CV is required.' }));
            isValid = false;
        }
        const allowed = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ];
        if (form.resumeFile && !allowed.includes(form.resumeFile.type)) {
            setFeedback((prev) => ({ ...prev, resumeFile: 'CV must be PDF/DOC/DOCX.' }));
            isValid = false;
        }
        if (form.resumeFile && form.resumeFile.size > 10 * 1024 * 1024) {
            setFeedback((prev) => ({ ...prev, resumeFile: 'CV exceeds 10MB.' }));
            isValid = false;
        }
        return isValid;
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        const valid = validate();
        if (!valid) {
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
                    JobListingID: jobListingId,
                },
                { signal: abortRef.current.signal }
            );

            const ok = res?.data?.WasSaved ?? res?.WasSaved ?? true;
            if (ok) {
                notif({ severity: 'success', message: 'Application submitted successfully!' });
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
                notif({ severity: 'error', message: 'Unable to confirm application.' });
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
            if (!msg) msg = error?.message || 'Error Submitting Application.';
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
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                <Send sx={{ color: '#ff9800', fontSize: 22 }} />
                <Typography variant="h6" sx={{ ...ui.sectionTitle, m: 0 }}>
                    Submit Application
                </Typography>
            </Box>

            <Stack spacing={2} sx={{ mb: 2 }}>
                <TextField
                    name="firstName"
                    label="First Name*"
                    value={form.firstName}
                    onChange={onChange}
                    fullWidth
                    sx={{ bgcolor: '#fff', borderRadius: 1 }}
                    error={!!feedback.firstName}
                    helperText={feedback.firstName}
                />
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    <TextField
                        name="middleName"
                        label="Middle Name"
                        value={form.middleName}
                        onChange={onChange}
                        fullWidth
                        sx={{ bgcolor: '#fff', borderRadius: 1 }}
                        error={!!feedback.middleName}
                        helperText={feedback.middleName}
                    />
                    <TextField
                        name="lastName"
                        label="Last Name"
                        value={form.lastName}
                        onChange={onChange}
                        fullWidth
                        sx={{ bgcolor: '#fff', borderRadius: 1 }}
                        error={!!feedback.lastName}
                        helperText={feedback.lastName}
                    />
                </Stack>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    <TextField
                        type="email"
                        name="email"
                        label="E-mail*"
                        value={form.email}
                        onChange={onChange}
                        fullWidth
                        sx={{ bgcolor: '#fff', borderRadius: 1 }}
                        error={!!feedback.email}
                        helperText={feedback.email}
                    />
                    <TextField
                        name="phone"
                        label="Phone"
                        value={form.phone}
                        onChange={onChange}
                        fullWidth
                        sx={{ bgcolor: '#fff', borderRadius: 1 }}
                        error={!!feedback.phone}
                        helperText={feedback.phone}
                    />
                </Stack>
                <TextField
                    name="message"
                    label="Message*"
                    value={form.message}
                    onChange={onChange}
                    fullWidth
                    multiline
                    rows={5}
                    sx={{ bgcolor: '#fff', borderRadius: 1 }}
                    error={!!feedback.message}
                    helperText={feedback.message}
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
                        border: '1px solid #ddd',
                        borderRadius: 2,
                        px: 2,
                        color: resumeFileName ? '#333' : '#999',
                        minHeight: 40,
                        bgcolor: '#f5f5f5',
                        fontSize: '0.875rem',
                    }}
                >
                    {feedback.resumeFile ? <p style={{ color: 'red' }}>{feedback.resumeFile}</p> : resumeFileName || 'No file selected'}
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
                            borderColor: '#ff9800',
                            color: '#ff9800',
                            fontWeight: 600,
                            textTransform: 'none',
                            '&:hover': { borderColor: '#e68a00', color: '#e68a00', bgcolor: 'rgba(255,152,0,0.05)' },
                        }}
                    >
                        Cancel
                    </Button>
                )}
            </Stack>
        </Box>
    );
}