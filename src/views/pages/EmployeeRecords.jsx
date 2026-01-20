import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Container,
  Pagination,
} from '@mui/material';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import HeaderBar from '../components/layout/HeaderBar';
import EmployeeService from '../../services/EmployeeService';
import {useNavigate } from 'react-router-dom';
import UserSession from '../../utils/UserSession';
import useNotification from '../../utils/UseNotification';
import { StyledTabs, StyledTab } from '../components/ui/surfaces/StyledTabs';
import SectionPaper from '../components/ui/surfaces/SectionPaper';
import DataTable from '../components/table/DataTable';

const PAYMENTS_TAB = 0;
const JOB_CHANGES_TAB = 1;

export default function EmployeeRecords() {
  const [tab, setTab] = useState(0);
  const notifs = useNotification();
  const navigate = useNavigate();

  const BusinessID = localStorage.getItem('BusinessID');

  const [payments, setPayments] = useState([]);
  const [jobChanges, setJobChanges] = useState([]);

  const paymentsColumns = [
    {label: 'Rate Changed Rate', field: 'RateChangeDate', render: (r) => new Date(r.RateChangeDate).toLocaleDateString()}, 
    {label: 'Rate', field: 'Rate', render: (r) => `${r.Rate}€`}, 
    {label: 'Pay Frequency', field: 'PayFrequency', render: (r) => r.PayFrequency === 1 ? 'Monthly' :  'Biweekly'}
  ];

  const jobChangesColumns = [
    {label: 'Job Title', field: 'JobTitle'},
    {label: 'Department', field: 'DepartmentName'},
    {label: 'Start Date', field: 'StartDate', render: (r) => new Date(r.StartDate).toLocaleDateString()},
    {label: 'End Date', field: 'EndDate', render: (r) => r.EndDate ? new Date(r.EndDate).toLocaleDateString() : 'Present'}
  ];

  const columns = tab === PAYMENTS_TAB ? paymentsColumns : jobChangesColumns;

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

  const handleTabChange = (_e, v) => {
    setTab(v);
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#fff' }}>
      <HeaderBar />

      <Box sx={{ bgcolor: '#f5f5f5', minHeight: 'calc(100vh - 64px)' }}>
        <Container maxWidth="lg" sx={{ pt: 3, pb: 5 }}>
          
          <Box sx={{ mb: 2 }}>
            <StyledTabs value={tab} onChange={handleTabChange}>
              <StyledTab 
                label="Payments"
                icon={<AttachMoneyIcon fontSize="small" />}
                iconPosition="start"
              />
              <StyledTab 
                label="Job Changes"
                icon={<SwapHorizIcon fontSize="small" />}
                iconPosition="start"
              />
            </StyledTabs>
          </Box>

          <SectionPaper>
            <DataTable 
              columns={columns}
              rows={tab === PAYMENTS_TAB ? visiblePayments : visibleJobChanges}
            />
          </SectionPaper>

        </Container>
      </Box>
    </Box>
  );
}
