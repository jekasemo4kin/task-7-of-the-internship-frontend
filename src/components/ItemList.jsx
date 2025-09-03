import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaTrash, FaEdit, FaTimes, FaSave } from 'react-icons/fa';

function ItemList({ items, inventory, onUpdateItems, onRemoveItems, hasWriteAccess }) {
    const [selectedItems, setSelectedItems] = useState([]);
    const [editedItems, setEditedItems] = useState({});
    const navigate = useNavigate();

    useEffect(() => {
        setSelectedItems([]);
        setEditedItems({});
    }, [inventory, items]);

    const customFieldsInTable = inventory?.customFields?.filter(field => field.showInTable) || [];

    const handleCheckboxChange = (itemId) => {
        setSelectedItems(prevSelected =>
            prevSelected.includes(itemId)
                ? prevSelected.filter(id => id !== itemId)
                : [...prevSelected, itemId]
        );
    };

    const handleFieldChange = (itemId, fieldName, value) => {
        setEditedItems(prevEdited => {
            const updatedItem = {
                ...prevEdited[itemId],
                [fieldName]: value
            };
            return {
                ...prevEdited,
                [itemId]: updatedItem,
            };
        });
    };

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            const allItemIds = items.map(item => item.id);
            setSelectedItems(allItemIds);
        } else {
            setSelectedItems([]);
        }
    };

    const handleSave = async () => {
        const itemsToUpdate = selectedItems.map(itemId => {
            const item = items.find(i => i.id === itemId);
            const editedItemData = editedItems[itemId];
            
            const customDataToUpdate = { ...item.customData };
            let customIdToUpdate = item.customId;

            for (const key in editedItemData) {
                if (key === 'customId') {
                    customIdToUpdate = editedItemData[key];
                } else {
                    customDataToUpdate[key] = editedItemData[key];
                }
            }

            return {
                ...item,
                customId: customIdToUpdate,
                customData: customDataToUpdate,
            };
        });

        await onUpdateItems(itemsToUpdate);
        setSelectedItems([]);
        setEditedItems({});
    };

    const handleDelete = async () => {
        if (window.confirm(`Are you sure you want to delete ${selectedItems.length} item(s)?`)) {
            await onRemoveItems(selectedItems);
            setSelectedItems([]);
            setEditedItems({});
        }
    };

    const handleDetails = () => {
        if (selectedItems.length === 1) {
            navigate(`/inventories/${inventory.id}/items/${selectedItems[0]}`);
        }
    };

    const handleCancel = () => {
        setSelectedItems([]);
        setEditedItems({});
    };

    const isIndeterminate = selectedItems.length > 0 && selectedItems.length < items.length;
    const canEdit = hasWriteAccess;
    const areAllItemsSelected = items.length > 0 && selectedItems.length === items.length;

    return (
        <div className="bg-white rounded-lg shadow-md mt-4 p-4">
            <div className="min-h-[60px] flex items-center">
                {selectedItems.length > 0 && (
                    <div className="flex space-x-4 ">
                        {selectedItems.length === 1 && (
                            <button onClick={handleDetails} className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 flex items-center space-x-2">
                                <FaEdit />
                                <span>Details</span>
                            </button>
                        )}
                        {canEdit && Object.keys(editedItems).length > 0 && (
                            <button onClick={handleSave} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2">
                                <FaSave />
                                <span>Save</span>
                            </button>
                        )}
                        {canEdit && (
                            <button onClick={handleDelete} className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center space-x-2">
                                <FaTrash />
                                <span>Delete ({selectedItems.length})</span>
                            </button>
                        )}
                        <button onClick={handleCancel} className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 flex items-center space-x-2">
                            <FaTimes />
                            <span>Cancel</span>
                        </button>
                    </div>
                )}
            </div>
            {items.length > 0 ? (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    <input
                                        type="checkbox"
                                        onChange={handleSelectAll}
                                        checked={areAllItemsSelected}
                                        ref={input => input && (input.indeterminate = isIndeterminate)}
                                        className="form-checkbox"
                                    />
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    {inventory.customIdConfig ? 'Custom ID' : 'Name'}
                                </th>
                                {customFieldsInTable.map(field => (
                                    <th key={field.id} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        {field.name}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {items.map((item) => {
                                const isSelected = selectedItems.includes(item.id);
                                const isBeingEdited = isSelected && canEdit;
                                const currentCustomId = editedItems[item.id]?.customId ?? item.customId ?? '';

                                return (
                                    <tr key={item.id} className={isSelected ? ' outline outline-blue-500' : ''}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <input
                                                type="checkbox"
                                                checked={isSelected}
                                                onChange={() => handleCheckboxChange(item.id)}
                                                className="form-checkbox"
                                            />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span>{currentCustomId}</span>
                                        </td>
                                        {customFieldsInTable.map(field => {
                                            const fieldValue = editedItems[item.id]?.[field.name] ?? item.customData?.[field.name] ?? '';
                                            return (
                                                <td key={field.id} className="px-6 py-4 whitespace-nowrap">
                                                    {isBeingEdited ? (
                                                        field.type === 'BOOLEAN' ? (
                                                            <input
                                                                type="checkbox"
                                                                checked={fieldValue === true || fieldValue === 'true'}
                                                                onChange={(e) => handleFieldChange(item.id, field.name, e.target.checked)}
                                                                className="h-5 w-5 text-blue-600 rounded"
                                                            />
                                                        ) : (
                                                            <input
                                                                type={field.type === 'NUMBER' ? 'number' : 'text'}
                                                                value={fieldValue}
                                                                onChange={(e) => handleFieldChange(item.id, field.name, e.target.value)}
                                                                className="w-full border rounded px-2 py-1"
                                                            />
                                                        )
                                                    ) : (
                                                        <span>
                                                            {field.type === 'BOOLEAN' ? (fieldValue ? 'Yes' : 'No') : fieldValue}
                                                        </span>
                                                    )}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            ) : (
                <p className="text-gray-500">No items in this inventory.</p>
            )}
        </div>
    );
}

export default ItemList;