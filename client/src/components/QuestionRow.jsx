import React, { useState } from 'react';

const QuestionRow = ({ 
  question, 
  progress = { status: 'Todo', notes: '', lcSynced: false, ccSynced: false }, 
  onCycleStatus, 
  onSaveNotes, 
  onSelectRecommendation,
  isRecommendationActive 
}) => {
  const [showNotes, setShowNotes] = useState(false);
  const [notesText, setNotesText] = useState(progress.notes || '');

  const handleSaveNotes = () => {
    onSaveNotes(question._id, notesText);
    setShowNotes(false);
  };

  const handleCancelNotes = () => {
    setNotesText(progress.notes || '');
    setShowNotes(false);
  };

  // Status button styles & text
  let statusClass = 'border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800';
  let statusText = '○ Todo';

  if (progress.status === 'In Progress') {
    statusClass = 'bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/50 text-blue-600 dark:text-blue-400 hover:bg-blue-100/50 dark:hover:bg-blue-950/40';
    statusText = '⟳ In Progress';
  } else if (progress.status === 'Solved') {
    if (progress.lcSynced) {
      statusClass = 'bg-orange-500/10 border border-orange-500/20 text-orange-600 dark:text-orange-400';
      statusText = '🟧 LC Solved';
    } else if (progress.ccSynced) {
      statusClass = 'bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400';
      statusText = '🟣 CC Solved';
    } else {
      statusClass = 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 dark:hover:bg-emerald-500/20';
      statusText = '✓ Solved';
    }
  }

  // Difficulty colors
  const diffClasses = {
    Easy: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/30',
    Medium: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/30',
    Hard: 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/30'
  };

  return (
    <div className="border-b border-slate-100 dark:border-slate-800 last:border-0 hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-4">
        {/* Left Side: Number, Title, Tags */}
        <div className="flex items-start gap-3 flex-1">
          {question.num && (
            <span className="text-xs font-mono font-bold text-slate-400 mt-1 w-8">
              #{question.num}
            </span>
          )}
          <div className="space-y-1">
            <h4 className={`text-sm font-semibold tracking-wide ${progress.status === 'Solved' ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-700 dark:text-slate-200'}`}>
              <a href={question.url || '#'} target="_blank" rel="noopener noreferrer" className="hover:text-indigo-500 transition-colors">
                {question.title}
              </a>
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {question.tags && question.tags.map(tag => (
                <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-medium">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Difficulty, Status Button, Edit Notes, Rec Bulbs */}
        <div className="flex items-center gap-3 self-end sm:self-auto">
          {/* Synced platform indicators */}
          {progress.lcSynced && (
            <span className="w-2 h-2 rounded-full bg-orange-500" title="Synced from LeetCode" />
          )}
          {progress.ccSynced && (
            <span className="w-2 h-2 rounded-full bg-purple-500" title="Synced from CodeChef" />
          )}

          {/* Difficulty Badge */}
          <span className={`text-xs px-2.5 py-0.5 font-bold uppercase rounded-lg border ${diffClasses[question.difficulty]}`}>
            {question.difficulty}
          </span>

          {/* Status Cycling Button */}
          <button onClick={() => onCycleStatus(question._id, progress.status)}
            className={`w-[110px] py-1.5 text-xs font-bold rounded-lg border transition-all duration-200 ${statusClass}`}>
            {statusText}
          </button>

          {/* Notes Pencil Button */}
          <button onClick={() => setShowNotes(!showNotes)}
            className={`p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all ${progress.notes ? 'text-amber-500 border-amber-200 dark:border-amber-950 bg-amber-50/20' : ''}`}
            title="Edit Notes">
            {progress.notes ? '📝' : '✏️'}
          </button>

          {/* Recommendation Lightbulb */}
          <button onClick={() => onSelectRecommendation(question)}
            className={`p-1.5 rounded-lg border transition-all ${isRecommendationActive ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-500' : 'border-slate-200 dark:border-slate-800 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
            title="Find similar questions">
            💡
          </button>
        </div>
      </div>

      {/* Expandable Notes Panel */}
      {showNotes && (
        <div className="px-4 pb-4 pt-1 bg-slate-50/50 dark:bg-slate-900/30 border-t border-slate-100 dark:border-slate-800/50 animate-fadeIn">
          <textarea value={notesText} onChange={(e) => setNotesText(e.target.value)}
            rows={3} className="w-full p-3 text-xs bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            placeholder="Notes, approach, and coding insights..."></textarea>
          <div className="flex gap-2 justify-end mt-2">
            <button onClick={handleCancelNotes}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
              Cancel
            </button>
            <button onClick={handleSaveNotes}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-500 text-white hover:bg-indigo-600 transition-colors">
              Save Notes
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionRow;
