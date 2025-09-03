import React, { useState, useEffect, useRef } from 'react';
import api from '../api/api';
import { FaTrash, FaPlus, FaSave, FaTimes } from 'react-icons/fa';
import { useTags } from '../context/TagsContext';
import MarkdownEditor from './MarkdownEditor';
const CATEGORIES = [
  { value: 'FURNITURE', label: 'Мебель' },
  { value: 'APPLIANCES', label: 'Техника' },
  { value: 'TRANSPORT', label: 'Транспорт' },
  { value: 'FOOD', label: 'Продукты питания' },
  { value: 'CHEMICALS', label: 'Химия' },
  { value: 'OTHER', label: 'Прочее' },
];

function InventorySettingsTab({ inventory, onSave, onCancel, onDelete }) {
  const { tags: allTags, fetchTags } = useTags(); 
  const [formData, setFormData] = useState({
    title: inventory?.title,
    description: inventory?.description || '',
    category: inventory?.category || 'OTHER',
  });
  const [imageFile, setImageFile] = useState(null);
  const [selectedTags, setSelectedTags] = useState(inventory?.tags?.map(t => t.name) || []);
  const [newTag, setNewTag] = useState('');
  const [filteredTags, setFilteredTags] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const tagsDropdownRef = useRef(null);
  useEffect(() => {
    if (inventory) {
      setFormData({
        title: inventory.title,
        description: inventory.description || '',
        category: inventory.category || 'OTHER',
      });
      setSelectedTags(inventory.tags?.map(t => t.name) || []);
    }
  }, [inventory]);

  useEffect(() => {
    if (newTag.length > 0) {
      const filtered = allTags.filter(tag =>
        tag.name.toLowerCase().includes(newTag.toLowerCase()) && 
        !selectedTags.includes(tag.name)
      );
      setFilteredTags(filtered);
    } else {
      setFilteredTags([]);
    }
  }, [newTag, allTags, selectedTags]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleImageChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  const handleAddTag = () => {
    if (newTag.trim() && !selectedTags.includes(newTag.trim())) {
      setSelectedTags([...selectedTags, newTag.trim()]);
      setNewTag('');
      setFilteredTags([]);
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setSelectedTags(selectedTags.filter(tag => tag !== tagToRemove));
  };

  const handleSuggestionClick = (tagName) => {
    setSelectedTags([...selectedTags, tagName]);
    setNewTag('');
    setShowSuggestions(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append('title', formData.title);
    data.append('description', formData.description);
    data.append('category', formData.category);
    data.append('tags', JSON.stringify(selectedTags));
    data.append('version', inventory.version);

    if (imageFile) {
      data.append('image', imageFile);
    }

    await onSave(data);

    fetchTags();
  };

  const handleDeleteClick = async () => {
    if (window.confirm('Вы уверены, что хотите удалить инвентарь? Это действие нельзя отменить.')) {
      try {
        await onDelete();
      } catch (error) {
        console.error('Failed to delete inventory:', error);
        alert('Не удалось удалить инвентарь. Попробуйте еще раз.');
      }
    }
  };

  const handleDescriptionChange = (newDescription) => {
    setFormData(prevData => ({
        ...prevData,
        description: newDescription,
    }));
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mt-4">
      <h2 className="text-2xl font-bold mb-4">Inventory Settings</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2">Title</label>
          <input type="text" name="title" value={formData.title} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg" required />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2">Description</label>
          <MarkdownEditor
            value={formData.description}
            onChange={handleDescriptionChange}
            placeholder="Enter a description using Markdown..."
        />
          </div>
        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2">Category</label>
          <select name="category" value={formData.category} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg">
            {CATEGORIES.map(cat => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2">Image</label>
          <input type="file" onChange={handleImageChange} className="w-full px-3 py-2 border rounded-lg" />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2">Tags</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {selectedTags.map((tag, index) => (
              <span key={index} className="bg-blue-200 text-blue-800 px-3 py-1 rounded-full flex items-center">
                {tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="ml-2 text-blue-600 hover:text-blue-900"
                >
                  <FaTimes />
                </button>
              </span>
            ))}
          </div>
          <div className="relative">
            <input
              type="text"
              value={newTag}
              onChange={(e) => {
                setNewTag(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddTag();
                }
              }}
              placeholder="Add new tag..."
              className="w-full px-3 py-2 border rounded-lg"
            />
            {showSuggestions && filteredTags.length > 0 && (
              <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-40 overflow-y-auto mt-1">
                {filteredTags.map((tag) => (
                  <li
                    key={tag.id}
                    onMouseDown={() => handleSuggestionClick(tag.name)}
                    className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                  >
                    {tag.name}
                  </li>
                ))}
              </ul>
            )}
            <button
              type="button"
              onClick={handleAddTag}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700"
            >
              <FaPlus />
            </button>
          </div>
        </div>
        <div className="flex justify-between items-center mt-6">
            <div className="flex space-x-4">
                <button
                    type="button"
                    onClick={onCancel}
                    className="bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-lg hover:bg-gray-400"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700"
                >
                    Save Changes
                </button>
            </div>
            <button
                type="button"
                onClick={handleDeleteClick}
                className="bg-red-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-700 flex items-center"
            >
                <FaTrash className="mr-2" /> Delete Inventory
            </button>
        </div>
      </form>
    </div>
  );
}
export default InventorySettingsTab;