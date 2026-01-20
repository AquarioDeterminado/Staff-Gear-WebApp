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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';

import EditIcon from '@mui/icons-material/Edit';
import EmailIcon from '@mui/icons-material/Email';
import WorkIcon from '@mui/icons-material/Work';
import ApartmentIcon from '@mui/icons-material/Apartment';
import PersonIcon from '@mui/icons-material/Person';
import KeyIcon from '@mui/icons-material/Key';
import AddIcon from '@mui/icons-material/Add';
import HeaderBar from '../components/layout/HeaderBar';
import { useNavigate } from 'react-router-dom';
import EmployeeService from '../../services/EmployeeService';
import UserSession from '../../utils/UserSession';
import ErrorHandler from '../../utils/ErrorHandler';
import ProfileFieldCard from '../components/ui/ProfileFieldCard';
import FormPopup from '../components/ui/popups/FormPopup';
import useNotification from '../../utils/UseNotification';
import DashboardComponent from '../components/DashboardComponent';

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
  
  const [isUploadPhotoDialogOpen, setIsUploadPhotoDialogOpen] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [profilePhotoUrl, setProfilePhotoUrl] = useState(() => {
    // Initialize from localStorage
    return localStorage.getItem('profilePhotoUrl') || null;
  });
  const [tempProfilePhotoUrl, setTempProfilePhotoUrl] = useState(null);
  const [selectedPhotoFile, setSelectedPhotoFile] = useState(null);
  
  const notif = useNotification();

  // Listen for profile photo updates from HeaderBar or other components
  useEffect(() => {
    const handleProfilePhotoUpdated = (event) => {
      if (event.detail?.profilePhoto) {
        setProfilePhotoUrl(event.detail.profilePhoto);
      }
    };
    
    window.addEventListener('profilePhotoUpdated', handleProfilePhotoUpdated);
    return () => window.removeEventListener('profilePhotoUpdated', handleProfilePhotoUpdated);
  }, []);

  // Listen for storage changes to sync profile photo updates from other tabs
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'profilePhotoUrl' && e.newValue) {
        setProfilePhotoUrl(e.newValue);
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  useEffect(() => {
    if (!BusinessID) {
      navigate('/');
      return;
    }

    async function GetEmployeeInfo() {
      try {
        const info = await EmployeeService.getEmployee(BusinessID);
        setProfileInfo(info);
        
        // Set profile photo from employee data
        if (info?.ProfilePhoto) {
          setProfilePhotoUrl(info.ProfilePhoto);
          localStorage.setItem('profilePhotoUrl', info.ProfilePhoto);
        }

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
    setTempProfilePhotoUrl(null);
    setSelectedPhotoFile(null);
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
      
      if (tempProfilePhotoUrl) {
        setProfilePhotoUrl(tempProfilePhotoUrl);
        setProfileInfo(prev => ({ ...prev, ProfilePhoto: tempProfilePhotoUrl }));
        localStorage.setItem('profilePhotoUrl', tempProfilePhotoUrl);
        
        window.dispatchEvent(new CustomEvent('profilePhotoUpdated', { 
          detail: { profilePhoto: tempProfilePhotoUrl } 
        }));
        
        setTempProfilePhotoUrl(null);
      }
      
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

  // Photo Upload
  const openUploadPhotoDialog = () => setIsUploadPhotoDialogOpen(true);
  const closeUploadPhotoDialog = () => {
    setIsUploadPhotoDialogOpen(false);
    setSelectedPhotoFile(null);
  };

  const handlePhotoFileSelect = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedPhotoFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setTempProfilePhotoUrl(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadPhoto = async () => {
    if (!selectedPhotoFile) {
      notif({ severity: 'warning', message: 'Please select a photo to upload.' });
      return;
    }

    try {
      setIsUploadingPhoto(true);
      const response = await EmployeeService.uploadProfilePhoto(BusinessID, selectedPhotoFile);
      
      if (response?.profilePhoto) {
        const photoUrl = response.profilePhoto;
        
        // Store the new photo URL temporarily (not persisted yet)
        setTempProfilePhotoUrl(photoUrl);
        
        notif({ severity: 'success', message: 'Photo selected. Click Save Changes to confirm.' });
      }
      
      closeUploadPhotoDialog();
    } catch (error) {
      const msg = ErrorHandler(error);
      notif({ severity: 'error', message: msg || 'Error uploading profile photo.' });
      setTempProfilePhotoUrl(null);
    } finally {
      setIsUploadingPhoto(false);
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
    <Box sx={{ minHeight: '100vh', width: '100%', bgcolor: '#f5f5f5' }}>
      <HeaderBar />
    <Box sx={{ bgcolor: '#f5f5f5', minHeight: 'calc(100vh - 64px)' }}>
        <Stack alignItems="center" sx={{ pt: { xs: 2, md: 3 }, pb: { xs: 1, md: 2 } }}>
          <Typography variant="h5" sx={{ color: '#000', fontWeight: 700 }}>
            Profile
          </Typography>
        </Stack>

        <Container maxWidth="lg" sx={{ pb: { xs: 5, md: 7 } }}>
          <Paper elevation={1} sx={{ p: { xs: 2.5, md: 3.5 }, borderRadius: 3, bgcolor: '#fff' }}>
            <Stack alignItems="center" spacing={2} sx={{ mb: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'text.primary' }}>
                Account Information
              </Typography>
            </Stack>

            <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} sx={{ alignItems: 'flex-start' }}>
              {/* Left: Avatar */}
              <Stack alignItems="center" sx={{ minWidth: 200 }}>
                <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                  <Avatar 
                    sx={{ width: 180, height: 180 }}
                    src={tempProfilePhotoUrl || profilePhotoUrl}
                  >
                    {!tempProfilePhotoUrl && !profilePhotoUrl && <PersonIcon sx={{ fontSize: 80 }} />}
                  </Avatar>
                  {isEditMode && (
                    <Tooltip title="Upload Profile Photo">
                      <Button
                        onClick={openUploadPhotoDialog}
                        sx={{
                          position: 'absolute',
                          bottom: 0,
                          right: 0,
                          minWidth: 'auto',
                          width: 48,
                          height: 48,
                          borderRadius: '50%',
                          bgcolor: '#000',
                          color: '#fff',
                          padding: 0,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          '&:hover': { bgcolor: '#222' }
                        }}
                      >
                        <AddIcon sx={{ fontSize: 24 }} />
                      </Button>
                    </Tooltip>
                  )}
                </Box>
              </Stack>

              {/* Right: Form Fields */}
              <Box sx={{ flex: 1 }}>
                <Grid container spacing={2}>
                  {/* First Row */}
                  <Grid item xs={12} sm={4}>
                    <Stack alignItems="center">
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
                    </Stack>
                  </Grid>

                  <Grid item xs={12} sm={4}>
                    <Stack alignItems="center">
                      <ProfileFieldCard
                        label="Middle Name"
                        isEdit={isEditMode}
                        width={NAME_CARD_W}
                        value={formData.MiddleName}
                        onChange={(v) => setFormData((prev) => ({ ...prev, MiddleName: v }))}
                        type="text"
                      />
                    </Stack>
                  </Grid>

                  <Grid item xs={12} sm={4}>
                    <Stack alignItems="center">
                      <ProfileFieldCard
                        label="Last Name"
                        isEdit={isEditMode}
                        width={NAME_CARD_W}
                        value={formData.LastName}
                        onChange={(v) => setFormData((prev) => ({ ...prev, LastName: v }))}
                        helperText={updateProfileError.LastName}
                        type="text"
                      />
                    </Stack>
                  </Grid>

                  {/* Second Row */}
                  <Grid item xs={12} sm={4}>
                    <Stack alignItems="center">
                      <ProfileFieldCard
                        label="Email"
                        value={formData.Email}
                        onChange={(v) => setFormData((prev) => ({ ...prev, Email: v }))}
                        isEdit={isEditMode}
                        icon={<EmailIcon />}
                        width={NAME_CARD_W}
                        type="email"
                        helperText={updateProfileError.Email}
                      />
                    </Stack>
                  </Grid>

                  <Grid item xs={12} sm={4}>
                    <Stack alignItems="center">
                      <ProfileFieldCard
                        label="Department"
                        value={profileInfo?.Department || ''}
                        isEdit={false}
                        icon={<ApartmentIcon />}
                        width={NAME_CARD_W}
                        type="text"
                      />
                    </Stack>
                  </Grid>

                  <Grid item xs={12} sm={4}>
                    <Stack alignItems="center">
                      <ProfileFieldCard
                        label="Job Title"
                        value={profileInfo?.JobTitle || ''}
                        isEdit={false}
                        icon={<WorkIcon />}
                        width={NAME_CARD_W}
                        type="text"
                      />
                    </Stack>
                  </Grid>

                  {/* Buttons Row */}
                  <Grid item xs={12} sm={4}></Grid>
                  <Grid item xs={12} sm={4}>
                    {!isEditMode ? (
                      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ width: '100%', justifyContent: 'center', alignItems: 'center' }}>
                        <Tooltip title="Edit Profile">
                          <span>
                            <Button
                              variant="contained"
                              startIcon={<EditIcon />}
                              onClick={enterEditMode}
                              sx={{ bgcolor: '#000', color: '#fff', '&:hover': { bgcolor: '#222' }, width: 260 }}
                            >
                              Edit Profile
                            </Button>
                          </span>
                        </Tooltip>

                        <Button
                          variant="contained"
                          startIcon={<KeyIcon sx={{ fontSize: 20 }} />}
                          sx={{ bgcolor: '#000', color: '#fff', '&:hover': { bgcolor: '#222' }, width: 260 }}
                          onClick={openPwdDialog}
                        >
                          Change Password
                        </Button>
                      </Stack>
                    ) : (
                      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ width: '100%', justifyContent: 'center', alignItems: 'center' }}>
                        <Button variant="text" onClick={cancelEdit} sx={{ width: 260 }}>
                          Cancel
                        </Button>
                        <Button
                          variant="contained"
                          onClick={saveProfile}
                          disabled={isSavingProfile}
                          startIcon={isSavingProfile ? <CircularProgress size={18} color="inherit" /> : <EditIcon />}
                          sx={{ bgcolor: '#000', color: '#fff', '&:hover': { bgcolor: '#222' }, width: 260 }}
                        >
                          Save Changes
                        </Button>
                        <Button
                          variant="contained"
                          startIcon={<KeyIcon sx={{ fontSize: 20 }} />}
                          sx={{ bgcolor: '#000', color: '#fff', '&:hover': { bgcolor: '#222' }, width: 260 }}
                          onClick={openPwdDialog}
                        >
                          Change Password
                        </Button>
                      </Stack>
                    )}
                  </Grid>
                  <Grid item xs={12} sm={4}></Grid>
                </Grid>
              </Box>
            </Stack>

          </Paper>

          {/* Dashboard Component */}
          <Paper elevation={1} sx={{ p: { xs: 2.5, md: 3.5 }, borderRadius: 3, bgcolor: '#fff', mt: 4 }}>
            <Stack alignItems="center" spacing={2} sx={{ mb: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'text.primary' }}>
                Payment & Department Stats
              </Typography>
            </Stack>
            <DashboardComponent />
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

      <Dialog open={isUploadPhotoDialogOpen} onClose={closeUploadPhotoDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Upload Profile Photo</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Stack spacing={2}>
            <Typography variant="body2" color="textSecondary">
              Select a photo to upload (JPEG, PNG, GIF, WebP - Max 5MB)
            </Typography>
            <Button
              variant="outlined"
              onClick={() => document.getElementById('photo-input').click()}
              sx={{ textTransform: 'none', fontWeight: 600 }}
            >
              Select Photo
            </Button>
            <input
              id="photo-input"
              type="file"
              accept="image/*"
              onChange={handlePhotoFileSelect}
              style={{ display: 'none' }}
            />
            {selectedPhotoFile && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="caption" color="textSecondary">
                  Selected: {selectedPhotoFile.name} ({(selectedPhotoFile.size / 1024).toFixed(2)} KB)
                </Typography>
              </Box>
            )}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            variant="text"
            onClick={() => {
              cancelEdit();
              closeUploadPhotoDialog();
            }}
            sx={{ width: 260 }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleUploadPhoto}
            variant="contained"
            disabled={isUploadingPhoto || !selectedPhotoFile}
            startIcon={isUploadingPhoto ? <CircularProgress size={18} color="inherit" /> : undefined}
            sx={{ bgcolor: '#000', color: '#fff', '&:hover': { bgcolor: '#222' } }}
          >
            {isUploadingPhoto ? 'Uploading...' : 'Upload'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
