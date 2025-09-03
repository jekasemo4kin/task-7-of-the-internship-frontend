import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; 
import { useAuth } from '../context/AuthContext'; 
import AuthForm from '../components/AuthForm'; 
import { FaGoogle, FaFacebook } from 'react-icons/fa';
const loginFields = [
  { name: 'email', label: 'Email', type: 'email', icon: 'email' },
  { name: 'password', label: 'Password', type: 'password', icon: 'lock' },
];
function LoginPage() {
  const { login } = useAuth(); 
  const navigate = useNavigate(); 
  const [error, setError] = useState(null); 

  const handleLogin = async ({ email, password }) => {
    try {
      await login(email, password);
      navigate('/'); 
    } catch (err) {
      setError('Invalid credentials. Please try again.'); 
    }
  };
  const handleGoogleLogin = () => {
    window.location.href = `${import.meta.env.VITE_BACKEND_URL}/api/auth/google`;
  };

  const handleFacebookLogin = () => {
    window.location.href = `${import.meta.env.VITE_BACKEND_URL}/api/auth/facebook`;
  };
  // window.location.href = `${import.meta.env.VITE_BACKEND_URL}/api/auth/google`;
  // baseURL: import.meta.env.REACT_APP_BACKEND_URL + '/api',
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md">
        <AuthForm
          title="Login to your account"
          fields={loginFields}
          onSubmit={handleLogin}
          error={error}
          buttonText="Login"
        />
        <div className="mt-4 text-center">
          <p className="mb-2 text-gray-600">Or login with</p>
          <div className="flex justify-center space-x-4">
            <button
              onClick={handleGoogleLogin}
              className="flex items-center justify-center bg-white border border-gray-300 rounded-lg shadow-sm px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <FaGoogle className="mr-2" /> Google
            </button>
            <button
              onClick={handleFacebookLogin}
              className="flex items-center justify-center bg-white border border-gray-300 rounded-lg shadow-sm px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <FaFacebook className="mr-2" /> Facebook
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;