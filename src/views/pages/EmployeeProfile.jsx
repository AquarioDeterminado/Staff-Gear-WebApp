import { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Avatar,
  Tooltip,
  Button,
  Stack,
  TextField,
  Dialog,
  Snackbar,
  Alert,
  CircularProgress,
} from '@mui/material';

import EditIcon from '@mui/icons-material/Edit';
import EmailIcon from '@mui/icons-material/Email';
import WorkIcon from '@mui/icons-material/Work';
import ApartmentIcon from '@mui/icons-material/Apartment';
import PersonIcon from '@mui/icons-material/Person';
import KeyIcon from '@mui/icons-material/Key';

import HeaderBar from '../components/layout/HeaderBar';
import { useNavigate } from 'react-router-dom';
import EmployeeService from '../../services/EmployeeService';
import UserSession from '../../utils/UserSession';
import ErrorHandler from '../../utils/ErrorHandler';

import ProfileFieldCard from '../components/ui/ProfileFieldCard';
import FormDialog from '../components/ui/FormDialog';

const CARD_W = 280;
const EMAIL_W = 360;

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

  const [isPwdDialogOpen, setIsPwdDialogOpen] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmittingPwd, setIsSubmittingPwd] = useState(false);

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
        setSnackbar({ open: true, severity: 'error', message: 'Error while loading the profile.' });
      }
    }

    GetEmployeeInfo();
  }, [BusinessID, navigate]);

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
    if (!formData.FirstName?.trim() || !formData.LastName?.trim() || !formData.Email?.trim()) {
      setSnackbar({ open: true, severity: 'warning', message: 'First name, last name and email are mandatory.' });
      return false;
    }
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.Email);
    if (!emailOk) {
      setSnackbar({ open: true, severity: 'warning', message: 'Insert a valid email.' });
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
        Email: formData.Email
      };

      await EmployeeService.updateEmployee(BusinessID, payload);

      setProfileInfo((prev) => ({ ...(prev || {}), ...payload }));
      setIsEditMode(false);
      setSnackbar({ open: true, severity: 'success', message: 'Profile updated with success!' });
    } catch (error) {
      const status = error?.response?.status || error?.status || 'N/A';
      console.error('Error while updating the profile:', error);
      UserSession.verifyAuthorize(navigate, status);
      if(status === 409) {
        const data = error?.response?.data;
        const conflictMsg = (data && (data.message || data.detail)) || 'Email already in use';
        setSnackbar({ open: true, severity: 'error', message: conflictMsg });
      }
      else{
        const msg = ErrorHandler(error);
        setSnackbar({ open: true, severity: 'error', message: msg });
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
    if (!oldPassword || !newPassword || !confirmPassword) {
      setSnackbar({ open: true, severity: 'warning', message: 'Fill all the password fields.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setSnackbar({ open: true, severity: 'warning', message: 'The confirmation isnt the same as the new password.' });
      return;
    }

    try {
      setIsSubmittingPwd(true);
      const payload = { CurrentPassword: oldPassword, NewPassword: newPassword, ConfirmPassword: confirmPassword };
      await EmployeeService.alterEmployeePassword(BusinessID, payload);

      setSnackbar({ open: true, severity: 'success', message: 'Password changed with success!' });
      closePwdDialog();
    } catch (error) {
      const message = error?.response?.data || error?.status || 'N/A';
      console.error('Error while changing the password:', error);
      setSnackbar({ open: true, severity: 'error', message: `Error while changing the password. ${message}` });
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
          {/* First/Middle/Last */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: `repeat(3, ${CARD_W}px)`,
              justifyContent: 'center',
              gap: 1
            }}
          >
            <ProfileFieldCard
              label="First Name"
              value={formData.FirstName}
              onChange={(v) => setFormData((prev) => ({ ...prev, FirstName: v }))}
              isEdit={isEditMode}
            />

            <ProfileFieldCard
              label="Middle Name"
              value={formData.MiddleName}
              onChange={(v) => setFormData((prev) => ({ ...prev, MiddleName: v }))}
              isEdit={isEditMode}
            />

            <ProfileFieldCard
              label="Last Name"
              value={formData.LastName}
              onChange={(v) => setFormData((prev) => ({ ...prev, LastName: v }))}
              isEdit={isEditMode}
            />
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
            <ProfileFieldCard
              label="Job Title"
              value={profileInfo?.JobTitle || ''}
              isEdit={false}
              icon={<WorkIcon />}
            />

            <ProfileFieldCard
              label="Department"
              value={profileInfo?.Department || ''}
              isEdit={false}
              icon={<ApartmentIcon />}
            />
          </Box>

          {/* Email */}
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <ProfileFieldCard
              label="Email"
              value={formData.Email}
              onChange={(v) => setFormData((prev) => ({ ...prev, Email: v }))}
              isEdit={isEditMode}
              icon={<EmailIcon />}
              width={EMAIL_W}
              type="email"
              startAdornment={<EmailIcon sx={{ color: 'text.secondary' }} />}
            />
          </Box>

          {/* Change Password */}
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
              onClick={() => setIsPwdDialogOpen(true)}
            >
              Change Password
            </Button>
          </Stack>
        </Stack>
      </Container>

      {/* Change Password Dialog via FormDialog */}
      <FormDialog
        open={isPwdDialogOpen}
        title="Change Password"
        fields={[
          { type: 'password', label: 'Current Password', value: oldPassword, onChange: setOldPassword },
          { type: 'password', label: 'New password', value: newPassword, onChange: setNewPassword },
          { type: 'password', label: 'Confirm the password', value: confirmPassword, onChange: setConfirmPassword },
        ]}
        onCancel={closePwdDialog}
        onSubmit={handleChangePassword}
        submitLabel={isSubmittingPwd ? 'Saving...' : 'Save'}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
