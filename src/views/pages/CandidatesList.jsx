import React, { useEffect, useMemo, useState } from 'react';
import {
  Box, Container, Typography, IconButton, Button, Stack, Divider, TextField
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import HeaderBar from '../components/layout/HeaderBar';
import CandidateService from '../../services/CandidateService';
import HRService from '../../services/HRService';
import { useNavigate } from 'react-router-dom';
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
  const [page, setPage] = useState(1);
  const ROWS_PER_PAGE = 10;

  const [filterId, setFilterId] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

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

  const filtered = useMemo(() => {
    let result = rows;
    if (filterId) {
      const n = parseInt(filterId, 10);
      if (!Number.isNaN(n)) {
        result = result.filter((r) => r.jobCandidateId === n);
      }
    }
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter((r) => {
        const fullName = (r.firstName + ' ' + (r.middleName ? r.middleName + ' ' : '') + r.lastName).toLowerCase();
        const email = (r.email || '').toLowerCase();
        return fullName.includes(query) || email.includes(query);
      });
    }
    return result;
  }, [rows, filterId, searchQuery]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / ROWS_PER_PAGE));
  const start = (page - 1) * ROWS_PER_PAGE;
  const pageRows = filtered.slice(start, start + ROWS_PER_PAGE);
  const pageRowsWithIdx = pageRows.map((r, idx) => ({ ...r, __pageIndex: idx }));

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
        const list = (await CandidateService.list()).data;
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
        const movements = await HRService.getAllMovements();
        const deps = Array.isArray(movements)
          ? [...new Set(movements.map((m) => m.DepartmentName).filter(Boolean))]
          : [];
        deps.sort();
        setDepartments(deps);
      } catch (err) {
      }
    }
    fetchCandidates();
    fetchDepartments();
  }, [navigate, showNotification]);

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
    { label: 'ID', width: '8%', render: (r) => r.jobCandidateId },
    {
      label: 'Resume', width: '10%',
      render: (r) => (
        <IconButton aria-label="download resume" onClick={(e) => downloadResume(r, e)} sx={{ color: '#000', '&:hover': { bgcolor: '#eee' } }}>
          <DownloadIcon />
        </IconButton>
      ),
    },
    { label: 'Name', width: '22%', render: (r) => r.firstName + ' ' + (r.middleName ? r.middleName + ' ' : '') + r.lastName },
    { label: 'Email', width: '28%', render: (r) => r.email },
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
              rows={pageRowsWithIdx}
              getRowId={(r) => r.jobCandidateId}
              onRowClick={(r) => openDrawer(r)}
              tableSx={{ minWidth: 1000, tableLayout: 'auto' }}
              headSx={{ '& th': { backgroundColor: '#ffe0b2' } }}
            />
            <Paginator count={pageCount} page={page} onChange={(_, p) => setPage(p)} />
          </SectionPaper>

          <FilterBox
            title="Filters"
            sticky
            width={260}
            onClear={() => { setFilterId(''); setSearchQuery(''); setPage(1); }}
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
