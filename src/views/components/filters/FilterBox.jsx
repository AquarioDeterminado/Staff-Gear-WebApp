/*
Caixa lateral
*/
import { Card, CardHeader, CardContent, Button, Stack } from '@mui/material';

export default function SideFilter({
  title = 'Filters',
  sticky = false,
  width,
  onClear,
  children,
  sx,
}) {
  return (
    <Card
      sx={{
        mb: 2,
        bgcolor: '#fff3e0',
        border: '1px solid #ffe0b2',
        borderRadius: '8px',
        position: sticky ? 'sticky' : 'static',
        top: sticky ? 16 : 'auto',
        width,
        boxShadow: '0 2px 8px rgba(255, 152, 0, 0.08)',
        transition: 'all 0.3s ease',
        '&:hover': {
          boxShadow: '0 4px 12px rgba(255, 152, 0, 0.12)',
        },
        color: '#000000',
        ...(sx || {}),
      }}
    >
      <CardHeader title={title} sx={{ pb: 0, '& .MuiCardHeader-title': { fontWeight: 600, color: '#000000' } }} />
      <CardContent>
        <Stack direction="column" spacing={2}>
          {children}
          {typeof onClear === 'function' && (
            <Button
              variant="contained"
              onClick={onClear}
              sx={{ 
                bgcolor: '#000000',
                color: '#ffffff',
                '&:hover': {
                  bgcolor: '#212121',
                }
              }}
            >
              Clear Filters
            </Button>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}
