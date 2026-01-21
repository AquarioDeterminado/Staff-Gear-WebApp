/*
Wrapper com borda e espaçamentos
utilizado em maior parte das páginas
*/
import { Paper, Box, Divider } from '@mui/material';

export default function SectionPaper({ children, noOverflow, sx, headerSpacing = { px: 2, pt: 0 } }) {
  return (
    <Paper
      sx={{
        bgcolor: '#fff5e6',
        borderColor: '#ffe0b2',
        borderRadius: '0',
        border: '2px solid #ffe0b2',
        overflow: noOverflow ? 'hidden' : 'auto',
        boxShadow: 'none',
        transition: 'all 0.3s ease',
        '&:hover': {
          boxShadow: 'none',
        },
        ...(sx || {}),
      }}
    >
      {children}
      <Box sx={{ height: 0 }} />
    </Paper>
  );
}
