import React, { useEffect, useState, Fragment } from 'react';
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
  Grid,
} from '@mui/material';

import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import AddIcon from '@mui/icons-material/AddCircleOutline';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import StorageIcon from '@mui/icons-material/Storage';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import ErrorHandler from '../../utils/ErrorHandler';
import HeaderBar from '../components/layout/HeaderBar';
import { useNavigate } from 'react-router-dom';
import UserSession from '../../utils/UserSession';
import HRService from '../../services/HRService';
import useNotification from '../../utils/UseNotification';
import EmployeeService from '../../services/EmployeeService';
import { CapitalizeFirstLetter } from '../../utils/FormatingUtils';
import { EmployeeSearchField } from '../components/fields/EmployeeSearchField.jsx';
import { DepartmentSelectField } from '../components/fields/DepartmentSelectField.jsx';
import PaymentViewModel from '../../models/viewModels/PaymentViewModel.js';
import MovementViewModel from '../../models/viewModels/MovementViewModel.js';
import DataTable from '../components/table/DataTable';
import Paginator from '../components/table/Paginator';
import FilterPanel from '../components/filters/FilterPanel';
import { StyledTabs, StyledTab } from '../components/ui/surfaces/StyledTabs';
import SectionPaper from '../components/ui/surfaces/SectionPaper';
import FormPopup from '../components/ui/popups/FormPopup';
import ConfirmPopup from '../components/ui/popups/ConfirmPopup';
import StatCard from '../components/ui/StatCard';
import { FormatCurrency, FormatPayFrequency, FormatDate } from '../../utils/FormatingUtils';
import { EditRowButton } from '../components/ui/buttons/EditRowButton';
import { DeleteRowButton } from '../components/ui/buttons/DeleteRowButton';
import NumberField from '../components/fields/NumberField.jsx';

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
  const [canSwitchPage, setCanSwitchPage] = useState(true);

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

  const [sort, setSort] = useState({ SortBy: 'CreatedAt', Direction: 'asc' });

  // Columns
  const actionColum = {
    label: 'Actions',
    field: 'actions',
    sortable: false,
    render: (r, idx) => (
      <Stack direction="row" spacing={1}>
        <EditRowButton openEdit={openEdit} idx={idx} />
        <DeleteRowButton openConfirm={setConfirmOpen} setConfirmIndex={setConfirmIndex} idx={idx} />
      </Stack>
    ),
  };

  const paymentsColumns = [
    { label: 'Rate', field: 'Rate', render: (r) => FormatCurrency(r.Rate), sortable: true },
    { label: 'Rate Change Date', field: 'RateChangeDate', render: (r) => FormatDate(r.RateChangeDate), sortable: true },
    { label: 'Pay Frequency', field: 'PayFrequency', render: (r) => FormatPayFrequency(r.PayFrequency), sortable: true },
    { label: 'Employee', field: 'FullName', sortable: true },
    actionColum,
  ];

  const jobChangesColumns = [
    { label: 'Job Title', field: 'JobTitle', sortable: true },
    { label: 'Department', field: 'DepartmentName', sortable: true },
    { label: 'Start Date', field: 'StartDate', render: (r) => FormatDate(r.StartDate), sortable: true },
    { label: 'End Date', field: 'EndDate', render: (r) => FormatDate(r.EndDate), sortable: true },
    { label: 'Employee', field: 'FullName', sortable: true },
    actionColum,
  ];

  // Pages
  const [currentPage, setCurrentPage] = useState(1);

  const [paymentsPageCount, setPaymentsPageCount] = useState(1);
  const [jobChangesPageCount, setJobChangesPageCount] = useState(1);
  const ROWS_PER_PAGE = 10;

  const visiblePayments = payments;
  const visibleJobChanges = jobChanges;

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
    async function fetchPayments() {
      try {
        setCanSwitchPage(false);

        const data = await HRService.getAllPayments(
          currentPage,
          ROWS_PER_PAGE,
          [
            { Fields: ['FullName'], Values: [filterPaymentEmployee], Type: 'Contains' },
            { Fields: ['RateFrom', 'RateTo'], Values: [filterRateMin, filterRateMax], Type: 'Range' },
            { Fields: ['PayFrequency'], Values: [filterPayFrequency], Type: 'Equals' },
            { Fields: ['RateChangeDateFrom', 'RateChangeDateTo'], Values: [filterPaymentDateFrom, filterPaymentDateTo], Type: 'Range' },
          ],
          { SortBy: sort.SortBy, Direction: sort.Direction }
        );

        setPaymentsPageCount(Math.ceil(data.totalCount / ROWS_PER_PAGE));

        const paymentsData = data.items.map(
          (payment) =>
            new PaymentViewModel({
              BusinessEntityID: payment.businessEntityID,
              FullName: payment.fullName,
              Rate: payment.rate,
              RateChangeDate: payment.rateChangeDate,
              PayFrequency: payment.payFrequency,
            })
        );

        setPayments(paymentsData);
        setCanSwitchPage(true);
      } catch (error) {
        console.error('Error fetching payments:', error);
        UserSession.verifyAuthorize(navigate, error?.status);
      }
    }
    fetchPayments();
  }, [
    currentPage,
    filterPayFrequency,
    filterPaymentDateFrom,
    filterPaymentDateTo,
    filterPaymentEmployee,
    filterRateMax,
    filterRateMin,
    navigate,
    sort.Direction,
    sort.SortBy,
  ]);

  useEffect(() => {
    async function fetchMovements() {
      try {
        setCanSwitchPage(false);
        console.log('sort', sort);
        const data = await HRService.getAllMovements(
          currentPage,
          ROWS_PER_PAGE,
          [
            { Fields: ['FullName'], Values: [filterJobEmployee], Type: 'Contains' },
            { Fields: ['DepartmentName'], Values: [filterDepartment], Type: 'Contains' },
            { Fields: ['StartDateFrom'], Values: [filterJobDateFrom], Type: 'Range' },
            { Fields: ['StartDateTo'], Values: [filterJobDateTo], Type: 'Range' },
          ],
          { SortBy: sort.SortBy, Direction: sort.Direction }
        );

        setJobChangesPageCount(Math.ceil(data.totalCount / ROWS_PER_PAGE));

        const movementsData = data.items.map(
          (movement) =>
            new MovementViewModel({
              BusinessEntityID: movement.businessEntityID,
              FullName: movement.fullName,
              DepartmentName: movement.departmentName,
              JobTitle: movement.jobTitle,
              StartDate: movement.startDate,
              EndDate: movement.endDate,
            })
        );

        setJobChanges(movementsData);
        setCanSwitchPage(true);
      } catch (error) {
        console.error('Error fetching job changes:', error);
        UserSession.verifyAuthorize(navigate, error?.status);
      }
    }
    fetchMovements();
  }, [
    currentPage,
    filterDepartment,
    filterJobDateFrom,
    filterJobDateTo,
    filterJobEmployee,
    navigate,
    sort,
    sort.Direction,
    sort.SortBy,
  ]);

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
    BusinessEntityID: '',
    Rate: '',
    RateChangeDate: '',
    PayFrequency: '',
    P_FullName: '',
    JobTitle: '',
    DepartmentName: '',
    StartDate: '',
    EndDate: '',
    J_FullName: '',
  });

  function setFormErrorsDefaults() {
    setFormErrors({
      BusinessEntityID: '',
      Rate: '',
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
    setEditIndex(indexInPage);

    if (tab === PAYMENT_TAB) {
      const item = payments[indexInPage];
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
      const item = jobChanges[indexInPage];
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
        setFormErrors((prev) => ({ ...prev, BusinessEntityID: 'Employee is required.' }));
        isValid = false;
      }
      if (form.RateChangeDate.trim() === '') {
        setFormErrors((prev) => ({ ...prev, RateChangeDate: 'Rate Change Date is required.' }));
        isValid = false;
      }
      if (!form.Rate || form.Rate.toString().trim() === '' || isNaN(form.Rate)) {
        setFormErrors((prev) => ({ ...prev, Rate: 'Valid Rate is required.' }));
        isValid = false;
      }
      if (form.Rate < 6.5 || form.Rate > 200) {
        setFormErrors((prev) => ({ ...prev, Rate: 'Rate must be between 6.5€ and 200€.' }));
        isValid = false;
      }
      if (form.PayFrequency != 1 && form.PayFrequency != 2) {
        setFormErrors((prev) => ({ ...prev, PayFrequency: 'Pay Frequency must be Monthly or Biweekly.' }));
        isValid = false;
      }
    } else {
      if (form.BusinessEntityID.toString().trim() === '') {
        setFormErrors((prev) => ({ ...prev, BusinessEntityID: 'Employee is required.' }));
        isValid = false;
      }
      if (form.DepartmentName.trim() === '') {
        setFormErrors((prev) => ({ ...prev, DepartmentName: 'Department is required.' }));
        isValid = false;
      }
      if (form.JobTitle.trim() === '') {
        setFormErrors((prev) => ({ ...prev, JobTitle: 'Job Title is required.' }));
        isValid = false;
      }
      if (form.StartDate.trim() === '') {
        setFormErrors((prev) => ({ ...prev, StartDate: 'Start Date is required.' }));
        isValid = false;
      }
    }
    console.log(formErrors);
    return isValid;
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
          setPayments(await HRService.getAllPayments(currentPage, ROWS_PER_PAGE));
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
            (p) => !(p.BusinessEntityID === item.BusinessEntityID && p.RateChangeDate === item.RateChangeDate)
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
  };

  const handleClearFiltersJobChanges = () => {
    setFilterJobEmployee('');
    setFilterDepartment('');
    setFilterJobDateFrom('');
    setFilterJobDateTo('');
  };


  const paymentColumnsWithActions = paymentsColumns.map((col) =>
    col.label !== 'Actions'
      ? col
      : {
          ...col,
          render: (row, idx) => (
            <Stack direction="row" spacing={1}>
              <IconButton
                aria-label="edit"
                onClick={() => openEdit(idx)}
                sx={{ bgcolor: '#fff3e0', color: '#000000ff', '&:hover': { bgcolor: '#000000ff', color: '#fff' } }}
                size="small"
              >
                <EditOutlinedIcon />
              </IconButton>

            <IconButton
              onClick={() => {
                setConfirmIndex(idx);
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
          render: (row, idx) => (
            <Stack direction="row" spacing={1}>
              <IconButton
                onClick={() => openEdit(idx)}
                sx={{ bgcolor: '#fff3e0', color: '#000000ff', '&:hover': { bgcolor: '#000000ff', color: '#fff' } }}
                size="small"
              >
                <EditOutlinedIcon />
              </IconButton>

              <IconButton
                onClick={() => {
                  setConfirmIndex(idx);
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

      <Box sx={{ bgcolor: '#f5f5f5', minHeight: 'calc(100vh - 64px)' }}>
        <Container maxWidth="lg" sx={{ pt: 3, pb: 5 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
            <Box>
              {/* === Alteração: ícones nos separadores === */}
              <StyledTabs value={tab} onChange={handleTabChange}>
                <StyledTab
                  label="Payments"
                  icon={<AttachMoneyIcon fontSize="small" />}
                  iconPosition="start"
                />
                <StyledTab
                  label="Job Changes"
                  icon={<SwapHorizIcon fontSize="small" />}
                  iconPosition="start"
                />
              </StyledTabs>
            </Box>
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
                  }}
                  size="small"
                  sx={{ flex: 1 }}
                />
                <NumberField
                  label="Rate Min"
                  type="float"
                  value={filterRateMin}
                  onChange={(value) => {
                    setFilterRateMin(value);
                  }}
                  size="small"
                  sx={{ flex: 1 }}
                  inputProps={{ step: '0.01' }}
                />
                <NumberField
                  label="Rate Max"
                  type="float"
                  value={filterRateMax}
                  onChange={(value) => {
                    setFilterRateMax(value);
                  }}
                  size="small"
                  sx={{ flex: 1 }}
                  inputProps={{ step: '0.01' }}
                />
                <Select
                  value={filterPayFrequency}
                  onChange={(e) => {
                    setFilterPayFrequency(e.target.value);
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
                  }}
                  size="small"
                  sx={{ flex: 2 }}
                />
                <DepartmentSelectField
                  label="Department"
                  value={filterDepartment}
                  onChange={(value) => {
                    setFilterDepartment(value);
                  }}
                  size="small"
                  sx={{ flex: 1 }}
                />
              </Stack>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                <TextField
                  label="Date From"
                  type="date"
                  value={filterJobDateFrom}
                  onChange={(e) => {
                    setFilterJobDateFrom(e.target.value);
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
                  }}
                  size="small"
                  sx={{ flex: 1 }}
                  InputLabelProps={{ shrink: true }}
                />
              </Stack>
            </FilterPanel>
          )}

          <Grid container spacing={2} sx={{ mb: 3, justifyContent: 'center' }}>
            {tab === PAYMENT_TAB && (
              <>
                <Grid item xs={12} sm={6} md={2.4}>
                  <StatCard icon={StorageIcon} label="Total Records" value={payments.length} color="#ff9800" />
                </Grid>
                <Grid item xs={12} sm={6} md={2.4}>
                  <StatCard
                    icon={AttachMoneyIcon}
                    label="Total Amount"
                    value={FormatCurrency(payments.reduce((sum, p) => sum + (p.Rate || 0), 0))}
                    color="#ff9800"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={2.4}>
                  <StatCard
                    icon={ArrowUpwardIcon}
                    label="Avg. Rate"
                    value={FormatCurrency(
                      payments.length > 0 ? payments.reduce((sum, p) => sum + (p.Rate || 0), 0) / payments.length : 0
                    )}
                    color="#ff9800"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={2.4}>
                  <StatCard
                    icon={ArrowUpwardIcon}
                    label="Highest Rate"
                    value={FormatCurrency(payments.length > 0 ? Math.max(...payments.map((p) => p.Rate || 0)) : 0)}
                    color="#ff9800"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={2.4}>
                  <StatCard
                    icon={StorageIcon}
                    label="Monthly %"
                    value={
                      payments.length > 0
                        ? `${Math.round((payments.filter((p) => p.PayFrequency === 1).length / payments.length) * 100)}%`
                        : '0%'
                    }
                    color="#ff9800"
                  />
                </Grid>
              </>
            )}
            {tab === JOB_CHANGE_TAB && (
              <>
                <Grid item xs={12} sm={6} md={2.4}>
                  <StatCard icon={StorageIcon} label="Total Changes" value={jobChanges.length} color="#ff9800" />
                </Grid>
                <Grid item xs={12} sm={6} md={2.4}>
                  <StatCard
                    icon={SwapHorizIcon}
                    label="Active Employees"
                    value={new Set(jobChanges.map((j) => j.BusinessEntityID)).size}
                    color="#ff9800"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={2.4}>
                  <StatCard
                    icon={StorageIcon}
                    label="Recent Changes (30 Days)"
                    value={
                      jobChanges.filter((j) => {
                        const changeDate = new Date(j.StartDate);
                        const thirtyDaysAgo = new Date();
                        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                        return changeDate >= thirtyDaysAgo;
                      }).length
                    }
                    color="#ff9800"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={2.4}>
                  <StatCard
                    icon={ArrowUpwardIcon}
                    label="Top Department"
                    value={
                      jobChanges.length > 0
                        ? Object.entries(
                            jobChanges.reduce((acc, j) => {
                              acc[j.DepartmentName] = (acc[j.DepartmentName] || 0) + 1;
                              return acc;
                            }, {})
                          ).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A'
                        : 'N/A'
                    }
                    color="#ff9800"
                  />
                </Grid>
              </>
            )}
          </Grid>

          <SectionPaper noOverflow>
            {tab === PAYMENT_TAB ? (
              <DataTable
                columns={paymentColumnsWithActions}
                rows={payments}
                getRowId={(r, idx) => `${r.FullName}-${r.RateChangeDate}-${idx}`}
                onPageChange={setCurrentPage}
                pageCount={paymentsPageCount}
                canSwitchPage={canSwitchPage}
                onSortChange={(sort) => {
                  setSort({ SortBy: sort.SortBy, Direction: sort.Direction });
                }}
                page={currentPage}
              />
            ) : (
              <DataTable
                columns={jobColumnsWithActions}
                rows={jobChanges}
                getRowId={(r, idx) => `${r.FullName}-${r.JobTitle}-${r.StartDate}-${idx}`}
                onPageChange={setCurrentPage}
                pageCount={jobChangesPageCount}
                canSwitchPage={canSwitchPage}
                onSortChange={(sort) => {
                  setSort({ SortBy: sort.SortBy, Direction: sort.Direction });
                }}
                page={currentPage}
              />
            )}
          </SectionPaper>
        </Container>
        <FormPopup
          open={dialogOpen}
          title={mode === 'add' ? 'Add Record' : 'Edit Record'}
          fields={
            tab === PAYMENT_TAB
              ? mode === 'add'
                ? [
                    {
                      type: 'custom',
                      render: () => <EmployeeSearchField error={formErrors.BusinessEntityID} onChange={onChange('BusinessEntityID')} />,
                    },
                    { type: 'date', label: 'Rate Change Date', value: form.RateChangeDate, onChange: onChange('RateChangeDate'), error: formErrors.RateChangeDate },
                    { type: 'number', label: 'Rate', value: form.Rate, onChange: onChange('Rate'), error: formErrors.Rate },
                    {
                      type: 'select',
                      label: 'Pay Frequency',
                      options: [
                        { label: 'Monthly', value: '1' },
                        { label: 'Biweekly', value: '2' },
                      ],
                      value: form.PayFrequency,
                      onChange: onChange('PayFrequency'),
                      error: formErrors.PayFrequency,
                    },
                  ]
                : [
                    { type: 'number', label: 'Rate', value: form.Rate, onChange: onChange('Rate'), error: formErrors.Rate },
                    {
                      type: 'select',
                      label: 'Pay Frequency',
                      options: [
                        { label: 'Monthly', value: '1' },
                        { label: 'Biweekly', value: '2' },
                      ],
                      value: form.PayFrequency,
                      onChange: onChange('PayFrequency'),
                      error: formErrors.PayFrequency,
                    },
                  ]
              : mode === 'add'
              ? [
                  { type: 'text', label: 'Job Title', value: form.JobTitle, onChange: onChange('JobTitle'), required: true, error: formErrors.JobTitle },
                  {
                    type: 'custom',
                    render: () => (
                      <DepartmentSelectField
                        label="Department"
                        value={form.DepartmentName}
                        onChange={onChange('DepartmentName')}
                        required={true}
                        error={formErrors.DepartmentName}
                        fullWidth={true}
                      />
                    ),
                  },
                  { type: 'date', label: 'Start Date', value: form.StartDate, onChange: onChange('StartDate'), required: true, error: formErrors.StartDate },
                  { type: 'date', label: 'End Date', value: form.EndDate, onChange: onChange('EndDate'), error: formErrors.EndDate },
                  {
                    type: 'custom',
                    render: () => <EmployeeSearchField error={formErrors.BusinessEntityID} onChange={onChange('BusinessEntityID')} />,
                  },
                ]
              : [
                  { type: 'text', label: 'Job Title', value: form.JobTitle, onChange: onChange('JobTitle'), error: formErrors.JobTitle },
                  {
                    type: 'custom',
                    render: () => (
                      <DepartmentSelectField
                        label="Department"
                        value={form.DepartmentName}
                        onChange={onChange('DepartmentName')}
                        error={formErrors.DepartmentName}
                        fullWidth={true}
                      />
                    ),
                  },
                  { type: 'date', label: 'End Date', value: form.EndDate, onChange: onChange('EndDate'), error: formErrors.EndDate },
                ]
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
          onCancel={() => {
            setConfirmOpen(false);
            setConfirmIndex(null);
          }}
          onConfirm={async () => {
            if (confirmIndex == null) return;
            await handleDelete(confirmIndex);
            setConfirmOpen(false);
            setConfirmIndex(null);
          }}
          confirmLabel="Delete"
          confirmButtonSx={{ bgcolor: '#000', color: '#fff', '&:hover': { bgcolor: '#222' } }}
        />
      </Box>
    </Box>
  );
}
