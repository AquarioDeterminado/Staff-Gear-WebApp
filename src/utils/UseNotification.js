import { useContext } from 'react';
import { Snackbar, Alert } from '@mui/material';
import React, { createContext } from 'react';

export const NotificationContext = createContext(null);

const useNotification = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotification must be used within NotificationProvider');
  return ctx.showNotification;
};

export default useNotification;
