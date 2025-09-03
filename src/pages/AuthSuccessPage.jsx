import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AuthSuccessPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { loginWithToken } = useAuth();

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const token = searchParams.get('token');

    if (token) {
      localStorage.setItem('token', token);
      loginWithToken(token);
      navigate('/');
    } else {
      navigate('/login');
    }
  }, [location, navigate, loginWithToken]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <p>Redirecting...</p>
    </div>
  );
};

export default AuthSuccessPage;