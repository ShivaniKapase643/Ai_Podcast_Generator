import React, { useState, useEffect } from 'react';
import { History, Play, CheckCircle } from 'lucide-react';
import { getHistory } from '../api/client';

export default function HistoryPage({ user, onSelect }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const { data } = await getHistory();
        setHistory(data.history || []);
      } catch {} finally { setLoading(false); }
    })();
  }, [user]);

  if (!user) {
    return (
      <div className="text-center py-16 bg-white rounded-2xl border border-surface-300">
        <History className="w-14 h-14 mx-auto mb-4 text-surface-300" />
        <p className="text-surface-700 font-semibold">Sign in to see listening history</p>
      </div>
    );
  }

  if (loading) return <div className="flex justify-center py-16"><div className="w-10 h-10 border-3 border-brand border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center">
          <History className="w-5 h-5 text-indigo-600" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-surface-900">Listening History</h2>
          <p className="text-xs text-surface-600">{history.length} episodes listened</p>
        </div>
      </div>

      {history.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-surface-300">
          <History className="w-12 h-12 mx-auto mb-3 text-surface-300" />
          <p className="text-surface-700 font-semibold">No listening history</p>
          <p className="text-sm text-surface-500 mt-1">Play an episode to start tracking</p>
        </div>
      ) : (
        <div className="space-y-2">
          {history.map(h => {
            const progressPct = h.duration ? Math.round((h.progress_seconds / h.duration) * 100) : 0;
            return (
              <div key={h.id} className="flex items-center gap-4 p-4 bg-white rounded-xl border border-surface-300 hover:border-brand/30 transition-all group">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-surface-900 truncate">{h.title}</h4>
                    {h.completed ? <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" /> : null}
                  </div>
                  <p className="text-xs text-surface-500 mt-1">Ep #{h.episode_number} • {h.date}</p>
                  {!h.completed && h.progress_seconds > 0 && (
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-surface-100 rounded-full overflow-hidden">
                        <div className="h-full bg-brand rounded-full" style={{ width: `${progressPct}%` }} />
                      </div>
                      <span className="text-xs text-surface-400">{progressPct}%</span>
                    </div>
                  )}
                </div>
                <button onClick={() => onSelect({ id: h.episode_id, ...h })}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-brand hover:bg-brand-50 shrink-0">
                  <Play className="w-3.5 h-3.5" /> {h.completed ? 'Replay' : 'Resume'}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
