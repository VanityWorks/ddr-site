import { createContext, useContext, useState, useEffect } from 'react';
import { getCategories, getSidebar, getRecentPayments } from '../lib/tebex';

const StoreDataContext = createContext(null);

export function StoreDataProvider({ children }) {
  const [categories, setCategories] = useState([]);
  const [recentPayments, setRecentPayments] = useState([]);
  const [error, setError] = useState(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    Promise.all([getCategories(true), getSidebar()])
      .then(([cats, sidebar]) => {
        setCategories(cats || []);
        setRecentPayments(getRecentPayments(sidebar));
      })
      .catch(err => setError(err.message))
      .finally(() => setLoaded(true));
  }, []);

  const allProducts = categories.flatMap(c => (c.packages || []).map(p => ({ ...p, category: c })));

  return (
    <StoreDataContext.Provider value={{ categories, recentPayments, allProducts, error, loaded }}>
      {children}
    </StoreDataContext.Provider>
  );
}

export function useStoreData() {
  const ctx = useContext(StoreDataContext);
  return ctx || { categories: [], recentPayments: [], allProducts: [], error: null, loaded: false };
}
