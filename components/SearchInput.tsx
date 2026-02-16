import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, ArrowRight, FileText, Filter, FlaskConical, BrainCircuit, ShieldCheck } from 'lucide-react';
import { QueryStatus, AppMode } from '../types';

interface SearchInputProps {
  onGenerate: (input: string, secondaryInput?: string) => void;
  status: QueryStatus;
  mode: AppMode;
}

const SearchInput: React.FC<SearchInputProps> = ({ onGenerate, status, mode }) => {
  const [input, setInput] = useState('');
  const [criteria, setCriteria] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const criteriaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && status !== QueryStatus.LOADING) {
      if (mode === 'ABSTRACT_SCREENER' && !criteria.trim()) {
        // Validation could be added here
      }
      onGenerate(input, criteria);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.metaKey) {
      handleSubmit(e as unknown as React.FormEvent);
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
    if (criteriaRef.current) {
        criteriaRef.current.style.height = 'auto';
        criteriaRef.current.style.height = criteriaRef.current.scrollHeight + 'px';
    }
  }, [input, criteria, mode]);

  const isLoading = status === QueryStatus.LOADING;

  let placeholder = '';
  let buttonLabel = '';
  let buttonIcon = <Sparkles className="w-4 h-4" />;
  let buttonColor = '';

  switch (mode) {
    case 'QUERY_BUILDER':
        placeholder = "Describe your research topic (e.g., 'Use of hydrogels for myocardial infarction regeneration')...";
        buttonLabel = 'Generate Query';
        buttonIcon = <Sparkles className="w-4 h-4" />;
        buttonColor = "bg-indigo-600 text-white hover:bg-indigo-700";
        break;
    case 'PICO_PROTOCOL':
        placeholder = "Enter your research question (e.g., 'Does the use of PLGA nanoparticles improve drug delivery efficacy in glioblastoma compared to free drug?')...";
        buttonLabel = 'Define Protocol';
        buttonIcon = <FileText className="w-4 h-4" />;
        buttonColor = "bg-teal-600 text-white hover:bg-teal-700";
        break;
    case 'ABSTRACT_SCREENER':
        placeholder = "Paste the abstract here...";
        buttonLabel = 'Screen Abstract';
        buttonIcon = <Filter className="w-4 h-4" />;
        buttonColor = "bg-rose-600 text-white hover:bg-rose-700";
        break;
    case 'DATA_EXTRACTOR':
        placeholder = "Paste the Abstract or Methods section to extract quantitative data...";
        buttonLabel = 'Extract Data';
        buttonIcon = <FlaskConical className="w-4 h-4" />;
        buttonColor = "bg-cyan-600 text-white hover:bg-cyan-700";
        break;
    case 'CRITICAL_ANALYST':
        placeholder = "Paste key findings or data points from multiple studies to analyze trends and gaps...";
        buttonLabel = 'Analyze Gaps';
        buttonIcon = <BrainCircuit className="w-4 h-4" />;
        buttonColor = "bg-violet-600 text-white hover:bg-violet-700";
        break;
    case 'ISO_COMPLIANCE_AUDITOR':
        placeholder = "Paste the Methods section to audit against ISO 10993 and ASTM standards...";
        buttonLabel = 'Audit Compliance';
        buttonIcon = <ShieldCheck className="w-4 h-4" />;
        buttonColor = "bg-amber-600 text-white hover:bg-amber-700";
        break;
  }

  return (
    <div className={`w-full bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden transition-all duration-300 focus-within:ring-2 focus-within:border-transparent ${
        mode === 'QUERY_BUILDER' ? 'focus-within:ring-indigo-500/20' : 
        mode === 'PICO_PROTOCOL' ? 'focus-within:ring-teal-500/20' : 
        mode === 'ABSTRACT_SCREENER' ? 'focus-within:ring-rose-500/20' : 
        mode === 'DATA_EXTRACTOR' ? 'focus-within:ring-cyan-500/20' :
        mode === 'CRITICAL_ANALYST' ? 'focus-within:ring-violet-500/20' :
        'focus-within:ring-amber-500/20'
    }`}>
      <form onSubmit={handleSubmit} className="relative flex flex-col">
        
        {/* Criteria Input for Screener Mode */}
        {mode === 'ABSTRACT_SCREENER' && (
             <div className="p-1 border-b border-slate-100 bg-slate-50/50">
                <textarea
                    ref={criteriaRef}
                    value={criteria}
                    onChange={(e) => setCriteria(e.target.value)}
                    placeholder="Define Inclusion/Exclusion Criteria (e.g., 'Include only in vivo studies, exclude reviews')..."
                    className="w-full p-4 min-h-[80px] text-sm text-slate-700 placeholder:text-slate-400 border-none outline-none resize-none bg-transparent"
                    disabled={isLoading}
                />
            </div>
        )}

        <div className="p-1">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className={`w-full p-4 min-h-[120px] text-lg text-slate-800 placeholder:text-slate-400 border-none outline-none resize-none bg-transparent ${mode === 'ABSTRACT_SCREENER' || mode === 'CRITICAL_ANALYST' || mode === 'ISO_COMPLIANCE_AUDITOR' ? 'min-h-[150px]' : ''}`}
            disabled={isLoading}
          />
        </div>
        
        <div className="flex items-center justify-between px-4 pb-4 pt-2 bg-gradient-to-t from-white via-white to-transparent">
          <div className="text-xs text-slate-400 font-medium">
             {mode === 'ABSTRACT_SCREENER' 
                ? <span className="hidden sm:inline">Paste abstract and criteria. </span>
                : mode === 'CRITICAL_ANALYST'
                ? <span className="hidden sm:inline">Paste multiple study findings. </span>
                : mode === 'ISO_COMPLIANCE_AUDITOR'
                ? <span className="hidden sm:inline">Paste Methods section. </span>
                : <span className="hidden sm:inline">Pro Tip: Be specific. </span>
             }
            <span className="inline-block bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 text-[10px] tracking-wide">⌘ + Enter</span> to submit
          </div>
          
          <button
            type="submit"
            disabled={!input.trim() || isLoading || (mode === 'ABSTRACT_SCREENER' && !criteria.trim())}
            className={`
              flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200
              ${(!input.trim() || isLoading || (mode === 'ABSTRACT_SCREENER' && !criteria.trim()))
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                : `${buttonColor} hover:shadow-md active:transform active:scale-95`}
            `}
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                {buttonIcon}
                <span>{buttonLabel}</span>
                <ArrowRight className="w-4 h-4 opacity-60" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SearchInput;