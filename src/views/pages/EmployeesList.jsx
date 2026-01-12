
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Stack,
  Divider,
  Select,
  MenuItem,
} from '@mui/material';
import Popups from '../components/Popups';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import HeaderBar from '../components/HeaderBar';
import HRService from '../../services/HRService';
import EmployeeService from '../../services/EmployeeService';
import { useNavigate } from 'react-router-dom';
import Pagination from '@mui/material/Pagination';
import UserSession from '../../utils/UserSession';
import AddIcon from '@mui/icons-material/AddCircleOutline';
import ErrorHandler from '../../utils/ErrorHandler';
import useNotification from '../../utils/UseNotification';

export default function EmployeesList() {
  const navigate = useNavigate();
  const notifs = useNotification();

  const [Users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  

  const nextBusinessIdRef = useRef(Math.max(0, ...Users.map((r) => r.BusinessId)) + 1);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [mode, setMode] = useState('add');
  const [form, setForm] = useState({
    businessId: null, 
    firstName: '',
    middleName: '',
    lastName: '',
    email: '',
    department: '',
    jobTitle: '',
    hireDate: '',
    password: '',
  });

  const [errors, setErrors] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    email: '',
    department: '',
    jobTitle: '',
    hireDate: '',
    password: '',
  });

  const isValidDateYMD = (str) => /^\d{4}-\d{2}-\d{2}$/.test(str);
  const isValidEmailBasic = (str) => /^[^@\s]+@[^@\s]+$/.test(str);

  const validateForm = (curr) => {
    const newErrors = {
      firstName: curr.firstName?.trim() ? '' : 'Mandatory.',
      lastName: curr.lastName?.trim() ? '' : 'Mandatory.',
      email: curr.email?.trim()
        ? isValidEmailBasic(curr.email)
          ? ''
          : 'Invalid Email'
        : 'Mandatory.',
      department: curr.department?.trim() ? '' : 'Mandatory.',
      jobTitle: curr.jobTitle?.trim() ? '' : 'Mandatory.',
      hireDate: curr.hireDate?.trim()
        ? isValidDateYMD(curr.hireDate)
          ? ''
          : 'Format should be yyyy-mm-dd.'
        : 'Mandatory.',
      password: curr.password == '' ||curr.password?.trim() ? '' : 'Mandatory.',
    };
    setErrors(newErrors);
    return Object.values(newErrors).every((e) => e === '');
  };

  const canSave = useMemo(() => {
    const allFilled = [
      form.firstName,
      form.lastName,
      form.email,
      form.department,
      form.hireDate,
    ].every((v) => v && v.trim().length > 0);

    const emailOk = isValidEmailBasic(form.email || '');
    const dateOk = isValidDateYMD(form.hireDate || '');

    return allFilled && emailOk && dateOk;
  }, [form]);

  const ROWS_PER_PAGE = 10;
  const [page, setPage] = useState(1);

  const pageCount = Math.max(1, Math.ceil(Users.length / ROWS_PER_PAGE));
  const startIndex = (page - 1) * ROWS_PER_PAGE;
  const visibleUsers = useMemo(
    () => Users.slice(startIndex, startIndex + ROWS_PER_PAGE),
    [Users, startIndex]
  );

  useEffect(() => {
    setPage(1);
  }, [Users]);

  const handleOpenAdd = () => {
    setMode('add');
    setForm({
      businessId: nextBusinessIdRef.current,
      firstName: '',
      middleName: '',
      lastName: '',
      email: '',
      department: '',
      jobTitle: '',
      hireDate: '',
      password: '',
    });
    setErrors({
      firstName: '',
      middleName: '',
      lastName: '',
      email: '',
      department: '',
      jobTitle: '',
      hireDate: '',
      password: '',
    });
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
    setErrors({
      firstName: '',
      middleName: '',
      lastName: '',
      email: '',
      department: '',
      jobTitle: '',
      hireDate: '',
      password: '',
    });
    setDialogOpen(true);
  };

  const handleClose = () => setDialogOpen(false);

  const handleSave = async () => {
    const ok = validateForm(form);
    if (!ok) return;

    try {
      if (mode === 'add') {
        await EmployeeService.createEmployee({
          firstName: form.firstName,
          middleName: form.middleName,
          lastName: form.lastName,
          email: form.email,
          department: form.department,
          jobTitle: form.jobTitle,
          hireDate: form.hireDate,
          password: form.password
        });
        setUsers(await EmployeeService.getAllEmployees());
        notifs({ severity: 'success', message: 'Employee created successfully!' });
      } else {
        await EmployeeService.updateEmployee(form.businessId, {
          FirstName: form.firstName,
          MiddleName: form.middleName,
          LastName: form.lastName,
          Email: form.email,
          Department: form.department,
          JobTitle: form.jobTitle,
          HireDate: form.hireDate,
        });
        setUsers((prev) => prev.map((u) => (u.BusinessEntityID === form.businessId ? {
          BusinessEntityID: form.businessId,
          FirstName: form.firstName,
          MiddleName: form.middleName,
          LastName: form.lastName,
          Email: form.email,
          Department: form.department,
          JobTitle: form.jobTitle,
          HireDate: form.hireDate,
        } : u)));
        notifs({ severity: 'success', message: 'Employee updated successfully!' });
      }
      setDialogOpen(false);
    } catch (error) {
      console.error('Error saving employee:', error);
      UserSession.verifyAuthorize(navigate, error.status);
      notifs({ severity: 'error', message: ErrorHandler(error) || 'Error saving employee.' });
    }
  };

  const handleDelete = async (businessEntityID) => {
    try {
      await EmployeeService.deleteEmployee(businessEntityID);
      setUsers((prev) => prev.filter((u) => u.BusinessEntityID !== businessEntityID));
      notifs({
        severity: 'success',
        message: 'Employee deleted!'
      });
    } catch (error) {
      console.error('Error deleting employee:', error);
      UserSession.verifyAuthorize(navigate, error.status);
      notifs({ severity: 'error', message: ErrorHandler(error) || 'Error deleting employee.' });
    }
  };

  const onChange = (field) => (e) => {
    const value = e.target.value;
    const next = { ...form, [field]: value };
    setForm(next);
  };

  useEffect(() => {
    async function fetchData() {
      try {
        var employees = await EmployeeService.getAllEmployees();
        console.log(employees);
        setUsers(employees);
      } catch (error) {
        console.error('Error fetching initial users:', error);
        UserSession.verifyAuthorize(navigate, error.status);
        notifs({ severity: 'error', message: ErrorHandler(error) || 'Error fetching employees.' });
      }
    }
    if (Users.length === 0) fetchData();

    async function fetchDepartments() {
      try {
        const deps = await EmployeeService.getAllDepartments();
        deps.sort();
        setDepartments(deps);
      } catch (err) {
        console.debug('Could not fetch departments for accept dialog', err);
      }
    }
    
    fetchDepartments();
  }, [Users.length, navigate, notifs]);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#fff' }}>
      <HeaderBar />

      <Container maxWidth="lg" sx={{ pt: 3, pb: 5 }}>
        {/* Add User */}
        <Stack direction="row" alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#000' }}>
            Employees
          </Typography>
          <Box sx={{ ml: 'auto' }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleOpenAdd}
              sx={{
                bgcolor: '#ff9800',
                color: '#000',
                textTransform: 'none',
                fontWeight: 700,
                px: 2,
                '&:hover': { bgcolor: '#ff9800' },
              }}
            >
              Add User
            </Button>
          </Box>
        </Stack>

        <Paper
          variant="outlined"
          sx={{
            bgcolor: '#fff3e0',
            borderColor: '#ddd',
            borderRadius: 1.5,
            overflow: 'auto',
          }}
        >
          <Box sx={{ px: 2, pt: 1 }}>
            <Divider sx={{ borderColor: '#ccc' }} />
          </Box>

          <Table
            size="small"
            sx={{
              minWidth: 840,
              tableLayout: 'fixed',
            }}
          >
            <TableHead>
              <TableRow sx={{ '& th': { fontWeight: 700 } }}>
                <TableCell sx={{ color: '#333', width: '12%' }}>BusinessId</TableCell>
                <TableCell sx={{ color: '#333', width: '16%' }}>Name</TableCell>
                <TableCell sx={{ color: '#333', width: '20%' }}>Email</TableCell>
                <TableCell sx={{ color: '#333', width: '16%' }}>Department</TableCell>
                <TableCell sx={{ color: '#333', width: '18%' }}>Job Title</TableCell>
                <TableCell sx={{ color: '#333', width: '12%' }}>Hire Date</TableCell>
                <TableCell sx={{ color: '#333', width: '6%' }}>Actions</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {visibleUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 3, color: '#666' }}>
                    No employees yet.
                  </TableCell>
                </TableRow>
              ) : (
                visibleUsers.map((row) => (
                  <TableRow key={row.BusinessEntityID}>
                    <TableCell sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {row.BusinessEntityID}
                    </TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {`${row.FirstName}${row.MiddleName ? ' ' + row.MiddleName : ''} ${row.LastName}`}
                    </TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {row.Email}
                    </TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {row.Department}
                    </TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {row.JobTitle}
                    </TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {row.HireDate}
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        <IconButton
                          aria-label="editar"
                          onClick={() => handleOpenEdit(row)}
                          sx={{
                            bgcolor: '#fff3e0',
                            color: '#000000ff',
                            '&:hover': { bgcolor: '#000000ff', color: '#fff' },
                          }}
                          size="small"
                        >
                          <EditOutlinedIcon />
                        </IconButton>
                        <Popups
                          title="Remove record"
                          message="Do you really want to delete this employee? This action is irreversible."
                          onConfirm={async () => {
                            await handleDelete(row.BusinessEntityID);
                            notifs({
                              severity: 'success',
                              message: 'Employee deleted!'
                            });
                          }}
                        >
                          <IconButton
                            aria-label="Delete"
                            sx={{
                              bgcolor: '#fff3e0',
                              color: '#000000ff',
                              '&:hover': { bgcolor: '#000000ff', color: '#fff' },
                            }}
                            size="small"
                          >
                            <DeleteOutlineIcon />
                          </IconButton>
                        </Popups>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
            <Pagination
              count={pageCount}
              page={page}
              onChange={(_, p) => setPage(p)}
              sx={{
                '& .MuiPaginationItem-root.Mui-selected': {
                  bgcolor: '#ff9800',
                  color: '#fff',
                },
              }}
            />
          </Box>

          <Box sx={{ height: 24 }} />
        </Paper>
      </Container>

      {/* Add/Edit */}
      <Dialog open={dialogOpen} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: 700 }}>
          {mode === 'add' ? 'Add User' : 'Edit User'}
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={1.5}>
            <TextField
              label="First Name"
              value={form.firstName}
              onChange={onChange('firstName')}
              placeholder="Insert first name."
              fullWidth
              size="small"
              required
              error={!!errors.firstName}
              helperText={errors.firstName}
            />
            <TextField
              label="Middle Name"
              value={form.middleName}
              onChange={onChange('middleName')}
              placeholder="Insert middle name."
              fullWidth
              size="small"
              required
              error={!!errors.middleName}
              helperText={errors.middleName}
            />
            <TextField
              label="Last Name"
              value={form.lastName}
              onChange={onChange('lastName')}
              placeholder="Insert last name."
              fullWidth
              size="small"
              required
              error={!!errors.lastName}
              helperText={errors.lastName}
            />
            <TextField
              label="Email"
              value={form.email}
              onChange={onChange('email')}
              placeholder="Ex.: name@company.com"
              fullWidth
              size="small"
              required
              error={!!errors.email}
              helperText={errors.email}
            />
            <Select
                value={form.department}
                onChange={(e) => setForm({ ...form, department: e.target.value })}
                size="small"
                displayEmpty

                sx={{ width: '100%' }}
              >
                <MenuItem value="">-- Select Department --</MenuItem>
                {departments.map((d) => (
                  <MenuItem key={d} value={d}>
                    {d}
                  </MenuItem>
                ))}
              </Select>
            <TextField
              label="Job Title"
              value={form.jobTitle}
              onChange={onChange('jobTitle')}
              placeholder="Ex.: Frontend Dev"
              fullWidth
              size="small"
              required
              error={!!errors.jobTitle}
              helperText={errors.jobTitle}
            />
            <TextField
              label="Hire Date"
              value={form.hireDate}
              onChange={onChange('hireDate')}
              type='date'
              placeholder="Ex.: 2024-03-12"
              fullWidth
              slotProps={{
                      inputLabel: { shrink: true }
              }}
              size="small"
              required
              error={!!errors.hireDate}
              helperText={errors.hireDate}
            />
            {mode === 'add' && (
              <TextField
                label="Password"
                value={form.password}
                onChange={onChange('password')}
                placeholder="123Abc"
                fullWidth
                size="small"
                required
                error={!!errors.password}
                helperText={errors.password}
              />
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} sx={{ textTransform: 'none' }}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            variant="contained"
            disabled={!canSave}
            sx={{
              bgcolor: '#000',
              color: '#fff',
              textTransform: 'none',
              fontWeight: 700,
              '&:hover': { bgcolor: '#222' },
            }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
