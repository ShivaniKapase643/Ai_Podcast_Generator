import React, { useState, useEffect } from 'react';
import { TrendingUp, Play, Flame, ThumbsUp } from 'lucide-react';
import { getEpisodes, getEpisodeStats } from '../api/client';
import TopicTags from './TopicTags';

export default function TrendingPage({ onSelect }) {
  const [episodes, setEpisodes] = useState([]);
  const [hotTopics, setHotTopics] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [epRes, statsRes] = await Promise.all([getEpisodes(1, 20), getEpisodeStats()]);
      const completed = (epRes.data.episodes || []).filter(e => e.status === 'completed');
      setEpisodes(completed.slice(0, 10));
      setHotTopics(statsRes.data.topTopics || []);
    } catch {} finally { setLoading(false); }
  };

  if (loading) return <div className="flex justify-center py-16"><div className="w-10 h-10 border-3 border-brand border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 rounded-lg bg-orange-50 border border-orange-200 flex items-center justify-center">
          <TrendingUp className="w-5 h-5 text-orange-600" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-surface-900">Trending</h2>
          <p className="text-xs text-surface-600">Most popular episodes & topics this week</p>
        </div>
      </div>

      {/* Hot Topics */}
      <div className="bg-white rounded-2xl border border-surface-300 p-5 mb-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Flame className="w-4 h-4 text-orange-500" />
          <h3 className="text-sm font-bold text-surface-900">Hot Topics Right Now</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {hotTopics.slice(0, 8).map((t, i) => (
            <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-surface-50 border border-surface-200">
              <span className="text-xs font-bold text-orange-500">#{i + 1}</span>
              <span className="text-sm font-semibold text-surface-800">{t.topic}</span>
              <span className="text-xs text-surface-400 bg-surface-100 px-1.5 py-0.5 rounded">{t.count}×</span>
            </div>
          ))}
        </div>
      </div>

      {/* Top Episodes */}
      <div className="bg-white rounded-2xl border border-surface-300 p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <ThumbsUp className="w-4 h-4 text-brand" />
          <h3 className="text-sm font-bold text-surface-900">Top Episodes</h3>
        </div>
        <div className="space-y-3">
          {episodes.map((ep, i) => (
            <div key={ep.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-surface-50 transition-all group cursor-pointer"
              onClick={() => onSelect(ep)}>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                i < 3 ? 'bg-orange-50 text-orange-600 border border-orange-200' : 'bg-surface-100 text-surface-500'
              }`}>{i + 1}</div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-surface-900 truncate">{ep.title}</h4>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-surface-500">{ep.date}</span>
                  <span className="text-xs text-surface-400">{ep.stories_count} stories</span>
                </div>
              </div>
              <Play className="w-4 h-4 text-brand opacity-0 group-hover:opacity-100 transition-all" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
