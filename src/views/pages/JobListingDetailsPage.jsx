import { Container, Stack, Typography, Button, Paper, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';

export default function JobListingDetailsPage() {
  const navigate = useNavigate();

  return (
    <>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Stack spacing={3}>
          {/* Back Button */}
          <Button
            variant="text"
            onClick={() => navigate('/job-listings')}
            sx={{
              color: '#ff9800',
              textTransform: 'none',
              fontWeight: 500,
              '&:hover': {
                bgcolor: '#fff3e0'
              }
            }}
          >
            ← Back to Job Listings
          </Button>

          {/* Content */}
          <Paper
            sx={{
              p: 4,
              bgcolor: '#fff3e0',
              borderColor: '#ddd',
              border: '1px solid #ddd',
              textAlign: 'center'
            }}
          >
            <Stack spacing={2}>
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  bgcolor: '#ff9800',
                  borderRadius: '50%',
                  margin: '0 auto',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Typography variant="h4" sx={{ color: '#fff' }}>
                  ⚙️
                </Typography>
              </Box>

              <Typography variant="h5" sx={{ fontWeight: 700, color: '#000' }}>
                Coming Soon
              </Typography>

              <Typography variant="body1" sx={{ color: '#666' }}>
                This job listing details page is not yet implemented.
              </Typography>

              <Typography variant="body2" sx={{ color: '#999' }}>
                We're working on bringing you the full job details, requirements, and application form. 
                Check back soon!
              </Typography>

              <Box sx={{ mt: 2 }}>
                <Button
                  variant="contained"
                  onClick={() => navigate('/job-listings')}
                  sx={{
                    bgcolor: '#ff9800',
                    color: '#fff',
                    textTransform: 'none',
                    fontWeight: 600,
                    '&:hover': {
                      bgcolor: '#e68a00'
                    }
                  }}
                >
                  Back to Job Listings
                </Button>
              </Box>
            </Stack>
          </Paper>
        </Stack>
      </Container>
    </>
  );
}
