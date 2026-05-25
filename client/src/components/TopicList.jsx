import React, { useState } from 'react';
import QuestionRow from './QuestionRow.jsx';

const TopicList = ({
  questions,
  progress,
  onCycleStatus,
  onSaveNotes,
  onSelectRecommendation,
  activeRecommendationId,
  onAddQuestion
}) => {
  // States
  const [search, setSearch] = useState('');
  const [diffFilter, setDiffFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sourceFilter, setSourceFilter] = useState('All');
  const [openTopics, setOpenTopics] = useState({
    'Arrays': true // Open Arrays by default
  });

  // Add Question Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newTopic, setNewTopic] = useState('');
  const [newDifficulty, setNewDifficulty] = useState('Easy');
  const [newUrl, setNewUrl] = useState('');
  const [newNum, setNewNum] = useState('');
  const [newTags, setNewTags] = useState('');

  // Index progress by questionId
  const progressMap = {};
  progress.forEach(p => {
    progressMap[p.questionId] = p;
  });

  // Collect all topic order
  const topicOrder = [...new Set(questions.map(q => q.topic))];

  // Apply filters
  const filteredQuestions = questions.filter(q => {
    const p = progressMap[q._id] || { status: 'Todo', lcSynced: false, ccSynced: false };

    // Search filter (title + tags matching)
    if (search) {
      const query = search.toLowerCase();
      const matchTitle = q.title.toLowerCase().includes(query);
      const matchTags = q.tags && q.tags.some(t => t.toLowerCase().includes(query));
      if (!matchTitle && !matchTags) return false;
    }

    // Difficulty filter
    if (diffFilter !== 'All' && q.difficulty !== diffFilter) return false;

    // Status filter
    if (statusFilter !== 'All' && p.status !== statusFilter) return false;

    // Source filter
    if (sourceFilter === 'LeetCode' && !p.lcSynced) return false;
    if (sourceFilter === 'CodeChef' && !p.ccSynced) return false;

    return true;
  });

  // Group by topic
  const groupedQuestions = {};
  filteredQuestions.forEach(q => {
    if (!groupedQuestions[q.topic]) {
      groupedQuestions[q.topic] = [];
    }
    groupedQuestions[q.topic].push(q);
  });

  const toggleTopic = (topic) => {
    setOpenTopics(prev => ({
      ...prev,
      [topic]: !prev[topic]
    }));
  };

  const handleCreateQuestion = (e) => {
    e.preventDefault();
    if (!newTitle || !newTopic) return;
    
    onAddQuestion({
      title: newTitle,
      topic: newTopic,
      difficulty: newDifficulty,
      url: newUrl,
      num: newNum ? parseInt(newNum) : null,
      tags: newTags
    });

    // Reset Form
    setNewTitle('');
    setNewTopic('');
    setNewDifficulty('Easy');
    setNewUrl('');
    setNewNum('');
    setNewTags('');
    setShowAddModal(false);
  };

  // Emojis for topics
  const TOPIC_EMOJIS = {
    'Arrays': '⬛', 'Strings': '🔤', 'Linked Lists': '🔗', 'Stacks & Queues': '📚',
    'Trees': '🌳', 'Graphs': '🕸️', 'Dynamic Programming': '🧩', 'Recursion & Backtracking': '🔄',
    'Binary Search': '🔍', 'Sorting & Searching': '↕️', 'Heap / Priority Queue': '⛰️',
    'Hash Maps': '#️⃣', 'Two Pointers': '👉', 'Sliding Window': '🪟', 'Greedy': '💰',
    'Bit Manipulation': '💾', 'Math & Geometry': '📐', 'Tries': '🌐'
  };

  const ALL_TOPICS = [
    'Arrays', 'Strings', 'Linked Lists', 'Stacks & Queues', 'Trees', 'Graphs',
    'Dynamic Programming', 'Recursion & Backtracking', 'Binary Search', 'Sorting & Searching',
    'Heap / Priority Queue', 'Hash Maps', 'Two Pointers', 'Sliding Window', 'Greedy',
    'Bit Manipulation', 'Math & Geometry', 'Tries'
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header and Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Practice Syllabus</h2>
          <p className="text-xs text-slate-400 mt-0.5 font-medium">Curated and custom problems grouped by topic</p>
        </div>
        <button onClick={() => setShowAddModal(true)}
          className="px-4 py-2 text-xs font-bold bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl shadow-md transition-colors flex items-center gap-1.5 self-start sm:self-auto">
          <span>＋</span> Add Custom Problem
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search Input */}
          <div className="md:col-span-2 relative">
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title, tag, or topic..."
              className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
            <span className="absolute left-3.5 top-2.5 text-slate-400">🔍</span>
          </div>

          {/* Difficulty Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-semibold uppercase">Diff:</span>
            <div className="flex bg-slate-100 dark:bg-slate-950 p-0.5 rounded-lg border border-slate-200 dark:border-slate-800 w-full justify-between">
              {['All', 'Easy', 'Medium', 'Hard'].map(d => (
                <button key={d} onClick={() => setDiffFilter(d)}
                  className={`flex-1 py-1 text-[10px] font-bold rounded-md transition-all ${diffFilter === d ? 'bg-white dark:bg-slate-850 shadow-sm text-indigo-500' : 'text-slate-500 dark:text-slate-400'}`}>
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-semibold uppercase">Status:</span>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full py-1.5 px-3 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500">
              <option value="All">All Statuses</option>
              <option value="Todo">Todo</option>
              <option value="In Progress">In Progress</option>
              <option value="Solved">Solved</option>
            </select>
          </div>
        </div>

        {/* Sync Sources filter */}
        <div className="flex items-center gap-4 text-xs font-semibold pt-1 border-t border-slate-100 dark:border-slate-800/60">
          <span className="text-slate-400 uppercase">Platform Filter:</span>
          <div className="flex gap-2">
            {['All', 'LeetCode', 'CodeChef'].map(src => (
              <button key={src} onClick={() => setSourceFilter(src)}
                className={`px-3 py-1 rounded-full border text-[10px] font-bold transition-all ${sourceFilter === src ? 'bg-indigo-500 border-indigo-500 text-white' : 'border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                {src === 'All' ? 'All Questions' : src === 'LeetCode' ? '🟧 LeetCode' : '🟣 CodeChef'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Accordions */}
      <div className="space-y-4">
        {topicOrder.map(topic => {
          const list = groupedQuestions[topic] || [];
          if (list.length === 0) return null;

          const solvedCount = list.filter(q => (progressMap[q._id] || {}).status === 'Solved').length;
          const pct = list.length ? Math.round((solvedCount / list.length) * 100) : 0;
          const isOpen = !!openTopics[topic];

          return (
            <div key={topic} className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
              {/* Accordion Header */}
              <div onClick={() => toggleTopic(topic)}
                className="flex items-center justify-between p-4 cursor-pointer select-none bg-slate-55/40 dark:bg-slate-900/50 hover:bg-slate-50 dark:hover:bg-slate-850/50 transition-colors">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <span className="text-lg">{TOPIC_EMOJIS[topic] || '📌'}</span>
                  <span className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">
                    {topic}
                  </span>
                  <span className="text-xs font-semibold text-slate-400">
                    ({list.length})
                  </span>
                  
                  {/* Mini progress track */}
                  <div className="hidden sm:block h-1.5 w-24 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden ml-4">
                    <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                  <span className={`text-[10px] font-bold font-mono ml-2 ${pct === 100 ? 'text-emerald-500' : 'text-slate-400'}`}>
                    {solvedCount}/{list.length} ({pct}%)
                  </span>
                </div>
                
                {/* Arrow indicator */}
                <span className={`text-slate-400 text-xs transition-transform duration-200 ${isOpen ? 'transform rotate-180' : ''}`}>
                  ▼
                </span>
              </div>

              {/* Accordion Body */}
              {isOpen && (
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {list.map(question => (
                    <QuestionRow key={question._id}
                      question={question}
                      progress={progressMap[question._id]}
                      onCycleStatus={onCycleStatus}
                      onSaveNotes={onSaveNotes}
                      onSelectRecommendation={onSelectRecommendation}
                      isRecommendationActive={activeRecommendationId === question._id} />
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {/* Empty state */}
        {Object.keys(groupedQuestions).length === 0 && (
          <div className="text-center py-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
            <span className="text-4xl block mb-2">🔍</span>
            <h4 className="font-bold text-slate-700 dark:text-slate-300">No problems found</h4>
            <p className="text-xs text-slate-400 mt-1">Try resetting the filters or modifying your search query.</p>
          </div>
        )}
      </div>

      {/* Modal Dialog: Add Question */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity duration-300">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-md rounded-2xl shadow-xl overflow-hidden animate-zoomIn">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">Add Custom DSA Problem</h3>
              <button onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                ✕
              </button>
            </div>
            
            <form onSubmit={handleCreateQuestion} className="p-5 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Title *</label>
                <input type="text" required value={newTitle} onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Valid Parentheses"
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Topic *</label>
                  <select required value={newTopic} onChange={(e) => setNewTopic(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500">
                    <option value="">Select Topic...</option>
                    {ALL_TOPICS.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Difficulty *</label>
                  <select value={newDifficulty} onChange={(e) => setNewDifficulty(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500">
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Problem Link URL</label>
                <input type="url" value={newUrl} onChange={(e) => setNewUrl(e.target.value)}
                  placeholder="e.g. https://leetcode.com/problems/..."
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Problem #</label>
                  <input type="number" value={newNum} onChange={(e) => setNewNum(e.target.value)}
                    placeholder="e.g. 20"
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Tags (comma-separated)</label>
                  <input type="text" value={newTags} onChange={(e) => setNewTags(e.target.value)}
                    placeholder="e.g. stack, brackets"
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-3 border-t border-slate-100 dark:border-slate-800">
                <button type="button" onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-bold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                  Cancel
                </button>
                <button type="submit"
                  className="px-4 py-2 text-xs font-bold rounded-lg bg-indigo-500 text-white hover:bg-indigo-600 shadow transition-colors">
                  Add Question
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TopicList;
