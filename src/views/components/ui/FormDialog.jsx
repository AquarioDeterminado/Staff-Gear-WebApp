/*
Diálogo simples para confirmação
*/

import React from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Stack, TextField, Select, MenuItem, InputAdornment
} from '@mui/material';

export default function FormDialog({
  open,
  title,
  fields = [], // [{type:'text'|'number'|'date'|'password'|'select', label, value, onChange, helperText, options:[...], InputProps}]
  onCancel,
  onSubmit,
  submitLabel = 'Save',
  cancelLabel = 'Cancel',
  submitSx,
  maxWidth = 'sm',
  fullWidth = true,
}) {
  return (
    <Dialog open={open} onClose={onCancel} maxWidth={maxWidth} fullWidth={fullWidth}>
      <DialogTitle sx={{ fontWeight: 700 }}>{title}</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={1.5} sx={{ mt: 0.5 }}>
          {fields.map((f, idx) => {
            if (f.type === 'select') {
              return (
                <Select
                  key={idx}
                  value={f.value}
                  onChange={(e) => f.onChange(e.target.value)}
                  size="small"
                  displayEmpty
                  fullWidth
                >
                  {(f.options || []).map((opt) => (
                    <MenuItem key={opt.value ?? opt} value={opt.value ?? opt}>
                      {opt.label ?? opt}
                    </MenuItem>
                  ))}
                </Select>
              );
            }
            return (
              <TextField
                key={idx}
                type={f.type || 'text'}
                label={f.label}
                value={f.value}
                onChange={(e) => f.onChange(e.target.value)}
                fullWidth
                size="small"
                helperText={f.helperText}
                InputProps={f.InputProps ?? (f.startAdornment ? {
                  startAdornment: <InputAdornment position="start">{f.startAdornment}</InputAdornment>
                } : undefined)}
              />
            );
          })}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel}>{cancelLabel}</Button>
        <Button onClick={onSubmit} variant="contained" sx={submitSx}>
          {submitLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
