/*
Wrapper com borda e espaçamentos
utilizado em maior parte das páginas
*/
import { Paper, Box, Divider } from '@mui/material';

export default function SectionPaper({ children, noOverflow, sx, headerSpacing = { px: 2, pt: 1 } }) {
  return (
    <Paper
      variant="outlined"
      sx={{
        bgcolor: '#fff3e0',
        borderColor: '#ddd',
        borderRadius: 1.5,
        overflow: noOverflow ? 'hidden' : 'auto',
        ...(sx || {}),
      }}
    >
      <Box sx={headerSpacing}>
        <Divider sx={{ borderColor: '#ccc' }} />
      </Box>
      {children}
      <Box sx={{ height: 24 }} />
    </Paper>
  );
}
