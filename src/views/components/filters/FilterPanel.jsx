/*
Painel expansível
*/
import { Card, CardHeader, CardContent, Collapse, IconButton, Button, Stack } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

export default function FilterPanel({
  title = 'Filters',
  expanded,
  onToggle,
  onClear,
  children,
  sx,
}) {
  return (
    <Card
      sx={{
        mb: 2,
        bgcolor: '#f7f7f7ff',
        border: '2px solid #fff7cbff',
        ...(sx || {}),
      }}
    >
      <CardHeader
        title={title}
        action={
          <IconButton onClick={onToggle} sx={{ p: 0 }} aria-label={expanded ? 'Collapse filters' : 'Expand filters'}>
            {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        }
        sx={{ pb: 0 }}
      />
      <Collapse in={expanded}>
        <CardContent>
          <Stack direction="column" spacing={2}>
            {children}
            {typeof onClear === 'function' && (
              <Button variant="outlined" onClick={onClear} sx={{ textTransform: 'none', fontWeight: 600 }}>
                Clear Filters
              </Button>
            )}
          </Stack>
        </CardContent>
      </Collapse>
    </Card>
  );
}
