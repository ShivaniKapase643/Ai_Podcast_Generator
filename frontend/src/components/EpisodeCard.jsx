import React from 'react';
import { Play, Trash2, Calendar, Clock, Hash } from 'lucide-react';
import TopicTags from './TopicTags';

export default function EpisodeCard({ episode, onSelect, onDelete }) {
  const formatDuration = (seconds) => {
    if (!seconds) return '--:--';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const statusStyles = {
    completed: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    generating: 'text-amber-700 bg-amber-50 border-amber-200',
    failed: 'text-red-700 bg-red-50 border-red-200',
    draft: 'text-blue-700 bg-blue-50 border-blue-200',
    pending: 'text-gray-600 bg-gray-50 border-gray-200'
  };

  return (
    <div className="bg-white rounded-2xl border border-surface-300 p-5 hover:border-brand/40 hover:shadow-md transition-all duration-200 group">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-bold text-surface-900 truncate">{episode.title}</h4>
          <p className="text-xs text-surface-600 mt-1.5 line-clamp-2 leading-relaxed">{episode.description}</p>
        </div>
        <span className={`ml-3 px-2.5 py-1 rounded-lg text-xs font-bold shrink-0 border ${statusStyles[episode.status] || statusStyles.pending}`}>
          {episode.status}
        </span>
      </div>

      <div className="flex items-center gap-4 text-xs text-surface-600 font-medium mb-3">
        <span className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-surface-500" />
          {episode.date}
        </span>
        <span className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-surface-500" />
          {formatDuration(episode.duration)}
        </span>
        <span className="flex items-center gap-1.5">
          <Hash className="w-3.5 h-3.5 text-surface-500" />
          Ep {episode.episode_number}
        </span>
      </div>

      {episode.topics && episode.topics.length > 0 && (
        <TopicTags topics={episode.topics} size="sm" />
      )}

      <div className="flex items-center justify-between mt-4 pt-4 border-t border-surface-200">
        <button
          onClick={() => onSelect(episode)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold text-brand hover:bg-brand-50 transition-all"
        >
          <Play className="w-3.5 h-3.5" />
          Play Episode
        </button>
        <button
          onClick={() => onDelete(episode.id)}
          className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs text-surface-400 hover:text-red-600 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
