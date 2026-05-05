import React, { createContext, useState, useContext } from 'react';
import api from '../api/axios';

const SearchContext = createContext();

export const SearchProvider = ({ children }) => {
  const [results, setResults] = useState({ projects: [], tasks: [] });
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const search = async (query) => {
    if (!query.trim()) {
      setResults({ projects: [], tasks: [] });
      return;
    }
    setLoading(true);
    try {
      const res = await api.get(`/search?q=${query}`);
      setResults(res.data);
    } catch (error) {
      console.error('Search failed', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SearchContext.Provider value={{ results, search, isSearchOpen, setIsSearchOpen, loading }}>
      {children}
    </SearchContext.Provider>
  );
};

export const useSearch = () => useContext(SearchContext);
