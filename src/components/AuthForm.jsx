import React from 'react';
import { FaUserCircle, FaEnvelope, FaLock } from 'react-icons/fa';
const AuthForm = ({ title, fields, onSubmit, error, buttonText }) => { 
  const [formData, setFormData] = React.useState({}); 
  const handleChange = (e) => { 
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };
  return (
    <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
      <h2 className="text-2xl font-bold text-center mb-6">{title}</h2>
      {error && <p className="text-red-500 text-center mb-4">{error}</p>}
      {fields.map((field) => (
        <div key={field.name} className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor={field.name}>
            {field.label}
          </label>
          <div className="flex items-center border rounded-lg overflow-hidden">
            <span className="p-3 bg-gray-200 text-gray-500">
              {field.icon === 'user' && <FaUserCircle />}
              {field.icon === 'email' && <FaEnvelope />}
              {field.icon === 'lock' && <FaLock />}
            </span>
            <input
              className="appearance-none border-none w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none"
              id={field.name}
              type={field.type}
              name={field.name}
              placeholder={field.label}
              onChange={handleChange}
              required
            />
          </div>
        </div>
      ))}
      <button
        type="submit"
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:shadow-outline"
      >
        {buttonText}
      </button>
    </form>
  );
};
export default AuthForm;