import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';
import { FaPlus, FaTimes } from 'react-icons/fa';
import MarkdownEditor from '../components/MarkdownEditor';
const CATEGORIES = [
  { value: 'FURNITURE', label: 'Мебель' },
  { value: 'APPLIANCES', label: 'Техника' },
  { value: 'TRANSPORT', label: 'Транспорт' },
  { value: 'FOOD', label: 'Продукты питания' },
  { value: 'CHEMICALS', label: 'Химия' },
  { value: 'OTHER', label: 'Прочее' },
];

const FIELD_TYPES = [
  { value: 'SINGLE_LINE_TEXT', label: 'Single-line Text' },
  { value: 'MULTILINE_TEXT', label: 'Multi-line Text' },
  { value: 'NUMBER', label: 'Number' },
  { value: 'BOOLEAN', label: 'Boolean' },
  { value: 'DOCUMENT_IMAGE', label: 'Document Image' },
];

function CreateInventoryPage() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'OTHER',
    isPublic: true,
  });
  const [imageFile, setImageFile] = useState(null);
  const [customFields, setCustomFields] = useState([]);
  const [tags, setTags] = useState([]);
  const [newTag, setNewTag] = useState('');
  const [allTags, setAllTags] = useState([]);
  const [filteredTags, setFilteredTags] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAllTags = async () => {
      try {
        const response = await api.get('/tags');
        setAllTags(response.data);
      } catch (err) {
        console.error('Failed to fetch tags', err);
      }
    };
    fetchAllTags();
  }, []);

  useEffect(() => {
    if (newTag.length > 0) {
      const filtered = allTags.filter(tag =>
        tag.name.toLowerCase().includes(newTag.toLowerCase())
      );
      setFilteredTags(filtered);
    } else {
      setFilteredTags([]);
    }
  }, [newTag, allTags]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleImageChange = (e) => {
    setImageFile(e.target.files[0]);
  };
  
  const handleAddField = () => {
    setCustomFields([...customFields, { name: '', type: 'SINGLE_LINE_TEXT', showInTable: false }]);
  };
  
  const handleFieldChange = (index, e) => {
    const { name, value, type, checked } = e.target;
    const newFields = [...customFields];
    newFields[index][name] = type === 'checkbox' ? checked : value;
    setCustomFields(newFields);
  };
  
  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
      setFilteredTags([]);
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSuggestionClick = (tagName) => {
    setNewTag(tagName);
    setShowSuggestions(false);
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError(null);
  const data = new FormData();
  for (const key in formData) {
    data.append(key, formData[key]);
  }
  if (imageFile) {
    data.append('image', imageFile);
  }

  if (customFields.length > 0) {
    data.append('customFields', JSON.stringify(customFields));
  }
  if (tags.length > 0) {
    data.append('tags', JSON.stringify(tags));
  }

  try {
    await api.post('/inventories', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    navigate('/');
  } catch (err) {
    setError('Failed to create inventory.');
    console.error(err);
  } finally {
    setLoading(false);
  }
};

const handleDescriptionChange = (newDescription) => {
    setFormData(prevData => ({
        ...prevData,
        description: newDescription,
    }));
};

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <h1 className="text-3xl font-bold text-center my-6">Create New Inventory</h1>
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md">
        {error && <p className="text-red-500 mb-4">{error}</p>}
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
        <div className="mb-4 flex items-center">
          <input type="checkbox" name="isPublic" checked={formData.isPublic} onChange={handleChange} className="mr-2 h-4 w-4 text-blue-600 rounded" />
          <label className="text-gray-700 font-bold">Public</label>
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2">Image</label>
          <input type="file" onChange={handleImageChange} className="w-full px-3 py-2 border rounded-lg" />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2">Tags</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {tags.map((tag, index) => (
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
        <div className="mb-4">
          <h3 className="text-xl font-bold mb-2">Custom Fields</h3>
          {customFields.map((field, index) => (
            <div key={index} className="flex flex-col md:flex-row md:items-center md:space-x-2 mb-2">
              <input
                type="text"
                name="name"
                value={field.name}
                onChange={(e) => handleFieldChange(index, e)}
                placeholder="Field Name"
                className="w-full md:w-1/3 px-3 py-2 border rounded-lg"
              />
              <select
                name="type"
                value={field.type}
                onChange={(e) => handleFieldChange(index, e)}
                className="w-full md:w-1/3 px-3 py-2 border rounded-lg mt-2 md:mt-0"
              >
                {FIELD_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
              <label className="flex items-center space-x-2 w-full md:w-1/3 mt-2 md:mt-0">
                <input
                  type="checkbox"
                  name="showInTable"
                  checked={field.showInTable}
                  onChange={(e) => handleFieldChange(index, e)}
                  className="h-4 w-4 text-blue-600 rounded"
                />
                <span className="text-sm text-gray-700">Show in table</span>
              </label>
            </div>
          ))}
          <button
            type="button"
            onClick={handleAddField}
            className="bg-gray-200 text-gray-700 font-bold py-2 px-4 rounded-lg hover:bg-gray-300"
          >
            Add Field
          </button>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Creating...' : 'Create Inventory'}
        </button>
      </form>
    </div>
  );
}
export default CreateInventoryPage;