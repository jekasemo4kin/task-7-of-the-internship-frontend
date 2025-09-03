import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';
import AuthForm from '../components/AuthForm';
const registerFields = [
  { name: 'name', label: 'Name', type: 'text', icon: 'user' },
  { name: 'email', label: 'Email', type: 'email', icon: 'email' },
  { name: 'password', label: 'Password', type: 'password', icon: 'lock' },
  { name: 'adminCode', label: 'Admin Code (optional)', type: 'password', icon: 'lock' },
];
function RegisterPage() {
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  const handleRegister = async (formData) => {
    try {
      await api.post('/auth/register', formData);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    }
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <AuthForm
        title="Create a new account"
        fields={registerFields}
        onSubmit={handleRegister}
        error={error}
        buttonText="Register"
      />
    </div>
  );
}
export default RegisterPage;