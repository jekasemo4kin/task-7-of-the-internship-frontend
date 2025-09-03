import React, { useState, useEffect } from 'react';
import api from '../api/api';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const StatisticsTab = ({ inventoryId }) => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!inventoryId) {
            setLoading(false);
            return;
        }

        const fetchStats = async () => {
            try {
                setLoading(true);
                const res = await api.get(`/stats/${inventoryId}`);
                setStats(res.data.stats);
            } catch (err) {
                setError('Failed to load statistics.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [inventoryId]);

    if (loading) {
        return <div className="text-center mt-10">Загрузка статистики...</div>;
    }

    if (error) {
        return <div className="text-center mt-10 text-red-500">{error}</div>;
    }

    if (!stats) {
        return <div className="text-center mt-10">Статистика недоступна.</div>;
    }

    const numberFields = stats.numberFields || {};
    const textFields = stats.textFields || {};

    const hasNumberFields = Object.keys(numberFields).length > 0;
    const hasTextFields = Object.keys(textFields).length > 0;

    return (
        <div className="bg-white p-6 rounded-lg shadow-md mt-4">
            <h2 className="text-2xl font-bold mb-4 text-center">Инвентарная статистика</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-gray-50 p-4 rounded-lg shadow-inner">
                    <h3 className="text-xl font-semibold mb-2">Комментарии и лайки</h3>
                    <p className="text-gray-700">
                        Максимальное количество лайков под товаром: 
                        <span className="font-bold text-blue-600 ml-2">{stats.likes?.maxLikes}</span>
                    </p>
                    <p className="text-gray-700">
                        Максимальное количество комментариев под товаром:
                        <span className="font-bold text-blue-600 ml-2">{stats.comments?.maxComments}</span>
                    </p>
                </div>
            </div>

            {hasNumberFields && (
                <div className="mb-6">
                    <h3 className="text-xl font-semibold mb-4 text-center">Числовые поля</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {Object.entries(numberFields).map(([fieldName, data]) => (
                            <div key={fieldName} className="bg-gray-50 p-4 rounded-lg shadow-inner">
                                <h4 className="font-bold text-lg mb-2 capitalize">{fieldName}</h4>
                                <p className="text-gray-700">
                                    <span className="font-medium">Диапазон:</span> {data.min} - {data.max}
                                </p>
                                <p className="text-gray-700">
                                    <span className="font-medium">Среднее значение:</span> {data.average}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {hasTextFields && (
                <div className="mb-6">
                    <h3 className="text-xl font-semibold mb-4 text-center">Текстовые поля (Топ-5 значений)</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {Object.entries(textFields).map(([fieldName, data]) => (
                            <div key={fieldName} className="bg-gray-50 p-4 rounded-lg shadow-inner">
                                <h4 className="font-bold text-lg mb-2 capitalize">{fieldName}</h4>
                                {data.length > 0 ? (
                                    <Bar
                                        data={{
                                            labels: data.map(d => d.value),
                                            datasets: [
                                                {
                                                    label: 'Количество повторений',
                                                    data: data.map(d => d.count),
                                                    backgroundColor: 'rgba(59, 130, 246, 0.6)',
                                                    borderColor: 'rgba(59, 130, 246, 1)',
                                                    borderWidth: 1,
                                                },
                                            ],
                                        }}
                                        options={{
                                            responsive: true,
                                            plugins: {
                                                legend: { display: false },
                                                title: {
                                                    display: true,
                                                    text: `Топ-5 для "${fieldName}"`,
                                                },
                                            },
                                        }}
                                    />
                                ) : (
                                    <p className="text-gray-500">Нет повторяющихся значений.</p>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {!hasNumberFields && !hasTextFields && (
                <p className="text-center text-gray-500">Нет числовых или текстовых полей для отображения статистики.</p>
            )}
        </div>
    );
};

export default StatisticsTab;