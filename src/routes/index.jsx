import { createBrowserRouter, createRoutesFromElements, Route } from 'react-router-dom';
import Home from '../views/pages/Home';
import CandidatesList from '../views/pages/CandidatesList';
import EmployeeProfile from '../views/pages/EmployeeProfile';
import EmployeesList from '../views/pages/EmployeesList';
import EmployeeRecords from '../views/pages/EmployeeRecords';
import HeaderBar from '../views/components/HeaderBar';
import HRRecords from '../views/pages/HRRecords';
import AdminConsole from '../views/pages/AdminConsole';

// ==============================|| ROUTING RENDER ||============================== //

const router = createBrowserRouter(createRoutesFromElements (
        <>
            <Route path="/" element={ <Home />} />
            <Route path="/candidates" element={ <CandidatesList />} />
            <Route path="/profile" element={ <EmployeeProfile />} />
            <Route path="/employees" element={ <EmployeesList />} />
            <Route path="/records" element={<EmployeeRecords />} />
            <Route path="/hr/records" element={<HRRecords />} />
            <Route path="/admin" element={<AdminConsole />} />
            

        </>
    )
);

export default router;
