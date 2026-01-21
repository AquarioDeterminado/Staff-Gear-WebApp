/*
  Popup de formulário para aceitar o candidato,
  enviar dados à API e convertê-lo em colaborador.
*/
import React, { useEffect, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Select, MenuItem, Button, Stack, Alert, CircularProgress, FormHelperText } from '@mui/material';

export default function AcceptCandidateDialog({
  open,
  candidate,
  jobListingTitle = '',
  jobListingDepartment = '',
  jobListingAvailablePositions = null,
  departments = [],
  defaultPassword = 'Welcome@123',
  onClose,
  onAccept,
  maxWidth = 'md',
}) {
  const [form, setForm] = useState({
    jobTitle: '',
    department: '',
    defaultPassword,
  });
  const [errors, setErrors] = useState({
    jobTitle: '',
    department: '',
    defaultPassword: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      const selectedDept = jobListingDepartment && departments.includes(jobListingDepartment)
        ? jobListingDepartment
        : (departments && departments.length > 0 ? departments[0] : '');
      
      setForm({
        jobTitle: jobListingTitle || '',
        department: selectedDept,
        defaultPassword,
      });
      setErrors({ jobTitle: '', department: '', defaultPassword: '' });
    }
  }, [open, departments, defaultPassword, jobListingTitle, jobListingDepartment]);

  const setField = (field) => (value) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const validate = () => {
    const e = {
      jobTitle: '',
      department: form.department ? '' : 'Selecione um departamento.',
      defaultPassword: form.defaultPassword && form.defaultPassword.length >= 6 ? '' : 'A password deve ter pelo menos 6 caracteres.',
    };
    setErrors(e);
    return Object.values(e).every((x) => x === '');
  };

  const handleSubmit = async () => {
    if (!candidate) return;
    const ok = validate();
    if (!ok) return;
    try {
      setLoading(true);
      await onAccept({
        jobCandidateId: candidate.jobCandidateId,
        jobTitle: form.jobTitle || undefined,
        department: form.department || undefined,
        defaultPassword: form.defaultPassword || undefined,
      });
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const isNoPositionsAvailable = jobListingAvailablePositions !== null && jobListingAvailablePositions <= 0;
  const isLowPositions = jobListingAvailablePositions !== null && jobListingAvailablePositions === 1;

  return (
    <Dialog open={open} onClose={onClose} maxWidth={maxWidth} fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>
        Accept Candidate: {candidate?.firstName} {candidate?.lastName}
      </DialogTitle>
      <DialogContent sx={{ pt: 2 }}>
        <Stack spacing={2}>
          {isNoPositionsAvailable && (
            <Alert severity="error">
              No available positions for this job listing! Cannot accept this candidate.
            </Alert>
          )}
          {isLowPositions && !isNoPositionsAvailable && (
            <Alert severity="warning">
              Only 1 position remaining! This is the last candidate you can accept for this job listing.
            </Alert>
          )}
          {jobListingAvailablePositions !== null && jobListingAvailablePositions > 1 && (
            <Alert severity="info">
              {jobListingAvailablePositions} positions available for this job listing.
            </Alert>
          )}

          <TextField
            label="Job Title"
            value={form.jobTitle}
            onChange={(e) => setField('jobTitle')(e.target.value)}
            fullWidth
            size="small"
            helperText="Leave empty to use 'New Hire'"
          />

          <div>
            <Select
              label="Department"
              value={form.department}
              onChange={(e) => setField('department')(e.target.value)}
              fullWidth
              size="small"
              error={!!errors.department}
            >
              <MenuItem value="">
                <em>-- Select Department --</em>
              </MenuItem>
              {(departments || []).map((d) => (
                <MenuItem key={d} value={d}>
                  {d}
                </MenuItem>
              ))}
            </Select>
            {errors.department && <FormHelperText error>{errors.department}</FormHelperText>}
          </div>

          <TextField
            label="Password"
            type="password"
            value={form.defaultPassword}
            onChange={(e) => setField('defaultPassword')(e.target.value)}
            fullWidth
            size="small"
            error={!!errors.defaultPassword}
            helperText={errors.defaultPassword || 'Will be sent to the employee (must change on first login)'}
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={loading || isNoPositionsAvailable}
          variant="contained"
          sx={{ bgcolor: '#4caf50', color: '#fff', '&:hover': { bgcolor: '#45a049' } }}
        >
          {loading ? <CircularProgress size={24} /> : 'Accept'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
