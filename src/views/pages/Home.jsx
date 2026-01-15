import { Box, Typography, Button, Stack } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import HeaderBar from '../components/layout/HeaderBar';
import logo from '../../assets/logo.png';

export default function Home() {
  const navigate = useNavigate();

  return (
    <>
      <HeaderBar />
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-start',
          bgcolor: '#fff3e0',
          textAlign: 'center',
          px: 2,
          pt: 12,
        }}
      >
        <Typography variant="h3" sx={{ fontWeight: 700, color: '#000', mb: 2 }}>
          Welcome to
        </Typography>
        <Box
          component="img"
          src={logo}
          alt="Staff Gear"
          sx={{ height: 150, mb: 6 }}
        />

        <Typography variant="h5" sx={{ mb: 8, color: '#000' }}>
          The app where you can apply for our available jobs!
        </Typography>
        <Button
          variant="contained"
          sx={{
            bgcolor: '#000',
            color: '#fff',
            textTransform: 'none',
            fontWeight: 700,
            px: 6,
            py: 2,
            fontSize: 18,
            mb: 10,
            '&:hover': { bgcolor: '#222' },
          }}
          onClick={() => navigate('/job-listings')}
        >
          Check here the job opportunities!
        </Button>
        <Stack
          direction="row"
          spacing={4}
          alignItems="center"
          sx={{ justifyContent: 'center' }}
        >
          <Typography variant="h5" sx={{ fontWeight: 700, color: '#000' }}>
            Already an employee?
          </Typography>
          <Button
            variant="contained"
            sx={{
              bgcolor: '#000',
              color: '#fff',
              textTransform: 'none',
              fontWeight: 700,
              px: 5,
              py: 1.5,
              fontSize: 16,
              '&:hover': { bgcolor: '#222' },
            }}
            onClick={() => navigate('/login')}
          >
            Login
          </Button>
        </Stack>
      </Box>
    </>
  );
}
