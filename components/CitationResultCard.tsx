
import React from 'react';
import { BookOpen, Copy, Check, Quote, Map } from 'lucide-react';
import { SearchResult } from '../types';
import ReactMarkdown from 'react-markdown';

interface CitationResultCardProps {
  result: SearchResult;
}

const CitationResultCard: React.FC<CitationResultCardProps> = ({ result }) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(result.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full bg-white rounded-2xl shadow-lg border border-emerald-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 px-6 py-4 border-b border-emerald-100 flex justify-between items-center">
        <div className="flex items-center gap-2">
            <div className="bg-white p-1.5 rounded-md shadow-sm border border-emerald-100 text-emerald-600">
                <BookOpen className="w-4 h-4" />
            </div>
            <h3 className="font-semibold text-slate-800">Citation & Answer</h3>
        </div>
        <div className="text-xs text-emerald-700/70 font-mono bg-emerald-50 px-2 py-1 rounded border border-emerald-100 flex items-center gap-1">
            <Map className="w-3 h-3" />
            Reference Map
        </div>
      </div>
      
      <div className="p-6">
        <div className="mb-6 bg-slate-50 p-4 rounded-xl border border-slate-100">
            <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-2">Your Question</p>
            <p className="text-slate-700 italic">"{result.originalQuery}"</p>
        </div>

        <div className="prose prose-slate max-w-none text-sm leading-relaxed">
            <ReactMarkdown>{result.content}</ReactMarkdown>
        </div>

        <div className="mt-8 flex justify-end">
            <button 
                onClick={handleCopy}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-lg font-medium transition-all text-sm shadow-md"
            >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copied' : 'Copy Citation & Answer'}</span>
            </button>
        </div>
      </div>
    </div>
  );
};

export default CitationResultCard;
