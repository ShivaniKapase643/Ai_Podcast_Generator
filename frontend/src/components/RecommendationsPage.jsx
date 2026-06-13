import React, { useState, useEffect } from 'react';
import { Sparkles, Play, Bookmark, Star } from 'lucide-react';
import { getRecommendations, getBookmarks as fetchBookmarks, addBookmark, removeBookmark } from '../api/client';
import TopicTags from './TopicTags';

export default function RecommendationsPage({ user, onSelect }) {
  const [recommendations, setRecommendations] = useState([]);
  const [bookmarkedIds, setBookmarkedIds] = useState(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    loadData();
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [recsRes, booksRes] = await Promise.all([getRecommendations(), fetchBookmarks()]);
      setRecommendations(recsRes.data.recommendations || []);
      setBookmarkedIds(new Set((booksRes.data.bookmarks || []).map(b => b.episode_id)));
    } catch (err) {
      console.error('Failed to load recommendations');
    } finally {
      setLoading(false);
    }
  };

  const toggleBookmark = async (episodeId) => {
    if (bookmarkedIds.has(episodeId)) {
      await removeBookmark(episodeId);
      setBookmarkedIds(prev => { const s = new Set(prev); s.delete(episodeId); return s; });
    } else {
      await addBookmark(episodeId);
      setBookmarkedIds(prev => new Set([...prev, episodeId]));
    }
  };

  if (!user) {
    return (
      <div className="text-center py-16 bg-white rounded-2xl border border-surface-300">
        <Sparkles className="w-14 h-14 mx-auto mb-4 text-surface-300" />
        <p className="text-surface-700 font-semibold">Sign in to get personalized recommendations</p>
        <p className="text-sm text-surface-500 mt-1">We'll suggest episodes based on your interests</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-10 h-10 border-3 border-brand border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 rounded-lg bg-purple-50 border border-purple-200 flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-purple-600" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-surface-900">For You</h2>
          <p className="text-xs text-surface-600">Personalized episode recommendations</p>
        </div>
      </div>

      {recommendations.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-surface-300">
          <Sparkles className="w-12 h-12 mx-auto mb-3 text-surface-300" />
          <p className="text-surface-700 font-semibold">No recommendations yet</p>
          <p className="text-sm text-surface-500 mt-1">Set your preferred topics in Profile to get suggestions</p>
        </div>
      ) : (
        <div className="space-y-3">
          {recommendations.map((ep, i) => (
            <div key={ep.id} className="flex items-center gap-4 p-4 bg-white rounded-xl border border-surface-300 hover:border-brand/30 hover:shadow-sm transition-all group">
              <div className="w-10 h-10 rounded-lg bg-brand-50 flex items-center justify-center shrink-0">
                <span className="text-sm font-bold text-brand">#{i + 1}</span>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold text-surface-900 truncate">{ep.title}</h4>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs text-surface-500">Ep #{ep.episode_number} • {ep.date}</span>
                  {ep.duration > 0 && <span className="text-xs text-surface-400">{Math.floor(ep.duration / 60)} min</span>}
                </div>
                {ep.topics?.length > 0 && <div className="mt-2"><TopicTags topics={ep.topics} size="sm" /></div>}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={() => toggleBookmark(ep.id)}
                  className={`p-2 rounded-lg transition-all ${bookmarkedIds.has(ep.id) ? 'text-amber-500 bg-amber-50' : 'text-surface-400 hover:text-amber-500 hover:bg-amber-50'}`}>
                  <Bookmark className="w-4 h-4" fill={bookmarkedIds.has(ep.id) ? 'currentColor' : 'none'} />
                </button>
                <button onClick={() => onSelect(ep)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-brand hover:bg-brand-50 transition-all">
                  <Play className="w-3.5 h-3.5" /> Play
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
