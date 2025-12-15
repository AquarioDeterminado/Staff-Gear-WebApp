import { Box, Container, Grid, Typography, Divider, Stack } from '@mui/material';
import Login from './../components/LogInPage';
import ApplyCandidatePage from './../components/ApplyCandidatePage';

export default function Home() {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#fff' }}>
      {/* Topo: título central */}
      <Container maxWidth="lg" sx={{ pt: 3, pb: 2 }}>
        <Stack direction="row" alignItems="center">
          <Box sx={{ flex: 1 }} />
          <Typography
            variant="h4"
            sx={{ fontWeight: 700, textAlign: 'center', flex: 2, color: '#000' }}
          >
            Staff Gear
          </Typography>
          <Box sx={{ flex: 1 }} />
        </Stack>
      </Container>

      <Container maxWidth="lg" sx={{ pb: 6 }}>
        <Grid container spacing={0} alignItems="stretch">
          {/* Coluna esquerda */}
            <ApplyCandidatePage />

          {/* Divisor vertical */}
          <Grid
            item
            xs={12}
            md="auto"
            sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'stretch' }}
          >
            <Divider orientation="vertical" flexItem sx={{ mx: 2 }} />
          </Grid>

          {/* Coluna direita — Login */}
          <Grid item xs={12} md={6}>
            <Login />
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

