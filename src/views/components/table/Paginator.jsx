/*
Paginação para tabelas
*/
import { Box, Pagination } from '@mui/material';

export default function Paginator({ count, page, onChange, canSwitchPage = true }) {
  return (
    <Box sx={{ p: 2, display: 'flex', justifyContent: 'center', backgroundColor: '#fff5e6', borderTop: '2px solid #ffe0b2' }}>
      <Pagination
        count={Math.max(1, count)}
        page={page}
        onChange={canSwitchPage ? onChange : undefined}
        disabled={!canSwitchPage}
      />
    </Box>
  );
}
