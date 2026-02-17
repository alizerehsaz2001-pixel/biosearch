
import React, { useState } from 'react';
import { BrainCircuit, Copy, Check, TrendingUp, AlertTriangle, Lightbulb, Scale, ArrowRightCircle, Globe, ExternalLink, ShieldAlert } from 'lucide-react';
import { SearchResult, AppMode } from '../types';

interface AnalystResultCardProps {
  result: SearchResult;
  onContinue?: (mode: AppMode, content: string) => void;
}

const AnalystResultCard: React.FC<AnalystResultCardProps> = ({ result, onContinue }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(result.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const renderContent = (content: string) => {
    const sections = content.split('\n');
    return sections.map((line, index) => {
      const trimmed = line.trim();
      if (!trimmed) return null;

      // Section Headers
      if (trimmed.includes('Synthesis of Material Innovation')) {
        return (
          <h4 key={index} className="flex items-center gap-3 text-lg font-bold text-violet-900 mt-8 mb-4 border-b border-violet-100 pb-2">
            <TrendingUp className="w-5 h-5 text-violet-600" />
            Material Innovation & Strategy
          </h4>
        );
      }
      if (trimmed.includes('Comparative Performance') || trimmed.includes('Comparative Efficacy')) {
        return (
          <h4 key={index} className="flex items-center gap-3 text-lg font-bold text-violet-900 mt-8 mb-4 border-b border-violet-100 pb-2">
            <Scale className="w-5 h-5 text-violet-600" />
            Performance & Clinical Context
          </h4>
        );
      }
      if (trimmed.includes('Methodological') || trimmed.includes('Knowledge Gaps')) {
        return (
          <h4 key={index} className="flex items-center gap-3 text-lg font-bold text-rose-900 mt-8 mb-4 border-b border-rose-100 pb-2">
            <ShieldAlert className="w-5 h-5 text-rose-600" />
            Critical Gaps & Flaws
          </h4>
        );
      }
      if (trimmed.includes('Regulatory') || trimmed.includes('Outlook')) {
        return (
          <h4 key={index} className="flex items-center gap-3 text-lg font-bold text-violet-900 mt-8 mb-4 border-b border-violet-100 pb-2">
            <Globe className="w-5 h-5 text-violet-600" />
            Translation & Regulatory Path
          </h4>
        );
      }
      
      const cleanLine = trimmed.replace(/\*\*/g, '').replace(/##/g, '').replace(/^-\s/, '');
      
      if (trimmed.startsWith('-') || trimmed.startsWith('*')) {
          return (
            <div key={index} className="flex gap-2 mb-3 items-start group">
                <div className="w-1.5 h-1.5 rounded-full bg-violet-300 mt-2 shrink-0 group-hover:bg-violet-500 transition-colors"></div>
                <p className="text-slate-700 leading-relaxed text-sm">
                    {trimmed.startsWith('- **') || trimmed.startsWith('* **') ? (
                        <>
                           <span className="font-bold text-slate-900">{trimmed.match(/\*\*(.*?)\*\*/)?.[1]}:</span>
                           {" " + trimmed.replace(/^[*-]\s*\*\*.*?\*\*\s*/, '')}
                        </>
                    ) : cleanLine}
                </p>
            </div>
          );
      }

      if (trimmed.startsWith('###')) {
          return <h5 key={index} className="font-bold text-slate-800 text-sm mt-4 mb-2 uppercase tracking-wide">{cleanLine}</h5>;
      }

      return <p key={index} className="text-slate-600 mb-4 leading-relaxed text-sm">{cleanLine}</p>;
    });
  };

  return (
    <div className="w-full bg-white rounded-2xl shadow-xl border border-violet-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="bg-gradient-to-r from-violet-50 to-fuchsia-50 px-6 py-5 border-b border-violet-100 flex justify-between items-center">
        <div className="flex items-center gap-3">
            <div className="bg-white p-2 rounded-xl shadow-sm border border-violet-100 text-violet-600">
                <BrainCircuit className="w-5 h-5" />
            </div>
            <div>
                <h3 className="font-bold text-slate-900 text-base leading-tight">Critical Research Synthesis</h3>
                <p className="text-[10px] text-violet-600 font-bold uppercase tracking-widest mt-0.5">Journal Editorial Grade</p>
            </div>
        </div>
        <div className="flex items-center gap-2">
             <div className="hidden sm:flex items-center gap-1.5 bg-white/80 backdrop-blur px-2 py-1 rounded-lg border border-violet-100 text-[10px] font-bold text-violet-700 uppercase">
                <TrendingUp className="w-3 h-3" />
                Active Gap Map
             </div>
        </div>
      </div>
      
      <div className="p-8">
        <div className="mb-8 bg-slate-50 p-5 rounded-2xl border border-slate-100 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-2 opacity-5">
                <BrainCircuit className="w-24 h-24" />
            </div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-bold mb-2">Analysis Scope</p>
            <p className="text-slate-800 font-serif italic text-base leading-relaxed">
                "{result.originalQuery}"
            </p>
        </div>

        <div className="prose prose-slate max-w-none">
            {renderContent(result.content)}
        </div>

        {/* Source Grounding Display */}
        {result.sources && result.sources.length > 0 && (
          <div className="mt-12 pt-8 border-t border-slate-100">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Globe className="w-3.5 h-3.5" /> High-Impact Citations & Evidence
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {result.sources.map((source, idx) => (
                <a 
                    key={idx} 
                    href={source.uri} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-xl hover:border-violet-200 hover:shadow-sm transition-all group"
                >
                  <div className="min-w-0 flex-1">
                      <span className="text-xs font-bold text-slate-800 group-hover:text-violet-700 truncate block">
                        {source.title}
                      </span>
                      <span className="text-[10px] text-slate-400 truncate block mt-0.5">
                        {new URL(source.uri).hostname}
                      </span>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-300 group-hover:text-violet-400 shrink-0 ml-3" />
                </a>
              ))}
            </div>
          </div>
        )}

        <div className="mt-10 flex flex-col sm:flex-row justify-between items-center gap-4">
            <button 
                onClick={handleCopy}
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 px-6 py-3 rounded-xl font-bold transition-all text-sm"
            >
                {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Synthesis Copied' : 'Copy Full Analysis'}
            </button>
            
            {onContinue && (
                <button
                    onClick={() => onContinue('NOVELTY_GENERATOR', result.content)}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white px-8 py-3 rounded-xl font-bold transition-all text-sm shadow-lg shadow-violet-200"
                >
                    <Lightbulb className="w-4 h-4" />
                    Pivot to Novel Hypothesis
                    <ArrowRightCircle className="w-4 h-4 ml-1 opacity-60" />
                </button>
            )}
        </div>
      </div>
    </div>
  );
};

export default AnalystResultCard;
