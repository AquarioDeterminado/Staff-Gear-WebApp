/*
  Popup de confirmação para rejeitar o candidato, 
  chamar a API e removê-lo da lista.
*/
import React, { useState } from 'react';
import ConfirmPopup from '../popups/ConfirmPopup';

export default function RejectCandidateDialog({
  open,
  candidate,
  onClose,
  onReject,
  maxWidth = 'sm',
}) {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    if (!candidate) return;
    try {
      setLoading(true);
      await onReject(candidate.jobCandidateId);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const fullName =
    (candidate?.firstName ? candidate.firstName + ' ' : '') +
    (candidate?.lastName || '');

  return (
    <ConfirmPopup
      open={open}
      title="Confirm Reject"
      content={'Are you sure you want to reject the candidate ' + fullName + '?'}
      onCancel={onClose}
      onConfirm={handleConfirm}
      confirmLabel="Delete"
      loading={loading}
      maxWidth={maxWidth}
      confirmButtonSx={{ bgcolor: '#000', color: '#fff', '&:hover': { bgcolor: '#222' } }}
    />
  );
}
