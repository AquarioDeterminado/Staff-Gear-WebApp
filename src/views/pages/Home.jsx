
import { Box, Typography } from '@mui/material';
import Login from '../components/LogInPage';
import ApplyCandidatePage from '../components/ApplyCandidatePage';

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
      {/* no header: main fills the full viewport */}

      {/* Corpo: duas metades + traço vertical */}
      <Box
        component="main"
        sx={{
          height: '100vh',
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 2px 1fr' },
        }}
      >
        {/* Esquerda: Candidatura */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            px: { xs: 1, md: 6 },
          }}
        >
          <Box sx={{ width: '100%', maxWidth: 680 }}>
            <ApplyCandidatePage />
          </Box>
        </Box>

        {/* Traço vertical */}
        <Box
          sx={{
            display: { xs: 'none', md: 'block' },
            width: '2px',
            backgroundColor: '#000',
          }}
        />

        {/* Direita: Login */}
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