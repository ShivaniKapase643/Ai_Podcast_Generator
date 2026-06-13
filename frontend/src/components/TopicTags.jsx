import React from 'react';

const tagColors = {
  '#LLM': 'bg-purple-50 text-purple-700 border-purple-200',
  '#OpenSource': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  '#Startup': 'bg-orange-50 text-orange-700 border-orange-200',
  '#Research': 'bg-blue-50 text-blue-700 border-blue-200',
  '#ProductLaunch': 'bg-pink-50 text-pink-700 border-pink-200',
  '#Regulation': 'bg-red-50 text-red-700 border-red-200',
  '#Hardware': 'bg-amber-50 text-amber-700 border-amber-200',
  '#Ethics': 'bg-indigo-50 text-indigo-700 border-indigo-200'
};

const defaultColor = 'bg-gray-50 text-gray-700 border-gray-200';

export default function TopicTags({ topics = [], size = 'md', onSelect }) {
  if (!topics || topics.length === 0) return null;

  const sizeClasses = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-xs px-2.5 py-1';

  return (
    <div className="flex flex-wrap gap-1.5">
      {topics.map((topic, i) => (
        <span
          key={i}
          onClick={() => onSelect?.(topic)}
          className={`rounded-lg border font-bold ${tagColors[topic] || defaultColor} ${sizeClasses} ${onSelect ? 'cursor-pointer hover:opacity-80' : ''}`}
        >
          {topic}
        </span>
      ))}
    </div>
  );
}
