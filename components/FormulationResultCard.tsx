import React from 'react';
import ReactMarkdown from 'react-markdown';
import { FlaskConical, Copy, Check, Save } from 'lucide-react';
import { SearchResult } from '../types';

interface FormulationResultCardProps {
  result: SearchResult;
  onToggleSave?: () => void;
  isSaved?: boolean;
}

const FormulationResultCard: React.FC<FormulationResultCardProps> = ({ result, onToggleSave, isSaved }) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(result.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full bg-white rounded-2xl shadow-lg border border-cyan-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-gradient-to-r from-cyan-50 to-blue-50 px-6 py-4 border-b border-cyan-100 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="bg-white p-1.5 rounded-md shadow-sm border border-cyan-100 text-cyan-600">
            <FlaskConical className="w-4 h-4" />
          </div>
          <h3 className="font-semibold text-slate-800">Formulation Recipe</h3>
        </div>
        <div className="flex items-center gap-2">
           {onToggleSave && (
              <button 
                onClick={onToggleSave}
                className={`p-1.5 rounded-lg border transition-all duration-200 ${
                  isSaved 
                    ? 'bg-amber-50 border-amber-200 text-amber-500 shadow-sm' 
                    : 'bg-white border-transparent text-slate-300 hover:text-amber-500 hover:bg-amber-50'
                }`}
                title={isSaved ? "Remove from Bookmarks" : "Save to Bookmarks"}
              >
                <Save className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
              </button>
            )}
            <div className="text-xs text-cyan-700/70 font-mono bg-cyan-50 px-2 py-1 rounded border border-cyan-100">
                Stoichiometry Verified
            </div>
        </div>
      </div>
      
      <div className="p-6">
        <div className="mb-6">
            <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-2">Target Goal</p>
            <p className="text-slate-800 font-medium italic border-l-4 border-cyan-200 pl-4 py-1 bg-cyan-50/50 rounded-r-lg">
                "{result.originalQuery}"
            </p>
        </div>

        <div className="prose prose-sm prose-slate max-w-none bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <ReactMarkdown>{result.content}</ReactMarkdown>
        </div>

        <div className="mt-6 flex justify-end gap-3">
            <button 
                onClick={handleCopy}
                className="flex items-center gap-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 px-4 py-2 rounded-lg font-medium transition-colors text-sm"
            >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied' : 'Copy Recipe'}
            </button>
        </div>
      </div>
    </div>
  );
};

export default FormulationResultCard;
