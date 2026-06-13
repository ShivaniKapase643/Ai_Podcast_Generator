import React, { useState } from 'react';
import { Mic, Radio, Users, BarChart3, Clock, Newspaper, User, Sparkles, Bookmark, History, LogOut, Share2, TrendingUp, Wand2 } from 'lucide-react';
import GenerateButton from './GenerateButton';
import EpisodeHistory from './EpisodeHistory';
import AudioPlayer from './AudioPlayer';
import TranscriptViewer from './TranscriptViewer';
import NewsPreview from './NewsPreview';
import SubscribeForm from './SubscribeForm';
import StatsPanel from './StatsPanel';
import ScheduleToggle from './ScheduleToggle';
import ProfilePage from './ProfilePage';
import RecommendationsPage from './RecommendationsPage';
import BookmarksPage from './BookmarksPage';
import HistoryPage from './HistoryPage';
import TrendingPage from './TrendingPage';
import SharePage from './SharePage';
import PlaylistsPage from './PlaylistsPage';
import { useEpisodes } from '../hooks/useEpisodes';

export default function Dashboard({ user, setUser, onLogout }) {
  const { episodes, loading, stats, fetchEpisodes, fetchStats, removeEpisode } = useEpisodes();
  const [selectedEpisode, setSelectedEpisode] = useState(null);
  const [activeTab, setActiveTab] = useState('generate');

  const tabs = [
    { id: 'generate', label: 'Generate', icon: Mic },
    { id: 'recommendations', label: 'For You', icon: Sparkles },
    { id: 'trending', label: 'Trending', icon: TrendingUp },
    { id: 'episodes', label: 'Episodes', icon: Radio },
    { id: 'playlists', label: 'Playlists', icon: Wand2 },
    { id: 'bookmarks', label: 'Bookmarks', icon: Bookmark },
    { id: 'history', label: 'History', icon: History },
    { id: 'news', label: 'News Preview', icon: Newspaper },
    { id: 'share', label: 'Share', icon: Share2 },
    { id: 'subscribers', label: 'Subscribers', icon: Users },
    { id: 'stats', label: 'Analytics', icon: BarChart3 },
    { id: 'schedule', label: 'Schedule', icon: Clock },
    { id: 'profile', label: 'Profile', icon: User }
  ];

  const handleGenerationComplete = () => { fetchEpisodes(); fetchStats(); };
  const handleSelectEpisode = (ep) => { setSelectedEpisode(ep); setActiveTab('generate'); };

  return (
    <div className="flex flex-col h-screen bg-surface-50">
      {/* Header */}
      <header className="bg-white border-b border-surface-300 px-6 py-3 shrink-0 shadow-sm">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-brand text-white flex items-center justify-center shadow-md">
              <Mic className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-surface-900">AI News Podcast</h1>
              <p className="text-xs text-surface-500">Automated Daily AI News Digest</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 pulse-dot"></span> Online
            </span>
            <button onClick={() => setActiveTab('profile')}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-50 border border-surface-300 hover:bg-surface-100 transition-all">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-brand to-emerald-400 text-white flex items-center justify-center text-xs font-bold">
                {(user.display_name || user.username || '?')[0].toUpperCase()}
              </div>
              <span className="text-sm font-semibold text-surface-700 hidden sm:inline">{user.display_name || user.username}</span>
            </button>
            <button onClick={onLogout} className="p-2 rounded-lg text-surface-400 hover:text-red-600 hover:bg-red-50 transition-all" title="Logout">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <nav className="w-48 bg-white border-r border-surface-300 p-2 space-y-0.5 shrink-0 overflow-y-auto">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === tab.id
                    ? 'bg-brand-50 text-brand-dark border border-brand/20'
                    : 'text-surface-600 hover:text-surface-900 hover:bg-surface-50'
                }`}>
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </nav>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6 bg-surface-50">
          <div className="max-w-5xl mx-auto">
            {activeTab === 'generate' && (
              <div className="space-y-6">
                <GenerateButton onComplete={handleGenerationComplete} />
                {selectedEpisode && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <AudioPlayer episode={selectedEpisode} user={user} />
                    <TranscriptViewer episode={selectedEpisode} />
                  </div>
                )}
              </div>
            )}
            {activeTab === 'episodes' && <EpisodeHistory episodes={episodes} loading={loading} onSelect={handleSelectEpisode} onDelete={removeEpisode} />}
            {activeTab === 'recommendations' && <RecommendationsPage user={user} onSelect={handleSelectEpisode} />}
            {activeTab === 'trending' && <TrendingPage onSelect={handleSelectEpisode} />}
            {activeTab === 'playlists' && <PlaylistsPage user={user} onSelect={handleSelectEpisode} />}
            {activeTab === 'bookmarks' && <BookmarksPage user={user} onSelect={handleSelectEpisode} />}
            {activeTab === 'history' && <HistoryPage user={user} onSelect={handleSelectEpisode} />}
            {activeTab === 'news' && <NewsPreview />}
            {activeTab === 'share' && <SharePage user={user} />}
            {activeTab === 'subscribers' && <SubscribeForm />}
            {activeTab === 'stats' && <StatsPanel stats={stats} />}
            {activeTab === 'schedule' && <ScheduleToggle />}
            {activeTab === 'profile' && <ProfilePage user={user} setUser={setUser} />}
          </div>
        </main>

        {/* Right Panel */}
        {selectedEpisode && (
          <aside className="w-72 bg-white border-l border-surface-300 p-4 overflow-y-auto hidden xl:block shrink-0">
            <h3 className="text-xs font-bold text-surface-500 uppercase tracking-wider mb-3">Now Playing</h3>
            <AudioPlayer episode={selectedEpisode} compact user={user} />
            <div className="mt-3">
              <TranscriptViewer episode={selectedEpisode} compact />
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
