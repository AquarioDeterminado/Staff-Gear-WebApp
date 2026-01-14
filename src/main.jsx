import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom';
import './index.css'
import router from './routes';
import App from './App.jsx'
import NotificationProvider from './views/components/ui/NotificationProvider.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <NotificationProvider>
      <RouterProvider router={router} />
    </NotificationProvider>
  </StrictMode>,
)
