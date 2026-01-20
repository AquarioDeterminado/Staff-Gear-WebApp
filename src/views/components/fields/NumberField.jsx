import React from 'react';
import {TextField} from '@mui/material';

export default function NumberField({label, type, value, onChange, error, fullWidth = false, sx = {}}) {
  var regex = /^[0-9]*$/;
  if (type == "float") {
    regex = /^[0-9]*\.?[0-9]*$/;
  } else {
    regex = /^[0-9]*$/;
  }

  function handleChange(e) {
    const newValue = e.target.value;
    // Allow only numbers and empty string
    console.log('New value:', regex, newValue);
    if (newValue === '' || regex.test(newValue)) {
      onChange(newValue);
    }
  }
  
  return (
    <TextField
      label={label}
      type="text"
      value={value}
      onChange={handleChange}
      size="small"
      error={!!error}
      helperText={error}
      fullWidth={fullWidth}
      sx={sx}
    />
  );
}