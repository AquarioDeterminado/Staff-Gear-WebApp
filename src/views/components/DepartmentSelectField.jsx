import React, {useEffect, useState} from 'react';
import {FormControl, Select, MenuItem, FormHelperText} from '@mui/material';
import EmployeeService from '../../services/EmployeeService';

export const DepartmentSelectField = ({value, onChange, error, fullWidth = false, autoWidth = false, sx = {}}) => {
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    async function fetchDepartments() {
      const deps = await EmployeeService.getAllDepartments();
      setDepartments(deps);
    }
    fetchDepartments();
  }, []);

  return (
    <FormControl fullWidth={fullWidth} error={!!error} sx={sx}>
      <Select
        value={value || ""}
        onChange={(e) => { 
          onChange(e.target.value);
        }}
        size='small'
        label="Department"
        autoWidth={autoWidth}
      >
        <MenuItem value="">All Departments</MenuItem>
        {departments.map((d) => (
          <MenuItem key={d} value={d}>
            {d}
          </MenuItem>
        ))}
      </Select>
      {error && <FormHelperText>{error}</FormHelperText>}
    </FormControl>
  );
} 