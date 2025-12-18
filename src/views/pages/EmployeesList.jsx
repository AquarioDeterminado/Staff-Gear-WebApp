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
import { useNotification } from '../components/NotificationProvider';
import ErrorHandler from '../../utils/ErrorHandler';

export default function EmployeesList() {
  const navigate = useNavigate();
  const notifs = useNotification();

  const [Users, setUsers] = useState([]);

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
  });

  const [errors, setErrors] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    email: '',
    department: '',
    jobTitle: '',
    hireDate: '',
  });

  const isValidDateYMD = (str) => /^\d{4}-\d{2}-\d{2}$/.test(str);
  const isValidEmailBasic = (str) => /^[^@\s]+@[^@\s]+$/.test(str);

  const validateForm = (curr) => {
    const newErrors = {
      firstName: curr.firstName?.trim() ? '' : 'Obrigatório.',
      middleName: curr.middleName?.trim() ? '' : 'Obrigatório.',
      lastName: curr.lastName?.trim() ? '' : 'Obrigatório.',
      email: curr.email?.trim()
        ? isValidEmailBasic(curr.email)
          ? ''
          : 'Email inválido'
        : 'Obrigatório.',
      department: curr.department?.trim() ? '' : 'Obrigatório.',
      jobTitle: curr.jobTitle?.trim() ? '' : 'Obrigatório.',
      hireDate: curr.hireDate?.trim()
        ? isValidDateYMD(curr.hireDate)
          ? ''
          : 'Formato deve ser yyyy-mm-dd.'
        : 'Obrigatório.',
    };
    setErrors(newErrors);
    return Object.values(newErrors).every((e) => e === '');
  };

  const canSave = useMemo(() => {
    const allFilled = [
      form.firstName,
      form.middleName,
      form.lastName,
      form.email,
      form.department,
      form.jobTitle,
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
    });
    setErrors({
      firstName: '',
      middleName: '',
      lastName: '',
      email: '',
      department: '',
      jobTitle: '',
      hireDate: '',
    });
    setDialogOpen(true);
  };

  const handleClose = () => setDialogOpen(false);

  const handleSave = async () => {
    const ok = validateForm(form);

    if (!ok) return;

    try {
      if (mode === 'add') {
        var user = await EmployeeService.createEmployee({
          firstName: form.firstName,
          middleName: form.middleName,
          lastName: form.lastName,
          email: form.email,
          department: form.department,
          jobTitle: form.jobTitle,
          hireDate: form.hireDate,
          password: form.password
        });
        setUsers(awaiEmployeeService.getAllEmployees());
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
      }
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
      setDialogOpen(false);
    } catch (error) {
      console.error('Error saving employee:', error);
      UserSession.verifyAuthorize(navigate, error.status);
      notifs({ severity: 'error', message: ErrorHandler(error) || 'Error creating job change.' });
    }
  };

  const handleDelete = async (businessEntityID) => {
    try {
      await EmployeeService.deleteEmployee(businessEntityID);
      setUsers((prev) => prev.filter((u) => u.BusinessEntityID !== businessEntityID));
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
      } catch (error) {
        console.error('Error fetching initial users:', error);
        UserSession.verifyAuthorize(navigate, error.status);
        notifs({ severity: 'error', message: ErrorHandler(error) || 'Error deleting employee.' });
      }
      setUsers(employees);
  }
    if (Users.length === 0)
      fetchData();
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
                    Sem empregados ainda.
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
                          <Popups
                            title="Remove record"
                            message="Do you really want to delete this record? This action is irreversible."
                            onConfirm={() => handleDelete(row.BusinessEntityID)}
                          >
                            <IconButton
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
              placeholder="Insere o Primeiro Nome"
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
              placeholder="Insere o nome do meio"
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
              placeholder="Insere o nome"
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
              placeholder="Ex.: nome@empresa.pt"
              fullWidth
              size="small"
              required
              error={!!errors.email}
              helperText={errors.email}
            />
            <TextField
              label="Department"
              value={form.department}
              onChange={onChange('department')}
              placeholder="Ex.: Tecnologias"
              fullWidth
              size="small"
              required
              error={!!errors.department}
              helperText={errors.department}
            />
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
              placeholder="Ex.: 2024-03-12"
              fullWidth
              size="small"
              required
              error={!!errors.hireDate}
              helperText={errors.hireDate}
            />
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
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} sx={{ textTransform: 'none' }}>
            Cancelar
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
            Guardar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}