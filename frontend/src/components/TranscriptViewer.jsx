import React, { useState, useEffect } from 'react';
import { FileText, Download } from 'lucide-react';
import { getTranscript, getPdfUrl } from '../api/client';

export default function TranscriptViewer({ episode, compact = false }) {
  const [transcript, setTranscript] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!episode) return;
    const fetchTranscript = async () => {
      setLoading(true);
      try {
        if (episode.transcript) { setTranscript(episode.transcript); }
        else { const { data } = await getTranscript(episode.id); setTranscript(data); }
      } catch { setTranscript('Transcript not available for this episode.'); }
      finally { setLoading(false); }
    };
    fetchTranscript();
  }, [episode?.id]);

  if (!episode) {
    return (
      <div className="bg-white rounded-2xl p-6 border border-surface-300 shadow-sm">
        <p className="text-surface-500 text-center text-sm">Select an episode to view transcript</p>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-2xl border border-surface-300 shadow-sm ${compact ? 'p-4' : 'p-6'}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-purple-600" />
          <h3 className="text-sm font-bold text-surface-900">Transcript</h3>
        </div>
        <a
          href={getPdfUrl(episode.id)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold text-brand hover:bg-brand-50 transition-all border border-brand/20"
        >
          <Download className="w-3 h-3" />
          PDF
        </a>
      </div>

      <div className={`overflow-y-auto text-sm leading-relaxed whitespace-pre-wrap ${compact ? 'max-h-52' : 'max-h-96'}`}>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-6 h-6 border-2 border-brand border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          transcript.split('\n').map((line, i) => {
            if (line.match(/^\[\d{2}:\d{2}\]/)) {
              return <p key={i} className="text-brand font-mono text-xs mt-5 mb-1 font-bold">{line}</p>;
            }
            if (line.match(/^(INTRO|STORY|SEGMENT|OUTRO|CONCLUSION)/i) || line.match(/^\*\*/)) {
              return <p key={i} className="text-surface-900 font-bold mt-3 mb-1 text-sm">{line.replace(/\*\*/g, '')}</p>;
            }
            if (!line.trim()) return <div key={i} className="h-2" />;
            return <p key={i} className="text-surface-700 mb-1 leading-relaxed">{line}</p>;
          })
        )}
      </div>
    </div>
  );
}
