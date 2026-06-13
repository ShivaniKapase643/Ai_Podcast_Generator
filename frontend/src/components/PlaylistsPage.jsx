import React, { useState, useEffect } from 'react';
import { Wand2, Play, Plus, Trash2, ListMusic } from 'lucide-react';
import { getEpisodes } from '../api/client';
import TopicTags from './TopicTags';

// Playlists stored in localStorage (no backend needed)
function getPlaylists() {
  try { return JSON.parse(localStorage.getItem('playlists') || '[]'); } catch { return []; }
}
function savePlaylists(p) { localStorage.setItem('playlists', JSON.stringify(p)); }

export default function PlaylistsPage({ user, onSelect }) {
  const [playlists, setPlaylists] = useState(getPlaylists());
  const [episodes, setEpisodes] = useState([]);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);

  useEffect(() => {
    getEpisodes(1, 50).then(res => setEpisodes(res.data.episodes || [])).catch(() => {});
  }, []);

  const createPlaylist = () => {
    if (!newName.trim()) return;
    const p = [...playlists, { id: Date.now().toString(), name: newName, episodeIds: [], createdAt: new Date().toISOString() }];
    setPlaylists(p);
    savePlaylists(p);
    setNewName('');
    setCreating(false);
  };

  const deletePlaylist = (id) => {
    const p = playlists.filter(pl => pl.id !== id);
    setPlaylists(p);
    savePlaylists(p);
    if (selectedPlaylist?.id === id) setSelectedPlaylist(null);
  };

  const addToPlaylist = (playlistId, episodeId) => {
    const p = playlists.map(pl => {
      if (pl.id === playlistId && !pl.episodeIds.includes(episodeId)) {
        return { ...pl, episodeIds: [...pl.episodeIds, episodeId] };
      }
      return pl;
    });
    setPlaylists(p);
    savePlaylists(p);
  };

  const removeFromPlaylist = (playlistId, episodeId) => {
    const p = playlists.map(pl => {
      if (pl.id === playlistId) {
        return { ...pl, episodeIds: pl.episodeIds.filter(id => id !== episodeId) };
      }
      return pl;
    });
    setPlaylists(p);
    savePlaylists(p);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-violet-50 border border-violet-200 flex items-center justify-center">
            <Wand2 className="w-5 h-5 text-violet-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-surface-900">Playlists</h2>
            <p className="text-xs text-surface-600">{playlists.length} playlists created</p>
          </div>
        </div>
        <button onClick={() => setCreating(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand text-white text-sm font-bold hover:bg-brand-dark transition-all shadow-sm">
          <Plus className="w-4 h-4" /> New Playlist
        </button>
      </div>

      {/* Create Playlist */}
      {creating && (
        <div className="bg-white rounded-2xl border border-surface-300 p-4 mb-4 shadow-sm">
          <div className="flex gap-3">
            <input type="text" value={newName} onChange={e => setNewName(e.target.value)}
              placeholder="Playlist name..." autoFocus
              className="flex-1 px-4 py-2.5 bg-surface-50 border border-surface-300 rounded-xl text-sm text-surface-900 focus:outline-none focus:border-brand" />
            <button onClick={createPlaylist} className="px-4 py-2 bg-brand text-white rounded-xl text-sm font-bold">Create</button>
            <button onClick={() => setCreating(false)} className="px-4 py-2 bg-surface-100 text-surface-600 rounded-xl text-sm font-semibold">Cancel</button>
          </div>
        </div>
      )}

      {/* Playlist List */}
      {playlists.length === 0 && !creating ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-surface-300">
          <ListMusic className="w-14 h-14 mx-auto mb-4 text-surface-300" />
          <p className="text-surface-700 font-semibold">No playlists yet</p>
          <p className="text-sm text-surface-500 mt-1">Create a playlist to organize your favorite episodes</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {playlists.map(pl => (
            <div key={pl.id} className="bg-white rounded-2xl border border-surface-300 p-5 hover:border-brand/30 hover:shadow-sm transition-all">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-bold text-surface-900">{pl.name}</h4>
                <button onClick={() => deletePlaylist(pl.id)} className="text-surface-400 hover:text-red-500 transition-all">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-xs text-surface-500 mb-3">{pl.episodeIds.length} episodes</p>
              <div className="space-y-2">
                {pl.episodeIds.slice(0, 3).map(epId => {
                  const ep = episodes.find(e => e.id === epId);
                  if (!ep) return null;
                  return (
                    <div key={epId} className="flex items-center gap-2 p-2 rounded-lg bg-surface-50 cursor-pointer hover:bg-surface-100" onClick={() => onSelect(ep)}>
                      <Play className="w-3 h-3 text-brand shrink-0" />
                      <span className="text-xs text-surface-700 truncate">{ep.title}</span>
                    </div>
                  );
                })}
                {pl.episodeIds.length > 3 && <p className="text-xs text-surface-400">+{pl.episodeIds.length - 3} more</p>}
              </div>

              {/* Add episode dropdown */}
              <div className="mt-3 pt-3 border-t border-surface-200">
                <select onChange={(e) => { if (e.target.value) addToPlaylist(pl.id, e.target.value); e.target.value = ''; }}
                  className="w-full text-xs px-3 py-2 rounded-lg bg-surface-50 border border-surface-200 text-surface-600">
                  <option value="">+ Add episode...</option>
                  {episodes.filter(e => !pl.episodeIds.includes(e.id)).slice(0, 15).map(e => (
                    <option key={e.id} value={e.id}>{e.title}</option>
                  ))}
                </select>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
