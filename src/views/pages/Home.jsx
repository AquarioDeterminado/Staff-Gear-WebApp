import { Box, Typography } from '@mui/material';
import ApplyFormComponent from '../components/ApplyFormComponent';
import Login from '../components/forms/LogInComponent';

export default function Home() {
  

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100%',
        bgcolor: '#FFF3E0',
        overflowX: 'hidden',
      }}
    >

      <Box
        component="main"
        sx={{
          height: '100vh',
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 2px 1fr' },
        }}
      >
        {/* Left: Application*/}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            px: { xs: 1, md: 6 },
          }}
        >
          <Box sx={{ width: '100%', maxWidth: 680 }}>
            <ApplyFormComponent />
          </Box>
        </Box>
        <Box
          sx={{
            display: { xs: 'none', md: 'block' },
            width: '2px',
            backgroundColor: '#000',
          }}
        />

        {/* Right: Login */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            px: { xs: 2, md: 6 },
            py: { xs: 4, md: 0 },
          }}
        >
          <Box sx={{ width: '100%', maxWidth: 520 }}>
            <Login />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}