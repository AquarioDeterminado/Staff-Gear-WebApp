import React, { useEffect, useState } from 'react';
import { Box, Container, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import JobListingService from '../../services/JobListingService';
import { FormatDate } from '../../utils/FormatingUtils';
import DataTable from '../components/table/DataTable';
import SectionPaper from '../components/ui/surfaces/SectionPaper';
import useNotification from '../../utils/UseNotification';
import HeaderBar from '../components/layout/HeaderBar';

const statusMap = {
  0: 'Open',
  1: 'Reviewing Applications',
  2: 'Closed',
  'Open': 'Open',
  'ReviewingApplications': 'Reviewing Applications',
  'Closed': 'Closed'
};

const getStatusLabel = (status) => {
  const num = Number(status);
  return statusMap[num] || statusMap[status] || 'Unknown';
};

export default function HRJobListings() {
  const navigate = useNavigate();
  const notifs = useNotification();
  const [listings, setListings] = useState([]);

  const columns = [
    { label: 'Job Title', field: 'jobTitle', sortable: true },
    { label: 'Department', field: 'departmentName', sortable: true },
    { label: 'Number of Positions', field: 'numberOfPositions', sortable: true },
    { label: 'Number of Applications', field: 'applicationCount', sortable: true },
    { label: 'Status', field: 'status', render: (row) => getStatusLabel(row.status), sortable: true },
    { label: 'Posted Date', field: 'postedDate', render: (row) => FormatDate(row.postedDate), sortable: true },
    { label: 'Modified Date', field: 'modifiedDate', render: (row) => FormatDate(row.modifiedDate), sortable: true },
    { label: 'Actions', field: 'actions', sortable: false }
  ];

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const data = await JobListingService.getAll();
        setListings(data);
      } catch (error) {
        notifs.error('Failed to load job listings');
        console.error(error);
      }
    };
    fetchListings();
  }, []);

  const handleRowClick = (row) => {
    navigate(`/job-listings/${row.jobListingID}`);
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5' }}>
      <HeaderBar />
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom>
          Job Listings Management
        </Typography>
        <SectionPaper>
          <DataTable
            columns={columns}
            rows={listings}
            setRows={setListings}
            getRowId={(row) => row.jobListingID}
            onRowClick={handleRowClick}
            emptyMessage="No job listings found."
          />
        </SectionPaper>
      </Container>
    </Box>
  );
}