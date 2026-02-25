
import React, { useState } from 'react';
import { Copy, Check, Database, ExternalLink, ArrowRightCircle, Quote, Star, Search, Save } from 'lucide-react';
import { SearchResult, AppMode } from '../types';

interface ResultCardProps {
  result: SearchResult;
  onContinue?: (mode: AppMode, content: string) => void;
  onToggleSave?: () => void;
  isSaved?: boolean;
}

const ResultCard: React.FC<ResultCardProps> = ({ result, onContinue, onToggleSave, isSaved }) => {
  const [copied, setCopied] = useState(false);
  // Placeholder citation count for demonstration
  const citationCount = 142;

  const handleCopy = () => {
    navigator.clipboard.writeText(result.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const pubMedLink = `https://pubmed.ncbi.nlm.nih.gov/?term=${encodeURIComponent(result.content)}`;
  // Scopus standard search result URL pattern
  const scopusLink = `https://www.scopus.com/results/results.uri?s=${encodeURIComponent(result.content)}&src=s&sot=b`;

  return (
    <div className="w-full bg-white rounded-2xl shadow-lg border border-indigo-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-gradient-to-r from-indigo-50 to-slate-50 px-6 py-4 border-b border-indigo-100 flex justify-between items-center">
        <div className="flex items-center gap-2">
            <div className="bg-white p-1.5 rounded-md shadow-sm border border-indigo-100 text-indigo-600">
                <Database className="w-4 h-4" />
            </div>
            <h3 className="font-semibold text-slate-800">Generated Search String</h3>
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
                <Star className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
              </button>
            )}
            <div className="text-xs text-indigo-700 font-medium bg-white px-2 py-1 rounded border border-indigo-200 flex items-center gap-1 shadow-sm">
                <Quote className="w-3 h-3" />
                <span>{citationCount} Citations</span>
            </div>
            <div className="text-xs text-indigo-600/70 font-mono bg-indigo-50 px-2 py-1 rounded border border-indigo-100 hidden sm:block">
                PubMed / Scopus Compatible
            </div>
        </div>
      </div>
      
      <div className="p-6">
        <div className="mb-4">
            <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-2">Original Topic</p>
            <p className="text-slate-700 italic border-l-2 border-slate-200 pl-3 py-1">
                "{result.originalQuery}"
            </p>
        </div>

        <div className="relative group">
          <pre className="bg-slate-900 text-slate-100 p-5 rounded-xl text-sm leading-relaxed whitespace-pre-wrap font-mono custom-scrollbar overflow-x-auto border border-slate-800 shadow-inner min-h-[100px]">
            {result.content}
          </pre>
          
          <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <button
              onClick={handleCopy}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white p-2 rounded-lg border border-slate-700 transition-colors shadow-lg backdrop-blur-sm"
              title="Copy to clipboard"
            >
              {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {result.explanation && (
            <div className="mt-4 p-4 bg-indigo-50 border border-indigo-100 rounded-xl text-sm text-slate-700">
                <p className="font-semibold text-indigo-900 mb-1">Strategy Explanation:</p>
                <p>{result.explanation}</p>
            </div>
        )}

        {/* Action Buttons Grid */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-4 gap-3">
            <button 
                onClick={handleCopy}
                className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-lg font-semibold transition-all text-sm shadow-md shadow-indigo-100"
            >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied!' : 'Copy Query'}
            </button>
            
            {onToggleSave && (
              <button 
                  onClick={onToggleSave}
                  className={`flex items-center justify-center gap-2 py-2.5 rounded-lg font-medium transition-colors text-sm shadow-sm border ${
                    isSaved 
                      ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100' 
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
              >
                  <Save className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
                  {isSaved ? 'Saved' : 'Save String'}
              </button>
            )}

            <a 
                href={pubMedLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 py-2.5 rounded-lg font-medium transition-colors text-sm shadow-sm"
            >
                <Search className="w-4 h-4 text-indigo-500" />
                Test in PubMed
                <ExternalLink className="w-3 h-3 opacity-40" />
            </a>
            <a 
                href={scopusLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 py-2.5 rounded-lg font-medium transition-colors text-sm shadow-sm"
            >
                <Database className="w-4 h-4 text-orange-500" />
                Test in Scopus
                <ExternalLink className="w-3 h-3 opacity-40" />
            </a>
        </div>
        
        {onContinue && (
          <div className="mt-4 pt-4 border-t border-slate-100">
             <button
               onClick={() => onContinue('PICO_PROTOCOL', result.originalQuery)}
               className="w-full flex items-center justify-center gap-2 text-slate-500 hover:text-teal-600 hover:bg-teal-50 py-2 rounded-lg transition-colors text-sm font-medium"
             >
               <span>Next Step: Define PICO Protocol</span>
               <ArrowRightCircle className="w-4 h-4" />
             </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResultCard;
