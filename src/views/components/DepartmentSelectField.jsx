import React, {useEffect, useState} from 'react';
import {Select, MenuItem} from '@mui/material';
import EmployeeService from '../../services/EmployeeService';

export const DepartmentSelectField = ({inputvalue, onChange, error}) => {
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
      value={inputvalue !== null ? inputvalue === ''? "default" : inputvalue : selectedDepartment}
      onChange={(e) => { 
        setSelectedDepartment(e.target.value);
        onChange(e); 
      }}
      size='small'
      error={!!error}
      autoWidth
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