import React, { useState, useEffect } from 'react';
import { Bookmark, Play, Trash2 } from 'lucide-react';
import { getBookmarks, removeBookmark } from '../api/client';
import TopicTags from './TopicTags';

export default function BookmarksPage({ user, onSelect }) {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    loadBookmarks();
  }, [user]);

  const loadBookmarks = async () => {
    setLoading(true);
    try {
      const { data } = await getBookmarks();
      setBookmarks(data.bookmarks || []);
    } catch {} finally { setLoading(false); }
  };

  const handleRemove = async (episodeId) => {
    await removeBookmark(episodeId);
    setBookmarks(prev => prev.filter(b => b.episode_id !== episodeId));
  };

  if (!user) {
    return (
      <div className="text-center py-16 bg-white rounded-2xl border border-surface-300">
        <Bookmark className="w-14 h-14 mx-auto mb-4 text-surface-300" />
        <p className="text-surface-700 font-semibold">Sign in to save bookmarks</p>
      </div>
    );
  }

  if (loading) return <div className="flex justify-center py-16"><div className="w-10 h-10 border-3 border-brand border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center">
          <Bookmark className="w-5 h-5 text-amber-600" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-surface-900">Bookmarks</h2>
          <p className="text-xs text-surface-600">{bookmarks.length} saved episodes</p>
        </div>
      </div>

      {bookmarks.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-surface-300">
          <Bookmark className="w-12 h-12 mx-auto mb-3 text-surface-300" />
          <p className="text-surface-700 font-semibold">No bookmarks yet</p>
          <p className="text-sm text-surface-500 mt-1">Save episodes to listen to later</p>
        </div>
      ) : (
        <div className="space-y-2">
          {bookmarks.map(b => (
            <div key={b.id} className="flex items-center gap-4 p-4 bg-white rounded-xl border border-surface-300 hover:border-brand/30 transition-all group">
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold text-surface-900">{b.title}</h4>
                <p className="text-xs text-surface-500 mt-1">Ep #{b.episode_number} • {b.date}</p>
                {b.topics?.length > 0 && <div className="mt-2"><TopicTags topics={b.topics} size="sm" /></div>}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={() => onSelect({ id: b.episode_id, ...b })}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-brand hover:bg-brand-50"><Play className="w-3.5 h-3.5" /> Play</button>
                <button onClick={() => handleRemove(b.episode_id)}
                  className="p-2 rounded-lg text-surface-400 hover:text-red-600 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
