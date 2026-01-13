/*
Renderiza uma tabela dinâmica
*/

import { Table, TableHead, TableRow, TableCell, TableBody } from '@mui/material';

export default function DataTable({
  columns,
  rows,
  getRowId = (r, i) => i,
  onRowClick,
  emptyMessage = 'No data found.',
  size = 'small',
  tableSx,
  headSx,
  bodySx,
  rowSx,
}) {
  return (
    <Table size={size} sx={{ minWidth: 720, tableLayout: 'fixed', ...tableSx }}>
      <TableHead sx={headSx}>
        <TableRow sx={{ '& th': { fontWeight: 700 } }}>
          {columns.map((col, i) => (
            <TableCell
              key={col.id ?? col.label}
              align={col.align ?? 'left'}
              sx={{
                width: col.width,
                color: '#333',
                borderRight: i < columns.length - 1 ? '1px solid rgba(0,0,0,0.2)' : 'none',
              }}
            >
              {col.label}
            </TableCell>
          ))}
        </TableRow>
      </TableHead>

      <TableBody sx={bodySx}>
        {rows.length === 0 ? (
          <TableRow>
            <TableCell colSpan={columns.length} align="center" sx={{ py: 3, color: '#666' }}>
              {emptyMessage}
            </TableCell>
          </TableRow>
        ) : (
          rows.map((row, idx) => {
            const id = getRowId(row, idx);
            return (
              <TableRow
                key={id}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                sx={{
                  cursor: onRowClick ? 'pointer' : 'default',
                  '&:hover': onRowClick ? { bgcolor: '#f5f5f5' } : undefined,
                  ...rowSx,
                }}
              >
                {columns.map((col) => (
                  <TableCell key={(col.id ?? col.label) + String(id)} align={col.align ?? 'left'}>
                    {typeof col.render === 'function' ? col.render(row) : row[col.field]}
                  </TableCell>
                ))}
              </TableRow>
            );
          })
        )}
      </TableBody>
    </Table>
  );
}
