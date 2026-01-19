import React, { useEffect, useRef, useState } from 'react';
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
import EmployeeViewModel from '../../models/viewModels/EmployeeViewModel.js';
import { CapitalizeFirstLetter, FormatDate } from '../../utils/FormatingUtils';
import DataTable from '../components/table/DataTable';
import Paginator from '../components/table/Paginator';
import SectionPaper from '../components/ui/surfaces/SectionPaper';
import FormPopup from '../components/ui/popups/FormPopup';
import ConfirmPopup from '../components/ui/popups/ConfirmPopup';
import { EditRowButton } from '../components/ui/buttons/EditRowButton';
import { DeleteRowButton } from '../components/ui/buttons/DeleteRowButton';

const SORTING_ASCENDING = 'asc';
const SORTING_DESCENDING = 'desc';

export default function EmployeesList() {
  const navigate = useNavigate();
  const notifs = useNotification();
  const [Users, setUsers] = useState([]);

  const [page, setPage] = useState(1);
  const [pageCount, setPageCount] = useState(1);
  const ROWS_PER_PAGE = 10;

  const nextBusinessIdRef = useRef(Math.max(0, ...Users.map((r) => r.BusinessEntityID)) + 1);

  const actionColum = {
      label: 'Actions', field: 'actions', sortable: false, render: (r, idx) =>
      (<Stack direction="row" spacing={1}>
        <EditRowButton openEdit={handleOpenEdit} idx={idx} />
        <DeleteRowButton openConfirm={setConfirmOpen} setConfirmIndex={setConfirmId} idx={idx} />
      </Stack>)
  };

  const columns = [{label: 'Business ID', field: 'BusinessEntityID', sortable: true}, 
                  {label: 'Name', field: 'FirstName', render: (r) => `${r.FirstName} ${r.MiddleName ? r.MiddleName + ' ' : ''}${r.LastName}`, sortable: true}, 
                  {label: 'Email', field: 'Email', sortable: true}, 
                  {label: 'Department', field: 'Department', sortable: true}, 
                  {label: 'Job Title', field: 'JobTitle', sortable: true}, 
                  {label: 'Hire Date', field: 'HireDate', render: (r) => FormatDate(r.HireDate), sortable: true},
                  actionColum];
  
  const [sort, setSort] = useState({ SortBy: 'BusinessEntityID', Direction: SORTING_ASCENDING });

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
      password: mode === 'edit' ? '' : (curr.password !== '' && curr.password?.trim() ? '' : 'Mandatory.'),
    };
    console.log('Validation', { curr, newErrors });
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
  const handleClearFilters = () => {
    setFilterBusinessId('');
    setFilterName('');
    setFilterEmail('');
    setFilterEntryDateFrom('');
    setFilterEntryDateTo('');
    setFilterDepartment('');
    setFilterJobTitle('');
  };

  const handleOpenAdd = () => {
    setMode('add');
    setForm({ businessId: nextBusinessIdRef.current, firstName: '', middleName: '', lastName: '', email: '', department: '', jobTitle: '', hireDate: '', password: '' });
    setErrors({ firstName: '', middleName: '', lastName: '', email: '', department: '', jobTitle: '', hireDate: '', password: '' });
    setDialogOpen(true);
  };

  const handleOpenEdit = (idx) => {
    setMode('edit');
    const emp = Users[idx];
    console.log('Editing employee', emp);
    setForm({
      businessId: emp.BusinessEntityID,
      firstName: emp.FirstName,
      middleName: emp.MiddleName,
      lastName: emp.LastName,
      email: emp.Email,
      department: emp.Department,
      jobTitle: emp.JobTitle,
      hireDate: emp.HireDate,
    });
    setErrors({ firstName: '', middleName: '', lastName: '', email: '', department: '', jobTitle: '', hireDate: '', password: '' });
    setDialogOpen(true);
  };

  const handleClose = () => setDialogOpen(false);

  const handleSave = async () => {
    console.log('Saving form', form);
    const ok = validateForm(form);
    console.log(ok);
    if (!ok) return;
    try {
      if (mode === 'add') {
        await EmployeeService.createEmployee({
          firstName: form.firstName, middleName: form.middleName, lastName: form.lastName,
          email: form.email, department: form.department, jobTitle: form.jobTitle, hireDate: form.hireDate, password: form.password,
        });
        setUsers((await EmployeeService.getAllEmployees(page, ROWS_PER_PAGE)).items);
        notifs({ severity: 'success', message: 'Employee created successfully!' });
      } else {
        await EmployeeService.updateEmployee(form.businessId, {BusinessEntityID: form.businessId,
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
        var data = await EmployeeService.getAllEmployees(page, ROWS_PER_PAGE,
          [
            { Fields: ['BusinessEntityID'], Values: [filterBusinessId] },
            { Fields: ['FirstName', 'MiddleName', 'LastName'], Values: [filterName] },
            { Fields: ['Email'], Values: [filterEmail] },
            { Fields: ['HireDateFrom'], Values: [filterEntryDateFrom] },
            { Fields: ['HireDateTo'], Values: [filterEntryDateTo] },
            { Fields: ['Department'], Values: [filterDepartment] },
            { Fields: ['JobTitle'], Values: [filterJobTitle] },
          ],
          { SortBy: sort.SortBy, Direction: sort.Direction }
        );
        
        setPageCount(Math.ceil(data.totalCount / ROWS_PER_PAGE));

        const employees = data.items.map(
          (empData) =>
            new EmployeeViewModel({
              BusinessEntityID: empData.businessEntityID,
              FirstName: empData.firstName,
              MiddleName: empData.middleName,
              LastName: empData.lastName,
              JobTitle: empData.jobTitle,
              Department: empData.department,
              Email: empData.email,
              HireDate: empData.hireDate,
              Role: empData.role
            }
          )
        );
        console.log('Fetched employees:', employees);
        employees.forEach(element => {
          element.FirstName = CapitalizeFirstLetter(element.FirstName);
          element.MiddleName = CapitalizeFirstLetter(element.MiddleName);
          element.LastName = CapitalizeFirstLetter(element.LastName);
        });
        setUsers(employees);
      } catch (error) {
        UserSession.verifyAuthorize(navigate, error.status);
        notifs({ severity: 'error', message: ErrorHandler(error) ?? 'Error fetching employees.' });
      }
    }
    fetchData();
  }, [Users.length, filterBusinessId, filterDepartment, filterEmail, filterEntryDateFrom, filterEntryDateTo, filterJobTitle, filterName, navigate, notifs, page, sort, sort.Direction, sort.SortBy]);


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
                    }}
                    size="small"
                    sx={{ flex: 1 }}
                  />
                  <TextField
                    label="Name"
                    value={filterName}
                    onChange={(e) => {
                      setFilterName(e.target.value);
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
                    }}
                    size="small"
                    sx={{ flex: 1 }}
                    InputLabelProps={{ shrink: true }}
                  />
                </Stack>
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} justifyContent={"space-evenly"} >
                  <DepartmentSelectField
                    onChange={(v) => {
                      setFilterDepartment(v);
                    }}
                    error={null}
                    sx={{ flex: 1 }}
                  />
                  <TextField
                    label="Job Title"
                    value={filterJobTitle}
                    onChange={(e) => {
                      setFilterJobTitle(e.target.value);
                    }}
                    size="small"
                    sx={{ flex: 1 }}
                  />
                  <Button variant="outlined" onClick={handleClearFilters} sx={{ textTransform: 'none', fontWeight: 600 }}>
                    Clear Filters
                  </Button>
                </Stack>
              </Stack>
            </CardContent>
          </Collapse>
        </Card>

        <SectionPaper>
          <DataTable 
            columns={columns} 
            rows={Users} 
            getRowId={(r) => r.BusinessEntityID} 
            pageSize={ROWS_PER_PAGE}
            pageCount={pageCount}
            onPageChange={(e, value) => setPage(value)}
            onSortChange={(sort) => {setSort({ SortBy: sort.SortBy, Direction: sort.Direction }); console.log('Sort changed', sort);}}
          />
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
          { type: 'custom', render: () => <DepartmentSelectField label="Department" value={form.DepartmentName} onChange={setField('department')} error={errors.DepartmentName} fullWidth={true} /> },
          { type: 'text',     label: 'Job Title',  value: form.jobTitle,   onChange: setField('jobTitle'),   required: true, error: !!errors.jobTitle,   helperText: errors.jobTitle },
          { type: 'date',     label: 'Hire Date',  value: form.hireDate,   onChange: setField('hireDate'),   required: true, error: !!errors.hireDate,   helperText: errors.hireDate },
          ...(mode === 'add'
            ? [{ type: 'password', label: 'Password', value: form.password, onChange: setField('password'), required: true, error: !!errors.password, helperText: errors.password }]
            : [])
        ]}
        onCancel={handleClose}
        onSubmit={handleSave}
        submitLabel="Save"
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
