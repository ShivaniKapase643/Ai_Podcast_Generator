import React, { useState, useEffect } from 'react';
import { Share2, Copy, CheckCircle, Link2, Twitter, Mail, MessageSquare } from 'lucide-react';
import { getEpisodes } from '../api/client';

export default function SharePage({ user }) {
  const [episodes, setEpisodes] = useState([]);
  const [selectedEp, setSelectedEp] = useState(null);
  const [copied, setCopied] = useState('');

  useEffect(() => {
    getEpisodes(1, 20).then(res => {
      const eps = (res.data.episodes || []).filter(e => e.status === 'completed' || e.status === 'draft');
      setEpisodes(eps);
      if (eps.length > 0) setSelectedEp(eps[0]);
    }).catch(() => {});
  }, []);

  const baseUrl = window.location.origin;

  const getShareUrl = () => selectedEp ? `${baseUrl}/episode/${selectedEp.id}` : baseUrl;
  const getShareText = () => selectedEp
    ? `🎙️ Check out "${selectedEp.title}" on AI News Podcast - Daily AI news, automatically curated and narrated!`
    : '🎙️ AI News Podcast - Your daily AI news digest, auto-generated!';

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(''), 2000);
  };

  const shareLinks = [
    {
      id: 'twitter',
      label: 'Twitter / X',
      icon: Twitter,
      color: 'bg-blue-50 border-blue-200 text-blue-700',
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(getShareText())}&url=${encodeURIComponent(getShareUrl())}`
    },
    {
      id: 'gmail',
      label: 'Gmail',
      icon: Mail,
      color: 'bg-red-50 border-red-200 text-red-700',
      url: `https://mail.google.com/mail/?view=cm&fs=1&su=${encodeURIComponent('Check out this AI Podcast!')}&body=${encodeURIComponent(getShareText() + '\n\n' + getShareUrl())}`
    },
    {
      id: 'whatsapp',
      label: 'WhatsApp',
      icon: MessageSquare,
      color: 'bg-green-50 border-green-200 text-green-700',
      url: `https://wa.me/?text=${encodeURIComponent(getShareText() + ' ' + getShareUrl())}`
    }
  ];

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 rounded-lg bg-pink-50 border border-pink-200 flex items-center justify-center">
          <Share2 className="w-5 h-5 text-pink-600" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-surface-900">Share</h2>
          <p className="text-xs text-surface-600">Share episodes with friends</p>
        </div>
      </div>

      {/* Episode Selector */}
      <div className="bg-white rounded-2xl border border-surface-300 p-5 mb-6 shadow-sm">
        <label className="text-xs font-bold text-surface-600 uppercase tracking-wide mb-2 block">Select Episode to Share</label>
        <select value={selectedEp?.id || ''} onChange={e => setSelectedEp(episodes.find(ep => ep.id === e.target.value))}
          className="w-full px-4 py-2.5 bg-surface-50 border border-surface-300 rounded-xl text-sm text-surface-900 focus:outline-none focus:border-brand">
          {episodes.map(ep => (
            <option key={ep.id} value={ep.id}>Ep #{ep.episode_number} — {ep.title}</option>
          ))}
        </select>
      </div>

      {/* Share Link */}
      <div className="bg-white rounded-2xl border border-surface-300 p-5 mb-6 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <Link2 className="w-4 h-4 text-surface-500" />
          <h3 className="text-sm font-bold text-surface-900">Share Link</h3>
        </div>
        <div className="flex gap-2">
          <input readOnly value={getShareUrl()}
            className="flex-1 px-4 py-2.5 bg-surface-50 border border-surface-300 rounded-xl text-sm text-surface-700 font-mono" />
          <button onClick={() => copyToClipboard(getShareUrl(), 'link')}
            className="flex items-center gap-2 px-4 py-2.5 bg-brand text-white rounded-xl text-sm font-bold hover:bg-brand-dark transition-all">
            {copied === 'link' ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied === 'link' ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </div>

      {/* Social Share */}
      <div className="bg-white rounded-2xl border border-surface-300 p-5 shadow-sm">
        <h3 className="text-sm font-bold text-surface-900 mb-4">Share on Social</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {shareLinks.map(s => (
            <a key={s.id} href={s.url} target="_blank" rel="noopener noreferrer"
              className={`flex items-center gap-3 p-4 rounded-xl border font-semibold text-sm hover:shadow-sm transition-all ${s.color}`}>
              <s.icon className="w-5 h-5" />
              {s.label}
            </a>
          ))}
        </div>
      </div>

      {/* Embed Code */}
      <div className="bg-white rounded-2xl border border-surface-300 p-5 mt-6 shadow-sm">
        <h3 className="text-sm font-bold text-surface-900 mb-3">Embed Player</h3>
        <p className="text-xs text-surface-500 mb-3">Add this podcast player to your website or blog</p>
        <div className="relative">
          <pre className="bg-surface-50 border border-surface-200 rounded-xl p-4 text-xs text-surface-600 font-mono overflow-x-auto">
{`<iframe src="${baseUrl}/embed/${selectedEp?.id || ''}" 
  width="100%" height="180" 
  frameborder="0" 
  allow="autoplay">
</iframe>`}
          </pre>
          <button onClick={() => copyToClipboard(`<iframe src="${baseUrl}/embed/${selectedEp?.id || ''}" width="100%" height="180" frameborder="0" allow="autoplay"></iframe>`, 'embed')}
            className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-lg bg-white border border-surface-300 text-xs text-surface-600 hover:text-brand">
            {copied === 'embed' ? <CheckCircle className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
          </button>
        </div>
      </div>
    </div>
  );
}
