import React from 'react';
import { BarChart3, Headphones, Clock, Tag } from 'lucide-react';

export default function StatsPanel({ stats }) {
  if (!stats) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-10 h-10 border-3 border-brand border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const formatDuration = (seconds) => {
    if (!seconds) return '0 min';
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins} min`;
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 rounded-lg bg-purple-50 border border-purple-200 flex items-center justify-center">
          <BarChart3 className="w-5 h-5 text-purple-600" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-surface-900">Analytics</h2>
          <p className="text-xs text-surface-600">Podcast performance overview</p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 mb-6 md:mb-8">
        <div className="bg-white rounded-2xl border border-surface-300 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center">
              <Headphones className="w-5 h-5 text-brand" />
            </div>
            <span className="text-sm text-surface-600 font-medium">Total Episodes</span>
          </div>
          <p className="text-4xl font-extrabold text-surface-900">{stats.totalEpisodes}</p>
        </div>

        <div className="bg-white rounded-2xl border border-surface-300 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
              <Clock className="w-5 h-5 text-purple-600" />
            </div>
            <span className="text-sm text-surface-600 font-medium">Total Duration</span>
          </div>
          <p className="text-4xl font-extrabold text-surface-900">{formatDuration(stats.totalDuration)}</p>
        </div>

        <div className="bg-white rounded-2xl border border-surface-300 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
              <Tag className="w-5 h-5 text-emerald-600" />
            </div>
            <span className="text-sm text-surface-600 font-medium">Topics Covered</span>
          </div>
          <p className="text-4xl font-extrabold text-surface-900">{stats.topTopics?.length || 0}</p>
        </div>
      </div>

      {/* Popular Topics */}
      {stats.topTopics && stats.topTopics.length > 0 && (
        <div className="bg-white rounded-2xl border border-surface-300 p-6 shadow-sm">
          <h3 className="text-sm font-bold text-surface-900 mb-5">Most Covered Topics</h3>
          <div className="space-y-4">
            {stats.topTopics.map((item, i) => {
              const maxCount = stats.topTopics[0]?.count || 1;
              const barWidth = (item.count / maxCount) * 100;
              return (
                <div key={i} className="flex items-center gap-4">
                  <span className="text-xs text-surface-400 font-bold w-5">{i + 1}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm font-bold text-surface-800">{item.topic}</span>
                      <span className="text-xs text-surface-500 font-semibold">{item.count} episode{item.count !== 1 ? 's' : ''}</span>
                    </div>
                    <div className="h-2.5 bg-surface-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-brand to-emerald-400 rounded-full transition-all duration-500"
                        style={{ width: `${barWidth}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
