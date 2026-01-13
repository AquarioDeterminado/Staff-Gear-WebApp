import React, { useEffect, useMemo, useState } from 'react';
import { Box, Container, Select, MenuItem } from '@mui/material';
import HeaderBar from '../components/layout/HeaderBar';
import { useNavigate } from 'react-router-dom';
import AdminService from '../../services/AdminService';
import useNotification from '../../utils/UseNotification';
import UserSession from '../../utils/UserSession';
import DataTable from '../components/table/DataTable';
import Paginator from '../components/table/Paginator';
import { StyledTabs, StyledTab } from '../components/ui/StyledTabs';
import SectionPaper from '../components/ui/SectionPaper';

const LOGS_TAB = 0;
const USER_CHANGE_TAB = 1;

export default function AdminConsole() {
  const navigate = useNavigate();
  const notif = useNotification();
  const [tab, setTab] = useState(0);
  const [users, setUsers] = useState([]);
  const [logs, setLogs] = useState([]);

  const [logsPage, setLogsPage] = useState(1);
  const [usersPage, setUsersPage] = useState(1);
  const ROWS_PER_PAGE = 9;

  const logsStart = (logsPage - 1) * ROWS_PER_PAGE;
  const usersStart = (usersPage - 1) * ROWS_PER_PAGE;

  const logsCount = Math.max(1, Math.ceil(logs.length / ROWS_PER_PAGE));
  const usersCount = Math.max(1, Math.ceil(users.length / ROWS_PER_PAGE));

  const visibleLogs = useMemo(() => logs.slice(logsStart, logsStart + ROWS_PER_PAGE), [logs, logsStart]);
  const visibleUsers = useMemo(() => users.slice(usersStart, usersStart + ROWS_PER_PAGE), [users, usersStart]);

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
      setLogsPage(1); setUsersPage(1);
    }
    fetchData();
  }, [navigate]);

  const handleTabChange = (_e, v) => setTab(v);

  const onChangeRole = async (index, newRole) => {
    try {
      const updatedUser = { ...users[index], Role: newRole };
      await AdminService.updateUserRole(updatedUser);
      notif({ severity: 'success', message: 'User role updated successfully.' });
      setUsers(await AdminService.getUsers());
    } catch (error) {
      UserSession.verifyAuthorize(navigate, error?.status);
      notif({ severity: 'error', message: 'Failed to update user role.' });
    }
  };

  const usersWithIdx = visibleUsers.map((r, idx) => ({ ...r, __pageIndex: idx }));

  const logsColumns = [
    { label: 'ID', width: '14%', render: (l) => l.LogID },
    { label: 'Actor ID', width: '18%', render: (l) => l.ActorID },
    { label: 'Target', width: '28%', render: (l) => l.Target },
    { label: 'Action', width: '20%', render: (l) => l.Action },
    { label: 'Created At', width: '20%', render: (l) => new Date(l.CreatedAt).toLocaleString('fr-FR') },
  ];

  const usersColumns = [
    { label: 'User ID', width: '14%', render: (u) => u.UserID },
    { label: 'Username', width: '24%', render: (u) => u.Username },
    { label: 'Employee ID', width: '18%', render: (u) => u.EmployeeId },
    { label: 'Is Active', width: '14%', render: (u) => (u.IsActive ? 'Active' : 'Inactive') },
    {
      label: 'Role', width: '30%',
      render: (u) => (
        <Select
          value={u.Role ?? ''}
          onChange={(e) => onChangeRole(usersStart + u.__pageIndex, e.target.value)}
          size="small"
          displayEmpty
          sx={{ width: '100%' }}
        >
          <MenuItem value="">-- Select Role --</MenuItem>
          {["Employee", "HR", "Admin"].map((d) => (
            <MenuItem key={d} value={d}>{d}</MenuItem>
          ))}
        </Select>
      ),
    },
  ];

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
              <DataTable columns={logsColumns} rows={visibleLogs} getRowId={(r, idx) => `log-${idx}-${r.LogID}`} />
              <Paginator count={logsCount} page={logsPage} onChange={(_, p) => setLogsPage(p)} />
            </>
          ) : (
            <>
              <DataTable columns={usersColumns} rows={usersWithIdx} getRowId={(r, idx) => `user-${idx}-${r.UserID}`} />
              <Paginator count={usersCount} page={usersPage} onChange={(_, p) => setUsersPage(p)} />
            </>
          )}
        </SectionPaper>
      </Container>
    </Box>
  );
}
