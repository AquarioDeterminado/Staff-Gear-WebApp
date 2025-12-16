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

  const [notifications, setNotifications] = useState([]);

  const [anchorNotif, setAnchorNotif] = useState(null);
  const notifOpen = Boolean(anchorNotif);

  const [drawerOpen, setDrawerOpen] = useState(false);


  useEffect(() => {
    async function fetchNotifications() {
      try {
        var notifs = await NoticationService.getAllNotifications(BusinessId);
        setNotifications(Array.isArray(notifs) ? notifs : []);
        console.log(notifs);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    }
    fetchNotifications();
  }, []);

  function handleDismissNotification(id) {
    try {
      NoticationService.deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n.NotificationID !== id));
    } catch (error) {
      console.error('Error dismissing notification:', error);
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
          {/* Hamburguer */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <SideMenu />
          </Box>

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
                height: 80,
                objectFit: 'contain',
                display: 'block',
              }}
            />
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, marginLeft: 'auto' }}>
            <IconButton onClick={(e) => setAnchorNotif(e.currentTarget)} aria-label="notificações">
              <Badge badgeContent={notifications.length} color="error">
                <NotificationsIcon sx={{ fontSize: 26 }} />
              </Badge>
            </IconButton>

            <Button
              variant="text"
              startIcon={<HomeIcon />}
              sx={{ color: '#000', textTransform: 'none', fontWeight: 600 }}
              onClick={() => navigate('/home')}
            >
              Home
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
              onClick={() => { AuthService.logout(); navigate('/'); }}
            >
              Log out
            </Button>

            <IconButton onClick={() => navigate('/profile')} aria-label="perfil">
              <Avatar sx={{ bgcolor: '#607d8b' }}>
                <PersonIcon />
              </Avatar>
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Menu de notificações */}
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
              <ListItemText primary={n.Message} secondary={n.CreatedAt} sx={{ mr: 2 }} />
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
            <ListItemText primary="Sem notificações." />
          </MenuItem>
        )}
      </Menu>
    </>
  )};
