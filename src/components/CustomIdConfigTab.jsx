import React, { useState, useEffect } from 'react';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import {
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { FaGripLines, FaTrash, FaCheck, FaTimes, FaEdit, FaEye } from 'react-icons/fa';
import api from '../api/api';
import { v4 as uuidv4 } from 'uuid';
import moment from 'moment';

const getElementContent = (type, value) => {
    switch (type) {
        case 'TEXT':
            return value || 'Fixed Text';
        case 'DATE':
            try {
                return moment().format(value || 'YYYYMMDD');
            } catch (e) {
                return 'Invalid Date Format';
            }
        case 'SEQUENCE':
            return '1';
        case 'GUID':
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx';
        case '20_BIT_RANDOM':
            return '20-bit Random';
        case '32_BIT_RANDOM':
            return '32-bit Random';
        case '6_DIGIT_RANDOM':
            return '6-digit Random';
        case '9_DIGIT_RANDOM':
            return '9-digit Random';
        default:
            return '';
    }
};

const Item = ({ id, item, onRemove, onUpdate, isEditing }) => {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    const handleInputChange = (e) => {
        onUpdate(id, e.target.value, item.separator);
    };

    const handleSeparatorChange = (e) => {
        onUpdate(id, item.value, e.target.value);
    };

    const renderInput = () => {
        if (!isEditing) {
            return <span>{getElementContent(item.type, item.value)}</span>;
        }

        switch (item.type) {
            case 'TEXT':
                return (
                    <input
                        type="text"
                        value={item.value || ''}
                        onChange={handleInputChange}
                        className="w-full border rounded px-2 py-1"
                        placeholder="Enter text"
                    />
                );
            case 'DATE':
                return (
                    <input
                        type="text"
                        value={item.value || 'YYYYMMDD'}
                        onChange={handleInputChange}
                        className="w-full border rounded px-2 py-1"
                        placeholder="YYYYMMDD"
                    />
                );
            default:
                return <span>{getElementContent(item.type, item.value)}</span>;
        }
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="flex items-center bg-gray-100 p-3 rounded-md shadow-sm border border-gray-300 space-x-4 mb-2"
        >
            {isEditing && (
                <button {...attributes} {...listeners} className="p-2 -ml-2 text-gray-400 hover:text-gray-600 focus:outline-none cursor-grab">
                    <FaGripLines />
                </button>
            )}
            <div className="flex-grow flex items-center space-x-2">
                <span className="font-semibold text-sm mr-2">{item.type}:</span>
                {renderInput()}
                {isEditing && (
                    <input
                        type="text"
                        value={item.separator || ''}
                        onChange={handleSeparatorChange}
                        className="w-16 border rounded px-2 py-1 ml-2"
                        placeholder="Sep"
                    />
                )}
            </div>
            {isEditing && (
                <button
                    onClick={() => onRemove(id)}
                    className="p-1 text-red-500 hover:text-red-700 focus:outline-none"
                >
                    <FaTrash />
                </button>
            )}
        </div>
    );
};

const CustomIdConfigTab = ({ inventoryId, initialConfig, onSaveSuccess }) => {
    const [config, setConfig] = useState([]);
    const [preview, setPreview] = useState('');
    const [message, setMessage] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    
    useEffect(() => {
        const cleanedConfig = (initialConfig || []).map(item => ({ ...item, id: uuidv4() }));
        setConfig(cleanedConfig);
        generatePreview(cleanedConfig);
    }, [initialConfig]);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );
    
    const generatePreview = async (currentConfig) => {
        const newPreview = currentConfig.map(part => {
            const content = getElementContent(part.type, part.value);
            return `${content}${part.separator || ''}`;
        }).join('');
        setPreview(newPreview);
    };

    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (active.id !== over.id) {
            const oldIndex = config.findIndex(item => item.id === active.id);
            const newIndex = config.findIndex(item => item.id === over.id);

            const newConfig = [...config];
            const [movedItem] = newConfig.splice(oldIndex, 1);
            newConfig.splice(newIndex, 0, movedItem);

            setConfig(newConfig);
            generatePreview(newConfig);
        }
    };

    const handleAddField = (type) => {
        const newSection = {
            id: uuidv4(),
            type,
            value: type === 'TEXT' ? '' : type === 'DATE' ? 'YYYYMMDD' : '',
            separator: '',
        };
        const newConfig = [...config, newSection];
        setConfig(newConfig);
        generatePreview(newConfig);
    };

    const handleUpdateField = (id, newValue, newSeparator) => {
        const newConfig = config.map(item => {
            if (item.id === id) {
                return { ...item, value: newValue, separator: newSeparator !== undefined ? newSeparator : item.separator };
            }
            return item;
        });
        setConfig(newConfig);
        generatePreview(newConfig);
    };

    const handleRemoveField = (id) => {
        const newConfig = config.filter(item => item.id !== id);
        setConfig(newConfig);
        generatePreview(newConfig);
    };

    const handleSave = async () => {
        try {
            const cleanConfig = config.map(item => ({ type: item.type, value: item.value, separator: item.separator }));
            await api.put(`/inventories/${inventoryId}/custom-id-config`, { customIdConfig: cleanConfig });
            setMessage('Configuration saved successfully!');
            setIsEditing(false);
            if (onSaveSuccess) {
                onSaveSuccess();
            }
        } catch (error) {
            setMessage('Failed to save configuration.');
            console.error('Failed to save custom ID config:', error);
        }
    };

    const handleCancel = () => {
        const cleanedConfig = (initialConfig || []).map(item => ({ ...item, id: uuidv4() }));
        setConfig(cleanedConfig);
        generatePreview(cleanedConfig);
        setIsEditing(false);
        setMessage('');
    };

    return (
        <div className="bg-white rounded-lg shadow-md p-6 mt-4">
            <h2 className="text-2xl font-bold mb-4">Custom ID Configuration</h2>
            {message && <div className="mb-4 p-2 rounded text-center text-white bg-blue-500">{message}</div>}

            <div className="flex justify-between items-center mb-4">
                <div className="flex-grow">
                    <span className="font-semibold text-gray-700">Preview: </span>
                    <span className="bg-gray-200 text-gray-800 font-mono px-2 py-1 rounded-md">{preview}</span>
                </div>
                {isEditing ? (
                    <div className="flex space-x-2">
                        <button
                            onClick={handleSave}
                            className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 flex items-center space-x-2"
                        >
                            <FaCheck />
                            <span>Save</span>
                        </button>
                        <button
                            onClick={handleCancel}
                            className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 flex items-center space-x-2"
                        >
                            <FaTimes />
                            <span>Cancel</span>
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
                    >
                        <FaEdit />
                        <span>Edit Configuration</span>
                    </button>
                )}
            </div>
            
            <div className={`border p-4 rounded-lg mb-4 ${isEditing ? 'border-dashed' : 'border-solid'}`}>
                {config.length > 0 ? (
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                    >
                        <SortableContext items={config.map(i => i.id)} strategy={verticalListSortingStrategy}>
                            {config.map(item => (
                                <Item
                                    key={item.id}
                                    id={item.id}
                                    item={item}
                                    onRemove={handleRemoveField}
                                    onUpdate={handleUpdateField}
                                    isEditing={isEditing}
                                />
                            ))}
                        </SortableContext>
                    </DndContext>
                ) : (
                    <p className="text-center text-gray-500 py-4">No custom ID format configured. Add a new section below to begin.</p>
                )}
            </div>

            {isEditing && (
                <div className="mt-4">
                    <h3 className="text-xl font-semibold mb-2">Add New Section</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2">
                        <button onClick={() => handleAddField('TEXT')} className="bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-600">Text</button>
                        <button onClick={() => handleAddField('DATE')} className="bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-600">Date</button>
                        <button onClick={() => handleAddField('SEQUENCE')} className="bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-600">Sequence</button>
                        <button onClick={() => handleAddField('GUID')} className="bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-600">GUID</button>
                        <button onClick={() => handleAddField('20_BIT_RANDOM')} className="bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-600">20-bit Random</button>
                        <button onClick={() => handleAddField('32_BIT_RANDOM')} className="bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-600">32-bit Random</button>
                        <button onClick={() => handleAddField('6_DIGIT_RANDOM')} className="bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-600">6-digit Random</button>
                        <button onClick={() => handleAddField('9_DIGIT_RANDOM')} className="bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-600">9-digit Random</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomIdConfigTab;