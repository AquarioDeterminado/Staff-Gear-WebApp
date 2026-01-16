import React, { useEffect, useMemo, useState } from 'react';
import {
  Box, Container, Select, MenuItem, Typography, Stack, Card, CardHeader, IconButton, Collapse, CardContent, Divider, Paper, Table, TableHead, TableRow, TableCell, TableBody, Tabs, Tab, TextField, Button
} from '@mui/material';
import HeaderBar from '../components/layout/HeaderBar';
import { useNavigate } from 'react-router-dom';
import AdminService from '../../services/AdminService';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import AddIcon from '@mui/icons-material/AddCircleOutline';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ErrorHandler from '../../utils/ErrorHandler';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import UserSession from '../../utils/UserSession';
import HRService from '../../services/HRService';
import Pagination from '@mui/material/Pagination';
import useNotification from '../../utils/UseNotification';
import DataTable from '../components/table/DataTable';
import Paginator from '../components/table/Paginator';
import { StyledTabs, StyledTab } from '../components/ui/surfaces/StyledTabs';
import SectionPaper from '../components/ui/surfaces/SectionPaper';
import ConfirmPopup from '../components/ui/popups/ConfirmPopup';
import FormPopup from '../components/ui/popups/FormPopup';
import { FormatDateTime } from '../../utils/FormatingUtils';
import UserDTO from '../../models/dtos/UserDTO.js';
import LogDTO from '../../models/dtos/LogDTO.js';

const LOGS_TAB = 0;
const USER_CHANGE_TAB = 1;

export default function AdminConsole() {
  const navigate = useNavigate();
  const notif = useNotification();
  const [tab, setTab] = useState(0);
  const [users, setUsers] = useState([]);
  const [logs, setLogs] = useState([]);

  // --- Colunas ---
  const logsColumns = [{ label: 'ID', field: 'LogID', sortable: true },
  { label: 'Actor ID', field: 'ActorID', sortable: true },
  { label: 'Target', field: 'Target', sortable: true },
  { label: 'Action', field: 'Action', sortable: true },
  { label: 'Description', field: 'Description', sortable: false },
  { label: 'Created At', field: 'CreatedAt', render: (r) => FormatDateTime(r.CreatedAt), sortable: true }];
  const usersColumns = [{ label: 'User ID', field: 'UserID', sortable: true },
  { label: 'Username', field: 'Username', sortable: true },
  { label: 'Employee ID', field: 'EmployeeId', sortable: true },
  { label: 'Is Active', field: 'IsActive', render: (r) => r.IsActive ? 'Yes' : 'No', sortable: true },
  { label: 'Role', field: 'Role', sortable: true },
  { label: 'Action', field: 'action', render: (r) => (
                            <IconButton 
                              size="small" 
                              onClick={() => handleRoleChangeRequest(r)}
                              title="Edit Role"
                            >
                              <EditOutlinedIcon />
                            </IconButton>
                          )}];


  const [filterExpanded, setFilterExpanded] = useState(true);

  const [filterUserId, setFilterUserId] = useState('');
  const [filterActorId, setFilterActorId] = useState('');
  const [filterTarget, setFilterTarget] = useState('');
  const [filterAction, setFilterAction] = useState('');
  const [filterCreateDateFrom, setFilterCreateDateFrom] = useState('');
  const [filterCreateDateTo, setFilterCreateDateTo] = useState('');

  const filteredLogs = useMemo(() => {
    return logs.filter((p) => {
      if (filterActorId.toString().trim()) {
        const query = filterActorId.toLowerCase();
        if (!(p.ActorID || '').toString().toLowerCase().includes(query)) return false;
      }
      if (filterTarget.trim()) {
        const query = filterTarget.toLowerCase();
        if (!(p.Target || '').toLowerCase().includes(query)) return false;
      }
      if (filterAction.trim()) {
        const query = filterAction.toLowerCase();
        if (!(p.Action || '').toLowerCase().includes(query)) return false;
      }
      if (filterCreateDateFrom) {
        const entryDate = new Date(p.HireDate);
        const fromDate = new Date(filterCreateDateFrom);
        if (entryDate < fromDate) return false;
      }
      if (filterCreateDateTo) {
        const entryDate = new Date(p.HireDate);
        const toDate = new Date(filterCreateDateTo);
        if (entryDate > toDate) return false;
      }
      return true;
    });
  }, [logs, filterActorId, filterTarget, filterAction, filterCreateDateFrom, filterCreateDateTo]);

  const [filterUserName, setFilterUserName] = useState('');
  const [filterEmployeeId, setFilterEmployeeId] = useState('');
  const [filterActiveStatus, setFilterActiveStatus] = useState('');
  const [filterRole, setFilterRole] = useState('');

  const filteredUsers = useMemo(() => {
    return users.filter((p) => {
      if (filterUserId.trim()) {
        const query = filterUserId.toString().toLowerCase();
        if (!(p.UserID.toString() || '').toLowerCase().includes(query)) return false;
      }
      if (filterUserName.trim()) {
        const query = filterUserName.toLowerCase();
        if (!(p.Username || '').toLowerCase().includes(query)) return false;
      }
      if (filterEmployeeId.trim()) {
        const query = filterEmployeeId.toLowerCase();
        var employeeIdStr = (p.EmployeeId || '').toString();
        if (!(employeeIdStr || '').toLowerCase().includes(query)) return false;
      }
      if (filterActiveStatus.trim()) {
        const query = filterActiveStatus.toLowerCase();
        if (p.IsActive != query) return false;
      }
      if (filterRole.trim()) {
        const query = filterRole.toLowerCase();
        if (!(p.Role || '').toLowerCase().includes(query)) return false;
      }
      return true;
    });
  }, [filterActiveStatus, filterEmployeeId, filterRole, filterUserId, filterUserName, users]);

  const handleClearFilters = () => {
    setFilterUserId('');
    setFilterActorId('');
    setFilterTarget('');
    setFilterAction('');
    setFilterCreateDateFrom('');
    setFilterCreateDateTo('');
    setFilterRole('');

    setFilterUserName('');
    setFilterEmployeeId('');
    setFilterActiveStatus('');
  };

  const [formOpen, setFormOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newRole, setNewRole] = useState('');
  const [roleChangeReason, setRoleChangeReason] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    async function fetchData() {
      try {
        const usersData = await AdminService.getUsers();
        setUsers(Array.isArray(usersData) ? usersData : []);
      } catch (error) {
        UserSession.verifyAuthorize(navigate, error?.status);
      }
      try {
        const logsData = await AdminService.getLogs();
        setLogs(Array.isArray(logsData) ? logsData : []);
      } catch (error) {
        UserSession.verifyAuthorize(navigate, error?.status);
      }
    }
    fetchData();
  }, [navigate]);

  const handleRoleChangeRequest = (user) => {
    setSelectedUser(user);
    setNewRole(user.Role || '');
    setRoleChangeReason('');
    setFormErrors({});
    setFormOpen(true);
  };

  const handleSubmitRoleChange = async () => {
    const errors = {};
    
    if (!newRole.trim()) {
      errors.role = 'Role is required';
    }
    if (!roleChangeReason.trim()) {
      errors.reason = 'Reason for role change is required';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setLoading(true);
    try {
      await AdminService.updateUserRole(selectedUser.UserID, newRole, roleChangeReason);
      notif({ severity: 'success', message: 'User role updated successfully.' });
      setUsers(await AdminService.getUsers(usersPage, ROWS_PER_PAGE));
      setFormOpen(false);
      setSelectedUser(null);
      setNewRole('');
      setRoleChangeReason('');
      setFormErrors({});
    } catch (error) {
      UserSession.verifyAuthorize(navigate, error?.status);
      notif({ severity: 'error', message: error?.response?.data?.error || 'Failed to update user role.' });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelRoleChange = () => {
    setFormOpen(false);
    setSelectedUser(null);
    setNewRole('');
    setRoleChangeReason('');
    setFormErrors({});
  };

    useEffect(() => {
        async function fetchData() {
            try {
                const data = await AdminService.getUsers(usersPage, ROWS_PER_PAGE);

                setUsersCount(Math.ceil(data.totalCount / ROWS_PER_PAGE));

                const usersData = data.items.map(user => (new UserDTO({UserID : user.userID, Username: user.username, EmployeeId: user.employeeId, IsActive: user.isActive, Role: user.role})));

                setUsers(usersData);
            } catch (error) {
                console.error('Error fetching users:', error);
                UserSession.verifyAuthorize(navigate, error?.status);
            }

        }
        fetchData();
    }, [navigate, usersPage]);

    useEffect(() => {
        async function fetchData() {
            try {
                const data = await AdminService.getLogs(logsPage, ROWS_PER_PAGE);

                setLogsCount(Math.ceil(data.totalCount / ROWS_PER_PAGE));

                const logsData = data.items.map(log => (new LogDTO({LogID: log.logID, ActorID: log.actorID, Target: log.target, Action: log.action, Description: log.description, CreatedAt: log.createdAt})));

                setLogs(logsData);
            } catch (error) {
                console.error('Error fetching logs:', error);
                UserSession.verifyAuthorize(navigate, error?.status);
            }
        }
        fetchData();
    }, [logsPage, navigate]);

    const handleTabChange = (_e, v) => {
        console.log("handleTabChange", v);
        setTab(v);
    };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#fff' }}>
      <HeaderBar />
      <Container maxWidth="lg" sx={{ pt: 3, pb: 5 }}>
        <Box sx={{ mb: 2 }}>
          <StyledTabs value={tab} onChange={handleTabChange}>
            <StyledTab label="Logs" />
            <StyledTab label="Users" />
          </StyledTabs>
        </Box>

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
                {tab === LOGS_TAB ? (
                  <>
                    <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                      <TextField
                        label="Actor ID"
                        type='number'
                        value={filterActorId}
                        onChange={(e) => {
                          setFilterActorId(e.target.value);                        
                        }}
                        size="small"
                        sx={{ flex: 1 }}
                      />
                      <TextField
                        label="Target"
                        value={filterTarget}
                        onChange={(e) => {
                          setFilterTarget(e.target.value);
                        }}
                        size="small"
                        sx={{ flex: 1 }}
                      />
                    </Stack>
                    <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                      <Select
                        label="Action"
                        value={filterAction === null || filterAction === '' ? "default" : filterAction}
                        onChange={(e) => {
                          setFilterAction(e.target.value);
                        }}
                        size="small"
                        sx={{ flex: 1 }}
                      >
                        <MenuItem disabled value="default">-- Select Action --</MenuItem>
                        {["Create", "Update", "Delete", "Login", "Logout", "Read"].map((d) => (
                          <MenuItem key={d} value={d}>
                            {d}
                          </MenuItem>
                        ))}
                      </Select>
                      <TextField
                        label="Date From"
                        type="date"
                        value={filterCreateDateFrom}
                        onChange={(e) => {
                          setFilterCreateDateFrom(e.target.value);
                        }}
                        size="small"
                        sx={{ flex: 1 }}
                        InputLabelProps={{ shrink: true }}
                      />
                      <TextField
                        label="Date To"
                        type="date"
                        value={filterCreateDateTo}
                        onChange={(e) => {
                          setFilterCreateDateTo(e.target.value);
                        }}
                        size="small"
                        sx={{ flex: 1 }}
                        InputLabelProps={{ shrink: true }}
                      />
                      <Button variant="outlined" onClick={handleClearFilters} sx={{ textTransform: 'none', fontWeight: 600 }}>
                        Clear Filters
                      </Button>
                    </Stack>
                  </>) : (
                  <>
                    <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                      <TextField
                        label="User ID"
                        type='number'
                        value={filterUserId}
                        onChange={(e) => {
                          setFilterUserId(e.target.value);
                        }}
                        size="small"
                        sx={{ flex: 1 }}
                      />
                      <TextField
                        label="User Name"
                        value={filterUserName}
                        onChange={(e) => {
                          setFilterUserName(e.target.value);
                        }}
                        size="small"
                        sx={{ flex: 1 }}
                      />
                    </Stack>
                    <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                      <TextField
                        label="Employee ID"
                        type='number'
                        value={filterEmployeeId}
                        onChange={(e) => {
                          setFilterEmployeeId(e.target.value);
                        }}
                        size="small"
                        sx={{ flex: 1 }}
                      />
                      <Select
                        label="Active Status"
                        type='number'
                        value={filterActiveStatus === null || filterActiveStatus === '' ? "default" : filterActiveStatus}
                        onChange={(e) => {
                          setFilterActiveStatus(e.target.value);
                        }}
                        size="small"
                        sx={{ flex: 1 }}
                      >
                        <MenuItem disabled value="default">-- Select Status --</MenuItem>
                        <MenuItem value="1">Active</MenuItem>
                        <MenuItem value="0">Inactive</MenuItem>
                      </Select>
                      <Select
                        label="Role"
                        value={filterRole === null || filterRole === '' ? "default" : filterRole}
                        onChange={(e) => {
                          setFilterRole(e.target.value);
                        }}
                        size="small"
                        sx={{ flex: 1 }}
                      >
                        <MenuItem disabled value="default" >-- Select Role --</MenuItem>
                        {["Employee", "HR", "Admin"].map((d) => (
                          <MenuItem key={d} value={d}>
                            {d}
                          </MenuItem>
                        ))}
                      </Select>
                      <Button variant="outlined" onClick={handleClearFilters} sx={{ textTransform: 'none', fontWeight: 600 }}>
                        Clear Filters
                      </Button>
                    </Stack>
                  </>
                )}
              </Stack>
            </CardContent>
          </Collapse>
        </Card>

        <SectionPaper noOverflow>
          {tab === LOGS_TAB ? (
              <DataTable
                columns={logsColumns}
                rows={filteredLogs}
                setRows={setLogs}
                getRowId={(r, idx) => `log-${idx}-${r.LogID}`}
              />
          ) : (
          
              <DataTable
                columns={usersColumns}
                rows={filteredUsers}
                setRows={setUsers}
                getRowId={(r, idx) => `user-${idx}-${r.UserID}`}
              />
              
          )}
        </SectionPaper>
      </Container>

      {/* Role Change Form */}
      <FormPopup
        open={formOpen}
        title={`Change Role for ${selectedUser?.Username || ''}`}
        fields={[
          {
            label: 'New Role',
            type: 'select',
            value: newRole,
            onChange: (val) => {
              setNewRole(val);
              setFormErrors({ ...formErrors, role: '' });
            },
            options: [
              { label: 'Admin', value: 'Admin' },
              { label: 'HR', value: 'HR' },
              { label: 'Employee', value: 'Employee' }
            ],
            required: true,
            error: formErrors.role
          },
          {
            label: 'Reason for Change',
            type: 'text',
            value: roleChangeReason,
            onChange: (val) => {
              setRoleChangeReason(val);
              setFormErrors({ ...formErrors, reason: '' });
            },
            required: true,
            error: formErrors.reason
          }
        ]}
        onCancel={handleCancelRoleChange}
        onSubmit={handleSubmitRoleChange}
        submitLabel="Update Role"
        loading={loading}
        submitDisabled={!newRole || !roleChangeReason}
      />
    </Box>
  );
}