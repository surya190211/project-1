import React, { useState, useEffect } from 'react';
import { ThemeProvider, useTheme } from './context/ThemeContext.jsx';
import api from './services/api.js';
import Dashboard from './components/Dashboard.jsx';
import TopicList from './components/TopicList.jsx';
import Sidebar from './components/Sidebar.jsx';
import PlatformSync from './components/PlatformSync.jsx';
import Settings from './components/Settings.jsx';

const AppContent = () => {
  const { darkMode, toggleTheme } = useTheme();
  
  // Navigation State
  const [activeTab, setActiveTab] = useState('dashboard');

  // Application States
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [progress, setProgress] = useState([]);
  
  // Recommendations States
  const [dailyRecs, setDailyRecs] = useState({ source: null, recommendations: [] });
  const [selectedRecQ, setSelectedRecQ] = useState(null);
  const [selectedRecs, setSelectedRecs] = useState([]);

  // UI States
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, text: '', type: 'success' });

  // 1. Initial Load: Fetch Users & Questions
  useEffect(() => {
    const bootstrap = async () => {
      try {
        const [usersList, questionsList] = await Promise.all([
          api.getUsers(),
          api.getQuestions()
        ]);
        
        setQuestions(questionsList);
        setUsers(usersList);

        if (usersList.length > 0) {
          // Check if there is a saved userId in localStorage
          const savedUid = localStorage.getItem('dsa_tracker_uid');
          const matchedUser = usersList.find(u => u._id === savedUid) || usersList[0];
          setCurrentUser(matchedUser);
          localStorage.setItem('dsa_tracker_uid', matchedUser._id);
        }
      } catch (err) {
        showToast('Error loading application data', 'error');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    bootstrap();
  }, []);

  // 2. Secondary Load: Fetch User Progress & Recommendations
  useEffect(() => {
    if (!currentUser) return;

    const loadUserData = async () => {
      try {
        const [progressData, dailyRecData] = await Promise.all([
          api.getProgress(currentUser._id),
          api.getDailyRecommendations(currentUser._id)
        ]);
        setProgress(progressData);
        setDailyRecs(dailyRecData);
        
        // Re-evaluate recommendations if a specific question is selected
        if (selectedRecQ) {
          const recs = await api.getQuestionRecommendations(currentUser._id, selectedRecQ._id);
          setSelectedRecs(recs);
        }
      } catch (err) {
        showToast('Error loading user progress logs', 'error');
        console.error(err);
      }
    };
    loadUserData();
  }, [currentUser, selectedRecQ]);

  // Toast Helper
  const showToast = (text, type = 'success') => {
    setToast({ show: true, text, type });
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 3000);
  };

  // Switch User Profile
  const handleSwitchUser = (userId) => {
    const target = users.find(u => u._id === userId);
    if (target) {
      setCurrentUser(target);
      localStorage.setItem('dsa_tracker_uid', target._id);
      setSelectedRecQ(null); // Clear selected recommendations context
      showToast(`Switched profile to @${target.username}`);
    }
  };

  // Create User Profile
  const handleCreateUser = async (username, email) => {
    const newUser = await api.createUser(username, email);
    setUsers(prev => [...prev, newUser]);
    setCurrentUser(newUser);
    localStorage.setItem('dsa_tracker_uid', newUser._id);
    setSelectedRecQ(null);
    showToast(`Welcome! Account "${username}" created.`);
    return newUser;
  };

  // Save Profile Details
  const handleSaveProfile = async (profileData) => {
    const updated = await api.updateUser(currentUser._id, profileData);
    // Update local lists
    setUsers(prev => prev.map(u => u._id === updated._id ? updated : u));
    setCurrentUser(updated);
    showToast('Profile configuration updated.');
    return updated;
  };

  // Add Custom Question
  const handleAddQuestion = async (questionData) => {
    try {
      const created = await api.addQuestion(questionData);
      setQuestions(prev => [...prev, created].sort((a,b) => (a.num || 0) - (b.num || 0)));
      showToast('Custom problem added to your list.');
    } catch (err) {
      showToast(err.message || 'Failed to add custom problem', 'error');
    }
  };

  // Cycle Status
  const handleCycleStatus = async (questionId, currentStatus) => {
    if (!currentUser) return;
    const nextMap = { 'Todo': 'In Progress', 'In Progress': 'Solved', 'Solved': 'Todo' };
    const nextStatus = nextMap[currentStatus || 'Todo'];
    
    try {
      const updated = await api.updateProgress(currentUser._id, questionId, { status: nextStatus });
      setProgress(prev => {
        const exists = prev.some(p => p.questionId === questionId);
        if (exists) {
          return prev.map(p => p.questionId === questionId ? updated : p);
        } else {
          return [...prev, updated];
        }
      });

      // Show motivational toasts on solving!
      if (nextStatus === 'Solved') {
        showToast('✨ Problem Solved! Keep up the fire!', 'success');
        // Reload user info to capture streak changes
        const updatedUsers = await api.getUsers();
        setUsers(updatedUsers);
        const match = updatedUsers.find(u => u._id === currentUser._id);
        if (match) setCurrentUser(match);
      } else if (nextStatus === 'In Progress') {
        showToast('▶ Started! Good luck debugging.');
      } else {
        showToast('↺ Reset problem progress.');
      }
    } catch (err) {
      showToast('Failed to modify progress status', 'error');
    }
  };

  // Save Notes
  const handleSaveNotes = async (questionId, notes) => {
    if (!currentUser) return;
    try {
      const updated = await api.updateProgress(currentUser._id, questionId, { notes });
      setProgress(prev => {
        const exists = prev.some(p => p.questionId === questionId);
        if (exists) {
          return prev.map(p => p.questionId === questionId ? updated : p);
        } else {
          return [...prev, updated];
        }
      });
      showToast('Notes saved.');
    } catch (err) {
      showToast('Failed to save notes', 'error');
    }
  };

  // Select Question for Recommendation Context
  const handleSelectRecommendation = async (question) => {
    if (!currentUser) return;
    if (selectedRecQ?._id === question._id) {
      // Toggle off
      setSelectedRecQ(null);
      setSelectedRecs([]);
    } else {
      setSelectedRecQ(question);
      try {
        const recs = await api.getQuestionRecommendations(currentUser._id, question._id);
        setSelectedRecs(recs);
        showToast('💡 Recommendations updated.');
      } catch (err) {
        showToast('Failed to load similar recommendations', 'error');
      }
    }
  };

  // Sync LeetCode Profile
  const handleSyncLeetCode = async (username) => {
    if (!currentUser) return;
    const data = await api.syncLeetCode(currentUser._id, username);
    
    // Refresh user object & progress list
    const usersList = await api.getUsers();
    setUsers(usersList);
    const updatedUser = usersList.find(u => u._id === currentUser._id);
    if (updatedUser) setCurrentUser(updatedUser);
    
    const progressData = await api.getProgress(currentUser._id);
    setProgress(progressData);
    
    showToast(`Synced ${data.matchedCount} solved problems from LeetCode!`);
    return data;
  };

  // Sync CodeChef Profile
  const handleSyncCodeChef = async (username) => {
    if (!currentUser) return;
    const data = await api.syncCodeChef(currentUser._id, username);
    
    const usersList = await api.getUsers();
    setUsers(usersList);
    const updatedUser = usersList.find(u => u._id === currentUser._id);
    if (updatedUser) setCurrentUser(updatedUser);
    
    const progressData = await api.getProgress(currentUser._id);
    setProgress(progressData);
    
    showToast(`Synced ${data.matchedCount} solved problems from CodeChef!`);
    return data;
  };

  // Sync CodeChef Manual Import
  const handleSyncCodeChefManual = async (username, problemsText) => {
    if (!currentUser) return;
    const data = await api.syncCodeChefManual(currentUser._id, username, problemsText);
    
    const usersList = await api.getUsers();
    setUsers(usersList);
    const updatedUser = usersList.find(u => u._id === currentUser._id);
    if (updatedUser) setCurrentUser(updatedUser);
    
    const progressData = await api.getProgress(currentUser._id);
    setProgress(progressData);
    
    showToast(`Manually imported CodeChef list! Matched ${data.matchedCount} questions.`);
    return data;
  };

  // Disconnect sync platforms
  const handleDisconnectPlatform = async (platform) => {
    if (!currentUser) return;
    await api.disconnectPlatform(currentUser._id, platform);
    
    const usersList = await api.getUsers();
    setUsers(usersList);
    const updatedUser = usersList.find(u => u._id === currentUser._id);
    if (updatedUser) setCurrentUser(updatedUser);
    
    const progressData = await api.getProgress(currentUser._id);
    setProgress(progressData);
    
    showToast(`Disconnected ${platform} account.`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin" />
          <div className="text-slate-400 font-bold tracking-wider text-xs uppercase animate-pulse">Initializing Application...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 transition-colors duration-300 flex flex-col">
      {/* HEADER NAVBAR */}
      <header className="sticky top-0 z-40 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border-b border-slate-200 dark:border-slate-800/80 px-6 py-4 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white text-lg font-bold shadow-md shadow-indigo-500/20">
            🔥
          </div>
          <div>
            <h1 className="text-base font-black tracking-tight bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">DSA Tracker</h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Solutions Architect Edition</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-1.5">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: '📊' },
            { id: 'problems', label: 'Problems', icon: '🧩' },
            { id: 'sync', label: 'Platform Sync', icon: '🔄' },
            { id: 'settings', label: 'Settings', icon: '⚙️' }
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${activeTab === tab.id ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-500 dark:text-indigo-400' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-850'}`}>
              <span>{tab.icon}</span> {tab.label}
              {tab.id === 'sync' && (currentUser?.leetcodeUsername || currentUser?.codechefUsername) && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              )}
            </button>
          ))}
        </nav>

        {/* Theme and Profile Info */}
        <div className="flex items-center gap-4">
          {/* Quick theme toggler */}
          <button onClick={toggleTheme} className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-lg hover:bg-slate-100 dark:hover:bg-slate-850 transition-colors" title="Toggle Dark/Light Mode">
            {darkMode ? '☀️' : '🌙'}
          </button>

          {/* Quick Active User Badge */}
          {currentUser && (
            <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-850 border border-slate-200 dark:border-slate-800">
              <div className="w-6 h-6 rounded-full bg-indigo-500 text-white text-[10px] font-bold flex items-center justify-center">
                {currentUser.username.slice(0,2).toUpperCase()}
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-xs font-bold leading-none">{currentUser.username}</div>
                <div className="text-[9px] text-slate-400 mt-0.5">{currentUser.email}</div>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* MOBILE NAV BAR */}
      <div className="md:hidden sticky top-[68px] z-30 flex bg-white/90 dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800/80 p-2 overflow-x-auto justify-between gap-1 shadow-sm">
        {[
          { id: 'dashboard', label: 'Dashboard', icon: '📊' },
          { id: 'problems', label: 'Problems', icon: '🧩' },
          { id: 'sync', label: 'Sync', icon: '🔄' },
          { id: 'settings', label: 'Settings', icon: '⚙️' }
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold text-center flex items-center justify-center gap-1.5 transition-all ${activeTab === tab.id ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-550' : 'text-slate-500'}`}>
            <span>{tab.icon}</span> {tab.label}
          </button>
        ))}
      </div>

      {/* MAIN CONTAINER */}
      <main className="flex-1 max-w-[1400px] w-full mx-auto px-4 md:px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
          {/* Main content pane (left) */}
          <div className="lg:col-span-3">
            {activeTab === 'dashboard' && (
              <Dashboard user={currentUser} questions={questions} progress={progress} onNavigate={setActiveTab} />
            )}
            
            {activeTab === 'problems' && (
              <TopicList 
                questions={questions} 
                progress={progress} 
                onCycleStatus={handleCycleStatus} 
                onSaveNotes={handleSaveNotes} 
                onSelectRecommendation={handleSelectRecommendation} 
                activeRecommendationId={selectedRecQ?._id}
                onAddQuestion={handleAddQuestion} />
            )}

            {activeTab === 'sync' && (
              <PlatformSync 
                user={currentUser} 
                onSyncLeetCode={handleSyncLeetCode} 
                onSyncCodeChef={handleSyncCodeChef} 
                onSyncCodeChefManual={handleSyncCodeChefManual} 
                onDisconnectPlatform={handleDisconnectPlatform} />
            )}

            {activeTab === 'settings' && (
              <Settings 
                users={users} 
                currentUser={currentUser} 
                onSwitchUser={handleSwitchUser} 
                onCreateUser={handleCreateUser} 
                onSaveProfile={handleSaveProfile} />
            )}
          </div>

          {/* Sticky recommendations panel (right side, visible on all pages but particularly useful for active targets) */}
          <div className="lg:col-span-1">
            <Sidebar 
              selectedQuestion={selectedRecQ} 
              recommendations={selectedRecQ ? selectedRecs : dailyRecs.recommendations} 
              onClearSelection={() => { setSelectedRecQ(null); setSelectedRecs([]); }} />
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="py-8 mt-12 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800/80 text-center text-xs text-slate-400 font-medium">
        <p>⚡ Full-Stack DSA Progress Tracker Website. Persisted on MongoDB Atlas.</p>
        <p className="mt-1 opacity-70">Designed for developers keeping their algorithm streaks alive.</p>
      </footer>

      {/* FLOAT FLOATING TOAST */}
      {toast.show && (
        <div className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl shadow-lg text-xs font-bold border animate-slideIn flex items-center gap-2 ${toast.type === 'success' ? 'bg-emerald-500 border-emerald-600 text-white shadow-emerald-500/20' : 'bg-rose-500 border-rose-600 text-white shadow-rose-500/20'}`}>
          <span>{toast.type === 'success' ? '✨' : '⚠️'}</span>
          {toast.text}
        </div>
      )}
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
