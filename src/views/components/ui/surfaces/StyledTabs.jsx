/*
Abas para navegação entre seções
presentes em AdminConsole, HRRecords e
EmployeeRecords
*/
import { Tabs, Tab } from '@mui/material';

export function StyledTabs(props) {
  return (
    <Tabs
      {...props}
      TabIndicatorProps={{ style: { display: 'none' } }}
      sx={{
        '& .MuiTab-root': {
          minHeight: 36, py: 0.5, px: 2, m: 0.5,
          borderRadius: 0.75, textTransform: 'none',
          fontWeight: 600, fontSize: 14, color: '#666',
          bgcolor: '#f5f5f5', transition: 'all 0.3s ease',
        },
        '& .MuiTab-root.Mui-selected': {
          bgcolor: '#ff9800', color: '#fff', fontWeight: 700,
          boxShadow: '0 2px 8px rgba(255,152,0,0.3)',
        },
        ...(props.sx || {}),
      }}
    />
  );
}

export function StyledTab(props) {
  return <Tab disableRipple {...props} />;
}
