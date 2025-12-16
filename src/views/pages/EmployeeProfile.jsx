
import { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Avatar,
  IconButton,
  Tooltip,
  Button,
  Stack,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  CircularProgress
} from '@mui/material';

import EditIcon from '@mui/icons-material/Edit';
import EmailIcon from '@mui/icons-material/Email';
import WorkIcon from '@mui/icons-material/Work';
import ApartmentIcon from '@mui/icons-material/Apartment';
import PersonIcon from '@mui/icons-material/Person';
import KeyIcon from '@mui/icons-material/Key';

import HeaderBar from '../components/HeaderBar';
import { useNavigate } from 'react-router-dom';
import EmployeeService from '../../services/EmployeeService';
import UserSession from '../../utils/UserSession';

export default function EmployeeProfile() {
  const navigate = useNavigate();
  const BusinessID = UserSession.getBusinessID(navigate);

  const [profileInfo, setProfileInfo] = useState(null);

  // ====== Edição de perfil ======
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [formData, setFormData] = useState({
    FirstName: '',
    MiddleName: '',
    LastName: '',
    JobTitle: '',
    Department: '',
    Email: '',
    Role: ''
  });

  // ====== Alteração de password ======
  const [isPwdDialogOpen, setIsPwdDialogOpen] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmittingPwd, setIsSubmittingPwd] = useState(false);

  // Snackbar
  const [snackbar, setSnackbar] = useState({
    open: false,
    severity: 'success',
    message: ''
  });

  useEffect(() => {
    if (!BusinessID) {
      navigate('/');
      return;
    }

    async function GetEmployeeInfo() {
      try {
        const info = await EmployeeService.getEmployee(BusinessID);
        setProfileInfo(info);
        setFormData({
          FirstName: info?.FirstName || '',
          MiddleName: info?.MiddleName || '',
          LastName: info?.LastName || '',
          JobTitle: info?.JobTitle || '',
          Department: info?.Department || '',
          Email: info?.Email || '',
          Role: info?.Role || ''
        });
      } catch (error) {
        console.error('Error fetching profile info:', error);
        const status = error?.response?.status || error?.status;
        UserSession.verifyAuthorize(navigate, status);
        setSnackbar({ open: true, severity: 'error', message: 'Erro ao carregar perfil.' });
      }
    }

    GetEmployeeInfo();
  }, [BusinessID, navigate]);

  // Determina se é HR
  const isHR = useMemo(() => {
    try {
      if (typeof UserSession.getRole === 'function') {
        return UserSession.getRole() === 'HR';
      }
    } catch (e) {
      // noop
    }
    return (profileInfo?.Role || formData?.Role) === 'HR';
  }, [profileInfo, formData]);

  const enterEditMode = () => {
    if (!isHR) {
      setSnackbar({ open: true, severity: 'warning', message: 'Apenas utilizadores HR podem editar o perfil.' });
      return;
    }
    setIsEditMode(true);
  };

  const cancelEdit = () => {
    setFormData({
      FirstName: profileInfo?.FirstName || '',
      MiddleName: profileInfo?.MiddleName || '',
      LastName: profileInfo?.LastName || '',
      JobTitle: profileInfo?.JobTitle || '',
      Department: profileInfo?.Department || '',
      Email: profileInfo?.Email || '',
      Role: profileInfo?.Role || ''
    });
    setIsEditMode(false);
  };

  const validateProfile = () => {
    if (!formData.FirstName?.trim() || !formData.LastName?.trim() || !formData.Email?.trim()) {
      setSnackbar({ open: true, severity: 'warning', message: 'Primeiro nome, apelido e email são obrigatórios.' });
      return false;
    }
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.Email);
    if (!emailOk) {
      setSnackbar({ open: true, severity: 'warning', message: 'Insira um email válido.' });
      return false;
    }
    return true;
  };

  const saveProfile = async () => {
    if (!validateProfile()) return;

    try {
      setIsSavingProfile(true);

      const payload = {
        FirstName: formData.FirstName,
        MiddleName: formData.MiddleName,
        LastName: formData.LastName,
        JobTitle: formData.JobTitle,
        Department: formData.Department,
        Email: formData.Email,
        Role: formData.Role // se o backend não permitir, remova esta linha
      };

      await EmployeeService.updateEmployee(BusinessID, payload);

      setProfileInfo((prev) => ({ ...(prev || {}), ...payload }));
      setIsEditMode(false);
      setSnackbar({ open: true, severity: 'success', message: 'Perfil atualizado com sucesso!' });
    } catch (error) {
      const status = error?.response?.status || error?.status || 'N/A';
      console.error('Erro ao atualizar perfil:', error);
      UserSession.verifyAuthorize(navigate, status);
      setSnackbar({ open: true, severity: 'error', message: `Erro ao atualizar perfil. Código: ${status}` });
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Password
  const openPwdDialog = () => setIsPwdDialogOpen(true);
  const closePwdDialog = () => {
    setIsPwdDialogOpen(false);
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      setSnackbar({ open: true, severity: 'warning', message: 'Preencha todos os campos da password.' });
      return;
    }
    if (newPassword.length < 8) {
      setSnackbar({ open: true, severity: 'warning', message: 'A nova password deve ter pelo menos 8 caracteres.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setSnackbar({ open: true, severity: 'warning', message: 'A confirmação não coincide com a nova password.' });
      return;
    }

    try {
      setIsSubmittingPwd(true);
      const payload = { oldPassword, newPassword };
      await EmployeeService.alterEmployeePassword(BusinessID, payload);

      setSnackbar({ open: true, severity: 'success', message: 'Password alterada com sucesso!' });
      closePwdDialog();
    } catch (error) {
      const status = error?.response?.status || error?.status || 'N/A';
      console.error('Erro ao alterar password:', error);
      setSnackbar({ open: true, severity: 'error', message: `Erro ao alterar password. Código: ${status}` });
    } finally {
      setIsSubmittingPwd(false);
    }
  };

  // Dimensões
  const CARD_W = 280;
  const CARD_H = 72;
  const EMAIL_W = 360;

  // Card base
  const FieldCard = ({ children, width = CARD_W }) => (
    <Paper
      elevation={3}
      sx={{
        width,
        minHeight: CARD_H,
        px: 2.75,
        py: 1.85,
        borderRadius: 3,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      {children}
    </Paper>
  );

  return (
    <Box sx={{ minHeight: '100vh', width: '100%', bgcolor: '#fff' }}>
      <HeaderBar />

      {/* Título + ações */}
      <Stack alignItems="center" sx={{ mt: { xs: 1, md: 2 }, mb: { xs: 1, md: 2 } }}>
        <Typography variant="h5" sx={{ opacity: 0.85 }}>
          Profile
        </Typography>

        <Stack direction="row" spacing={1.5} sx={{ mt: 1 }}>
          {!isEditMode ? (
            <Tooltip title={isHR ? 'Editar Perfil' : 'Apenas HR pode editar'}>
              <span>
                <Button
                  variant="outlined"
                  startIcon={<EditIcon />}
                  onClick={enterEditMode}
                  disabled={!isHR}
                >
                  Editar Perfil
                </Button>
              </span>
            </Tooltip>
          ) : (
            <>
              <Button variant="text" onClick={cancelEdit}>Cancelar</Button>
              <Button
                variant="contained"
                onClick={saveProfile}
                disabled={isSavingProfile}
                startIcon={isSavingProfile ? <CircularProgress size={18} color="inherit" /> : <EditIcon />}
              >
                Guardar Alterações
              </Button>
            </>
          )}
        </Stack>
      </Stack>

      {/* Avatar */}
      <Stack alignItems="center" sx={{ mb: { xs: 2, md: 3 } }}>
        <Avatar sx={{ width: { xs: 110, md: 125 }, height: { xs: 110, md: 125 } }}>
          <PersonIcon sx={{ fontSize: { xs: 52, md: 66 } }} />
        </Avatar>
      </Stack>

      {/* Conteúdo */}
      <Container maxWidth="md" sx={{ pb: { xs: 5, md: 7 } }}>
        <Stack alignItems="center" spacing={2}>
          {/* Nomes */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: `repeat(3, ${CARD_W}px)`,
              justifyContent: 'center',
              gap: 1
            }}
          >
            {/* FirstName */}
            <FieldCard>
              {isEditMode ? (
                <TextField
                  label="First Name"
                  fullWidth
                  size="small"
                  value={formData.FirstName}
                  onChange={(e) => setFormData((s) => ({ ...s, FirstName: e.target.value }))}
                />
              ) : (
                <Stack direction="row" spacing={1.25} alignItems="center" justifyContent="center">
                  <Tooltip title="Edit FirstName">
                    <IconButton size="small" disabled><EditIcon /></IconButton>
                  </Tooltip>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {profileInfo?.FirstName || ''}
                  </Typography>
                </Stack>
              )}
            </FieldCard>

            {/* MiddleName */}
            <FieldCard>
              {isEditMode ? (
                <TextField
                  label="Middle Name"
                  fullWidth
                  size="small"
                  value={formData.MiddleName}
                  onChange={(e) => setFormData((s) => ({ ...s, MiddleName: e.target.value }))}
                />
              ) : (
                <Stack direction="row" spacing={1.25} alignItems="center" justifyContent="center">
                  <Tooltip title="Edit MiddleName">
                    <IconButton size="small" disabled><EditIcon /></IconButton>
                  </Tooltip>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {profileInfo?.MiddleName || ''}
                  </Typography>
                </Stack>
              )}
            </FieldCard>

            {/* LastName */}
            <FieldCard>
              {isEditMode ? (
                <TextField
                  label="Last Name"
                  fullWidth
                  size="small"
                  value={formData.LastName}
                  onChange={(e) => setFormData((s) => ({ ...s, LastName: e.target.value }))}
                />
              ) : (
                <Stack direction="row" spacing={1.25} alignItems="center" justifyContent="center">
                  <Tooltip title="Edit LastName">
                    <IconButton size="small" disabled><EditIcon /></IconButton>
                  </Tooltip>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {profileInfo?.LastName || ''}
                  </Typography>
                </Stack>
              )}
            </FieldCard>
          </Box>

          {/* Job Title & Department */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: `repeat(2, ${CARD_W}px)`,
              justifyContent: 'center',
              gap: 14
            }}
          >
            {/* Job Title */}
            <FieldCard>
              {isEditMode ? (
                <TextField
                  label="Job Title"
                  fullWidth
                  size="small"
                  value={formData.JobTitle}
                  onChange={(e) => setFormData((s) => ({ ...s, JobTitle: e.target.value }))}
                  InputProps={{ startAdornment: <WorkIcon sx={{ mr: 1, color: 'text.secondary' }} /> }}
                />
              ) : (
                <Stack direction="row" spacing={1.25} alignItems="center" justifyContent="center">
                  <Tooltip title="Edit Job Title">
                    <IconButton size="small" disabled><EditIcon /></IconButton>
                  </Tooltip>
                  <WorkIcon />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {profileInfo?.JobTitle || ''}
                  </Typography>
                </Stack>
              )}
            </FieldCard>

            {/* Department */}
            <FieldCard>
              {isEditMode ? (
                <TextField
                  label="Department"
                  fullWidth
                  size="small"
                  value={formData.Department}
                  onChange={(e) => setFormData((s) => ({ ...s, Department: e.target.value }))}
                  InputProps={{ startAdornment: <ApartmentIcon sx={{ mr: 1, color: 'text.secondary' }} /> }}
                />
              ) : (
                <Stack direction="row" spacing={1.25} alignItems="center" justifyContent="center">
                  <Tooltip title="Edit Department">
                    <IconButton size="small" disabled><EditIcon /></IconButton>
                  </Tooltip>
                  <ApartmentIcon />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {profileInfo?.Department || ''}
                  </Typography>
                </Stack>
              )}
            </FieldCard>
          </Box>

          {/* Email */}
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <FieldCard width={EMAIL_W}>
              {isEditMode ? (
                <TextField
                  label="Email"
                  type="email"
                  fullWidth
                  size="small"
                  value={formData.Email}
                  onChange={(e) => setFormData((s) => ({ ...s, Email: e.target.value }))}
                  InputProps={{ startAdornment: <EmailIcon sx={{ mr: 1, color: 'text.secondary' }} /> }}
                />
              ) : (
                <Stack direction="row" spacing={1.5} alignItems="center" justifyContent="center">
                  <Tooltip title="Edit Email">
                    <IconButton size="small" disabled><EditIcon /></IconButton>
                  </Tooltip>
                  <EmailIcon />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {profileInfo?.Email || ''}
                  </Typography>
                </Stack>
              )}
            </FieldCard>
          </Box>

          {/* Botão Alterar Password */}
          <Stack direction="row" justifyContent="center" sx={{ pt: 0.5 }}>
            <Button
              variant="contained"
              size="large"
              startIcon={<KeyIcon sx={{ fontSize: 22 }} />}
              sx={{
                px: 3.25,
                py: 1.35,
                fontSize: 16,
                bgcolor: '#000',
                color: '#fff',
                borderRadius: 999,
                boxShadow: '0 4px 10px rgba(0,0,0,0.12)',
                '&:hover': { bgcolor: '#222' }
              }}
              onClick={openPwdDialog}
            >
              Alterar Password
            </Button>
          </Stack>
        </Stack>
      </Container>

      {/* Dialog Alterar Password */}
      <Dialog open={isPwdDialogOpen} onClose={closePwdDialog} fullWidth maxWidth="xs">
        <DialogTitle>Alterar Password</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Password atual"
              type="password"
              fullWidth
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              autoComplete="current-password"
            />
            <TextField
              label="Nova password"
              type="password"
              fullWidth
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              autoComplete="new-password"
              helperText="Mínimo 8 caracteres."
            />
            <TextField
              label="Confirmar nova password"
              type="password"
              fullWidth
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={closePwdDialog} disabled={isSubmittingPwd}>Cancelar</Button>
          <Button
            onClick={handleChangePassword}
            variant="contained"
            disabled={isSubmittingPwd}
            startIcon={isSubmittingPwd ? <CircularProgress size={18} color="inherit" /> : <KeyIcon />}
          >
            Guardar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert>
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};