import React from 'react';
import { Navigate } from 'react-router-dom';
import Cookies from 'js-cookie';

const ProtectedRoute = ({ element, requiredRole }) => {
  const userRole = Cookies.get('aKaUser'); 
  
  if (!userRole || (requiredRole && userRole !== requiredRole)) {
    return <Navigate to='/login' replace />;
  }

  return element;
};

export default ProtectedRoute;
