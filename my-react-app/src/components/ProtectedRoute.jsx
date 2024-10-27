import { Navigate } from 'react-router-dom';
import useAuthData from '../useAuthData';

const ProtectedRoute = ({ role, children }) => {
  const {aKaUser} = useAuthData()

  if (aKaUser === role) {
    return children;
  } else if (!aKaUser) {
    return <Navigate to="/login" replace />;
  } else {
    return <Navigate to="/login" replace />;
  }
};

export default ProtectedRoute;
