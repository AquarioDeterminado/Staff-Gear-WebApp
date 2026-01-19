/*
  Popup de formulário para aceitar o candidato,
  enviar dados à API e convertê-lo em colaborador.
*/
import React, { useEffect, useState } from 'react';
import FormPopup from '../popups/FormPopup';

export default function AcceptCandidateDialog({
  open,
  candidate,
  jobListingTitle = '',
  jobListingDepartment = '',
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
      department: form.department ? '' : 'Selecione um departamento (ou deixe vazio se for permitido).',
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

  return (
    <FormPopup
      open={open}
      title={
        'Accept Candidate: ' +
        (candidate?.firstName ? candidate.firstName + ' ' : '') +
        (candidate?.lastName || '')
      }
      maxWidth={maxWidth}
      fields={[
        {
          type: 'text',
          label: 'Job Title',
          value: form.jobTitle,
          onChange: setField('jobTitle'),
          helperText: "Leave empty to use 'New Hire'",
        },
        {
          type: 'select',
          label: 'Department',
          value: form.department,
          onChange: setField('department'),
          options: [{ value: '', label: '-- Select Department --' }].concat(
            (departments || []).map((d) => ({ value: d, label: d }))
          ),
          error: !!errors.department,
          helperText: errors.department || undefined,
        },
        {
          type: 'password',
          label: 'Password',
          value: form.defaultPassword,
          onChange: setField('defaultPassword'),
          helperText: errors.defaultPassword || 'Will be sent to the employee (must change on first login)',
          error: !!errors.defaultPassword,
        },
      ]}
      onCancel={onClose}
      onSubmit={handleSubmit}
      loading={loading}
      submitLabel="Save"
      submitSx={{ bgcolor: '#000', color: '#fff', '&:hover': { bgcolor: '#222' } }}
    />
  );
}
