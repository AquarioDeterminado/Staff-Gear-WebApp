import { useEffect, useState } from 'react';
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
  CircularProgress,
  InputAdornment
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
import { ConfirmationNumber } from '@mui/icons-material';
import ErrorHandler from '../../utils/ErrorHandler';
import useNotification from '../../utils/UseNotification';

const CARD_W = 280;
const CARD_H = 72;
const EMAIL_W = 360;

function FieldCard({ children, width = CARD_W }) {
  return (
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
}

export default function EmployeeProfile() {
  const navigate = useNavigate();
  const BusinessID = UserSession.getBusinessID(navigate);

  const [profileInfo, setProfileInfo] = useState(null);

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
  const [updateProfileError, setUpdateProfileError] = useState({"FirstName": "", "LastName": "", "Email": ""});
  const [updatePwdError, setUpdatePwdError] = useState({"OldPassword": "", "NewPassword": "", "ConfirmPassword": ""});

  const [isPwdDialogOpen, setIsPwdDialogOpen] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmittingPwd, setIsSubmittingPwd] = useState(false);
  const notif = useNotification();

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
        notif({ severity: 'error', message: 'Error while loading the profile.' });
      }
    }

    GetEmployeeInfo();
  }, [BusinessID, navigate, notif]);

  useEffect(() => {
    if (profileInfo && !isEditMode) {
      setFormData({
        FirstName: profileInfo.FirstName || '',
        MiddleName: profileInfo.MiddleName || '',
        LastName: profileInfo.LastName || '',
        JobTitle: profileInfo.JobTitle || '',
        Department: profileInfo.Department || '',
        Email: profileInfo.Email || '',
        Role: profileInfo.Role || ''
      });
    }
  }, [profileInfo, isEditMode]);

  const enterEditMode = () => setIsEditMode(true);

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
    var isValid = true;

    setUpdateProfileError({"FirstName": "", "LastName": "", "Email": ""});
    if (!formData.FirstName?.trim() ){
      setUpdateProfileError(prev => ({...prev, FirstName: "First name is required."}));
      isValid = false;
    } 
    if (!formData.LastName?.trim()){
      setUpdateProfileError(prev => ({...prev, LastName: "Last name is required."}));
      isValid = false;
    }
    if (!formData.Email?.trim()){
      setUpdateProfileError(prev => ({...prev, Email: "Email is required."}));
      isValid = false;
    }
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.Email);
    if (!emailOk) {
      setUpdateProfileError(prev => ({...prev, Email: "Insert a valid email."}));
      isValid = false;
    }
    return isValid;
  };

  const saveProfile = async () => {
    if (!validateProfile()) return;

    try {
      setIsSavingProfile(true);

      const payload = {
        FirstName: formData.FirstName,
        MiddleName: formData.MiddleName,
        LastName: formData.LastName,
        Email: formData.Email
      };

      await EmployeeService.updateEmployee(BusinessID, payload);

      setProfileInfo((prev) => ({ ...(prev || {}), ...payload }));
      setIsEditMode(false);
      notif({ severity: 'success', message: 'Profile updated with success!' });
    } catch (error) {
      const status = error?.response?.status || error?.status || 'N/A';
      console.error('Error while updating the profile:', error);
      UserSession.verifyAuthorize(navigate, status);
      if(status === 409) {
        const data = error?.response?.data;
        const conflictMsg = (data && (data.message || data.detail)) || 'Email already in use';
        notif({ severity: 'error', message: conflictMsg });
      }
      else{
        const msg = ErrorHandler(error);
        notif({ severity: 'error', message: msg });
      }
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
    setUpdatePwdError({"OldPassword": "", "NewPassword": "", "ConfirmPassword": ""});
    var isValid = true;

    if (!oldPassword || oldPassword.trim() === '') {
      setUpdatePwdError(prev => ({...prev, OldPassword: "Current password is required."}));
      isValid = false;
    }
    if (!newPassword || newPassword.trim() === '') {
      setUpdatePwdError(prev => ({...prev, NewPassword: "New password is required."}));
      isValid = false;
    }
    if (newPassword !== confirmPassword) {
      setUpdatePwdError(prev => ({...prev, ConfirmPassword: "The confirmation isn't the same as the new password."}));
      isValid = false;
    }

    if (!isValid) return;

    try {
      setIsSubmittingPwd(true);
      const payload = { CurrentPassword: oldPassword, NewPassword: newPassword, ConfirmPassword: confirmPassword };
      await EmployeeService.alterEmployeePassword(BusinessID, payload);

      notif({ severity: 'success', message: 'Password changed with success!' });
      closePwdDialog();
    } catch (error) {
      const message = error?.response?.data || error?.status || 'N/A';
      console.error('Error while changing the password:', error);
      notif({ severity: 'error', message: `Error while changing the password. ${message}` });
    } finally {
      setIsSubmittingPwd(false);
    }
  };
   return (
    <Box sx={{ minHeight: '100vh', width: '100%', bgcolor: '#fff' }}>
      <HeaderBar />

      <Stack alignItems="center" sx={{ mt: { xs: 1, md: 2 }, mb: { xs: 1, md: 2 } }}>
        <Typography variant="h5" sx={{ opacity: 0.85 }}>
          Profile
        </Typography>

        <Stack direction="row" spacing={1.5} sx={{ mt: 1 }}>
          {!isEditMode ? (
            <Tooltip title="Edit Profile">
              <span>
                <Button
                  variant="outlined"
                  startIcon={<EditIcon />}
                  onClick={enterEditMode}
                >
                  Edit Profile
                </Button>
              </span>
            </Tooltip>
          ) : (
            <>
              <Button variant="text" onClick={cancelEdit}>Cancel</Button>
              <Button
                variant="contained"
                onClick={saveProfile}
                disabled={isSavingProfile}
                startIcon={isSavingProfile ? <CircularProgress size={18} color="inherit" /> : <EditIcon />}
              >
                Save Changes
              </Button>
            </>
          )}
        </Stack>
      </Stack>
      <Stack alignItems="center" sx={{ mb: { xs: 2, md: 3 } }}>
        <Avatar sx={{ width: { xs: 110, md: 125 }, height: { xs: 110, md: 125 } }}>
          <PersonIcon sx={{ fontSize: { xs: 52, md: 66 } }} />
        </Avatar>
      </Stack>

      <Container maxWidth="md" sx={{ pb: { xs: 5, md: 7 } }}>
        <Stack alignItems="center" spacing={2}>
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
                  type="text"
                  fullWidth
                  size="small"
                  autoComplete="off"
                  value={formData.FirstName}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, FirstName: e.target.value }))
                  }
                  error={updateProfileError.FirstName}
                  helperText={updateProfileError.FirstName}
                />
              ) : (
                <Stack direction="row" spacing={1.25} alignItems="center" justifyContent="center">                 
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
                  type="text"
                  fullWidth
                  size="small"
                  autoComplete="off"
                  value={formData.MiddleName}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, MiddleName: e.target.value }))
                  }
                  error={updateProfileError.MiddleName}
                  helperText={updateProfileError.MiddleName}
                />
              ) : (
                <Stack direction="row" spacing={1.25} alignItems="center" justifyContent="center">
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
                  type="text"
                  fullWidth
                  size="small"
                  autoComplete="off"
                  value={formData.LastName}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, LastName: e.target.value }))
                  }
                  error={updateProfileError.LastName}
                  helperText={updateProfileError.LastName}
                />
              ) : (
                <Stack direction="row" spacing={1.25} alignItems="center" justifyContent="center">
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
            <FieldCard>
              <Stack direction="row" spacing={1.25} alignItems="center" justifyContent="center">
                <WorkIcon />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {profileInfo?.JobTitle || ''}
                </Typography>
              </Stack>
            </FieldCard>
 
            <FieldCard>
              <Stack direction="row" spacing={1.25} alignItems="center" justifyContent="center">
                <ApartmentIcon />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {profileInfo?.Department || ''}
                </Typography>
              </Stack>
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
                  autoComplete="off"
                  value={formData.Email}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, Email: e.target.value }))
                  }
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon sx={{ color: 'text.secondary' }} />
                      </InputAdornment>
                    )
                  }}
                  error={updateProfileError.Email}
                  helperText={updateProfileError.Email}
                />
              ) : (
                <Stack direction="row" spacing={1.5} alignItems="center" justifyContent="center">
                  <EmailIcon />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {profileInfo?.Email || ''}
                  </Typography>
                </Stack>
              )}
            </FieldCard>
          </Box>

          {/* Alterar Password */}
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
              Change Password
            </Button>
          </Stack>
        </Stack>
      </Container>
      <Dialog open={isPwdDialogOpen} onClose={closePwdDialog} fullWidth maxWidth="xs">
        <DialogTitle>Change Password</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Current Password"
              type="password"
              fullWidth
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              autoComplete="current-password"
              error={updatePwdError.OldPassword}
              helperText={updatePwdError.OldPassword}
            />
            <TextField
              label="New password"
              type="password"
              fullWidth
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              autoComplete="new-password"
              error={updatePwdError.NewPassword}
              helperText={updatePwdError.NewPassword}
            />
            <TextField
              label="Confirm the password"
              type="password"
              fullWidth
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
              error={updatePwdError.ConfirmPassword}
              helperText={updatePwdError.ConfirmPassword}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={closePwdDialog} disabled={isSubmittingPwd}>Cancel</Button>
          <Button
            onClick={handleChangePassword}
            variant="contained"
            disabled={isSubmittingPwd}
            startIcon={isSubmittingPwd ? <CircularProgress size={18} color="inherit" /> : <KeyIcon />}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}