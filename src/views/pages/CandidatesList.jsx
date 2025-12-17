import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  Checkbox,
  Pagination,
  Card,
  CardContent,
  TextField,
  Button,
  Stack,
  Divider,
  Chip
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import HeaderBar from '../components/HeaderBar';
import CandidateService from '../../services/CandidateService';
import { useNavigate } from 'react-router-dom';
import UserService from '../../utils/UserSession';
import { useNotification } from '../components/NotificationProvider';

export default function CandidatesView() {
  const navigate = useNavigate();
  const showNotification = useNotification();

  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(1);
  const ROWS_PER_PAGE = 10;

  const [filterId, setFilterId] = useState('');
  const [approvedMap, setApprovedMap] = useState(
    rows.reduce((acc, r) => ({ ...acc, [r.jobCandidateId]: false }), {})
  );
  const [sentMap, setSentMap] = useState(
    rows.reduce((acc, r) => ({ ...acc, [r.jobCandidateId]: false }), {})
  );
  const [sideMessage, setSideMessage] = useState(null);

  const filtered = useMemo(() => {
    const n = parseInt(filterId, 10);
    if (!filterId || Number.isNaN(n)) return rows;
    return rows.filter((r) => r.jobCandidateId === n);
  }, [rows, filterId]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / ROWS_PER_PAGE));
  const start = (page - 1) * ROWS_PER_PAGE;
  const pageRows = filtered.slice(start, start + ROWS_PER_PAGE);

  const handleApprovalChange = (id) => {
    if (sentMap[id] && approvedMap[id]) return;
    setApprovedMap((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSendOrCancel = (id) => {
    setSentMap((prev) => {
      const next = !prev[id];
      const newMap = { ...prev, [id]: next };

      if (next) {
        setSideMessage({ id, approved: !!approvedMap[id] });
        CandidateService.accept(id);
      } else {
        setSideMessage((curr) => (curr && curr.id === id ? null : curr));
      }
      return newMap;
    });
  };

  // Filtro
  const handleApplyFilter = () => setPage(1);
  const handleClearFilter = () => {
    setFilterId('');
    setPage(1);
  };

  // Cor da linha
  const getRowSx = (id) => {
    if (!sentMap[id]) return {};
    return {
      bgcolor: approvedMap[id] ? '#c8e6c9' : '#ffcdd2',
      transition: 'background-color 0.2s ease'
    };
  };

  useEffect(() => {
    async function fetchCandidates() {
      try {
        var list = (await CandidateService.list()).data;
        console.log(list);
        setRows(Array.isArray(list) ? list : []);
      } catch (error) {
        console.error('Error fetching candidates:', error);
        let msg;
        const data = error?.response?.data;
        if (typeof data === 'string') {
          msg = data;
        } else if (data && typeof data === 'object') {
          msg =
            data.detail ||
            data.title ||
            data.message ||
            (data.errors ? Object.values(data.errors).flat().join(' · ') : null);
        }
        if (!msg) msg = error?.message || 'Erro a obter candidaturas.';
        showNotification({ message: msg, severity: 'error' });
        UserService.verifyAuthorize(navigate, error?.response?.status);
      }
    }

    fetchCandidates();
    
  }, [navigate, showNotification]);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#fff' }}>
      <HeaderBar />

      <Container maxWidth="xl" sx={{ pt: 3, pb: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
          Visualização de candidaturas
        </Typography>

        <Stack direction="row" spacing={3} alignItems="flex-start">
          <Paper
            variant="outlined"
            sx={{
              flex: 1,
              bgcolor: '#fff3e0', // fundo laranja claro
              borderColor: '#ddd',
              borderRadius: 1.5,
              overflow: 'auto'
            }}
          >
            <Table size="small" sx={{ minWidth: 820, tableLayout: 'fixed' }}>
              <TableHead>
                <TableRow sx={{ '& th': { fontWeight: 700 } }}>
                  <TableCell sx={{ width: '10%' }}>ID</TableCell>
                  <TableCell sx={{ width: '16%' }}>Resume</TableCell>
                  <TableCell sx={{ width: '18%' }}>Full Name</TableCell>
                  <TableCell sx={{ width: '18%' }}>Approved (Status)</TableCell>
                  <TableCell sx={{ width: '18%' }}>Answer</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {pageRows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} sx={{ py: 3 }}>
                      Nenhuma candidatura encontrada.
                    </TableCell>
                  </TableRow>
                ) : (
                  pageRows.map((r) => {
                    const id = r.jobCandidateId;
                    const isApproved = !!approvedMap[id];
                    const isSent = !!sentMap[id];
                    const checkboxDisabled = isSent && isApproved;

                    return (
                      <TableRow key={id} sx={getRowSx(id)}>
                        <TableCell>{id}</TableCell>
                        <TableCell>
                          <IconButton
                            aria-label="download resume"
                            onClick={async () =>{
                              try {
                                const blob = await CandidateService.downloadResume(r.resumeFileId ?? r.jobCandidateId);
                                const url = URL.createObjectURL(blob);
                                const a = document.createElement('a');
                                a.href = url;
                                const filename = r.resumeFileName ?? `resume_${r.jobCandidateId}.pdf`;
                                a.download = filename;
                                document.body.appendChild(a);
                                a.click();
                                a.remove();
                                URL.revokeObjectURL(url);
                              } catch (error) {
                                let msg;
                                const data = error?.response?.data;
                                if (typeof data === 'string') {
                                  msg = data;
                                } else if (data && typeof data === 'object') {
                                  msg =
                                    data.detail ||
                                    data.title ||
                                    data.message ||
                                    (data.errors ? Object.values(data.errors).flat().join(' · ') : null);
                                }
                                if (!msg) msg = error?.message || 'Erro ao transferir resume.';
                                console.error('Error downloading resume:', error);
                                showNotification({ message: msg, severity: 'error' });
                                UserService.verifyAuthorize(navigate, error.response?.status);
                              }
                            }
                              
                            }
                            sx={{
                              color: '#000',
                              '&:hover': { bgcolor: '#eee' }
                            }}
                          >
                            <DownloadIcon />
                          </IconButton>
                        </TableCell>
                        <TableCell>{`${r.firstName} ${r.middleName? r.middleName + ' ' : ''}${r.lastName}`}</TableCell>
                        <TableCell>
                          <Checkbox
                            checked={isApproved}
                            onChange={() => handleApprovalChange(id)}
                            color="secondary"
                            disabled={checkboxDisabled}
                          />
                        </TableCell>
                        <TableCell>
                          <Button
                            variant={isSent ? 'outlined' : 'contained'}
                            onClick={() => handleSendOrCancel(id)}
                            sx={{
                              textTransform: 'none',
                              fontWeight: 700,
                              ...(isSent
                                ? {
                                    color: '#000',
                                    borderColor: '#000',
                                    bgcolor: 'transparent'
                                  }
                                : {
                                    bgcolor: '#000',
                                    color: '#fff',
                                    '&:hover': { bgcolor: '#222' }
                                  })
                            }}
                          >
                            {isSent ? 'Cancel' : 'Send Answer'}
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>

            <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
              <Pagination
                count={pageCount}
                page={page}
                onChange={(_, p) => setPage(p)}
                sx={{
                  '& .MuiPaginationItem-root.Mui-selected': {
                    bgcolor: '#ff9800', // laranja
                    color: '#fff'
                  }
                }}
              />
            </Box>
          </Paper>

          <Card
            sx={{
              width: 260,
              bgcolor: '#fff3e0',
              borderRadius: 2,
              boxShadow: 'none',
              alignSelf: 'flex-start',
              position: 'sticky',
              top: 16
            }}
          >
            <CardContent>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
                Filter
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <TextField
                label="Enter ID"
                placeholder="Ex.: 3"
                value={filterId}
                onChange={(e) => setFilterId(e.target.value)}
                fullWidth
                size="small"
                sx={{ mb: 2 }}
                inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
              />
              <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ mb: 2 }}>
                <Button
                  variant="text"
                  onClick={handleClearFilter}
                  sx={{ textTransform: 'none', color: '#000' }}
                >
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  onClick={handleApplyFilter}
                  sx={{
                    bgcolor: '#000',
                    color: '#fff',
                    textTransform: 'none',
                    fontWeight: 700,
                    '&:hover': { bgcolor: '#222' }
                  }}
                >
                  OK
                </Button>
              </Stack>

              <Divider sx={{ mb: 1 }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                State
              </Typography>
              {sideMessage ? (
                <Chip
                  label={`Answer sent • ID ${sideMessage.id}`}
                  sx={{
                    width: '100%',
                    fontWeight: 700,
                    bgcolor: sideMessage.approved ? '#c8e6c9' : '#ffcdd2'
                  }}
                />
              ) : (
                <Typography variant="body2" sx={{ color: '#555' }}>
                                   No answer sent.
                </Typography>
              )}
            </CardContent>
          </Card>
        </Stack>
      </Container>
    </Box>
  )};
