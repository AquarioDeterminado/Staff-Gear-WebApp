import React, {useEffect, useState} from 'react';
import {Select, MenuItem} from '@mui/material';
import EmployeeService from '../../services/EmployeeService';

export const DepartmentSelectField = ({onChange, error, fullWidth = false, autoWidth = false}) => {
  const [departments, setDepartments] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState("default");

  useEffect(() => {
    async function fetchDepartments() {
      const deps = await EmployeeService.getAllDepartments();
      setDepartments(deps);
    }
    fetchDepartments();
  }, []);

  return (
    <Select
      value={selectedDepartment}
      onChange={(e) => { 
        setSelectedDepartment(e.target.value);
        onChange(e.target.value);
      }}
      size='small'
      label="Department"  
      error={!!error}
      helperText={error}
      fullWidth={fullWidth}
      autoWidth={autoWidth}
    >
      <MenuItem disabled value="default">Select Department</MenuItem>
      {departments.map((d) => (
        <MenuItem key={d} value={d}>
          {d}
        </MenuItem>
      ))}
    </Select>
  );
} 