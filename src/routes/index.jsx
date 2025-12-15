import { createBrowserRouter, createRoutesFromElements, Route } from 'react-router-dom';
import Home from '../views/pages/Home';
import CandidatesList from '../views/pages/CandidatesList';
import EmployeeProfile from '../views/pages/EmployeeProfile';
import HistoryList from '../views/pages/HistoryList';
import EmployeesList from '../views/pages/EmployeesList';


// ==============================|| ROUTING RENDER ||============================== //

const router = createBrowserRouter(createRoutesFromElements (
        <>
            <Route path="/" element={ <Home />} />
            <Route path="/candidates" element={ <CandidatesList />} />
            <Route path="/profile" element={ <EmployeeProfile />} />
            <Route path="/history" element={ <HistoryList />} />
            <Route path="/employees" element={ <EmployeesList />} />

            {/* SÓ PARA TESTE */}

        </>
    )
);

export default router;
