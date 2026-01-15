import React from 'react';
import { IconButton } from '@mui/material';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';

export const EditRowButton = ({ openEdit, idx }) => (
  <IconButton
              aria-label="edit"
              onClick={() => openEdit(idx)}
              sx={{ bgcolor: '#fff3e0', color: '#000000ff', '&:hover': { bgcolor: '#000000ff', color: '#fff' } }}
              size="small"
            >
              <EditOutlinedIcon />
            </IconButton>

);