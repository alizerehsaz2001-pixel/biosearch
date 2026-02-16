import React from 'react';
import { Clock, ChevronRight, Search, FileText, Filter, FlaskConical, BrainCircuit, ShieldCheck, Lightbulb } from 'lucide-react';
import { SearchResult } from '../types';

interface HistoryProps {
  history: SearchResult[];
  onSelect: (result: SearchResult) => void;
}

const History: React.FC<HistoryProps> = ({ history, onSelect }) => {
  if (history.length === 0) return null;

  return (
    <div className="mt-12 w-full animate-in fade-in duration-700 delay-150">
      <div className="flex items-center gap-2 mb-4 px-2">
        <Clock className="w-4 h-4 text-slate-400" />
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Recent Activity</h3>
      </div>
      
      <div className="grid grid-cols-1 gap-3">
        {history.map((item) => (
          <button
            key={item.id}
            onClick={() => onSelect(item)}
            className="group flex items-start gap-4 p-4 bg-white hover:bg-slate-50 border border-slate-100 hover:border-indigo-200 rounded-xl text-left transition-all duration-200 shadow-sm hover:shadow-md"
          >
            <div className={`mt-1 p-1.5 rounded-md ${
                item.type === 'QUERY_BUILDER' ? 'bg-indigo-50 text-indigo-600' : 
                item.type === 'PICO_PROTOCOL' ? 'bg-teal-50 text-teal-600' : 
                item.type === 'ABSTRACT_SCREENER' ? 'bg-rose-50 text-rose-600' :
                item.type === 'DATA_EXTRACTOR' ? 'bg-cyan-50 text-cyan-600' :
                item.type === 'CRITICAL_ANALYST' ? 'bg-violet-50 text-violet-600' :
                item.type === 'ISO_COMPLIANCE_AUDITOR' ? 'bg-amber-50 text-amber-600' :
                'bg-pink-50 text-pink-600'
            }`}>
                {item.type === 'QUERY_BUILDER' && <Search className="w-4 h-4" />}
                {item.type === 'PICO_PROTOCOL' && <FileText className="w-4 h-4" />}
                {item.type === 'ABSTRACT_SCREENER' && <Filter className="w-4 h-4" />}
                {item.type === 'DATA_EXTRACTOR' && <FlaskConical className="w-4 h-4" />}
                {item.type === 'CRITICAL_ANALYST' && <BrainCircuit className="w-4 h-4" />}
                {item.type === 'ISO_COMPLIANCE_AUDITOR' && <ShieldCheck className="w-4 h-4" />}
                {item.type === 'NOVELTY_GENERATOR' && <Lightbulb className="w-4 h-4" />}
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-800 truncate mb-1 group-hover:text-indigo-700 transition-colors">
                    {item.originalQuery}
                </p>
                <p className="text-xs text-slate-500 font-mono truncate opacity-70">
                    {item.type === 'ABSTRACT_SCREENER' ? 'Screening Result...' : 
                     item.type === 'DATA_EXTRACTOR' ? 'Extracted Data...' :
                     item.type === 'CRITICAL_ANALYST' ? 'Critical Analysis...' :
                     item.type === 'ISO_COMPLIANCE_AUDITOR' ? 'ISO Compliance Audit...' :
                     item.type === 'NOVELTY_GENERATOR' ? 'Novel Ideas...' :
                     item.content}
                </p>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-400 self-center transition-colors" />
          </button>
        ))}
      </div>
    </div>
  );
};

export default History;