import { useState, useEffect, useCallback } from 'react';
import { getDocuments } from '../lib/firestore';
import { useAuth } from './useAuth';

export const useDocuments = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  const fetchDocuments = useCallback(async () => {
    if (!user) {
      setDocuments([]);
      setLoading(false);
      return;
    }
    
    setLoading(true);
    try {
      const docs = await getDocuments(user.uid);
      setDocuments(docs);
      setError(null);
    } catch (err) {
      setError(err);
      console.error("Failed to fetch documents:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  return { documents, loading, error, refetch: fetchDocuments, setDocuments };
};
