import React, { useState } from 'react';
import {
  Box,
  Stack,
    Typography,
    Divider,
    Drawer,
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    IconButton
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import HistoryIcon from '@mui/icons-material/History';
import GroupIcon from '@mui/icons-material/Group';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import { useNavigate } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';


function SideMenu() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const role = localStorage.getItem('user_role');

  const navigate = useNavigate();

  return <>
  <IconButton onClick={() => setDrawerOpen(true)} aria-label="abrir menu">
              <MenuIcon sx={{ fontSize: 30 }} />
            </IconButton>
  <Drawer
    anchor="left"
    open={drawerOpen}
    onClose={() => setDrawerOpen(false)}
    PaperProps={{ sx: { width: 280 } }}
  >
    <Stack direction="row" alignItems="center" spacing={1} sx={{ px: 2, py: 2 }}>
      <Typography variant="h6">Menu</Typography>
    </Stack>
    <Divider />
    <List sx={{ '& .MuiListItemButton-root': { py: 1.25 } }}>
      <ListItemButton onClick={() => navigate('/profile')}>
        <ListItemIcon><PersonIcon sx={{ fontSize: 24 }} /></ListItemIcon>
        <ListItemText primary={<Typography sx={{ fontSize: 16, fontWeight: 500 }}>Perfil</Typography>} />
      </ListItemButton>

      <ListItemButton onClick={() => navigate('/records')}>
        <ListItemIcon><HistoryIcon sx={{ fontSize: 24 }} /></ListItemIcon>
        <ListItemText primary={<Typography sx={{ fontSize: 16, fontWeight: 500 }}>History</Typography>} />
      </ListItemButton>

      {role === 'HR'? 
      <>
        <Divider sx={{ my: 0.75 }} />

        <ListItemButton onClick={() => navigate('/hr/records')}>
          <ListItemIcon><GroupIcon sx={{ fontSize: 24 }} /></ListItemIcon>
          <ListItemText primary={<Typography sx={{ fontSize: 16, fontWeight: 500 }}>All Records</Typography>} />
        </ListItemButton>

        <ListItemButton onClick={() => navigate('/employees')}>
          <ListItemIcon><GroupIcon sx={{ fontSize: 24 }} /></ListItemIcon>
          <ListItemText primary={<Typography sx={{ fontSize: 16, fontWeight: 500 }}>Employees</Typography>} />
        </ListItemButton>

        <ListItemButton onClick={() => navigate('/candidates')}>
          <ListItemIcon><GroupAddIcon sx={{ fontSize: 24 }} /></ListItemIcon>
          <ListItemText primary={<Typography sx={{ fontSize: 16, fontWeight: 500 }}>Candidates</Typography>} />
        </ListItemButton>
      </>
      :
        <>
        </>
      }

      

    </List>
  </Drawer>
    </>;
}

export default SideMenu;