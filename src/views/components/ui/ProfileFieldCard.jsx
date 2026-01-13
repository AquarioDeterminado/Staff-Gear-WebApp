/*
Card genérico para campos do perfil
*/
import React from 'react';
import { Paper, Stack, Typography, TextField, InputAdornment } from '@mui/material';

export default function ProfileFieldCard({
  label,
  value,
  onChange,
  isEdit,
  icon,
  width = 280,
  type = 'text',
  helperText,
  startAdornment,
}) {
  return (
    <Paper
      elevation={3}
      sx={{
        width,
        minHeight: 72,
        px: 2.75,
        py: 1.85,
        borderRadius: 3,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {isEdit ? (
        <TextField
          label={label}
          type={type}
          fullWidth
          size="small"
          autoComplete="off"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          helperText={helperText}
          InputProps={
            startAdornment
              ? { startAdornment: <InputAdornment position="start">{startAdornment}</InputAdornment> }
              : undefined
          }
        />
      ) : (
        <Stack direction="row" spacing={1.25} alignItems="center" justifyContent="center">
          {icon}
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {value || ''}
          </Typography>
        </Stack>
      )}
    </Paper>
  );
}
