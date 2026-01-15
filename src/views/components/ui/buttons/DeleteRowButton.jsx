import React from 'react';
import { IconButton } from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';

export const DeleteRowButton = ({ setConfirmIndex, setConfirmOpen, idx }) => (
  <IconButton
              onClick={() => {
                setConfirmIndex(idx);
                setConfirmOpen(true);
              }}
              sx={{ bgcolor: '#fff3e0', color: '#000000ff', '&:hover': { bgcolor: '#000000ff', color: '#fff' } }}
              size="small"
            >
              <DeleteOutlineIcon />
            </IconButton>
);