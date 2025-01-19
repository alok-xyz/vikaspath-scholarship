import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const PrivateRoute = ({ children }) => {
  const isAuthenticated = sessionStorage.getItem('isAuthenticated') === 'true';
  const userType = sessionStorage.getItem('userType');
  const location = useLocation();
  
  if (!isAuthenticated) {
    // Determine where to redirect based on the current path
    if (location.pathname.includes('/admin')) {
      return <Navigate to="/admin-login" />;
    } else if (location.pathname.includes('/institution')) {
      return <Navigate to="/institution-login" />;
    } else {
      // For student routes or any other route
      return <Navigate to="/" />;
    }
  }

  // Check if user is trying to access the correct route type
  if (userType === 'admin' && !location.pathname.includes('/admin')) {
    return <Navigate to="/admin/dashboard" />;
  } else if (userType === 'institution' && !location.pathname.includes('/institution')) {
    return <Navigate to="/institution-dashboard" />;
  } else if (userType === 'student' && (location.pathname.includes('/admin') || location.pathname.includes('/institution'))) {
    return <Navigate to="/dashboard" />;
  }

  return children;
};

export default PrivateRoute;
