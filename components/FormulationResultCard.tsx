import React, { useState } from 'react';
import { Copy, Check, FlaskConical, ExternalLink, Search } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { SearchResult } from '../types';

interface FormulationResultCardProps {
  result: SearchResult;
}

const FormulationResultCard: React.FC<FormulationResultCardProps> = ({ result }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(result.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full bg-white rounded-2xl shadow-lg border border-cyan-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-gradient-to-r from-cyan-50 to-sky-50 px-6 py-4 border-b border-cyan-100 flex justify-between items-center">
        <div className="flex items-center gap-2">
            <div className="bg-white p-1.5 rounded-md shadow-sm border border-cyan-100 text-cyan-600">
                <FlaskConical className="w-4 h-4" />
            </div>
            <h3 className="font-semibold text-slate-800">Chemical Formula & Recipe</h3>
        </div>
        <a 
            href="https://pubchem.ncbi.nlm.nih.gov/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs font-semibold text-cyan-700 bg-white border border-cyan-200 px-3 py-1.5 rounded-lg hover:bg-cyan-50 transition-colors shadow-sm"
        >
            <span>Search PubChem</span>
            <ExternalLink className="w-3 h-3" />
        </a>
      </div>
      
      <div className="p-6">
        <div className="mb-6">
            <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-2">Target Formulation</p>
            <p className="text-slate-800 font-medium italic border-l-4 border-cyan-200 pl-4 py-1 bg-cyan-50/50 rounded-r-lg">
                "{result.originalQuery}"
            </p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm prose prose-sm max-w-none prose-headings:text-cyan-900 prose-a:text-cyan-600">
            <ReactMarkdown>{result.content}</ReactMarkdown>
        </div>

        <div className="mt-6 flex justify-end gap-3">
            <a 
                href={`https://pubchem.ncbi.nlm.nih.gov/#query=${encodeURIComponent(result.originalQuery)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm shadow-sm"
            >
                <Search className="w-4 h-4" />
                Find on PubChem
            </a>
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
