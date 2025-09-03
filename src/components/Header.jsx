import React, { useState, useEffect, useRef  } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';
import { FaChevronDown, FaCheck } from 'react-icons/fa';
import { useTags } from '../context/TagsContext';
const CATEGORIES = [
  { value: 'ALL', label: 'Все категории' },
  { value: 'FURNITURE', label: 'Мебель' },
  { value: 'APPLIANCES', label: 'Техника' },
  { value: 'TRANSPORT', label: 'Транспорт' },
  { value: 'FOOD', label: 'Продукты питания' },
  { value: 'CHEMICALS', label: 'Химия' },
  { value: 'OTHER', label: 'Прочее' },
];
const SORT_OPTIONS = [
  { value: 'none', label: 'Не сортировать' },
  { value: 'createdAt', label: 'По дате создания' },
  { value: 'itemCount', label: 'По количеству товаров' },
];
function Header() {
    const { token, user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('ALL');
    const [selectedTags, setSelectedTags] = useState([]);
    const [sortBy, setSortBy] = useState('none');
    const [showTagsDropdown, setShowTagsDropdown] = useState(false);
    const [authorTerm, setAuthorTerm] = useState('');
    const tagsDropdownRef = useRef(null);
    const { tags: availableTags, fetchTags } = useTags();
    const isAuthPage = location.pathname === '/login' || location.pathname === '/register';
    const isMyInventoriesPage = location.pathname === '/my-inventories';
    const queryParams = new URLSearchParams(location.search);
    const mode = queryParams.get('mode') || 'owned';
    const showAuthorFilter = !isMyInventoriesPage || (isMyInventoriesPage && mode === 'access');

    useEffect(() => {
      const queryParams = new URLSearchParams(location.search);
      setSearchTerm(queryParams.get('search') || '');
      setSelectedCategory(queryParams.get('category') || 'ALL');
      setAuthorTerm(queryParams.get('author') || '');
      const tagsParam = queryParams.get('tags');
      setSelectedTags(tagsParam ? tagsParam.split(',') : []);
      setSortBy(queryParams.get('sortBy') || 'none');
    }, [location.search]);
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (tagsDropdownRef.current && !tagsDropdownRef.current.contains(event.target)) {
                setShowTagsDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [tagsDropdownRef]);
    const handleSearch = () => {
        const queryParams = new URLSearchParams();
        if (searchTerm) queryParams.set('search', searchTerm);
        if (selectedCategory !== 'ALL') queryParams.set('category', selectedCategory);
        if (selectedTags.length > 0) queryParams.set('tags', selectedTags.join(','));
        if (sortBy !== 'none') queryParams.set('sortBy', sortBy);
        if (authorTerm) queryParams.set('author', authorTerm);
        let destination = `/`;
        if (isMyInventoriesPage) {
            destination = `/my-inventories`;
            queryParams.set('mode', mode);
        }
        navigate(`${destination}?${queryParams.toString()}`);
    };
    const handleTagToggle = (tagName) => {
      setSelectedTags(prevTags => {
        if (prevTags.includes(tagName)) {
          return prevTags.filter(tag => tag !== tagName);
        } else {
          return [...prevTags, tagName];
        }
      });
    };
    const getTagsLabel = () => {
        return `тегов ${selectedTags.length}`;
    };
    const handleLogout = () => {
        logout();
        navigate('/');
    };
        return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto p-4">
        <nav className="flex flex-col md:flex-row md:justify-between md:items-center">
          <div className="flex justify-between items-center w-full md:w-auto">
            <div className="flex flex-col">
              <Link to="/" className="text-2xl font-bold text-gray-800">
                Inventory App
              </Link>
              {user && (
                <span className="text-gray-700 font-semibold text-sm mt-1">
                  Привет, {user.name}
                </span>
              )}
            </div>
          </div>
          <div className="flex space-x-4 mt-4 md:mt-0">
            {user && user.role === 'ADMIN' && (
              <Link to="/admin" className="text-white px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 transition duration-300">
                Admin
              </Link>
            )}
            {user ? (
              <>
                <Link to="/my-inventories" className="text-gray-600 hover:text-gray-800">
                  Home
                </Link>
                <button onClick={handleLogout} className="text-white px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 transition duration-300">
                  Выйти
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-600 hover:text-gray-800">
                  Войти
                </Link>
                <Link to="/register" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-300">
                  Регистрация
                </Link>
              </>
            )}
          </div>
        </nav>
        {!isAuthPage && (
          <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-4 flex-grow mx-auto max-w-4xl w-full mt-4">
            <input
              type="text"
              placeholder="Название инвентаря..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-10 w-full md:w-auto px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="h-10 w-full md:w-auto px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {CATEGORIES.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
            <div className="relative w-full md:w-auto h-10" ref={tagsDropdownRef}>
              <button
                type="button"
                onClick={() => setShowTagsDropdown(!showTagsDropdown)}
                className="flex justify-between items-center w-full h-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <span className="whitespace-nowrap">{getTagsLabel()}</span>
                <FaChevronDown className="ml-2 h-4 w-4 text-gray-500" />
              </button>
              {showTagsDropdown && (
                <div className="absolute z-10 w-full md:w-auto mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {availableTags.length > 0 ? (
                    availableTags.map(tag => (
                      <div
                        key={tag.id}
                        onClick={() => handleTagToggle(tag.name)}
                        className="flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-gray-100"
                      >
                        <span>{tag.name}</span>
                        {selectedTags.includes(tag.name) && (
                          <FaCheck className="h-4 w-4 text-blue-600" />
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="px-3 py-2 text-gray-500">Нет доступных тегов</div>
                  )}
                </div>
              )}
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="h-10 w-full md:w-auto px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {SORT_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            {showAuthorFilter && (
              <input
                type="text"
                placeholder="Имя/email автора..."
                value={authorTerm}
                onChange={(e) => setAuthorTerm(e.target.value)}
                className="h-10 w-full md:w-auto px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            )}
            <button
              onClick={handleSearch}
              className="h-10 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex-shrink-0 w-full md:w-auto transition duration-300"
            >
              Поиск
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
export default Header;