import { createBrowserRouter, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './components/Login';
import FaqjaKryesore from './components/FaqjaKryesore'
import ProtectedRoute from './components/ProtectedRoute';
import NotFound from './components/NotFound'; 
import Shitje from './components/Shitje';
import Shpenzim from './components/Shpenzim'
import Blerje from './components/Blerje';
import Produktet from './components/Produktet';
import Kategorite from './components/Kategorite'
import Furnitor from './components/Furnitor';
import Klient from './components/Klient';
import Blerjet from './components/Blerjet';
import Shitjet from './components/Shitjet';
import DetajePerKlient from './DetajePerKlient';

let aKaUser = localStorage.getItem('aKaUser')

const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        path: '/faqjakryesore',
       /* element: (
          <ProtectedRoute role="admin">
            <FaqjaKryesoreAdmin />
          </ProtectedRoute>
          
        ),*/element:<FaqjaKryesore />
      },
      {
        path: '/shitje',
        element:<Shitje />
      },
      {
        path: '/shpenzim',
        element:<Shpenzim />
      },
      {
        path: '/blerje',
        element:<Blerje />
      },
      {
        path: '/stoku',
        element:<Produktet />
      },{
        path: '/kategorite',
        element:<Kategorite />
      },
      {
        path: '/klient',
        element:<Klient />
      },
      {
        path: '/furnitor',
        element:<Furnitor />
      },
      {
        path: '/blerjet',
        element:<Blerjet />
      },
      {
        path: '/shitjet',
        element:<Shitjet />
      },
      {
        path: '/detajePerKlient/:subjektiID',
        element:<DetajePerKlient />
      },
      {
        path: '/',
        element: (
          <Navigate
            to='/faqjaKryesore'
            replace
          />
        ),
      },
      {
        path: '*',
        element: <NotFound />, // Catch-all route for undefined paths
      },
    ],
  },
]);

export default router;
