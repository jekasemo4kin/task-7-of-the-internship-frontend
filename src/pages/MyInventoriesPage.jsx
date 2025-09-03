import React, { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import api from '../api/api';
import InventoryCard from '../components/InventoryCard';
import { useAuth } from '../context/AuthContext';
import { FaPlus } from 'react-icons/fa';

function MyInventoriesPage() {
    const [inventories, setInventories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const queryParams = new URLSearchParams(location.search);
    const mode = queryParams.get('mode') || 'owned';

    useEffect(() => {
        const fetchMyInventories = async () => {
            setLoading(true);
            setError(null);
            try {
                const filters = {};
                
                const search = queryParams.get('search');
                if (search) filters.search = search;

                const category = queryParams.get('category');
                if (category && category !== 'ALL') filters.category = category;

                const tags = queryParams.get('tags');
                if (tags) filters.tags = tags.split(',');

                const sortBy = queryParams.get('sortBy');
                if (sortBy) filters.sortBy = sortBy;

                let response;
                if (mode === 'owned') {
                    response = await api.get('/inventories/my', { params: filters });
                } else {
                    const author = queryParams.get('author');
                    if (author) filters.author = author;
                    response = await api.get('/inventories/with-access', { params: filters });
                }
                setInventories(response.data);
            } catch (err) {
                setError('Не удалось загрузить ваши инвентари.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchMyInventories();
        }
    }, [user, location.search, mode]);

    const handleModeChange = (newMode) => {
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.set('mode', newMode);
        if (newMode === 'owned') {
          newUrl.searchParams.delete('author');
        }
        navigate(newUrl.pathname + newUrl.search);
    };

    if (loading) {
        return <div className="text-center mt-10">Загрузка ваших инвентарей...</div>;
    }

    if (error) {
        return <div className="text-center mt-10 text-red-500">{error}</div>;
    }
return (
    <div className="container mx-auto p-4">
        <h1 className="text-4xl font-bold text-center my-8">Мои инвентари</h1>
        <div className="flex justify-between items-center mb-6 space-x-4">
            <div className="w-1/3"></div>
            <div className="flex justify-center space-x-4 w-1/3">
                {user.role !== 'ADMIN' && (
                <button
                    onClick={() => handleModeChange('access')}
                    className={`px-6 py-3 rounded-lg font-bold transition duration-300 ${
                        mode === 'access' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                    }`}
                >
                    Есть доступ
                </button>
                )}
                <button
                    onClick={() => handleModeChange('owned')}
                    className={`px-6 py-3 rounded-lg font-bold transition duration-300 ${
                        mode === 'owned' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                    }`}
                >
                    Личные
                </button>
            </div>
            <div className="flex justify-end w-1/3">
                {mode === 'owned' && (
                    <Link to="/inventories/new" className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition duration-300">
                        + Создать новый инвентарь
                    </Link>
                )}
            </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {inventories.length > 0 ? (
                inventories.map((inventory) => (
                    <InventoryCard key={inventory.id} inventory={inventory} />
                ))
            ) : (
                <p className="col-span-3 text-center text-gray-500">Инвентари не найдены.</p>
            )}
        </div>
    </div>
);
}

export default MyInventoriesPage;