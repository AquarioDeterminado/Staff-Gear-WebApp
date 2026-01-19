/*
  Dialog for creating a new job listing with form fields:
  - JobTitle (required)
  - Location (required)
  - JobType (required, dropdown: Remote/Hybrid/On-site)
  - Description (required, multiline)
  - NumberOfPositions (required)
  - Status defaults to Open (0)
*/
import React, { useEffect, useState } from 'react';
import FormPopup from '../popups/FormPopup';
import { TextField } from '@mui/material';
import { DepartmentSelectField } from '../../fields/DepartmentSelectField';

const JOB_TYPE_OPTIONS = [
  { value: 0, label: 'Remote' },
  { value: 1, label: 'Hybrid' },
  { value: 2, label: 'On-site' },
];

export default function CreateJobListingDialog({
  open,
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
  });

  const [errors, setErrors] = useState({
    jobTitle: '',
    location: '',
    jobType: '',
    description: '',
    numberOfPositions: '',
    department: '',
  });

  useEffect(() => {
    if (open) {
      setForm({
        jobTitle: '',
        location: '',
        jobType: '',
        description: '',
        numberOfPositions: '',
        department: '',
      });
      setErrors({
        jobTitle: '',
        location: '',
        jobType: '',
        description: '',
        numberOfPositions: '',
        department: '',
      });
    }
  }, [open]);

  const setField = (field) => (value) =>
    setForm((prev) => ({ ...prev, [field]: value }));

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
      department: '', // optional field
    };
    setErrors(newErrors);
    return Object.values(newErrors).every((x) => x === '');
  };

  const handleSubmit = async () => {
    const isValid = validate();
    if (!isValid) return;

    try {
      const jobListingData = {
        jobTitle: form.jobTitle.trim(),
        location: form.location.trim(),
        jobType: parseInt(form.jobType),
        description: form.description.trim(),
        numberOfPositions: parseInt(form.numberOfPositions),
        departmentName: form.department || null, // Send department name if selected
        status: 0, // Default to Open
      };

      await onSubmit(jobListingData);
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
  ];

  return (
    <FormPopup
      open={open}
      title="Create New Job Listing"
      maxWidth={maxWidth}
      fields={fields}
      onCancel={onClose}
      onSubmit={handleSubmit}
      loading={loading}
      submitLabel="Create"
      submitSx={{ bgcolor: '#000', color: '#fff', '&:hover': { bgcolor: '#222' } }}
    />
  );
}
