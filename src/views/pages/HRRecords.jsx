import React, { useEffect, useMemo, useState, Fragment } from 'react';
import {
  Box,
  Container,
  Stack,
  Button,
  IconButton,
  TextField,
  Select,
  MenuItem,
  Dialog,
  DialogContent,
  DialogActions,
  InputAdornment,
} from '@mui/material';

import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import AddIcon from '@mui/icons-material/AddCircleOutline';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ErrorHandler from '../../utils/ErrorHandler';
import HeaderBar from '../components/layout/HeaderBar';
import { useNavigate } from 'react-router-dom';
import UserSession from '../../utils/UserSession';
import HRService from '../../services/HRService';
import useNotification from '../../utils/UseNotification';
import EmployeeService from '../../services/EmployeeService';
import { CapitalizeFirstLetter } from '../../utils/FormatingUtils';
import { EmployeeSearchField } from '../components/EmployeeSearchField';
import { DepartmentSelectField } from '../components/DepartmentSelectField';
import DataTable from '../components/table/DataTable';
import Paginator from '../components/table/Paginator';
import FilterPanel from '../components/filters/FilterPanel';
import { StyledTabs, StyledTab } from '../components/ui/surfaces/StyledTabs';
import SectionPaper from '../components/ui/surfaces/SectionPaper';
import FormPopup from '../components/ui/popups/FormPopup';
import ConfirmPopup from '../components/ui/popups/ConfirmPopup';
import { FormatCurrency, FormatPayFrequency, FormatDate } from '../../utils/FormatingUtils';

const PAYMENT_TAB = 0;
const JOB_CHANGE_TAB = 1;

const SORTING_DESCENDING = 'desc';
const SORTING_ASCENDING = 'asc';


export default function HRRecords() {
  const navigate = useNavigate();
  const notif = useNotification();
  useEffect(() => {
    const token = UserSession.getToken();
    if (!token) {
      navigate('/', { replace: true });
    }
  }, [navigate]);

  const [tab, setTab] = useState(0);

  const [payments, setPayments] = useState([]);
  const [jobChanges, setJobChanges] = useState([]);

  // Filter Payments
  const [filterPaymentEmployee, setFilterPaymentEmployee] = useState('');
  const [filterRateMin, setFilterRateMin] = useState('');
  const [filterRateMax, setFilterRateMax] = useState('');
  const [filterPayFrequency, setFilterPayFrequency] = useState('');
  const [filterPaymentDateFrom, setFilterPaymentDateFrom] = useState('');
  const [filterPaymentDateTo, setFilterPaymentDateTo] = useState('');
  const [filterPaymentsExpanded, setFilterPaymentsExpanded] = useState(false);

  const [filterJobEmployee, setFilterJobEmployee] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');
  const [filterJobDateFrom, setFilterJobDateFrom] = useState('');
  const [filterJobDateTo, setFilterJobDateTo] = useState('');
  const [filterJobChangesExpanded, setFilterJobChangesExpanded] = useState(false);

  // Columns
  const paymentsColumns = [{ label: 'Rate', field: 'Rate', render: (r) => FormatCurrency(r.Rate), sortable: true }, 
                            { label: 'Rate Change Date', field: 'RateChangeDate', render: (r) => FormatDate(r.RateChangeDate), sortable: true }, 
                            { label: 'Pay Frequency', field: 'PayFrequency', render: (r) => FormatPayFrequency(r.PayFrequency), sortable: true }, 
                            { label: 'Employee', field: 'FullName', sortable: true }];
  const jobChangesColumns = [{ label: 'Job Title', field: 'JobTitle', sortable: true }, 
                              { label: 'Department', field: 'DepartmentName', sortable: true },
                              { label: 'Start Date', field: 'StartDate', render: (r) => FormatDate(r.StartDate), sortable: true }, 
                              { label: 'End Date', field: 'EndDate', render: (r) => FormatDate(r.EndDate), sortable: true }, 
                              { label: 'Employee', field: 'FullName', sortable: true }];

  // Pages
  const [paymentsPage, setPaymentsPage] = useState(1);
  const [jobChangesPage, setJobChangesPage] = useState(1);
  const ROWS_PER_PAGE = 9;

  const filteredPayments = useMemo(() => {
    return payments.filter((p) => {
      if (filterPaymentEmployee.trim()) {
        const query = filterPaymentEmployee.toLowerCase();
        if (!((p.FullName || '').toLowerCase().includes(query))) return false;
      }
      if (filterRateMin) {
        const minVal = parseFloat(filterRateMin);
        if (p.Rate < minVal) return false;
      }
      if (filterRateMax) {
        const maxVal = parseFloat(filterRateMax);
        if (p.Rate > maxVal) return false;
      }
      if (filterPayFrequency) {
        if (p.PayFrequency !== parseInt(filterPayFrequency, 10)) return false;
      }
      if (filterPaymentDateFrom) {
        const payDate = new Date(p.RateChangeDate);
        const fromDate = new Date(filterPaymentDateFrom);
        if (payDate < fromDate) return false;
      }
      if (filterPaymentDateTo) {
        const payDate = new Date(p.RateChangeDate);
        const toDate = new Date(filterPaymentDateTo);
        if (payDate > toDate) return false;
      }
      return true;
    });
  }, [
    payments,
    filterPaymentEmployee,
    filterRateMin,
    filterRateMax,
    filterPayFrequency,
    filterPaymentDateFrom,
    filterPaymentDateTo,
  ]);

  const filteredJobChanges = useMemo(() => {
    return jobChanges.filter((j) => {
      if (filterJobEmployee.trim()) {
        const query = filterJobEmployee.toLowerCase();
        if (!((j.FullName || '').toLowerCase().includes(query))) return false;
      }
      if (filterDepartment) {
        if (j.DepartmentName !== filterDepartment) return false;
      }
      if (filterJobDateFrom) {
        const jobDate = new Date(j.StartDate);
        const fromDate = new Date(filterJobDateFrom);
        if (jobDate < fromDate) return false;
      }
      if (filterJobDateTo) {
        const jobDate = new Date(j.StartDate);
        const toDate = new Date(filterJobDateTo);
        if (jobDate > toDate) return false;
      }
      return true;
    });
  }, [jobChanges, filterJobEmployee, filterDepartment, filterJobDateFrom, filterJobDateTo]);

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

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmIndex, setConfirmIndex] = useState(null);

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

  function setFormDefaults() {
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
  }

  const [formErrors, setFormErrors] = useState({
    BusinessEntityID: "",
    Rate: "",
    RateChangeDate: "",
    PayFrequency: "",
    P_FullName: "",
    JobTitle: "",
    DepartmentName: "",
    StartDate: "",
    EndDate: "",
    J_FullName: ""
  });

  function setFormErrorsDefaults() {
    setFormErrors({
      BusinessEntityID: "",
      Rate: "",
      RateChangeDate: "",
      PayFrequency: "",
      P_FullName: "",
      JobTitle: "",
      DepartmentName: "",
      StartDate: "",
      EndDate: "",
      J_FullName: ""
    });

  }

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
        jobChangesData.forEach(element => {
          element.JobTitle = CapitalizeFirstLetter(element.JobTitle);
        });
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
    setFormErrorsDefaults();
    setEditIndex(null);
    setFormDefaults();
    setDialogOpen(true);
  };

  const openEdit = (indexInPage) => {
    setMode('edit');
    setFormErrorsDefaults();
    setFormDefaults();
    const realIndex = tab === PAYMENT_TAB ? paymentsStart + indexInPage : jobChangesStart + indexInPage;
    setEditIndex(realIndex);

    if (tab === PAYMENT_TAB) {
      const item = payments[realIndex];
      setForm({
        BusinessEntityID: item?.BusinessEntityID || '',
        Rate: (item?.Rate || '').toString().trim() ? item?.Rate : `€${item?.Rate ?? ''}`,
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

  const onChange = (field) => (v) => {
    let value = v;
    if (tab === PAYMENT_TAB && field === 'Rate') {
      value = value.trimStart();
    }
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  function canSave() {
    setFormErrorsDefaults();
    var isValid = true;

    console.log(form.BusinessEntityID);
    if (tab === PAYMENT_TAB) {
      if (form.BusinessEntityID == '') {
        setFormErrors((prev) => ({ ...prev, BusinessEntityID: "Employee is required." }));
        isValid = false;
      }
      if (form.RateChangeDate.trim() === '') {
        setFormErrors((prev) => ({ ...prev, RateChangeDate: "Rate Change Date is required." }));
        isValid = false;
      }
      if (!form.Rate || form.Rate.toString().trim() === '' || isNaN(form.Rate)) {
        setFormErrors((prev) => ({ ...prev, Rate: "Valid Rate is required." }));
        isValid = false;
      }
      if (form.Rate < 6.5 || form.Rate > 200) {
        setFormErrors((prev) => ({ ...prev, Rate: "Rate must be between 6.5€ and 200€." }));
        isValid = false;
      }
      if (form.PayFrequency != 1 && form.PayFrequency != 2) {
        setFormErrors((prev) => ({ ...prev, PayFrequency: "Pay Frequency must be Monthly or Biweekly." }));
        isValid = false;
      }
    } else {
      if (form.BusinessEntityID.toString().trim() === '') {
        setFormErrors((prev) => ({ ...prev, BusinessEntityID: "Employee is required." }));
        isValid = false;
      }
      if (form.DepartmentName.trim() === '') {
        setFormErrors((prev) => ({ ...prev, DepartmentName: "Department is required." }));
        isValid = false;
      }
      if (form.JobTitle.trim() === '') {
        setFormErrors((prev) => ({ ...prev, JobTitle: "Job Title is required." }));
        isValid = false;
      }
      if (form.StartDate.trim() === '') {
        setFormErrors((prev) => ({ ...prev, StartDate: "Start Date is required." }));
        isValid = false;
      }
    }
    console.log(formErrors);
    return isValid
  }

  const handleAddOrSave = async () => {
    let errorMessage = null;

    if (!canSave()) return;

    if (tab === PAYMENT_TAB) {
      if (mode === 'add') {
        const newItem = {
          BusinessEntityID: form.BusinessEntityID,
          Rate: parseFloat(form.Rate.replace('€', '').trim()),
          RateChangeDate: form.RateChangeDate,
          PayFrequency: parseInt(form.PayFrequency, 10),
        };

        try {
          await HRService.createPayment({
            BusinessEntityID: newItem.BusinessEntityID,
            PFullName: newItem.P_FullName,
            Rate: newItem.Rate,
            RateChangeDate: newItem.RateChangeDate + 'T00:00:00',
            PayFrequency: newItem.PayFrequency,
          });
          setPayments(await HRService.getAllPayments());
          setPaymentsPage(1);
          notif({ severity: 'success', message: 'Payment created with success!' });
        } catch (error) {
          console.error('Error creating payment:', error);
          UserSession.verifyAuthorize(navigate, error?.status);
          errorMessage = ErrorHandler(error);
          notif({ severity: 'error', message: errorMessage || 'Error while creating the payment.' });
        }
      } else if (editIndex != null) {
        const payment = payments[editIndex];

        const newItem = {
          BusinessEntityID: payment.BusinessEntityID,
          P_FullName: payment.FullName,
          Rate: form.Rate,
          RateChangeDate: payment.RateChangeDate,
          PayFrequency: parseInt(form.PayFrequency, 10),
        };

        try {
          await HRService.editPayment({
            BusinessEntityID: newItem.BusinessEntityID,
            FullName: newItem.P_FullName,
            Rate: newItem.Rate,
            RateChangeDate: newItem.RateChangeDate,
            PayFrequency: newItem.PayFrequency,
          });
          setPayments(await HRService.getAllPayments());
          notif({ severity: 'success', message: 'Payment updated with success!' });
        } catch (error) {
          console.error('Error editing payment:', error);
          UserSession.verifyAuthorize(navigate, error?.status);
          errorMessage = ErrorHandler(error);
          notif({ severity: 'error', message: errorMessage || 'Error while updating the payment.' });
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
          await HRService.createMovement({
            BusinessEntityID: newItem.BusinessEntityID,
            FullName: newItem.FullName,
            DepartmentName: newItem.DepartmentName,
            JobTitle: newItem.JobTitle,
            StartDate: newItem.StartDate,
            EndDate: newItem.EndDate,
          });
          setJobChanges(await HRService.getAllMovements());
          setJobChangesPage(1);
          notif({ severity: 'success', message: 'Job change created with success!' });
        } catch (error) {
          console.error('Error creating job change:', error);
          UserSession.verifyAuthorize(navigate, error?.status);
          errorMessage = ErrorHandler(error);
          notif({ severity: 'error', message: errorMessage || 'Error while creating the job change.' });
        }
      } else if (editIndex != null) {
        const jobChange = jobChanges[editIndex];

        const newItem = {
          BusinessEntityID: jobChange.BusinessEntityID,
          DepartmentName: form.DepartmentName,
          StartDate: jobChange.StartDate,
          JobTitle: form.JobTitle,
          EndDate: Date.parse(form.EndDate) || null,
        };

        try {
          await HRService.editMovement({
            BusinessEntityID: newItem.BusinessEntityID,
            FullName: newItem.FullName,
            DepartmentName: newItem.DepartmentName,
            JobTitle: newItem.JobTitle,
            StartDate: newItem.StartDate,
            EndDate: newItem.EndDate,
          });
          setJobChanges(await HRService.getAllMovements());
          notif({ severity: 'success', message: 'Job change modified with success!' });
        } catch (error) {
          console.error('Error editing job change:', error);
          UserSession.verifyAuthorize(navigate, error?.status);
          errorMessage = ErrorHandler(error);
          notif({ severity: 'error', message: errorMessage || 'Error while updating the job change.' });
        }
      }
    }
    closeDialog();
  };

  const handleDelete = async (indexInPage) => {
    let errorMessage = null;
    if (tab === PAYMENT_TAB) {
      try {
        const item = visiblePayments[indexInPage];
        await HRService.deletePayment({
          BusinessEntityID: item.BusinessEntityID,
          RateChangeDate: item.RateChangeDate,
        });
        setPayments((prev) =>
          prev.filter(
            (p) =>
              !(
                p.BusinessEntityID === item.BusinessEntityID &&
                p.RateChangeDate === item.RateChangeDate
              )
          )
        );
        notif({ severity: 'success', message: 'Payment successfully deleted!' });
      } catch (error) {
        console.error('Error deleting payment:', error);
        UserSession.verifyAuthorize(navigate, error?.status);
        errorMessage = ErrorHandler(error);
        notif({ severity: 'error', message: errorMessage || 'Error while deleting the payment.' });
      }
    } else {
      try {
        const item = visibleJobChanges[indexInPage];
        await HRService.deleteMovement({
          BusinessEntityID: item.BusinessEntityID,
          StartDate: item.StartDate,
          DepartmentName: item.DepartmentName,
        });
        setJobChanges((prev) =>
          prev.filter(
            (j) =>
              !(
                j.BusinessEntityID === item.BusinessEntityID &&
                j.StartDate === item.StartDate &&
                j.DepartmentName === item.DepartmentName
              )
          )
        );
        notif({ severity: 'success', message: 'Job change successfully deleted!' });
      } catch (error) {
        console.error('Error deleting job change:', error);
        UserSession.verifyAuthorize(navigate, error?.status);
        errorMessage = ErrorHandler(error);
        notif({
          severity: 'error',
          message: errorMessage || 'Error deleting job change.',
        });
      }
    }
  };

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

  const uniqueDepartments = useMemo(() => {
    const deps = [...new Set(jobChanges.map((j) => j.DepartmentName).filter(Boolean))];
    return deps.sort();
  }, [jobChanges]);

  const paymentColumnsWithActions = paymentsColumns.map((col) =>
    col.label !== 'Actions'
      ? col
      : {
        ...col,
        render: (row) => (
          <Stack direction="row" spacing={1}>
            <IconButton
              aria-label="edit"
              onClick={() => openEdit(row.__pageIndex)}
              sx={{ bgcolor: '#fff3e0', color: '#000000ff', '&:hover': { bgcolor: '#000000ff', color: '#fff' } }}
              size="small"
            >
              <EditOutlinedIcon />
            </IconButton>

            <IconButton
              onClick={() => {
                setConfirmIndex(row.__pageIndex);
                setConfirmOpen(true);
              }}
              sx={{ bgcolor: '#fff3e0', color: '#000000ff', '&:hover': { bgcolor: '#000000ff', color: '#fff' } }}
              size="small"
            >
              <DeleteOutlineIcon />
            </IconButton>
          </Stack>
        ),
      }
  );

  const jobColumnsWithActions = jobChangesColumns.map((col) =>
    col.label !== 'Actions'
      ? col
      : {
        ...col,
        render: (row) => (
          <Stack direction="row" spacing={1}>
            <IconButton
              onClick={() => openEdit(row.__pageIndex)}
              sx={{ bgcolor: '#fff3e0', color: '#000000ff', '&:hover': { bgcolor: '#000000ff', color: '#fff' } }}
              size="small"
            >
              <EditOutlinedIcon />
            </IconButton>

            <IconButton
              onClick={() => {
                setConfirmIndex(row.__pageIndex);
                setConfirmOpen(true);
              }}
              sx={{ bgcolor: '#fff3e0', color: '#000000ff', '&:hover': { bgcolor: '#000000ff', color: '#fff' } }}
              size="small"
            >
              <DeleteOutlineIcon />
            </IconButton>
          </Stack>
        ),
      }
  );

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#fff' }}>
      <HeaderBar />

      <Container maxWidth="lg" sx={{ pt: 3, pb: 5 }}>
        <Box sx={{ mb: 2 }}>
          <StyledTabs value={tab} onChange={handleTabChange}>
            <StyledTab label="Payments" />
            <StyledTab label="Job Changes" />
          </StyledTabs>
        </Box>

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

        {tab === PAYMENT_TAB && (
          <FilterPanel
            title="Filters"
            expanded={filterPaymentsExpanded}
            onToggle={() => setFilterPaymentsExpanded(!filterPaymentsExpanded)}
            onClear={handleClearFiltersPayments}
          >
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
                <MenuItem value="1">Monthly</MenuItem>
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
            </Stack>
          </FilterPanel>
        )}

        {tab === JOB_CHANGE_TAB && (
          <FilterPanel
            title="Filters"
            expanded={filterJobChangesExpanded}
            onToggle={() => setFilterJobChangesExpanded(!filterJobChangesExpanded)}
            onClear={handleClearFiltersJobChanges}
          >
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
            </Stack>
          </FilterPanel>
        )}

        <SectionPaper noOverflow>
          {tab === PAYMENT_TAB ? (
              <DataTable
                columns={paymentColumnsWithActions}
                rows={filteredPayments}
                setRows={setPayments}
                getRowId={(r, idx) => `${r.FullName}-${r.RateChangeDate}-${idx}`}
              />
          ) : (
              <DataTable
                columns={jobColumnsWithActions}
                rows={filteredJobChanges}
                setRows={setJobChanges}
                getRowId={(r, idx) => `${r.FullName}-${r.JobTitle}-${r.StartDate}-${idx}`}
              />
              
          )}
        </SectionPaper>
      </Container>
      <FormPopup
        open={dialogOpen}
        title={mode === 'add' ? 'Add Record' : 'Edit Record'}
        fields={
          tab === PAYMENT_TAB
            ? (mode === 'add'
              ? [
                  { type: 'custom', render: () => <EmployeeSearchField  error={formErrors.BusinessEntityID} onChange={onChange('BusinessEntityID')} />},
                  { type: 'date', label: 'Rate Change Date', value: form.RateChangeDate, onChange: onChange('RateChangeDate'), error: formErrors.RateChangeDate },
                  { type: 'number', label: 'Rate', value: form.Rate, onChange: onChange('Rate'), error: formErrors.Rate },
                  { type: 'select', label: 'Pay Frequency', options: [{label: 'Monthly', value: '1'}, {label: 'Biweekly', value: '2'}], value: form.PayFrequency, onChange: onChange('PayFrequency'), error: formErrors.PayFrequency },
                ]
              : [
                  { type: 'number', label: 'Rate', value: form.Rate, onChange: onChange('Rate'), error: formErrors.Rate },
                  { type: 'select', label: 'Pay Frequency', value: form.PayFrequency, onChange: onChange('PayFrequency'), error: formErrors.PayFrequency },
                ])
            : (mode === 'add'
              ? [
                { type: 'text', label: 'Job Title', value: form.JobTitle, onChange: onChange('JobTitle'), required :true, error: formErrors.JobTitle },
                { type: 'custom', render: () => <DepartmentSelectField label="Department" value={form.DepartmentName} onChange={onChange('DepartmentName')} required={true} error={formErrors.DepartmentName} fullWidth={true} /> },
                { type: 'date', label: 'Start Date', value: form.StartDate, onChange: onChange('StartDate'), required :true, error: formErrors.StartDate },
                { type: 'date', label: 'End Date', value: form.EndDate, onChange: onChange('EndDate'), error: formErrors.EndDate },
                { type: 'custom', render: () => <EmployeeSearchField  error={formErrors.BusinessEntityID} onChange={onChange('BusinessEntityID')} />},
              ] : [
                { type: 'text', label: 'Job Title', value: form.JobTitle, onChange: onChange('JobTitle'), error: formErrors.JobTitle },
                { type: 'custom', render: () => <DepartmentSelectField label="Department" value={form.DepartmentName} onChange={onChange('DepartmentName')} error={formErrors.DepartmentName} fullWidth={true} /> },
                { type: 'date', label: 'End Date', value: form.EndDate, onChange: onChange('EndDate'), error: formErrors.EndDate },
              ])

        }
        onCancel={closeDialog}
        onSubmit={handleAddOrSave}
        submitLabel="Save"
        submitSx={{ bgcolor: '#000', color: '#fff', '&:hover': { bgcolor: '#222' } }}
      />
      <ConfirmPopup
        open={confirmOpen}
        title="Remove record"
        content="Do you really want to delete this record? This action is irreversible."
        onCancel={() => { setConfirmOpen(false); setConfirmIndex(null); }}
        onConfirm={async () => {
          if (confirmIndex == null) return;
          await handleDelete(confirmIndex);
          setConfirmOpen(false);
          setConfirmIndex(null);
        }}
        confirmLabel="Delete"
        confirmButtonSx={{ bgcolor: '#000', color: '#fff', '&:hover': { bgcolor: '#222' } }}
      />
    </Box >
  );
}
