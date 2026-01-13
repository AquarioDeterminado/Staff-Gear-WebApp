/* 
Diálogo genérico para formulários
*/

import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';

export default function ConfirmDialog({
  open,
  title,
  content,
  onCancel,
  onConfirm,
  cancelLabel = 'Cancel',
  confirmLabel = 'Confirm',
  confirmSx,
  maxWidth = 'xs',
  fullWidth = true,
}) {
  return (
    <Dialog open={open} onClose={onCancel} maxWidth={maxWidth} fullWidth={fullWidth}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>{content}</DialogContent>
      <DialogActions>
        <Button onClick={onCancel}>{cancelLabel}</Button>
        <Button onClick={onConfirm} variant="contained" sx={confirmSx}>
          {confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
