import React, { useState } from 'react';
import { Crosshair, Copy, Check, ExternalLink, Globe } from 'lucide-react';
import { SearchResult } from '../types';

interface PrecisionSearchResultCardProps {
  result: SearchResult;
}

const PrecisionSearchResultCard: React.FC<PrecisionSearchResultCardProps> = ({ result }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    // Extract boolean string from content for easy copying
    const match = result.content.match(/`([^`]+)`/);
    const textToCopy = match ? match[1] : result.content;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const renderContent = (content: string) => {
    const lines = content.split('\n');
    return lines.map((line, i) => {
      const trimmed = line.trim();
      if (!trimmed) return <br key={i} />;
      if (trimmed.startsWith('### ')) return <h3 key={i} className="text-xl font-bold text-slate-900 mt-6 mb-3">{trimmed.replace('### ', '')}</h3>;
      if (trimmed.startsWith('- ')) {
        const linkMatch = trimmed.match(/\[(.*?)\]\((.*?)\)/);
        if (linkMatch) {
          return (
            <li key={i} className="ml-5 list-disc mb-2">
              <a href={linkMatch[2]} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline inline-flex items-center gap-1 font-medium">
                {linkMatch[1]} <ExternalLink className="w-3 h-3" />
              </a>
            </li>
          );
        }
        return <li key={i} className="ml-5 list-disc text-slate-700 text-sm mb-1">{trimmed.replace('- ', '')}</li>;
      }
      if (trimmed.startsWith('`')) {
        return (
          <div key={i} className="relative group my-4">
            <pre className="bg-slate-900 text-blue-400 p-4 rounded-xl text-sm font-mono overflow-x-auto border border-slate-700 shadow-inner">
              {trimmed.replace(/`/g, '')}
            </pre>
            <button 
              onClick={handleCopy}
              className="absolute top-2 right-2 bg-slate-800 text-slate-300 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
            >
              {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        );
      }
      return <p key={i} className="text-slate-700 text-sm mb-2 leading-relaxed">{trimmed.replace(/\*\*/g, '')}</p>;
    });
  };

  return (
    <div className="w-full bg-white rounded-2xl shadow-lg border border-blue-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-blue-100 flex justify-between items-center">
        <div className="flex items-center gap-2">
            <div className="bg-white p-1.5 rounded-md shadow-sm border border-blue-100 text-blue-600">
                <Crosshair className="w-4 h-4" />
            </div>
            <h3 className="font-semibold text-slate-800">Precision Search Command</h3>
        </div>
        <div className="text-xs text-blue-700/70 font-mono bg-blue-50 px-2 py-1 rounded border border-blue-100">
            Grounding Active
        </div>
      </div>
      
      <div className="p-6">
        <div className="mb-6 bg-slate-50 p-4 rounded-xl border border-slate-100">
            <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-2">Parameters</p>
            <p className="text-slate-600 italic text-sm">{result.originalQuery}</p>
        </div>

        <div>{renderContent(result.content)}</div>

        {result.sources && result.sources.length > 0 && (
          <div className="mt-8 pt-6 border-t border-slate-100">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Globe className="w-3 h-3" /> Web Reference Sources
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {result.sources.map((source, idx) => (
                <a key={idx} href={source.uri} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-100 rounded-lg hover:border-blue-200 transition-colors group">
                  <span className="text-xs font-medium text-slate-600 group-hover:text-blue-700 truncate mr-2">{source.title}</span>
                  <ExternalLink className="w-3 h-3 text-slate-300" />
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PrecisionSearchResultCard;