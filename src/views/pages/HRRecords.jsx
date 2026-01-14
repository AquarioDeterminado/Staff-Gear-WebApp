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
<<<<<<< HEAD
  Collapse,
  InputLabel,
  Autocomplete,
  Menu,
=======
>>>>>>> UI
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
<<<<<<< HEAD
import Popups from '../components/Popups';
import EmployeeService from '../../services/EmployeeService';
import { CapitalizeFirstLetter } from '../../utils/FormatingUtils';
import { EmployeeSearchField } from '../components/EmployeeSearchField';
import { DepartmentSelectField } from '../components/DepartmentSelectField';
=======
import DataTable from '../components/table/DataTable';
import Paginator from '../components/table/Paginator';
import FilterPanel from '../components/filters/FilterPanel';
import { StyledTabs, StyledTab } from '../components/ui/surfaces/StyledTabs';
import SectionPaper from '../components/ui/surfaces/SectionPaper';

import FormPopup from '../components/ui/popups/FormPopup';
import ConfirmPopup from '../components/ui/popups/ConfirmPopup';
>>>>>>> UI

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

  const [inputEmployee, setInputEmployee] = useState('');

  const [payments, setPayments] = useState([]);
  const [jobChanges, setJobChanges] = useState([]);
<<<<<<< HEAD
  // Filter Payments
=======

>>>>>>> UI
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

<<<<<<< HEAD
  // Columns
  const paymentsColumns = [{ label: 'Rate', parameter: 'Rate' }, { label: 'Rate Change Date', parameter: 'RateChangeDate' }, { label: 'Pay Frequency', parameter: 'PayFrequency' }, { label: 'Employee', parameter: 'FullName' }];
  const jobChangesColumns = [{ label: 'Job Title', parameter: 'JobTitle' }, { label: 'Department', parameter: 'DepartmentName' }, { label: 'Start Date', parameter: 'StartDate' }, { label: 'End Date', parameter: 'EndDate' }, { label: 'Employee', parameter: 'FullName' }];
  const columns = tab === PAYMENT_TAB ? paymentsColumns : jobChangesColumns;

  const [sorting, setSorting] = useState({ parameter: '', order: '' });
  // Pages
=======
  const paymentsColumnsLabels = ['Rate', 'Changed Rate', 'Pay Frequency', 'Employee'];
  const jobChangesColumnsLabels = ['Job Title', 'Department', 'Start Date', 'End Date', 'Employee'];

>>>>>>> UI
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

<<<<<<< HEAD
  function setFormDefaults() {
=======
  // Confirm delete
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

  const handleTabChange = (_e, v) => {
    setTab(v);
  };

  const openAdd = () => {
    setMode('add');
    setEditIndex(null);
>>>>>>> UI
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

    setInputEmployee('');
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
    if (field === 'BusinessEntityID') {
      const selectedOption = e.target.value;
      value = selectedOption.BusinessEntityID;
    }
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  function canSave() {
    setFormErrorsDefaults();
    var isValid = true;

    console.log(form.BusinessEntityID);
    if (tab === PAYMENT_TAB) {
<<<<<<< HEAD
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
=======
      return form.Rate?.trim() && (form.PayFrequency == 1 || form.PayFrequency == 2);
    }
    return form.JobTitle?.trim() && form.DepartmentName?.trim() && form.StartDate?.trim();
  }, [form, tab]);
>>>>>>> UI

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

<<<<<<< HEAD
  function clickHeader(parameter) {
    let sortingOrder = sorting.parameter === parameter && sorting.order === SORTING_ASCENDING ? SORTING_DESCENDING : sorting.order === SORTING_DESCENDING ? '' : SORTING_ASCENDING;
    setSorting({ "parameter": parameter, "order": sortingOrder });
    var sorted = [];
    console.log(sorting);
    console.log(sortingOrder);


    if (tab === PAYMENT_TAB) {
      sorted = payments
      if (sortingOrder === "") {
        sorted = [...payments].sort((a, b) => {
          if (a["RateChangeDate"] < b["RateChangeDate"]) return -1;
          if (a["RateChangeDate"] > b["RateChangeDate"]) return 1;
          return 0;
        });
      } else if (sortingOrder === SORTING_DESCENDING) {
        sorted = [...payments].sort((a, b) => {
          if (a[parameter] > b[parameter]) return -1;
          if (a[parameter] < b[parameter]) return 1;
          return 0;
        });
      } else if (sortingOrder === SORTING_ASCENDING) {
        sorted = [...payments].sort((a, b) => {
          if (a[parameter] < b[parameter]) return -1;
          if (a[parameter] > b[parameter]) return 1;
          return 0;
        });
      }
      setPayments(sorted);
    } else {
      sorted = jobChanges
      if (sortingOrder === "") {
        sorted = [...jobChanges].sort((a, b) => {
          if (a["StartDate"] < b["StartDate"]) return -1;
          if (a["StartDate"] > b["StartDate"]) return 1;
          return 0;
        });
      } else if (sortingOrder === SORTING_DESCENDING) {
        sorted = [...jobChanges].sort((a, b) => {
          if (a[parameter] < b[parameter]) return -1;
          if (a[parameter] > b[parameter]) return 1;
          return 0;
        });
      } else if (sortingOrder === SORTING_ASCENDING) {
        sorted = [...jobChanges].sort((a, b) => {
          if (a[parameter] > b[parameter]) return -1;
          if (a[parameter] < b[parameter]) return 1;
          return 0;
        });
      }

      console.log(sorting);
      setJobChanges(sorted);
    }
  }
=======
  const paymentColumns = [
    { label: 'Rate', width: '15%', render: (p) => `${Math.round((p.Rate + Number.EPSILON) * 100) / 100}€` },
    { label: 'Changed Rate', width: '20%', render: (p) => new Date(p.RateChangeDate).toLocaleString('fr-FR', { dateStyle: 'short' }) },
    { label: 'Pay Frequency', width: '20%', render: (p) => (p.PayFrequency == 1 ? 'Monthly' : 'Biweekly') },
    { label: 'Employee', width: '35%', render: (p) => p.FullName },
    { label: 'Actions', width: '10%', render: () => null },
  ];

  const jobColumns = [
    { label: 'Job Title', width: '20%', render: (c) => c.JobTitle },
    { label: 'Department', width: '20%', render: (c) => c.DepartmentName },
    { label: 'Start Date', width: '20%', render: (c) => c.StartDate },
    { label: 'End Date', width: '20%', render: (c) => (c.EndDate || 'Present') },
    { label: 'Employee', width: '20%', render: (c) => c.FullName },
    { label: 'Actions', width: '10%', render: () => null },
  ];

  const payRows = visiblePayments.map((r, idx) => ({ ...r, __pageIndex: idx }));
  const jobRows = visibleJobChanges.map((r, idx) => ({ ...r, __pageIndex: idx }));

  const paymentColumnsWithActions = paymentColumns.map((col) =>
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

  const jobColumnsWithActions = jobColumns.map((col) =>
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
>>>>>>> UI

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

<<<<<<< HEAD
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
                    onClick={() => clickHeader(c.parameter)}
                    key={c.label}
                    sx={{
                      borderRight: i < columns.length - 1 ? '1px solid rgba(0,0,0,0.2)' : 'none',
                      color: '#333',
                    }}
                  >
                    <>
                      {c.label}
                      {sorting.parameter === c.parameter ? (
                        sorting.order === SORTING_ASCENDING ? (
                          <ArrowUpwardIcon sx={{ fontSize: 16, ml: 0.5, verticalAlign: 'middle' }} />
                        ) : sorting.order === SORTING_DESCENDING ? (
                          <ArrowDownwardIcon sx={{ fontSize: 16, ml: 0.5, verticalAlign: 'middle' }} />
                        ) : null
                      ) : null}

                    </>
                  </TableCell>
                ))}
                <TableCell sx={{ color: '#333' }}>Actions</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {tab === PAYMENT_TAB ? (
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
                      <TableCell>{Math.round((p.Rate + Number.EPSILON) * 100) / 100}€</TableCell>
                      <TableCell>{new Date(p.RateChangeDate).toLocaleString('fr-FR', { dateStyle: 'short' })}</TableCell>
                      <TableCell>{p.PayFrequency == 1 ? 'Monthly' : 'Biweekly'}</TableCell>
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
                          <Popups
                            title="Remove record"
                            message="Do you really want to delete this record? This action is irreversible."
                            onConfirm={async () => {
                              await handleDelete(idx);
                              notif({
                                severity: 'success',
                                message: 'Payment successfully deleted!',
                              });
                            }}
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
                          onConfirm={async () => {
                            await handleDelete(idx);
                            notif({
                              severity: 'success',
                              message: 'Job change successfully deleted!',
                            });
                          }}
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
            {tab === PAYMENT_TAB ? (
              <Pagination
=======
        <SectionPaper noOverflow>
          {tab === PAYMENT_TAB ? (
            <>
              <DataTable
                columns={paymentColumnsWithActions}
                rows={payRows}
                getRowId={(r, idx) => `${r.FullName}-${r.RateChangeDate}-${idx}`}
              />
              <Paginator
>>>>>>> UI
                count={paymentsCount}
                page={paymentsPage}
                onChange={(_, p) => setPaymentsPage(p)}
              />
            </>
          ) : (
            <>
              <DataTable
                columns={jobColumnsWithActions}
                rows={jobRows}
                getRowId={(r, idx) => `${r.FullName}-${r.JobTitle}-${r.StartDate}-${idx}`}
              />
              <Paginator
                count={jobChangesCount}
                page={jobChangesPage}
                onChange={(_, p) => setJobChangesPage(p)}
              />
            </>
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
                  { type: 'text', label: 'Employee', value: form.BusinessEntityID, onChange: onChange('BusinessEntityID') },
                  { type: 'text', label: 'Rate Change Date (yyyy-mm-ddThh:mm:ss)', value: form.RateChangeDate, onChange: onChange('RateChangeDate') },
                  { type: 'text', label: 'Rate', value: form.Rate, onChange: onChange('Rate') },
                  { type: 'text', label: 'Pay Frequency', value: form.PayFrequency, onChange: onChange('PayFrequency') },
                ]
              : [
                  { type: 'text', label: 'Rate', value: form.Rate, onChange: onChange('Rate') },
                  { type: 'text', label: 'Pay Frequency', value: form.PayFrequency, onChange: onChange('PayFrequency') },
                ])
            : [
                { type: 'text', label: 'Job Title', value: form.JobTitle, onChange: onChange('JobTitle') },
                { type: 'text', label: 'Department', value: form.DepartmentName, onChange: onChange('DepartmentName') },
                { type: 'text', label: 'Start Date (yyyy-mm-dd)', value: form.StartDate, onChange: onChange('StartDate') },
                { type: 'text', label: 'End Date (yyyy-mm-dd, optional)', value: form.EndDate, onChange: onChange('EndDate') },
                { type: 'text', label: 'Employee', value: form.BusinessEntityID, onChange: onChange('BusinessEntityID') },
              ]
        }
        onCancel={closeDialog}
        onSubmit={handleAddOrSave}
        submitLabel="Save"
        submitSx={{ bgcolor: '#000', color: '#fff', '&:hover': { bgcolor: '#222' } }}
      />

<<<<<<< HEAD
        <DialogContent dividers>
          <Stack spacing={1.5}>
            {tab === PAYMENT_TAB ? (
              mode === 'add' ? (
                <>
                  <EmployeeSearchField
                  onChange={(event, newValue) => {
                    setForm((prev => ({ ...prev, BusinessEntityID: newValue ? newValue.BusinessEntityID : '' }))  );
                  }}
                  error={formErrors.BusinessEntityID}
                  helperText={formErrors.BusinessEntityID}
                />
                  <TextField
                    label="Rate Change Date"
                    value={form.RateChangeDate}
                    type='date'
                    onChange={onChange('RateChangeDate')}
                    placeholder="dd-mm-yyyy"
                    fullWidth
                    size="small"
                    slotProps={{
                      inputLabel: { shrink: true }
                    }}
                    required
                    error={!!formErrors.RateChangeDate}
                    helperText={formErrors.RateChangeDate}
                  />
                  <TextField
                    label="Rate"
                    type='number'
                    value={form.Rate}
                    onChange={onChange('Rate')}
                    fullWidth
                    size="small"
                    required
                    InputProps={{
                      startAdornment: <InputAdornment position="start">€</InputAdornment>,
                    }}
                    error={!!formErrors.Rate}
                    helperText={formErrors.Rate}
                  />
                  <Select
                    value={form.PayFrequency}
                    onChange={onChange('PayFrequency')}
                    size="small"
                    displayEmpty
                    sx={{ flex: 1 }}
                    error={!!formErrors.PayFrequency}
                  >
                    <MenuItem value="">Pay Rate</MenuItem>
                    {["Monthly", "Biweekly"].map((freq) => (
                      <MenuItem key={freq} value={freq === "Monthly" ? 1 : 2}>
                        {freq}
                      </MenuItem>
                    ))}
                  </Select>
                </>
              ) : (
                <>
                  <TextField
                    label="Rate"
                    type='number'
                    min={6.5}
                    max={200}
                    step={0.01}
                    placeholder={form.Rate}
                    value={form.Rate}
                    onChange={onChange('Rate')}
                    fullWidth
                    size="small"
                    required
                    InputProps={{
                      startAdornment: <InputAdornment position="start">€</InputAdornment>,
                    }}
                    error={!!formErrors.Rate}
                    helperText={formErrors.Rate}
                  />
                  <Select
                    value={form.PayFrequency}
                    onChange={onChange('PayFrequency')}
                    size="small"
                    displayEmpty
                    sx={{ flex: 1 }}
                    error={!!formErrors.PayFrequency}
                    helperText={formErrors.PayFrequency}
                  >
                    <MenuItem value="">Pay Rate</MenuItem>
                    {["Monthly", "Biweekly"].map((freq) => (
                      <MenuItem key={freq} value={freq === "Monthly" ? 1 : (freq === "Biweekly" ? 2 : -1)}>
                        {freq}
                      </MenuItem>
                    ))}
                  </Select>
                </>
              )
            ) : (
              mode === 'add' ? (
                <>
                  <TextField
                    label="Job Title"
                    value={form.JobTitle}
                    onChange={onChange('JobTitle')}
                    fullWidth
                    size="small"
                    required
                    error={!!formErrors.JobTitle}
                    helperText={formErrors.JobTitle}
                  />
                  <DepartmentSelectField
                    onChange={onChange('DepartmentName')}
                    error={!!formErrors.DepartmentName}
                  />
                  <TextField
                    label="Start Date (yyyy-mm-dd)"
                    type='date'
                    value={form.StartDate}
                    onChange={onChange('StartDate')}
                    slotProps={{
                      inputLabel: { shrink: true }
                    }}
                    fullWidth
                    size="small"
                    required
                    error={!!formErrors.StartDate}
                    helperText={formErrors.StartDate}
                  />
                  <TextField
                    label="End Date (yyyy-mm-dd)"
                    type='date'
                    value={form.EndDate}
                    onChange={onChange('EndDate')}
                    slotProps={{
                      inputLabel: { shrink: true }
                    }}
                    fullWidth
                    size="small"
                  />
                  <EmployeeSearchField
                    onChange={(event, newValue) => {
                      //setInputEmployee(newValue);
                      setForm((prev => ({ ...prev, BusinessEntityID: newValue ? newValue.BusinessEntityID : '' })));
                    }}
                    error={formErrors.BusinessEntityID}
                    helperText={formErrors.BusinessEntityID}
                  />
                </>
              ) : (
                <>
                  <TextField
                    label="Job Title"
                    value={form.JobTitle}
                    onChange={onChange('JobTitle')}
                    fullWidth
                    size="small"
                    required
                    error={!!formErrors.JobTitle}
                    helperText={formErrors.JobTitle}
                  />
                  <TextField
                    label="End Date (yyyy-mm-dd)"
                    type='date'
                    value={form.EndDate}
                    onChange={onChange('EndDate')}
                    slotProps={{
                      inputLabel: { shrink: true }
                    }}
                    fullWidth
                    size="small"
                  />
                </>
              )
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
            Save
          </Button>
        </DialogActions>
      </Dialog>
=======
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
>>>>>>> UI
    </Box>
  );
}
