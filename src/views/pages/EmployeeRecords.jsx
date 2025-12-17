
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
  Typography,
  Pagination,
} from '@mui/material';

import HeaderBar from '../components/HeaderBar';
import EmployeeService from '../../services/EmployeeService';
import { useNavigate } from 'react-router-dom';
import UserSession from '../../utils/UserSession';
import { useNotification } from '../components/NotificationProvider';

export default function EmployeeRecords() {
  const [tab, setTab] = useState(0);
  const notifs = useNotification();

  const navigate = useNavigate();

  const BusinessID = localStorage.getItem('BusinessID');

  const [payments, setPayments] = useState([]);
  const [jobChanges, setJobChanges] = useState([]);

  const paymentsColumns = ['Date - Changed Rate', 'Rate', 'Pay Frequency'];
  const jobChangesColumns = ['Job Title', 'Department', 'Start Date', 'End Date'];
  const columns = tab === 0 ? paymentsColumns : jobChangesColumns;

  const [paymentsPage, setPaymentsPage] = useState(1);
  const [jobChangesPage, setJobChangesPage] = useState(1);
  const ROWS_PER_PAGE = 10;

  useEffect(() => {
    async function fetchData() {
      try {
        const paymentsData = await EmployeeService.getEmployeePayments(BusinessID);
        setPayments(Array.isArray(paymentsData) ? paymentsData : []);
      } catch (error) {
        UserSession.verifyAuthorize(navigate, error.status);
        setPayments([]);
        console.error('Error fetching payments:', error);
        if (error.status !== 404)
          notifs({ severity: 'error', message: error?.message || 'Error fetching payments.' });
      }

      try {
        const jobChangesData = await EmployeeService.getEmployeeMovements(BusinessID);
        setJobChanges(Array.isArray(jobChangesData) ? jobChangesData : []);
      } catch (error) {
        UserSession.verifyAuthorize(navigate, error.status);
        setJobChanges([]);
        console.error('Error fetching job changes:', error);
        if (error.status !== 404)
          notifs({ severity: 'error', message: error?.message || 'Error fetching job changes.' });
      }

      setPaymentsPage(1);
      setJobChangesPage(1);
    }

    fetchData();
  }, [BusinessID, navigate, notifs]);

  const paymentsCount = Math.max(1, Math.ceil(payments.length / ROWS_PER_PAGE));
  const jobChangesCount = Math.max(1, Math.ceil(jobChanges.length / ROWS_PER_PAGE));

  const paymentsStart = (paymentsPage - 1) * ROWS_PER_PAGE;
  const jobChangesStart = (jobChangesPage - 1) * ROWS_PER_PAGE;

  const visiblePayments = useMemo(
    () => payments.slice(paymentsStart, paymentsStart + ROWS_PER_PAGE),
    [payments, paymentsStart]
  );

  const visibleJobChanges = useMemo(
    () => jobChanges.slice(jobChangesStart, jobChangesStart + ROWS_PER_PAGE),
    [jobChanges, jobChangesStart]
  );

  const handleTabChange = (_e, v) => setTab(v);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#fff' }}>
      <HeaderBar />

      <Container maxWidth="lg" sx={{ pt: 3, pb: 5 }}>
        <Box sx={{ display: 'inline-block', bgcolor: '#e0e0e0', borderRadius: 1, mb: 2 }}>
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
                color: '#333',
                bgcolor: '#d9d9d9',
              },
              '& .MuiTab-root:not(:last-of-type)': {
                borderRight: '1px solid rgba(0,0,0,0.2)',
              },
            }}
          >
            <Tab label="payments" disableRipple />
            <Tab label="job changes" disableRipple />
          </Tabs>
        </Box>

        <Paper
          variant="outlined"
          sx={{
            bgcolor: '#fff3e0',
            borderColor: '#ddd',
            borderRadius: 1.5,
            overflow: 'auto',
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
              {tab === 0 ? (
                // Payments
                payments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={columns.length} align="center" sx={{ py: 3 }}>
                      No payment records found.
                    </TableCell>
                  </TableRow>
                ) : visiblePayments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={columns.length} align="center" sx={{ py: 3 }}>
                      Page out of range.
                    </TableCell>
                  </TableRow>
                ) : (
                  visiblePayments.map((payment, index) => (
                    <TableRow key={`${payment.rateChangeDate}-${index}`}>
                      <TableCell>{payment.RateChangeDate}</TableCell>
                      <TableCell>{payment.Rate}</TableCell>
                      <TableCell>{payment.PayFrequency}</TableCell>
                    </TableRow>
                  ))
                )
              ) : (
                // Job changes
                jobChanges.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={columns.length} align="center" sx={{ py: 3 }}>
                      No job change records found.
                    </TableCell>
                  </TableRow>
                ) : visibleJobChanges.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={columns.length} align="center" sx={{ py: 3 }}>
                      Page out of range.
                    </TableCell>
                  </TableRow>
                ) : (
                  visibleJobChanges.map((change, index) => (
                    <TableRow key={`${change.JobTitle}-${change.StartDate}-${index}`}>
                      <TableCell>{change.JobTitle}</TableCell>
                      <TableCell>{change.DepartmentName}</TableCell>
                      <TableCell>{change.StartDate}</TableCell>
                      <TableCell>{change.EndDate || 'Present'}</TableCell>
                    </TableRow>
                  ))
                )
              )}
            </TableBody>
          </Table>

          <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
            {tab === 0 ? (
              <Pagination
                count={Math.max(1, paymentsCount)}
                page={paymentsPage}
                onChange={(_, p) => setPaymentsPage(p)}
                sx={{
                  '& .MuiPaginationItem-root.Mui-selected': {
                    bgcolor: '#ff9800',
                    color: '#fff',
                  },
                }}
              />
            ) : (
              <Pagination
                count={Math.max(1, jobChangesCount)}
                page={jobChangesPage}
                onChange={(_, p) => setJobChangesPage(p)}
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
