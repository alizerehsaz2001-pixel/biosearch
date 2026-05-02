import React, { useState } from 'react';
import { GraduationCap, MapPin, FlaskConical, BookOpen, Search, Copy, Check, Globe, Link as LinkIcon, User, ExternalLink, Star, Tag, Mail } from 'lucide-react';
import { SearchResult } from '../types';

interface LabScoutResultCardProps {
  result: SearchResult;
}

interface LabData {
  name: string;
  university: string;
  university_ranking?: string;
  pi: string;
  city: string;
  country: string;
  address: string;
  match_score: number;
  expertise_focus: string;
  collaboration_potential: string;
  recent_breakthrough: string;
  website: string;
  tech_stack: string[];
  contact_strategy?: string;
}

interface LabScoutData {
  region_summary: {
    title: string;
    landscape: string;
    top_institutions: string[];
  };
  labs: LabData[];
}

const LabScoutResultCard: React.FC<LabScoutResultCardProps> = ({ result }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(result.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const parseJson = (str: string) => {
    try {
      // Try direct parse
      return JSON.parse(str);
    } catch (e) {
      // Try to extract JSON from markdown blocks
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

  const renderContent = () => {
    const data = parseJson(result.content) as LabScoutData | null;

    if (!data) {
        // Fallback for legacy text format
        return (
            <div className="p-4 bg-slate-50 rounded-xl text-slate-700 whitespace-pre-wrap">
                {result.content}
            </div>
        );
    }

    return (
        <div>
            {data.region_summary && (
                <div className="mb-8 p-6 bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-100 rounded-2xl shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-500">
                        <Globe className="w-24 h-24 text-orange-900" />
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="bg-orange-500 p-2 rounded-lg text-white shadow-md">
                                <Globe className="w-5 h-5" />
                            </div>
                            <h3 className="font-bold text-slate-900 text-xl tracking-tight">{data.region_summary.title}</h3>
                        </div>
                        <p className="text-slate-700 leading-relaxed max-w-2xl mb-4 font-medium italic">
                            {data.region_summary.landscape}
                        </p>
                        <div className="flex flex-wrap gap-2 items-center">
                            <span className="text-[10px] font-bold text-orange-800 uppercase tracking-widest mr-2 flex items-center gap-1">
                                <GraduationCap className="w-3.5 h-3.5" /> Key Hubs:
                            </span>
                            {data.region_summary.top_institutions.map((inst, i) => (
                                <span key={i} className="px-3 py-1 bg-white border border-orange-200 text-orange-900 text-[11px] font-bold rounded-lg shadow-sm">
                                    {inst}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            )}
            
            <div className="grid grid-cols-1 gap-8">
                {data.labs.map((lab, index) => {
                    // Construct Search URLs
                    const scholarProfileUrl = lab.pi && lab.university 
                        ? `https://scholar.google.com/scholar?q=${encodeURIComponent(lab.pi + " " + lab.university)}` 
                        : null;
                    const paperSearchUrl = lab.recent_breakthrough 
                        ? `https://scholar.google.com/scholar?q=${encodeURIComponent(lab.recent_breakthrough)}` 
                        : null;
                    
                    // Find map source if available
                    const mapSource = result.sources?.find(s => s.type === 'map' && (s.title.includes(lab.university) || s.title.includes(lab.city)));
                    const mapQuery = lab.address || `${lab.university} ${lab.city} ${lab.country}`;
                    const mapUrl = mapSource ? mapSource.uri : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}`;

                    return (
                        <div key={index} className="bg-white rounded-xl border border-orange-100 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
                             <div className="bg-orange-50/30 px-5 py-4 border-b border-orange-50 flex items-start gap-4">
                                <div className="bg-white p-2.5 rounded-lg text-orange-600 shadow-sm border border-orange-100 shrink-0 mt-1">
                                    <FlaskConical className="w-5 h-5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-lg font-bold text-slate-800 leading-tight">
                                        {lab.name}
                                    </h4>
                                    <p className="text-sm text-slate-500 font-medium flex flex-wrap items-center gap-1.5 mt-0.5">
                                        <GraduationCap className="w-3.5 h-3.5" /> 
                                        {lab.university}
                                        {lab.university_ranking && (
                                            <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 text-[10px] font-bold border border-blue-100 ml-1">
                                                {lab.university_ranking}
                                            </span>
                                        )}
                                    </p>
                                </div>
                                <div className="flex flex-col items-end gap-1 underline-offset-4">
                                    <div className="flex items-center gap-1">
                                        {[1, 2, 3, 4, 5].map((s) => (
                                            <Star key={s} className={`w-3 h-3 ${lab.match_score >= s * 20 ? 'fill-orange-400 text-orange-400' : 'text-slate-200'}`} />
                                        ))}
                                    </div>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{lab.match_score}% Match</span>
                                </div>
                            </div>

                            <div className="p-5 space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-3">
                                        {lab.pi && (
                                            <div className="flex items-center gap-2 text-sm text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                                                <User className="w-4 h-4 text-orange-500" />
                                                <span className="font-bold">PI: {lab.pi}</span>
                                            </div>
                                        )}
                                        <div className="flex items-center gap-2 text-sm text-slate-600 px-1">
                                            <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                                            <span className="truncate">{lab.address || [lab.city, lab.country].filter(Boolean).join(', ')}</span>
                                            <a 
                                                href={mapUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="ml-auto text-[10px] bg-white border border-slate-200 px-2 py-0.5 rounded text-blue-600 hover:border-blue-200 font-bold uppercase transition-all"
                                            >
                                                Map
                                            </a>
                                        </div>
                                    </div>

                                    <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Technical Stack</span>
                                        <div className="flex flex-wrap gap-1.5">
                                            {lab.tech_stack.map((tech, i) => (
                                                <span key={i} className="px-2 py-0.5 bg-white border border-slate-200 text-slate-600 text-[10px] font-bold rounded shadow-sm">
                                                    {tech}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="bg-blue-50/30 p-4 rounded-xl border border-blue-50">
                                        <h5 className="text-xs font-bold text-blue-900 mb-2 flex items-center gap-2">
                                            <Tag className="w-3.5 h-3.5 text-blue-500" />
                                            Expertise Focus
                                        </h5>
                                        <p className="text-sm text-blue-800 leading-relaxed font-medium">
                                            {lab.expertise_focus}
                                        </p>
                                    </div>
                                    <div className="bg-orange-50/30 p-4 rounded-xl border border-orange-50">
                                        <h5 className="text-xs font-bold text-orange-900 mb-2 flex items-center gap-2">
                                            <Star className="w-3.5 h-3.5 text-orange-500" />
                                            Collaboration Potential
                                        </h5>
                                        <p className="text-sm text-orange-800 leading-relaxed font-medium">
                                            {lab.collaboration_potential}
                                        </p>
                                    </div>
                                </div>

                                {lab.recent_breakthrough && (
                                    <div className="bg-slate-900 p-4 rounded-xl shadow-inner group">
                                        <div className="flex justify-between items-center mb-2">
                                            <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold flex items-center gap-2">
                                                <BookOpen className="w-3.5 h-3.5" /> Recent Breakthrough (2024-2026)
                                            </p>
                                            {paperSearchUrl && (
                                                 <a 
                                                    href={paperSearchUrl} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer" 
                                                    className="text-[10px] text-orange-400 hover:text-orange-300 font-bold flex items-center gap-1 transition-colors"
                                                 >
                                                    View Source <ExternalLink className="w-3 h-3" />
                                                 </a>
                                            )}
                                        </div>
                                        <p className="text-white text-sm italic font-medium leading-relaxed">"{lab.recent_breakthrough}"</p>
                                    </div>
                                )}

                                {lab.contact_strategy && (
                                    <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100 flex items-start gap-3">
                                        <Mail className="w-4 h-4 text-indigo-500 mt-0.5 shrink-0" />
                                        <div>
                                            <h5 className="text-[10px] font-bold text-indigo-900 uppercase tracking-widest mb-1">Headhunter Advice: Contact Strategy</h5>
                                            <p className="text-sm text-indigo-800 leading-relaxed font-semibold italic">
                                                {lab.contact_strategy}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                <div className="flex flex-wrap gap-3 pt-2 justify-end">
                                     {scholarProfileUrl && (
                                        <a href={scholarProfileUrl} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-slate-500 hover:text-blue-600 flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-blue-50 transition-colors">
                                            <Search className="w-3.5 h-3.5" /> Scholar Profile
                                        </a>
                                     )}
                                     {lab.website && lab.website !== 'N/A' && (
                                        <a href={lab.website} target="_blank" rel="noopener noreferrer" className="bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-2 transition-all shadow-md shadow-orange-100 hover:shadow-orange-200">
                                            <Globe className="w-3.5 h-3.5" /> Visit Lab Site
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
            {renderContent()}
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