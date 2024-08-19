import { createBrowserRouter, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './components/Login';
import FaqjaKryesore from './components/FaqjaKryesore'
import ProtectedRoute from './components/ProtectedRoute';
import NotFound from './components/NotFound'; 
import Shitje from './components/Shitje';

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
        path: '/',
        element: (
          <Navigate
            to={
               aKaUser=== 'admin'
                ? '/faqjakryesoreadmin'
                : aKaUser === 'perdorues'
                ? '/faqjakryesoreUser'
                : '/login'
            }
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
