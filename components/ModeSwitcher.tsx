import React from 'react';
import { Search, FileText, Filter, FlaskConical, BrainCircuit, ShieldCheck, Lightbulb, Scan, Compass, Unlock, GraduationCap, ChevronRight, Wrench, Mail, Cpu, Presentation, Crosshair } from 'lucide-react';
import { AppMode } from '../types';

interface ModeSwitcherProps {
  currentMode: AppMode;
  onModeChange: (mode: AppMode) => void;
  disabled: boolean;
  orientation?: 'horizontal' | 'vertical';
}

export const MODES: { id: AppMode; label: string; icon: React.ElementType; desc: string; color: string; bg: string }[] = [
  { id: 'QUERY_BUILDER', label: 'Query Builder', icon: Search, desc: 'Generate Boolean strings', color: 'text-indigo-600', bg: 'bg-indigo-50' },
  { id: 'PRECISION_SEARCH_COMMANDER', label: 'Precision Search', icon: Crosshair, desc: 'Advanced manual filters', color: 'text-blue-600', bg: 'bg-blue-50' },
  { id: 'PICO_PROTOCOL', label: 'Protocol Definer', icon: FileText, desc: 'PICO frameworks', color: 'text-teal-600', bg: 'bg-teal-50' },
  { id: 'ABSTRACT_SCREENER', label: 'Abstract Screener', icon: Filter, desc: 'AI exclusion criteria', color: 'text-rose-600', bg: 'bg-rose-50' },
  { id: 'DATA_EXTRACTOR', label: 'Data Extractor', icon: FlaskConical, desc: 'Parse quantitative data', color: 'text-cyan-600', bg: 'bg-cyan-50' },
  { id: 'CRITICAL_ANALYST', label: 'Critical Analyst', icon: BrainCircuit, desc: 'Identify trends & gaps', color: 'text-violet-600', bg: 'bg-violet-50' },
  { id: 'ISO_COMPLIANCE_AUDITOR', label: 'ISO Auditor', icon: ShieldCheck, desc: 'Regulatory compliance', color: 'text-amber-600', bg: 'bg-amber-50' },
  { id: 'NOVELTY_GENERATOR', label: 'Novelty Gen', icon: Lightbulb, desc: 'Generate hypotheses', color: 'text-pink-600', bg: 'bg-pink-50' },
  { id: 'IMAGE_ANALYZER', label: 'Image Analyst', icon: Scan, desc: 'Insights from figures', color: 'text-blue-600', bg: 'bg-blue-50' },
  { id: 'RESOURCE_SCOUT', label: 'Resource Scout', icon: Compass, desc: 'Find databases', color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { id: 'OPEN_ACCESS_FINDER', label: 'Open Access', icon: Unlock, desc: 'Find legal PDFs', color: 'text-teal-600', bg: 'bg-teal-50' },
  { id: 'LAB_SCOUT', label: 'Lab Scout', icon: GraduationCap, desc: 'Find professors & labs', color: 'text-orange-600', bg: 'bg-orange-50' },
  { id: 'PROTOCOL_TROUBLESHOOTER', label: 'Troubleshooter', icon: Wrench, desc: 'Diagnose failed experiments', color: 'text-red-600', bg: 'bg-red-50' },
  { id: 'ACADEMIC_EMAIL_DRAFTER', label: 'Email Strategist', icon: Mail, desc: 'Write cold emails', color: 'text-purple-600', bg: 'bg-purple-50' },
  { id: 'ML_DEEP_LEARNING_ARCHITECT', label: 'Bio-AI Architect', icon: Cpu, desc: 'Design ML/DL models', color: 'text-fuchsia-600', bg: 'bg-fuchsia-50' },
  { id: 'PPT_ARCHITECT', label: 'PPT Architect', icon: Presentation, desc: 'Data to Slides', color: 'text-amber-600', bg: 'bg-amber-50' },
];

const ModeSwitcher: React.FC<ModeSwitcherProps> = ({ currentMode, onModeChange, disabled, orientation = 'horizontal' }) => {
  if (orientation === 'vertical') {
    return (
      <div className="flex flex-col gap-2 w-full">
        {MODES.map((mode) => {
          const isActive = currentMode === mode.id;
          return (
            <button
              key={mode.id}
              onClick={() => onModeChange(mode.id)}
              disabled={disabled}
              className={`
                group flex items-center gap-3 p-3 rounded-xl transition-all duration-200 text-left w-full border
                ${isActive 
                  ? `bg-white border-slate-200 shadow-md ring-1 ring-black/5` 
                  : 'bg-transparent border-transparent hover:bg-slate-100/80 text-slate-500'}
                ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              <div className={`p-2 rounded-lg transition-colors ${isActive ? mode.bg + ' ' + mode.color : 'bg-slate-100 text-slate-400 group-hover:bg-white group-hover:text-slate-600'}`}>
                <mode.icon className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold truncate ${isActive ? 'text-slate-800' : 'text-slate-600'}`}>
                  {mode.label}
                </p>
                <p className={`text-xs truncate ${isActive ? 'text-slate-500' : 'text-slate-400'}`}>
                  {mode.desc}
                </p>
              </div>
              {isActive && <ChevronRight className="w-4 h-4 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="w-full mb-8 overflow-x-auto no-scrollbar">
      <div className="flex justify-start min-w-full px-1">
        <div className="bg-slate-200/60 p-1 rounded-xl flex items-center shadow-inner min-w-max">
            {MODES.map((mode) => (
                <button
                    key={mode.id}
                    onClick={() => onModeChange(mode.id)}
                    disabled={disabled}
                    className={`
                        flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200
                        ${currentMode === mode.id 
                        ? 'bg-white text-slate-800 shadow-sm' 
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'}
                        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
                    `}
                >
                    <mode.icon className={`w-4 h-4 ${currentMode === mode.id ? mode.color : 'text-slate-400'}`} />
                    <span>{mode.label}</span>
                </button>
            ))}
        </div>
      </div>
    </div>
  );
};

export default ModeSwitcher;