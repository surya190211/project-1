import React, { useState } from 'react';

const PlatformSync = ({ 
  user, 
  onSyncLeetCode, 
  onSyncCodeChef, 
  onSyncCodeChefManual, 
  onDisconnectPlatform 
}) => {
  const [activeTab, setActiveTab] = useState('leetcode');
  const [lcUsername, setLcUsername] = useState(user?.leetcodeUsername || '');
  const [ccUsername, setCcUsername] = useState(user?.codechefUsername || '');
  const [ccManualText, setCcManualText] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLcSync = async (e) => {
    e.preventDefault();
    if (!lcUsername) return;
    setLoading(true);
    setErrorMsg('');
    setReport(null);
    try {
      const data = await onSyncLeetCode(lcUsername);
      setReport({
        platform: 'LeetCode',
        matched: data.matchedCount,
        username: data.profile.username,
        rank: data.profile.rank,
        stats: data.profile.stats
      });
    } catch (err) {
      setErrorMsg(err.message || 'Failed to sync LeetCode profile');
    } finally {
      setLoading(false);
    }
  };

  const handleCcSync = async (e) => {
    e.preventDefault();
    if (!ccUsername) return;
    setLoading(true);
    setErrorMsg('');
    setReport(null);
    try {
      const data = await onSyncCodeChef(ccUsername);
      setReport({
        platform: 'CodeChef',
        matched: data.matchedCount,
        username: data.profile.username,
        rating: data.profile.rating,
        stars: data.profile.starsStr,
        total: data.profile.total
      });
    } catch (err) {
      setErrorMsg(err.message || 'Failed to sync CodeChef profile');
    } finally {
      setLoading(false);
    }
  };

  const handleCcManualImport = async (e) => {
    e.preventDefault();
    if (!ccManualText) return;
    setLoading(true);
    setErrorMsg('');
    setReport(null);
    try {
      const data = await onSyncCodeChefManual(ccUsername || 'codechef_user', ccManualText);
      setReport({
        platform: 'CodeChef (Manual)',
        matched: data.matchedCount,
        username: data.profile.username,
        total: data.profile.total,
        manual: true
      });
      setCcManualText('');
    } catch (err) {
      setErrorMsg(err.message || 'Failed to import manual problems');
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async (platform) => {
    if (!window.confirm(`Disconnect from ${platform}? Synced progress remains.`)) return;
    setLoading(true);
    try {
      await onDisconnectPlatform(platform);
      setReport(null);
      if (platform === 'leetcode') setLcUsername('');
      if (platform === 'codechef') setCcUsername('');
    } catch (err) {
      setErrorMsg(err.message || `Failed to disconnect ${platform}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fadeIn">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Coding Platform Synchronization</h2>
        <p className="text-xs text-slate-400 mt-0.5 font-medium">Sync your online profiles to auto-resolve questions</p>
      </div>

      {/* Tabs bar */}
      <div className="flex border-b border-slate-200 dark:border-slate-800">
        <button onClick={() => { setActiveTab('leetcode'); setErrorMsg(''); setReport(null); }}
          className={`px-5 py-3 text-xs font-bold transition-all relative ${activeTab === 'leetcode' ? 'text-orange-500' : 'text-slate-500 dark:text-slate-400'}`}>
          <div className="flex items-center gap-2">
            <span>🟧</span> LeetCode Sync
            {user?.leetcodeUsername && <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />}
          </div>
          {activeTab === 'leetcode' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-orange-500" />}
        </button>
        <button onClick={() => { setActiveTab('codechef'); setErrorMsg(''); setReport(null); }}
          className={`px-5 py-3 text-xs font-bold transition-all relative ${activeTab === 'codechef' ? 'text-purple-500' : 'text-slate-500 dark:text-slate-400'}`}>
          <div className="flex items-center gap-2">
            <span>🟣</span> CodeChef Sync
            {user?.codechefUsername && <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />}
          </div>
          {activeTab === 'codechef' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-purple-500" />}
        </button>
      </div>

      {/* Error Alerts */}
      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center gap-2">
          <span>⚠️</span> {errorMsg}
        </div>
      )}

      {/* Sync Reports */}
      {report && (
        <div className={`p-5 rounded-2xl border text-xs font-medium space-y-3 ${activeTab === 'leetcode' ? 'bg-orange-500/5 border-orange-500/20' : 'bg-purple-500/5 border-purple-500/20'}`}>
          <h4 className="font-bold flex items-center gap-2">
            <span>✓</span> Sync Successful!
          </h4>
          <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
            Connected successfully as <strong className="text-slate-700 dark:text-slate-300">@{report.username}</strong> on {report.platform}. 
            We matched <strong className="text-indigo-500">{report.matched}</strong> submissions to questions in the tracker database, auto-marking them as solved!
          </p>
          {report.stats && (
            <div className="flex gap-4 font-mono font-bold mt-2 pt-2.5 border-t border-slate-100 dark:border-slate-800/40">
              <span className="text-slate-400">Total Solved: {report.stats.total}</span>
              <span className="text-emerald-500">Easy: {report.stats.easy}</span>
              <span className="text-amber-500">Medium: {report.stats.med}</span>
              <span className="text-rose-500">Hard: {report.stats.hard}</span>
            </div>
          )}
          {report.rating !== undefined && (
            <div className="flex gap-4 font-mono font-bold mt-2 pt-2.5 border-t border-slate-100 dark:border-slate-800/40">
              <span className="text-slate-400">Rating: {report.rating}</span>
              <span className="text-purple-500">Stars: {report.stars}</span>
              <span className="text-slate-500">Total Solved: {report.total}</span>
            </div>
          )}
        </div>
      )}

      {/* Tab Panes */}
      <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
        {activeTab === 'leetcode' ? (
          /* LEETCODE SECTION */
          <div className="space-y-6">
            {user?.leetcodeUsername ? (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-orange-500/5 border border-orange-500/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center text-white text-lg font-bold">LC</div>
                    <div>
                      <h4 className="font-bold text-slate-800 dark:text-slate-200">Connected to LeetCode</h4>
                      <p className="text-xs text-slate-400">Username: @{user.leetcodeUsername}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={handleLcSync} disabled={loading}
                      className="px-3.5 py-1.5 text-xs font-bold bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50">
                      {loading ? 'Syncing...' : '↻ Re-sync Now'}
                    </button>
                    <button onClick={() => handleDisconnect('leetcode')} disabled={loading}
                      className="px-3.5 py-1.5 text-xs font-bold border border-rose-500/20 text-rose-600 dark:text-rose-400 rounded-lg hover:bg-rose-500/5 transition-colors disabled:opacity-50">
                      Disconnect
                    </button>
                  </div>
                </div>
                <div className="text-xs text-slate-500 leading-relaxed font-medium">
                  💡 <strong>Tip:</strong> Re-syncing queries LeetCode's public GraphQL endpoint for your profile statistics and your last 50 accepted submissions. It matches the problem titles to auto-update progress in the tracker.
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="max-w-md space-y-4">
                  <div>
                    <h3 className="text-base font-bold text-slate-850 dark:text-slate-100">Connect your LeetCode account</h3>
                    <p className="text-xs text-slate-400 mt-1">Enter your public username to fetch details (no passwords needed).</p>
                  </div>
                  
                  <form onSubmit={handleLcSync} className="flex gap-3">
                    <input type="text" required value={lcUsername} onChange={(e) => setLcUsername(e.target.value)}
                      placeholder="e.g. alice_code" disabled={loading}
                      className="flex-1 px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-orange-500 disabled:opacity-50" />
                    <button type="submit" disabled={loading}
                      className="px-5 py-2 text-xs font-bold bg-orange-500 hover:bg-orange-600 text-white rounded-lg shadow transition-colors disabled:opacity-50">
                      {loading ? 'Connecting...' : 'Connect'}
                    </button>
                  </form>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800/60">
                  <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">How LeetCode synchronization works:</h4>
                  <ul className="mt-2.5 space-y-2 text-xs text-slate-500 leading-relaxed list-decimal pl-4">
                    <li>We fetch your profile metadata (ranking, total solved counts) and your last 50 accepted submissions.</li>
                    <li>We isolate the URL slug for each submission (e.g., <code>two-sum</code>) and query our local database.</li>
                    <li>Matching questions are instantly updated to <strong>Solved</strong> status, carrying a 🟧 tag indicating LeetCode origin.</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* CODECHEF SECTION */
          <div className="space-y-6">
            {user?.codechefUsername ? (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-purple-500/5 border border-purple-500/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center text-white text-lg font-bold">CC</div>
                    <div>
                      <h4 className="font-bold text-slate-800 dark:text-slate-200">Connected to CodeChef</h4>
                      <p className="text-xs text-slate-400">Username: @{user.codechefUsername}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={handleCcSync} disabled={loading}
                      className="px-3.5 py-1.5 text-xs font-bold bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors disabled:opacity-50">
                      {loading ? 'Syncing...' : '↻ Re-sync Now'}
                    </button>
                    <button onClick={() => handleDisconnect('codechef')} disabled={loading}
                      className="px-3.5 py-1.5 text-xs font-bold border border-rose-500/20 text-rose-600 dark:text-rose-400 rounded-lg hover:bg-rose-500/5 transition-colors disabled:opacity-50">
                      Disconnect
                    </button>
                  </div>
                </div>
                
                {/* Fallback import form available even when synced */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                  <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">Manual Solved Import (Fallback)</h4>
                  <p className="text-[11px] text-slate-400 mt-1">If community API proxies are blocked by CORS, you can import problem titles manually.</p>
                  <form onSubmit={handleCcManualImport} className="space-y-3 mt-3">
                    <textarea value={ccManualText} onChange={(e) => setCcManualText(e.target.value)}
                      rows={4} placeholder="Two Sum&#10;Maximum Subarray&#10;3Sum&#10;...one title per line" disabled={loading}
                      className="w-full p-3 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-purple-500 disabled:opacity-50"></textarea>
                    <button type="submit" disabled={loading || !ccManualText.trim()}
                      className="px-4 py-2 text-xs font-bold bg-purple-500 hover:bg-purple-600 text-white rounded-lg shadow transition-colors disabled:opacity-50 self-end">
                      {loading ? 'Importing...' : 'Import Solved Problems'}
                    </button>
                  </form>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="max-w-md space-y-4">
                  <div>
                    <h3 className="text-base font-bold text-slate-850 dark:text-slate-100">Connect your CodeChef account</h3>
                    <p className="text-xs text-slate-400 mt-1">Enter your public username to query current profile statistics.</p>
                  </div>
                  
                  <form onSubmit={handleCcSync} className="flex gap-3">
                    <input type="text" required value={ccUsername} onChange={(e) => setCcUsername(e.target.value)}
                      placeholder="e.g. chef_john" disabled={loading}
                      className="flex-1 px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-purple-500 disabled:opacity-50" />
                    <button type="submit" disabled={loading}
                      className="px-5 py-2 text-xs font-bold bg-purple-500 hover:bg-purple-600 text-white rounded-lg shadow transition-colors disabled:opacity-50">
                      {loading ? 'Connecting...' : 'Connect'}
                    </button>
                  </form>
                </div>

                {/* Manual Solved fallback */}
                <div className="pt-5 border-t border-slate-100 dark:border-slate-800/60 max-w-md">
                  <h4 className="text-xs font-bold text-slate-750 dark:text-slate-350">Manual solved problems copy-paste import (CORS fallback):</h4>
                  <p className="text-[11px] text-slate-400 mt-1">Paste your solved titles straight from CodeChef → "Problems Solved" page.</p>
                  <form onSubmit={handleCcManualImport} className="space-y-3 mt-3">
                    <textarea required value={ccManualText} onChange={(e) => setCcManualText(e.target.value)}
                      rows={4} placeholder="Two Sum&#10;Maximum Subarray&#10;3Sum&#10;...one title per line" disabled={loading}
                      className="w-full p-3 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-purple-500 disabled:opacity-50"></textarea>
                    <button type="submit" disabled={loading || !ccManualText.trim()}
                      className="px-4 py-2 text-xs font-bold bg-purple-500 hover:bg-purple-600 text-white rounded-lg shadow transition-colors disabled:opacity-50">
                      {loading ? 'Importing...' : 'Import Solved Problems'}
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PlatformSync;
