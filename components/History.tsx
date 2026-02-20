
import React, { useState } from 'react';
import { Clock, ChevronRight, Search, FileText, Filter, FlaskConical, BrainCircuit, ShieldCheck, Lightbulb, Scan, Compass, Unlock, GraduationCap, Wrench, Mail, Cpu, Presentation, Star, Crosshair } from 'lucide-react';
import { SearchResult, AppMode } from '../types';

interface HistoryProps {
  history: SearchResult[];
  savedResults: SearchResult[];
  onSelect: (result: SearchResult) => void;
  onClearHistory: () => void;
}

const History: React.FC<HistoryProps> = ({ history, savedResults, onSelect, onClearHistory }) => {
  const [filter, setFilter] = useState<AppMode | 'ALL' | 'SAVED'>('ALL');

  const savedIds = savedResults.map(r => r.id);

  // Determine list source based on filter
  let displayList = filter === 'SAVED' ? savedResults : history;

  // Apply type filters if not SAVED/ALL
  if (filter !== 'ALL' && filter !== 'SAVED') {
      displayList = displayList.filter(item => item.type === filter);
  }

  // Sort by timestamp descending
  const sortedList = [...displayList].sort((a, b) => b.timestamp - a.timestamp);

  if (history.length === 0 && savedResults.length === 0) return null;

  const filters: { label: string; value: AppMode | 'ALL' | 'SAVED'; icon?: any }[] = [
    { label: 'All Activity', value: 'ALL' },
    { label: 'Bookmarked', value: 'SAVED', icon: Star },
    { label: 'Queries', value: 'QUERY_BUILDER' },
    { label: 'Precision', value: 'PRECISION_SEARCH_COMMANDER' },
    { label: 'Protocols', value: 'PICO_PROTOCOL' },
    { label: 'Screener', value: 'ABSTRACT_SCREENER' },
    { label: 'Extractor', value: 'DATA_EXTRACTOR' },
    { label: 'Analyst', value: 'CRITICAL_ANALYST' },
    { label: 'Auditor', value: 'ISO_COMPLIANCE_AUDITOR' },
    { label: 'Lab Scout', value: 'LAB_SCOUT' },
  ];

  return (
    <div className="mt-12 w-full animate-in fade-in duration-700 delay-150">
      <div className="flex items-center justify-between mb-6 px-2">
        <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-slate-400" />
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Research Archive</h3>
        </div>
        {history.length > 0 && filter === 'ALL' && (
          <button 
            onClick={() => {
              if (window.confirm('Are you sure you want to clear your research history? Bookmarked results will be kept.')) {
                onClearHistory();
              }
            }}
            className="text-[10px] font-bold text-slate-400 hover:text-red-500 uppercase tracking-widest transition-colors"
          >
            Clear History
          </button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="flex justify-start mb-6 px-1 overflow-x-auto no-scrollbar pb-2">
         <div className="flex gap-1.5 bg-slate-200/50 p-1 rounded-xl border border-slate-200 min-w-max">
            {filters.map((f) => (
                <button
                    key={f.value}
                    onClick={() => setFilter(f.value)}
                    className={`whitespace-nowrap flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all duration-200 ${
                        filter === f.value 
                        ? 'bg-white text-indigo-700 shadow-sm ring-1 ring-slate-200' 
                        : 'text-slate-500 hover:text-slate-800 hover:bg-white/50'
                    }`}
                >
                    {f.icon && <f.icon className={`w-3 h-3 ${filter === f.value ? 'text-amber-500 fill-amber-500' : ''}`} />}
                    {f.label}
                </button>
            ))}
         </div>
      </div>
      
      {sortedList.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-200 text-slate-400">
              <div className="mb-2 flex justify-center"><Clock className="w-8 h-8 opacity-20" /></div>
              <p className="text-sm font-medium">No results found for this category.</p>
          </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
            {sortedList.map((item) => {
              const isSaved = savedIds.includes(item.id);
              return (
                <button
                    key={item.id}
                    onClick={() => onSelect(item)}
                    className="group flex items-start gap-4 p-4 bg-white hover:bg-indigo-50/30 border border-slate-100 hover:border-indigo-200 rounded-2xl text-left transition-all duration-200 shadow-sm hover:shadow-md"
                >
                    <div className={`mt-1 p-2 rounded-xl transition-colors ${
                        item.type === 'QUERY_BUILDER' ? 'bg-indigo-50 text-indigo-600' : 
                        item.type === 'PRECISION_SEARCH_COMMANDER' ? 'bg-blue-50 text-blue-600' :
                        item.type === 'PICO_PROTOCOL' ? 'bg-teal-50 text-teal-600' : 
                        item.type === 'ABSTRACT_SCREENER' ? 'bg-rose-50 text-rose-600' :
                        item.type === 'DATA_EXTRACTOR' ? 'bg-cyan-50 text-cyan-600' :
                        item.type === 'CRITICAL_ANALYST' ? 'bg-violet-50 text-violet-600' :
                        item.type === 'ISO_COMPLIANCE_AUDITOR' ? 'bg-amber-50 text-amber-600' :
                        'bg-slate-50 text-slate-600'
                    }`}>
                        {item.type === 'QUERY_BUILDER' && <Search className="w-4 h-4" />}
                        {item.type === 'PRECISION_SEARCH_COMMANDER' && <Crosshair className="w-4 h-4" />}
                        {item.type === 'PICO_PROTOCOL' && <FileText className="w-4 h-4" />}
                        {item.type === 'ABSTRACT_SCREENER' && <Filter className="w-4 h-4" />}
                        {item.type === 'DATA_EXTRACTOR' && <FlaskConical className="w-4 h-4" />}
                        {item.type === 'CRITICAL_ANALYST' && <BrainCircuit className="w-4 h-4" />}
                        {item.type === 'ISO_COMPLIANCE_AUDITOR' && <ShieldCheck className="w-4 h-4" />}
                        {item.type === 'NOVELTY_GENERATOR' && <Lightbulb className="w-4 h-4" />}
                        {item.type === 'IMAGE_ANALYZER' && <Scan className="w-4 h-4" />}
                        {item.type === 'RESOURCE_SCOUT' && <Compass className="w-4 h-4" />}
                        {item.type === 'OPEN_ACCESS_FINDER' && <Unlock className="w-4 h-4" />}
                        {item.type === 'LAB_SCOUT' && <GraduationCap className="w-4 h-4" />}
                        {item.type === 'PROTOCOL_TROUBLESHOOTER' && <Wrench className="w-4 h-4" />}
                        {item.type === 'ACADEMIC_EMAIL_DRAFTER' && <Mail className="w-4 h-4" />}
                        {item.type === 'ML_DEEP_LEARNING_ARCHITECT' && <Cpu className="w-4 h-4" />}
                        {item.type === 'PPT_ARCHITECT' && <Presentation className="w-4 h-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm font-bold text-slate-800 truncate group-hover:text-indigo-700 transition-colors">
                              {item.originalQuery || 'Research Result'}
                          </p>
                          {isSaved && <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500 shrink-0" />}
                        </div>
                        <p className="text-xs text-slate-500 font-medium uppercase tracking-tight opacity-70">
                            {item.type.replace(/_/g, ' ')} • {new Date(item.timestamp).toLocaleDateString()}
                        </p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-indigo-400 self-center transition-all group-hover:translate-x-1" />
                </button>
              );
            })}
        </div>
      )}
    </div>
  );
};

export default History;
