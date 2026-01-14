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
  Card,
  CardHeader,
  CardContent,
} from '@mui/material';
import Collapse from '@mui/material/Collapse';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import HeaderBar from '../components/layout/HeaderBar';
import EmployeeService from '../../services/EmployeeService';
import { useNavigate } from 'react-router-dom';
import UserSession from '../../utils/UserSession';
import AddIcon from '@mui/icons-material/AddCircleOutline';
import ErrorHandler from '../../utils/ErrorHandler';
import useNotification from '../../utils/UseNotification';
import { DepartmentSelectField } from '../components/DepartmentSelectField';
import { CapitalizeFirstLetter, FormatDate } from '../../utils/FormatingUtils';

const SORTING_ASCENDING = 'asc';
const SORTING_DESCENDING = 'desc';
import DataTable from '../components/table/DataTable';
import Paginator from '../components/table/Paginator';
import SectionPaper from '../components/ui/surfaces/SectionPaper';
import FormPopup from '../components/ui/popups/FormPopup';
import ConfirmPopup from '../components/ui/popups/ConfirmPopup';

export default function EmployeesList() {
  const navigate = useNavigate();
  const notifs = useNotification();
  const [Users, setUsers] = useState([]);

  const nextBusinessIdRef = useRef(Math.max(0, ...Users.map((r) => r.BusinessEntityID)) + 1);

  const columns = [{label: 'Business ID', field: 'BusinessEntityID'}, 
                  {label: 'Name', field: 'FirstName', render: (r) => `${r.FirstName} ${r.MiddleName ? r.MiddleName + ' ' : ''}${r.LastName}`}, 
                  {label: 'Email', field: 'Email'}, 
                  {label: 'Department', field: 'Department'}, 
                  {label: 'Job Title', field: 'JobTitle'}, 
                  {label: 'Hire Date', field: 'HireDate', render: (r) => FormatDate(r.HireDate)}];

  const [sorting, setSorting] = useState({ parameter: '', order: '' });
  

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
    firstName: '', middleName: '', lastName: '', email: '', department: '', jobTitle: '', hireDate: '', password: '',
  });

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmId, setConfirmId] = useState(null);

  const isValidDateYMD = (str) => /^\d{4}-\d{2}-\d{2}$/.test(str);
  const isValidEmailBasic = (str) => /^[^@\s]+@[^@\s]+$/.test(str);

  const validateForm = (curr) => {
    const newErrors = {
      firstName: curr.firstName?.trim() ? '' : 'Mandatory.',
      lastName: curr.lastName?.trim() ? '' : 'Mandatory.',
      email: curr.email?.trim() ? (isValidEmailBasic(curr.email) ? '' : 'Invalid Email') : 'Mandatory.',
      department: curr.department?.trim() ? '' : 'Mandatory.',
      jobTitle: curr.jobTitle?.trim() ? '' : 'Mandatory.',
      hireDate: curr.hireDate?.trim()
        ? isValidDateYMD(curr.hireDate)
          ? ''
          : 'Format should be yyyy-mm-dd.'
        : 'Mandatory.',
      password: curr.password == '' || curr.password?.trim() ? '' : 'Mandatory.',
    };
    setErrors(newErrors);
    return Object.values(newErrors).every((e) => e === '');
  };
  
  const [filterExpanded, setFilterExpanded] = useState(false);
  const [filterBusinessId, setFilterBusinessId] = useState('');
  const [filterName, setFilterName] = useState('');
  const [filterEmail, setFilterEmail] = useState('');
  const [filterEntryDateFrom, setFilterEntryDateFrom] = useState('');
  const [filterEntryDateTo, setFilterEntryDateTo] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');
  const [filterJobTitle, setFilterJobTitle] = useState('');
  const handleClearFilterss = () => {
    setFilterBusinessId('');
    setFilterName('');
    setFilterEmail('');
    setFilterEntryDateFrom('');
    setFilterEntryDateTo('');
    setFilterDepartment('');
    setFilterJobTitle('');
  };

  const filteredEmployees = useMemo(() => {
    return Users.filter((p) => {
      if (filterBusinessId.trim()) {
        const query = filterBusinessId.toString().toLowerCase();
        if (!(p.BusinessEntityID.toString() || '').toLowerCase().includes(query)) return false;
      }
      if (filterName.trim()) {
        const query = filterName.toLowerCase();
        if (!(p.FirstName + p.MiddleName + p.LastName || '').toLowerCase().includes(query)) return false;
      }
      if (filterEmail.trim()) {
        const query = filterEmail.toLowerCase();
        if (!(p.Email || '').toLowerCase().includes(query)) return false;
      }
      if (filterEntryDateFrom) {
        const entryDate = new Date(p.HireDate);
        const fromDate = new Date(filterEntryDateFrom);
        if (entryDate < fromDate) return false;
      }
      if (filterEntryDateTo) {
        const entryDate = new Date(p.HireDate);
        const toDate = new Date(filterEntryDateTo);
        if (entryDate > toDate) return false;
      }
      if (filterDepartment.trim()) {
        const query = filterDepartment.toLowerCase();
        if (!(p.Department || '').toLowerCase().includes(query)) return false;
      }
      if (filterJobTitle.trim()) {
        const query = filterJobTitle.toLowerCase();
        if (!(p.JobTitle || '').toLowerCase().includes(query)) return false;
      }
      return true;
    });
  }, [Users, filterBusinessId, filterName, filterEmail, filterEntryDateFrom, filterEntryDateTo, filterDepartment, filterJobTitle]);

  const canSave = useMemo(() => {
    const allFilled = [form.firstName, form.lastName, form.email, form.department, form.hireDate]
      .every((v) => v && v.trim().length > 0);
    const emailOk = isValidEmailBasic(form.email ?? '');
    const dateOk = isValidDateYMD(form.hireDate ?? '');
    return allFilled && emailOk && dateOk && (mode === 'add' ? !!form.password?.trim() : true);
  }, [form, mode]);

  function clickHeader(parameter) {
    let sortingOrder = sorting.parameter === parameter && sorting.order === SORTING_ASCENDING ? SORTING_DESCENDING : sorting.order === SORTING_DESCENDING ? '' : SORTING_ASCENDING;
    setSorting({ "parameter": parameter, "order": sortingOrder });
    var sorted = [];
    sorted = Users;
    if (sortingOrder === "") {
      sorted = [...Users].sort((a, b) => {
        if (a["HireDate"] < b["HireDate"]) return -1;
        if (a["HireDate"] > b["HireDate"]) return 1;
        return 0;
      });
    } else if (sortingOrder === SORTING_DESCENDING) {
      sorted = [...Users].sort((a, b) => {
        if (a[parameter] > b[parameter]) return -1;
        if (a[parameter] < b[parameter]) return 1;
        return 0;
      });
    } else if (sortingOrder === SORTING_ASCENDING) {
      sorted = [...Users].sort((a, b) => {
        if (a[parameter] < b[parameter]) return -1;
        if (a[parameter] > b[parameter]) return 1;
        return 0;
      });
    }

    console.log(sorting);
    setUsers(sorted);
  }
  
  const ROWS_PER_PAGE = 10;
  const [page, setPage] = useState(1);

  const pageCount = Math.max(1, Math.ceil(filteredEmployees.length / ROWS_PER_PAGE));
  const startIndex = (page - 1) * ROWS_PER_PAGE;
  const visibleUsers = useMemo(
    () => filteredEmployees.slice(startIndex, startIndex + ROWS_PER_PAGE),
    [filteredEmployees, startIndex]
  );

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
    console.log(form);
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

  const setField = (field) => (value) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  useEffect(() => {
    async function fetchData() {
      try {
        var employees = await EmployeeService.getAllEmployees();
        console.log(employees);
        employees.forEach(element => {
          element.FirstName = CapitalizeFirstLetter(element.FirstName);
        });
        setUsers(employees);
      } catch (error) {
        UserSession.verifyAuthorize(navigate, error.status);
        notifs({ severity: 'error', message: ErrorHandler(error) ?? 'Error fetching employees.' });
      }
    }
    if (Users.length === 0) fetchData();
  }, [Users.length, navigate, notifs]);


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
        <Card sx={{ mb: 2, bgcolor: '#f7f7f7ff', border: '2px solid #fff7cbff' }}>
          <CardHeader
            title="Filters"
            action={
              <IconButton onClick={() => setFilterExpanded(!filterExpanded)} sx={{ p: 0 }}>
                {filterExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </IconButton>
            }
            sx={{ pb: 0 }}
          />
          <Collapse in={filterExpanded}>
            <CardContent>
              <Stack direction="column" spacing={2}>
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                  <TextField
                    label="Business ID"
                    type='number'
                    value={filterBusinessId}
                    onChange={(e) => {
                      setFilterBusinessId(e.target.value);
                      setPage(1);
                    }}
                    size="small"
                    sx={{ flex: 1 }}
                  />
                  <TextField
                    label="Name"
                    value={filterName}
                    onChange={(e) => {
                      setFilterName(e.target.value);
                      setPage(1);
                    }}
                    size="small"
                    sx={{ flex: 1 }}
                  />
                </Stack>
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                  <TextField
                    label="Email"
                    value={filterEmail}
                    onChange={(e) => {
                      setFilterEmail(e.target.value);
                      setPage(1);
                    }}
                    size="small"
                    sx={{ flex: 1 }}
                  />
                  <TextField
                    label="Date From"
                    type="date"
                    value={filterEntryDateFrom}
                    onChange={(e) => {
                      setFilterEntryDateFrom(e.target.value);
                      setPage(1);
                    }}
                    size="small"
                    sx={{ flex: 1 }}
                    InputLabelProps={{ shrink: true }}
                  />
                  <TextField
                    label="Date To"
                    type="date"
                    value={filterEntryDateTo}
                    onChange={(e) => {
                      setFilterEntryDateTo(e.target.value);
                      setPage(1);
                    }}
                    size="small"
                    sx={{ flex: 1 }}
                    InputLabelProps={{ shrink: true }}
                  />
                </Stack>
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} justifyContent={"space-evenly"} >
                  <DepartmentSelectField
                    onChange={(e) => {
                      setFilterDepartment(e.target.value);
                      setPage(1);
                    }}
                    inputvalue={filterDepartment}
                    width="100%"
                    error={null}
                  />
                  <TextField
                    label="Job Title"
                    value={filterJobTitle}
                    onChange={(e) => {
                      setFilterJobTitle(e.target.value);
                      setPage(1);
                    }}
                    size="small"
                    sx={{ flex: 1 }}
                  />
                  <Button variant="outlined" onClick={handleClearFilterss} sx={{ textTransform: 'none', fontWeight: 600 }}>
                    Clear Filters
                  </Button>
                </Stack>
              </Stack>
            </CardContent>
          </Collapse>
        </Card>

        <SectionPaper>
          <DataTable columns={columns} rows={visibleUsers} getRowId={(r) => r.BusinessEntityID} />
          <Paginator count={pageCount} page={page} onChange={(_, p) => setPage(p)} />
        </SectionPaper>
      </Container>

      <FormPopup
        open={dialogOpen}
        title={mode === 'add' ? 'Add User' : 'Edit User'}
        fields={[
          { type: 'text',     label: 'First Name', value: form.firstName,  onChange: setField('firstName'),  required: true, error: !!errors.firstName,  helperText: errors.firstName },
          { type: 'text',     label: 'Middle Name', value: form.middleName, onChange: setField('middleName') },
          { type: 'text',     label: 'Last Name',  value: form.lastName,   onChange: setField('lastName'),   required: true, error: !!errors.lastName,   helperText: errors.lastName },
          { type: 'email',    label: 'Email',      value: form.email,      onChange: setField('email'),      required: true, error: !!errors.email,      helperText: errors.email },
          { type: 'text',     label: 'Department', value: form.department, onChange: setField('department'), required: true, error: !!errors.department, helperText: errors.department },
          { type: 'text',     label: 'Job Title',  value: form.jobTitle,   onChange: setField('jobTitle'),   required: true, error: !!errors.jobTitle,   helperText: errors.jobTitle },
          { type: 'text',     label: 'Hire Date',  value: form.hireDate,   onChange: setField('hireDate'),   required: true, error: !!errors.hireDate,   helperText: errors.hireDate },
          ...(mode === 'add'
            ? [{ type: 'password', label: 'Password', value: form.password, onChange: setField('password'), required: true, error: !!errors.password, helperText: errors.password }]
            : [])
        ]}
        onCancel={handleClose}
        onSubmit={handleSave}
        submitLabel="Save"
        submitDisabled={!canSave}
        submitSx={{ bgcolor: '#000', color: '#fff', '&:hover': { bgcolor: '#222' } }}
      />

      <ConfirmPopup
        open={confirmOpen}
        title="Remove record"
        content="Do you really want to delete this employee? This action is irreversible."
        onCancel={() => { setConfirmOpen(false); setConfirmId(null); }}
        onConfirm={async () => { if (!confirmId) return; await handleDelete(confirmId); setConfirmOpen(false); setConfirmId(null); }}
        confirmLabel="Delete"
        confirmButtonSx={{ bgcolor: '#000', color: '#fff', '&:hover': { bgcolor: '#222' } }}
      />
    </Box>
  );
}
