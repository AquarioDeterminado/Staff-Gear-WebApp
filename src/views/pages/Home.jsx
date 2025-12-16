
import { Box, Typography } from '@mui/material';
import Login from '../components/LogInPage';
import ApplyCandidatePage from '../components/ApplyCandidatePage';

export default function Home() {
  const HEADER_H = 80;

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100%',
        bgcolor: '#FFF3E0',
        overflowX: 'hidden',
      }}
    >
      {/* Header */}
      <Box
        component="header"
        sx={{
          height: HEADER_H,
          display: 'grid',
          placeItems: 'center',
          px: 2,
          textAlign: 'center',
        }}
      >
        <div>
          <Typography
            variant="h3"
            sx={{ fontWeight: 800, color: '#000', letterSpacing: 1.2, mb: 1 }}
          >
            Staff Gear
          </Typography>
        </div>
      </Box>

      {/* Corpo: duas metades + traço vertical */}
      <Box
        component="main"
        sx={{
          height: `calc(100vh - ${HEADER_H}px)`,
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