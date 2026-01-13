import React, { useEffect, useState } from 'react';
import { Autocomplete, TextField } from '@mui/material';
import EmployeeService from '../../services/EmployeeService';

export const EmployeeSearchField = ({ values, onChange, error }) => {

  const [inputEmployee, setInputEmployee] = useState(null);
  const [employees, setEmployees] = useState([]);


  useEffect(() => {
    async function getAllEmployees() {
      if (values && values.length > 0) {
        setEmployees(values);
        return;
      }

      const response = await EmployeeService.getAllEmployees();
      setEmployees(response);
      console.log(response);
    }

    getAllEmployees();
  }, [values]);

  return (
    <Autocomplete
      disbalePortal
      value={inputEmployee}
      onChange={(event, newValue) => {
        setInputEmployee(newValue);
        onChange(event, newValue);
      }}
      options={employees ? employees.map((emp) => ({
        label: `${emp.FirstName} ${emp.LastName} (ID: ${emp.BusinessEntityID})`,
        BusinessEntityID: emp.BusinessEntityID,
      })) : []}
      error={!!error}
      helperText={error}
      getOptionLabel={(option) => option ? option.label : ""}
      renderInput={(params) => <TextField error={!!error} helperText={error} {...params} label="Employee" />}
    />
  );
}

