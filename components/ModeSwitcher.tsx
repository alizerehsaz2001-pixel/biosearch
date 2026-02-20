
import React from 'react';
import { Search, FileText, Filter, FlaskConical, BrainCircuit, ShieldCheck, Lightbulb, Scan, Compass, Unlock, GraduationCap, ChevronRight, Wrench, Mail, Cpu, Presentation, Crosshair, FileOutput, AudioWaveform, BookOpen } from 'lucide-react';
import { AppMode } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface ModeSwitcherProps {
  currentMode: AppMode;
  onModeChange: (mode: AppMode) => void;
  disabled: boolean;
  orientation?: 'horizontal' | 'vertical';
}

export const MODES: { id: AppMode; icon: React.ElementType; color: string; bg: string }[] = [
  { id: 'QUERY_BUILDER', icon: Search, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  { id: 'PRECISION_SEARCH_COMMANDER', icon: Crosshair, color: 'text-blue-600', bg: 'bg-blue-50' },
  { id: 'PICO_PROTOCOL', icon: FileText, color: 'text-teal-600', bg: 'bg-teal-50' },
  { id: 'ABSTRACT_SCREENER', icon: Filter, color: 'text-rose-600', bg: 'bg-rose-50' },
  { id: 'DATA_EXTRACTOR', icon: FlaskConical, color: 'text-cyan-600', bg: 'bg-cyan-50' },
  { id: 'CRITICAL_ANALYST', icon: BrainCircuit, color: 'text-violet-600', bg: 'bg-violet-50' },
  { id: 'ISO_COMPLIANCE_AUDITOR', icon: ShieldCheck, color: 'text-amber-600', bg: 'bg-amber-50' },
  { id: 'NOVELTY_GENERATOR', icon: Lightbulb, color: 'text-pink-600', bg: 'bg-pink-50' },
  { id: 'IMAGE_ANALYZER', icon: Scan, color: 'text-blue-600', bg: 'bg-blue-50' },
  { id: 'VOICE_ASSISTANT', icon: AudioWaveform, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  { id: 'CITATION_MANAGER', icon: BookOpen, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { id: 'RESOURCE_SCOUT', icon: Compass, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { id: 'OPEN_ACCESS_FINDER', icon: Unlock, color: 'text-teal-600', bg: 'bg-teal-50' },
  { id: 'LAB_SCOUT', icon: GraduationCap, color: 'text-orange-600', bg: 'bg-orange-50' },
  { id: 'PROTOCOL_TROUBLESHOOTER', icon: Wrench, color: 'text-red-600', bg: 'bg-red-50' },
  { id: 'ACADEMIC_EMAIL_DRAFTER', icon: Mail, color: 'text-purple-600', bg: 'bg-purple-50' },
  { id: 'ML_DEEP_LEARNING_ARCHITECT', icon: Cpu, color: 'text-fuchsia-600', bg: 'bg-fuchsia-50' },
  { id: 'PPT_ARCHITECT', icon: Presentation, color: 'text-amber-600', bg: 'bg-amber-50' },
  { id: 'WORD_ARCHITECT', icon: FileOutput, color: 'text-indigo-600', bg: 'bg-indigo-50' },
];

const ModeSwitcher: React.FC<ModeSwitcherProps> = ({ currentMode, onModeChange, disabled, orientation = 'horizontal' }) => {
  const { t } = useLanguage();

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
                  {t(`mode.${mode.id}.label`)}
                </p>
                <p className={`text-xs truncate ${isActive ? 'text-slate-500' : 'text-slate-400'}`}>
                  {t(`mode.${mode.id}.desc`)}
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
                    <span>{t(`mode.${mode.id}.label`)}</span>
                </button>
            ))}
        </div>
      </div>
    </div>
  );
};

export default ModeSwitcher;
