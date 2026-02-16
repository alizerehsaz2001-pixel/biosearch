import React from 'react';
import { Unlock, ExternalLink, FileText, Search } from 'lucide-react';
import { SearchResult } from '../types';

interface OpenAccessResultCardProps {
  result: SearchResult;
}

interface OpenAccessData {
  doi: string;
  title: string;
  links: {
    unpaywall?: string;
    core?: string;
    google_scholar?: string;
    biorxiv?: string;
    [key: string]: string | undefined;
  };
  status_explanation: string;
  alternative_text: string;
}

const OpenAccessResultCard: React.FC<OpenAccessResultCardProps> = ({ result }) => {
  let data: OpenAccessData | null = null;
  try {
    data = JSON.parse(result.content);
  } catch (e) {
    console.error("JSON Parse Error");
  }

  if (!data) return <div className="p-4 text-red-500 bg-red-50 rounded-lg border border-red-200">Error parsing open access result</div>;

  return (
    <div className="w-full bg-white rounded-2xl shadow-lg border border-teal-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="bg-gradient-to-r from-teal-50 to-emerald-50 px-6 py-4 border-b border-teal-100 flex justify-between items-center">
            <div className="flex items-center gap-2">
                <div className="bg-white p-1.5 rounded-md shadow-sm border border-teal-100 text-teal-600">
                    <Unlock className="w-4 h-4" />
                </div>
                <h3 className="font-semibold text-slate-800">Open Access Finder</h3>
            </div>
            <div className="text-xs text-teal-700/70 font-mono bg-teal-50 px-2 py-1 rounded border border-teal-100">
                Legal PDF Scanner
            </div>
        </div>
        <div className="p-6">
            <div className="mb-6 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-2">Input Article</p>
                <p className="text-slate-700 font-medium line-clamp-2">"{data.title !== 'N/A' ? data.title : result.originalQuery}"</p>
                {data.doi !== 'N/A' && <p className="text-slate-500 text-xs font-mono mt-1">DOI: {data.doi}</p>}
            </div>

            <div className="grid gap-3 mb-6">
                <h4 className="text-sm font-semibold text-slate-800">Direct Access Links</h4>
                {data.links.unpaywall && (
                    <a href={data.links.unpaywall} target="_blank" rel="noreferrer" className="flex items-center justify-between p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors group">
                        <span className="flex items-center gap-2 text-sm font-medium text-slate-700 group-hover:text-teal-700"><FileText className="w-4 h-4 text-slate-400 group-hover:text-teal-500"/> Check Unpaywall API</span>
                        <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-teal-500"/>
                    </a>
                )}
                 {data.links.core && (
                    <a href={data.links.core} target="_blank" rel="noreferrer" className="flex items-center justify-between p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors group">
                        <span className="flex items-center gap-2 text-sm font-medium text-slate-700 group-hover:text-teal-700"><Search className="w-4 h-4 text-slate-400 group-hover:text-teal-500"/> Search Core.ac.uk</span>
                        <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-teal-500"/>
                    </a>
                )}
                 {data.links.google_scholar && (
                    <a href={data.links.google_scholar} target="_blank" rel="noreferrer" className="flex items-center justify-between p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors group">
                        <span className="flex items-center gap-2 text-sm font-medium text-slate-700 group-hover:text-teal-700"><Search className="w-4 h-4 text-slate-400 group-hover:text-teal-500"/> Search Google Scholar</span>
                        <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-teal-500"/>
                    </a>
                )}
                 {data.links.biorxiv && data.links.biorxiv !== 'null' && (
                    <a href={data.links.biorxiv} target="_blank" rel="noreferrer" className="flex items-center justify-between p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors group">
                        <span className="flex items-center gap-2 text-sm font-medium text-slate-700 group-hover:text-teal-700"><FileText className="w-4 h-4 text-slate-400 group-hover:text-teal-500"/> Check bioRxiv/medRxiv</span>
                        <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-teal-500"/>
                    </a>
                )}
            </div>

            <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl mb-4">
                 <p className="text-sm text-emerald-800 font-semibold mb-1">Status Analysis</p>
                 <p className="text-sm text-emerald-700">{data.status_explanation}</p>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl">
                 <p className="text-xs uppercase font-bold text-slate-500 mb-1">Alternative Strategy</p>
                 <p className="text-sm text-slate-600">{data.alternative_text}</p>
            </div>
        </div>
    </div>
  );
};
export default OpenAccessResultCard;