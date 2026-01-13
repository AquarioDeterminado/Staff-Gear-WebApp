/*
Drawer lateral para detalhes
*/
import React from 'react';
import { Drawer, Box, Typography, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

export default function DetailsDrawer({ open, onClose, title, width = 450, children }) {
  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box sx={{ width, p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>{title}</Typography>
          <IconButton onClick={onClose} size="small"><CloseIcon /></IconButton>
        </Box>
        {children}
      </Box>
    </Drawer>
  );
}
