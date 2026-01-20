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
          minHeight: 40, py: 0.5, px: 2.5, m: 0.5,
          borderRadius: 1, textTransform: 'none',
          fontWeight: 600, fontSize: 14, color: '#000',
          bgcolor: '#fff3e0', transition: 'all 0.3s ease',
          border: '1px solid #ff9800',
          '&:hover': {
            bgcolor: '#ffe0b2',
          }
        },
        '& .MuiTab-root.Mui-selected': {
          bgcolor: '#ff9800', 
          color: '#000', 
          fontWeight: 700,
          border: '1px solid #ff9800',
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
