import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../api/api';
import InventoryCard from '../components/InventoryCard';
const CATEGORY_LABELS = {
  FURNITURE: 'Мебель',
  APPLIANCES: 'Техника',
  TRANSPORT: 'Транспорт',
  FOOD: 'Продукты питания',
  CHEMICALS: 'Химия',
  OTHER: 'Прочее',
};
function MainPage() {
  const [inventories, setInventories] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pageTitle, setPageTitle] = useState('Все инвентари');
  const location = useLocation();
  useEffect(() => {
    const fetchInventories = async () => {
      setLoading(true);
      setError(null);
      try {
        const queryParams = new URLSearchParams(location.search);
        const filters = {};
        
        const search = queryParams.get('search');
        if (search) filters.search = search;

        const category = queryParams.get('category');
        if (category && category !== 'ALL') filters.category = category;

        const tags = queryParams.get('tags');
        if (tags) filters.tags = tags.split(',');

        const sortBy = queryParams.get('sortBy');
        if (sortBy) filters.sortBy = sortBy;

        const author = queryParams.get('author');
        if (author) filters.author = author;

        if (author) {
            setPageTitle(`Инвентари - ${author}`);
        } else {
            setPageTitle('Все инвентари');
        }

        const response = await api.get('/inventories', { params: filters });
        setInventories(response.data);
      } catch (err) {
        setError('Не удалось загрузить инвентари.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchInventories();
  }, [location.search]);

  if (loading) {
    return <div className="text-center mt-10">Загрузка инвентарей...</div>;
  }
  if (error) {
    return <div className="text-center mt-10 text-red-500">{error}</div>;
  }
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-4xl font-bold text-center my-8">{pageTitle}</h1>
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

export default MainPage;