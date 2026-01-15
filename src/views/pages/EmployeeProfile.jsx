import { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Avatar,
  Tooltip,
  Button,
  Stack,
  CircularProgress,
  Grid,
  Paper,
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
import FormPopup from '../components/ui/popups/FormPopup';
import useNotification from '../../utils/UseNotification';

const NAME_CARD_W = 260;
const INFO_CARD_W = 540;

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
    setUpdateProfileError({"FirstName": "", "LastName": "", "Email": ""});
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
      UserSession.verifyAuthorize(navigate, status);
      if (status === 409) {
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
    setUpdatePwdError({"OldPassword": "", "NewPassword": "", "ConfirmPassword": ""});
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
      notif({ severity: 'error', message: `Error while changing the password. ${message}` });
    } finally {
      setIsSubmittingPwd(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', width: '100%', bgcolor: '#fff' }}>
      <HeaderBar />
    <Box sx={{ bgcolor: '#FFF4E6', minHeight: 'calc(100vh - 64px)' }}>
        <Stack alignItems="center" sx={{ pt: { xs: 2, md: 3 }, pb: { xs: 1, md: 2 } }}>
          <Typography variant="h5" sx={{ color: '#000', fontWeight: 700 }}>
            Profile
          </Typography>
        </Stack>

        <Container maxWidth="lg" sx={{ pb: { xs: 5, md: 7 } }}>
          <Paper elevation={1} sx={{ p: { xs: 2.5, md: 3.5 }, borderRadius: 3, bgcolor: '#fff' }}>
            <Stack alignItems="center" spacing={2} sx={{ mb: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'text.primary' }}>
                Account and Payment Stats
              </Typography>
              <Avatar sx={{ width: 120, height: 120 }}>
                <PersonIcon sx={{ fontSize: 58 }} />
              </Avatar>
            </Stack>
            <Grid container spacing={1.25} justifyContent="center" sx={{ mb: 2 }}>
              <Grid item xs={12}>
                <ProfileFieldCard
                  label="First Name"
                  isEdit={isEditMode}
                  icon={<PersonIcon />}
                  width={NAME_CARD_W}
                  value={formData.FirstName}
                  onChange={(v) => setFormData((prev) => ({ ...prev, FirstName: v }))}
                  helperText={updateProfileError.FirstName}
                  type="text"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <ProfileFieldCard
                  label="Middle Name"
                  isEdit={isEditMode}
                  width={NAME_CARD_W}
                  value={formData.MiddleName}
                  onChange={(v) => setFormData((prev) => ({ ...prev, MiddleName: v }))}
                  type="text"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <ProfileFieldCard
                  label="Last Name"
                  isEdit={isEditMode}
                  width={NAME_CARD_W}
                  value={formData.LastName}
                  onChange={(v) => setFormData((prev) => ({ ...prev, LastName: v }))}
                  helperText={updateProfileError.LastName}
                  type="text"
                />
              </Grid>
            </Grid>

            <Stack spacing={1.25} alignItems="center">
              <ProfileFieldCard
                label="Department"
                value={profileInfo?.Department || ''}
                isEdit={false}
                icon={<ApartmentIcon />}
                width={INFO_CARD_W}
                type="text"
              />

              <ProfileFieldCard
                label="Job Title"
                value={profileInfo?.JobTitle || ''}
                isEdit={false}
                icon={<WorkIcon />}
                width={INFO_CARD_W}
                type="text"
              />

              <ProfileFieldCard
                label="Email"
                value={formData.Email}
                onChange={(v) => setFormData((prev) => ({ ...prev, Email: v }))}
                isEdit={isEditMode}
                icon={<EmailIcon />}
                width={INFO_CARD_W}
                type="email"
                helperText={updateProfileError.Email}
              />
            </Stack>

            <Stack spacing={1.1} alignItems="center" sx={{ mt: 2 }}>
              {!isEditMode ? (
                <>
                  <Tooltip title="Edit Profile">
                    <span>
                      <Button
                        variant="contained"
                        startIcon={<EditIcon />}
                        onClick={enterEditMode}
                        sx={{ bgcolor: '#000', color: '#fff', '&:hover': { bgcolor: '#222' }, width: INFO_CARD_W }}
                      >
                        Edit Profile
                      </Button>
                    </span>
                  </Tooltip>

                  <Button
                    variant="contained"
                    startIcon={<KeyIcon sx={{ fontSize: 20 }} />}
                    sx={{ bgcolor: '#000', color: '#fff', '&:hover': { bgcolor: '#222' }, width: INFO_CARD_W }}
                    onClick={openPwdDialog}
                  >
                    Change Password
                  </Button>
                </>
              ) : (
                <>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ width: INFO_CARD_W }}>
                    <Button variant="text" onClick={cancelEdit} fullWidth>
                      Cancel
                    </Button>
                    <Button
                      variant="contained"
                      onClick={saveProfile}
                      disabled={isSavingProfile}
                      startIcon={isSavingProfile ? <CircularProgress size={18} color="inherit" /> : <EditIcon />}
                      sx={{ bgcolor: '#000', color: '#fff', '&:hover': { bgcolor: '#222' } }}
                      fullWidth
                    >
                      Save Changes
                    </Button>
                  </Stack>

                  <Button
                    variant="contained"
                    startIcon={<KeyIcon sx={{ fontSize: 20 }} />}
                    sx={{ bgcolor: '#000', color: '#fff', '&:hover': { bgcolor: '#222' }, width: INFO_CARD_W }}
                    onClick={openPwdDialog}
                  >
                    Change Password
                  </Button>
                </>
              )}
            </Stack>
          </Paper>
        </Container>
      </Box>

      <FormPopup
        open={isPwdDialogOpen}
        title="Change Password"
        fields={[
          { type: 'password', label: 'Current Password', value: oldPassword, onChange: setOldPassword, error: updatePwdError.OldPassword },
          { type: 'password', label: 'New password', value: newPassword, onChange: setNewPassword, error: updatePwdError.NewPassword },
          { type: 'password', label: 'Confirm the password', value: confirmPassword, onChange: setConfirmPassword, error: updatePwdError.ConfirmPassword },
        ]}
        onCancel={closePwdDialog}
        onSubmit={handleChangePassword}
        submitLabel={isSubmittingPwd ? 'Saving...' : 'Save'}
        submitDisabled={isSubmittingPwd}
        submitSx={{ bgcolor: '#000', color: '#fff', '&:hover': { bgcolor: '#222' } }}
      />
    </Box>
  );
}
