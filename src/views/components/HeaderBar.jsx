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
  Drawer,
  Stack,
  Divider,
  List,
  ListItemButton,
  ListItemIcon
} from '@mui/material';

import MenuIcon from '@mui/icons-material/Menu';
import HomeIcon from '@mui/icons-material/Home';
import LogoutIcon from '@mui/icons-material/Logout';
import NotificationsIcon from '@mui/icons-material/Notifications';
import PersonIcon from '@mui/icons-material/Person';
import HistoryIcon from '@mui/icons-material/History';
import GroupIcon from '@mui/icons-material/Group';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import NoticationService from '../../services/NotificationService';
import { useNavigate } from 'react-router-dom';
import AuthService from '../../services/AuthService';
import SideMenu from './SideMenu';
import logo from '../../assets/logo.png';

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
          var notifs = await NoticationService.getAllNotifications(BusinessId);
          setNotifications(Array.isArray(notifs) ? notifs : []);
          console.log(notifs);
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
    console.log(message);
    if (message.includes('New Payment History Added') || message.includes('New Department Movement Added') || message.includes('Payment History Deleted') || message.includes('Department Movement Deleted') || message.includes('Payment History Updated') || message.includes('Department Movement Updated')) {
      navigate('/records');
    } else if (message.includes('has updated their information')) {
      navigate('/employees');
    } else if (message.includes('New candidate applied')) {
      navigate('/candidates');
    }
  }

  return (
    <>
      <AppBar position="static" color="transparent" elevation={0} sx={{ borderBottom: '0.1px solid #000000ff' }}>
        <Toolbar
          sx={{
            position: 'relative',
            px: { xs: 2, md: 3 },
            minHeight: 64,
          }}
        >
          {/* Hamburguer - Only show when authenticated */}
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

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, marginLeft: 'auto' }}>
            {isAuthenticated ? (
              <>
                {/* Authenticated header: Notifications, Logout, Profile */}
                <IconButton onClick={(e) => setAnchorNotif(e.currentTarget)} aria-label="notificações">
                  <Badge badgeContent={notifications.length} color="error">
                    <NotificationsIcon sx={{ fontSize: 26 }} />
                  </Badge>
                </IconButton>
                
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
                  onClick={() => { AuthService.logout(); navigate('/'); }}
                >
                  Log out
                </Button>

                <IconButton onClick={() => navigate('/profile')} aria-label="perfil">
                  <Avatar sx={{ bgcolor: '#607d8b' }}>
                    <PersonIcon />
                  </Avatar>
                </IconButton>
              </>
            ) : (
              <>
                {/* Public header: Home and Login buttons */}
                <Button
                  variant="text"
                  sx={{
                    color: '#000',
                    textTransform: 'none',
                    fontWeight: 700,
                    px: 2,
                    '&:hover': { bgcolor: '#f5f5f5' }
                  }}
                  onClick={() => navigate('/')}
                >
                  Home
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
                  disabled
                  title="Login will be implemented soon"
                >
                  Login
                </Button>
              </>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      {/* Menu de notificações - Only show when authenticated */}
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
                <ListItemText primary={n.Message} secondary={new Date(n.CreatedAt).toLocaleString('fr-FR')} sx={{ mr: 2 }} onClick={() => {sendToPage(n.Message)}} />
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
              <ListItemText primary="Without notifications." />
            </MenuItem>
          )}
        </Menu>
      )}
    </>
  )};
