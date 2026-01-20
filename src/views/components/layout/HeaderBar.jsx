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
  ListItemText
} from '@mui/material';

import LogoutIcon from '@mui/icons-material/Logout';
import NotificationsIcon from '@mui/icons-material/Notifications';
import PersonIcon from '@mui/icons-material/Person';
import NoticationService from '../../../services/NotificationService';
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
  const notifOpen = Boolean(anchorNotif);

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
    } catch (error) {
      console.error('Error dismissing notification:', error);
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

                <IconButton onClick={() => navigate('/profile')} aria-label="profile">
                  <Avatar sx={{ bgcolor: '#607d8b' }}>
                    <PersonIcon />
                  </Avatar>
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
        >
          {notifications.length > 0 ? (
            notifications.map((n) => (
              <MenuItem key={n.NotificationID} divider>
                <ListItemText
                  primary={n.Message}
                  secondary={new Date(n.CreatedAt).toLocaleString('fr-FR')}
                  sx={{ mr: 2 }}
                  onClick={() => {
                    sendToPage(n.Message);
                  }}
                />
                <Button
                  size="small"
                  color="error"
                  onClick={() => handleDismissNotification(n.NotificationID)}
                  sx={{ textTransform: 'none', fontWeight: 700, minWidth: 0, px: 0.75 }}
                >
                  X
                </Button>
              </MenuItem>
            ))
          ) : (
            <MenuItem disabled>
              <ListItemText primary="No notifications." />
            </MenuItem>
          )}
        </Menu>
      )}
    </>
  );
}
