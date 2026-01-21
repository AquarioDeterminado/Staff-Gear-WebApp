import { createBrowserRouter, createRoutesFromElements, Route, Navigate } from 'react-router-dom';
import Home from '../views/pages/Home';
import LogInPage from '../views/pages/LogInPage';
import CandidatesList from '../views/pages/CandidatesList';
import EmployeeProfile from '../views/pages/EmployeeProfile';
import EmployeesList from '../views/pages/EmployeesList';
import EmployeeRecords from '../views/pages/EmployeeRecords';
import JobListingsPage from '../views/pages/JobListingsPage';
import JobListingDetailsPage from '../views/pages/JobListingDetailsPage';
import HRRecords from '../views/pages/HRRecords';
import AdminConsole from '../views/pages/AdminConsole';
import HRJobListings from '../views/pages/HRJobListings';
import PrivateRoute from '../views/components/routing/PrivateRoute';
import PublicRoute from '../views/components/routing/PublicRoute';
import HeaderBar from '../views/components/layout/HeaderBar';

// ==============================|| ROUTING RENDER ||============================== //

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route path="/" element={<PublicRoute><Home /></PublicRoute>} />
      <Route path="/login" element={<PublicRoute><LogInPage /></PublicRoute>} />
      <Route path="/job-listings" element={<JobListingsPage />} />
      <Route path="/job-listings/:id" element={<JobListingDetailsPage />} />
      <Route path="/hr/job-listings" element={<PrivateRoute><HRJobListings /></PrivateRoute>} />
      <Route path="/candidates" element={<PrivateRoute><CandidatesList /></PrivateRoute>} />
      <Route path="/profile" element={<PrivateRoute><EmployeeProfile /></PrivateRoute>} />
      <Route path="/employees" element={<PrivateRoute><EmployeesList /></PrivateRoute>} />
      <Route path="/records" element={<PrivateRoute><EmployeeRecords /></PrivateRoute>} />
      <Route path="/hr/records" element={<PrivateRoute><HRRecords /></PrivateRoute>} />
      <Route path="/admin" element={<PrivateRoute><AdminConsole /></PrivateRoute>} />
    </>
  )
);

export default router;