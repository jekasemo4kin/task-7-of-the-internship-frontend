import React, { useState, useEffect } from 'react';
import api from '../api/api';
import { FaPlus, FaTimes, FaSave, FaBars } from 'react-icons/fa';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
const SortableField = ({ field, index, onFieldChange, onRemoveField }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: field.id || `new-${index}` });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        boxShadow: isDragging ? '0 8px 16px rgba(0, 0, 0, 0.2)' : '0 2px 4px rgba(0, 0, 0, 0.1)',
        zIndex: isDragging ? 10 : 'auto',
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            className="flex items-center gap-2 p-4 mb-4 rounded-lg shadow-sm bg-gray-100 hover:bg-gray-200 transition-colors duration-200"
        >
            <div
                className="cursor-grab text-gray-500 hover:text-gray-700 transition-colors duration-200 p-2"
                {...listeners}
            >
                <FaBars className="h-5 w-5" />
            </div>
            <input
                type="text"
                name="name"
                value={field.name}
                onChange={(e) => onFieldChange(index, e)}
                placeholder="Field Name"
                required
                className="flex-1 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-40"
            />
            <select
                name="type"
                value={field.type}
                onChange={(e) => onFieldChange(index, e)}
                disabled={!!field.id && !String(field.id).startsWith('new-')}
                className="p-2 border rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-200"
            >
                {FIELD_TYPES.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                ))}
            </select>
            <label className="flex items-center gap-2 text-gray-700">
                <input
                    type="checkbox"
                    name="showInTable"
                    checked={field.showInTable}
                    onChange={(e) => onFieldChange(index, e)}
                    className="form-checkbox h-5 w-5 text-blue-600 rounded"
                />
                <span>Show in table</span>
            </label>
            <button
                type="button"
                onClick={() => onRemoveField(index)}
                className="p-2 text-red-500 hover:text-red-700 transition-colors duration-200"
                aria-label="Remove field"
            >
                <FaTimes className="h-5 w-5" />
            </button>
        </div>
    );
};

const FIELD_TYPES = [
    { value: 'SINGLE_LINE_TEXT', label: 'Single-line Text' },
    { value: 'MULTILINE_TEXT', label: 'Multi-line Text' },
    { value: 'NUMBER', label: 'Number' },
    { value: 'BOOLEAN', label: 'Boolean' },
    { value: 'DOCUMENT_IMAGE', label: 'Document Image' },
];

function CustomFieldsTab({ inventory, onUpdate }) {
    const [fields, setFields] = useState(inventory.customFields || []);
    const [newField, setNewField] = useState({ name: '', type: 'SINGLE_LINE_TEXT', showInTable: true });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        setFields(inventory.customFields || []);
        setError('');
        setSuccessMessage('');
    }, [inventory]);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleNewFieldChange = (e) => {
        const { name, value, type, checked } = e.target;
        setNewField(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleFieldChange = (index, e) => {
        const { name, value, type, checked } = e.target;
        const updatedFields = fields.map((field, i) =>
            i === index ? {
                ...field,
                [name]: type === 'checkbox' ? checked : value
            } : field
        );
        setFields(updatedFields);
    };

    const handleAddField = () => {
        if (!newField.name || fields.some(f => f.name.toLowerCase().trim() === newField.name.toLowerCase().trim())) {
            setError('Field name cannot be empty or a duplicate.');
            return;
        }
        setFields(prev => [...prev, { ...newField, id: `new-${Date.now()}` }]);
        setNewField({ name: '', type: 'SINGLE_LINE_TEXT', showInTable: true });
        setError('');
    };

    const handleRemoveField = (indexToRemove) => {
        setFields(prev => prev.filter((_, index) => index !== indexToRemove));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');
        setSuccessMessage('');

        const uniqueNames = new Set();
        const hasDuplicate = fields.some(field => {
            const lowerName = field.name.toLowerCase().trim();
            if (lowerName === '') {
                return true;
            }
            if (uniqueNames.has(lowerName)) {
                return true;
            }
            uniqueNames.add(lowerName);
            return false;
        });

        if (hasDuplicate) {
            setError('All field names must be unique and not empty.');
            setIsSubmitting(false);
            return;
        }

        try {
            await api.put(`/inventories/${inventory.id}`, { 
                customFields: fields,
                version: inventory.version 
            });
            setSuccessMessage('Changes saved successfully!');
            onUpdate();
        } catch (err) {
            console.error('Failed to save custom fields:', err.response?.data?.message || err.message);
            setError('Failed to save custom fields. Please try again.');
        } finally {
            setIsSubmitting(false);
            setTimeout(() => setSuccessMessage(''), 3000);
        }
    };

    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (active.id !== over.id) {
            setFields((items) => {
                const oldIndex = items.findIndex(item => item.id === active.id);
                const newIndex = items.findIndex(item => item.id === over.id);
                if (oldIndex === -1 || newIndex === -1) {
                    return items;
                }
                return arrayMove(items, oldIndex, newIndex);
            });
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md mt-4">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Manage Custom Fields</h2>
            <form onSubmit={handleSave}>
                <div className="space-y-4 mb-6">
                    <DndContext 
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                    >
                        <SortableContext
                            items={fields.map(f => f.id || `new-${Date.now()}-${Math.random()}`)}
                            strategy={verticalListSortingStrategy}
                        >
                            {fields.map((field, index) => (
                                <SortableField
                                    key={field.id || `new-${Date.now()}-${index}`}
                                    field={field}
                                    index={index}
                                    onFieldChange={handleFieldChange}
                                    onRemoveField={handleRemoveField}
                                />
                            ))}
                        </SortableContext>
                    </DndContext>
                    <div className="flex flex-wrap items-center gap-2 pt-4">
                        <input
                            type="text"
                            name="name"
                            value={newField.name}
                            onChange={handleNewFieldChange}
                            placeholder="New Field Name"
                            className="flex-1 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-40"
                        />
                        <select
                            name="type"
                            value={newField.type}
                            onChange={handleNewFieldChange}
                            className="p-2 border rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            {FIELD_TYPES.map(type => (
                                <option key={type.value} value={type.value}>{type.label}</option>
                            ))}
                        </select>
                        <label className="flex items-center gap-2 text-gray-700">
                            <input
                                type="checkbox"
                                name="showInTable"
                                checked={newField.showInTable}
                                onChange={handleNewFieldChange}
                                className="form-checkbox h-5 w-5 text-blue-600 rounded"
                            />
                            <span>Show in table</span>
                        </label>
                        <button
                            type="button"
                            onClick={handleAddField}
                            className="p-2 text-blue-500 hover:text-blue-700 transition-colors duration-200"
                            aria-label="Add field"
                        >
                            <FaPlus className="h-5 w-5" />
                        </button>
                    </div>
                </div>
                {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                {successMessage && <p className="text-green-500 text-sm mt-2">{successMessage}</p>}
                <div className="flex justify-end space-x-4">
                    <button
                        type="submit"
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:bg-gray-400"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default CustomFieldsTab;