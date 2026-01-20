import { Table, TableHead, TableRow, TableCell, TableBody } from '@mui/material';
import SortingColumn from './SortingColumn';
import Paginator from './Paginator';
import { useState, useEffect } from 'react';

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
  pageSize = 10,
  pageCount = 1,
  onPageChange = () => {},
  canSwitchPage = true,
  onSortChange,
}) {
  const [currentPage, setCurrentPage] = useState(1);
  useEffect(() => onPageChange(currentPage), [currentPage, onPageChange, rows]);

  const [active, setActive] = useState(null);
  const currentPageRows = rows;

  function _onPageChange(page) {
    setCurrentPage(page);
    onPageChange(page);
  }

  return (
    <>
      <Table
        size={size}
        sx={{
          minWidth: 720,
          tableLayout: 'fixed',
          overflow: 'hidden',
          backgroundColor: '#fff5e6',
          border: '2px solid #ffe0b2',
          ...tableSx,
        }}
      >
        <TableHead sx={{
          backgroundColor: '#fff5e6',
          ...headSx
        }}>
          <TableRow sx={{ '& th': { fontWeight: 700, backgroundColor: '#fff5e6', borderBottom: '2px solid #ffe0b2' } }}>
            {columns.map((col, i) =>
              col.sortable ? (
                <SortingColumn
                  key={i ?? col.id}
                  idx={i ?? col.id}
                  column={col}
                  totalColumns={columns.length}
                  active={active === (i ?? col.id)}
                  onClick={() => setActive(i ?? col.id)}
                  onSortChange={onSortChange}
                />
              ) : (
                <TableCell
                  key={col.id ?? col.label}
                  align={col.align ?? 'left'}
                  sx={{
                    width: col.width,
                    color: '#333',
                    borderRight: i < columns.length - 1 ? '1px solid #ffe0b2' : 'none',
                    borderBottom: '2px solid #ffe0b2',
                    backgroundColor: '#fff5e6',
                  }}
                >
                  {col.label}
                </TableCell>
              )
            )}
          </TableRow>
        </TableHead>

        <TableBody sx={{ backgroundColor: '#fff5e6', ...bodySx }}>
          {currentPageRows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length} align="center" sx={{ py: 3, color: '#666', backgroundColor: '#fff5e6' }}>
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
                    backgroundColor: row.standoutRow ? row.standoutRow : 'inherit',
                    cursor: onRowClick ? 'pointer' : 'default',
                    transition: 'all 0.2s ease',
                    backgroundColor: '#fff5e6',
                    borderBottom: '1px solid #ffe0b2',
                    ...rowSx,
                  }}
                >
                  {columns.map((col, colIdx) => (
                    <TableCell 
                      key={(col.id ?? col.label) + String(id)} 
                      align={col.align ?? 'left'}
                      sx={{
                        backgroundColor: '#fff5e6',
                        borderRight: colIdx < columns.length - 1 ? '1px solid #ffe0b2' : 'none',
                      }}
                    >
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
        count={pageCount ?? Math.ceil(rows.length / pageSize)}
        page={currentPage}
        onChange={(_, p) => _onPageChange(p)}
        canSwitchPage={canSwitchPage}
      />
    </>
  );
}
