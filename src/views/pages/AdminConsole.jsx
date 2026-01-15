import React, { useEffect, useMemo, useState } from 'react';
import { Box, Container, Select, MenuItem, Typography, Stack, Card, CardHeader, IconButton, Collapse, CardContent, Divider, Paper, Table, TableHead, TableRow, TableCell, TableBody, Tabs, Tab, TextField, Button 
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

const LOGS_TAB = 0;
const USER_CHANGE_TAB = 1;

export default function AdminConsole() {
    const navigate = useNavigate();
    const notif = useNotification();
    const [tab, setTab] = useState(0);
    const [users, setUsers] = useState([]);
    const [logs, setLogs] = useState([]);

    // --- Colunas ---
    const logsColumns = [{ label: 'ID', field: 'LogID',  }, 
                        { label: 'Actor ID', field: 'ActorID' }, 
                        { label: 'Target', field: 'Target' }, 
                        { label: 'Action', field: 'Action' }, 
                        {label:'Description', field: 'Description'}, 
                        { label: 'Created At', field: 'CreatedAt', render: (r) => FormatDateTime(r.CreatedAt)}];
    const usersColumns = [{ label: 'User ID', field: 'UserID' }, 
                          { label: 'Username', field: 'Username' }, 
                          { label: 'Employee ID', field: 'EmployeeId' }, 
                          { label: 'Is Active', field: 'IsActive', render: (r) => r.IsActive ? 'Yes' : 'No' }, 
                          { label: 'Role', field: 'Role' },
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
                if (!(p.BusinessEntityID.toString() || '').toLowerCase().includes(query)) return false;
            }
            if (filterUserName.trim()) {
                const query = filterUserName.toLowerCase();
                if (!(p.Username || '').toLowerCase().includes(query)) return false;
            }
            if (filterEmployeeId.trim()) {
                const query = filterEmployeeId.toLowerCase();
                if (!(p.EmployeeId || '').toLowerCase().includes(query)) return false;
            }
            if (filterActiveStatus.trim()) {
                const query = filterActiveStatus.toLowerCase();
                console.log(p.IsActive, query);
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

    const SORTING_ASCENDING = 'asc';
    const SORTING_DESCENDING = 'desc';
    const [sorting, setSorting] = useState({ parameter: '', order: '' });

    function clickHeader(parameter) {
        console.log("clickHeader", parameter);
        let sortingOrder = sorting.parameter === parameter && sorting.order === SORTING_ASCENDING ? SORTING_DESCENDING : sorting.order === SORTING_DESCENDING ? '' : SORTING_ASCENDING;
        setSorting({ "parameter": parameter, "order": sortingOrder });
        var sorted = [];

        if (tab === LOGS_TAB) {
            sorted = logs;
            if (sortingOrder === "") {
                sorted = [...logs].sort((a, b) => {
                    if (a["CreatedAt"] < b["CreatedAt"]) return -1;
                    if (a["CreatedAt"] > b["CreatedAt"]) return 1;
                    return 0;
                });
            } else if (sortingOrder === SORTING_DESCENDING) {
                sorted = [...logs].sort((a, b) => {
                    if (a[parameter] > b[parameter]) return -1;
                    if (a[parameter] < b[parameter]) return 1;
                    return 0;
                });
            } else if (sortingOrder === SORTING_ASCENDING) {
                sorted = [...logs].sort((a, b) => {
                    if (a[parameter] < b[parameter]) return -1;
                    if (a[parameter] > b[parameter]) return 1;
                    return 0;
                });
            }
            setLogs(sorted);
        }
        else if (tab === USER_CHANGE_TAB) {
            sorted = users;
            if (sortingOrder === "") {
                sorted = [...users].sort((a, b) => {
                    if (a["HireDate"] < b["HireDate"]) return -1;
                    if (a["HireDate"] > b["HireDate"]) return 1;
                    return 0;
                });
            } else if (sortingOrder === SORTING_DESCENDING) {
                sorted = [...users].sort((a, b) => {
                    if (a[parameter] > b[parameter]) return -1;
                    if (a[parameter] < b[parameter]) return 1;
                    return 0;
                });
            } else if (sortingOrder === SORTING_ASCENDING) {
                sorted = [...users].sort((a, b) => {
                    if (a[parameter] < b[parameter]) return -1;
                    if (a[parameter] > b[parameter]) return 1;
                    return 0;
                });
            }
            setUsers(sorted);
        }
    }

    // --- Paginação ---
    const [logsPage, setLogsPage] = useState(1);
    const [usersPage, setUsersPage] = useState(1);
    const ROWS_PER_PAGE = 9;

  const logsStart = (logsPage - 1) * ROWS_PER_PAGE;
  const usersStart = (usersPage - 1) * ROWS_PER_PAGE;

    const logsCount = Math.max(1, Math.ceil(filteredLogs.length / ROWS_PER_PAGE));
    const usersCount = Math.max(1, Math.ceil(filteredUsers.length / ROWS_PER_PAGE));


    const visibleLogs = useMemo(
        () => filteredLogs.slice(logsStart, logsStart + ROWS_PER_PAGE),
        [filteredLogs, logsStart]
    );

    const visibleUsers = useMemo(
        () => filteredUsers.slice(usersStart, usersStart + ROWS_PER_PAGE),
        [filteredUsers, usersStart]
    );

    // Popup de mudança de Role com FormPopup
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
      setLogsPage(1);
      setUsersPage(1);
    }
    fetchData();
  }, [navigate]);

  const handleTabChange = (_e, v) => setTab(v);

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
      setUsers(await AdminService.getUsers());
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

  const usersWithIdx = visibleUsers.map((r, idx) => ({ ...r, __pageIndex: idx }));

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
      setLogsPage(1);
      setUsersPage(1);
    }
    fetchData();
  }, [navigate]);

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

        <SectionPaper noOverflow>
          {tab === LOGS_TAB ? (
            <>
              <DataTable
                columns={logsColumns}
                rows={visibleLogs}
                getRowId={(r, idx) => `log-${idx}-${r.LogID}`}
              />
              <Paginator
                count={logsCount}
                page={logsPage}
                onChange={(_, p) => setLogsPage(p)}
              />
            </>
          ) : (
            <>
              <DataTable
                columns={usersColumns}
                rows={usersWithIdx}
                getRowId={(r, idx) => `user-${idx}-${r.UserID}`}
              />
              <Paginator
                count={usersCount}
                page={usersPage}
                onChange={(_, p) => setUsersPage(p)}
              />
            </>
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