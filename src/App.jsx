import React from 'react';
import { RouterProvider } from 'react-router-dom';
import router from './routes';
import Popups from './views/components/ui/Popups';

export default function App() {
  return (
    <>
      <RouterProvider router={router} />
      <Popups />
    </>
  );
}
