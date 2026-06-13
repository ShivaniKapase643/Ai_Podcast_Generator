import React from 'react';
import { Radio } from 'lucide-react';
import EpisodeCard from './EpisodeCard';

export default function EpisodeHistory({ episodes, loading, onSelect, onDelete }) {
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
        <div className="w-9 h-9 rounded-lg bg-brand-50 border border-brand/20 flex items-center justify-center">
          <Radio className="w-5 h-5 text-brand" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-surface-900">Episode Library</h2>
          <p className="text-xs text-surface-600">{episodes.length} episodes generated</p>
        </div>
      </div>

      {episodes.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-surface-300">
          <Radio className="w-14 h-14 text-surface-300 mx-auto mb-4" />
          <p className="text-surface-700 font-semibold">No episodes yet</p>
          <p className="text-sm text-surface-500 mt-1">Generate your first episode to see it here</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {episodes.map(episode => (
            <EpisodeCard
              key={episode.id}
              episode={episode}
              onSelect={onSelect}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
