import { useState } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Avatar,
  IconButton,
  Tooltip,
  Chip,
  Button,
  Badge,
  Menu,
  MenuItem,
  ListItemText,
  Stack,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  Divider
} from '@mui/material';

import MenuIcon from '@mui/icons-material/Menu';
import HomeIcon from '@mui/icons-material/Home';
import LogoutIcon from '@mui/icons-material/Logout';
import EditIcon from '@mui/icons-material/Edit';
import NotificationsIcon from '@mui/icons-material/Notifications';
import EmailIcon from '@mui/icons-material/Email';
import WorkIcon from '@mui/icons-material/Work';
import ApartmentIcon from '@mui/icons-material/Apartment';
import PersonIcon from '@mui/icons-material/Person';
import KeyIcon from '@mui/icons-material/Key';
import HistoryIcon from '@mui/icons-material/History';
import GroupIcon from '@mui/icons-material/Group';
import GroupAddIcon from '@mui/icons-material/GroupAdd';

export default function EmployeeProfile({route}) {
  var {BusinessID} = route.params;
  console.log(BusinessID);

  const [user] = useState({
    firstName: 'FirstName',
    middleName: 'MiddleName',
    lastName: 'LastName',
    jobTitle: 'Job Title',
    department: 'Department',
    email: 'email@exemplo.com'
  });

  const [anchorNotif, setAnchorNotif] = useState(null);
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'Message', content: 'Conteúdo da mensagem A' },
    { id: 2, title: 'Message', content: 'Conteúdo da mensagem B' }
  ]);
  const notifOpen = Boolean(anchorNotif);

  const [drawerOpen, setDrawerOpen] = useState(false);

  // Dimensões
  const CARD_W = 280;
  const CARD_H = 72;
  const EMAIL_W = 360;

  // Card base
  const FieldCard = ({ children, width = CARD_W }) => (
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

  return (
    <Box sx={{ minHeight: '100vh', width: '100%', bgcolor: '#fff' }}>

      <Stack
        direction="row"
        alignItems="center"
        sx={{ p: { xs: 1.75, md: 2.25 } }}
      >
        <IconButton onClick={() => setDrawerOpen(true)} sx={{ mr: 'auto' }}>
          <MenuIcon sx={{ fontSize: 30 }} />
        </IconButton>

        <Stack direction="row" spacing={2} alignItems="center">
          <Button
            variant="text"
            startIcon={<HomeIcon sx={{ fontSize: 24 }} />}
            sx={{ fontSize: 16 }}
          >
            Home
          </Button>

          <Button
            variant="contained"
            startIcon={<LogoutIcon sx={{ fontSize: 22 }} />}
            sx={{
              fontSize: 16,
              px: 2.25,
              bgcolor: '#000',
              color: '#fff',
              '&:hover': { bgcolor: '#222' }
            }}
          >
            Log out
          </Button>

          <Tooltip title="Notificações">
            <IconButton onClick={(e) => setAnchorNotif(e.currentTarget)}>
              <Badge badgeContent={notifications.length} color="error">
                <NotificationsIcon sx={{ fontSize: 26 }} />
              </Badge>
            </IconButton>
          </Tooltip>

          <Avatar alt="Perfil" sx={{ width: 40, height: 40 }}>
            <PersonIcon sx={{ fontSize: 22 }} />
          </Avatar>
        </Stack>
      </Stack>

      <Stack alignItems="center" sx={{ mt: { xs: 1, md: 2 }, mb: { xs: 1, md: 2 } }}>
        <Typography variant="h4" sx={{ fontWeight: 700, letterSpacing: 0.2 }}>
          Staff Gear
        </Typography>
        <Typography variant="h5" sx={{ opacity: 0.85 }}>
          Perfil
        </Typography>
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
              <Stack direction="row" spacing={1.25} alignItems="center" justifyContent="center">
                <Tooltip title="Editar FirstName">
                  <IconButton size="small"><EditIcon /></IconButton>
                </Tooltip>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {user.firstName}
                </Typography>
              </Stack>
            </FieldCard>

            {/* MiddleName */}
            <FieldCard>
              <Stack direction="row" spacing={1.25} alignItems="center" justifyContent="center">
                <Tooltip title="Editar MiddleName">
                  <IconButton size="small"><EditIcon /></IconButton>
                </Tooltip>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {user.middleName}
                </Typography>
              </Stack>
            </FieldCard>

            {/* LastName */}
            <FieldCard>
              <Stack direction="row" spacing={1.25} alignItems="center" justifyContent="center">
                <Tooltip title="Editar LastName">
                  <IconButton size="small"><EditIcon /></IconButton>
                </Tooltip>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {user.lastName}
                </Typography>
              </Stack>
            </FieldCard>
          </Box>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: `repeat(2, ${CARD_W}px)`,
              justifyContent: 'center',
              gap: 14
            }}
          >
            {/* Job Title */}
            <FieldCard>
              <Stack direction="row" spacing={1.25} alignItems="center" justifyContent="center">
                <Tooltip title="Editar Job Title">
                  <IconButton size="small"><EditIcon /></IconButton>
                </Tooltip>
                <WorkIcon />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {user.jobTitle}
                </Typography>
              </Stack>
            </FieldCard>

            {/* Department */}
            <FieldCard>
              <Stack direction="row" spacing={1.25} alignItems="center" justifyContent="center">
                <Tooltip title="Editar Department">
                  <IconButton size="small"><EditIcon /></IconButton>
                </Tooltip>
                <ApartmentIcon />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {user.department}
                </Typography>
              </Stack>
            </FieldCard>
          </Box>

          {/* Email */}
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <FieldCard width={EMAIL_W}>
              <Stack direction="row" spacing={1.5} alignItems="center" justifyContent="center">
                <Tooltip title="Editar Email">
                  <IconButton size="small"><EditIcon /></IconButton>
                </Tooltip>
                <EmailIcon />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {user.email}
                </Typography>
              </Stack>
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
            >
              Alterar Password
            </Button>
          </Stack>
        </Stack>
      </Container>

      {/* Notificações */}
      <Menu
        anchorEl={anchorNotif}
        open={notifOpen}
        onClose={() => setAnchorNotif(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        MenuListProps={{ dense: true }}
      >
        {notifications.map((n) => (
          <MenuItem key={n.id} divider>
            <ListItemText primary={n.title} secondary={n.content} sx={{ mr: 2 }} />
            <IconButton
              size="small"
              color="error"
              onClick={() =>
                setNotifications((prev) => prev.filter((x) => x.id !== n.id))
              }
            >
              <Typography sx={{ fontWeight: 700 }}>X</Typography>
            </IconButton>
          </MenuItem>
        ))}
        {notifications.length === 0 && (
          <Box sx={{ px: 2, py: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Sem notificações.
            </Typography>
          </Box>
        )}
      </Menu>

      {/* Menu Lateral */}
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{ sx: { width: 280 } }}  // mais largo
      >
        <Stack direction="row" alignItems="center" spacing={1} sx={{ px: 2, py: 2 }}>
          <MenuIcon sx={{ fontSize: 30 }} />
          <Typography variant="h6">Menu</Typography>
        </Stack>
        <Divider />
        <List sx={{ '& .MuiListItemButton-root': { py: 1.25 } }}>
          <ListItemButton>
            <ListItemIcon><PersonIcon sx={{ fontSize: 24 }} /></ListItemIcon>
            <ListItemText
              primary={<Typography sx={{ fontSize: 16, fontWeight: 500 }}>Perfil</Typography>}
            />
          </ListItemButton>

          <ListItemButton>
            <ListItemIcon><HistoryIcon sx={{ fontSize: 24 }} /></ListItemIcon>
            <ListItemText
              primary={<Typography sx={{ fontSize: 16, fontWeight: 500 }}>History</Typography>}
            />
          </ListItemButton>

          <Divider sx={{ my: 0.75 }} />

          <ListItemButton>
            <ListItemIcon><GroupIcon sx={{ fontSize: 24 }} /></ListItemIcon>
            <ListItemText
              primary={<Typography sx={{ fontSize: 16, fontWeight: 500 }}>Users</Typography>}
            />
          </ListItemButton>

          <ListItemButton>
            <ListItemIcon><GroupAddIcon sx={{ fontSize: 24 }} /></ListItemIcon>
            <ListItemText
              primary={<Typography sx={{ fontSize: 16, fontWeight: 500 }}>Candidates</Typography>}
            />
          </ListItemButton>
        </List>
      </Drawer>
    </Box>
  );
}
