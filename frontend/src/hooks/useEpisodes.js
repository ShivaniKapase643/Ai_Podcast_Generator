import { useState, useEffect, useCallback } from 'react';
import { getEpisodes, getEpisode, deleteEpisode as deleteEp, getEpisodeStats } from '../api/client.js';

export function useEpisodes() {
  const [episodes, setEpisodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [stats, setStats] = useState(null);

  const fetchEpisodes = useCallback(async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await getEpisodes(page);
      setEpisodes(data.episodes);
      setPagination({ page: data.page, totalPages: data.totalPages, total: data.total });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load episodes');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const { data } = await getEpisodeStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  }, []);

  const removeEpisode = useCallback(async (id) => {
    try {
      await deleteEp(id);
      setEpisodes(prev => prev.filter(ep => ep.id !== id));
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete episode');
    }
  }, []);

  useEffect(() => {
    fetchEpisodes();
    fetchStats();
  }, [fetchEpisodes, fetchStats]);

  return {
    episodes,
    loading,
    error,
    pagination,
    stats,
    fetchEpisodes,
    fetchStats,
    removeEpisode
  };
}
