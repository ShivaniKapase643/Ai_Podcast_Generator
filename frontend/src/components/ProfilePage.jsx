import React, { useState } from 'react';
import { User, Save, Heart, BookMarked, History, Star, Settings } from 'lucide-react';
import { updateProfile } from '../api/client';
import TopicTags from './TopicTags';

const ALL_TOPICS = ['#LLM', '#OpenSource', '#Startup', '#Research', '#ProductLaunch', '#Regulation', '#Hardware', '#Ethics'];
const VOICES = ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'];
const LENGTHS = ['short', 'medium', 'long'];

export default function ProfilePage({ user, setUser }) {
  const [form, setForm] = useState({
    display_name: user?.display_name || '',
    bio: user?.bio || '',
    preferred_topics: user?.preferred_topics || [],
    preferred_voice: user?.preferred_voice || 'alloy',
    preferred_length: user?.preferred_length || 'medium',
    notifications_enabled: user?.notifications_enabled ?? 1
  });
  const [saved, setSaved] = useState(false);
  const [activeSection, setActiveSection] = useState('profile');

  const toggleTopic = (topic) => {
    setForm(prev => ({
      ...prev,
      preferred_topics: prev.preferred_topics.includes(topic)
        ? prev.preferred_topics.filter(t => t !== topic)
        : [...prev.preferred_topics, topic]
    }));
  };

  const handleSave = async () => {
    try {
      const { data } = await updateProfile(form);
      setUser(data.user);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      alert('Failed to save: ' + (err.response?.data?.error || err.message));
    }
  };

  if (!user) return null;

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 rounded-lg bg-brand-50 border border-brand/20 flex items-center justify-center">
          <User className="w-5 h-5 text-brand" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-surface-900">My Profile</h2>
          <p className="text-xs text-surface-600">Personalize your podcast experience</p>
        </div>
      </div>

      {/* Section Tabs */}
      <div className="flex gap-2 mb-6">
        {[
          { id: 'profile', label: 'Profile', icon: User },
          { id: 'preferences', label: 'Preferences', icon: Settings },
          { id: 'topics', label: 'Topics', icon: Heart }
        ].map(s => (
          <button key={s.id} onClick={() => setActiveSection(s.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all border ${
              activeSection === s.id ? 'bg-brand-50 border-brand/20 text-brand-dark' : 'bg-white border-surface-300 text-surface-600 hover:bg-surface-50'
            }`}>
            <s.icon className="w-4 h-4" />{s.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-surface-300 p-6 shadow-sm">
        {/* Profile Info */}
        {activeSection === 'profile' && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-brand to-emerald-400 flex items-center justify-center text-white text-2xl font-bold">
                {(user.display_name || user.username || '?')[0].toUpperCase()}
              </div>
              <div>
                <h3 className="text-base font-bold text-surface-900">{user.display_name || user.username}</h3>
                <p className="text-sm text-surface-500">@{user.username} • {user.email}</p>
                <p className="text-xs text-surface-400 mt-1">Member since {user.created_at?.split('T')[0]}</p>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-surface-600 uppercase tracking-wide">Display Name</label>
              <input type="text" value={form.display_name} onChange={e => setForm({...form, display_name: e.target.value})}
                className="w-full mt-1 px-4 py-2.5 bg-surface-50 border border-surface-300 rounded-xl text-sm text-surface-900 focus:outline-none focus:border-brand" />
            </div>
            <div>
              <label className="text-xs font-bold text-surface-600 uppercase tracking-wide">Bio</label>
              <textarea value={form.bio} onChange={e => setForm({...form, bio: e.target.value})} rows={3}
                className="w-full mt-1 px-4 py-2.5 bg-surface-50 border border-surface-300 rounded-xl text-sm text-surface-900 focus:outline-none focus:border-brand resize-none"
                placeholder="Tell us about yourself..." />
            </div>
          </div>
        )}

        {/* Preferences */}
        {activeSection === 'preferences' && (
          <div className="space-y-6">
            <div>
              <label className="text-xs font-bold text-surface-600 uppercase tracking-wide mb-3 block">Preferred AI Voice</label>
              <div className="grid grid-cols-3 gap-2">
                {VOICES.map(v => (
                  <button key={v} onClick={() => setForm({...form, preferred_voice: v})}
                    className={`px-3 py-2 rounded-xl text-sm font-semibold capitalize transition-all border ${
                      form.preferred_voice === v ? 'bg-brand-50 border-brand text-brand-dark' : 'bg-surface-50 border-surface-300 text-surface-600 hover:border-surface-400'
                    }`}>{v}</button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-surface-600 uppercase tracking-wide mb-3 block">Episode Length</label>
              <div className="grid grid-cols-3 gap-2">
                {LENGTHS.map(l => (
                  <button key={l} onClick={() => setForm({...form, preferred_length: l})}
                    className={`px-3 py-2 rounded-xl text-sm font-semibold capitalize transition-all border ${
                      form.preferred_length === l ? 'bg-brand-50 border-brand text-brand-dark' : 'bg-surface-50 border-surface-300 text-surface-600 hover:border-surface-400'
                    }`}>
                    {l === 'short' ? '5-7 min' : l === 'medium' ? '8-12 min' : '15-20 min'}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl bg-surface-50 border border-surface-200">
              <div>
                <p className="text-sm font-bold text-surface-800">Email Notifications</p>
                <p className="text-xs text-surface-500">Get notified when new episodes drop</p>
              </div>
              <button onClick={() => setForm({...form, notifications_enabled: form.notifications_enabled ? 0 : 1})}
                className={`relative w-12 h-6 rounded-full transition-all ${form.notifications_enabled ? 'bg-brand' : 'bg-surface-300'}`}>
                <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${form.notifications_enabled ? 'left-6' : 'left-0.5'}`} />
              </button>
            </div>
          </div>
        )}

        {/* Topic Preferences */}
        {activeSection === 'topics' && (
          <div>
            <p className="text-sm text-surface-600 mb-4">Select topics you're interested in. We'll prioritize these in your recommendations.</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {ALL_TOPICS.map(topic => (
                <button key={topic} onClick={() => toggleTopic(topic)}
                  className={`px-3 py-2.5 rounded-xl text-sm font-bold transition-all border ${
                    form.preferred_topics.includes(topic)
                      ? 'bg-brand-50 border-brand text-brand-dark shadow-sm'
                      : 'bg-surface-50 border-surface-300 text-surface-600 hover:border-surface-400'
                  }`}>{topic}</button>
              ))}
            </div>
            <p className="text-xs text-surface-400 mt-3">{form.preferred_topics.length} topics selected</p>
          </div>
        )}

        {/* Save Button */}
        <div className="flex items-center justify-between mt-6 pt-5 border-t border-surface-200">
          <button onClick={handleSave}
            className="flex items-center gap-2 px-5 py-2.5 bg-brand text-white rounded-xl font-bold hover:bg-brand-dark shadow-sm transition-all">
            <Save className="w-4 h-4" /> Save Changes
          </button>
          {saved && <span className="text-sm text-emerald-600 font-semibold">✓ Saved!</span>}
        </div>
      </div>
    </div>
  );
}
