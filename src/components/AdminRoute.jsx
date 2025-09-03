import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminRoute = () => {
  const { user, token } = useAuth();
  if (token && user?.role === 'ADMIN') {
    return <Outlet />;
  }
  return <Navigate to="/login" replace />;
};

export default AdminRoute;