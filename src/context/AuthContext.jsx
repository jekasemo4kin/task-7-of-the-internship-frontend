import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../api/api';
const AuthContext = createContext(); 
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);
  const fetchUser = async (authToken) => {
    try {
      const response = await api.get('/auth/me', {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      setUser(response.data.user);
    } catch (err) {
      console.error('Failed to fetch user data with token', err);
      logout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    if (token) {
      fetchUser(token);
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    setToken(response.data.token);
    localStorage.setItem('token', response.data.token);
    
    setUser(response.data.user);
  };

  const logout = () => {
    setToken(null);
    localStorage.removeItem('token');
    setUser(null);
  };

  const loginWithToken = (oauthToken) => {
    setToken(oauthToken);
    localStorage.setItem('token', oauthToken);
  };

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    loginWithToken,
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
export const useAuth = () => { 
  return useContext(AuthContext);
};