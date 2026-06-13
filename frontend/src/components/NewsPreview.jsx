import React, { useState, useEffect } from 'react';
import { Newspaper, RefreshCw, ExternalLink } from 'lucide-react';
import { getNewsPreview } from '../api/client';

export default function NewsPreview() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchNews = async () => {
    setLoading(true); setError(null);
    try { const { data } = await getNewsPreview(); setArticles(data.articles || []); }
    catch (err) { setError(err.response?.data?.error || 'Failed to fetch news'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchNews(); }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center">
            <Newspaper className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-surface-900">Today's Headlines</h2>
            <p className="text-xs text-surface-600">{articles.length} articles found</p>
          </div>
        </div>
        <button
          onClick={fetchNews}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-surface-700 hover:bg-surface-100 transition-all text-sm font-semibold border border-surface-300 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="p-4 mb-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700 font-medium">{error}</div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-10 h-10 border-3 border-brand border-t-transparent rounded-full animate-spin" />
        </div>
      ) : articles.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-surface-300">
          <Newspaper className="w-14 h-14 mx-auto mb-4 text-surface-300" />
          <p className="text-surface-700 font-semibold">No articles scraped yet</p>
          <p className="text-sm text-surface-500 mt-1">Click Refresh to fetch latest news</p>
        </div>
      ) : (
        <div className="space-y-2">
          {articles.map((article, i) => (
            <div
              key={i}
              className="flex items-start gap-4 p-4 rounded-xl bg-white border border-surface-300 hover:border-brand/30 hover:shadow-sm transition-all group"
            >
              <span className="text-xs text-surface-400 font-bold mt-0.5 w-6 shrink-0">{i + 1}</span>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-surface-900 leading-snug">{article.title}</h4>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-xs font-bold text-brand">{article.source}</span>
                  {article.category && (
                    <span className="text-xs text-surface-500 bg-surface-100 px-2 py-0.5 rounded-md font-medium">{article.category}</span>
                  )}
                </div>
              </div>
              {article.url && (
                <a href={article.url} target="_blank" rel="noopener noreferrer"
                  className="text-surface-400 hover:text-brand transition-colors opacity-0 group-hover:opacity-100 shrink-0">
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
