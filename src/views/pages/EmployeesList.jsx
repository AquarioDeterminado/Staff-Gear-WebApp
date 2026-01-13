
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Box, Container, Typography, Button, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Stack,
} from '@mui/material';
import Popups from '../components/ui/Popups';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import HeaderBar from '../components/layout/HeaderBar';
import EmployeeService from '../../services/EmployeeService';
import { useNavigate } from 'react-router-dom';
import UserSession from '../../utils/UserSession';
import AddIcon from '@mui/icons-material/AddCircleOutline';
import ErrorHandler from '../../utils/ErrorHandler';
import useNotification from '../../utils/UseNotification';
import DataTable from '../components/table/DataTable';
import Paginator from '../components/table/Paginator';
import SectionPaper from '../components/ui/SectionPaper';

export default function EmployeesList() {
  const navigate = useNavigate();
  const notifs = useNotification();
  const [Users, setUsers] = useState([]);
  const nextBusinessIdRef = useRef(Math.max(0, ...Users.map((r) => r.BusinessEntityID)) + 1);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [mode, setMode] = useState('add');
  const [form, setForm] = useState({
    businessId: null, firstName: '', middleName: '', lastName: '', email: '',
    department: '', jobTitle: '', hireDate: '', password: '',
  });
  const [errors, setErrors] = useState({
    firstName: '', middleName: '', lastName: '', email: '', department: '', jobTitle: '', hireDate: '', password: '',
  });

  const isValidDateYMD = (str) => /^\d{4}-\d{2}-\d{2}$/.test(str);
  const isValidEmailBasic = (str) => /^[^@\s]+@[^@\s]+$/.test(str);
  const validateForm = (curr) => {
    const newErrors = {
      firstName: curr.firstName?.trim() ? '' : 'Mandatory.',
      lastName: curr.lastName?.trim() ? '' : 'Mandatory.',
      email: curr.email?.trim() ? (isValidEmailBasic(curr.email) ? '' : 'Invalid Email') : 'Mandatory.',
      department: curr.department?.trim() ? '' : 'Mandatory.',
      jobTitle: curr.jobTitle?.trim() ? '' : 'Mandatory.',
      hireDate: curr.hireDate?.trim() ? (isValidDateYMD(curr.hireDate) ? '' : 'Format should be yyyy-mm-dd.') : 'Mandatory.',
      password: mode === 'add' ? (curr.password?.trim() ? '' : 'Mandatory.') : '',
      middleName: '',
    };
    setErrors(newErrors);
    return Object.values(newErrors).every((e) => e === '');
  };

  const canSave = useMemo(() => {
    const allFilled = [form.firstName, form.lastName, form.email, form.department, form.hireDate]
      .every((v) => v && v.trim().length > 0);
    const emailOk = isValidEmailBasic(form.email ?? '');
    const dateOk = isValidDateYMD(form.hireDate ?? '');
    return allFilled && emailOk && dateOk && (mode === 'add' ? !!form.password?.trim() : true);
  }, [form, mode]);

  const ROWS_PER_PAGE = 10;
  const [page, setPage] = useState(1);
  const pageCount = Math.max(1, Math.ceil(Users.length / ROWS_PER_PAGE));
  const startIndex = (page - 1) * ROWS_PER_PAGE;
  const visibleUsers = useMemo(() => Users.slice(startIndex, startIndex + ROWS_PER_PAGE), [Users, startIndex]);

  useEffect(() => { setPage(1); }, [Users]);

  const handleOpenAdd = () => {
    setMode('add');
    setForm({ businessId: nextBusinessIdRef.current, firstName: '', middleName: '', lastName: '', email: '', department: '', jobTitle: '', hireDate: '', password: '' });
    setErrors({ firstName: '', middleName: '', lastName: '', email: '', department: '', jobTitle: '', hireDate: '', password: '' });
    setDialogOpen(true);
  };
  const handleOpenEdit = (row) => {
    setMode('edit');
    setForm({
      businessId: row.BusinessEntityID,
      firstName: row.FirstName ?? '',
      middleName: row.MiddleName ?? '',
      lastName: row.LastName ?? '',
      email: row.Email ?? '',
      department: row.Department ?? '',
      jobTitle: row.JobTitle ?? '',
      hireDate: row.HireDate ?? '',
      password: '',
    });
    setErrors({ firstName: '', middleName: '', lastName: '', email: '', department: '', jobTitle: '', hireDate: '', password: '' });
    setDialogOpen(true);
  };
  const handleClose = () => setDialogOpen(false);

  const handleSave = async () => {
    const ok = validateForm(form);
    if (!ok) return;
    try {
      if (mode === 'add') {
        await EmployeeService.createEmployee({
          firstName: form.firstName, middleName: form.middleName, lastName: form.lastName,
          email: form.email, department: form.department, jobTitle: form.jobTitle, hireDate: form.hireDate, password: form.password,
        });
        setUsers(await EmployeeService.getAllEmployees());
        notifs({ severity: 'success', message: 'Employee created successfully!' });
      } else {
        await EmployeeService.updateEmployee(form.businessId, {
          FirstName: form.firstName, MiddleName: form.middleName, LastName: form.lastName,
          Email: form.email, Department: form.department, JobTitle: form.jobTitle, HireDate: form.hireDate,
        });
        setUsers((prev) => prev.map((u) =>
          (u.BusinessEntityID === form.businessId ? {
            BusinessEntityID: form.businessId, FirstName: form.firstName, MiddleName: form.middleName, LastName: form.lastName,
            Email: form.email, Department: form.department, JobTitle: form.jobTitle, HireDate: form.hireDate,
          } : u)
        ));
        notifs({ severity: 'success', message: 'Employee updated successfully!' });
      }
      setDialogOpen(false);
    } catch (error) {
      UserSession.verifyAuthorize(navigate, error.status);
      notifs({ severity: 'error', message: ErrorHandler(error) ?? 'Error saving employee.' });
    }
  };

  const handleDelete = async (businessEntityID) => {
    try {
      await EmployeeService.deleteEmployee(businessEntityID);
      setUsers((prev) => prev.filter((u) => u.BusinessEntityID !== businessEntityID));
      notifs({ severity: 'success', message: 'Employee deleted!' });
    } catch (error) {
      UserSession.verifyAuthorize(navigate, error.status);
      notifs({ severity: 'error', message: ErrorHandler(error) ?? 'Error deleting employee.' });
    }
  };

  const onChange = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  useEffect(() => {
    async function fetchData() {
      try {
        const employees = await EmployeeService.getAllEmployees();
        setUsers(employees);
      } catch (error) {
        UserSession.verifyAuthorize(navigate, error.status);
        notifs({ severity: 'error', message: ErrorHandler(error) ?? 'Error fetching employees.' });
      }
    }
    if (Users.length === 0) fetchData();
  }, [Users.length, navigate, notifs]);

  const columns = [
    { label: 'BusinessId', width: '12%', render: (r) => r.BusinessEntityID },
    { label: 'Name', width: '16%', render: (r) => `${r.FirstName}${r.MiddleName ? ' ' + r.MiddleName : ''} ${r.LastName}` },
    { label: 'Email', width: '20%', render: (r) => r.Email },
    { label: 'Department', width: '16%', render: (r) => r.Department },
    { label: 'Job Title', width: '18%', render: (r) => r.JobTitle },
    { label: 'Hire Date', width: '12%', render: (r) => r.HireDate },
    {
      label: 'Actions', width: '6%',
      render: (row) => (
        <Stack direction="row" spacing={1}>
          <Button onClick={() => handleOpenEdit(row)} size="small" startIcon={<EditOutlinedIcon />} />
          <Popups
            title="Remove record"
            message="Do you really want to delete this employee? This action is irreversible."
            onConfirm={async () => { await handleDelete(row.BusinessEntityID); }}
          >
            <Button size="small" startIcon={<DeleteOutlineIcon />} />
          </Popups>
        </Stack>
      ),
    },
  ];

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#fff' }}>
      <HeaderBar />
      <Container maxWidth="lg" sx={{ pt: 3, pb: 5 }}>
        <Stack direction="row" alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#000' }}>Employees</Typography>
          <Box sx={{ ml: 'auto' }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleOpenAdd}
              sx={{ bgcolor: '#ff9800', color: '#000', textTransform: 'none', fontWeight: 700 }}
            >
              Add User
            </Button>
          </Box>
        </Stack>

        <SectionPaper>
          <DataTable columns={columns} rows={visibleUsers} getRowId={(r) => r.BusinessEntityID} />
          <Paginator count={pageCount} page={page} onChange={(_, p) => setPage(p)} />
        </SectionPaper>
      </Container>

      {/* Dialog Add/Edit */}
      <Dialog open={dialogOpen} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: 700 }}>{mode === 'add' ? 'Add User' : 'Edit User'}</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={1.5}>
            <TextField label="First Name" value={form.firstName} onChange={onChange('firstName')} fullWidth size="small" required error={!!errors.firstName} helperText={errors.firstName} />
            <TextField label="Middle Name" value={form.middleName} onChange={onChange('middleName')} fullWidth size="small" />
            <TextField label="Last Name" value={form.lastName} onChange={onChange('lastName')} fullWidth size="small" required error={!!errors.lastName} helperText={errors.lastName} />
            <TextField label="Email" value={form.email} onChange={onChange('email')} fullWidth size="small" required error={!!errors.email} helperText={errors.email} />
            <TextField label="Department" value={form.department} onChange={onChange('department')} fullWidth size="small" required error={!!errors.department} helperText={errors.department} />
            <TextField label="Job Title" value={form.jobTitle} onChange={onChange('jobTitle')} fullWidth size="small" required error={!!errors.jobTitle} helperText={errors.jobTitle} />
            <TextField label="Hire Date" value={form.hireDate} onChange={onChange('hireDate')} fullWidth size="small" required error={!!errors.hireDate} helperText={errors.hireDate} />
            {mode === 'add' && (
              <TextField label="Password" value={form.password} onChange={onChange('password')} fullWidth size="small" required error={!!errors.password} helperText={errors.password} />
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSave} variant="contained" disabled={!canSave} sx={{ bgcolor: '#000', color: '#fff' }}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}