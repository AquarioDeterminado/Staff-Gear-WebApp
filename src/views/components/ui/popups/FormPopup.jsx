/*
Formato de Popup com formulário integrado
*/
import React from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, Stack, TextField, MenuItem, CircularProgress
} from '@mui/material';

export default function FormPopup({
  open,
  title = 'Form',
  fields = [],
  onCancel,
  onSubmit,
  submitLabel = 'Save',
  cancelLabel = 'Cancel',
  submitSx,
  cancelSx,
  maxWidth = 'sm',
  contentProps,
  submitDisabled = false,
  loading = false,
}) {
  return (
    <Dialog
      open={open}
      onClose={onCancel}
      fullWidth
      maxWidth={maxWidth}
      aria-labelledby="form-dialog-title"
    >
      <DialogTitle id="form-dialog-title" sx={{ fontWeight: 700 }}>
        {title}
      </DialogTitle>

      <DialogContent dividers {...contentProps}>
        <Stack spacing={1.5}>
          {fields.map((f, idx) => {
            if (f.type === 'select') {
              return (
                <TextField
                  key={idx}
                  select
                  label={f.label}
                  value={f.value ?? ''}
                  onChange={(e) => f.onChange?.(e.target.value)}
                  size="small"
                  fullWidth
                  required={!!f.required}
                  error={!!f.error}
                  helperText={f.error}
                >
                  {(f.options || []).map((opt) => (
                    <MenuItem key={`${opt.value ?? opt.label}-${idx}`} value={opt.value}>
                      {opt.label}
                    </MenuItem>
                  ))}
                </TextField>
              );
            }

            return (
              <TextField
                key={idx}
                type={f.type || 'text'}
                label={f.label}
                value={f.value ?? ''}
                onChange={(e) => f.onChange?.(e.target.value)}
                size="small"
                fullWidth
                required={!!f.required}
                error={!!f.error}
                helperText={f.error}
                InputProps={f.startAdornment ? { startAdornment: f.startAdornment } : undefined}
              />
            );
          })}
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button
          onClick={onCancel}
          sx={{ textTransform: 'none', ...(cancelSx || {}) }}
        >
          {cancelLabel}
        </Button>
        <Button
          onClick={onSubmit}
          variant="contained"
          disabled={submitDisabled || loading}
          sx={{
            bgcolor: '#000',
            color: '#fff',
            textTransform: 'none',
            fontWeight: 700,
            '&:hover': { bgcolor: '#222' },
            ...(submitSx || {}),
          }}
        >
          {loading ? <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} /> : null}
          {loading ? 'Saving...' : submitLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
