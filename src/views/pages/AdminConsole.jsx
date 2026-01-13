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
    const logsColumns = ['ID', 'Actor ID', 'Target', 'Action', 'Description', 'Created At'];
    const usersColumns = ['User ID', 'Username', 'Employee ID', 'Is Active', 'Role'];
    const columns = tab === LOGS_TAB ? logsColumns : usersColumns;

    // --- Paginação ---
    const [logsPage, setLogsPage] = useState(1);
    const [usersPage, setUsersPage] = useState(1);
    const ROWS_PER_PAGE = 9;

    const logsStart = (logsPage - 1) * ROWS_PER_PAGE;
    const usersStart = (usersPage - 1) * ROWS_PER_PAGE;

    const logsCount = Math.max(1, Math.ceil(logs.length / ROWS_PER_PAGE));
    const usersCount = Math.max(1, Math.ceil(users.length / ROWS_PER_PAGE));


    const visibleLogs = useMemo(
        () => logs.slice(logsStart, logsStart + ROWS_PER_PAGE),
        [logs, logsStart]
    );

    const visibleUsers = useMemo(
        () => users.slice(usersStart, usersStart + ROWS_PER_PAGE),
        [users, usersStart]
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
        setTab(v);
    };

    const onChangeRole = async (index, newRole) => {
        try {
            const updatedUser = { ...users[index], Role: newRole };
            await AdminService.updateUserRole(updatedUser);
            notif({severity: 'success', message: 'User role updated successfully.'});
            setUsers(await AdminService.getUsers());
        }   catch (error) {
            console.error('Error updating user role:', error);
            UserSession.verifyAuthorize(navigate, error?.status);
            notif({severity: 'error', message: 'Failed to update user role.'});
        }
    };

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#fff' }}>
            <HeaderBar />

            <Container maxWidth="lg" sx={{ pt: 3, pb: 5 }}>
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
                                        key={c}
                                        sx={{
                                            borderRight: i < columns.length - 1 ? '1px solid rgba(0,0,0,0.2)' : 'none',
                                            color: '#333',
                                        }}
                                    >
                                        {c}
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
                                            <TableCell>{l.Description}</TableCell>
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
