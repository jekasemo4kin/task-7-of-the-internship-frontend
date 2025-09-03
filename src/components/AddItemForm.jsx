import React, { useState, useEffect } from 'react';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';
import { formatFormData } from '../utils/formData';
import { validateCustomId } from '../utils/validation';

function AddItemForm({ inventoryId, onAddItem, onCancel, inventory }) {
    const customFields = inventory?.customFields || [];
    const initialFormData = (customFields).reduce((acc, field) => {
        if (field.type === 'BOOLEAN') {
            acc[field.name] = false;
        } else {
            acc[field.name] = '';
        }
        return acc;
    }, {});

    const [formData, setFormData] = useState(initialFormData);
    const [customIdValue, setCustomIdValue] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [validationError, setValidationError] = useState('');
    const { token } = useAuth();
    
    useEffect(() => {
        setFormData(initialFormData);
        setCustomIdValue('');
        setValidationError('');
    }, [inventoryId]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleCustomIdChange = (e) => {
        setCustomIdValue(e.target.value);
        setValidationError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setValidationError('');

        if (inventory?.customIdConfig?.length > 0 && customIdValue){
            const isValid = validateCustomId(customIdValue, inventory.customIdConfig);
            if (!isValid) {
                setValidationError('Custom ID does not match the required format.');
                setLoading(false);
                return;
            }
        }

        try {
            const customDataToSend = formatFormData(formData, customFields);
            const requestBody = {
                customData: customDataToSend,
                inventoryId: inventoryId,
            };
            
            if (customIdValue) {
                requestBody.customId = customIdValue;
            }

            const response = await api.post(`items/${inventoryId}`, requestBody);
            onAddItem(response.data);
            setFormData(initialFormData);
            setCustomIdValue('');
        } catch (err) {
            console.error('Failed to add item:', err);
            if (err.response?.data?.error === 'Custom ID already exists.') {
                setValidationError('This Custom ID already exists.');
            } else {
                setError('Failed to add item. Please check your data.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md mt-4">
            {error && <p className="text-red-500 mb-4">{error}</p>}
            
            {inventory?.customIdConfig?.length > 0 && (
                <div className="mb-4">
                    <label className="block text-gray-700 font-bold mb-2">Custom ID</label>
                    <input
                        type="text"
                        name="customId"
                        value={customIdValue}
                        onChange={handleCustomIdChange}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
                        placeholder="Leave blank to auto-generate"
                    />
                    {validationError && <p className="text-red-500 text-sm mt-2">{validationError}</p>}
                </div>
            )}

            {customFields.length > 0 ? (
                customFields.map((field) => (
                    <div key={field.id} className="mb-4">
                        <label className="block text-gray-700 font-bold mb-2">{field.name}</label>
                        {field.type === 'SINGLE_LINE_TEXT' && (
                            <input
                                type="text"
                                name={field.name}
                                value={formData[field.name]}
                                onChange={handleChange}
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
                            />
                        )}
                        {field.type === 'MULTILINE_TEXT' && (
                            <textarea
                                name={field.name}
                                value={formData[field.name]}
                                onChange={handleChange}
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
                            ></textarea>
                        )}
                        {field.type === 'NUMBER' && (
                            <input
                                type="number"
                                name={field.name}
                                value={formData[field.name]}
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
                ))
            ) : (
                <p className="text-gray-500">No custom fields defined for this inventory.</p>
            )}

            <div className="flex justify-end space-x-2 mt-4">
                <button
                    type="submit"
                    disabled={loading}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                    {loading ? 'Adding...' : 'Add Item'}
                </button>
                <button
                    type="button"
                    onClick={onCancel}
                    className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
                >
                    Cancel
                </button>
            </div>
        </form>
    );
}

export default AddItemForm;