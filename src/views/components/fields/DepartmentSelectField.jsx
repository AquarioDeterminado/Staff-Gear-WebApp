import React, {useEffect, useState} from 'react';
import {Select, MenuItem} from '@mui/material';
import EmployeeService from '../../../services/EmployeeService';

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
    
    <Select
      value={value === "" || value === null || value === undefined ? "default" : value}
      onChange={(e) => { 
        onChange(e.target.value === "default" ? "" : e.target.value);
      }}
      size='small'
      label="Department"  
      error={!!error}
      helperText={error}
      fullWidth={fullWidth}
      autoWidth={autoWidth}
      sx={sx}
    >
      <MenuItem value="default">All Departments</MenuItem>
      {departments.map((d) => (
        <MenuItem key={d} value={d}>
          {d}
        </MenuItem>
      ))}
    </Select>
  );
} 