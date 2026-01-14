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
import useNotification from '../../utils/UseNotification';

import ProfileFieldCard from '../components/ui/ProfileFieldCard';
import FormPopup from '../components/ui/popups/FormPopup';

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
            <ProfileFieldCard
              label="First Name"
              isEdit={isEditMode}
              icon={<PersonIcon />}
              width={CARD_W}
              value={formData.FirstName}
              onChange={(v) => setFormData((prev) => ({ ...prev, FirstName: v }))}
              helperText={updateProfileError.FirstName}
            />
            {/* MiddleName */}
            <ProfileFieldCard
              label="Middle Name"
              isEdit={isEditMode}
              width={CARD_W}
              value={formData.MiddleName}
              onChange={(v) => setFormData((prev) => ({ ...prev, MiddleName: v }))}
              helperText={updateProfileError.MiddleName}
            />
            {/* LastName */}
            <ProfileFieldCard
              label="Last Name"
              isEdit={isEditMode}
              width={CARD_W}
              value={formData.LastName}
              onChange={(v) => setFormData((prev) => ({ ...prev, LastName: v }))}
              helperText={updateProfileError.LastName}
            />
          </Box>

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
              helperText={updateProfileError.Email}
            />
          </Box>

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
