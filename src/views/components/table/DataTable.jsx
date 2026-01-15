/*
Renderiza uma tabela dinâmica
*/
import { Table, TableHead, TableRow, TableCell, TableBody } from '@mui/material';
import SortingColumn from './SortingColumn';
import Paginator from './Paginator';
import { useState, useMemo } from 'react';

export default function DataTable({
  columns,
  rows,
  setRows,
  getRowId = (r, i) => i,
  onRowClick,
  emptyMessage = 'No data found.',
  size = 'small',
  tableSx,
  headSx,
  bodySx,
  rowSx,
  pageSize = 10,
}) {
  const [currentPage, setCurrentPage] = useState(1);
  
  const [active, setActive] = useState(null);

  const currentPageRows = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return rows.slice(startIndex, startIndex + pageSize);
  }, [rows, currentPage, pageSize]);

  
  return (
    <>
      <Table size={size} sx={{ minWidth: 720, tableLayout: 'fixed', ...tableSx }}>
        <TableHead sx={headSx}>
          <TableRow sx={{ '& th': { fontWeight: 700 } }}>
            {columns.map((col, i) => (
              col.sortable ? (
                <SortingColumn
                  key={i ?? col.id}
                  idx={i ?? col.id}
                  column={col}
                  totalColumns={columns.length}
                  setValues={setRows}
                  values={rows}
                  active={active === (i ?? col.id) ? true : false}
                  onClick={() => setActive(i ?? col.id)}
                />
              ) : (
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
              )
            ))}
          </TableRow>
        </TableHead>

        <TableBody sx={bodySx}>
          {currentPageRows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length} align="center" sx={{ py: 3, color: '#666' }}>
                {emptyMessage}
              </TableCell>
            </TableRow>
          ) : (
            currentPageRows.map((row, idx) => {
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
                      {typeof col.render === 'function' ? col.render(row, idx) : row[col.field]}
                    </TableCell>
                  ))}
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
      <Paginator
        count={Math.ceil(rows.length / pageSize)}
        page={currentPage}
        onChange={(_, p) => setCurrentPage(p)}
      />
    </>
  );
}
