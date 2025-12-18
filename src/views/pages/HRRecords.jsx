import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Container,
  Tabs,
  Tab,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Divider,
  Stack,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  InputAdornment,
  Typography,
  Card,
  CardContent,
  CardHeader,
  Select,
  MenuItem,
  Collapse,
} from '@mui/material';

import AddIcon from '@mui/icons-material/AddCircleOutline';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

import HeaderBar from '../components/HeaderBar';
import { useNavigate } from 'react-router-dom';
import UserSession from '../../utils/UserSession';
import HRService from '../../services/HRService';
import Pagination from '@mui/material/Pagination';
import { useNotification } from '../components/NotificationProvider';
import Popups from '../components/Popups';
import { Business } from '@mui/icons-material';

const PAYMENT_TAB = 0;
const JOB_CHANGE_TAB = 1;

export default function HRRecords() {
  
  const navigate = useNavigate();
  const notif = useNotification();

  const [tab, setTab] = useState(0);

  const [payments, setPayments] = useState([]);
  const [jobChanges, setJobChanges] = useState([]);

  // --- Estados dos Filtros ---
  // Filtros Payments
  const [filterPaymentEmployee, setFilterPaymentEmployee] = useState('');
  const [filterRateMin, setFilterRateMin] = useState('');
  const [filterRateMax, setFilterRateMax] = useState('');
  const [filterPayFrequency, setFilterPayFrequency] = useState('');
  const [filterPaymentDateFrom, setFilterPaymentDateFrom] = useState('');
  const [filterPaymentDateTo, setFilterPaymentDateTo] = useState('');
  const [filterPaymentsExpanded, setFilterPaymentsExpanded] = useState(false);

  // Filtros Job Changes
  const [filterJobEmployee, setFilterJobEmployee] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');
  const [filterJobDateFrom, setFilterJobDateFrom] = useState('');
  const [filterJobDateTo, setFilterJobDateTo] = useState('');
  const [filterJobChangesExpanded, setFilterJobChangesExpanded] = useState(false);


  // --- Colunas ---
  const paymentsColumns = ['Rate', 'Changed Rate',  'Pay Frequency', 'Employee'];
  const jobChangesColumns = ['Job Title', 'Department', 'Start Date', 'End Date', 'Employee'];
  const columns = tab === PAYMENT_TAB ? paymentsColumns : jobChangesColumns;

  // --- Paginação ---
  const [paymentsPage, setPaymentsPage] = useState(1);
  const [jobChangesPage, setJobChangesPage] = useState(1);
  const ROWS_PER_PAGE = 9;

  // Aplicar filtros
  const filteredPayments = useMemo(() => {
    return payments.filter((p) => {
      // Filtro Employee
      if (filterPaymentEmployee.trim()) {
        const query = filterPaymentEmployee.toLowerCase();
        if (!(p.FullName || '').toLowerCase().includes(query)) return false;
      }
      // Filtro Rate Min
      if (filterRateMin) {
        const minVal = parseFloat(filterRateMin);
        if (p.Rate < minVal) return false;
      }
      // Filtro Rate Max
      if (filterRateMax) {
        const maxVal = parseFloat(filterRateMax);
        if (p.Rate > maxVal) return false;
      }
      // Filtro Pay Frequency
      if (filterPayFrequency) {
        if (p.PayFrequency !== parseInt(filterPayFrequency, 10)) return false;
      }
      // Filtro Data From
      if (filterPaymentDateFrom) {
        const payDate = new Date(p.RateChangeDate);
        const fromDate = new Date(filterPaymentDateFrom);
        if (payDate < fromDate) return false;
      }
      // Filtro Data To
      if (filterPaymentDateTo) {
        const payDate = new Date(p.RateChangeDate);
        const toDate = new Date(filterPaymentDateTo);
        if (payDate > toDate) return false;
      }
      return true;
    });
  }, [payments, filterPaymentEmployee, filterRateMin, filterRateMax, filterPayFrequency, filterPaymentDateFrom, filterPaymentDateTo]);

  const filteredJobChanges = useMemo(() => {
    return jobChanges.filter((j) => {
      // Filtro Employee
      if (filterJobEmployee.trim()) {
        const query = filterJobEmployee.toLowerCase();
        if (!(j.FullName || '').toLowerCase().includes(query)) return false;
      }
      // Filtro Department
      if (filterDepartment) {
        if (j.DepartmentName !== filterDepartment) return false;
      }
      // Filtro Data From
      if (filterJobDateFrom) {
        const jobDate = new Date(j.StartDate);
        const fromDate = new Date(filterJobDateFrom);
        if (jobDate < fromDate) return false;
      }
      // Filtro Data To
      if (filterJobDateTo) {
        const jobDate = new Date(j.StartDate);
        const toDate = new Date(filterJobDateTo);
        if (jobDate > toDate) return false;
      }
      return true;
    });
  }, [jobChanges, filterJobEmployee, filterDepartment, filterJobDateFrom, filterJobDateTo]);

  const paymentsCount = Math.max(1, Math.ceil(filteredPayments.length / ROWS_PER_PAGE));
  const jobChangesCount = Math.max(1, Math.ceil(filteredJobChanges.length / ROWS_PER_PAGE));

  const paymentsStart = (paymentsPage - 1) * ROWS_PER_PAGE;
  const jobChangesStart = (jobChangesPage - 1) * ROWS_PER_PAGE;

  const visiblePayments = useMemo(
    () => filteredPayments.slice(paymentsStart, paymentsStart + ROWS_PER_PAGE),
    [filteredPayments, paymentsStart]
  );

  const visibleJobChanges = useMemo(
    () => filteredJobChanges.slice(jobChangesStart, jobChangesStart + ROWS_PER_PAGE),
    [filteredJobChanges, jobChangesStart]
  );
  const [dialogOpen, setDialogOpen] = useState(false);
  const [mode, setMode] = useState('add');
  const [editIndex, setEditIndex] = useState(null);

  const [form, setForm] = useState({
    BusinessEntityID: '',
    Rate: '€',
    RateChangeDate: '',
    PayFrequency: '',
    P_FullName: '',

    JobTitle: '',
    DepartmentName: '',
    StartDate: '',
    EndDate: '',
    J_FullName: '',
  });

  useEffect(() => {
    async function fetchData() {
      try {
        const paymentsData = await HRService.getAllPayments();
        setPayments(Array.isArray(paymentsData) ? paymentsData : []);
      } catch (error) {
        console.error('Error fetching payments:', error);
        UserSession.verifyAuthorize(navigate, error?.status);
      }

      try {
        const jobChangesData = await HRService.getAllMovements();
        setJobChanges(Array.isArray(jobChangesData) ? jobChangesData : []);
      } catch (error) {
        console.error('Error fetching job changes:', error);
        UserSession.verifyAuthorize(navigate, error?.status);
      }

      setPaymentsPage(1);
      setJobChangesPage(1);
    }
    fetchData();
  }, [navigate]);

  const handleTabChange = (_e, v) => {
    setTab(v);
  };

  const openAdd = () => {
    setMode('add');
    setEditIndex(null);
    setForm({
      BusinessEntityID: '',
      Rate: '€',
      RateChangeDate: '',
      PayFrequency: '',
      P_FullName: '',
      JobTitle: '',
      DepartmentName: '',
      StartDate: '',
      EndDate: '',
      J_FullName: '',
    });
    setDialogOpen(true);
  };

  const openEdit = (indexInPage) => {
    setMode('edit');
    const realIndex = tab === 0 ? paymentsStart + indexInPage : jobChangesStart + indexInPage;
    setEditIndex(realIndex);

    if (tab === PAYMENT_TAB) {
      const item = payments[realIndex];
      setForm({
        BusinessEntityID: item?.BusinessEntityID || '',
        Rate: (item?.Rate || '').toString().trim().startsWith('€') ? item?.Rate : `€${item?.Rate ?? ''}`,
        RateChangeDate: item?.RateChangeDate || '',
        P_FullName: item?.FullName || '',
        PayFrequency: item?.PayFrequency || '',
        JobTitle: '',
        DepartmentName: '',
        StartDate: '',
        EndDate: '',
        J_FullName: '',
      });
    } else {
      const item = jobChanges[realIndex];
      setForm({
        BusinessEntityID: item?.BusinessEntityID || '',
        Rate: '',
        RateChangeDate: '',
        PayFrequency: '',
        P_FullName: '',
        JobTitle: item?.JobTitle || '',
        DepartmentName: item?.DepartmentName || '',
        StartDate: item?.StartDate || '',
        EndDate: item?.EndDate || '',
        J_FullName: item?.FullName || '',
      });
    }
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditIndex(null);
  };

  const onChange = (field) => (e) => {
    let value = e.target.value;

    if (tab === PAYMENT_TAB && field === 'Amount') {
      value = value.trimStart();
      if (!value.startsWith('€')) {
        value = `€${value}`;
      }
    }
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const isValidDateYMD = (str) => /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/.test(str);

  const canSave = useMemo(() => {
    if (tab === PAYMENT_TAB) {
      return (
        form.Rate?.trim() &&
        (form.PayFrequency == 1 || form.PayFrequency == 2) 
      );
    }
    return (
      form.JobTitle?.trim() &&
      form.DepartmentName?.trim() &&
      form.StartDate?.trim()
    );
  }, [form, tab]);

  const handleAddOrSave = async () => {
    if (!canSave) return;

    if (tab === PAYMENT_TAB) {
      if (mode === 'add') {

        const newItem = {
          BusinessEntityID: form.BusinessEntityID,
          Rate: parseFloat(form.Rate.replace('€', '').trim()),
          RateChangeDate: form.RateChangeDate,
          PayFrequency: parseInt(form.PayFrequency, 10),
        };

        try {
          await HRService.createPayment({ BusinessEntityID: newItem.BusinessEntityID, PFullName: newItem.P_FullName, Rate: newItem.Rate, RateChangeDate: newItem.RateChangeDate, PayFrequency: newItem.PayFrequency});
          setPayments((prev) => [newItem, ...prev]);
          setPaymentsPage(1);
        } catch (error) {
          console.error('Error creating payment:', error);
          UserSession.verifyAuthorize(navigate, error?.status);
          notif({ severity: 'error', message: error?.message || 'Error creating payment.' });
        }
      } else if (editIndex != null) {
        var payment = payments[editIndex];

        const newItem = {
          BusinessEntityID: payment.BusinessEntityID,
          P_FullName: payment.FullName,
          Rate: parseFloat(form.Rate.replace('€', '').trim()),
          RateChangeDate: payment.RateChangeDate,
          PayFrequency: parseInt(form.PayFrequency, 10),
        };

        try {
          await HRService.editPayment({ BusinessEntityID: newItem.BusinessEntityID, FullName: newItem.P_FullName, Rate: newItem.Rate, RateChangeDate: newItem.RateChangeDate, PayFrequency: newItem.PayFrequency});
          setPayments((prev) => prev.map((p, i) => (i === editIndex ? newItem : p)));
        } catch (error) {
          console.error('Error editing payment:', error);
          UserSession.verifyAuthorize(navigate, error?.status);
          notif({ severity: 'error', message: error?.message || 'Error editing payment.' });
        }
      }
    } else {
      if (mode === 'add') {
        try {
          const newItem = {
            BusinessEntityID: form.BusinessEntityID,
            DepartmentName: form.DepartmentName,
            JobTitle: form.JobTitle,
            StartDate: form.StartDate,
            EndDate: form.EndDate || null,
          };
          await HRService.createMovement({ BusinessEntityID: newItem.BusinessEntityID, FullName: newItem.FullName, DepartmentName: newItem.DepartmentName, JobTitle: newItem.JobTitle, StartDate: newItem.StartDate, EndDate: newItem.EndDate});
          setJobChanges((prev) => [newItem, ...prev]);
          setJobChangesPage(1);
        } catch (error) {
          console.error('Error creating job change:', error);
          UserSession.verifyAuthorize(navigate, error?.status);
          notif({ severity: 'error', message: error?.message || 'Error creating job change.' });
        }
      } else if (editIndex != null) {
        var jobChange = jobChanges[editIndex];

        const newItem = {
            BusinessEntityID: jobChange.BusinessEntityID,
            DepartmentName: form.DepartmentName,
            StartDate: jobChange.StartDate,
            JobTitle: form.JobTitle,
            EndDate: Date.parse(form.EndDate) || null,
        };

        try {
          await HRService.editMovement({ BusinessEntityID: newItem.BusinessEntityID, FullName: newItem.FullName, DepartmentName: newItem.DepartmentName, JobTitle: newItem.JobTitle, StartDate: newItem.StartDate, EndDate: newItem.EndDate});
          setJobChanges((prev) => prev.map((j, i) => (i === editIndex ? newItem : j)));
        } catch (error) {
          console.error('Error editing job change:', error);
          UserSession.verifyAuthorize(navigate, error?.status);
          notif({ severity: 'error', message: error?.message || 'Error editing job change.' });
        }
      }
    }
    closeDialog();
  };

  const handleDelete = async (indexInPage) => {
    const realIndex = tab === 0 ? paymentsStart + indexInPage : jobChangesStart + indexInPage;
    if (tab === 0) {
      try {
        const item = filteredPayments[indexInPage];
        await HRService.deletePayment({BusinessEntityID: item.BusinessEntityID, RateChangeDate: item.RateChangeDate});
        setPayments((prev) => prev.filter((p) => !(p.BusinessEntityID === item.BusinessEntityID && p.RateChangeDate === item.RateChangeDate)));
      } catch (error) {
        console.error('Error deleting payment:', error);
        UserSession.verifyAuthorize(navigate, error?.status);
        notif({ severity: 'error', message: error?.message || 'Error deleting payment.' });
      }
    } else {
      try {
        const item = filteredJobChanges[indexInPage];
        await HRService.deleteMovement({BusinessEntityID: item.BusinessEntityID, StartDate: item.StartDate, DepartmentName: item.DepartmentName});
        setJobChanges((prev) => prev.filter((j) => !(j.BusinessEntityID === item.BusinessEntityID && j.StartDate === item.StartDate && j.DepartmentName === item.DepartmentName)));
      } catch (error) {
        console.error('Error deleting job change:', error);
        UserSession.verifyAuthorize(navigate, error?.status);
        notif({ severity: 'error', message: error?.message || 'Error deleting job change.' });
      }
    }
  };

  // Clear filter functions
  const handleClearFiltersPayments = () => {
    setFilterPaymentEmployee('');
    setFilterRateMin('');
    setFilterRateMax('');
    setFilterPayFrequency('');
    setFilterPaymentDateFrom('');
    setFilterPaymentDateTo('');
    setPaymentsPage(1);
  };

  const handleClearFiltersJobChanges = () => {
    setFilterJobEmployee('');
    setFilterDepartment('');
    setFilterJobDateFrom('');
    setFilterJobDateTo('');
    setJobChangesPage(1);
  };

  // Get unique departments for job changes filter
  const uniqueDepartments = useMemo(() => {
    const deps = [...new Set(jobChanges.map((j) => j.DepartmentName).filter(Boolean))];
    return deps.sort();
  }, [jobChanges]);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#fff' }}>
      <HeaderBar />

      <Container maxWidth="lg" sx={{ pt: 3, pb: 5 }}>
        {/* Tabs */}
        <Box sx={{ display: 'inline-block', bgcolor: '#f5f5f5', borderRadius: 1, mb: 2 }}>
          <Tabs
            value={tab}
            onChange={handleTabChange}
            TabIndicatorProps={{ style: { display: 'none' } }}
            sx={{
              '& .MuiTab-root': {
                minHeight: 36,
                py: 0.5,
                px: 2,
                m: 0.5,
                borderRadius: 0.75,
                textTransform: 'none',
                fontWeight: 600,
                fontSize: 14,
                color: '#666',
                bgcolor: '#f5f5f5',
                transition: 'all 0.3s ease',
              },
              '& .MuiTab-root.Mui-selected': {
                bgcolor: '#ff9800',
                color: '#fff',
                fontWeight: 700,
                boxShadow: '0 2px 8px rgba(255, 152, 0, 0.3)',
              },
            }}
          >
            <Tab label="payments" disableRipple />
            <Tab label="job changes" disableRipple />
          </Tabs>
        </Box>

        {/* Botão Add */}
        <Stack direction="row" alignItems="center" sx={{ mb: 1 }}>
          <Box sx={{ ml: 'auto' }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={openAdd}
              sx={{
                bgcolor: '#ff9800',
                color: '#000',
                textTransform: 'none',
                fontWeight: 700,
                px: 2,
                '&:hover': { bgcolor: '#ff9800' },
              }}
            >
              Add Record
            </Button>
          </Box>
        </Stack>

        {/* Filter Panel - Payments */}
        {tab === PAYMENT_TAB && (
          <Card sx={{ mb: 2, bgcolor: '#f7f7f7ff', border: '2px solid #fff7cbff' }}>
            <CardHeader
              title="Filters"
              action={
                <IconButton
                  onClick={() => setFilterPaymentsExpanded(!filterPaymentsExpanded)}
                  sx={{ p: 0 }}
                >
                  {filterPaymentsExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
              }
              sx={{ pb: 0 }}
            />
            <Collapse in={filterPaymentsExpanded}>
              <CardContent>
                <Stack direction="column" spacing={2}>
                  <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                    <TextField
                      label="Employee Name"
                      value={filterPaymentEmployee}
                      onChange={(e) => {
                        setFilterPaymentEmployee(e.target.value);
                        setPaymentsPage(1);
                      }}
                      size="small"
                      sx={{ flex: 1 }}
                    />
                    <TextField
                      label="Rate Min"
                      type="number"
                      value={filterRateMin}
                      onChange={(e) => {
                        setFilterRateMin(e.target.value);
                        setPaymentsPage(1);
                      }}
                      size="small"
                      sx={{ flex: 1 }}
                      inputProps={{ step: '0.01' }}
                    />
                    <TextField
                      label="Rate Max"
                      type="number"
                      value={filterRateMax}
                      onChange={(e) => {
                        setFilterRateMax(e.target.value);
                        setPaymentsPage(1);
                      }}
                      size="small"
                      sx={{ flex: 1 }}
                      inputProps={{ step: '0.01' }}
                    />
                    <Select
                      value={filterPayFrequency}
                      onChange={(e) => {
                        setFilterPayFrequency(e.target.value);
                        setPaymentsPage(1);
                      }}
                      size="small"
                      displayEmpty
                      sx={{ flex: 1 }}
                    >
                      <MenuItem value="">All Frequencies</MenuItem>
                      <MenuItem value="1">Weekly</MenuItem>
                      <MenuItem value="2">Bi-weekly</MenuItem>
                    </Select>
                  </Stack>
                  <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                    <TextField
                      label="Date From"
                      type="date"
                      value={filterPaymentDateFrom}
                      onChange={(e) => {
                        setFilterPaymentDateFrom(e.target.value);
                        setPaymentsPage(1);
                      }}
                      size="small"
                      sx={{ flex: 1 }}
                      InputLabelProps={{ shrink: true }}
                    />
                    <TextField
                      label="Date To"
                      type="date"
                      value={filterPaymentDateTo}
                      onChange={(e) => {
                        setFilterPaymentDateTo(e.target.value);
                        setPaymentsPage(1);
                      }}
                      size="small"
                      sx={{ flex: 1 }}
                      InputLabelProps={{ shrink: true }}
                    />
                    <Button
                      variant="outlined"
                      onClick={handleClearFiltersPayments}
                      sx={{ textTransform: 'none', fontWeight: 600 }}
                    >
                      Clear Filters
                    </Button>
                  </Stack>
                </Stack>
              </CardContent>
            </Collapse>
          </Card>
        )}

        {/* Filter Panel - Job Changes */}
        {tab === JOB_CHANGE_TAB && (
          <Card sx={{ mb: 2, bgcolor: '#f7f7f7ff', border: '2px solid #fff7cbff' }}>
            <CardHeader
              title="Filters"
              action={
                <IconButton
                  onClick={() => setFilterJobChangesExpanded(!filterJobChangesExpanded)}
                  sx={{ p: 0 }}
                >
                  {filterJobChangesExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
              }
              sx={{ pb: 0 }}
            />
            <Collapse in={filterJobChangesExpanded}>
              <CardContent>
                <Stack direction="column" spacing={2}>
                  <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                    <TextField
                      label="Employee Name"
                      value={filterJobEmployee}
                      onChange={(e) => {
                        setFilterJobEmployee(e.target.value);
                        setJobChangesPage(1);
                      }}
                      size="small"
                      sx={{ flex: 1 }}
                    />
                    <Select
                      value={filterDepartment}
                      onChange={(e) => {
                        setFilterDepartment(e.target.value);
                        setJobChangesPage(1);
                      }}
                      size="small"
                      displayEmpty
                      sx={{ flex: 1 }}
                    >
                      <MenuItem value="">All Departments</MenuItem>
                      {uniqueDepartments.map((dept) => (
                        <MenuItem key={dept} value={dept}>
                          {dept}
                        </MenuItem>
                      ))}
                    </Select>
                  </Stack>
                  <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                    <TextField
                      label="Date From"
                      type="date"
                      value={filterJobDateFrom}
                      onChange={(e) => {
                        setFilterJobDateFrom(e.target.value);
                        setJobChangesPage(1);
                      }}
                      size="small"
                      sx={{ flex: 1 }}
                      InputLabelProps={{ shrink: true }}
                    />
                    <TextField
                      label="Date To"
                      type="date"
                      value={filterJobDateTo}
                      onChange={(e) => {
                        setFilterJobDateTo(e.target.value);
                        setJobChangesPage(1);
                      }}
                      size="small"
                      sx={{ flex: 1 }}
                      InputLabelProps={{ shrink: true }}
                    />
                    <Button
                      variant="outlined"
                      onClick={handleClearFiltersJobChanges}
                      sx={{ textTransform: 'none', fontWeight: 600 }}
                    >
                      Clear Filters
                    </Button>
                  </Stack>
                </Stack>
              </CardContent>
            </Collapse>
          </Card>
        )}

        <Paper
          variant="outlined"
          sx={{
            bgcolor: '#fff3e0',
            borderColor: '#ddd',
            borderRadius: 1.5,
            overflow: 'hidden',
          }}
        >
          <Box sx={{ px: 2, pt: 1 }}>
            <Divider sx={{ borderColor: '#ccc' }} />
          </Box>

          <Table size="small" sx={{ minWidth: 720, tableLayout: 'fixed' }}>
            <TableHead>
              <TableRow sx={{ '& th': { fontWeight: 700 } }}>
                {columns.map((c, i) => (
                  <TableCell
                    key={c}
                    sx={{
                      borderRight: i < columns.length - 1 ? '1px solid rgba(0,0,0,0.2)' : 'none',
                      color: '#333',
                    }}
                  >
                    {c}
                  </TableCell>
                ))}
                <TableCell sx={{ color: '#333' }}>Actions</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {tab === 0 ? (
                payments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={columns.length + 1} align="center" sx={{ py: 3 }}>
                      No payment records found.
                    </TableCell>
                  </TableRow>
                ) : visiblePayments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={columns.length + 1} align="center" sx={{ py: 3 }}>
                      Page out of range.
                    </TableCell>
                  </TableRow>
                ) : (
                  visiblePayments.map((p, idx) => (
                    <TableRow key={`${p.FullName}-${p.RateChangeDate}-${idx}`}>
                      <TableCell>{p.Rate}</TableCell>
                      <TableCell>{p.RateChangeDate}</TableCell>
                      <TableCell>{p.PayFrequency}</TableCell>
                      <TableCell>{p.FullName}</TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1}>
                          <IconButton
                            aria-label="edit"
                            onClick={() => openEdit(idx)}
                            sx={{
                              bgcolor: '#fff3e0',
                              color: '#000000ff',
                              '&:hover': { bgcolor: '#000000ff', color: '#fff' },
                            }}
                            size="small"
                          >
                            <EditOutlinedIcon />
                          </IconButton>
                          <IconButton
                            onClick={() => handleDelete(idx)}
                            sx={{
                              bgcolor: '#fff3e0',
                              color: '#000000ff',
                              '&:hover': { bgcolor: '#000000ff', color: '#fff' },
                            }}
                            size="small"
                          >
                            <DeleteOutlineIcon />
                          </IconButton>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))
                )
              ) : jobChanges.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length + 1} align="center" sx={{ py: 3 }}>
                    No job change records found.
                  </TableCell>
                </TableRow>
              ) : visibleJobChanges.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length + 1} align="center" sx={{ py: 3 }}>
                    Page out of range.
                  </TableCell>
                </TableRow>
              ) : (
                visibleJobChanges.map((c, idx) => (
                  <TableRow key={`${c.FullName}-${c.JobTitle}-${c.StartDate}-${idx}`}>
                    <TableCell>{c.JobTitle}</TableCell>
                    <TableCell>{c.DepartmentName}</TableCell>
                    <TableCell>{c.StartDate}</TableCell>
                    <TableCell>{c.EndDate || 'Present'}</TableCell>
                    <TableCell>{c.FullName}</TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        <IconButton
                          onClick={() => openEdit(idx)}
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
                            message="Do you really want to delete this record? This action is irreversible."
                            onConfirm={() => handleDelete(idx)}
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
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
            {tab === 0 ? (
              <Pagination
                count={paymentsCount}
                page={paymentsPage}
                onChange={(_, p) => setPaymentsPage(p)}
                sx={{
                  '& .MuiPaginationItem-root.Mui-selected': {
                    bgcolor: '#ff9800',
                    color: '#fff',
                  },
                }}
              />
            ) : (
              <Pagination
                count={jobChangesCount}
                page={jobChangesPage}
                onChange={(_, p) => setJobChangesPage(p)}
                sx={{
                  '& .MuiPaginationItem-root.Mui-selected': {
                    bgcolor: '#ff9800',
                    color: '#fff',
                  },
                }}
              />
            )}
          </Box>

          <Box sx={{ height: 24 }} />
        </Paper>
      </Container>

      {/* Add/Edit */}
      <Dialog open={dialogOpen} onClose={closeDialog} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: 700 }}>
          {mode === 'add' ? 'Add Record' : 'Edit Record'}
        </DialogTitle>

        <DialogContent dividers>
          <Stack spacing={1.5}>
            {tab === 0 ? (
              mode === 'add' ? (
              <>
                <TextField
                  label="Employee"
                  value={form.BusinessEntityID}
                  onChange={onChange('BusinessEntityID')}
                  fullWidth
                  size="small"
                  required
                />
                <TextField
                  label="Rate Change Date (yyyy-mm-ddThh:mm:ss)"
                  value={form.RateChangeDate}
                  onChange={onChange('RateChangeDate')}
                  fullWidth
                  size="small"
                  required
                /> 
                <TextField
                  label="Rate"
                  value={form.Rate}
                  onChange={onChange('Rate')}
                  fullWidth
                  size="small"
                  required
                  InputProps={{
                    startAdornment: <InputAdornment position="start"></InputAdornment>,
                  }}
                />
                <TextField
                  label="Pay Frequency"
                  value={form.PayFrequency}
                  onChange={onChange('PayFrequency')}
                  fullWidth
                  size="small"
                  required
                  InputProps={{
                    startAdornment: <InputAdornment position="start"></InputAdornment>,
                  }}
                />
              </>
              ) :(
              <>
                <TextField
                  label="Rate"
                  value={form.Rate}
                  onChange={onChange('Rate')}
                  fullWidth
                  size="small"
                  required
                  InputProps={{
                    startAdornment: <InputAdornment position="start"></InputAdornment>,
                  }}
                />
                <TextField
                  label="Pay Frequency"
                  value={form.PayFrequency}
                  onChange={onChange('PayFrequency')}
                  fullWidth
                  size="small"
                  required
                  InputProps={{
                    startAdornment: <InputAdornment position="start"></InputAdornment>,
                  }}
                />
              </>)
            ) : (
              <>
                <TextField
                  label="Job Title"
                  value={form.JobTitle}
                  onChange={onChange('JobTitle')}
                  fullWidth
                  size="small"
                  required
                />
                <TextField
                  label="Department"
                  value={form.DepartmentName}
                  onChange={onChange('DepartmentName')}
                  fullWidth
                  size="small"
                  required
                />
                <TextField
                  label="Start Date (yyyy-mm-dd)"
                  value={form.StartDate}
                  onChange={onChange('StartDate')}
                  fullWidth
                  size="small"
                  required
                />
                <TextField
                  label="End Date (yyyy-mm-dd, optional)"
                  value={form.EndDate}
                  onChange={onChange('EndDate')}
                  fullWidth
                  size="small"
                />
                <TextField
                  label="Employee"
                  value={form.BusinessEntityID}
                  onChange={onChange('BusinessEntityID')}
                  fullWidth
                  size="small"
                  required
                />
              </>
            )}
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button onClick={closeDialog} sx={{ textTransform: 'none' }}>
            Cancelar
          </Button>
          <Button
            onClick={handleAddOrSave}
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