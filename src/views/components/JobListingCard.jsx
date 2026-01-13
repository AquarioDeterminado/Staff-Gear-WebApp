import { Card, CardContent, Stack, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const JOB_TYPE_MAP = {
  0: 'Remoto',
  1: 'Híbrido',
  2: 'Presencial'
};

const getJobTypeLabel = (jobTypeValue) => {
  return JOB_TYPE_MAP[jobTypeValue] || 'Remoto'; //por alguma razão 0/Remoto aparece como undefined (1 e 2 funcionam)
};

export default function JobListingCard({ job }) {
  const navigate = useNavigate();

  const handleViewDetails = () => {
    navigate(`/job-listings/${job.jobListingID}`);
  };

  return (
    <Card
      sx={{
        bgcolor: '#fff',
        borderColor: '#ddd',
        border: '1px solid #ddd',
        borderRadius: 1,
        mb: 2,
        transition: 'box-shadow 0.3s ease, border-color 0.3s ease',
        '&:hover': {
          boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
          borderColor: '#ff9800'
        }
      }}
    >
      <CardContent sx={{ py: 2, px: 3, '&:last-child': { pb: 2 } }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
          {/* Left: Title and Location/JobType info */}
          <Stack spacing={0.5}>
            <Typography variant="h6" sx={{ color: '#000', fontWeight: 600, m: 0 }}>
              {job.jobTitle}
            </Typography>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <Typography variant="body2" sx={{ color: '#666' }}>
                📍 {job.location}
              </Typography>
              <Typography variant="body2" sx={{ color: '#999' }}>
                •
              </Typography>
              <Typography variant="body2" sx={{ color: '#666', fontWeight: 500 }}>
                {getJobTypeLabel(job.jobType)}
              </Typography>
            </Stack>
          </Stack>

          {/* Right: See More Button */}
          <Button
            variant="text"
            onClick={handleViewDetails}
            sx={{
              color: '#ff9800',
              textTransform: 'uppercase',
              fontWeight: 700,
              fontSize: '0.75rem',
              letterSpacing: '0.5px',
              whiteSpace: 'nowrap',
              '&:hover': {
                bgcolor: 'transparent',
                color: '#e68a00'
              }
            }}
          >
            SEE MORE
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
}
