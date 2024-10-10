import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children }) => {
  // Get the token from localStorage
  const token = localStorage.getItem('token');

  // Check if token exists; if not, redirect to login page
  return token ? children : <Navigate to="/" />;
};

export default PrivateRoute;
