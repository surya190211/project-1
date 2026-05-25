import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext.jsx';

const Settings = ({ 
  users, 
  currentUser, 
  onSwitchUser, 
  onCreateUser, 
  onSaveProfile 
}) => {
  const { darkMode, toggleTheme } = useTheme();

  // Profile Edit State
  const [username, setUsername] = useState(currentUser?.username || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [notif, setNotif] = useState(currentUser?.notif ?? true);

  // New User Creation State
  const [newUsername, setNewUsername] = useState('');
  const [newEmail, setNewEmail] = useState('');

  // Status updates
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ text: '', type: '' });

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!username || !email) return;
    setLoading(true);
    setMsg({ text: '', type: '' });
    try {
      await onSaveProfile({ username, email, notif });
      setMsg({ text: '✓ Profile details saved successfully!', type: 'success' });
    } catch (err) {
      setMsg({ text: `✗ Error: ${err.message}`, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!newUsername || !newEmail) return;
    setLoading(true);
    setMsg({ text: '', type: '' });
    try {
      await onCreateUser(newUsername, newEmail);
      setMsg({ text: `✓ User "${newUsername}" created successfully!`, type: 'success' });
      setNewUsername('');
      setNewEmail('');
    } catch (err) {
      setMsg({ text: `✗ Error: ${err.message}`, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const selectUser = (userId) => {
    onSwitchUser(userId);
    setMsg({ text: '', type: '' });
    const targetUser = users.find(u => u._id === userId);
    if (targetUser) {
      setUsername(targetUser.username);
      setEmail(targetUser.email);
      setNotif(targetUser.notif);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto animate-fadeIn">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Application Settings</h2>
        <p className="text-xs text-slate-400 mt-0.5 font-medium">Manage user profiles, theme styles, and notification alerts</p>
      </div>

      {/* Message Alerts */}
      {msg.text && (
        <div className={`p-4 rounded-xl border text-xs font-semibold ${msg.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400'}`}>
          {msg.text}
        </div>
      )}

      {/* 1. Theme Configuration */}
      <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wide">Theme Preference</h3>
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Dark / Night Mode</h4>
            <p className="text-xs text-slate-400">Toggle dark styling across the visualizer dashboard</p>
          </div>
          <button onClick={toggleTheme}
            className={`w-14 h-7 rounded-full transition-all duration-300 relative ${darkMode ? 'bg-indigo-500' : 'bg-slate-200'}`}>
            <div className={`w-5 h-5 rounded-full bg-white absolute top-1 transition-all duration-300 shadow ${darkMode ? 'right-1' : 'left-1'}`} />
          </button>
        </div>
      </div>

      {/* 2. Switch Active Profile */}
      <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wide">Active Profiles</h3>
        <div className="flex flex-wrap gap-2.5">
          {users.map(u => (
            <button key={u._id} onClick={() => selectUser(u._id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${currentUser?._id === u._id ? 'bg-indigo-500 border-indigo-500 text-white shadow-md' : 'border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-850'}`}>
              <div className="flex items-center gap-1.5">
                <span>👤</span>
                {u.username}
                {u.leetcodeUsername && <span title="LeetCode Sync Active">🟧</span>}
                {u.codechefUsername && <span title="CodeChef Sync Active">🟣</span>}
              </div>
            </button>
          ))}
        </div>
        <p className="text-[11px] text-slate-400">Streak, custom tasks, and platform credentials are stored independently per profile.</p>
      </div>

      {/* 3. Edit Current Profile */}
      <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wide">Profile Details</h3>
        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Username</label>
              <input type="text" required value={username} onChange={(e) => setUsername(e.target.value)}
                placeholder="Username" disabled={loading}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-50" />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Email</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="Email Address" disabled={loading}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-50" />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div>
              <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-200">Daily email reminders</h4>
              <p className="text-[11px] text-slate-400">Receive motivational updates and recommendations at 8:00 AM daily</p>
            </div>
            <button type="button" onClick={() => setNotif(!notif)}
              className={`w-12 h-6 rounded-full transition-all duration-300 relative ${notif ? 'bg-indigo-500' : 'bg-slate-200'}`}>
              <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all duration-300 shadow ${notif ? 'right-1' : 'left-1'}`} />
            </button>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800/60 flex justify-end">
            <button type="submit" disabled={loading}
              className="px-5 py-2 text-xs font-bold bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg shadow transition-colors disabled:opacity-50">
              {loading ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </form>
      </div>

      {/* 4. Create New Profile */}
      <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wide">Create New User Profile</h3>
        <form onSubmit={handleCreateUser} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">New Username *</label>
              <input type="text" required value={newUsername} onChange={(e) => setNewUsername(e.target.value)}
                placeholder="e.g. bob_coder" disabled={loading}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-50" />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">New Email Address *</label>
              <input type="email" required value={newEmail} onChange={(e) => setNewEmail(e.target.value)}
                placeholder="e.g. bob@example.com" disabled={loading}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-50" />
            </div>
          </div>

          <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-slate-800/60">
            <button type="submit" disabled={loading}
              className="px-5 py-2 text-xs font-bold bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg shadow transition-colors disabled:opacity-50">
              {loading ? 'Creating...' : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Settings;
