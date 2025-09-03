import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';
import ItemList from '../components/ItemList';
import AddItemForm from '../components/AddItemForm';
import CommentsSection from '../components/CommentsSection';
import ItemDetailPage from './ItemDetailPage';
import InventorySettingsTab from '../components/InventorySettingsTab';
import ReactMarkdown from 'react-markdown';
import AccessSettingsTab from '../components/AccessSettingsTab';
import CustomFieldsTab from '../components/CustomFieldsTab';
import StatisticsTab from '../components/StatisticsTab';
import CustomIdConfigTab from '../components/CustomIdConfigTab';

const PlaceholderComponent = ({ tabName }) => (
    <div className="bg-white p-6 rounded-lg shadow-md mt-4 text-center">
        <h2 className="text-2xl font-bold">Content for '{tabName}' Tab</h2>
        <p className="text-gray-600 mt-2">This tab is a placeholder for future implementation.</p>
    </div>
);
function InventoryDetailPage() {
    const { id, tab, itemId } = useParams();
    const navigate = useNavigate();
    const [inventory, setInventory] = useState(null);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState(tab || 'items');
    const [showAddItemForm, setShowAddItemForm] = useState(false);


    const hasWriteAccess = user && (user.role === 'ADMIN' || user.id === inventory?.createdById || inventory?.isPublic || (inventory?.accessRights && inventory.accessRights.some(ar => ar.userId === user.id && ar.canWrite)));
    const canEditSettings = user && (user.role === 'ADMIN' || user.id === inventory?.createdById);

    const TABS_FULL = {
        'items': 'Items',
        'discussion': 'Comments',
        'inventory-settings': 'Inventory Settings',
        'custom-id': 'Custom ID',
        'access-settings': 'Access Settings',
        'custom-fields': 'Custom Fields',
        'statistics': 'Statistics'
    };
    const TABS_LIMITED = {
        'items': 'Items',
        'discussion': 'Comments'
    };
    const TABS = canEditSettings ? TABS_FULL : TABS_LIMITED;

    useEffect(() => {
        if (id) {
            fetchInventoryData();
        }
    }, [id]);
    const fetchInventoryData = async () => {
        try {
            setLoading(true);
            const inventoryRes = await api.get(`/inventories/${id}`);
            setInventory(inventoryRes.data);
            const itemsRes = await api.get(`/items/${id}`);
            setItems(itemsRes.data);
        } catch (err) {
            setError('Failed to fetch inventory data.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        if (itemId) {
            setActiveTab(null);
        } else {
            setActiveTab(tab || 'items');
        }
        setShowAddItemForm(false);
    }, [tab, itemId]);

    const handleAddItem = (newItem) => {
        setItems((prevItems) => [...prevItems, newItem]);
        setShowAddItemForm(false);
    };

    const handleUpdateItems = async (itemsToUpdate) => {
        try {
            const updatedItems = await Promise.all(
                itemsToUpdate.map(item => api.put(`/items/${item.id}`, { customData: item.customData, customId: item.customId, version: item.version }))
            );
            setItems(prevItems => prevItems.map(item => {
                const updatedItem = updatedItems.find(i => i.data.id === item.id);
                return updatedItem ? updatedItem.data : item;
            }));
        } catch (err) {
            console.error('Failed to update items:', err);
        }
    };

    const handleRemoveItems = async (itemIds) => {
        try {
            await Promise.all(itemIds.map(itemId => api.delete(`/items/${itemId}`)));
            setItems(prevItems => prevItems.filter(item => !itemIds.includes(item.id)));
        } catch (err) {
            console.error('Failed to delete items:', err);
        }
    };
    
    const handleSaveSettings = async (formData) => {
        try {
            await api.put(`/inventories/${id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            await fetchInventoryData();
        } catch (err) {
            setError('Failed to save inventory settings.');
            console.error(err);
        }
    };

    const handleCancelSettings = () => {
        if (user) {
            navigate('/my-inventories');
        } else {
            navigate('/');
        }
    };
    const handleDeleteInventory = async () => {
        try {
            await api.delete(`/inventories/${id}`);
            navigate('/my-inventories');
        } catch (err) {
            setError('Failed to delete inventory.');
            console.error(err);
        }
    };

    const handleUpdateCustomIdConfig = async (newConfig) => {
        try {
            await api.put(`/inventories/${inventory.id}/custom-id-config`, { customIdConfig: newConfig });
            await fetchInventoryData();
        } catch (err) {
            console.error('Failed to update custom ID config:', err);
        }
    };

    if (loading) return <div className="text-center mt-10">Loading...</div>;
    if (error) return <div className="text-center mt-10 text-red-500">{error}</div>;
    if (!inventory) return <div className="text-center mt-10">Inventory not found.</div>;

    const renderTabContent = () => {
        if (itemId) {
            return <ItemDetailPage itemId={itemId} inventory={inventory} hasWriteAccess={hasWriteAccess} />;
        }

        switch (activeTab) {
            case 'items':
                return (
                    <>
                        <ItemList items={items} inventory={inventory} onUpdateItems={handleUpdateItems} onRemoveItems={handleRemoveItems} hasWriteAccess={hasWriteAccess} />
                        {hasWriteAccess && !showAddItemForm && (
                            <div className="flex justify-center mt-4">
                                <button
                                    onClick={() => setShowAddItemForm(true)}
                                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                                >
                                    Add Item
                                </button>
                            </div>
                        )}
                        {showAddItemForm && (
                            <AddItemForm
                                inventoryId={inventory.id}
                                inventory={inventory}
                                onAddItem={handleAddItem}
                                onCancel={() => setShowAddItemForm(false)}
                            />
                        )}
                    </>
                );
            case 'discussion':
                return <CommentsSection inventoryId={inventory.id} hasWriteAccess={hasWriteAccess} />;
            case 'inventory-settings':
                return canEditSettings ? (
                    <InventorySettingsTab
                        inventory={inventory}
                        onSave={handleSaveSettings}
                        onCancel={handleCancelSettings}
                        onDelete={handleDeleteInventory}
                    />
                ) : <PlaceholderComponent tabName={TABS[activeTab]} />;
            case 'custom-id':
                return canEditSettings ? ( 
        <CustomIdConfigTab 
            inventoryId={inventory.id} 
            initialConfig={inventory.customIdConfig} 
            canEdit={canEditSettings} 
            onSaveSuccess={fetchInventoryData}
        /> 
    ) : <PlaceholderComponent tabName={TABS[activeTab]} />;
            case 'access-settings':
                return canEditSettings ? (
        <AccessSettingsTab 
            inventory={inventory} 
            onSave={fetchInventoryData} 
            onCancel={handleCancelSettings}
        />
    ) : <PlaceholderComponent tabName={TABS[activeTab]} />;
            case 'custom-fields':
                return canEditSettings ? <CustomFieldsTab inventory={inventory} onUpdate={fetchInventoryData} /> : <PlaceholderComponent tabName={TABS[activeTab]} />;
            case 'statistics':
                return canEditSettings ? <StatisticsTab inventoryId={inventory.id} /> : <PlaceholderComponent tabName={TABS[activeTab]} />;
            default:
                return null;
        }
    };
    return (
        <div className="container mx-auto p-4">
            <h1 className="text-4xl font-bold text-center my-6">{inventory.title}</h1>
            <div className="text-center text-gray-600 mb-6 prose max-w-none">
                <ReactMarkdown> 
                    {inventory.description || ''} 
                </ReactMarkdown>
        </div>
              {inventory.tags && inventory.tags.length > 0 && (
        <div className="flex justify-center flex-wrap gap-2 mb-4">
          {inventory.tags.map((tag) => (
            <span key={tag.name} className="bg-blue-200 text-blue-800 px-3 py-1 rounded-full text-sm">
              {tag.name}
            </span>
          ))}
        </div>
      )}
      
            {inventory.imageUrl && (
                <div className="flex justify-center mb-6">
                    <img src={inventory.imageUrl} alt={inventory.title} className="max-h-96 rounded-lg shadow-md" />
                </div>
            )}
            
            <nav className="bg-white p-4 rounded-lg shadow-md mb-6">
                <ul className="flex justify-around space-x-4">
                    {Object.entries(TABS).map(([key, name]) => (
                        <li key={key}>
                            <button
                                onClick={() => navigate(`/inventories/${id}/${key}`)}
                                className={`font-semibold py-2 px-4 rounded-lg transition-colors ${
                                    activeTab === key
                                        ? 'bg-blue-600 text-white'
                                        : 'text-gray-600 hover:bg-gray-200'
                                }`}
                            >
                                {name}
                            </button>
                        </li>
                    ))}
                </ul>
            </nav>
            
            {renderTabContent()}
        </div>
    );
}
export default InventoryDetailPage;