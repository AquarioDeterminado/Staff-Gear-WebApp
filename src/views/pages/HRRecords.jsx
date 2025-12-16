
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
} from '@mui/material';

import HeaderBar from '../components/HeaderBar';
import { useNavigate } from 'react-router-dom';
import Pagination from '@mui/material/Pagination';

import HRService from '../../services/HRService';

export default function HRRecords() {
  const navigate = useNavigate();

  const [tab, setTab] = useState(0);
  const [payments, setPayments] = useState([]);
  const [jobChanges, setJobChanges] = useState([]);

  const paymentsColumns = ['Date of Payment', 'Rate', 'Employee'];
  const jobChangesColumns = ['Job Title', 'Department', 'Start Date', 'End Date', 'Employee'];
  const columns = tab === 0 ? paymentsColumns : jobChangesColumns;

  const [paymentsPage, setPaymentsPage] = useState(1);
  const [jobChangesPage, setJobChangesPage] = useState(1);
  const ROWS_PER_PAGE = 10;

  useEffect(() => {
    async function fetchData() {
      try {
        const paymentsData = await HRService.getAllPayments();
        setPayments(Array.isArray(paymentsData) ? paymentsData : []);
      } catch (error) {
        console.error('Error fetching payments:', error);
        navigate('/');
      }

      try {
        const jobChangesData = await HRService.getAllMovements();
        setJobChanges(Array.isArray(jobChangesData) ? jobChangesData : []);
      } catch (error) {
        console.error('Error fetching job changes:', error);
        navigate('/');
      }

      setPaymentsPage(1);
      setJobChangesPage(1);
    }
    fetchData();
  }, [navigate]);

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

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#fff' }}>
      <HeaderBar />

      <Container maxWidth="lg" sx={{ pt: 3, pb: 5 }}>
        <Box sx={{ display: 'inline-block', bgcolor: '#e0e0e0', borderRadius: 1, mb: 2 }}>
          <Tabs
            value={tab}
            onChange={(_e, v) => setTab(v)}
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
              '& .MuiTab-root.Mui-selected': {
                bgcolor: '#d9d9d9',
                color: '#333',
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
                    <TableRow key={index}>
                      <TableCell>{payment.Date}</TableCell>
                      <TableCell>{payment.Amount}</TableCell>
                      <TableCell>{payment.Name}</TableCell>
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
                    <TableRow key={index}>
                      {/* A ordem segue: Job Title, Department, Start Date, End Date, Employee */}
                      <TableCell>{change.JobTitle}</TableCell>
                      <TableCell>{change.DepartmentName}</TableCell>
                      <TableCell>{change.StartDate}</TableCell>
                      <TableCell>{change.EndDate || 'Present'}</TableCell>
                      <TableCell>{change.FullName}</TableCell>
                    </TableRow>
                  ))
                )
              )}
            </TableBody>
          </Table>

          <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
            {tab === 0 ? (
              <Pagination
                count={paymentsCount}
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
                count={jobChangesCount}
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
