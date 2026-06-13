import React, { useState } from 'react';
import { Users, Plus, Trash2, Mail, CheckCircle } from 'lucide-react';
import { useSubscribers } from '../hooks/useSubscribers';

export default function SubscribeForm() {
  const { subscribers, loading, error, addSubscriber, removeSubscriber } = useSubscribers();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [submitMessage, setSubmitMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;
    const success = await addSubscriber(email, name);
    if (success) { setEmail(''); setName(''); setSubmitMessage('Subscribed successfully!'); setTimeout(() => setSubmitMessage(''), 3000); }
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 rounded-lg bg-pink-50 border border-pink-200 flex items-center justify-center">
          <Users className="w-5 h-5 text-pink-600" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-surface-900">Subscribers</h2>
          <p className="text-xs text-surface-600">{subscribers.filter(s => s.active).length} active subscribers</p>
        </div>
      </div>

      {/* Add Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-surface-300 p-5 mb-6 shadow-sm">
        <h3 className="text-sm font-bold text-surface-900 mb-4">Add New Subscriber</h3>
        <div className="flex flex-col sm:flex-row gap-3">
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
            placeholder="email@example.com" required
            className="flex-1 px-4 py-2.5 bg-surface-50 border border-surface-300 rounded-xl text-sm text-surface-900 placeholder-surface-400 focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/10" />
          <input type="text" value={name} onChange={(e) => setName(e.target.value)}
            placeholder="Name (optional)"
            className="sm:w-40 px-4 py-2.5 bg-surface-50 border border-surface-300 rounded-xl text-sm text-surface-900 placeholder-surface-400 focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/10" />
          <button type="submit"
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-brand text-white rounded-xl text-sm font-bold hover:bg-brand-dark shadow-sm transition-all">
            <Plus className="w-4 h-4" /> Add
          </button>
        </div>
        {submitMessage && (
          <div className="flex items-center gap-2 mt-3 text-emerald-700">
            <CheckCircle className="w-4 h-4" /><p className="text-xs font-semibold">{submitMessage}</p>
          </div>
        )}
        {error && <p className="mt-3 text-xs text-red-600 font-semibold">{error}</p>}
      </form>

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-10">
          <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
        </div>
      ) : subscribers.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-surface-300">
          <Mail className="w-12 h-12 mx-auto mb-3 text-surface-300" />
          <p className="text-surface-700 font-semibold">No subscribers yet</p>
          <p className="text-sm text-surface-500 mt-1">Add subscribers to receive daily episodes via email</p>
        </div>
      ) : (
        <div className="space-y-2">
          {subscribers.map(sub => (
            <div key={sub.id}
              className="flex items-center justify-between p-4 rounded-xl bg-white border border-surface-300 hover:border-surface-400 transition-all group">
              <div className="flex items-center gap-3">
                <div className={`w-2.5 h-2.5 rounded-full ${sub.active ? 'bg-emerald-500' : 'bg-surface-300'}`} />
                <div>
                  <p className="text-sm font-bold text-surface-900">{sub.email}</p>
                  {sub.name && <p className="text-xs text-surface-500">{sub.name}</p>}
                </div>
              </div>
              <button onClick={() => removeSubscriber(sub.email)}
                className="text-surface-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition-all opacity-0 group-hover:opacity-100">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
