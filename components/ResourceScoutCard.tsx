import React from 'react';
import { Compass, ExternalLink, AlertCircle, BookOpen, GraduationCap, Server } from 'lucide-react';
import { SearchResult } from '../types';

interface ResourceScoutCardProps {
  result: SearchResult;
}

interface ResourceData {
  analysis: string;
  recommendations: { name: string; reason: string }[];
  links: {
    pubmed?: string;
    google_scholar?: string;
    sciencedirect?: string;
    springer?: string;
    [key: string]: string | undefined;
  };
}

const ResourceScoutCard: React.FC<ResourceScoutCardProps> = ({ result }) => {
  let data: ResourceData | null = null;
  
  try {
    const content = result.content.replace(/```json\n?|\n?```/g, "").trim();
    data = JSON.parse(content);
  } catch (e) {
    console.error("Failed to parse JSON content for resource scout result");
  }

  if (!data) {
    return (
        <div className="w-full bg-red-50 rounded-2xl p-6 border border-red-200 text-red-700">
            <p className="font-semibold flex items-center gap-2">
                <AlertCircle className="w-5 h-5"/> Error parsing result
            </p>
            <pre className="mt-2 text-xs opacity-75 whitespace-pre-wrap">{result.content}</pre>
        </div>
    );
  }

  return (
    <div className="w-full bg-white rounded-2xl shadow-lg border border-emerald-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 px-6 py-4 border-b border-emerald-100 flex justify-between items-center">
        <div className="flex items-center gap-2">
            <div className="bg-white p-1.5 rounded-md shadow-sm border border-emerald-100 text-emerald-600">
                <Compass className="w-4 h-4" />
            </div>
            <h3 className="font-semibold text-slate-800">Resource Scout Recommendation</h3>
        </div>
        <div className="text-xs text-emerald-700/70 font-mono bg-emerald-50 px-2 py-1 rounded border border-emerald-100">
            Smart Library Agent
        </div>
      </div>
      
      <div className="p-6">
        <div className="mb-6 bg-slate-50 p-4 rounded-xl border border-slate-100">
            <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-2 flex items-center gap-1">
                <BookOpen className="w-3 h-3" /> Topic Analysis
            </p>
            <p className="text-slate-700 text-sm leading-relaxed">
                {data.analysis}
            </p>
        </div>

        {/* Database Recommendations */}
        <div className="mb-6">
            <h4 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-emerald-600" />
                Recommended Databases for Your Query
            </h4>
            <div className="space-y-3">
                {data.recommendations.map((rec, idx) => (
                    <div key={idx} className="border border-emerald-100 rounded-lg p-3 bg-emerald-50/30">
                        <p className="font-bold text-slate-800 text-sm">{rec.name}</p>
                        <p className="text-slate-600 text-xs mt-1">{rec.reason}</p>
                    </div>
                ))}
            </div>
        </div>

        {/* Advanced: How to choose */}
        <div className="mb-8 p-5 bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl shadow-inner border border-slate-700">
            <div className="flex items-center gap-2 mb-4">
                <div className="bg-emerald-500/20 p-1.5 rounded text-emerald-400">
                    <Server className="w-4 h-4" />
                </div>
                <h4 className="text-sm font-bold text-emerald-300 tracking-wide uppercase">
                    Advanced: How to Choose
                </h4>
            </div>
            <p className="text-slate-300 text-sm mb-4 font-medium">
                For your field (biomedical engineering + smart implants), the optimal stack is:
            </p>
            <div className="space-y-2.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between text-sm py-2 border-b border-slate-700/50">
                    <span className="text-slate-400">Material discovery / sustainability</span>
                    <span className="font-mono text-emerald-400 font-semibold mt-1 sm:mt-0 flex items-center gap-2">
                        <span className="text-emerald-500/50 hidden sm:inline">→</span> Materiom
                    </span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between text-sm py-2 border-b border-slate-700/50">
                    <span className="text-slate-400">Medical validation / regulatory relevance</span>
                    <span className="font-mono text-emerald-400 font-semibold mt-1 sm:mt-0 flex items-center gap-2">
                        <span className="text-emerald-500/50 hidden sm:inline">→</span> BIOMATDB
                    </span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between text-sm py-2 border-b border-slate-700/50">
                    <span className="text-slate-400">Cell–material interaction / tissue engineering</span>
                    <span className="font-mono text-emerald-400 font-semibold mt-1 sm:mt-0 flex items-center gap-2">
                        <span className="text-emerald-500/50 hidden sm:inline">→</span> cBiT
                    </span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between text-sm py-2 border-b border-slate-700/50">
                    <span className="text-slate-400">Chemistry + synthesis + polymers</span>
                    <span className="font-mono text-emerald-400 font-semibold mt-1 sm:mt-0 flex items-center gap-2">
                        <span className="text-emerald-500/50 hidden sm:inline">→</span> Reaxys
                    </span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between text-sm py-2 border-b border-transparent">
                    <span className="text-slate-400">Mechanical + structural properties</span>
                    <span className="font-mono text-emerald-400 font-semibold mt-1 sm:mt-0 flex items-center gap-2">
                        <span className="text-emerald-500/50 hidden sm:inline">→</span> SpringerMaterials / MATDAT
                    </span>
                </div>
            </div>
        </div>

        {/* Direct Action Links */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {data.links.pubmed && (
                <a 
                    href={data.links.pubmed} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-white hover:border-blue-300 hover:shadow-sm transition-all group"
                >
                    <span className="font-medium text-slate-700 group-hover:text-blue-700 text-sm">Open PubMed</span>
                    <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-blue-500" />
                </a>
            )}
            {data.links.google_scholar && (
                <a 
                    href={data.links.google_scholar} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-white hover:border-indigo-300 hover:shadow-sm transition-all group"
                >
                    <span className="font-medium text-slate-700 group-hover:text-indigo-700 text-sm">Open Google Scholar</span>
                    <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-indigo-500" />
                </a>
            )}
            {data.links.sciencedirect && (
                 <a 
                    href={data.links.sciencedirect} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-white hover:border-orange-300 hover:shadow-sm transition-all group"
                >
                    <span className="font-medium text-slate-700 group-hover:text-orange-700 text-sm">Open ScienceDirect</span>
                    <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-orange-500" />
                </a>
            )}
            {data.links.springer && (
                 <a 
                    href={data.links.springer} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-white hover:border-teal-300 hover:shadow-sm transition-all group"
                >
                    <span className="font-medium text-slate-700 group-hover:text-teal-700 text-sm">Open SpringerLink</span>
                    <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-teal-500" />
                </a>
            )}
        </div>

      </div>
    </div>
  );
};

export default ResourceScoutCard;