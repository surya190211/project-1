import React from 'react';

const Sidebar = ({ selectedQuestion, recommendations, onClearSelection }) => {
  // Difficulty colors
  const diffBadgeColor = (diff) => {
    switch (diff) {
      case 'Easy': return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
      case 'Medium': return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
      case 'Hard': return 'text-rose-500 bg-rose-500/10 border-rose-500/20';
      default: return 'text-slate-400 bg-slate-400/10 border-slate-400/20';
    }
  };

  return (
    <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm sticky top-6 space-y-5 animate-fadeIn">
      {/* Header section */}
      <div>
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
            <span>💡</span> Recommendations
          </h3>
          {selectedQuestion && (
            <button onClick={onClearSelection}
              className="text-[10px] px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
              Reset
            </button>
          )}
        </div>
        <p className="text-[11px] text-slate-400 mt-1 font-medium">
          {selectedQuestion 
            ? 'Based on your currently selected question' 
            : 'Personalized picks based on your progress'}
        </p>
      </div>

      {/* Selected Question Context */}
      {selectedQuestion && (
        <div className="p-3.5 rounded-xl bg-indigo-500/5 border border-indigo-500/10 space-y-1">
          <div className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">Recommendations source</div>
          <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate">
            {selectedQuestion.title}
          </h4>
          <div className="flex gap-2 items-center text-[10px] text-slate-500">
            <span>{selectedQuestion.topic}</span>
            <span className={`px-1.5 py-0.5 rounded border text-[9px] font-bold ${diffBadgeColor(selectedQuestion.difficulty)}`}>
              {selectedQuestion.difficulty}
            </span>
          </div>
        </div>
      )}

      {/* Recommendations Cards */}
      <div className="space-y-3">
        {recommendations.length > 0 ? (
          recommendations.map((q, i) => (
            <a key={q._id} href={q.url || '#'} target="_blank" rel="noopener noreferrer"
              className="block p-4 rounded-xl border border-slate-150 dark:border-slate-800/80 bg-slate-50/30 dark:bg-slate-900/30 hover:bg-slate-50 dark:hover:bg-slate-850 hover:border-indigo-500/40 hover:-translate-y-0.5 transition-all duration-200 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                  #{i + 1} Recommendation
                </span>
                <span className="text-slate-400 text-xs font-bold">↗</span>
              </div>
              
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-200 mt-1 line-clamp-1 hover:text-indigo-500">
                {q.title}
              </h4>
              
              <div className="flex flex-wrap gap-1.5 items-center mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/50">
                <span className="text-[10px] text-slate-400 font-medium">
                  {q.topic}
                </span>
                <span className={`text-[9px] px-1.5 py-0.5 rounded border font-bold ${diffBadgeColor(q.difficulty)}`}>
                  {q.difficulty}
                </span>
                {q.tags && q.tags.slice(0, 1).map(tag => (
                  <span key={tag} className="text-[9px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-mono">
                    {tag}
                  </span>
                ))}
              </div>
            </a>
          ))
        ) : (
          <div className="text-center py-10 rounded-xl bg-slate-50/50 dark:bg-slate-900/10 border border-dashed border-slate-200 dark:border-slate-800">
            <span className="text-3xl block mb-2">🎉</span>
            <h5 className="text-xs font-bold text-slate-700 dark:text-slate-300">You're fully caught up!</h5>
            <p className="text-[10px] text-slate-400 mt-1 px-4">
              All similar questions are solved. Complete other topics to fetch new picks.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
