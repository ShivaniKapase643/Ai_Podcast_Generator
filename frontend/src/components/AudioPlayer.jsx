import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, AlertCircle } from 'lucide-react';
import { getAudioUrl, saveProgress } from '../api/client';

export default function AudioPlayer({ episode, compact = false, user }) {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [audioError, setAudioError] = useState(false);
  const [audioLoaded, setAudioLoaded] = useState(false);

  useEffect(() => {
    if (audioRef.current) audioRef.current.playbackRate = playbackRate;
  }, [playbackRate]);

  useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setAudioError(false);
    setAudioLoaded(false);
  }, [episode?.id]);

  const togglePlay = () => {
    if (!audioRef.current || audioError) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(() => setAudioError(true));
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) setCurrentTime(audioRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) { setDuration(audioRef.current.duration); setAudioLoaded(true); }
  };

  const handleError = () => { setAudioError(true); setAudioLoaded(false); };

  // Auto-save listening progress every 10 seconds
  useEffect(() => {
    if (!user || !episode || !isPlaying) return;
    const interval = setInterval(() => {
      if (audioRef.current && currentTime > 0) {
        const completed = duration > 0 && currentTime >= duration - 5;
        saveProgress(episode.id, Math.floor(currentTime), completed).catch(() => {});
      }
    }, 10000);
    return () => clearInterval(interval);
  }, [user, episode?.id, isPlaying, currentTime, duration]);

  const handleSeek = (e) => {
    const t = parseFloat(e.target.value);
    if (audioRef.current) { audioRef.current.currentTime = t; setCurrentTime(t); }
  };

  const handleVolumeChange = (e) => {
    const v = parseFloat(e.target.value);
    setVolume(v);
    if (audioRef.current) audioRef.current.volume = v;
    setIsMuted(v === 0);
  };

  const toggleMute = () => {
    if (audioRef.current) { audioRef.current.muted = !isMuted; setIsMuted(!isMuted); }
  };

  const skip = (s) => { if (audioRef.current) audioRef.current.currentTime += s; };

  const formatTime = (s) => {
    if (!s || isNaN(s)) return '0:00';
    return `${Math.floor(s / 60)}:${Math.floor(s % 60).toString().padStart(2, '0')}`;
  };

  const speeds = [0.75, 1, 1.25, 1.5];
  const displayDuration = duration || episode?.duration || 0;
  const pct = displayDuration ? (currentTime / displayDuration) * 100 : 0;

  if (!episode) {
    return (
      <div className="bg-white rounded-2xl p-6 border border-surface-300 shadow-sm">
        <p className="text-surface-500 text-center text-sm">Select an episode to play</p>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-2xl border border-surface-300 shadow-sm ${compact ? 'p-4' : 'p-6'}`}>
      <audio
        ref={audioRef}
        src={episode.status === 'completed' ? getAudioUrl(episode.id) : undefined}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
        onError={handleError}
        preload="metadata"
      />

      {!compact && (
        <div className="mb-4">
          <h3 className="text-sm font-bold text-surface-900 truncate">{episode.title}</h3>
          <p className="text-xs text-surface-500 mt-1">Episode #{episode.episode_number} • {episode.date}</p>
        </div>
      )}

      {/* Notice */}
      {(audioError || episode.status !== 'completed') && (
        <div className="flex items-center gap-2 p-3 mb-4 rounded-xl bg-amber-50 border border-amber-200">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
          <p className="text-xs text-amber-700 font-medium">
            {episode.status === 'draft' ? 'Dry run — no audio generated. Use "Generate Now" for full audio.' :
             episode.status === 'failed' ? 'Generation failed — audio unavailable.' :
             episode.status === 'generating' ? 'Audio is still being generated...' :
             'Audio file unavailable. Check ElevenLabs API key & Voice ID in backend .env.'}
          </p>
        </div>
      )}

      {/* Progress */}
      <div className="mb-4">
        <input
          type="range"
          min="0"
          max={displayDuration || 100}
          value={currentTime}
          onChange={handleSeek}
          disabled={!audioLoaded}
          className="audio-progress w-full h-1.5 rounded-full appearance-none cursor-pointer"
          style={{ background: `linear-gradient(to right, #0d9488 ${pct}%, #e2e8f0 ${pct}%)` }}
        />
        <div className="flex justify-between mt-2">
          <span className="text-xs font-semibold text-surface-600">{formatTime(currentTime)}</span>
          <span className="text-xs font-semibold text-surface-600">{formatTime(displayDuration)}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 md:gap-3">
          <button onClick={() => skip(-15)} className="text-surface-500 hover:text-surface-800 transition-colors p-1">
            <SkipBack className="w-4 h-4" />
          </button>
          <button
            onClick={togglePlay}
            disabled={audioError || episode.status !== 'completed'}
            className="w-10 h-10 md:w-11 md:h-11 rounded-full bg-brand text-white flex items-center justify-center hover:bg-brand-dark shadow-md transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
          </button>
          <button onClick={() => skip(15)} className="text-surface-500 hover:text-surface-800 transition-colors p-1">
            <SkipForward className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          <div className="flex gap-0.5 bg-surface-100 rounded-lg p-0.5 border border-surface-200">
            {speeds.map(speed => (
              <button
                key={speed}
                onClick={() => setPlaybackRate(speed)}
                className={`px-1.5 md:px-2 py-1 rounded-md text-xs font-bold transition-all ${
                  playbackRate === speed ? 'bg-brand text-white' : 'text-surface-600 hover:text-surface-900'
                }`}
              >
                {speed}x
              </button>
            ))}
          </div>

          {!compact && (
            <div className="hidden sm:flex items-center gap-2">
              <button onClick={toggleMute} className="text-surface-500 hover:text-surface-800">
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
              <input
                type="range" min="0" max="1" step="0.1"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-16 h-1 bg-surface-200 rounded-full appearance-none cursor-pointer"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
