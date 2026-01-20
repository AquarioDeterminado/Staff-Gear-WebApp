import { useEffect, useState } from 'react';
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Box,
  Button,
  Badge,
  Avatar,
  Menu,
  MenuItem,
  ListItemText,
  Checkbox,
  Divider,
  CircularProgress
} from '@mui/material';

import LogoutIcon from '@mui/icons-material/Logout';
import NotificationsIcon from '@mui/icons-material/Notifications';
import PersonIcon from '@mui/icons-material/Person';
import DeleteIcon from '@mui/icons-material/Delete';
import NoticationService from '../../../services/NotificationService';
import EmployeeService from '../../../services/EmployeeService';
import { useNavigate } from 'react-router-dom';
import AuthService from '../../../services/AuthService';
import SideMenu from './SideMenu';
import logo from '../../../assets/logo.png';

export default function HeaderBar() {
  const navigate = useNavigate();
  const BusinessId = localStorage.getItem('BusinessID');
  const isAuthenticated = !!localStorage.getItem('access_token');

  const [notifications, setNotifications] = useState([]);
  const [anchorNotif, setAnchorNotif] = useState(null);
  const [selectedNotifications, setSelectedNotifications] = useState(new Set());
  const [profilePhotoUrl, setProfilePhotoUrl] = useState(null);
  const [isLoadingPhoto, setIsLoadingPhoto] = useState(false);
  const notifOpen = Boolean(anchorNotif);

  useEffect(() => {
    // Load profile photo from localStorage
    const savedPhoto = localStorage.getItem('profilePhotoUrl');
    if (savedPhoto) {
      setProfilePhotoUrl(savedPhoto);
    }
  }, []);

  // Load profile photo if authenticated but not yet loaded
  useEffect(() => {
    async function loadProfilePhoto() {
      if (isAuthenticated && BusinessId && !profilePhotoUrl) {
        try {
          setIsLoadingPhoto(true);
          const employeeData = await EmployeeService.getEmployee(BusinessId);
          if (employeeData?.ProfilePhoto) {
            setProfilePhotoUrl(employeeData.ProfilePhoto);
            localStorage.setItem('profilePhotoUrl', employeeData.ProfilePhoto);
          }
        } catch (error) {
          console.error('Error loading profile photo:', error);
        } finally {
          setIsLoadingPhoto(false);
        }
      }
    }

    loadProfilePhoto();
  }, [isAuthenticated, BusinessId, profilePhotoUrl]);

  // Listen for profile photo updates
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
    async function fetchNotifications() {
      try {
        if (isAuthenticated) {
          const notifs = await NoticationService.getAllNotifications(BusinessId);
          setNotifications(Array.isArray(notifs) ? notifs : []);
        }
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    }
    fetchNotifications();
  }, [isAuthenticated, BusinessId]);

  function handleDismissNotification(id) {
    try {
      NoticationService.deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n.NotificationID !== id));
      setSelectedNotifications((prev) => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    } catch (error) {
      console.error('Error dismissing notification:', error);
    }
  }

  function handleToggleSelection(id) {
    setSelectedNotifications((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }

  function handleDeleteSelected() {
    if (selectedNotifications.size === 0) return;

    const notificationIds = Array.from(selectedNotifications);
    try {
      NoticationService.deleteMultipleNotifications(notificationIds);
      setNotifications((prev) =>
        prev.filter((n) => !selectedNotifications.has(n.NotificationID))
      );
      setSelectedNotifications(new Set());
    } catch (error) {
      console.error('Error deleting selected notifications:', error);
    }
  }

  function handleSelectAll() {
    if (selectedNotifications.size === notifications.length) {
      setSelectedNotifications(new Set());
    } else {
      const allIds = new Set(notifications.map((n) => n.NotificationID));
      setSelectedNotifications(allIds);
    }
  }

  function sendToPage(message) {
    if (
      message.includes('New Payment History Added') ||
      message.includes('New Department Movement Added') ||
      message.includes('Payment History Deleted') ||
      message.includes('Department Movement Deleted') ||
      message.includes('Payment History Updated') ||
      message.includes('Department Movement Updated')
    ) {
      navigate('/records');
    } else if (message.includes('has updated their information')) {
      navigate('/employees');
    } else if (message.includes('New candidate applied')) {
      navigate('/candidates');
    }
  }

  return (
    <>
      <AppBar position="static" sx={{ bgcolor: '#fff3e0', borderBottom: '0.1px solid #000000ff', boxShadow: '0 2px 8px rgba(255, 152, 0, 0.08)', elevation: 0 }}>
        <Toolbar
          sx={{
            position: 'relative',
            px: { xs: 2, md: 3 },
            minHeight: 64,
          }}
        >
          {isAuthenticated && (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <SideMenu />
            </Box>
          )}

          <Box
            sx={{
              position: 'absolute',
              left: '50%',
              transform: 'translateX(-50%)',
              pointerEvents: 'none',
            }}
          >
            <Box
              component="img"
              src={logo}
              alt="Staff Gear"
              sx={{
                height: 50,
                objectFit: 'contain',
                display: 'block',
                cursor: 'pointer',
              }}
              onClick={() => navigate('/')}
            />
          </Box>

          <Box sx={{ display: 'flex', color: '#FFF4E6', alignItems: 'center', gap: 1.5, marginLeft: 'auto' }}>
            {isAuthenticated ? (
              <>
                <IconButton onClick={(e) => setAnchorNotif(e.currentTarget)} aria-label="notifications">
                  <Badge badgeContent={notifications.length} color="error">
                    <NotificationsIcon sx={{ fontSize: 26 }} />
                  </Badge>
                </IconButton>

                <Button
                  variant="contained"
                  sx={{
                    bgcolor: '#ff9800',
                    color: '#fff',
                    textTransform: 'none',
                    fontWeight: 700,
                    px: 2,
                    '&:hover': { bgcolor: '#e68a00' }
                  }}
                  onClick={() => navigate('/job-listings')}
                >
                  Apply Now!
                </Button>

                <Button
                  variant="contained"
                  startIcon={<LogoutIcon />}
                  sx={{
                    bgcolor: '#000',
                    color: '#fff',
                    textTransform: 'none',
                    fontWeight: 700,
                    px: 2,
                    '&:hover': { bgcolor: '#222' }
                  }}
                  onClick={() => {
                    AuthService.logout();
                    navigate('/');
                  }}
                >
                  Log out
                </Button>

                <IconButton onClick={() => navigate('/profile')} aria-label="profile" disabled={isLoadingPhoto}>
                  <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Avatar sx={{ bgcolor: '#607d8b' }} src={profilePhotoUrl}>
                      {!profilePhotoUrl && !isLoadingPhoto && <PersonIcon />}
                    </Avatar>
                    {isLoadingPhoto && (
                      <CircularProgress 
                        size={40} 
                        sx={{ 
                          position: 'absolute',
                          color: '#ff9800'
                        }} 
                      />
                    )}
                  </Box>
                </IconButton>
              </>
            ) : (
              <>
                <Button
                  variant="text"
                  sx={{
                    color: '#000',
                    textTransform: 'none',
                    fontWeight: 700,
                    px: 2,
                    '&:hover': { bgcolor: '#f5f5f5' }
                  }}
                  onClick={() => {
                    sessionStorage.removeItem('last_non_login_path');
                    navigate('/');
                  }}
                >
                  Home
                </Button>

                <Button
                  variant="contained"
                  sx={{
                    bgcolor: '#ff9800',
                    color: '#fff',
                    textTransform: 'none',
                    fontWeight: 700,
                    px: 2,
                    '&:hover': { bgcolor: '#e68a00' }
                  }}
                  onClick={() => navigate('/job-listings')}
                >
                  Apply Now!
                </Button>

                <Button
                  variant="contained"
                  sx={{
                    bgcolor: '#000',
                    color: '#fff',
                    textTransform: 'none',
                    fontWeight: 700,
                    px: 2,
                    '&:hover': { bgcolor: '#222' }
                  }}
                  onClick={() => navigate('/login')}
                >
                  Login
                </Button>
              </>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      {isAuthenticated && (
        <Menu
          anchorEl={anchorNotif}
          open={notifOpen}
          onClose={() => setAnchorNotif(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          MenuListProps={{ dense: true }}
          slotProps={{
            paper: {
              sx: {
                maxHeight: 400,
                width: '100%',
                maxWidth: 500,
              },
            },
          }}
        >
          {notifications.length > 0
            ? [
                <MenuItem 
                  key="header" 
                  sx={{ 
                    flexDirection: 'column', 
                    alignItems: 'stretch', 
                    p: 1.5,
                    bgcolor: '#fafafa',
                    '&:hover': { bgcolor: '#f5f5f5' }
                  }}
                >
                  <Box sx={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
                      <Checkbox
                        checked={selectedNotifications.size === notifications.length && notifications.length > 0}
                        indeterminate={selectedNotifications.size > 0 && selectedNotifications.size < notifications.length}
                        onChange={handleSelectAll}
                        size="small"
                      />
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                          Select All
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#999' }}>
                          {selectedNotifications.size} of {notifications.length}
                        </Typography>
                      </Box>
                    </Box>

                    <Button
                      size="small"
                      variant="contained"
                      color="error"
                      startIcon={<DeleteIcon />}
                      onClick={handleDeleteSelected}
                      disabled={selectedNotifications.size === 0}
                      sx={{ 
                        textTransform: 'none', 
                        fontWeight: 600,
                        opacity: selectedNotifications.size === 0 ? 0.5 : 1,
                      }}
                    >
                      Delete ({selectedNotifications.size})
                    </Button>
                  </Box>
                </MenuItem>,
                <Divider key="divider" sx={{ my: 0 }} />,
                ...notifications.map((n) => (
                  <MenuItem
                    key={n.NotificationID}
                    divider
                    sx={{
                      bgcolor: selectedNotifications.has(n.NotificationID) ? 'rgba(255, 152, 0, 0.1)' : 'transparent',
                      p: 1,
                      display: 'flex',
                      gap: 1,
                      alignItems: 'flex-start',
                    }}
                  >
                    <Checkbox
                      checked={selectedNotifications.has(n.NotificationID)}
                      onChange={() => handleToggleSelection(n.NotificationID)}
                      size="small"
                      sx={{ mt: 0.5 }}
                    />
                    <Box
                      sx={{ flex: 1, cursor: 'pointer' }}
                      onClick={() => {
                        sendToPage(n.Message);
                        setAnchorNotif(null);
                      }}
                    >
                      <ListItemText
                        primary={n.Message}
                        secondary={new Date(n.CreatedAt).toLocaleString('fr-FR')}
                      />
                    </Box>
                    <Button
                      size="small"
                      color="error"
                      onClick={() => handleDismissNotification(n.NotificationID)}
                      sx={{ textTransform: 'none', fontWeight: 700, minWidth: 0, px: 0.75 }}
                    >
                      X
                    </Button>
                  </MenuItem>
                )),
              ]
            : [
                <MenuItem key="empty" disabled>
                  <ListItemText primary="Without notifications." />
                </MenuItem>,
              ]}
        </Menu>
      )}
    </>
  );
}
