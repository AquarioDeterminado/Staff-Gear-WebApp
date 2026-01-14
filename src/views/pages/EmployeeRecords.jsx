import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Container,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Divider,
  Pagination,
} from '@mui/material';

import HeaderBar from '../components/layout/HeaderBar';
import EmployeeService from '../../services/EmployeeService';
import { useNavigate } from 'react-router-dom';
import UserSession from '../../utils/UserSession';
import useNotification from '../../utils/UseNotification';
import { StyledTabs, StyledTab } from '../components/ui/surfaces/StyledTabs';
import SectionPaper from '../components/ui/surfaces/SectionPaper';
import DataTable from '../components/table/DataTable';

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
        <Box sx={{ mb: 2 }}>
          <StyledTabs value={tab} onChange={handleTabChange}>
            <StyledTab label="Payments" />
            <StyledTab label="Job Changes" />
          </StyledTabs>
        </Box>

        
      <SectionPaper>
        <DataTable 
          columns={columns}
          
        />
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
          {tab === 0 ? (
            <Pagination
              count={Math.max(1, paymentsCount)}
              page={paymentsPage}
              onChange={(_, p) => setPaymentsPage(p)}
              sx={{ '& .MuiPaginationItem-root.Mui-selected': { bgcolor: '#ff9800', color: '#fff' } }}
            />
          ) : (
            <Pagination
              count={Math.max(1, jobChangesCount)}
              page={jobChangesPage}
              onChange={(_, p) => setJobChangesPage(p)}
              sx={{ '& .MuiPaginationItem-root.Mui-selected': { bgcolor: '#ff9800', color: '#fff' } }}
            />
          )}
        </Box>
      </SectionPaper>

      </Container>
    </Box>
  );
}
