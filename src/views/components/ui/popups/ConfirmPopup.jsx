/*
Formato para Popups de confirmação
*/
import React from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, CircularProgress
} from '@mui/material';

export default function ConfirmPopup({
  open,
  title = 'Confirm Action',
  content = 'Are you sure?',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  confirmButtonSx,
  cancelButtonSx,
  maxWidth = 'sm',
  contentProps,
  confirmDisabled = false,
  loading = false,
}) {
  return (
    <Dialog
      open={open}
      onClose={onCancel}
      fullWidth
      maxWidth={maxWidth}
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-description"
    >
      <DialogTitle id="confirm-dialog-title" sx={{ fontWeight: 700 }}>
        {title}
      </DialogTitle>

      <DialogContent dividers {...contentProps}>
        {typeof content === 'string' ? (
          <Typography id="confirm-dialog-description">{content}</Typography>
        ) : (
          content
        )}
      </DialogContent>

      <DialogActions>
        <Button
          onClick={onCancel}
          sx={{ textTransform: 'none', ...(cancelButtonSx || {}) }}
        >
          {cancelLabel}
        </Button>

        <Button
          onClick={onConfirm}
          variant="contained"
          disabled={confirmDisabled || loading}
          sx={{
            bgcolor: '#000',
            color: '#fff',
            textTransform: 'none',
            fontWeight: 700,
            '&:hover': { bgcolor: '#222' },
            ...(confirmButtonSx || {}),
          }}
        >
          {loading ? <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} /> : null}
          {loading ? 'Processing...' : confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
