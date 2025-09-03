import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import api from '../api/api';

const TagsContext = createContext();

export const TagsProvider = ({ children }) => {
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTags = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/tags');
      setTags(response.data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch tags:', err);
      setError('Failed to load tags.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTags();
  }, [fetchTags]);

  return (
    <TagsContext.Provider value={{ tags, loading, error, fetchTags }}>
      {children}
    </TagsContext.Provider>
  );
};

export const useTags = () => {
  const context = useContext(TagsContext);
  if (!context) {
    throw new Error('useTags must be used within a TagsProvider');
  }
  return context;
};