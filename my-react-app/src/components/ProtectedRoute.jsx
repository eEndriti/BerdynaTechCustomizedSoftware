import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ role, children }) => {
  const userRole = localStorage.getItem('aKaUser');

  if (userRole === role) {
    return children;
  } else if (!userRole) {
    return <Navigate to="/login" replace />;
  } else {
    return <Navigate to="/login" replace />;
  }
};

export default ProtectedRoute;
