import React, { useState } from 'react';
import { Mic, Radio, Users, BarChart3, Clock, Newspaper, User, Sparkles, Bookmark, History, LogOut, Share2, TrendingUp, Wand2, Menu, X } from 'lucide-react';
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
  const [sidebarOpen, setSidebarOpen] = useState(false);

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

  // Bottom nav shows only these on mobile
  const mobileNav = [
    { id: 'generate', label: 'Generate', icon: Mic },
    { id: 'episodes', label: 'Episodes', icon: Radio },
    { id: 'recommendations', label: 'For You', icon: Sparkles },
    { id: 'trending', label: 'Trending', icon: TrendingUp },
    { id: 'profile', label: 'Profile', icon: User }
  ];

  const handleGenerationComplete = () => { fetchEpisodes(); fetchStats(); };
  const handleSelectEpisode = (ep) => { setSelectedEpisode(ep); setActiveTab('generate'); setSidebarOpen(false); };
  const switchTab = (id) => { setActiveTab(id); setSidebarOpen(false); };

  return (
    <div className="flex flex-col h-screen bg-surface-50">
      {/* Header */}
      <header className="bg-white border-b border-surface-300 px-4 md:px-6 py-3 shrink-0 shadow-sm z-30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-3">
            {/* Mobile menu button */}
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="md:hidden p-2 -ml-2 rounded-lg text-surface-600 hover:bg-surface-100">
              <Menu className="w-5 h-5" />
            </button>
            <div className="w-8 h-8 md:w-9 md:h-9 rounded-xl bg-brand text-white flex items-center justify-center shadow-md">
              <Mic className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-base md:text-lg font-bold text-surface-900">AI News Podcast</h1>
              <p className="text-xs text-surface-500 hidden sm:block">Automated Daily AI News Digest</p>
            </div>
          </div>
          <div className="flex items-center gap-2 md:gap-3">
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 pulse-dot"></span> Online
            </span>
            <button onClick={() => switchTab('profile')}
              className="flex items-center gap-2 px-2 md:px-3 py-1.5 rounded-lg bg-surface-50 border border-surface-300 hover:bg-surface-100 transition-all">
              <div className="w-6 h-6 md:w-7 md:h-7 rounded-full bg-gradient-to-br from-brand to-emerald-400 text-white flex items-center justify-center text-xs font-bold">
                {(user.display_name || user.username || '?')[0].toUpperCase()}
              </div>
              <span className="text-sm font-semibold text-surface-700 hidden md:inline">{user.display_name || user.username}</span>
            </button>
            <button onClick={onLogout} className="p-2 rounded-lg text-surface-400 hover:text-red-600 hover:bg-red-50 transition-all" title="Logout">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 bg-black/40 z-40 md:hidden" onClick={() => setSidebarOpen(false)} />
        )}

        {/* Sidebar - hidden on mobile, slide-in drawer when toggled */}
        <nav className={`
          fixed md:static inset-y-0 left-0 z-50 w-56 md:w-48 bg-white border-r border-surface-300 p-3 md:p-2 space-y-0.5 shrink-0 overflow-y-auto
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}>
          {/* Close button mobile */}
          <div className="flex items-center justify-between mb-3 md:hidden">
            <span className="text-sm font-bold text-surface-700">Menu</span>
            <button onClick={() => setSidebarOpen(false)} className="p-1 rounded-lg text-surface-500 hover:bg-surface-100">
              <X className="w-5 h-5" />
            </button>
          </div>

          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button key={tab.id} onClick={() => switchTab(tab.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 md:py-2 rounded-lg text-sm md:text-xs font-semibold transition-all ${
                  activeTab === tab.id
                    ? 'bg-brand-50 text-brand-dark border border-brand/20'
                    : 'text-surface-600 hover:text-surface-900 hover:bg-surface-50'
                }`}>
                <Icon className="w-4 h-4 md:w-3.5 md:h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </nav>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-surface-50 pb-20 md:pb-6">
          <div className="max-w-5xl mx-auto">
            {activeTab === 'generate' && (
              <div className="space-y-4 md:space-y-6">
                <GenerateButton onComplete={handleGenerationComplete} />
                {selectedEpisode && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
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

        {/* Right Panel - hidden on mobile & tablet */}
        {selectedEpisode && (
          <aside className="w-72 bg-white border-l border-surface-300 p-4 overflow-y-auto hidden 2xl:block shrink-0">
            <h3 className="text-xs font-bold text-surface-500 uppercase tracking-wider mb-3">Now Playing</h3>
            <AudioPlayer episode={selectedEpisode} compact user={user} />
            <div className="mt-3">
              <TranscriptViewer episode={selectedEpisode} compact />
            </div>
          </aside>
        )}
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-surface-300 px-2 py-2 z-30 shadow-lg">
        <div className="flex items-center justify-around">
          {mobileNav.map(tab => {
            const Icon = tab.icon;
            return (
              <button key={tab.id} onClick={() => switchTab(tab.id)}
                className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-all ${
                  activeTab === tab.id ? 'text-brand' : 'text-surface-400'
                }`}>
                <Icon className="w-5 h-5" />
                <span className="text-[10px] font-semibold">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
