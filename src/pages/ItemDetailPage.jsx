import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';
import { FaTrash, FaEdit, FaSave, FaTimes, FaArrowLeft } from 'react-icons/fa';
import LikesSection from '../components/LikesSection';
import CommentsSection from '../components/CommentsSection';
import { validateCustomId } from '../utils/validation';

function ItemDetailPage() {
    const { itemId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [item, setItem] = useState(null);
    const [inventory, setInventory] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editedCustomData, setEditedCustomData] = useState({});
    const [editedCustomId, setEditedCustomId] = useState('');
    const [validationError, setValidationError] = useState('');

    useEffect(() => {
        const fetchItemAndInventory = async () => {
            try {
                const itemRes = await api.get(`/items/details/${itemId}`);
                setItem(itemRes.data);
                setInventory(itemRes.data.inventory);
                setEditedCustomData(itemRes.data.customData || {});
                setEditedCustomId(itemRes.data.customId || '');
            } catch (err) {
                setError('Failed to fetch item data.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchItemAndInventory();
    }, [itemId]);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setEditedCustomData(prevData => ({
            ...prevData,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleCustomIdChange = (e) => {
        setEditedCustomId(e.target.value);
        setValidationError('');
    };

    const handleSave = async () => {
        setValidationError('');

        if (inventory?.customIdConfig && editedCustomId) {
            const isValid = validateCustomId(editedCustomId, inventory.customIdConfig);
            if (!isValid) {
                setValidationError('Custom ID does not match the required format.');
                return;
            }
        }

        try {
            const dataToUpdate = {
                customData: editedCustomData,
                customId: editedCustomId,
                version: item.version,
            };
            const response = await api.put(`/items/${itemId}`, dataToUpdate);
            setIsEditing(false);
            setItem(response.data);
            setEditedCustomData(response.data.customData || {});
            setEditedCustomId(response.data.customId || '');
        } catch (err) {
            console.error('Failed to save item changes:', err);
            if (err.response?.data?.error === 'Custom ID already exists.') {
                setValidationError('This Custom ID already exists.');
            } else {
                setError('Failed to save item changes.');
            }
        }
    };

    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to delete this item?')) {
            try {
                await api.delete(`/items/${itemId}`);
                navigate(`/inventories/${item.inventory.id}`);
            } catch (err) {
                console.error('Failed to delete item:', err);
                setError('Failed to delete item.');
            }
        }
    };

    const handleBackClick = () => {
        if (inventory) {
            navigate(`/inventories/${inventory.id}/items`);
        }
    };

    if (loading) return <div className="text-center mt-10">Loading...</div>;
    if (error) return <div className="text-center mt-10 text-red-500">{error}</div>;
    if (!item || !inventory) return <div className="text-center mt-10">Item or inventory not found.</div>;

    const canEdit = user && (user.role === 'ADMIN' || user.id === inventory.createdById || inventory.isPublic || (inventory.accessRights && inventory.accessRights.some(ar => ar.userId === user.id && ar.canWrite)));
    
    const getFieldValue = (field) => {
        const value = editedCustomData[field.name] ?? item.customData[field.name];
        if (field.type === 'BOOLEAN') {
            return value === true ? 'Yes' : 'No';
        }
        return value || '';
    };

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-4xl font-bold text-center my-6">
                Item Details
            </h1>
            <div className="flex justify-between items-center mb-4">
                <button
                    onClick={handleBackClick}
                    className="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-400 flex items-center space-x-2"
                >
                    <FaArrowLeft />
                    <span>Back to Inventory</span>
                </button>
                {canEdit && (
                    <div className="flex space-x-4">
                        {isEditing ? (
                            <>
                                <button
                                    onClick={handleSave}
                                    className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 flex items-center space-x-2"
                                >
                                    <FaSave />
                                    <span>Save</span>
                                </button>
                                <button
                                    onClick={() => {
                                        setIsEditing(false);
                                        setEditedCustomData(item.customData || {});
                                        setEditedCustomId(item.customId || '');
                                        setValidationError('');
                                    }}
                                    className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 flex items-center space-x-2"
                                >
                                    <FaTimes />
                                    <span>Cancel</span>
                                </button>
                            </>
                        ) : (
                            <>
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
                                >
                                    <FaEdit />
                                    <span>Edit</span>
                                </button>
                                <button
                                    onClick={handleDelete}
                                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center space-x-2"
                                >
                                    <FaTrash />
                                    <span>Delete</span>
                                </button>
                            </>
                        )}
                    </div>
                )}
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 border rounded-lg">
                        <h3 className="text-xl font-semibold mb-2">General Information</h3>
                        {inventory?.customIdConfig && (
                            <div className="mb-2">
                                <label className="font-medium text-gray-700">Custom ID:</label>
                                {isEditing ? (
                                    <>
                                        <input
                                            type="text"
                                            value={editedCustomId}
                                            onChange={handleCustomIdChange}
                                            className="w-full border rounded px-2 py-1 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                        {validationError && <p className="text-red-500 text-sm mt-1">{validationError}</p>}
                                    </>
                                ) : (
                                    <p className="text-gray-700 mt-1">{item.customId || 'No custom ID'}</p>
                                )}
                            </div>
                        )}
                        <p className="text-gray-700"><span className="font-medium">Internal ID:</span> {item.id}</p>
                        {item.name && <p className="text-gray-700"><span className="font-medium">Name:</span> {item.name}</p>}
                        {item.createdAt && <p className="text-gray-700"><span className="font-medium">Created At:</span> {new Date(item.createdAt).toLocaleString()}</p>}
                    </div>
                    {inventory.customFields?.length > 0 && (
                        <div className="p-4 border rounded-lg">
                            <h3 className="text-xl font-semibold mb-2">Custom Fields</h3>
                            <div className="grid grid-cols-1 gap-2">
                                {inventory.customFields.map(field => (
                                    <div key={field.id} className="flex items-center space-x-2">
                                        <label className="font-medium text-gray-700 w-1/3 truncate" title={field.name}>{field.name}:</label>
                                        <div className="flex-grow min-w-0 flex items-center" style={{ minHeight: '1.5rem' }}>
                                            {isEditing ? (
                                                field.type === 'BOOLEAN' ? (
                                                    <div className="flex-grow flex items-center flex-shrink-0">
                                                        <input
                                                            type="checkbox"
                                                            name={field.name}
                                                            checked={editedCustomData[field.name] === true || editedCustomData[field.name] === 'true'}
                                                            onChange={handleInputChange}
                                                            className="h-5 w-5 text-blue-600 rounded focus:ring-transparent focus:ring-0 focus:border-transparent"
                                                        />
                                                    </div>
                                                ) : (
                                                    <input
                                                        type={field.type === 'NUMBER' ? 'number' : 'text'}
                                                        name={field.name}
                                                        value={editedCustomData[field.name] || ''}
                                                        onChange={handleInputChange}
                                                        className="w-full border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    />
                                                )
                                            ) : (
                                                <p className="text-gray-600 ">{getFieldValue(field)}</p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <LikesSection itemId={item.id} likes={item.likes} canEdit={canEdit} />
            <CommentsSection itemId={item.id} hasWriteAccess={canEdit} />
        </div>
    );
}

export default ItemDetailPage;