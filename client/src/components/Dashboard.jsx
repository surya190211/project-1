import React from 'react';

const Dashboard = ({ user, questions, progress, onNavigate }) => {
  // Compute Stats
  const total = questions.length;
  
  // Create progress map
  const pMap = {};
  progress.forEach(p => {
    pMap[p.questionId] = p;
  });

  let solved = 0;
  let inProgress = 0;
  let solvedThisWeek = 0;
  const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

  const difficultyStats = {
    Easy: { total: 0, solved: 0 },
    Medium: { total: 0, solved: 0 },
    Hard: { total: 0, solved: 0 }
  };

  const topicStats = {};

  questions.forEach(q => {
    const p = pMap[q._id] || { status: 'Todo' };
    
    // Topic aggregation
    if (!topicStats[q.topic]) {
      topicStats[q.topic] = { total: 0, solved: 0, inProgress: 0 };
    }
    topicStats[q.topic].total += 1;

    // Difficulty aggregation
    if (difficultyStats[q.difficulty]) {
      difficultyStats[q.difficulty].total += 1;
    }

    if (p.status === 'Solved') {
      solved += 1;
      topicStats[q.topic].solved += 1;
      if (difficultyStats[q.difficulty]) {
        difficultyStats[q.difficulty].solved += 1;
      }
      if (p.dateCompleted && new Date(p.dateCompleted).getTime() > oneWeekAgo) {
        solvedThisWeek += 1;
      }
    } else if (p.status === 'In Progress') {
      inProgress += 1;
      topicStats[q.topic].inProgress += 1;
    }
  });

  const topicList = Object.entries(topicStats).sort((a, b) => b[1].solved - a[1].solved);

  // Emojis for topics
  const TOPIC_EMOJIS = {
    'Arrays': '⬛', 'Strings': '🔤', 'Linked Lists': '🔗', 'Stacks & Queues': '📚',
    'Trees': '🌳', 'Graphs': '🕸️', 'Dynamic Programming': '🧩', 'Recursion & Backtracking': '🔄',
    'Binary Search': '🔍', 'Sorting & Searching': '↕️', 'Heap / Priority Queue': '⛰️',
    'Hash Maps': '#️⃣', 'Two Pointers': '👉', 'Sliding Window': '🪟', 'Greedy': '💰',
    'Bit Manipulation': '💾', 'Math & Geometry': '📐', 'Tries': '🌐'
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Welcome & Streak */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white shadow-lg">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Welcome Back, {user?.username}!</h1>
          <p className="text-indigo-100 mt-1 text-sm font-medium">
            Keep pushing forward. Consistency is what transforms code into craft.
          </p>
        </div>
        <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md px-6 py-3 rounded-xl border border-white/10 self-start md:self-auto">
          <div className="text-3xl">🔥</div>
          <div>
            <div className="text-2xl font-bold font-mono">{user?.streak?.cur || 0} Days</div>
            <div className="text-xs text-indigo-100 font-semibold uppercase tracking-wider">
              Current Streak (Best: {user?.streak?.best || 0})
            </div>
          </div>
        </div>
      </div>

      {/* Numerical Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Solved', value: solved, sub: `of ${total} questions`, color: 'text-indigo-600 dark:text-indigo-400', icon: '🏆' },
          { label: 'In Progress', value: inProgress, sub: 'currently active', color: 'text-blue-500 dark:text-blue-400', icon: '⚡' },
          { label: 'This Week', value: solvedThisWeek, sub: 'last 7 days', color: 'text-emerald-500 dark:text-emerald-400', icon: '📅' },
          { label: 'Daily Notifications', value: user?.notif ? 'Enabled' : 'Disabled', sub: user?.notif ? 'Morning reminders active' : 'Alerts are muted', color: user?.notif ? 'text-purple-500' : 'text-slate-400', icon: '🔔' }
        ].map((stat, i) => (
          <div key={i} className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between hover:scale-[1.02] transition-transform duration-200">
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{stat.label}</span>
              <div className={`text-3xl font-black mt-2 ${stat.color}`}>{stat.value}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">{stat.sub}</div>
            </div>
            <div className="text-3xl p-3 bg-slate-100 dark:bg-slate-800 rounded-xl">{stat.icon}</div>
          </div>
        ))}
      </div>

      {/* Difficulty Rings & Platforms */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Difficulty Breakdown (Rings) */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm lg:col-span-1">
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Difficulty Breakdown</h3>
          <p className="text-xs text-slate-400 mt-0.5">Performance index per complexity level</p>

          <div className="flex flex-col items-center justify-around gap-6 mt-8">
            {['Easy', 'Medium', 'Hard'].map(d => {
              const ds = difficultyStats[d];
              const pct = ds.total ? Math.round((ds.solved / ds.total) * 100) : 0;
              
              // SVG Circle properties
              const r = 32;
              const circ = 2 * Math.PI * r;
              const offset = circ - (pct / 100) * circ;

              const strokeColor = d === 'Easy' ? '#10b981' : d === 'Medium' ? '#f59e0b' : '#ef4444';
              const textColor = d === 'Easy' ? 'text-emerald-500' : d === 'Medium' ? 'text-amber-500' : 'text-rose-500';

              return (
                <div key={d} className="flex items-center gap-6 w-full max-w-[200px]">
                  <div className="relative flex items-center justify-center">
                    <svg className="w-20 h-20 transform -rotate-90">
                      {/* Background circle */}
                      <circle cx="40" cy="40" r={r} fill="none" stroke="currentColor" className="text-slate-100 dark:text-slate-800" strokeWidth="6" />
                      {/* Active progress circle */}
                      <circle cx="40" cy="40" r={r} fill="none" stroke={strokeColor} strokeWidth="6"
                        strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" className="transition-all duration-700 ease-out" />
                    </svg>
                    <span className="absolute text-sm font-bold text-slate-800 dark:text-slate-200 font-mono">{pct}%</span>
                  </div>
                  <div>
                    <h4 className={`text-md font-bold ${textColor}`}>{d}</h4>
                    <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400">
                      {ds.solved} / {ds.total}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Connected Platforms */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Coding Platforms</h3>
              <p className="text-xs text-slate-400 mt-0.5 font-medium">Automatic sync credentials</p>
            </div>
            <button onClick={() => onNavigate('sync')}
              className="text-xs px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-semibold hover:bg-indigo-100 dark:hover:bg-indigo-950/80 transition-colors">
              Manage Sync
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            {/* LeetCode Sync Panel */}
            {user?.leetcodeUsername ? (
              <div className="p-5 rounded-xl border border-orange-500/20 dark:border-orange-500/10 bg-orange-500/5 flex flex-col justify-between h-[160px]">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🟧</span>
                    <div>
                      <h4 className="font-bold text-orange-600 dark:text-orange-400 text-sm">LeetCode</h4>
                      <p className="text-xs font-mono text-slate-500 dark:text-slate-400">@{user.leetcodeUsername}</p>
                    </div>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 font-bold uppercase rounded bg-orange-500/10 text-orange-600 dark:text-orange-400">Active</span>
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  Submissions are matched against tracker database using LeetCode slugs.
                </div>
                <div className="flex items-center justify-between text-xs border-t border-orange-500/10 pt-3">
                  <span className="text-slate-400">Streak / Stats:</span>
                  <span className="font-bold text-slate-700 dark:text-slate-300">Auto-sync active</span>
                </div>
              </div>
            ) : (
              <div className="p-5 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col justify-between h-[160px]">
                <div className="flex items-center gap-3">
                  <span className="text-2xl opacity-40">🟧</span>
                  <div>
                    <h4 className="font-bold text-slate-400 text-sm">LeetCode</h4>
                    <p className="text-xs text-slate-400">Not connected</p>
                  </div>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Connect LeetCode profile to automatically import accepted submissions.
                </p>
                <button onClick={() => onNavigate('sync')}
                  className="w-full text-center py-2 text-xs font-bold rounded-lg border border-orange-500/30 text-orange-600 dark:text-orange-400 hover:bg-orange-500/5 transition-colors mt-2">
                  Connect Account
                </button>
              </div>
            )}

            {/* CodeChef Sync Panel */}
            {user?.codechefUsername ? (
              <div className="p-5 rounded-xl border border-purple-500/20 dark:border-purple-500/10 bg-purple-500/5 flex flex-col justify-between h-[160px]">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🟣</span>
                    <div>
                      <h4 className="font-bold text-purple-600 dark:text-purple-400 text-sm">CodeChef</h4>
                      <p className="text-xs font-mono text-slate-500 dark:text-slate-400">@{user.codechefUsername}</p>
                    </div>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 font-bold uppercase rounded bg-purple-500/10 text-purple-600 dark:text-purple-400">Active</span>
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  Problems are matched via competitive proxy APIs or manual input sync.
                </div>
                <div className="flex items-center justify-between text-xs border-t border-purple-500/10 pt-3">
                  <span className="text-slate-400">Proxy Integration:</span>
                  <span className="font-bold text-slate-700 dark:text-slate-300">Synced</span>
                </div>
              </div>
            ) : (
              <div className="p-5 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col justify-between h-[160px]">
                <div className="flex items-center gap-3">
                  <span className="text-2xl opacity-40">🟣</span>
                  <div>
                    <h4 className="font-bold text-slate-400 text-sm">CodeChef</h4>
                    <p className="text-xs text-slate-400">Not connected</p>
                  </div>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Connect CodeChef or paste your solved list to map matching tracker tasks.
                </p>
                <button onClick={() => onNavigate('sync')}
                  className="w-full text-center py-2 text-xs font-bold rounded-lg border border-purple-500/30 text-purple-600 dark:text-purple-400 hover:bg-purple-500/5 transition-colors mt-2">
                  Connect Account
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Topic Completion Progress Bars */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Topic Progress</h3>
            <p className="text-xs text-slate-400 mt-0.5">Syllabus breakdown by DSA features</p>
          </div>
          <span className="text-xs font-bold px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-400 font-mono">
            {topicList.length} Categories
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 mt-6">
          {topicList.map(([topic, stat]) => {
            const pct = stat.total ? Math.round((stat.solved / stat.total) * 100) : 0;
            return (
              <div key={topic} className="space-y-2 group">
                <div className="flex justify-between items-center text-sm font-semibold">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{TOPIC_EMOJIS[topic] || '📌'}</span>
                    <span className="text-slate-700 dark:text-slate-300 hover:text-indigo-500 transition-colors cursor-pointer"
                      onClick={() => onNavigate('problems')}>{topic}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    {stat.inProgress > 0 && (
                      <span className="text-xs font-bold text-blue-500 dark:text-blue-400 animate-pulse">
                        {stat.inProgress} active
                      </span>
                    )}
                    <span className="text-xs text-slate-400 font-mono font-medium">
                      {stat.solved} / {stat.total}
                    </span>
                    <span className={`text-xs font-bold font-mono ${pct === 100 ? 'text-emerald-500' : 'text-slate-500 dark:text-slate-400'}`}>
                      {pct}%
                    </span>
                  </div>
                </div>
                
                <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all duration-500 ease-out ${pct === 100 ? 'bg-emerald-500' : 'bg-indigo-500'}`}
                    style={{ width: `${pct}%` }}></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
