import React, { useState, useEffect } from 'react';
import { Clock, Power, Calendar, Sun, Moon, Info } from 'lucide-react';
import { getScheduleStatus, toggleSchedule } from '../api/client';

const TIME_PRESETS = [
  { label: '6:00 AM', cron: '0 6 * * *', description: 'Early morning — fresh news before your day starts' },
  { label: '7:00 AM', cron: '0 7 * * *', description: 'Morning routine — listen with your chai ☕' },
  { label: '8:00 AM', cron: '0 8 * * *', description: 'Start of work — catch up during commute' },
  { label: '9:00 AM', cron: '0 9 * * *', description: 'Mid-morning — perfect for a 10-min break' },
  { label: '12:00 PM', cron: '0 12 * * *', description: 'Lunch break — listen while you eat' },
  { label: '6:00 PM', cron: '0 18 * * *', description: 'Evening wrap-up — day\'s news summary' },
  { label: '9:00 PM', cron: '0 21 * * *', description: 'Night time — wind down with tech news' }
];

const DAY_OPTIONS = [
  { label: 'Every day', value: '* * *', description: 'Daily episodes, 7 days a week' },
  { label: 'Weekdays only', value: '* * 1-5', description: 'Mon to Fri — skip weekends' },
  { label: 'Weekends only', value: '* * 0,6', description: 'Sat & Sun only' },
  { label: 'Mon, Wed, Fri', value: '* * 1,3,5', description: '3 days a week' }
];

export default function ScheduleToggle() {
  const [enabled, setEnabled] = useState(false);
  const [schedule, setSchedule] = useState('');
  const [timezone, setTimezone] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedTime, setSelectedTime] = useState('0 7 * * *');
  const [selectedDays, setSelectedDays] = useState('* * *');

  useEffect(() => {
    (async () => {
      try {
        const { data } = await getScheduleStatus();
        setEnabled(data.enabled);
        setSchedule(data.schedule);
        setTimezone(data.timezone);
        // Parse current schedule
        if (data.schedule) {
          const parts = data.schedule.split(' ');
          const timePart = `${parts[0]} ${parts[1]} * * *`;
          const preset = TIME_PRESETS.find(p => p.cron === timePart);
          if (preset) setSelectedTime(preset.cron);
        }
      } catch {} finally { setLoading(false); }
    })();
  }, []);

  const handleToggle = async () => {
    try { await toggleSchedule(!enabled); setEnabled(!enabled); } catch {}
  };

  // Get next run time in IST
  const getNextRunIST = () => {
    if (!enabled) return '—';
    const parts = selectedTime.split(' ');
    const hour = parseInt(parts[1]);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    const now = new Date();
    const currentHourIST = now.getUTCHours() + 5.5; // IST offset
    if (currentHourIST < hour) {
      return `Today at ${displayHour}:00 ${ampm} IST`;
    }
    return `Tomorrow at ${displayHour}:00 ${ampm} IST`;
  };

  if (loading) return <div className="flex justify-center py-16"><div className="w-10 h-10 border-3 border-brand border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center">
          <Clock className="w-5 h-5 text-amber-600" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-surface-900">Schedule Settings</h2>
          <p className="text-xs text-surface-600">Configure when your podcast generates automatically</p>
        </div>
      </div>

      {/* Master Toggle */}
      <div className="bg-white rounded-2xl border border-surface-300 p-6 shadow-sm mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-surface-900">Auto-Generate Episodes</h3>
            <p className="text-sm text-surface-600 mt-1">When enabled, a new podcast episode will be generated automatically at your chosen time</p>
          </div>
          <button onClick={handleToggle}
            className={`relative w-14 h-7 rounded-full transition-all duration-300 ${enabled ? 'bg-brand' : 'bg-surface-300'}`}>
            <span className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow-md transition-all duration-300 ${enabled ? 'left-8' : 'left-1'}`} />
          </button>
        </div>

        {/* Status Badge */}
        <div className="mt-4 flex items-center gap-3">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold ${
            enabled ? 'bg-emerald-50 border border-emerald-200 text-emerald-700' : 'bg-surface-100 border border-surface-200 text-surface-500'
          }`}>
            <Power className="w-3.5 h-3.5" />
            {enabled ? 'Auto-generation is ON' : 'Auto-generation is OFF'}
          </div>
          {enabled && (
            <span className="text-sm text-surface-600">
              ⏰ Next: <strong>{getNextRunIST()}</strong>
            </span>
          )}
        </div>
      </div>

      {/* Time Selection */}
      <div className="bg-white rounded-2xl border border-surface-300 p-6 shadow-sm mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Sun className="w-4 h-4 text-amber-500" />
          <h3 className="text-sm font-bold text-surface-900">What time should your podcast generate?</h3>
          <span className="text-xs text-surface-400 ml-auto">🇮🇳 Indian Standard Time (IST)</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {TIME_PRESETS.map(preset => (
            <button key={preset.cron} onClick={() => setSelectedTime(preset.cron)}
              className={`text-left p-3 rounded-xl border transition-all ${
                selectedTime === preset.cron
                  ? 'bg-brand-50 border-brand text-brand-dark shadow-sm'
                  : 'bg-surface-50 border-surface-200 text-surface-700 hover:border-surface-400'
              }`}>
              <p className="text-sm font-bold">{preset.label}</p>
              <p className="text-xs text-surface-500 mt-0.5">{preset.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Days Selection */}
      <div className="bg-white rounded-2xl border border-surface-300 p-6 shadow-sm mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-4 h-4 text-blue-500" />
          <h3 className="text-sm font-bold text-surface-900">Which days should it run?</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {DAY_OPTIONS.map(option => (
            <button key={option.value} onClick={() => setSelectedDays(option.value)}
              className={`text-left p-3 rounded-xl border transition-all ${
                selectedDays === option.value
                  ? 'bg-brand-50 border-brand text-brand-dark shadow-sm'
                  : 'bg-surface-50 border-surface-200 text-surface-700 hover:border-surface-400'
              }`}>
              <p className="text-sm font-bold">{option.label}</p>
              <p className="text-xs text-surface-500 mt-0.5">{option.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Info Panel */}
      <div className="bg-blue-50 rounded-2xl border border-blue-200 p-5">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-bold text-blue-900 mb-2">How it works</h4>
            <ul className="text-sm text-blue-800 space-y-1.5">
              <li>• At your chosen time, the system scrapes 8+ AI news sources</li>
              <li>• GPT-4o picks the top 5-7 most important stories</li>
              <li>• A professional podcast script is generated automatically</li>
              <li>• The script is converted to audio using AI voice</li>
              <li>• You get notified and can listen from the dashboard</li>
              <li>• All times are in <strong>Indian Standard Time (IST, UTC+5:30)</strong></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
