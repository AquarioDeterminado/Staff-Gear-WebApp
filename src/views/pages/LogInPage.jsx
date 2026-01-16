import { Box, Typography } from '@mui/material';
import HeaderBar from '../components/layout/HeaderBar';
import Login from '../components/forms/LogInComponent';

export default function LogInPage() {
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
          pt: 8,
          bgcolor: '#fff3e0',
          textAlign: 'center',
          px: 2,
        }}
      >
        <Typography
        variant="h3"
        sx={{ mb: 10, color: '#000', fontSize: '3rem', fontWeight: 700 }}>
        Welcome Back!
        </Typography>
        <Box sx={{ width: '100%', maxWidth: 420 }}>
          <Login />
        </Box>
      </Box>
    </>
  );
}
