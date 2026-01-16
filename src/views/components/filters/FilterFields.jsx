import { Stack, TextField } from '@mui/material';
import { useEffect } from 'react';

export default function FilterFields ({ filters, setFilters, values, setFilteredValues }) {

    const [filtersValues, setFiltersValues] = useState(filters.map((divider) => divider.map((filter) => ({...filter, value: filter.type === 'date' ? { dateFrom: '', dateTo: '' } : '' }))));

    useEffect(() => {
    var filtered = values.filter((p) => {

      for (var dividerIdx in filters) {
        const divider = filters[dividerIdx];

        for (var filterIdx in divider) {
          const filter = divider[filterIdx];

          if (filter.type === 'text' && filter.value.trim()) {
            const query = filter.value.toLowerCase();
            if (!(filter.parameter(p) || '').toLowerCase().includes(query)) return false;
          }
          if (filter.type === 'date') {
            const entryDate = new Date(filter.parameter(p));
            const fromDate = filter.value.dateFrom ? new Date(filter.dateFrom) : null;
            const toDate = filter.value.dateTo ? new Date(filter.value.dateTo) : null;
            if (fromDate && entryDate < fromDate) return false;
            if (toDate && entryDate > toDate) return false;
          }
        }
      }
    });
    setFilteredValues(filtered);
  }, [values, filters, setFilteredValues]);

    return (
        <>
            {
            filters.map((divider, idx) => (
              <Stack key={idx} direction={{ xs: 'column', md: 'row' }} spacing={2} >
                {divider.map((filter, fidx) => (
                  <>
                    {
                      filter.type === 'date' ? (
                        <>

                          <TextField
                            type="date"
                            label="Entry Date From"
                            value={filter.value.dateFrom}
                            onChange={(e) => {
                              setFilters((prev) => {
                                const newFilters = [...prev];
                                newFilters[idx][fidx] = { ...newFilters[idx][fidx], value: { ...newFilters[idx][fidx].value, dateFrom: e.target.value } };
                                return newFilters;
                              });
                            }}
                            size="small"
                            fullWidth
                            InputLabelProps={{ shrink: true }}
                          />
                          <TextField


                            type="date"
                            label="Entry Date To"
                            value={filter.value.dateTo}
                            onChange={(e) => {
                              setFilters((prev) => {
                                const newFilters = [...prev];
                                newFilters[idx][fidx] = { ...newFilters[idx][fidx], value: { ...newFilters[idx][fidx].value, dateTo: e.target.value } };
                                return newFilters;
                              });
                            }}
                            size="small"
                            fullWidth
                            InputLabelProps={{ shrink: true }}
                          />
                        </>
                      ) : filter.render ? (
                        filter.render(fidx)
                      ) :  (
                        <TextField
                          label={filter.label}
                          value={filter.value}
                          onChange={(e) => {
                            setFilters((prev) => {
                              const newFilters = [...prev];
                              newFilters[idx][fidx] = { ...newFilters[idx][fidx], value: e.target.value };
                              return newFilters;
                            });
                          }}
                          size="small"
                          fullWidth
                        />
                      )
                    }
                  </>
                ))}
              </Stack>
            ))
          }
        </>
    );
}