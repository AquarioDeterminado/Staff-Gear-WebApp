import React, { createContext, useCallback, useContext, useState } from 'react';
import { Snackbar, Alert } from '@mui/material';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const [state, setState] = useState({ open: false, message: '', severity: 'info', duration: 6000 });

  const showNotification = useCallback(({ message, severity = 'error', duration = 6000 }) => {
    setState({ open: true, message: String(message ?? ''), severity, duration });
  }, []);

  const handleClose = (_, reason) => {
    if (reason === 'clickaway') return;
    setState((s) => ({ ...s, open: false }));
  };

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      <Snackbar
        open={state.open}
        autoHideDuration={state.duration}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleClose} severity={state.severity} sx={{ width: '100%' }} variant="filled">
          {state.message}
        </Alert>
      </Snackbar>
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotification must be used within NotificationProvider');
  return ctx.showNotification;
};

export default NotificationProvider;
