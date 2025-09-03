import React, { useState } from 'react';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';
import { formatFormData } from '../utils/formData';
function EditItemForm({ item, onUpdateItem, onCancel }) {
    const [formData, setFormData] = useState(item.customData || {});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { token } = useAuth();
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };
      const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const updatedCustomData = formatFormData(formData, item.inventory.customFields);
      const updatedItemData = {
        customData: updatedCustomData,
        version: item.version,
      };
      const response = await api.put(`items/${item.id}`, updatedItemData);
      onUpdateItem(response.data);
      onCancel();
    } catch (err) {
      if (err.response && err.response.status === 409) {
        setError('Ошибка: кто-то уже обновил этот товар. Пожалуйста, обновите страницу и попробуйте снова.');
      } else {
        console.error('Failed to update item:', err);
        setError('Не удалось обновить товар.');
      }
    } finally {
      setLoading(false);
    }
  };
    return (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md mt-4">
            {error && <p className="text-red-500 mb-4">{error}</p>}
            {item.inventory?.customFields.map((field) => (
                <div key={field.id} className="mb-4">
                    <label className="block text-gray-700 font-bold mb-2">{field.name}</label>
                    {field.type === 'SINGLE_LINE_TEXT' && (
                        <input
                            type="text"
                            name={field.name}
                            value={formData[field.name] || ''}
                            onChange={handleChange}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
                        />
                    )}
                    {field.type === 'MULTILINE_TEXT' && (
                        <textarea
                            name={field.name}
                            value={formData[field.name] || ''}
                            onChange={handleChange}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
                        ></textarea>
                    )}
                    {field.type === 'NUMBER' && (
                        <input
                            type="number"
                            name={field.name}
                            value={formData[field.name] || ''}
                            onChange={handleChange}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
                        />
                    )}
                    {field.type === 'BOOLEAN' && (
                        <input
                            type="checkbox"
                            name={field.name}
                            checked={formData[field.name]}
                            onChange={handleChange}
                            className="form-checkbox h-5 w-5 text-blue-600"
                        />
                    )}
                </div>
            ))}
            <div className="flex space-x-4">
                <button
                    type="submit"
                    disabled={loading}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                >
                    {loading ? 'Сохранение...' : 'Сохранить изменения'}
                </button>
                <button
                    type="button"
                    onClick={onCancel}
                    className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                >
                    Отмена
                </button>
            </div>
        </form>
    );
}
export default EditItemForm;