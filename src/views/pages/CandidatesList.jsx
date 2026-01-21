import React, { useEffect, useRef, useState } from 'react';
import {
  Box, Container, Typography, IconButton, Button, Stack, Divider, TextField, Select, MenuItem,
  colors
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import HeaderBar from '../components/layout/HeaderBar';
import CandidateService from '../../services/CandidateService';
import JobListingService from '../../services/JobListingService';
import { useNavigate } from 'react-router-dom';
import EmployeeService from '../../services/EmployeeService';
import UserSession from '../../utils/UserSession';
import useNotification from '../../utils/UseNotification';
import ErrorHandler from '../../utils/ErrorHandler';
import DataTable from '../components/table/DataTable';
import FilterBox from '../components/filters/FilterBox';
import SectionPaper from '../components/ui/surfaces/SectionPaper';
import DetailsDrawer from '../components/ui/DetailsDrawer';
import AcceptCandidateDialog from '../components/ui/dialogs/AcceptCandidate';
import RejectCandidateDialog from '../components/ui/dialogs/RefuseCandidate';

export default function CandidatesView() {
  const navigate = useNavigate();
  const showNotification = useNotification();
  const searchTimeoutRef = useRef(null);

  // Simple states
  const [page, setPage] = useState(1);
  const [canSwitchPage, setCanSwitchPage] = useState(true);
  const [pageCount, setPageCount] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filterJobListingId, setFilterJobListingId] = useState(null);
  const [jobListings, setJobListings] = useState([]);
  const [rows, setRows] = useState([]);
  const [sort, setSort] = useState({ SortBy: 'BusinessEntityID', Direction: 'asc' });
  const [departments, setDepartments] = useState([]);

  // Dialog states
  const [acceptDialogOpen, setAcceptDialogOpen] = useState(false);
  const [candidateToAccept, setCandidateToAccept] = useState(null);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [candidateToReject, setCandidateToReject] = useState(null);

  // Drawer states
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  const ROWS_PER_PAGE = 10;



  // Effect 1: Fetch job listings once on mount
  useEffect(() => {
    async function fetchJobListings() {
      try {
        const listings = await JobListingService.getAll();
        setJobListings(listings || []);
      } catch (error) {
        showNotification({ message: 'Error fetching job listings', severity: 'error' });
      }
    }
    fetchJobListings();
  }, [showNotification]);

  // Effect 2: Debounce search with 300ms timeout
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1);
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  // Effect 3: Fetch candidates when dependencies change
  useEffect(() => {
    async function fetchCandidates() {
      try {
        setCanSwitchPage(false);
        const filters = [];

        // Add job listing filter if exists
        if (filterJobListingId !== null) {
          filters.push({ 
            Fields: ['JobListingID'], 
            Values: [filterJobListingId],
            Type: 'Equals'
          });
        }

        // Add search filter if exists
        if (debouncedSearch) {
          filters.push({ 
            Fields: ['FirstName', 'MiddleName', 'LastName', 'Email'], 
            Values: [debouncedSearch],
            Type: 'Contains'
          });
        }
        console.log('Fetching candidates with filters:', page);
        const response = await CandidateService.list(
          page,
          ROWS_PER_PAGE,
          filters,
          { SortBy: sort.SortBy, Direction: sort.Direction }
        );

        const data = response.data;
        setPageCount(Math.ceil(data.totalCount / ROWS_PER_PAGE));

        // Enrich candidates with job listing data
        const enrichedList = (data.items || []).map(candidate => {
          const jobListing = jobListings.find(j => j.jobListingID === candidate.jobListingID);
          return {
            ...candidate,
            jobListingTitle: jobListing?.jobTitle || null,
            jobListingDepartment: jobListing?.departmentName || null
          };
        });

        setRows(enrichedList);
        setCanSwitchPage(true);
      } catch (error) {
        let msg = 'Error retrieving applications.';
        const data = error?.response?.data;
        if (typeof data === 'string') {
          msg = data;
        } else if (data && typeof data === 'object') {
          msg = data.detail || data.title || data.message || 
                (data.errors ? Object.values(data.errors).flat().join(' · ') : msg);
        } else if (error?.message) {
          msg = error.message;
        }
        showNotification({ message: msg, severity: 'error' });
        UserSession.verifyAuthorize(navigate, error?.response?.status);
      }
    }

    fetchCandidates();
  }, [page, debouncedSearch, filterJobListingId, sort.SortBy, sort.Direction, jobListings, showNotification, navigate]);

  // Effect 4: Fetch departments once on mount
  useEffect(() => {
    async function fetchDepartments() {
      try {
        const deps = await EmployeeService.getAllDepartments();
        setDepartments((deps || []).sort());
      } catch (e) {
        showNotification({ message: 'Error fetching departments', severity: 'error' });
      }
    }
    fetchDepartments();
  }, [showNotification]);

  // Handle job listing filter change
  const handleJobListingFilterChange = (e) => {
    const value = e.target.value;
    setFilterJobListingId(value || null);
    setPage(1);
  };

  // Clear all filters
  const handleClearFilters = () => {
    setSearchQuery('');
    setFilterJobListingId(null);
    setPage(1);
  };

  // Dialog handlers
  const openAcceptDialog = (candidate) => {
    setCandidateToAccept(candidate);
    setAcceptDialogOpen(true);
  };

  const openRejectDialog = (candidate) => {
    setCandidateToReject(candidate);
    setRejectDialogOpen(true);
  };

  const closeAcceptDialog = () => {
    setAcceptDialogOpen(false);
    setCandidateToAccept(null);
  };

  const closeRejectDialog = () => {
    setRejectDialogOpen(false);
    setCandidateToReject(null);
  };

  // Drawer handlers
  const openDrawer = (candidate) => {
    setSelectedCandidate(candidate);
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setSelectedCandidate(null);
  };

  // Accept/Reject handlers
  const handleAccept = async ({ jobCandidateId, jobTitle, department, defaultPassword }) => {
    try {
      await CandidateService.accept(jobCandidateId, {
        jobTitle: jobTitle || undefined,
        department: department || undefined,
        defaultPassword: defaultPassword || undefined,
      });
      setRows((prev) => prev.filter((r) => r.jobCandidateId !== jobCandidateId));
      showNotification({ message: 'Candidate accepted as employee!', severity: 'success' });
    } catch (error) {
      const msg = ErrorHandler(error) || 'Error accepting candidate';
      showNotification({ message: msg, severity: 'error' });
    }
  };

  const handleReject = async (id) => {
    try {
      await CandidateService.reject(id);
      setRows((prev) => prev.filter((r) => r.jobCandidateId !== id));
      showNotification({ message: 'Candidate rejected with success!', severity: 'success' });
    } catch (error) {
      let msg = 'Error rejecting candidate';
      const data = error?.response?.data;
      if (typeof data === 'string') {
        msg = data;
      } else if (data && typeof data === 'object') {
        msg = data.detail || data.title || data.message || msg;
      }
      showNotification({ message: msg, severity: 'error' });
    }
  };

  // Navigation and download handlers
  const handleJobListingClick = (jobTitle, e) => {
    e.stopPropagation();
    navigate('/hr/job-listings', { state: { filterJobTitle: jobTitle } });
  };

  const downloadResume = async (r, e) => {
    e.stopPropagation();
    try {
      const blob = await CandidateService.downloadResume(r.resumeFileId ?? r.jobCandidateId);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const filename = r.resumeFileName ?? ('resume_' + r.jobCandidateId + '.pdf');
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      let msg = 'Error downloading the resume.';
      const data = error?.response?.data;
      if (typeof data === 'string') {
        msg = data;
      } else if (data && typeof data === 'object') {
        msg = data.detail || data.title || data.message || msg;
      } else if (error?.message) {
        msg = error.message;
      }
      showNotification({ message: msg, severity: 'error' });
      UserSession.verifyAuthorize(navigate, error?.response?.status);
    }
  };

  const columns = [
    { label: 'ID', width: '8%', field: 'jobCandidateId', render: (r) => r.jobCandidateId, sortable: true },
    {
      label: 'Resume', width: '10%',
      render: (r) => (
        <IconButton aria-label="download resume" onClick={(e) => downloadResume(r, e)} sx={{ color: '#000', '&:hover': { bgcolor: '#eee' } }}>
          <DownloadIcon />
        </IconButton>
      ),
    },
    { label: 'Name', width: '18%', field: 'firstName', render: (r) => r.firstName + ' ' + (r.middleName ? r.middleName + ' ' : '') + r.lastName, sortable: true },
    { label: 'Email', width: '20%', field: 'email', render: (r) => r.email, sortable: true },
    {
      label: 'Job Listing', width: '14%',
      render: (r) => (
        <Typography
          variant="body2"
          onClick={(e) => handleJobListingClick(r.jobListingTitle || 'Unknown', e)}
          sx={{
            cursor: 'pointer',
            color: '#1976d2',
            textDecoration: 'underline',
            '&:hover': { color: '#1565c0', fontWeight: 600 }
          }}
        >
          {r.jobListingTitle || 'N/A'}
        </Typography>
      ),
    },
    {
      label: 'Actions', width: '30%', align: 'center',
      render: (r) => (
        <Stack direction="row" spacing={1} justifyContent="center">
          <Button
            variant="contained"
            onClick={(e) => { e.stopPropagation(); openAcceptDialog(r); }}
            size="small"
            sx={{ textTransform: 'none', fontWeight: 600, fontSize: '0.85rem', bgcolor: '#4caf50', color: '#fff', padding: '6px 12px', '&:hover': { bgcolor: '#45a049' } }}
          >
            Accept
          </Button>
          <Button
            variant="outlined"
            onClick={(e) => { e.stopPropagation(); openRejectDialog(r); }}
            size="small"
            sx={{ textTransform: 'none', fontWeight: 600, fontSize: '0.85rem', borderColor: '#f44336', color: '#f44336', padding: '6px 12px', '&:hover': { bgcolor: '#ffebee', borderColor: '#f44336' } }}
          >
            Reject
          </Button>
        </Stack>
      ),
    },
  ];

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#fff' }}>
      <HeaderBar />

      <Box sx={{ bgcolor: '#f5f5f5', minHeight: 'calc(100vh - 64px)' }}>
        <DetailsDrawer open={drawerOpen} onClose={closeDrawer} title="Candidate Details">
          {selectedCandidate && (
            <Stack spacing={3}>
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#666', mb: 0.5 }}>Full Name</Typography>
                <Typography variant="body1">
                  {selectedCandidate.firstName + ' ' + (selectedCandidate.middleName ? selectedCandidate.middleName + ' ' : '') + selectedCandidate.lastName}
                </Typography>
              </Box>
              <Divider />
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#666', mb: 0.5 }}>Email</Typography>
                <Typography variant="body1">{selectedCandidate.email}</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#666', mb: 0.5 }}>Phone</Typography>
                <Typography variant="body1">{selectedCandidate.phone ?? 'Not provided'}</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#666', mb: 0.5 }}>Message</Typography>
                <Typography variant="body2" sx={{ bgcolor: '#f5f5f5', p: 2, borderRadius: 1, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                  {selectedCandidate.message}
                </Typography>
              </Box>
              <Divider />
              <Stack spacing={1.5}>
                <Button
                  variant="contained"
                  onClick={() => { openAcceptDialog(selectedCandidate); closeDrawer(); }}
                  sx={{ textTransform: 'none', fontWeight: 700, bgcolor: '#4caf50', color: '#fff', '&:hover': { bgcolor: '#45a049' } }}
                >
                  Accept Candidate
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => { openRejectDialog(selectedCandidate); closeDrawer(); }}
                  sx={{ textTransform: 'none', fontWeight: 700, borderColor: '#f44336', color: '#f44336', '&:hover': { bgcolor: '#ffebee', borderColor: '#f44336' } }}
                >
                  Reject Candidate
                </Button>
              </Stack>
            </Stack>
          )}
        </DetailsDrawer>

        <Container maxWidth="xl" sx={{ pt: 3, pb: 2 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>Candidates View</Typography>

          <Stack direction="row" spacing={3} alignItems="flex-start">
            <SectionPaper sx={{ flex: 1 }}>
              <DataTable
                standoutRow={(r) => { return r.employeeID ? colors.blue[100] : null; }}
                columns={columns}
                rows={rows}
                getRowId={(r) => r.jobCandidateId}
                onRowClick={(r) => openDrawer(r)}
                tableSx={{ minWidth: 1000, tableLayout: 'auto' }}
                pageSize={ROWS_PER_PAGE}
                pageCount={pageCount}
                onPageChange={(value) => setPage(value)}
                page={page}
                onSortChange={(sortConfig) => setSort({ SortBy: sortConfig.SortBy, Direction: sortConfig.Direction })}
                canSwitchPage={canSwitchPage}
              />
            </SectionPaper>

            <FilterBox
              title="Filters"
              sticky
              width={260}
              onClear={handleClearFilters}
            >
              <TextField
                label="Name or Email"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => {setSearchQuery(e.target.value); setPage(1);}}
                fullWidth
                size="small"
              />
              <Select
                label="Job Listing"
                value={filterJobListingId || ''}
                onChange={(e) => {handleJobListingFilterChange(e); setPage(1);}}
                fullWidth
                size="small"
                displayEmpty
              >
                <MenuItem value="">
                  <em>All Job Listings</em>
                </MenuItem>
                {jobListings.map((listing) => (
                  <MenuItem key={listing.jobListingID} value={listing.jobListingID}>
                    {listing.jobTitle}
                  </MenuItem>
                ))}
              </Select>
            </FilterBox>
          </Stack>

          <Typography variant="caption" sx={{ display: 'block', color: '#383838', fontStyle: 'italic' }}>
            Note: Blue highlighted rows indicate candidates who are already employees.
          </Typography>
        </Container>

        <AcceptCandidateDialog
          open={acceptDialogOpen}
          candidate={candidateToAccept}
          jobListingTitle={candidateToAccept?.jobListingTitle || ''}
          jobListingDepartment={candidateToAccept?.jobListingDepartment || ''}
          jobListingAvailablePositions={
            candidateToAccept && candidateToAccept.jobListingID
              ? jobListings.find(j => j.jobListingID === candidateToAccept.jobListingID)?.availablePositions
              : null
          }
          departments={departments}
          onClose={closeAcceptDialog}
          onAccept={handleAccept}
          maxWidth="md"
        />

        <RejectCandidateDialog
          open={rejectDialogOpen}
          candidate={candidateToReject}
          onClose={closeRejectDialog}
          onReject={handleReject}
        />
      </Box>
    </Box>
  );
}
