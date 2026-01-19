import React, { useEffect, useState } from 'react';
import {
    Box, Container, Select, MenuItem, Stack, Card, CardHeader, IconButton, Collapse, CardContent, TextField, Button
} from '@mui/material';
import HeaderBar from '../components/layout/HeaderBar';
import { useNavigate } from 'react-router-dom';
import AdminService from '../../services/AdminService';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import UserSession from '../../utils/UserSession';
import useNotification from '../../utils/UseNotification';
import DataTable from '../components/table/DataTable';
import { StyledTabs, StyledTab } from '../components/ui/surfaces/StyledTabs';
import SectionPaper from '../components/ui/surfaces/SectionPaper';
import FormPopup from '../components/ui/popups/FormPopup';
import { FormatDateTime } from '../../utils/FormatingUtils';
import UserDTO from '../../models/dtos/UserDTO.js';
import LogDTO from '../../models/dtos/LogDTO.js';

const LOGS_TAB = 0;
const USER_CHANGE_TAB = 1;

export default function AdminConsole() {
    const rowsPerPage = 10;
    const navigate = useNavigate();
    const notif = useNotification();
    const [tab, setTab] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [canSwitchPage, setCanSwitchPage] = useState(true);

    const [users, setUsers] = useState([]);
    const [logs, setLogs] = useState([]);

    const [usersCount, setUsersCount] = useState(0);
    const [logsCount, setLogsCount] = useState(0);

    const [sort, setSort] = useState({ SortBy: 'CreatedAt', Direction: 'desc' });

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
    {
        label: 'Action', field: 'action', render: (r) => (
            <IconButton
                size="small"
                onClick={() => handleRoleChangeRequest(r)}
                title="Edit Role"
            >
                <EditOutlinedIcon />
            </IconButton>
        )
    }];


    const [filterExpanded, setFilterExpanded] = useState(true);

    const [filterUserId, setFilterUserId] = useState('');
    const [filterActorId, setFilterActorId] = useState('');
    const [filterTarget, setFilterTarget] = useState('');
    const [filterAction, setFilterAction] = useState('');
    const [filterCreateDateFrom, setFilterCreateDateFrom] = useState('');
    const [filterCreateDateTo, setFilterCreateDateTo] = useState('');


    const [filterUserName, setFilterUserName] = useState('');
    const [filterEmployeeId, setFilterEmployeeId] = useState('');
    const [filterActiveStatus, setFilterActiveStatus] = useState('');
    const [filterRole, setFilterRole] = useState('');

    const handleClearFilters = () => {
        setFilterUserId('');
        setFilterActorId('');
        setFilterTarget('');
        setFilterAction('');
        setFilterCreateDateFrom('');
        setFilterCreateDateTo('');

        setFilterUserName('');
        setFilterEmployeeId('');
        setFilterActiveStatus('');
        setFilterRole('');
    };

    const [formOpen, setFormOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [newRole, setNewRole] = useState('');
    const [roleChangeReason, setRoleChangeReason] = useState('');
    const [formErrors, setFormErrors] = useState({});
    const [loading, setLoading] = useState(false);

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
            setCanSwitchPage(false);
            await AdminService.updateUserRole(selectedUser.UserID, newRole, roleChangeReason);
            notif({ severity: 'success', message: 'User role updated successfully.' });
            setUsers(await AdminService.getUsers(currentPage, rowsPerPage));
            setFormOpen(false);
            setSelectedUser(null);
            setNewRole('');
            setRoleChangeReason('');
            setFormErrors({});
            setCanSwitchPage(true);
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
        const fetchUsers = async () => {
            try {
                setCanSwitchPage(false);
                const data = await AdminService.getUsers(currentPage,
                    rowsPerPage,
                    [
                        { Field: ['UserID'], Value: [filterUserId] },
                        { Field: ['Username'], Value: [filterUserName] },
                        { Field: ['EmployeeId'], Value: [filterEmployeeId] },
                        { Field: ['IsActive'], Value: [filterActiveStatus] },
                        { Field: ['Role'], Value: [filterRole] },
                    ],
                    { SortBy: sort.SortBy, Direction: sort.Direction }
                );

                setUsersCount(Math.ceil(data.totalCount / rowsPerPage));

                const usersData = data.items.map(user => (new UserDTO({ UserID: user.userID, Username: user.username, EmployeeId: user.employeeId, IsActive: user.isActive, Role: user.role })));

                setUsers(usersData);
                setCanSwitchPage(true);
            } catch (error) {
                console.error('Error fetching users:', error);
                UserSession.verifyAuthorize(navigate, error?.status);
            }
        }
        fetchUsers();
    }, [navigate, currentPage, rowsPerPage, filterUserName, filterEmployeeId, filterActiveStatus, filterRole, sort.SortBy, sort.Direction, filterUserId]);

    useEffect(() => {
        async function fetchLogs() {
            try {
                setCanSwitchPage(false);
                console.log("Fetching logs for page:", currentPage);
                const data = await AdminService.getLogs(currentPage, rowsPerPage,
                    [
                        { Fields: ['ActorID'], Values: [filterActorId] },
                        { Fields: ['Target'], Values: [filterTarget] },
                        { Fields: ['Action'], Values: [filterAction] },
                        { Fields: ['CreatedAtFrom', 'CreatedAtTo'], Values: [filterCreateDateFrom.toString(), filterCreateDateTo.toString()] },
                    ],
                    { SortBy: sort.SortBy, Direction: sort.Direction }
                );

                setLogsCount(Math.ceil(data.totalCount / rowsPerPage));

                const logsData = data.items.map(log => (new LogDTO({ LogID: log.logID, ActorID: log.actorID, Target: log.target, Action: log.action, Description: log.description, CreatedAt: log.createdAt })));

                setLogs(logsData);
                setCanSwitchPage(true);
            } catch (error) {
                console.error('Error fetching logs:', error);
                UserSession.verifyAuthorize(navigate, error?.status);
            }
        }
        fetchLogs();
    }, [currentPage, rowsPerPage, navigate, filterActorId, filterTarget, filterAction, filterCreateDateFrom, filterCreateDateTo, sort.SortBy, sort.Direction]);

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
                                                    setCurrentPage(1);
                                                }}
                                                size="small"
                                                sx={{ flex: 1 }}
                                            />
                                            <TextField
                                                label="Target"
                                                value={filterTarget}
                                                onChange={(e) => {
                                                    setFilterTarget(e.target.value);
                                                    setCurrentPage(1);
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
                                                    setCurrentPage(1);
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
                                                    setCurrentPage(1);
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
                                                    setCurrentPage(1);
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
                                                    setCurrentPage(1);
                                                }}
                                                size="small"
                                                sx={{ flex: 1 }}
                                            />
                                            <TextField
                                                label="User Name"
                                                value={filterUserName}
                                                onChange={(e) => {
                                                    setFilterUserName(e.target.value);
                                                    setCurrentPage(1);
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
                                                    setCurrentPage(1);
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
                                                    setCurrentPage(1);
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
                                                    setCurrentPage(1);
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
                            rows={logs}
                            setRows={setLogs}
                            getRowId={(r, idx) => `log-${idx}-${r.LogID}`}
                            pageSize={rowsPerPage}
                            page={currentPage}
                            onPageChange={(v) => setCurrentPage(v)}
                            pageCount={logsCount}
                            canSwitchPage={canSwitchPage}
                            onSortChange={(sort) => { setSort({ SortBy: sort.SortBy, Direction: sort.Direction }); }}
                        />
                    ) : (

                        <DataTable
                            columns={usersColumns}
                            rows={users}
                            setRows={setUsers}
                            getRowId={(r, idx) => `user-${idx}-${r.UserID}`}
                            pageSize={rowsPerPage}
                            page={currentPage}
                            onPageChange={(v) => setCurrentPage(v)}
                            pageCount={usersCount}
                            canSwitchPage={canSwitchPage}
                            onSortChange={(sort) => { setSort({ SortBy: sort.SortBy, Direction: sort.Direction }); }}
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