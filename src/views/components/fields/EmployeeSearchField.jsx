import React, { useEffect, useState } from 'react';
import { Autocomplete, TextField } from '@mui/material';
import EmployeeService from '../../../services/EmployeeService';
import EmployeeViewModel from '../../../models/viewModels/EmployeeViewModel';

export const EmployeeSearchField = ({ values, onChange, error }) => {

  const [employee, setEmployee] = useState(null);
  const [inputEmployee, setInputEmployee] = useState(null);
  const [employees, setEmployees] = useState([]);


  useEffect(() => {
    async function getAllEmployees() {
      if (values && values.length > 0) {
        setEmployees(values);
        return;
      }
      const response = await EmployeeService.getAllEmployees(1, 10,
        [
          { Fields: ['BusinessEntityID', 'FirstName', 'MiddleName', 'LastName'], Values: [inputEmployee], Type: 'Contains' },
          { Fields: ['IsActive'], Values: [true], Type: 'Equals' },
        ],
        { SortBy: 'FirstName', Direction: 'asc' }
      );

      const employeesRaw = response.items;
      setEmployees(employeesRaw.map((emp) => (new EmployeeViewModel({
        BusinessEntityID: emp.businessEntityID,
        FirstName: emp.firstName,
        LastName: emp.lastName,
      }))));
      console.log(response);
    }

    getAllEmployees();
  }, [inputEmployee, values]);

  return (
    <Autocomplete
      disbalePortal
      value={employee}
      inputValue={inputEmployee}
      onChange={(event, newValue) => {
        setEmployee(newValue);
        onChange(newValue ? newValue.BusinessEntityID : null);
      }}
      onInputChange={(e, v) => {
        setInputEmployee(v);
      }}
      options={employees.length > 0 ? employees.map((emp) => ({
        label: `${emp.FirstName} ${emp.LastName} (ID: ${emp.BusinessEntityID})`,
        BusinessEntityID: emp.BusinessEntityID,
      })) : []}
      getOptionLabel={(option) => option ? option.label : ""}
      renderInput={(params) => <TextField error={!!error} helperText={error} {...params} label="Employee" />}
    />
  );
}

