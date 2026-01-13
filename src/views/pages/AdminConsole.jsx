import React, { useEffect, useMemo, useState } from 'react';
import { Box, Container, Select, MenuItem, Typography } from '@mui/material';
import HeaderBar from '../components/layout/HeaderBar';
import { useNavigate } from 'react-router-dom';
import AdminService from '../../services/AdminService';
import useNotification from '../../utils/UseNotification';
import UserSession from '../../utils/UserSession';
import DataTable from '../components/table/DataTable';
import Paginator from '../components/table/Paginator';
import { StyledTabs, StyledTab } from '../components/ui/surfaces/StyledTabs';
import SectionPaper from '../components/ui/surfaces/SectionPaper';
import ConfirmPopup from '../components/ui/popups/ConfirmPopup';

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

  const visibleLogs = useMemo(
    () => logs.slice(logsStart, logsStart + ROWS_PER_PAGE),
    [logs, logsStart]
  );
  const visibleUsers = useMemo(
    () => users.slice(usersStart, usersStart + ROWS_PER_PAGE),
    [users, usersStart]
  );

  // Popup de confirmação de mudança de Role
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newRole, setNewRole] = useState('');
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

  const handleRoleChangeRequest = (user, role) => {
    setSelectedUser(user);
    setNewRole(role);
    setConfirmOpen(true);
  };

  const handleConfirmRoleChange = async () => {
    if (!selectedUser || !newRole) return;
    setLoading(true);
    try {
      const updatedUser = { ...selectedUser, Role: newRole };
      await AdminService.updateUserRole(updatedUser);
      notif({ severity: 'success', message: 'User role updated successfully.' });
      setUsers(await AdminService.getUsers());
    } catch (error) {
      UserSession.verifyAuthorize(navigate, error?.status);
      notif({ severity: 'error', message: 'Failed to update user role.' });
    } finally {
      setLoading(false);
      setConfirmOpen(false);
      setSelectedUser(null);
      setNewRole('');
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
      render: (u) => {
        // Se o utilizador não tiver Role definido, mostramos "Employee" por defeito no Select
        const currentRole = u.Role || 'Employee';
        return (
          <Select
            value={currentRole}
            onChange={(e) => handleRoleChangeRequest(u, e.target.value)}
            size="small"
            sx={{ width: '100%' }}
          >
            {/* REMOVIDO o placeholder "-- Select Role --" */}
            {['Employee', 'HR', 'Admin'].map((d) => (
              <MenuItem key={d} value={d}>{d}</MenuItem>
            ))}
          </Select>
        );
      },
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

      {/* Confirm Role Change */}
      <ConfirmPopup
        open={confirmOpen}
        title="Confirm Role Change"
        content={
          selectedUser ? (
            'Are you sure you want to change the role of ' +
            selectedUser.Username +
            ' to ' + newRole + '?'
          ) : ''
        }
        onCancel={() => {
          setConfirmOpen(false);
          setSelectedUser(null);
          setNewRole('');
        }}
        onConfirm={handleConfirmRoleChange}
        confirmLabel="Confirm"
        loading={loading}
        confirmButtonSx={{ bgcolor: '#000', color: '#fff', '&:hover': { bgcolor: '#222' } }}
      />
    </Box>
  );
}
