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
  Pagination,
  Card,
  CardContent,
  TextField,
  Button,
  Stack,
  Divider,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Drawer
} from '@mui/material';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import DownloadIcon from '@mui/icons-material/Download';
import CloseIcon from '@mui/icons-material/Close';
import HeaderBar from '../components/HeaderBar';
import CandidateService from '../../services/CandidateService';
import HRService from '../../services/HRService';
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
  const [searchQuery, setSearchQuery] = useState('');

  // Dialog para aceitar candidato
  const [acceptDialogOpen, setAcceptDialogOpen] = useState(false);
  const [candidateToAccept, setCandidateToAccept] = useState(null);
  const [acceptFormData, setAcceptFormData] = useState({
    jobTitle: '',
    department: '',
    defaultPassword: 'Welcome@123'
  });

  const [departments, setDepartments] = useState([]);

  // Dialog para confirmar rejeição
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [candidateToReject, setCandidateToReject] = useState(null);

  // Drawer para detalhes do candidato
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  const filtered = useMemo(() => {
    let result = rows;

    // Filtro por ID
    if (filterId) {
      const n = parseInt(filterId, 10);
      if (!Number.isNaN(n)) {
        result = result.filter((r) => r.jobCandidateId === n);
      }
    }

    // Filtro por nome ou email (em tempo real)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter((r) => {
        const fullName = `${r.firstName} ${r.middleName || ''} ${r.lastName}`.toLowerCase();
        const email = (r.email || '').toLowerCase();
        return fullName.includes(query) || email.includes(query);
      });
    }

    return result;
  }, [rows, filterId, searchQuery]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / ROWS_PER_PAGE));
  const start = (page - 1) * ROWS_PER_PAGE;
  const pageRows = filtered.slice(start, start + ROWS_PER_PAGE);

  const openAcceptDialog = (candidate) => {
    setCandidateToAccept(candidate);
    setAcceptFormData({
      jobTitle: '',
      department: departments && departments.length > 0 ? departments[0] : 'Sales',
      defaultPassword: 'Welcome@123'
    });
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

  const openDrawer = (candidate) => {
    setSelectedCandidate(candidate);
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setSelectedCandidate(null);
  };

  const handleAcceptCandidate = async () => {
    try {
      const result = await CandidateService.accept(candidateToAccept.jobCandidateId, {
        jobTitle: acceptFormData.jobTitle || undefined,
        department: acceptFormData.department || undefined,
        defaultPassword: acceptFormData.defaultPassword || undefined
      });

      // Remove candidato da lista
      setRows((prev) => prev.filter(r => r.jobCandidateId !== candidateToAccept.jobCandidateId));
      
      showNotification({
        message: `Candidato ${candidateToAccept.firstName} foi aceito como funcionário!`,
        severity: 'success'
      });

      setAcceptDialogOpen(false);
      setCandidateToAccept(null);
    } catch (error) {
      let msg;
      const data = error?.response?.data;
      if (typeof data === 'string') {
        msg = data;
      } else if (data && typeof data === 'object') {
        msg = data.message || data.detail || data.title || 'Erro ao aceitar candidato';
      }
      if (!msg) msg = error?.message || 'Erro ao aceitar candidato.';
      showNotification({ message: msg, severity: 'error' });
      UserService.verifyAuthorize(navigate, error?.response?.status);
    }
  };

  const handleRejectCandidate = async (id) => {
    try {
      await CandidateService.reject(id);
      setRows((prev) => prev.filter(r => r.jobCandidateId !== id));
      showNotification({
        message: 'Candidato rejeitado com sucesso!',
        severity: 'success'
      });
    } catch (error) {
      let msg;
      const data = error?.response?.data;
      if (typeof data === 'string') {
        msg = data;
      } else if (data && typeof data === 'object') {
        msg = data.message || data.detail || data.title || 'Erro ao rejeitar candidato';
      }
      if (!msg) msg = error?.message || 'Erro ao rejeitar candidato.';
      showNotification({ message: msg, severity: 'error' });
      UserService.verifyAuthorize(navigate, error?.response?.status);
    }
  };

  // Filtro - limpar
  const handleClearFilter = () => {
    setFilterId('');
    setSearchQuery('');
    setPage(1);
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

    async function fetchDepartments() {
      try {
        const movements = await HRService.getAllMovements();
        const deps = Array.isArray(movements) ? [...new Set(movements.map((m) => m.DepartmentName).filter(Boolean))] : [];
        deps.sort();
        setDepartments(deps);
      } catch (err) {
        console.debug('Could not fetch departments for accept dialog', err);
      }
    }

    fetchDepartments();

  }, [navigate, showNotification]);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#fff' }}>
      <HeaderBar />

      {/* Drawer para detalhes do candidato */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={closeDrawer}
      >
        <Box sx={{ width: 450, p: 3 }}>
          {/* Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Detalhes do Candidato
            </Typography>
            <IconButton onClick={closeDrawer} size="small">
              <CloseIcon />
            </IconButton>
          </Box>

          {selectedCandidate && (
            <Stack spacing={3}>
              {/* Nome */}
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#666', mb: 0.5 }}>
                  Nome Completo
                </Typography>
                <Typography variant="body1">
                  {`${selectedCandidate.firstName} ${selectedCandidate.middleName ? selectedCandidate.middleName + ' ' : ''}${selectedCandidate.lastName}`}
                </Typography>
              </Box>

              <Divider />

              {/* Email */}
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#666', mb: 0.5 }}>
                  Email
                </Typography>
                <Typography variant="body1">
                  {selectedCandidate.email}
                </Typography>
              </Box>

              {/* Telefone */}
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#666', mb: 0.5 }}>
                  Telefone
                </Typography>
                <Typography variant="body1">
                  {selectedCandidate.phone || 'Não fornecido'}
                </Typography>
              </Box>

              {/* Mensagem */}
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#666', mb: 0.5 }}>
                  Mensagem
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    bgcolor: '#f5f5f5', 
                    p: 2, 
                    borderRadius: 1,
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word'
                  }}
                >
                  {selectedCandidate.message}
                </Typography>
              </Box>

              <Divider />

              {/* Botões de ação */}
              <Stack spacing={1.5}>
                <Button
                  variant="contained"
                  onClick={() => {
                    openAcceptDialog(selectedCandidate);
                    closeDrawer();
                  }}
                  sx={{
                    textTransform: 'none',
                    fontWeight: 700,
                    bgcolor: '#4caf50',
                    color: '#fff',
                    '&:hover': { bgcolor: '#45a049' }
                  }}
                >
                  Aceitar Candidato
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => {
                    // Open confirmation dialog then close drawer
                    openRejectDialog(selectedCandidate);
                    closeDrawer();
                  }}
                  sx={{
                    textTransform: 'none',
                    fontWeight: 700,
                    borderColor: '#f44336',
                    color: '#f44336',
                    '&:hover': { 
                      bgcolor: '#ffebee',
                      borderColor: '#f44336'
                    }
                  }}
                >
                  Rejeitar Candidato
                </Button>
              </Stack>
            </Stack>
          )}
        </Box>
      </Drawer>

      {/* Dialog para aceitar candidato */}
      <Dialog open={acceptDialogOpen} onClose={() => setAcceptDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Aceitar Candidato: {candidateToAccept?.firstName} {candidateToAccept?.lastName}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 2 }}>
            <TextField
              label="Job Title"
              placeholder="Ex: Software Developer"
              value={acceptFormData.jobTitle}
              onChange={(e) => setAcceptFormData({ ...acceptFormData, jobTitle: e.target.value })}
              fullWidth
              size="small"
              helperText="'New Hire' se deixar vazio"
            />
            <Box>
              <Select
                value={acceptFormData.department}
                onChange={(e) => setAcceptFormData({ ...acceptFormData, department: e.target.value })}
                size="small"
                displayEmpty
                sx={{ width: '100%' }}
              >
                <MenuItem value="">-- Select Department --</MenuItem>
                {departments.map((d) => (
                  <MenuItem key={d} value={d}>
                    {d}
                  </MenuItem>
                ))}
              </Select>
              <Typography variant="caption" sx={{ color: '#666' }}>
                Default: Sales
              </Typography>
            </Box>
            <TextField
              label="Password"
              type="password"
              value={acceptFormData.defaultPassword}
              onChange={(e) => setAcceptFormData({ ...acceptFormData, defaultPassword: e.target.value })}
              fullWidth
              size="small"
              helperText="Enviar ao employee (deve mudar no primeiro login) - Welcome@123"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAcceptDialogOpen(false)}>Cancelar</Button>
          <Button 
            onClick={handleAcceptCandidate} 
            variant="contained"
            sx={{ bgcolor: '#4caf50', '&:hover': { bgcolor: '#45a049' } }}
          >
            Aceitar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog para confirmar rejeição */}
      <Dialog open={rejectDialogOpen} onClose={closeRejectDialog} maxWidth="xs" fullWidth>
        <DialogTitle>Confirmar rejeição</DialogTitle>
        <DialogContent>
          <Typography>
            Tem a certeza que deseja rejeitar o candidato {candidateToReject?.firstName} {candidateToReject?.lastName}?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeRejectDialog}>Cancelar</Button>
          <Button
            onClick={async () => {
              if (!candidateToReject) return;
              await handleRejectCandidate(candidateToReject.jobCandidateId);
              closeRejectDialog();
            }}
            variant="contained"
            sx={{ bgcolor: '#f44336', '&:hover': { bgcolor: '#d32f2f' }, color: '#fff' }}
          >
            Confirmar Rejeição
          </Button>
        </DialogActions>
      </Dialog>

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
            <Table size="small" sx={{ minWidth: 1000, tableLayout: 'auto' }}>
              <TableHead>
                <TableRow sx={{ '& th': { fontWeight: 700, backgroundColor: '#ffe0b2' } }}>
                  <TableCell sx={{ width: '8%' }}>ID</TableCell>
                  <TableCell sx={{ width: '10%' }}>Resume</TableCell>
                  <TableCell sx={{ width: '22%' }}>Nome</TableCell>
                  <TableCell sx={{ width: '28%' }}>Email</TableCell>
                  <TableCell sx={{ width: '32%', textAlign: 'center' }}>Ações</TableCell>
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

                    return (
                      <TableRow 
                        key={id}
                        onClick={() => openDrawer(r)}
                        sx={{
                          cursor: 'pointer',
                          '&:hover': { bgcolor: '#f5f5f5' }
                        }}
                      >
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
                            }}
                            sx={{
                              color: '#000',
                              '&:hover': { bgcolor: '#eee' }
                            }}
                          >
                            <DownloadIcon />
                          </IconButton>
                        </TableCell>
                        <TableCell>{`${r.firstName} ${r.middleName? r.middleName + ' ' : ''}${r.lastName}`}</TableCell>
                        <TableCell>{r.email}</TableCell>
                        <TableCell>
                          <Stack direction="row" spacing={1} justifyContent="center">
                            <Button
                              variant="contained"
                              onClick={(e) => {
                                e.stopPropagation();
                                openAcceptDialog(r);
                              }}
                              size="small"
                              sx={{
                                textTransform: 'none',
                                fontWeight: 600,
                                fontSize: '0.85rem',
                                bgcolor: '#4caf50',
                                color: '#fff',
                                padding: '6px 12px',
                                '&:hover': { bgcolor: '#45a049' }
                              }}
                            >
                              Aceitar
                            </Button>
                            <Button
                              variant="outlined"
                              onClick={(e) => {
                                e.stopPropagation();
                                // open confirmation dialog
                                openRejectDialog(r);
                              }}
                              size="small"
                              sx={{
                                textTransform: 'none',
                                fontWeight: 600,
                                fontSize: '0.85rem',
                                borderColor: '#f44336',
                                color: '#f44336',
                                padding: '6px 12px',
                                '&:hover': { 
                                  bgcolor: '#ffebee',
                                  borderColor: '#f44336'
                                }
                              }}
                            >
                              Rejeitar
                            </Button>
                          </Stack>
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
                Filtros
              </Typography>
              <Divider sx={{ mb: 2 }} />

              {/* Pesquisa por Nome ou Email */}
              <TextField
                label="Nome ou Email"
                placeholder="Pesquisar..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                fullWidth
                size="small"
                sx={{ mb: 2 }}
              />

              {/* Filtro por ID */}
              <TextField
                label="Filtrar por ID"
                placeholder="Ex.: 3"
                value={filterId}
                onChange={(e) => setFilterId(e.target.value)}
                fullWidth
                size="small"
                sx={{ mb: 2 }}
                inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
              />

              {/* Botão Limpar */}
              <Button
                variant="outlined"
                onClick={handleClearFilter}
                sx={{
                  textTransform: 'none',
                  fontWeight: 700,
                  borderColor: '#000',
                  color: '#000',
                  width: '100%',
                  '&:hover': { bgcolor: '#f5f5f5' }
                }}
              >
                Limpar Filtros
              </Button>

            </CardContent>
          </Card>
        </Stack>
      </Container>
    </Box>
  )};
