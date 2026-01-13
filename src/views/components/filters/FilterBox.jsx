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
        border: '2px solid #ffe0b2',
        position: sticky ? 'sticky' : 'static',
        top: sticky ? 16 : 'auto',
        width,
        ...(sx || {}),
      }}
    >
      <CardHeader title={title} sx={{ pb: 0 }} />
      <CardContent>
        <Stack direction="column" spacing={2}>
          {children}
          {typeof onClear === 'function' && (
            <Button
              variant="outlined"
              onClick={onClear}
              sx={{ textTransform: 'none', fontWeight: 700, borderColor: '#000', color: '#000' }}
            >
              Clear Filters
            </Button>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}
