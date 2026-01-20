/*
  Dialog for editing a job listing with form fields:
  - JobTitle (required)
  - Location (required)
  - JobType (required, dropdown: Remote/Hybrid/On-site)
  - Description (required, multiline)
  - NumberOfPositions (required)
  - Department (optional, dropdown)
  - Status (dropdown)
*/
import React, { useEffect, useState } from 'react';
import FormPopup from '../popups/FormPopup';
import { TextField, Alert } from '@mui/material';
import { DepartmentSelectField } from '../../fields/DepartmentSelectField';

const JOB_TYPE_OPTIONS = [
  { value: '0', label: 'Remote' },
  { value: '1', label: 'Hybrid' },
  { value: '2', label: 'On-site' },
];

const STATUS_OPTIONS = [
  { value: '0', label: 'Open' },
  { value: '1', label: 'Reviewing Applications' },
  { value: '2', label: 'Closed' },
];

export default function EditJobListingDialog({
  open,
  jobListing,
  onClose,
  onSubmit,
  maxWidth = 'md',
  loading = false,
}) {
  const [form, setForm] = useState({
    jobTitle: '',
    location: '',
    jobType: '',
    description: '',
    numberOfPositions: '',
    department: '',
    status: '',
  });

  const [errors, setErrors] = useState({
    jobTitle: '',
    location: '',
    jobType: '',
    description: '',
    numberOfPositions: '',
    department: '',
    status: '',
  });

  const [showClosingWarning, setShowClosingWarning] = useState(false);

  useEffect(() => {
    if (open && jobListing) {
      setForm({
        jobTitle: jobListing.jobTitle || '',
        location: jobListing.location || '',
        jobType: String(jobListing.jobType ?? 0),
        description: jobListing.description || '',
        numberOfPositions: jobListing.numberOfPositions?.toString() || '',
        department: jobListing.departmentName || '',
        status: String(jobListing.status ?? 0),
      });
      setErrors({
        jobTitle: '',
        location: '',
        jobType: '',
        description: '',
        numberOfPositions: '',
        department: '',
        status: '',
      });
    }
  }, [open, jobListing]);

  const setField = (field) => (value) => {
    setForm((prev) => {
      const updated = { ...prev, [field]: value };
      // Show warning if status is changing to Closed (value '2')
      if (field === 'status') {
        setShowClosingWarning(value === '2');
      }
      return updated;
    });
  };

  const validate = () => {
    const newErrors = {
      jobTitle: form.jobTitle.trim() ? '' : 'Job Title is required',
      location: form.location.trim() ? '' : 'Location is required',
      jobType: form.jobType !== '' ? '' : 'Job Type is required',
      description: form.description.trim() ? '' : 'Description is required',
      numberOfPositions:
        form.numberOfPositions && parseInt(form.numberOfPositions) > 0
          ? ''
          : 'Number of Positions must be greater than 0',
      department: '',
      status: form.status !== '' ? '' : 'Status is required',
    };
    setErrors(newErrors);
    return Object.values(newErrors).every((x) => x === '');
  };

  const handleSubmit = async () => {
    const isValid = validate();
    if (!isValid) return;

    try {
      const jobListingData = {
        jobListingID: jobListing.jobListingID,
        jobTitle: form.jobTitle.trim(),
        location: form.location.trim(),
        jobType: parseInt(form.jobType),
        description: form.description.trim(),
        numberOfPositions: parseInt(form.numberOfPositions),
        departmentName: form.department || null,
        status: parseInt(form.status),
      };

      await onSubmit(jobListingData);
      onClose();
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  const fields = [
    {
      type: 'text',
      label: 'Job Title*',
      value: form.jobTitle,
      onChange: setField('jobTitle'),
      error: errors.jobTitle,
      helperText: errors.jobTitle || undefined,
      required: true,
    },
    {
      type: 'text',
      label: 'Location*',
      value: form.location,
      onChange: setField('location'),
      error: errors.location,
      helperText: errors.location || undefined,
      required: true,
    },
    {
      type: 'select',
      label: 'Job Type*',
      value: form.jobType,
      onChange: setField('jobType'),
      options: [
        { value: '', label: '-- Select Job Type --' },
        ...JOB_TYPE_OPTIONS,
      ],
      error: errors.jobType,
      helperText: errors.jobType || undefined,
      required: true,
    },
    {
      type: 'select',
      label: 'Status*',
      value: form.status,
      onChange: setField('status'),
      options: [
        { value: '', label: '-- Select Status --' },
        ...STATUS_OPTIONS,
      ],
      error: errors.status,
      helperText: errors.status || undefined,
      required: true,
    },
    {
      type: 'text',
      label: 'Number of Positions*',
      value: form.numberOfPositions,
      onChange: setField('numberOfPositions'),
      error: errors.numberOfPositions,
      helperText: errors.numberOfPositions || 'Must be greater than 0',
      required: true,
      inputProps: { type: 'number', min: 1 },
    },
    {
      type: 'custom',
      render: (error) => (
        <DepartmentSelectField
          value={form.department}
          onChange={setField('department')}
          error={error}
          fullWidth={true}
        />
      ),
      label: 'Department',
      error: errors.department,
    },
    {
      type: 'custom',
      render: (error) => (
        <TextField
          label="Description*"
          value={form.description}
          onChange={(e) => setField('description')(e.target.value)}
          multiline
          rows={8}
          fullWidth
          size="small"
          required
          error={!!error}
          helperText={error || 'Provide job description details'}
        />
      ),
      error: errors.description,
    },
    ...(showClosingWarning ? [
      {
        type: 'custom',
        render: () => (
          <Alert severity="warning">
            <strong>⚠️ Warning:</strong> Closing this job listing will automatically reject all associated candidate applications.
          </Alert>
        ),
      }
    ] : []),
  ];

  return (
    <FormPopup
      open={open}
      title={`Edit Job Listing: ${jobListing?.jobTitle || ''}`}
      maxWidth={maxWidth}
      fields={fields}
      onCancel={onClose}
      onSubmit={handleSubmit}
      loading={loading}
      submitLabel="Save Changes"
      submitSx={{ bgcolor: '#ff9100', color: '#000', '&:hover': { bgcolor: '#d67900' } }}
    />
  );
}
