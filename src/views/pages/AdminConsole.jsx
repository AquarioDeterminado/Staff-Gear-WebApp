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
import AdminService from '../../services/AdminService';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import AddIcon from '@mui/icons-material/AddCircleOutline';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ErrorHandler from '../../utils/ErrorHandler';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import HeaderBar from '../components/HeaderBar';
import { useNavigate } from 'react-router-dom';
import UserSession from '../../utils/UserSession';
import HRService from '../../services/HRService';
import Pagination from '@mui/material/Pagination';
import useNotification from '../../utils/UseNotification';
import Popups from '../components/Popups';

const LOGS_TAB = 0;
const USER_CHANGE_TAB = 1;

export default function AdminConsole() {
    const navigate = useNavigate();
    const notif = useNotification();

    const [tab, setTab] = useState(0);

    const [users, setUsers] = useState([]);
    const [logs, setLogs] = useState([]);

    // --- Colunas ---
    const logsColumns = [{ label: 'ID', parameter: 'LogID' }, { label: 'Actor ID', parameter: 'ActorID' }, { label: 'Target', parameter: 'Target' }, { label: 'Action', parameter: 'Action' }, { label: 'Created At', parameter: 'CreatedAt' }];
    const usersColumns = [{ label: 'User ID', parameter: 'UserID' }, { label: 'Username', parameter: 'Username' }, { label: 'Employee ID', parameter: 'EmployeeId' }, { label: 'Is Active', parameter: 'IsActive' }, { label: 'Role', parameter: 'Role' }];
    const columns = tab === LOGS_TAB ? logsColumns : usersColumns;


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

    useEffect(() => {
        async function fetchData() {
            try {
                const usersData = await AdminService.getUsers();
                setUsers(Array.isArray(usersData) ? usersData : []);
            } catch (error) {
                console.error('Error fetching users:', error);
                UserSession.verifyAuthorize(navigate, error?.status);
            }

            try {
                const logsData = await AdminService.getLogs();
                setLogs(Array.isArray(logsData) ? logsData : []);
            } catch (error) {
                console.error('Error fetching logs:', error);
                UserSession.verifyAuthorize(navigate, error?.status);
            }

            setLogsPage(1);
            setUsersPage(1);
        }
        fetchData();
    }, [navigate]);

    const handleTabChange = (_e, v) => {
        console.log("handleTabChange", v);
        setTab(v);
    };

    const onChangeRole = async (index, newRole) => {
        try {
            const updatedUser = { ...users[index], Role: newRole };
            await AdminService.updateUserRole(updatedUser);
            notif({ severity: 'success', message: 'User role updated successfully.' });
            setUsers(await AdminService.getUsers());
        } catch (error) {
            console.error('Error updating user role:', error);
            UserSession.verifyAuthorize(navigate, error?.status);
            notif({ severity: 'error', message: 'Failed to update user role.' });
        }
    };



    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#fff' }}>
            <HeaderBar />
            <Container maxWidth="lg" sx={{ pt: 3, pb: 5 }}>
                <Container maxWidth="lg" sx={{ pt: 3, pb: 5 }} />
                <Stack direction="row" alignItems="center" sx={{ mb: 2 }}>
                    <Typography variant="h4" sx={{ fontWeight: 800, color: '#000' }}>
                        Employees
                    </Typography>
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
                                {tab === LOGS_TAB ? (
                                    <>
                                        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                                            <TextField
                                                label="Actor ID"
                                                type='number'
                                                value={filterActorId}
                                                onChange={(e) => {
                                                    setFilterActorId(e.target.value);
                                                    setLogsPage(1);
                                                }}
                                                size="small"
                                                sx={{ flex: 1 }}
                                            />
                                            <TextField
                                                label="Target"
                                                value={filterTarget}
                                                onChange={(e) => {
                                                    setFilterTarget(e.target.value);
                                                    setLogsPage(1);
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
                                                    setLogsPage(1);
                                                }}
                                                size="small"
                                                sx={{ flex: 1 }}
                                            >
                                                <MenuItem disabled value="default">-- Select Action --</MenuItem>
                                                {["Create", "Update", "Delete", "Login", "Read"].map((d) => (
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
                                                    setLogsPage(1);
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
                                                    setLogsPage(1);
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
                                                    setUsersPage(1);
                                                }}
                                                size="small"
                                                sx={{ flex: 1 }}
                                            />
                                            <TextField
                                                label="User Name"
                                                value={filterUserName}
                                                onChange={(e) => {
                                                    setFilterUserName(e.target.value);
                                                    setUsersPage(1);
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
                                                    setUsersPage(1);
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
                                                    setUsersPage(1);
                                                }}
                                                size="small"
                                                sx={{ flex: 1 }}
                                            >
                                                <MenuItem value="default">-- Select Status --</MenuItem>
                                                <MenuItem value="1">Active</MenuItem>
                                                <MenuItem value="0">Inactive</MenuItem>
                                            </Select>
                                            <Select
                                                label="Role"
                                                value={filterRole === null || filterRole === '' ? "default" : filterRole}
                                                onChange={(e) => {
                                                    setFilterRole(e.target.value);
                                                    setUsersPage(1);
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
                {/* Tabs */}
                <Box sx={{ mb: 2 }}>
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
                        <Tab label="Logs" disableRipple />
                        <Tab label="Users" disableRipple />
                    </Tabs>
                </Box>

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

                    <Table size="small" sx={{ minWidth: 720, tableLayout: 'auto' }}>
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
                                        {c.label}
                                        {sorting.parameter === c.parameter ? (
                                            sorting.order === SORTING_ASCENDING ? (
                                                <ArrowUpwardIcon sx={{ fontSize: 16, ml: 0.5, verticalAlign: 'middle' }} />
                                            ) : sorting.order === SORTING_DESCENDING ? (
                                                <ArrowDownwardIcon sx={{ fontSize: 16, ml: 0.5, verticalAlign: 'middle' }} />
                                            ) : null
                                        ) : null}
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {tab === LOGS_TAB ? (
                                logs.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={columns.length + 1} align="center" sx={{ py: 3 }}>
                                            No logs found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    visibleLogs.map((l, idx) => (
                                        <TableRow key={`log-${idx}`}>
                                            <TableCell>{l.LogID}</TableCell>
                                            <TableCell>{l.ActorID}</TableCell>
                                            <TableCell>{l.Target}</TableCell>
                                            <TableCell>{l.Action}</TableCell>
                                            <TableCell>{new Date(l.CreatedAt).toLocaleString('fr-FR')}</TableCell>
                                            <TableCell>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )
                            ) : users.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={columns.length + 1} align="center" sx={{ py: 3 }}>
                                        No users found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                visibleUsers.map((u, idx) => (
                                    <TableRow key={`log-${idx}`}>
                                        <TableCell>{u.UserID}</TableCell>
                                        <TableCell>{u.Username}</TableCell>
                                        <TableCell>{u.EmployeeId}</TableCell>
                                        <TableCell>{u.IsActive ? 'Active' : 'Inactive'}</TableCell>
                                        <TableCell>
                                            <Select
                                                value={u.Role || ''}
                                                onChange={(e) => onChangeRole(usersStart + idx, e.target.value)}
                                                size="small"
                                                displayEmpty
                                                sx={{ width: '100%' }}
                                            >
                                                <MenuItem value="">-- Select Role --</MenuItem>
                                                {["Employee", "HR", "Admin"].map((d) => (
                                                    <MenuItem key={d} value={d}>
                                                        {d}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </TableCell>
                                        <TableCell>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>

                    <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
                        {tab === LOGS_TAB ? (
                            <Pagination
                                count={logsCount}
                                page={logsPage}
                                onChange={(_, p) => setLogsPage(p)}
                                sx={{
                                    '& .MuiPaginationItem-root.Mui-selected': {
                                        bgcolor: '#ff9800',
                                        color: '#fff',
                                    },
                                }}
                            />
                        ) : (
                            <Pagination
                                count={usersCount}
                                page={usersPage}
                                onChange={(_, p) => setUsersPage(p)}
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
        </Box>
    );
}