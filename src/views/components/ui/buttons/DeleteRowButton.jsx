import React from 'react';
import { IconButton } from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';

export const DeleteRowButton = ({ setConfirmIndex, setConfirmOpen, idx }) => (
  <IconButton
              onClick={() => {
                setConfirmIndex(idx);
                setConfirmOpen(true);
              }}
              sx={{ bgcolor: '#fff5e6', color: '#333', '&:hover': { bgcolor: '#ffe0b2', color: '#000' } }}
              size="small"
            >
              <DeleteOutlineIcon />
            </IconButton>
);