import React, { useEffect, useState } from 'react';
import {
  Box, Container, Typography, IconButton, Button, Stack, Divider, TextField
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import HeaderBar from '../components/layout/HeaderBar';
import CandidateService from '../../services/CandidateService';
import HRService from '../../services/HRService';
import { useNavigate } from 'react-router-dom';
import UserService from '../../utils/UserSession';
import EmployeeService from '../../services/EmployeeService';
import UserSession from '../../utils/UserSession';
import useNotification from '../../utils/UseNotification';
import DataTable from '../components/table/DataTable';
import Paginator from '../components/table/Paginator';
import FilterBox from '../components/filters/FilterBox';
import SectionPaper from '../components/ui/surfaces/SectionPaper';
import DetailsDrawer from '../components/ui/DetailsDrawer';
import AcceptCandidateDialog from '../components/ui/dialogs/AcceptCandidate';
import RejectCandidateDialog from '../components/ui/dialogs/RefuseCandidate';

export default function CandidatesView() {
  const navigate = useNavigate();
  const showNotification = useNotification();

  const [rows, setRows] = useState([]);
  const ROWS_PER_PAGE = 10;
  const [page, setPage] = useState(1);
  const [pageCount, setPageCount] = useState(1);

  const [filterId, setFilterId] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const [sort, setSort] = useState({ SortBy: 'BusinessEntityID', Direction: 'asc' });

  // Dialog Accept
  const [acceptDialogOpen, setAcceptDialogOpen] = useState(false);
  const [candidateToAccept, setCandidateToAccept] = useState(null);
  const [departments, setDepartments] = useState([]);

  // Dialog Reject
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [candidateToReject, setCandidateToReject] = useState(null);

  // Drawer Details
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  const openAcceptDialog = (candidate) => {
    setCandidateToAccept(candidate);
    setAcceptDialogOpen(true);
  };

  const openRejectDialog = (candidate) => {
    setCandidateToReject(candidate);
    setRejectDialogOpen(true);
  };

  const closeRejectDialog = () => {
    setRejectDialogOpen(false);
    setCandidateToReject(null);
  };

  const openDrawer = (candidate) => { setSelectedCandidate(candidate); setDrawerOpen(true); };
  const closeDrawer = () => { setDrawerOpen(false); setSelectedCandidate(null); };
  const handleAccept = async ({ jobCandidateId, jobTitle, department, defaultPassword }) => {
    await CandidateService.accept(jobCandidateId, {
      jobTitle: jobTitle || undefined,
      department: department || undefined,
      defaultPassword: defaultPassword || undefined,
    });
    setRows((prev) => prev.filter((r) => r.jobCandidateId !== jobCandidateId));
    showNotification({ message: 'Candidate accepted as employee!', severity: 'success' });
  };

  const handleReject = async (id) => {
    await CandidateService.reject(id);
    setRows((prev) => prev.filter((r) => r.jobCandidateId !== id));
    showNotification({ message: 'Candidate rejected with success!', severity: 'success' });
  };

  useEffect(() => {
    async function fetchCandidates() {
      try {
        const data = (await CandidateService.list(page, ROWS_PER_PAGE,
          [
            { Fields: ['JobCandidateID'], Values: filterId ? [filterId] : [] },
            { Fields: ['FirstName', 'MiddleName', 'LastName', 'Email'], Values: searchQuery ? [searchQuery] : [] },
          ],
          { SortBy: sort.SortBy, Direction: sort.Direction }
        )).data;

        setPageCount(Math.ceil(data.totalCount / ROWS_PER_PAGE));
        const list = data.items;
        setRows(Array.isArray(list) ? list : []);
      } catch (error) {
        let msg;
        const data = error?.response?.data;
        if (typeof data === 'string') msg = data;
        else if (data && typeof data === 'object') {
          msg = data.detail || data.title || data.message || (data.errors ? Object.values(data.errors).flat().join(' · ') : null);
        }
        if (!msg) msg = error?.message || 'Error retrieving applications.';
        showNotification({ message: msg, severity: 'error' });
        UserSession.verifyAuthorize(navigate, error?.response?.status);
      }
    }
    async function fetchDepartments() {
      try {
        const deps = await EmployeeService.getAllDepartments();
        deps.sort();
        setDepartments(deps);
      } catch (err) {
        console.error('Error fetching departments:', err);
      }
    }
    fetchCandidates();
    fetchDepartments();
  }, [filterId, navigate, page, searchQuery, showNotification, sort.Direction, sort.SortBy]);

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
      let msg;
      const data = error?.response?.data;
      if (typeof data === 'string') msg = data;
      else if (data && typeof data === 'object') {
        msg = data.detail || data.title || data.message || (data.errors ? Object.values(data.errors).flat().join(' · ') : null);
      }
      if (!msg) msg = error?.message || 'Error downloading the resume.';
      showNotification({ message: msg, severity: 'error' });
      UserSession.verifyAuthorize(navigate, error.response?.status);
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
    { label: 'Name', width: '22%', field: 'firstName', render: (r) => r.firstName + ' ' + (r.middleName ? r.middleName + ' ' : '') + r.lastName, sortable: true },
    { label: 'Email', width: '28%', field: 'email', render: (r) => r.email, sortable: true },
    {
      label: 'Actions', width: '32%', align: 'center',
      render: (r) => (
        <Stack direction="row" spacing={1} justifyContent="center">
          <Button
            variant="contained"
            onClick={(e) => { e.stopPropagation(); openAcceptDialog(r); }}
            size="small"
            sx={{ textTransform: 'none', fontWeight: 600, fontSize: '0.85rem', bgcolor: '#4caf50', color: '#fff', padding: '6px 12px', '&:hover': { bgcolor: '#45a049' } }}
          >Accept</Button>
          <Button
            variant="outlined"
            onClick={(e) => { e.stopPropagation(); openRejectDialog(r); }}
            size="small"
            sx={{ textTransform: 'none', fontWeight: 600, fontSize: '0.85rem', borderColor: '#f44336', color: '#f44336', padding: '6px 12px', '&:hover': { bgcolor: '#ffebee', borderColor: '#f44336' } }}
          >Reject</Button>
        </Stack>
      ),
    },
  ];

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#fff' }}>
      <HeaderBar />

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
              >Accept Candidate</Button>
              <Button
                variant="outlined"
                onClick={() => { openRejectDialog(selectedCandidate); closeDrawer(); }}
                sx={{ textTransform: 'none', fontWeight: 700, borderColor: '#f44336', color: '#f44336', '&:hover': { bgcolor: '#ffebee', borderColor: '#f44336' } }}
              >Reject Candidate</Button>
            </Stack>
          </Stack>
        )}
      </DetailsDrawer>

      <Container maxWidth="xl" sx={{ pt: 3, pb: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>Candidates View</Typography>

        <Stack direction="row" spacing={3} alignItems="flex-start">
          <SectionPaper sx={{ flex: 1 }}>
            <DataTable
              columns={columns}
              rows={rows}
              getRowId={(r) => r.jobCandidateId}
              onRowClick={(r) => openDrawer(r)}
              tableSx={{ minWidth: 1000, tableLayout: 'auto' }}
              headSx={{ '& th': { backgroundColor: '#ffe0b2' } }}
              pageSize={ROWS_PER_PAGE}
              pageCount={pageCount}
              onPageChange={(e, value) => setPage(value)}
              onSortChange={(sort) => { setSort({ SortBy: sort.SortBy, Direction: sort.Direction }); }}
            />
          </SectionPaper>

          <FilterBox
            title="Filters"
            sticky
            width={260}
            onClear={() => { setFilterId(''); setSearchQuery(''); }}
          >
            <TextField
              label="Name or Email"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              fullWidth
              size="small"
            />
            <TextField
              label="Filter by ID"
              placeholder="Ex.: 3"
              value={filterId}
              onChange={(e) => setFilterId(e.target.value)}
              fullWidth
              size="small"
              inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
            />
          </FilterBox>
        </Stack>
      </Container>

      <AcceptCandidateDialog
        open={acceptDialogOpen}
        candidate={candidateToAccept}
        departments={departments}
        onClose={() => { setAcceptDialogOpen(false); setCandidateToAccept(null); }}
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
  );
}
