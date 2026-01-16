/*
Paginação para tabelas
*/
import { Box, Pagination } from '@mui/material';

export default function Paginator({ count, page, onChange }) {
  return (
    <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
      <Pagination
        count={Math.max(1, count)}
        page={page}
        onChange={onChange}
        sx={{ '& .MuiPaginationItem-root.Mui-selected': { bgcolor: '#ff9800', color: '#fff' } }}
      />
    </Box>
  );
}
