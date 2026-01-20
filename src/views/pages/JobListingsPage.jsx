import { useState, useEffect, useMemo } from 'react';
import {
  Container,
  Stack,
  TextField,
  Typography,
  Paper,
  CircularProgress,
  Box,
  Pagination
} from '@mui/material';
import JobListingCard from '../components/JobListingCard';
import JobListingService from '../../services/JobListingService';
import useNotification from '../../utils/UseNotification';
import HeaderBar from '../components/layout/HeaderBar';

const ITEMS_PER_PAGE = 10;

export default function JobListingsPage() {
  const [jobListings, setJobListings] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const { showNotification } = useNotification();

  // Fetch job listings on mount
  useEffect(() => {
    const fetchJobListings = async () => {
      try {
        setLoading(true);
        const listings = await JobListingService.getOpen();
        setJobListings(listings);
      } catch (error) {
        console.error('Error fetching job listings:', error);
        showNotification('Error loading job listings', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchJobListings();
  }, [showNotification]);

  // Filter jobs based on search query (case-insensitive, partial match)
  const filteredJobs = useMemo(() => {
    if (!searchQuery.trim()) {
      return jobListings;
    }

    const query = searchQuery.toLowerCase();
    return jobListings.filter(
      (job) =>
        job.jobTitle.toLowerCase().includes(query) ||
        job.location.toLowerCase().includes(query)
    );
  }, [jobListings, searchQuery]);

  // Pagination
  const totalPages = Math.ceil(filteredJobs.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedJobs = filteredJobs.slice(startIndex, endIndex);

  const handlePageChange = (event, page) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#fff' }}>
      <HeaderBar />
      <Box sx={{ bgcolor: '#f5f5f5', minHeight: 'calc(100vh - 64px)' }}>
        <Container maxWidth="lg" sx={{ py: 4 }}>
        <Stack spacing={3}>
          {/* Header */}
          <Stack spacing={1}>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#000' }}>
              Job Listings
            </Typography>
            <Typography variant="body2" sx={{ color: '#666' }}>
              Browse our available opportunities
            </Typography>
          </Stack>

          {/* Search Bar */}
          <Paper
            sx={{
              p: 2,
              bgcolor: '#fff3e0',
              borderColor: '#ddd',
              border: '1px solid #ddd'
            }}
          >
            <TextField
              fullWidth
              placeholder="Search by job title or location..."
              value={searchQuery}
              onChange={handleSearchChange}
              variant="outlined"
              size="small"
              sx={{
                '& .MuiOutlinedInput-root': {
                  bgcolor: '#fff',
                  '& fieldset': {
                    borderColor: '#ccc'
                  },
                  '&:hover fieldset': {
                    borderColor: '#ff9800'
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#ff9800'
                  }
                }
              }}
            />
          </Paper>

          {/* Loading State */}
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress sx={{ color: '#ff9800' }} />
            </Box>
          ) : (
            <>
              {/* Results Count */}
              <Typography variant="body2" sx={{ color: '#666' }}>
                Showing {paginatedJobs.length > 0 ? startIndex + 1 : 0} to{' '}
                {Math.min(endIndex, filteredJobs.length)} of {filteredJobs.length} jobs
              </Typography>

              {/* Job Listings */}
              {paginatedJobs.length > 0 ? (
                <Paper
                  sx={{
                    p: 3,
                    bgcolor: '#fff',
                    borderColor: '#ddd',
                    border: '1px solid #ddd'
                  }}
                >
                  <Stack spacing={0}>
                    {paginatedJobs.map((job) => (
                      <JobListingCard key={job.jobListingID} job={job} />
                    ))}
                  </Stack>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <Stack sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
                      <Pagination
                        count={totalPages}
                        page={currentPage}
                        onChange={handlePageChange}
                        sx={{
                          '& .MuiPaginationItem-root': {
                            color: '#ff9800'
                          },
                          '& .MuiPaginationItem-page.Mui-selected': {
                            bgcolor: '#ff9800',
                            color: '#fff',
                            '&:hover': {
                              bgcolor: '#e68a00'
                            }
                          },
                          '& .MuiPaginationItem-previousNext': {
                            color: '#ff9800'
                          }
                        }}
                      />
                    </Stack>
                  )}
                </Paper>
              ) : (
                <Paper
                  sx={{
                    p: 4,
                    textAlign: 'center',
                    bgcolor: '#fff3e0',
                    borderColor: '#ddd',
                    border: '1px solid #ddd'
                  }}
                >
                  <Typography variant="body1" sx={{ color: '#666' }}>
                    No job listings found matching your search.
                  </Typography>
                </Paper>
              )}
            </>
          )}
        </Stack>
        </Container>
      </Box>
    </Box>
  );
}
