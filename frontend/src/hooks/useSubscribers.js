import { useState, useEffect, useCallback } from 'react';
import { getSubscribers, subscribe as sub, unsubscribe as unsub } from '../api/client.js';

export function useSubscribers() {
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSubscribers = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await getSubscribers();
      setSubscribers(data.subscribers || []);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load subscribers');
    } finally {
      setLoading(false);
    }
  }, []);

  const addSubscriber = useCallback(async (email, name) => {
    try {
      await sub(email, name);
      await fetchSubscribers();
      return true;
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to subscribe');
      return false;
    }
  }, [fetchSubscribers]);

  const removeSubscriber = useCallback(async (email) => {
    try {
      await unsub(email);
      setSubscribers(prev => prev.filter(s => s.email !== email));
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to unsubscribe');
    }
  }, []);

  useEffect(() => {
    fetchSubscribers();
  }, [fetchSubscribers]);

  return {
    subscribers,
    loading,
    error,
    addSubscriber,
    removeSubscriber,
    fetchSubscribers
  };
}
