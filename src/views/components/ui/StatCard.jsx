import { Card, Box, Typography, Stack } from '@mui/material';

export default function StatCard({ icon: Icon, label, value, color = '#ff9800' }) {
  return (
    <Card
      sx={{
        p: 2.5,
        bgcolor: '#fff',
        border: `2px solid ${color}`,
        borderRadius: '12px',
        boxShadow: `0 2px 8px rgba(255, 152, 0, 0.1)`,
        transition: 'all 0.3s ease',
        '&:hover': {
          boxShadow: `0 4px 16px rgba(255, 152, 0, 0.2)`,
          transform: 'translateY(-4px)',
        },
      }}
    >
      <Stack direction="row" spacing={2} alignItems="center">
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 56,
            height: 56,
            borderRadius: '50%',
            bgcolor: `${color}20`,
            color: color,
          }}
        >
          {Icon && <Icon sx={{ fontSize: 28 }} />}
        </Box>
        <Box sx={{ flex: 1 }}>
          <Typography variant="caption" sx={{ color: '#757575', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            {label}
          </Typography>
          <Typography variant="h6" sx={{ color: '#212121', fontWeight: 700, fontSize: '1.5rem', mt: 0.5 }}>
            {value}
          </Typography>
        </Box>
      </Stack>
    </Card>
  );
}
