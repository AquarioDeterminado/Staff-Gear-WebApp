import React from 'react';
import { IconButton } from '@mui/material';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';

export const EditRowButton = ({ openEdit, idx }) => (
  <IconButton
              aria-label="edit"
              onClick={() => openEdit(idx)}
              sx={{ bgcolor: '#fff5e6', color: '#333', '&:hover': { bgcolor: '#ffe0b2', color: '#000' } }}
              size="small"
            >
              <EditOutlinedIcon />
            </IconButton>

);