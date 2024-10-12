import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const PrivateUserRoute = ({ children }) => { // Both admin and user can access this route
  // Get the token from localStorage
  const token = localStorage.getItem('token');

  const location = useLocation();
  return token ? children : <Navigate to="/" replace state={{from: location}}/>;
};

const PrivateAdminRoute = ({ children }) => { // Only admin can access this route
  // Get the token from localStorage
  const token = localStorage.getItem('token');

  const location = useLocation();
  return token && localStorage.getItem('role') === 'admin' ? children :  <Navigate to="/" replace state={{from: location}}/>;
};

export { PrivateUserRoute, PrivateAdminRoute };
