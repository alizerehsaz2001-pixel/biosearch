import React, { useState } from 'react';
import { BrainCircuit, Copy, Check, TrendingUp, AlertTriangle, Lightbulb, Scale, ArrowRightCircle } from 'lucide-react';
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

  // Basic Markdown parser for analysis structure
  const renderContent = (content: string) => {
    const sections = content.split('\n');
    return sections.map((line, index) => {
      const trimmed = line.trim();
      if (!trimmed) return null;

      if (trimmed.includes('Material Trends')) {
        return (
          <h4 key={index} className="flex items-center gap-2 text-lg font-bold text-violet-800 mt-6 mb-3">
            <TrendingUp className="w-5 h-5" />
            Material Trends
          </h4>
        );
      }
      if (trimmed.includes('Performance Comparison')) {
        return (
          <h4 key={index} className="flex items-center gap-2 text-lg font-bold text-violet-800 mt-6 mb-3">
            <Scale className="w-5 h-5" />
            Performance Comparison
          </h4>
        );
      }
      if (trimmed.includes('Methodological Flaws') || trimmed.includes('Gaps')) {
        return (
          <h4 key={index} className="flex items-center gap-2 text-lg font-bold text-violet-800 mt-6 mb-3">
            <AlertTriangle className="w-5 h-5" />
            Methodological Flaws & Gaps
          </h4>
        );
      }
      if (trimmed.includes('Conclusion') || trimmed.includes('Next Step')) {
        return (
          <h4 key={index} className="flex items-center gap-2 text-lg font-bold text-violet-800 mt-6 mb-3">
            <Lightbulb className="w-5 h-5" />
            Conclusion & Future Direction
          </h4>
        );
      }
      
      // Clean up markdown syntax for display
      const cleanLine = trimmed.replace(/\*\*/g, '').replace(/##/g, '').replace(/^-\s/, '');
      
      if (trimmed.startsWith('-') || trimmed.startsWith('*')) {
          return <li key={index} className="ml-4 list-disc text-slate-700 mb-1 leading-relaxed text-sm">{cleanLine}</li>
      }

      return <p key={index} className="text-slate-700 mb-2 leading-relaxed text-sm">{cleanLine}</p>;
    });
  };

  return (
    <div className="w-full bg-white rounded-2xl shadow-lg border border-violet-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-gradient-to-r from-violet-50 to-fuchsia-50 px-6 py-4 border-b border-violet-100 flex justify-between items-center">
        <div className="flex items-center gap-2">
            <div className="bg-white p-1.5 rounded-md shadow-sm border border-violet-100 text-violet-600">
                <BrainCircuit className="w-4 h-4" />
            </div>
            <h3 className="font-semibold text-slate-800">Critical Research Analysis</h3>
        </div>
        <div className="text-xs text-violet-700/70 font-mono bg-violet-50 px-2 py-1 rounded border border-violet-100">
            Journal Reviewer Mode
        </div>
      </div>
      
      <div className="p-6">
        <div className="mb-6 bg-slate-50 p-4 rounded-xl border border-slate-100">
            <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-2">Input Summary</p>
            <p className="text-slate-600 italic text-sm line-clamp-3">
                "{result.originalQuery}"
            </p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            {renderContent(result.content)}
        </div>

        <div className="mt-6 flex justify-between items-center">
            <button 
                onClick={handleCopy}
                className="flex items-center gap-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 px-4 py-2 rounded-lg font-medium transition-colors text-sm"
            >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied' : 'Copy Analysis'}
            </button>
            
            {onContinue && (
                <button
                    onClick={() => onContinue('NOVELTY_GENERATOR', result.content)}
                    className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-5 py-2 rounded-lg font-medium transition-colors text-sm shadow-md"
                >
                    <Lightbulb className="w-4 h-4" />
                    Generate Novel Ideas
                </button>
            )}
        </div>
      </div>
    </div>
  );
};

export default AnalystResultCard;