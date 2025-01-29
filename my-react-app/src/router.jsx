import { createBrowserRouter, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './components/Login';
import FaqjaKryesore from './components/faqjaKryesore/FaqjaKryesore';
import ProtectedRoute from './components/ProtectedRoute';
import NotFound from './components/NotFound'; 
import Shitje from './components/Shitje';
import Shpenzim from './components/shpenzimi/Shpenzim';
import Blerje from './components/Blerje';
import Produktet from './components/Produktet';
import Kategorite from './components/Kategorite';
import Furnitor from './components/Furnitor';
import Klient from './components/Klient';
import Blerjet from './components/Blerjet';
import Shitjet from './components/Shitjet';
import DetajePerKlient from './components/DetajePerKlient';
import Evidenca from './components/Evidenca';
import Transaksionet from './components/Transaksionet';
import Serviset from './components/Serviset';
import DetajePerProdukt from './components/DetajePerProdukt';
import NdryshoShitjen from './components/NdryshoShitjen';
import Cookies from 'js-cookie';
import Administrimi from './components/Administrimi';
import PrintoLabell from './components/PrintoLabell';
import NdryshoBlerjen from './components/NdryshoBlerjen';

const isAuthenticated = () => {
  return !!Cookies.get('aKaUser'); 
};

const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/',
    element: isAuthenticated() ? <Layout /> : <Navigate to='/login' replace />,
    children: [
      {
        path: '/faqjakryesore',
        element: <FaqjaKryesore />,
      },
      {
        path: '/shitje',
        element: <Shitje />,
      },
      {
        path: '/ndryshoShitjen/:shitjeID',
        element: <NdryshoShitjen />,
      },
      {
        path: '/ndryshoBlerjen/:blerjeID',
        element: <NdryshoBlerjen />,
      },
      {
        path: '/shpenzim',
        element: <Shpenzim />,
      },
      {
        path: '/blerje',
        element: <Blerje />,
      },
      {
        path: '/serviset',
        element: <Serviset />,
      },
      {
        path: '/stoku',
        element: <Produktet />,
      },
      {
        path: '/detajePerProdukt/:produktiID',
        element: <DetajePerProdukt />,
      },
      {
        path: '/kategorite',
        element: <Kategorite />,
      },
      {
        path: '/klient',
        element: <Klient />,
      },
      {
        path: '/furnitor',
        element: <ProtectedRoute element={<Furnitor />} requiredRole="admin" />,
      },
      {
        path: '/blerjet',
        element: <Blerjet />,
      },
      {
        path: '/shitjet',
        element: <Shitjet />,
      },
      {
        path: '/detajePerSubjekt/:lloji/:subjektiID',
        element: <ProtectedRoute element={<DetajePerKlient />} requiredRole="admin" />,
      },
      {
        path: '/evidenca',
        element: <ProtectedRoute element={<Evidenca />} requiredRole="admin" />,
      },
      {
        path: '/transaksionet',
        element: <ProtectedRoute element={<Transaksionet />} requiredRole="admin" />,
      },
      {
        path: '/printoLabell',
        element: <PrintoLabell />,
      },
      // Protect the 'administrimi' route (only for admins)
      {
        path: '/administrimi',
        element: <ProtectedRoute element={<Administrimi />} requiredRole="admin" />,
      },
      {
        path: '/',
        element: <Navigate to='/faqjakryesore' replace />,
      },
      {
        path: '*',
        element: <NotFound />,
      },
    ],
  },
]);

export default router;
