import React, { useState } from 'react';
import { Play, Loader2, Zap, XCircle, Sparkles } from 'lucide-react';
import { useGeneration } from '../hooks/useGeneration';

const PODCAST_CATEGORIES = [
  { id: 'ai-general', label: 'AI & Machine Learning', emoji: '🤖' },
  { id: 'llm', label: 'LLMs & ChatGPT', emoji: '💬' },
  { id: 'startups', label: 'Tech Startups & Funding', emoji: '🚀' },
  { id: 'opensource', label: 'Open Source AI', emoji: '🔓' },
  { id: 'research', label: 'AI Research & Papers', emoji: '🔬' },
  { id: 'products', label: 'Product Launches', emoji: '📦' },
  { id: 'regulation', label: 'AI Policy & Regulation', emoji: '⚖️' },
  { id: 'hardware', label: 'AI Hardware & Chips', emoji: '🖥️' },
  { id: 'robotics', label: 'Robotics & Automation', emoji: '🦾' },
  { id: 'healthcare', label: 'AI in Healthcare', emoji: '🏥' },
  { id: 'coding', label: 'AI Coding & DevTools', emoji: '👨‍💻' },
  { id: 'creative', label: 'Generative Art & Media', emoji: '🎨' },
  { id: 'finance', label: 'AI in Finance & Crypto', emoji: '💰' },
  { id: 'autonomous', label: 'Self-Driving & Drones', emoji: '🚗' },
  { id: 'education', label: 'AI in Education', emoji: '📚' },
  { id: 'security', label: 'AI & Cybersecurity', emoji: '🔒' }
];

export default function GenerateButton({ onComplete }) {
  const [selectedCategory, setSelectedCategory] = useState('ai-general');
  const [showAllTopics, setShowAllTopics] = useState(false);
  const {
    isGenerating,
    progress,
    stage,
    message,
    error,
    result,
    startGeneration,
    cancelGeneration,
    startDryRun
  } = useGeneration();

  React.useEffect(() => {
    if (result && onComplete) {
      onComplete();
    }
  }, [result, onComplete]);

  return (
    <div className="space-y-4">
      {/* Topic Selector */}
      <div className="bg-white rounded-2xl p-6 border border-surface-300 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-purple-600" />
          <h3 className="text-base font-bold text-surface-900">Choose Podcast Topic</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {(showAllTopics ? PODCAST_CATEGORIES : PODCAST_CATEGORIES.slice(0, 8)).map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-all border ${
                selectedCategory === cat.id
                  ? 'bg-brand-50 border-brand text-brand-dark shadow-sm'
                  : 'bg-surface-50 border-surface-300 text-surface-700 hover:border-surface-400 hover:bg-surface-100'
              }`}
            >
              <span className="text-base">{cat.emoji}</span>
              <span className="truncate text-left">{cat.label}</span>
            </button>
          ))}
        </div>
        {PODCAST_CATEGORIES.length > 8 && (
          <button onClick={() => setShowAllTopics(!showAllTopics)}
            className="mt-3 text-xs font-semibold text-brand hover:underline">
            {showAllTopics ? 'Show less ▲' : `+ ${PODCAST_CATEGORIES.length - 8} more topics ▼`}
          </button>
        )}
      </div>

      {/* Generate Controls */}
      <div className="bg-white rounded-2xl p-4 md:p-6 border border-surface-300 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div>
            <h2 className="text-lg md:text-xl font-bold text-surface-900">Generate Episode</h2>
            <p className="text-sm text-surface-600 mt-1">Create today's AI news podcast with one click</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={startDryRun}
              disabled={isGenerating}
              className="flex items-center gap-2 px-3 md:px-4 py-2.5 rounded-xl bg-surface-100 text-surface-700 hover:bg-surface-200 transition-all text-sm font-semibold border border-surface-300 disabled:opacity-40"
            >
              <Zap className="w-4 h-4" />
              <span className="hidden sm:inline">Dry Run</span>
            </button>
            {isGenerating ? (
              <button
                onClick={cancelGeneration}
                className="flex items-center gap-2 px-3 md:px-4 py-2.5 rounded-xl bg-red-50 text-red-700 hover:bg-red-100 transition-all text-sm font-semibold border border-red-200"
              >
                <XCircle className="w-4 h-4" />
                Cancel
              </button>
            ) : (
              <button
                onClick={startGeneration}
                className="flex items-center gap-2 px-4 md:px-6 py-2.5 rounded-xl bg-brand text-white font-bold hover:bg-brand-dark transition-all text-sm shadow-md glow"
              >
                <Play className="w-4 h-4" />
                Generate Now
              </button>
            )}
          </div>
        </div>

        {/* Pipeline Info Cards */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          <div className="bg-blue-50 rounded-xl p-3 border border-blue-100">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm">🔍</span>
              <span className="text-xs font-bold text-blue-700">Scrape</span>
            </div>
            <p className="text-xs text-blue-600">8+ sources</p>
          </div>
          <div className="bg-purple-50 rounded-xl p-3 border border-purple-100">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm">🤖</span>
              <span className="text-xs font-bold text-purple-700">AI Script</span>
            </div>
            <p className="text-xs text-purple-600">GPT-4o powered</p>
          </div>
          <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-100">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm">🎙️</span>
              <span className="text-xs font-bold text-emerald-700">Audio</span>
            </div>
            <p className="text-xs text-emerald-600">ElevenLabs TTS</p>
          </div>
        </div>

        {/* Progress Bar */}
        {isGenerating && (
          <div className="space-y-3 p-4 rounded-xl bg-surface-50 border border-surface-300">
            <div className="relative h-3 bg-surface-200 rounded-full overflow-hidden">
              <div
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-brand to-emerald-400 rounded-full transition-all duration-700 ease-out"
                style={{ width: `${Math.max(progress, 3)}%` }}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 text-brand animate-spin" />
                <span className="text-sm font-semibold text-surface-800">{message}</span>
              </div>
              <span className="text-sm font-bold text-brand">{progress}%</span>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mt-4 p-4 rounded-xl bg-red-50 border border-red-200">
            <p className="text-sm text-red-700 font-semibold">❌ {error}</p>
          </div>
        )}

        {/* Success */}
        {result && !isGenerating && (
          <div className="mt-4 p-4 rounded-xl bg-emerald-50 border border-emerald-200">
            <p className="text-sm text-emerald-700 font-bold mb-1">
              ✅ Episode #{result.episode_number} generated successfully!
            </p>
            <p className="text-xs text-emerald-600">
              {result.status === 'completed' 
                ? '🎧 Audio is ready to play! Select the episode from the Episodes tab or click below.' 
                : '📝 Script & transcript saved. Audio was not generated (TTS service issue — episode still available as text).'}
            </p>
            <button
              onClick={() => { if (onComplete) onComplete(); }}
              className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 transition-all">
              🎙️ Go to Episodes
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
