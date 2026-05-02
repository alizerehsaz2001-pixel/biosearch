
import React, { useState } from 'react';
import { Crosshair, Copy, Check, ExternalLink, Globe, Database, Search as SearchIcon, FileText, Info } from 'lucide-react';
import { SearchResult } from '../types';

interface PrecisionSearchResultCardProps {
  result: SearchResult;
}

interface SearchLink {
  platform: string;
  url: string;
  type: string;
}

interface PrecisionSearchData {
  query: string;
  explanation: string;
  links: SearchLink[];
}

const PrecisionSearchResultCard: React.FC<PrecisionSearchResultCardProps> = ({ result }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const parseJson = (str: string) => {
    try {
      return JSON.parse(str);
    } catch (e) {
      const jsonMatch = str.match(/```json\s*([\s\S]*?)\s*```/) || str.match(/```\s*([\s\S]*?)\s*```/);
      if (jsonMatch && jsonMatch[1]) {
        try {
          return JSON.parse(jsonMatch[1]);
        } catch (innerE) {
          return null;
        }
      }
      return null;
    }
  };

  const renderLegacyContent = (content: string) => {
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
              onClick={() => handleCopy(trimmed.replace(/`/g, ''))}
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

  const renderContent = () => {
    const data = parseJson(result.content) as PrecisionSearchData | null;

    if (!data) {
        return renderLegacyContent(result.content);
    }

    const getIconForType = (type: string) => {
        if (type.toLowerCase().includes('database')) return <Database className="w-5 h-5 text-indigo-400" />;
        if (type.toLowerCase().includes('publisher')) return <FileText className="w-5 h-5 text-indigo-400" />;
        return <SearchIcon className="w-5 h-5 text-indigo-400" />;
    };

    return (
        <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-5">
                <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                    <div>
                        <h4 className="text-sm font-bold text-blue-900 mb-1">Search Strategy</h4>
                        <p className="text-sm text-blue-800/80 leading-relaxed">{data.explanation}</p>
                    </div>
                </div>
            </div>

            <div className="space-y-3">
                <h4 className="text-sm font-bold text-slate-800 uppercase tracking-widest flex items-center gap-2">
                    <Database className="w-4 h-4 text-blue-600" /> Boolean Query
                </h4>
                <div className="relative group">
                    <pre className="bg-slate-900 text-blue-400 p-5 rounded-xl text-sm font-mono overflow-x-auto border border-slate-700 shadow-inner whitespace-pre-wrap break-all leading-relaxed">
                        {data.query}
                    </pre>
                    <button 
                        onClick={() => handleCopy(data.query)}
                        className="absolute top-3 right-3 bg-slate-800/80 hover:bg-slate-700 text-slate-300 p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all shadow-sm border border-slate-600 flex items-center gap-2 backdrop-blur-sm"
                    >
                        {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                        <span className="text-xs font-semibold">{copied ? 'Copied' : 'Copy Query'}</span>
                    </button>
                </div>
            </div>

            {data.links && data.links.length > 0 && (
                <div className="space-y-4 pt-2">
                    <h4 className="text-sm font-bold text-slate-800 uppercase tracking-widest flex items-center gap-2">
                        <ExternalLink className="w-4 h-4 text-blue-600" /> Direct Search Links
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {data.links.map((link, idx) => (
                            <a 
                                key={idx}
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group flex flex-col gap-2 p-4 bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md hover:border-indigo-300 transition-all cursor-pointer"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="bg-indigo-50 p-2 rounded-lg group-hover:bg-indigo-100 transition-colors">
                                        {getIconForType(link.type)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h5 className="font-bold text-slate-800 truncate group-hover:text-indigo-700 transition-colors">
                                            {link.platform}
                                        </h5>
                                        <p className="text-xs text-slate-500 uppercase tracking-wide">
                                            {link.type}
                                        </p>
                                    </div>
                                </div>
                                <div className="mt-2 text-xs font-medium text-indigo-600 flex items-center gap-1 opacity-80 group-hover:opacity-100">
                                    Execute Search <ExternalLink className="w-3 h-3" />
                                </div>
                            </a>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
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
        <div className="text-xs text-blue-700/70 font-mono bg-blue-50 px-2 py-1 rounded border border-blue-100 flex items-center gap-1">
            <Check className="w-3 h-3" /> Grounding Active
        </div>
      </div>
      
      <div className="p-6">
        <div className="mb-8 bg-slate-50 p-5 rounded-xl border border-slate-100">
            <p className="text-xs uppercase tracking-wider text-slate-500 font-bold mb-2 flex items-center gap-1.5">
               <Crosshair className="w-3.5 h-3.5" /> Search Directive
            </p>
            <p className="text-slate-700 font-medium whitespace-pre-wrap">{result.originalQuery}</p>
        </div>

        <div>{renderContent()}</div>

        {result.sources && result.sources.length > 0 && (
          <div className="mt-10 pt-6 border-t border-slate-100">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Globe className="w-3 h-3" /> Web Reference Sources
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {result.sources.map((source, idx) => (
                <a key={idx} href={source.uri} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-lg hover:border-blue-200 hover:shadow-sm transition-all group">
                  <span className="text-xs font-medium text-slate-600 group-hover:text-blue-700 truncate mr-2">{source.title}</span>
                  <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-blue-500" />
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
