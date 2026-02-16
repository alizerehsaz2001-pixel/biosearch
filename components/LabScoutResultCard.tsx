import React, { useState } from 'react';
import { GraduationCap, MapPin, FlaskConical, BookOpen, Search, Copy, Check } from 'lucide-react';
import { SearchResult } from '../types';

interface LabScoutResultCardProps {
  result: SearchResult;
}

const LabScoutResultCard: React.FC<LabScoutResultCardProps> = ({ result }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(result.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Parser to separate the list of labs
  const renderLabs = (content: string) => {
    const sections = content.split('###').filter(s => s.trim().length > 0);
    
    return sections.map((section, index) => {
        const lines = section.trim().split('\n');
        const header = lines[0].replace(/^\d+\.\s*/, '').replace(/^\*\*/, '').replace(/\*\*$/, '');
        
        // Extract fields
        const labName = lines.find(l => l.includes('Lab Name'))?.split('**Lab Name:**')[1]?.trim() || '';
        const paper = lines.find(l => l.includes('Key Recent Paper'))?.split('**Key Recent Paper:**')[1]?.trim() || '';
        const focus = lines.find(l => l.includes('Research Focus'))?.split('**Research Focus:**')[1]?.trim() || '';
        const reason = lines.find(l => l.includes('Why Match'))?.split('**Why Match:**')[1]?.trim() || '';
        const website = lines.find(l => l.includes('Website/Profile'))?.split('**Website/Profile:**')[1]?.trim() || '';

        return (
            <div key={index} className="bg-white rounded-xl border border-orange-100 p-5 shadow-sm hover:shadow-md transition-shadow duration-300">
                <div className="flex items-start gap-3 mb-4">
                    <div className="bg-orange-100 p-2 rounded-lg text-orange-600 shrink-0 mt-1">
                        <GraduationCap className="w-5 h-5" />
                    </div>
                    <div>
                        <h4 className="text-lg font-bold text-slate-800 leading-tight">
                            {header}
                        </h4>
                        {labName && (
                            <p className="text-sm text-slate-500 font-medium mt-1 flex items-center gap-1">
                                <FlaskConical className="w-3 h-3" /> {labName}
                            </p>
                        )}
                    </div>
                </div>
                
                <div className="space-y-3">
                     {focus && (
                        <div className="text-sm text-slate-700">
                            <span className="font-semibold text-orange-800 text-xs uppercase tracking-wide block mb-1">Focus</span>
                            {focus}
                        </div>
                    )}

                    {paper && (
                        <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                             <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-1 flex items-center gap-1">
                                <BookOpen className="w-3 h-3" /> Recent Key Paper
                             </p>
                             <p className="text-slate-700 text-sm italic">"{paper}"</p>
                        </div>
                    )}
                    
                    {reason && (
                        <div className="flex items-start gap-2 pt-2 border-t border-slate-100">
                            <Search className="w-4 h-4 text-orange-400 mt-0.5" />
                            <div>
                                <span className="text-xs font-semibold text-slate-500 uppercase">Why Match:</span>
                                <p className="text-sm text-slate-600 mt-0.5">{reason}</p>
                            </div>
                        </div>
                    )}
                     {website && website !== 'N/A' && (
                        <div className="pt-2 text-xs text-blue-600 truncate">
                            {website}
                        </div>
                    )}
                </div>
            </div>
        );
    });
  };

  return (
    <div className="w-full bg-slate-50 rounded-2xl shadow-lg border border-orange-200 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-gradient-to-r from-orange-50 to-amber-50 px-6 py-4 border-b border-orange-100 flex justify-between items-center">
        <div className="flex items-center gap-2">
            <div className="bg-white p-1.5 rounded-md shadow-sm border border-orange-100 text-orange-600">
                <MapPin className="w-4 h-4" />
            </div>
            <h3 className="font-semibold text-slate-800">Lab & Supervisor Scout</h3>
        </div>
        <div className="text-xs text-orange-700/70 font-mono bg-orange-50 px-2 py-1 rounded border border-orange-100">
            Academic Headhunter
        </div>
      </div>
      
      <div className="p-6">
        <div className="mb-6">
            <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-2">Search Parameters</p>
            <p className="text-slate-600 italic text-sm line-clamp-2">
                "{result.originalQuery}"
            </p>
        </div>

        <div className="grid grid-cols-1 gap-6">
            {renderLabs(result.content)}
        </div>

        <div className="mt-8 flex justify-end">
            <button 
                onClick={handleCopy}
                className="flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-4 py-2 rounded-lg font-medium transition-colors text-sm shadow-sm"
            >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied' : 'Copy List'}
            </button>
        </div>
      </div>
    </div>
  );
};

export default LabScoutResultCard;