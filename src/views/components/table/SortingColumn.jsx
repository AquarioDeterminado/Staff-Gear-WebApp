import { useEffect, useState } from 'react';
import { TableCell } from '@mui/material';

const SORTING_ASCENDING = 'asc';
const SORTING_DESCENDING = 'desc';

const SortingColumn = ({column, totalColumns, idx, onClick, active, onSortChange}) => {
    const [sorting, setSorting] = useState({ field: '', order: '' });

    function clickHeader(field) {
        let sortingOrder = sorting.field === field && sorting.order === SORTING_ASCENDING ? SORTING_DESCENDING : sorting.order === SORTING_DESCENDING ? '' : SORTING_ASCENDING;
        setSorting({ field: field, order: sortingOrder });
        console.log("sorting:", sorting);
        onSortChange({ SortBy: field, Direction: sortingOrder });
    }

    const onClickHandler = () => {
        clickHeader(column.field);
        onClick();
    };

    //reset sorting when another column is clicked
    useEffect(() => {
        function resetSorting() {
            setSorting({ field: '', order: '' });
        }
        if (!active) {
            resetSorting();
        }
    }, [active]);

    return (
        <TableCell
            key={column.id ?? column.label}
            align={column.align ?? 'left'}
            sx={{
              width: column.width,
              color: '#333',
              borderRight: idx < totalColumns - 1 ? '1px solid #ffe0b2' : 'none',
              borderBottom: '2px solid #ffe0b2',
              backgroundColor: '#fff5e6',
            }}
            onClick={() => onClickHandler(column.field)}  
            style={{ cursor: 'pointer', fontWeight: 'bold' }}
        >
            {column.label}
            { active? sorting.order === SORTING_ASCENDING ? ' ▲' 
                : sorting.order === SORTING_DESCENDING ? ' ▼' 
                : ''
                
            : ''}
        </TableCell>
    );
}

export default SortingColumn;