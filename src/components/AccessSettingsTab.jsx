import React, { useState, useEffect } from 'react';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';
import { FaSave, FaTimes } from 'react-icons/fa';

const AccessSettingsTab = ({ inventory, onSave, onCancel }) => {
    const [isPublic, setIsPublic] = useState(inventory.isPublic);
    const [allUsers, setAllUsers] = useState([]);
    const [accessRights, setAccessRights] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user } = useAuth();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const initialAccessRights = inventory.accessRights || [];
                if (!isPublic) {
                    const usersRes = await api.get('/users');
                    setAllUsers(usersRes.data);
                    setAccessRights(usersRes.data.map(u => {
                        const existingRight = initialAccessRights.find(ar => ar.userId === u.id);
                        return {
                            userId: u.id,
                            canWrite: existingRight ? existingRight.canWrite : false,
                        };
                    }));
                }
                setLoading(false);
            } catch (err) {
                setError('Failed to fetch user data.');
                console.error(err);
                setLoading(false);
            }
        };

        fetchData();
    }, [inventory, isPublic]);

    const handleIsPublicChange = (e) => {
        setIsPublic(e.target.checked);
    };

    const handleAccessRightChange = (userId, canWrite) => {
        setAccessRights(prevRights => {
            const existingIndex = prevRights.findIndex(ar => ar.userId === userId);
            if (existingIndex > -1) {
                const newRights = [...prevRights];
                newRights[existingIndex] = { ...newRights[existingIndex], canWrite };
                return newRights;
            } else {
                return [...prevRights, { userId, canWrite }];
            }
        });
    };

    const handleSave = async () => {
        try {
            const dataToSave = {
                isPublic,
                accessRights: isPublic ? [] : accessRights,
            };
            await api.put(`/inventories/${inventory.id}/access-settings`, dataToSave);
            onSave();
        } catch (err) {
            setError('Failed to save access settings.');
            console.error(err);
        }
    };

    const isSpecialUser = (currentUserId) => {
        return inventory.createdById === currentUserId || (allUsers.find(u => u.id === currentUserId)?.role === 'ADMIN');
    };

    if (loading) {
        return <div className="text-center mt-10">Loading access settings...</div>;
    }

    if (error) {
        return <div className="text-center mt-10 text-red-500">{error}</div>;
    }

    return (
        <div className="bg-white p-6 rounded-lg shadow-md mt-4">
            <h2 className="text-2xl font-bold mb-4">Настройки доступа</h2>
            
            <div className="flex items-center space-x-2 mb-6">
                <input
                    type="checkbox"
                    id="isPublic"
                    name="isPublic"
                    checked={isPublic}
                    onChange={handleIsPublicChange}
                    className="h-5 w-5 text-blue-600 rounded"
                />
                <label htmlFor="isPublic" className="text-lg font-medium text-gray-700">
                    Публичный инвентарь
                </label>
            </div>

            {!isPublic && (
                <div>
                    <h3 className="text-xl font-semibold mb-4 text-center">Права доступа для приватного инвентаря</h3>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Имя
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Почта
                                    </th>
                                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-center">
                                        Право на запись
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {allUsers.map((u) => {
                                    const canWrite = isSpecialUser(u.id) || (accessRights.find(ar => ar.userId === u.id)?.canWrite || false);
                                    return (
                                        <tr key={u.id}>
                                            <td className="px-6 py-4 whitespace-nowrap">{u.name || 'N/A'}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">{u.email}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                <input
                                                    type="checkbox"
                                                    checked={canWrite}
                                                    onChange={(e) => handleAccessRightChange(u.id, e.target.checked)}
                                                    className="h-5 w-5 text-blue-600 rounded"
                                                    disabled={isSpecialUser(u.id)}
                                                />
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
            
            <div className="mt-6 flex justify-end space-x-4">
                <button
                    onClick={handleSave}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
                >
                    <FaSave />
                    <span>Сохранить</span>
                </button>
                <button
                    onClick={onCancel}
                    className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 flex items-center space-x-2"
                >
                    <FaTimes />
                    <span>Отмена</span>
                </button>
            </div>
        </div>
    );
};

export default AccessSettingsTab;