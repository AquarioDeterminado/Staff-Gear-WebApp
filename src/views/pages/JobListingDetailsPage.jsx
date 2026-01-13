import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Stack,
  Typography,
  Button,
  Paper,
  Box,
  CircularProgress,
  Alert,
  Divider,
  Grid,
  Fab,
  Tooltip,
} from '@mui/material';
import { AccessTime, LocationOn, Work, Business, Description, Send, ArrowDownward } from '@mui/icons-material';
import JobListingService from '../../services/JobListingService';
import ApplyFormComponent from '../components/ApplyFormComponent';
import useNotification from '../../utils/UseNotification';

const formatJobType = (type) => {
  const types = {
    0: 'Remote',
    1: 'Hybrid',
    2: 'On-site',
  };
  return types[Number(type)] || type;
};

const formatDate = (dateString) => {
  if (!dateString) return 'Unknown date';
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
  }
  if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return `${months} month${months > 1 ? 's' : ''} ago`;
  }
  return date.toLocaleDateString('en-US');
};

const isVagaOpen = (status) => {
  return Number(status) === 0; // 0 = Open
};

const getStatusMessage = (status) => {
  const statusNum = Number(status);
  const messages = {
    0: null, // Open - sem mensagem
    1: 'This job listing is currently under review',
    2: 'This job listing has been closed',
  };
  return messages[statusNum] || 'Unknown status';
};

export default function JobListingDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const formRef = useRef(null);

  const [jobListing, setJobListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchJobListing = async () => {
      try {
        setLoading(true);
        setError(null);
        const listing = await JobListingService.getById(id);
        setJobListing(listing);
      } catch (err) {
        console.error('Error fetching job listing:', err);
        setError('Não foi possível carregar os detalhes da vaga');
        showNotification('Erro ao carregar vaga', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchJobListing();
  }, [id, showNotification]);

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 8, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress sx={{ color: '#ff9800' }} />
      </Container>
    );
  }

  if (error || !jobListing) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Stack spacing={3}>
          <Button
            variant="text"
            onClick={() => navigate('/job-listings')}
            sx={{
              color: '#ff9800',
              textTransform: 'none',
              fontWeight: 500,
              width: 'fit-content',
              '&:hover': { bgcolor: '#fff3e0' },
            }}
          >
            ← Back to Job Listings
          </Button>

          <Alert severity="error">{error || 'Job listing not found'}</Alert>

          <Button
            variant="contained"
            onClick={() => navigate('/job-listings')}
            sx={{
              bgcolor: '#ff9800',
              color: '#fff',
              textTransform: 'none',
              fontWeight: 600,
              width: 'fit-content',
              '&:hover': { bgcolor: '#e68a00' },
            }}
          >
            Back to Job Listings
          </Button>
        </Stack>
      </Container>
    );
  }

  const vagaAberta = isVagaOpen(jobListing.status);
  const statusMsg = getStatusMessage(jobListing.status);

  const handleScrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Stack spacing={4} sx={{ alignItems: 'center' }}>
        {/* Back Button */}
        <Box sx={{ alignSelf: 'flex-start', width: '100%' }}>
          <Button
            variant="text"
            onClick={() => navigate('/job-listings')}
            sx={{
              color: '#ff9800',
              textTransform: 'none',
              fontWeight: 500,
              width: 'fit-content',
              '&:hover': { bgcolor: '#fff3e0' },
            }}
          >
            ← Back to Job Listings
          </Button>
        </Box>

        {/* Centered Content Wrapper */}
        <Box sx={{ width: '100%', maxWidth: '1000px' }}>
          <Stack spacing={4}>
            {/* Header Section with Background */}
            <Box
              sx={{
                position: 'relative',
                bgcolor: '#fafafa',
                border: '1px solid #f0f0f0',
                borderRadius: 2,
                p: 4,
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              }}
            >
          {/* Posted Date - Top Right Corner */}
          <Box
            sx={{
              position: 'absolute',
              top: 16,
              right: 16,
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              color: '#999',
              fontSize: '0.875rem',
              bgcolor: '#fff',
              px: 1.5,
              py: 0.75,
              borderRadius: 1.5,
              boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
            }}
          >
            <AccessTime sx={{ fontSize: 16 }} />
            <Typography variant="caption" sx={{ color: '#999' }}>
              {formatDate(jobListing.postedDate)}
            </Typography>
          </Box>

          {/* Title */}
          <Typography
            variant="h3"
            sx={{
              fontWeight: 700,
              color: '#000',
              mb: 2,
              fontSize: { xs: '1.875rem', sm: '2.5rem' },
              lineHeight: 1.2,
              mt: 2,
            }}
          >
            {jobListing.jobTitle}
          </Typography>

          {/* Subtitle: Location and Type */}
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            sx={{ color: '#666', mb: 3 }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <LocationOn sx={{ fontSize: 18, color: '#ff9800' }} />
              <Typography variant="body1">{jobListing.location}</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <Work sx={{ fontSize: 18, color: '#ff9800' }} />
              <Typography variant="body1">{formatJobType(jobListing.jobType)}</Typography>
            </Box>
            {jobListing.department && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                <Business sx={{ fontSize: 18, color: '#ff9800' }} />
                <Typography variant="body1">{jobListing.department.name}</Typography>
              </Box>
            )}
          </Stack>

          <Divider sx={{ my: 2 }} />
        </Box>

        {/* Status Alert (if not open) */}
        {!vagaAberta && (
          <Alert
            severity="warning"
            sx={{
              bgcolor: '#fffbf0',
              borderColor: '#ffe4ba',
              border: '1px solid #ffe4ba',
              color: '#666',
            }}
          >
            {statusMsg}
          </Alert>
        )}

        {/* Main Content - Two Column Layout - Adjusted Proportions */}
        <Grid container spacing={4} sx={{ justifyContent: 'center' }}>
          {/* Left Column - Job Description */}
          <Grid item xs={12} md={6}>
            <Paper
              sx={{
                p: 4,
                bgcolor: '#fff',
                border: '1px solid #f0f0f0',
                borderRadius: 2,
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                <Description sx={{ color: '#ff9800', fontSize: 24 }} />
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 700, color: '#000', m: 0 }}
                >
                  About the Position
                </Typography>
              </Box>
              <Typography
                variant="body1"
                sx={{
                  color: '#444',
                  lineHeight: 1.8,
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                }}
              >
                {jobListing.description}
              </Typography>
            </Paper>
          </Grid>

          {/* Right Column - Apply Form - Larger */}
          <Grid item xs={12} md={7}>
            <Paper
              ref={formRef}
              sx={{
                p: 4,
                bgcolor: '#fff',
                border: '1px solid #f0f0f0',
                borderRadius: 2,
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              }}
            >
              {vagaAberta ? (
                <ApplyFormComponent jobListingId={jobListing.jobListingID} />
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Box
                    sx={{
                      width: 60,
                      height: 60,
                      borderRadius: '50%',
                      bgcolor: '#f5f5f5',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mx: 'auto',
                      mb: 2,
                    }}
                  >
                    <Send sx={{ fontSize: 28, color: '#ccc' }} />
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: '#666', mb: 1 }}>
                    Application Not Available
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#999' }}>
                    {statusMsg}
                  </Typography>
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>
          </Stack>
        </Box>
      </Stack>

      {/* Floating Action Button - Scroll to Form */}
      {vagaAberta && (
    
    <Tooltip title="Submit Application" arrow placement="left">
      <Fab
        aria-label="apply now - scroll to application form"
        onClick={handleScrollToForm}
        sx={{
          position: 'fixed',
          bottom: 32,
          right: 32,
          width: 80,
          height: 80,
          bgcolor: '#ff9800',
          color: '#fff',
          borderRadius: '50%', // mantém circular (podes trocar para 12 para ficar rounded)
          '&:hover': {
            bgcolor: '#e68a00',
            boxShadow: '0 6px 20px rgba(255,152,0,0.4)',
          },
          boxShadow: '0 4px 12px rgba(255,152,0,0.3)',
          p: 1,
        }}
      >
        <Box display="flex" flexDirection="column" alignItems="center" lineHeight={1}>
          <Typography
            variant="caption"
            sx={{ fontWeight: 700, color: '#fff', textTransform: 'uppercase', mb: 0.5 }}
          >
            Apply Now
          </Typography>
          <ArrowDownward fontSize="small" />
        </Box>
      </Fab>
    </Tooltip>
    
      )}
    </Container>
  );
}
