import React from 'react';
import FormPopup from '../popups/FormPopup';
import DeleteIcon from '@mui/icons-material/Delete';

export default function DeleteJobListingDialog({
  open,
  jobListing,
  onClose,
  onConfirm,
  loading = false,
}) {
  const handleConfirm = async () => {
    await onConfirm(jobListing);
  };

  const fields = [
    {
      type: 'custom',
      render: () => (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <p style={{ fontSize: '16px', marginBottom: '16px' }}>
            Are you sure you want to delete <strong>'{jobListing?.jobTitle}'</strong>? This action cannot be undone.
          </p>
        </div>
      ),
    },
  ];

  return (
    <FormPopup
      open={open}
      title="Delete Job Listing"
      maxWidth="sm"
      fields={fields}
      onCancel={onClose}
      onSubmit={handleConfirm}
      loading={loading}
      submitLabel="Delete"
      submitSx={{ bgcolor: '#d32f2f', color: '#fff', '&:hover': { bgcolor: '#b71c1c' } }}
      contentProps={{
        sx: { minHeight: '120px', display: 'flex', alignItems: 'center' }
      }}
    />
  );
}
