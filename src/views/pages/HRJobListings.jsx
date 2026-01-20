import React, { useEffect, useState, useMemo } from 'react';
import { Box, Container, Typography, TextField, Select, MenuItem, Stack, Button, IconButton } from '@mui/material';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { useNavigate, useLocation } from 'react-router-dom';
import JobListingService from '../../services/JobListingService';
import { FormatDate } from '../../utils/FormatingUtils';
import DataTable from '../components/table/DataTable';
import SectionPaper from '../components/ui/surfaces/SectionPaper';
import useNotification from '../../utils/UseNotification';
import HeaderBar from '../components/layout/HeaderBar';
import FilterPanel from '../components/filters/FilterPanel';
import { DepartmentSelectField } from '../components/fields/DepartmentSelectField';
import CreateJobListingDialog from '../components/ui/dialogs/CreateJobListingDialog';
import EditJobListingDialog from '../components/ui/dialogs/EditJobListingDialog';
import DeleteJobListingDialog from '../components/ui/dialogs/DeleteJobListingDialog';

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
  const location = useLocation();
  const notifs = useNotification();
  const [listings, setListings] = useState([]);
  const [filterExpanded, setFilterExpanded] = useState(false);
  const [filterJobTitle, setFilterJobTitle] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPostedFrom, setFilterPostedFrom] = useState('');
  const [filterPostedTo, setFilterPostedTo] = useState('');
  const [filterModifiedFrom, setFilterModifiedFrom] = useState('');
  const [filterModifiedTo, setFilterModifiedTo] = useState('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [selectedJobListing, setSelectedJobListing] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [selectedJobListingForDelete, setSelectedJobListingForDelete] = useState(null);

  const columns = [
    { label: 'Job Title', field: 'jobTitle', sortable: true },
    { label: 'Department', field: 'departmentName', sortable: true },
    { label: 'Number of Positions', field: 'numberOfPositions', sortable: true },
    { label: 'Number of Applications', field: 'applicationCount', sortable: true },
    { label: 'Status', field: 'status', render: (row) => getStatusLabel(row.status), sortable: true },
    { label: 'Posted Date', field: 'postedDate', render: (row) => FormatDate(row.postedDate), sortable: true },
    { label: 'Modified Date', field: 'modifiedDate', render: (row) => FormatDate(row.modifiedDate), sortable: true },
    { 
      label: 'Actions', 
      field: 'actions', 
      sortable: false,
      render: (row) => (
        <div style={{ display: 'flex', gap: '8px' }}>
          <IconButton 
            size="small" 
            onClick={(e) => {
              e.stopPropagation();
              handleEditClick(row);
            }}
            sx={{ bgcolor: '#fff3e0', color: '#000000ff', '&:hover': { bgcolor: '#000000ff', color: '#fff' } }}
            title="Edit Job Listing"
          >
            <EditOutlinedIcon />
          </IconButton>
          <IconButton 
            size="small" 
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteClick(row);
            }}
            sx={{ bgcolor: '#fff3e0', color: '#000000ff', '&:hover': { bgcolor: '#000000ff', color: '#fff' } }}
            title="Delete Job Listing"
          >
            <DeleteOutlineIcon />
          </IconButton>
        </div>
      )
    }
  ];

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const data = await JobListingService.getAll();
        setListings(data);
      } catch (error) {
        notifs({ severity: 'error', message: 'Failed to load job listings' });
        console.error(error);
      }
    };
    fetchListings();

    // Apply filter from route state if present
    if (location.state?.filterJobTitle) {
      setFilterJobTitle(location.state.filterJobTitle);
    }
  }, []);

  const filteredListings = useMemo(() => {
    return listings.filter((listing) => {
      if (filterJobTitle.trim()) {
        const query = filterJobTitle.toLowerCase();
        if (!(listing.jobTitle || '').toLowerCase().includes(query)) return false;
      }
      if (filterDepartment.trim()) {
        const query = filterDepartment.toLowerCase();
        if (!(listing.departmentName || '').toLowerCase().includes(query)) return false;
      }
      if (filterStatus !== '') {
        if (listing.status !== parseInt(filterStatus)) return false;
      }
      if (filterPostedFrom) {
        const postedDate = new Date(listing.postedDate);
        const fromDate = new Date(filterPostedFrom);
        if (postedDate < fromDate) return false;
      }
      if (filterPostedTo) {
        const postedDate = new Date(listing.postedDate);
        const toDate = new Date(filterPostedTo);
        if (postedDate > toDate) return false;
      }
      if (filterModifiedFrom) {
        const modifiedDate = new Date(listing.modifiedDate);
        const fromDate = new Date(filterModifiedFrom);
        if (modifiedDate < fromDate) return false;
      }
      if (filterModifiedTo) {
        const modifiedDate = new Date(listing.modifiedDate);
        const toDate = new Date(filterModifiedTo);
        if (modifiedDate > toDate) return false;
      }
      return true;
    });
  }, [listings, filterJobTitle, filterDepartment, filterStatus, filterPostedFrom, filterPostedTo, filterModifiedFrom, filterModifiedTo]);

  const handleClearFilters = () => {
    setFilterJobTitle('');
    setFilterDepartment('');
    setFilterStatus('');
    setFilterPostedFrom('');
    setFilterPostedTo('');
    setFilterModifiedFrom('');
    setFilterModifiedTo('');
  };

  const handleCreateJobListing = async (jobListingData) => {
    try {
      setCreateLoading(true);
      await JobListingService.create(jobListingData);
      // Reload the listings to ensure all fields are populated correctly
      const data = await JobListingService.getAll();
      setListings(data);
      setCreateDialogOpen(false);
      notifs({ severity: 'success', message: 'Job listing created successfully!' });
    } catch (error) {
      notifs({ severity: 'error', message: 'Failed to create job listing' });
      console.error('Error creating job listing:', error);
    } finally {
      setCreateLoading(false);
    }
  };

  const handleEditClick = (jobListing) => {
    setSelectedJobListing(jobListing);
    setEditDialogOpen(true);
  };

  const handleDeleteClick = (jobListing) => {
    setSelectedJobListingForDelete(jobListing);
    setDeleteDialogOpen(true);
  };

  const handleEditJobListing = async (jobListingData) => {
    try {
      setEditLoading(true);
      const updatedListing = await JobListingService.update(jobListingData);
      setListings(listings.map(item => 
        item.jobListingID === updatedListing.jobListingID ? updatedListing : item
      ));
      notifs({ severity: 'success', message: 'Job listing updated successfully!' });
    } catch (error) {
      notifs({ severity: 'error', message: 'Failed to update job listing' });
      console.error('Error updating job listing:', error);
    } finally {
      setEditLoading(false);
    }
  };

  const handleConfirmDelete = async (jobListing) => {
    try {
      setDeleteLoading(true);
      await JobListingService.delete(jobListing.jobListingID);
      setListings(listings.filter(item => item.jobListingID !== jobListing.jobListingID));
      notifs({ severity: 'success', message: 'Job listing deleted successfully!' });
    } catch (error) {
      console.error('Error deleting job listing:', error);
      if (error.response?.status === 409) {
        notifs({ severity: 'error', message: 'Its not possible to delete this Job Listing. There are applications associated.' });
      } else {
        notifs({ severity: 'error', message: 'Error deleting this job listing' });
      }
    } finally {
      setDeleteLoading(false);
      setDeleteDialogOpen(false);
      setSelectedJobListingForDelete(null);
    }
  };

  const handleRowClick = (row) => {
    navigate(`/job-listings/${row.jobListingID}`);
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5' }}>
      <HeaderBar />
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
          <Typography variant="h4">
            Job Listings Management
          </Typography>
          <Button
            variant="contained"
            onClick={() => setCreateDialogOpen(true)}
            sx={{
              bgcolor: '#ff9100',
              color: '#000000',
              textTransform: 'none',
              fontWeight: 700,
              fontSize: '1.1rem', 
              '&:hover': { bgcolor: '#d67900' },
            }}
          >
            + Create Job Listing
          </Button>
        </Stack>
        <FilterPanel
          title="Filters"
          expanded={filterExpanded}
          onToggle={() => setFilterExpanded(!filterExpanded)}
          onClear={handleClearFilters}
        >
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <TextField
              label="Job Title"
              value={filterJobTitle}
              onChange={(e) => setFilterJobTitle(e.target.value)}
              size="small"
              sx={{ flex: 2 }}
            />
            <DepartmentSelectField
              value={filterDepartment}
              onChange={(v) => setFilterDepartment(v)}
              sx={{ flex: 1 }}
            />
            <Select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              displayEmpty
              size="small"
              sx={{ flex: 1 }}
            >
              <MenuItem value="">All Statuses</MenuItem>
              <MenuItem value={0}>Open</MenuItem>
              <MenuItem value={1}>Reviewing Applications</MenuItem>
              <MenuItem value={2}>Closed</MenuItem>
            </Select>
          </Stack>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <TextField
              label="Posted Date From"
              type="date"
              value={filterPostedFrom}
              onChange={(e) => setFilterPostedFrom(e.target.value)}
              size="small"
              sx={{ flex: 1 }}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Posted Date To"
              type="date"
              value={filterPostedTo}
              onChange={(e) => setFilterPostedTo(e.target.value)}
              size="small"
              sx={{ flex: 1 }}
              InputLabelProps={{ shrink: true }}
            />
          </Stack>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <TextField
              label="Modified Date From"
              type="date"
              value={filterModifiedFrom}
              onChange={(e) => setFilterModifiedFrom(e.target.value)}
              size="small"
              sx={{ flex: 1 }}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Modified Date To"
              type="date"
              value={filterModifiedTo}
              onChange={(e) => setFilterModifiedTo(e.target.value)}
              size="small"
              sx={{ flex: 1 }}
              InputLabelProps={{ shrink: true }}
            />
          </Stack>
        </FilterPanel>
        <SectionPaper>
          <DataTable
            columns={columns}
            rows={filteredListings}
            setRows={setListings}
            getRowId={(row) => row.jobListingID}
            onRowClick={handleRowClick}
            emptyMessage="No job listings found."
          />
        </SectionPaper>

        <CreateJobListingDialog
          open={createDialogOpen}
          onClose={() => setCreateDialogOpen(false)}
          onSubmit={handleCreateJobListing}
          loading={createLoading}
        />

        <EditJobListingDialog
          open={editDialogOpen}
          jobListing={selectedJobListing}
          onClose={() => {
            setEditDialogOpen(false);
            setSelectedJobListing(null);
          }}
          onSubmit={handleEditJobListing}
          loading={editLoading}
        />

        <DeleteJobListingDialog
          open={deleteDialogOpen}
          jobListing={selectedJobListingForDelete}
          onClose={() => {
            setDeleteDialogOpen(false);
            setSelectedJobListingForDelete(null);
          }}
          onConfirm={handleConfirmDelete}
          loading={deleteLoading}
        />
      </Container>
    </Box>
  );
}