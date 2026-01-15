import React, {useEffect, useState} from 'react';
import {Select, MenuItem} from '@mui/material';
import EmployeeService from '../../services/EmployeeService';

export const DepartmentSelectField = ({value, onChange, error, fullWidth = false, autoWidth = false}) => {
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
      value={value || ""}
      onChange={(e) => { 
        onChange(e.target.value);
      }}
      size='small'
      label="Department"  
      error={!!error}
      helperText={error}
      fullWidth={fullWidth}
      autoWidth={autoWidth}
    >
      <MenuItem value="">All Departments</MenuItem>
      {departments.map((d) => (
        <MenuItem key={d} value={d}>
          {d}
        </MenuItem>
      ))}
    </Select>
  );
} 