import React from 'react';
import { Search, FileText, Filter, FlaskConical, BrainCircuit, ShieldCheck } from 'lucide-react';
import { AppMode } from '../types';

interface ModeSwitcherProps {
  currentMode: AppMode;
  onModeChange: (mode: AppMode) => void;
  disabled: boolean;
}

const ModeSwitcher: React.FC<ModeSwitcherProps> = ({ currentMode, onModeChange, disabled }) => {
  return (
    <div className="flex justify-center mb-8 px-2 overflow-x-auto">
      <div className="bg-slate-200/60 p-1 rounded-xl flex items-center shadow-inner min-w-max">
        <button
          onClick={() => onModeChange('QUERY_BUILDER')}
          disabled={disabled}
          className={`
            flex items-center gap-2 px-4 sm:px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200
            ${currentMode === 'QUERY_BUILDER' 
              ? 'bg-white text-indigo-700 shadow-sm' 
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'}
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          <Search className="w-4 h-4" />
          <span className="hidden sm:inline">Query Builder</span>
          <span className="sm:hidden">Query</span>
        </button>
        <button
          onClick={() => onModeChange('PICO_PROTOCOL')}
          disabled={disabled}
          className={`
            flex items-center gap-2 px-4 sm:px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200
            ${currentMode === 'PICO_PROTOCOL' 
              ? 'bg-white text-teal-700 shadow-sm' 
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'}
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          <FileText className="w-4 h-4" />
          <span className="hidden sm:inline">Protocol Definer</span>
          <span className="sm:hidden">Protocol</span>
        </button>
        <button
          onClick={() => onModeChange('ABSTRACT_SCREENER')}
          disabled={disabled}
          className={`
            flex items-center gap-2 px-4 sm:px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200
            ${currentMode === 'ABSTRACT_SCREENER' 
              ? 'bg-white text-rose-700 shadow-sm' 
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'}
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          <Filter className="w-4 h-4" />
          <span className="hidden sm:inline">Abstract Screener</span>
          <span className="sm:hidden">Screen</span>
        </button>
        <button
          onClick={() => onModeChange('DATA_EXTRACTOR')}
          disabled={disabled}
          className={`
            flex items-center gap-2 px-4 sm:px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200
            ${currentMode === 'DATA_EXTRACTOR' 
              ? 'bg-white text-cyan-700 shadow-sm' 
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'}
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          <FlaskConical className="w-4 h-4" />
          <span className="hidden sm:inline">Data Extractor</span>
          <span className="sm:hidden">Extract</span>
        </button>
        <button
          onClick={() => onModeChange('CRITICAL_ANALYST')}
          disabled={disabled}
          className={`
            flex items-center gap-2 px-4 sm:px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200
            ${currentMode === 'CRITICAL_ANALYST' 
              ? 'bg-white text-violet-700 shadow-sm' 
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'}
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          <BrainCircuit className="w-4 h-4" />
          <span className="hidden sm:inline">Critical Analyst</span>
          <span className="sm:hidden">Analyze</span>
        </button>
        <button
          onClick={() => onModeChange('ISO_COMPLIANCE_AUDITOR')}
          disabled={disabled}
          className={`
            flex items-center gap-2 px-4 sm:px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200
            ${currentMode === 'ISO_COMPLIANCE_AUDITOR' 
              ? 'bg-white text-amber-700 shadow-sm' 
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'}
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          <ShieldCheck className="w-4 h-4" />
          <span className="hidden sm:inline">ISO Auditor</span>
          <span className="sm:hidden">Audit</span>
        </button>
      </div>
    </div>
  );
};

export default ModeSwitcher;