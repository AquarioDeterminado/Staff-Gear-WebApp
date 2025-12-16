
// src/views/pages/Profile.jsx
import { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Avatar,
  IconButton,
  Tooltip,
  Button,
  Stack,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  Divider,
  ListItemText,
} from '@mui/material';

import EditIcon from '@mui/icons-material/Edit';
import EmailIcon from '@mui/icons-material/Email';
import WorkIcon from '@mui/icons-material/Work';
import ApartmentIcon from '@mui/icons-material/Apartment';
import PersonIcon from '@mui/icons-material/Person';
import KeyIcon from '@mui/icons-material/Key';
import HistoryIcon from '@mui/icons-material/History';
import GroupIcon from '@mui/icons-material/Group';
import GroupAddIcon from '@mui/icons-material/GroupAdd';

import HeaderBar from '../components/HeaderBar';
import { useNavigate } from 'react-router-dom';
import { SettingsInputAntenna } from '@mui/icons-material';
import EmployeeService from '../../services/EmployeeService';
import SideMenu from '../components/SideMenu';
import UserSession from '../../utils/UserSession';

export default function Profile() {
  const navigate = useNavigate();
  const BusinessID = UserSession.getBusinessID(navigate);

  const [profileInfo, setProfileInfo] = useState(null);

  useEffect(() => {
    if (!BusinessID) {
      navigate('/');
    }

    async function GetEmployeeIndfo () {
      try {
        var info = await EmployeeService.getEmployee(BusinessID)
        setProfileInfo(info);
        console.log(info);
      } catch (error) {
        console.error('Error fetching profile info:', error);
        navigate('/', { replace: true });
      }
    }

    GetEmployeeIndfo();
    
  }, [BusinessID, navigate]);

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
      {/* Header comum */}
      <HeaderBar/>

      {/* Títulos centrais */}
      <Stack alignItems="center" sx={{ mt: { xs: 1, md: 2 }, mb: { xs: 1, md: 2 } }}>
        <Typography variant="h5" sx={{ opacity: 0.85 }}>
          Profile
        </Typography>
      </Stack>
      
      {/* Avatar central grande */}
      <Stack alignItems="center" sx={{ mb: { xs: 2, md: 3 } }}>
        <Avatar sx={{ width: { xs: 110, md: 125 }, height: { xs: 110, md: 125 } }}>
          <PersonIcon sx={{ fontSize: { xs: 52, md: 66 } }} />
        </Avatar>
      </Stack>

      {/* Conteúdo dos cartões */}
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
                  {profileInfo?.FirstName || ''}
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
                  {profileInfo?.MiddleName || ''}
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
                  {profileInfo?.LastName || ''}
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
                  {profileInfo?.JobTitle || ''}
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
                  {profileInfo?.Department || ''}
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
                  {profileInfo?.Email || ''}
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

      {/* Drawer lateral (igual ao teu) */}
       </Box>
  )};