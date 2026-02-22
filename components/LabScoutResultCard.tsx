import React, { useState } from 'react';
import { GraduationCap, MapPin, FlaskConical, BookOpen, Search, Copy, Check, Globe, Link as LinkIcon, User, ExternalLink } from 'lucide-react';
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

  const renderContent = (content: string) => {
    // Check for Region header
    const regionMatch = content.match(/### 🌍 Region: (.*)/);
    const region = regionMatch ? regionMatch[1].trim() : '';
    
    // Split by #### to get individual labs. 
    // The first element might be the region header or empty if split includes it.
    const sections = content.split('####').slice(1);

    return (
        <div>
            {region && (
                <div className="mb-6 p-4 bg-orange-50 border border-orange-100 rounded-xl flex items-center gap-2 shadow-sm">
                    <span className="text-xl">🌍</span>
                    <h3 className="font-bold text-slate-800 text-lg">Target Region: <span className="text-orange-700">{region}</span></h3>
                </div>
            )}
            
            <div className="grid grid-cols-1 gap-6">
                {sections.map((section, index) => {
                    const lines = section.trim().split('\n');
                    // Extract Lab Name from header "1. Lab Name: Bio-Interface Lab"
                    const titleLine = lines[0].replace(/^\d+\.\s*(Lab Name:)?\s*/, '').trim();
                    
                    const university = lines.find(l => l.includes('**University:**'))?.split('**University:**')[1]?.trim() || '';
                    const pi = lines.find(l => l.includes('**Principal Investigator:**'))?.split('**Principal Investigator:**')[1]?.trim() || '';
                    const city = lines.find(l => l.includes('**City:**'))?.split('**City:**')[1]?.trim() || '';
                    const country = lines.find(l => l.includes('**Country:**'))?.split('**Country:**')[1]?.trim() || '';
                    const match = lines.find(l => l.includes('**Research Match:**'))?.split('**Research Match:**')[1]?.trim() || '';
                    const highlight = lines.find(l => l.includes('**Recent Highlight:**'))?.split('**Recent Highlight:**')[1]?.trim() || '';
                    const link = lines.find(l => l.includes('**Official Link:**'))?.split('**Official Link:**')[1]?.trim() || '';

                    // Construct Search URLs
                    const scholarProfileUrl = pi && university 
                        ? `https://scholar.google.com/scholar?q=${encodeURIComponent(pi + " " + university)}` 
                        : null;
                    const paperSearchUrl = highlight 
                        ? `https://scholar.google.com/scholar?q=${encodeURIComponent(highlight)}` 
                        : null;
                    
                    // Find map source if available
                    const mapSource = result.sources?.find(s => s.type === 'map' && (s.title.includes(university) || s.title.includes(city)));
                    const mapUrl = mapSource ? mapSource.uri : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${university} ${city} ${country}`)}`;

                    return (
                        <div key={index} className="bg-white rounded-xl border border-orange-100 p-5 shadow-sm hover:shadow-md transition-shadow duration-300">
                             <div className="flex items-start gap-3 mb-4 border-b border-orange-50 pb-3">
                                <div className="bg-orange-100 p-2.5 rounded-lg text-orange-600 shrink-0 mt-1">
                                    <FlaskConical className="w-5 h-5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-lg font-bold text-slate-800 leading-tight mb-1">
                                        {titleLine}
                                    </h4>
                                    {university && (
                                        <p className="text-sm text-slate-500 font-medium flex items-center gap-1.5">
                                            <GraduationCap className="w-4 h-4" /> 
                                            {university}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {pi && (
                                        <div className="flex items-center gap-2 text-sm text-slate-700 bg-slate-50 p-2 rounded-lg border border-slate-100">
                                            <User className="w-4 h-4 text-orange-400" />
                                            <span className="font-medium">PI: {pi}</span>
                                        </div>
                                    )}
                                    {(city || country) && (
                                        <div className="flex items-center gap-2 text-sm text-slate-700 bg-slate-50 p-2 rounded-lg border border-slate-100">
                                            <MapPin className="w-4 h-4 text-orange-400" />
                                            <span>{[city, country].filter(Boolean).join(', ')}</span>
                                            <a 
                                                href={mapUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="ml-auto text-xs text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1"
                                                title="View on Google Maps"
                                            >
                                                <ExternalLink className="w-3 h-3" /> Map
                                            </a>
                                        </div>
                                    )}
                                </div>

                                {match && (
                                    <div className="text-sm text-slate-700 mt-2">
                                        <span className="font-semibold text-orange-800 text-xs uppercase tracking-wide block mb-1">Research Fit</span>
                                        {match}
                                    </div>
                                )}

                                {highlight && (
                                    <div className="bg-orange-50/50 p-3 rounded-lg border border-orange-100">
                                        <div className="flex justify-between items-start">
                                            <p className="text-xs uppercase tracking-wider text-orange-600/80 font-bold mb-1 flex items-center gap-1">
                                                <BookOpen className="w-3 h-3" /> Recent Activity (2024-2026)
                                            </p>
                                            {paperSearchUrl && (
                                                 <a 
                                                    href={paperSearchUrl} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer" 
                                                    className="flex items-center gap-1 text-[10px] bg-white border border-orange-200 px-2 py-0.5 rounded text-orange-700 hover:bg-orange-50 font-medium transition-colors"
                                                    title="Search this paper on Google Scholar"
                                                 >
                                                    <Search className="w-3 h-3" /> Find Paper
                                                 </a>
                                            )}
                                        </div>
                                        <p className="text-slate-700 text-sm italic line-clamp-2">"{highlight}"</p>
                                    </div>
                                )}

                                <div className="pt-3 flex flex-wrap gap-3 justify-end border-t border-slate-50 mt-2">
                                     {scholarProfileUrl && (
                                        <a href={scholarProfileUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-blue-600 bg-slate-50 hover:bg-blue-50 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-blue-200 transition-all">
                                            <GraduationCap className="w-3 h-3" /> Google Scholar Profile
                                        </a>
                                     )}
                                     {link && link !== 'N/A' && (
                                        <a href={link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs font-semibold text-white bg-orange-600 hover:bg-orange-700 px-3 py-1.5 rounded-lg shadow-sm hover:shadow transition-all">
                                            <LinkIcon className="w-3 h-3" /> Lab Website
                                        </a>
                                     )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
  };

  return (
    <div className="w-full bg-slate-50 rounded-2xl shadow-lg border border-orange-200 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-gradient-to-r from-orange-50 to-amber-50 px-6 py-4 border-b border-orange-100 flex justify-between items-center">
        <div className="flex items-center gap-2">
            <div className="bg-white p-1.5 rounded-md shadow-sm border border-orange-100 text-orange-600">
                <Globe className="w-4 h-4" />
            </div>
            <h3 className="font-semibold text-slate-800">International Lab Scout</h3>
        </div>
        <div className="text-xs text-orange-700/70 font-mono bg-orange-50 px-2 py-1 rounded border border-orange-100">
            Research Navigator
        </div>
      </div>
      
      <div className="p-6">
        <div className="mb-6">
            <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-2">Search Parameters</p>
            <p className="text-slate-600 italic text-sm line-clamp-2">
                "{result.originalQuery}"
            </p>
        </div>

        <div>
            {renderContent(result.content)}
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