
import React, { useState, cloneElement } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from '@mui/material';

export default function Popups({
  title = 'Confirmar ação',
  message = 'Tens a certeza?',
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  confirmButtonSx = {
    bgcolor: '#000',
    color: '#fff',
    textTransform: 'none',
    fontWeight: 700,
    '&:hover': { bgcolor: '#222' },
  },
  children,   // deve ser UM único elemento (ex.: <IconButton/>)
  onConfirm,
}) {
  const [open, setOpen] = useState(false);

  const trigger = cloneElement(children, {
    onClick: async (e) => {
      if (children.props.onClick) {
        await children.props.onClick(e);
      }
      setOpen(true);
    },
  });

  const handleCancel = () => setOpen(false);

  const handleConfirm = async () => {
    try {
      await onConfirm?.();
    } finally {
      setOpen(false);
    }
  };

  return (
    <>
      {trigger}

      <Dialog open={open} onClose={handleCancel} fullWidth maxWidth="xs">
        <DialogTitle sx={{ fontWeight: 700 }}>{title}</DialogTitle>
        <DialogContent dividers>
          <Typography>{message}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancel} sx={{ textTransform: 'none' }}>
            {cancelLabel}
          </Button>
          <Button
            onClick={handleConfirm}
            variant="contained"
            sx={confirmButtonSx}
          >
            {confirmLabel}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )};
