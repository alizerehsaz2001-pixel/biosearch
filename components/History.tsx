import React, { useState } from 'react';
import { Clock, ChevronRight, Search, FileText, Filter, FlaskConical, BrainCircuit, ShieldCheck, Lightbulb, Scan, Compass, Unlock, GraduationCap, Wrench, Mail, Cpu } from 'lucide-react';
import { SearchResult, AppMode } from '../types';

interface HistoryProps {
  history: SearchResult[];
  onSelect: (result: SearchResult) => void;
}

const History: React.FC<HistoryProps> = ({ history, onSelect }) => {
  const [filter, setFilter] = useState<AppMode | 'ALL'>('ALL');

  if (history.length === 0) return null;

  const filteredHistory = filter === 'ALL' 
    ? history 
    : history.filter(item => item.type === filter);

  const filters: { label: string; value: AppMode | 'ALL' }[] = [
    { label: 'All', value: 'ALL' },
    { label: 'Query', value: 'QUERY_BUILDER' },
    { label: 'Protocol', value: 'PICO_PROTOCOL' },
    { label: 'Screen', value: 'ABSTRACT_SCREENER' },
    { label: 'Extract', value: 'DATA_EXTRACTOR' },
    { label: 'Analyze', value: 'CRITICAL_ANALYST' },
    { label: 'Audit', value: 'ISO_COMPLIANCE_AUDITOR' },
    { label: 'Ideas', value: 'NOVELTY_GENERATOR' },
    { label: 'Image', value: 'IMAGE_ANALYZER' },
    { label: 'Scout', value: 'RESOURCE_SCOUT' },
    { label: 'Open Access', value: 'OPEN_ACCESS_FINDER' },
    { label: 'Lab Scout', value: 'LAB_SCOUT' },
    { label: 'Troubleshoot', value: 'PROTOCOL_TROUBLESHOOTER' },
    { label: 'Email', value: 'ACADEMIC_EMAIL_DRAFTER' },
    { label: 'Bio-AI', value: 'ML_DEEP_LEARNING_ARCHITECT' },
  ];

  return (
    <div className="mt-12 w-full animate-in fade-in duration-700 delay-150">
      <div className="flex items-center justify-between mb-4 px-2">
        <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-400" />
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Recent Activity</h3>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex justify-start mb-6 px-1 overflow-x-auto no-scrollbar pb-2">
         <div className="flex gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 min-w-max">
            {filters.map((f) => (
                <button
                    key={f.value}
                    onClick={() => setFilter(f.value)}
                    className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                        filter === f.value 
                        ? 'bg-white text-slate-800 shadow-sm ring-1 ring-slate-200' 
                        : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                    }`}
                >
                    {f.label}
                </button>
            ))}
         </div>
      </div>
      
      {filteredHistory.length === 0 ? (
          <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-slate-400 text-sm">
              No history found for this category.
          </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
            {filteredHistory.map((item) => (
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
                    item.type === 'NOVELTY_GENERATOR' ? 'bg-pink-50 text-pink-600' :
                    item.type === 'IMAGE_ANALYZER' ? 'bg-blue-50 text-blue-600' :
                    item.type === 'RESOURCE_SCOUT' ? 'bg-emerald-50 text-emerald-600' :
                    item.type === 'OPEN_ACCESS_FINDER' ? 'bg-teal-50 text-teal-600' :
                    item.type === 'LAB_SCOUT' ? 'bg-orange-50 text-orange-600' :
                    item.type === 'PROTOCOL_TROUBLESHOOTER' ? 'bg-red-50 text-red-600' :
                    item.type === 'ACADEMIC_EMAIL_DRAFTER' ? 'bg-purple-50 text-purple-600' :
                    item.type === 'ML_DEEP_LEARNING_ARCHITECT' ? 'bg-fuchsia-50 text-fuchsia-600' :
                    'bg-slate-50 text-slate-600'
                }`}>
                    {item.type === 'QUERY_BUILDER' && <Search className="w-4 h-4" />}
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
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate mb-1 group-hover:text-indigo-700 transition-colors">
                        {item.originalQuery || (item.type === 'IMAGE_ANALYZER' ? 'Image Analysis' : item.type === 'OPEN_ACCESS_FINDER' ? 'Open Access Check' : item.type === 'LAB_SCOUT' ? 'Lab Scout' : item.type === 'PROTOCOL_TROUBLESHOOTER' ? 'Protocol Issue' : item.type === 'ACADEMIC_EMAIL_DRAFTER' ? 'Email Draft' : item.type === 'ML_DEEP_LEARNING_ARCHITECT' ? 'Bio-AI Architecture' : 'Query')}
                    </p>
                    <p className="text-xs text-slate-500 font-mono truncate opacity-70">
                        {item.type === 'ABSTRACT_SCREENER' ? 'Screening Result...' : 
                        item.type === 'DATA_EXTRACTOR' ? 'Extracted Data...' :
                        item.type === 'CRITICAL_ANALYST' ? 'Critical Analysis...' :
                        item.type === 'ISO_COMPLIANCE_AUDITOR' ? 'ISO Compliance Audit...' :
                        item.type === 'NOVELTY_GENERATOR' ? 'Novel Ideas...' :
                        item.type === 'IMAGE_ANALYZER' ? 'Visual Insights...' :
                        item.type === 'RESOURCE_SCOUT' ? 'Resource Recommendations...' :
                        item.type === 'OPEN_ACCESS_FINDER' ? 'Article Status Check...' :
                        item.type === 'LAB_SCOUT' ? 'Lab Recommendations...' :
                        item.type === 'PROTOCOL_TROUBLESHOOTER' ? 'Troubleshooting Diagnosis...' :
                        item.type === 'ACADEMIC_EMAIL_DRAFTER' ? 'Generated Email...' :
                        item.type === 'ML_DEEP_LEARNING_ARCHITECT' ? 'Model Specification...' :
                        item.content}
                    </p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-400 self-center transition-colors" />
            </button>
            ))}
        </div>
      )}
    </div>
  );
};

export default History;