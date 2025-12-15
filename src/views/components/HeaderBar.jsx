import React, { useState } from 'react';
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
} from '@mui/material';

import MenuIcon from '@mui/icons-material/Menu';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import PersonIcon from '@mui/icons-material/Person';

export default function HeaderBar({
  notifications = [],
  onRemoveNotification,
  onHomeClick,
  onProfileClick,
  onLogoutClick,
  onOpenMenu,
}) {
  const [anchorNotif, setAnchorNotif] = useState(null);
  const open = Boolean(anchorNotif);

  return (
    <AppBar position="static" color="transparent" elevation={0} sx={{ borderBottom: '1px solid #eee' }}>
      <Toolbar sx={{ px: { xs: 2, md: 3 } }}>
        {/* Esquerda: hamburguer */}
        <IconButton edge="start" aria-label="menu" onClick={onOpenMenu} sx={{ mr: 1 }}>
          <MenuIcon />
        </IconButton>

        {/* Direita: sino, Home, Logout, Avatar */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <IconButton
            aria-label="notificações"
            onClick={(e) => setAnchorNotif(e.currentTarget)}
          >
            <Badge badgeContent={notifications.length} color="error">
              <NotificationsNoneIcon />
            </Badge>
          </IconButton>

          <Button
            variant="text"
            onClick={onHomeClick}
            sx={{ color: '#000', textTransform: 'none', fontWeight: 600 }}
          >
            Home
          </Button>

          <Button
            variant="contained"
            onClick={onLogoutClick}
            sx={{
              bgcolor: '#000',
              color: '#fff',
              textTransform: 'none',
              fontWeight: 700,
              px: 2,
              '&:hover': { bgcolor: '#222' },
            }}
          >
            Log out
          </Button>

          <IconButton aria-label="perfil" onClick={onProfileClick}>
            <Avatar sx={{ bgcolor: '#607d8b' }}>
              <PersonIcon />
            </Avatar>
          </IconButton>
        </Box>

        {/* Menu de notificações */}
        <Menu
          anchorEl={anchorNotif}
          open={open}
          onClose={() => setAnchorNotif(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          MenuListProps={{ dense: true }}
        >
          {notifications.length > 0 ? (
            notifications.map((n) => (
              <MenuItem key={n.id} divider>
                <ListItemText primary={n.title} secondary={n.content} sx={{ mr: 2 }} />
                <Button
                  size="small"
                  color="error"
                  onClick={() => onRemoveNotification?.(n.id)}
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
      </Toolbar>
    </AppBar>
  );
}
