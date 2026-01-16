import { useEffect, useState } from 'react';
import { TableCell } from '@mui/material';

const SORTING_ASCENDING = 'asc';
const SORTING_DESCENDING = 'desc';

const SortingColumn = ({column, totalColumns, setValues, values, idx, onClick, active}) => {
    const [sorting, setSorting] = useState({ field: '', order: '' });

    function clickHeader(parameter) {
        let sortingOrder = sorting.parameter === parameter && sorting.order === SORTING_ASCENDING ? SORTING_DESCENDING : sorting.order === SORTING_DESCENDING ? '' : SORTING_ASCENDING;
        setSorting({ "parameter": parameter, "order": sortingOrder });

        var sorted = [];
        sorted = values;
        if (sortingOrder === "") {
            sorted = [...values].sort((a, b) => {
            if (a["CreatedAt"] < b["CreatedAt"]) return -1;
            if (a["CreatedAt"] > b["CreatedAt"]) return 1;
            return 0;
            });
        } else if (sortingOrder === SORTING_DESCENDING) {
            sorted = [...values].sort((a, b) => {
            if (a[parameter] > b[parameter]) return -1;
            if (a[parameter] < b[parameter]) return 1;
            return 0;
            });
        } else if (sortingOrder === SORTING_ASCENDING) {
            sorted = [...values].sort((a, b) => {
            if (a[parameter] < b[parameter]) return -1;
            if (a[parameter] > b[parameter]) return 1;
            return 0;
            });
        }
        setValues(sorted);
    }

    const onClickHandler = () => {
        clickHeader(column.field);
        onClick();
    };

    //reset sorting when another column is clicked
    useEffect(() => {
        if (!active) {
            setSorting({ field: '', order: '' });
        }
    }, [active]);

    return (
        <TableCell
            key={column.id ?? column.label}
            align={column.align ?? 'left'}
            sx={{
              width: column.width,
              color: '#333',
              borderRight: idx < totalColumns - 1 ? '1px solid rgba(0,0,0,0.2)' : 'none',
            }}
            onClick={() => onClickHandler()}  
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