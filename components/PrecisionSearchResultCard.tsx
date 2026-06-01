import React, { useState } from 'react';
import { 
  Crosshair, Copy, Check, ExternalLink, Globe, Database, 
  Search as SearchIcon, FileText, Info, BookOpen, AlertCircle, 
  CheckCircle, Tag, HelpCircle, ListChecks 
} from 'lucide-react';
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
  search_vocab?: {
    mesh_terms?: string[];
    synonyms?: string[];
    exclusion_terms?: string[];
  };
  queries?: {
    pubmed?: string;
    scopus?: string;
    scholar?: string;
    arxiv?: string;
    lens?: string;
  };
  prisma_tips?: string[];
  links: SearchLink[];
}

const PrecisionSearchResultCard: React.FC<PrecisionSearchResultCardProps> = ({ result }) => {
  const [copied, setCopied] = useState(false);
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [activeQueryTab, setActiveQueryTab] = useState<'pubmed' | 'scopus' | 'scholar' | 'arxiv' | 'lens'>('pubmed');

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
      setCopiedText(null);
    }, 2000);
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
      if (trimmed.startsWith('### ')) return <h3 key={i} className="text-xl font-bold text-slate-900 mt-6 mb-3 font-tech">{trimmed.replace('### ', '')}</h3>;
      if (trimmed.startsWith('- ')) {
        const linkMatch = trimmed.match(/\[(.*?)\]\((.*?)\)/);
        if (linkMatch) {
          return (
            <li key={i} className="ml-5 list-disc mb-2">
               <a href={linkMatch[2]} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline inline-flex items-center gap-1 font-medium">
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
              onClick={() => handleCopy(trimmed.replace(/`/g, ''), 'Copied Query')}
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
        if (type.toLowerCase().includes('database')) return <Database className="w-5 h-5 text-indigo-500" />;
        if (type.toLowerCase().includes('publisher')) return <FileText className="w-5 h-5 text-indigo-500" />;
        return <SearchIcon className="w-5 h-5 text-indigo-500" />;
    };

    // Platform labels & descriptions for Advanced Queries
    const queryTabs = [
      { id: 'pubmed', label: 'PubMed (NLM/MeSH)', desc: 'Field-tagged index searches', queryText: data.queries?.pubmed || data.query },
      { id: 'scopus', label: 'Scopus / WoS', desc: 'Proximity (W/x) & Wildcard search', queryText: data.queries?.scopus || data.query },
      { id: 'scholar', label: 'Google Scholar', desc: 'Exact phrase & Exclusion tags', queryText: data.queries?.scholar || data.query },
      { id: 'arxiv', label: 'arXiv', desc: 'E-print Archive search', queryText: data.queries?.arxiv || data.query },
      { id: 'lens', label: 'Lens.org', desc: 'Patent and Scholarly literature database', queryText: data.queries?.lens || data.query }
    ] as const;

    const currentTabQuery = queryTabs.find(tab => tab.id === activeQueryTab)?.queryText || data.query;

    return (
        <div className="space-y-8">
            {/* Strategy Rationale */}
            <div className="bg-blue-50/60 border border-blue-100 rounded-2xl p-6 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-500"></div>
                <div className="flex items-start gap-4">
                    <div className="p-3 bg-white border border-blue-200/60 rounded-xl shadow-sm text-blue-500">
                        <Info className="w-5 h-5 shrink-0" />
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-blue-900 uppercase tracking-widest mb-1.5 font-tech">Precision Strategy Alignment</h4>
                        <p className="text-sm text-blue-800/80 leading-relaxed font-medium italic font-academic">{data.explanation}</p>
                    </div>
                </div>
            </div>

            {/* Semantic Vocabulary Maps (PRISMA Pre-flight block) */}
            {data.search_vocab && (
               <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                     <Tag className="w-4 h-4 text-indigo-500" /> Controlled Vocabulary Grounding
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                     {/* MeSH Headings */}
                     <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl">
                        <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest block mb-2.5">PubMed MeSH Terms</span>
                        {data.search_vocab.mesh_terms && data.search_vocab.mesh_terms.length > 0 ? (
                           <div className="flex flex-wrap gap-1.5">
                              {data.search_vocab.mesh_terms.map((term, tIdx) => (
                                 <span key={tIdx} className="bg-indigo-50 text-indigo-700 border border-indigo-100/70 px-2 py-1 rounded text-xs font-bold">
                                    {term}
                                 </span>
                              ))}
                           </div>
                        ) : (
                           <span className="text-xs text-slate-400 italic">No indexed terms specified</span>
                        )}
                     </div>

                     {/* Synonyms / Alternates */}
                     <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl">
                        <span className="text-[10px] font-bold text-teal-600 uppercase tracking-widest block mb-2.5">Exact Synonyms</span>
                        {data.search_vocab.synonyms && data.search_vocab.synonyms.length > 0 ? (
                           <div className="flex flex-wrap gap-1.5">
                              {data.search_vocab.synonyms.map((syn, sIdx) => (
                                 <span key={sIdx} className="bg-teal-50 text-teal-700 border border-teal-100/70 px-2 py-1 rounded text-xs font-bold">
                                    {syn}
                                 </span>
                              ))}
                           </div>
                        ) : (
                           <span className="text-xs text-slate-400 italic">No synonyms declared</span>
                        )}
                     </div>

                     {/* Exclusion/Negative controls */}
                     <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl">
                        <span className="text-[10px] font-bold text-red-600 uppercase tracking-widest block mb-2.5">Negative Controls (NOT)</span>
                        {data.search_vocab.exclusion_terms && data.search_vocab.exclusion_terms.length > 0 ? (
                           <div className="flex flex-wrap gap-1.5">
                              {data.search_vocab.exclusion_terms.map((ex, eIdx) => (
                                 <span key={ex} className="bg-red-50 text-red-700 border border-red-100/70 px-2 py-1 rounded text-xs font-bold">
                                    {ex}
                                 </span>
                              ))}
                           </div>
                        ) : (
                           <span className="text-xs text-slate-400 italic">No exclusion terms mapped</span>
                        )}
                     </div>
                  </div>
               </div>
            )}

            {/* Advanced Multi-Database Query Tabs */}
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                <div className="bg-slate-50/80 border-b border-slate-200 px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                           <Database className="w-4 h-4 text-indigo-500" /> Platform-Specific Advanced Queries
                        </h4>
                        <p className="text-[10px] text-slate-500 font-medium mt-0.5">Syntactically custom formatted for scholarly database compilers</p>
                    </div>

                    {/* Tabs switcher */}
                    <div className="flex flex-wrap p-1 bg-slate-200/60 rounded-xl self-start md:self-auto shrink-0 border border-slate-200 gap-1">
                        {queryTabs.map(tab => (
                           <button
                              key={tab.id}
                              onClick={() => setActiveQueryTab(tab.id)}
                              className={`
                                 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all
                                 ${activeQueryTab === tab.id 
                                 ? 'bg-slate-900 text-white shadow-sm' 
                                 : 'text-slate-600 hover:text-slate-900'}
                              `}
                           >
                              {tab.id === 'pubmed' ? 'PubMed' : tab.id === 'scopus' ? 'Scopus' : tab.id === 'scholar' ? 'Scholar' : tab.id === 'arxiv' ? 'arXiv' : 'Lens.org'}
                           </button>
                        ))}
                    </div>
                </div>

                {/* Query Area */}
                <div className="p-6 space-y-4">
                    <div className="flex justify-between items-center bg-slate-50 px-4 py-2 rounded-lg border border-slate-100">
                       <div className="flex items-center gap-2">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                          <span className="text-xs font-bold text-slate-700">{queryTabs.find(t => t.id === activeQueryTab)?.label} Syntax</span>
                       </div>
                       <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{queryTabs.find(t => t.id === activeQueryTab)?.desc}</span>
                    </div>

                    <div className="relative group">
                        <pre className="bg-slate-950 text-blue-400 p-5 rounded-xl text-xs font-mono overflow-x-auto border border-slate-800 shadow-inner whitespace-pre-wrap break-all leading-relaxed max-h-60">
                            {currentTabQuery}
                        </pre>
                        
                        <button 
                            onClick={() => handleCopy(currentTabQuery, activeQueryTab)}
                            className="absolute top-3 right-3 bg-slate-900/80 hover:bg-slate-800 text-slate-200 py-1.5 px-3 rounded-lg border border-slate-700 flex items-center gap-2 shadow-sm opacity-90 hover:opacity-100 transition-all font-sans text-xs font-bold"
                        >
                            {copied && copiedText === activeQueryTab ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                            <span>{copied && copiedText === activeQueryTab ? 'Copied' : 'Copy Query'}</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Direct Indexing Search Gateways */}
            {data.links && data.links.length > 0 && (
                <div className="space-y-4">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                        <ExternalLink className="w-4 h-4 text-indigo-500" /> Direct Query Search Execution Portals
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {data.links.map((link, idx) => (
                            <a 
                                key={idx}
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group flex flex-col justify-between p-5 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md hover:border-blue-400 hover:-translate-y-0.5 transition-all cursor-pointer relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 w-8 h-8 bg-blue-50 group-hover:bg-blue-100/50 rounded-bl-2xl flex items-center justify-center transition-colors">
                                   <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-blue-600 transition-colors" />
                                </div>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-slate-100 p-2.5 rounded-xl group-hover:bg-blue-50 group-hover:text-blue-600 text-slate-600 transition-colors">
                                            {getIconForType(link.type)}
                                        </div>
                                        <div className="flex-1 min-w-0 pr-4">
                                            <h5 className="font-bold text-slate-900 group-hover:text-blue-700 truncate transition-colors text-sm font-tech">
                                                {link.platform}
                                            </h5>
                                            <span className="inline-block mt-0.5 text-[9px] font-bold text-slate-400 group-hover:text-blue-500 uppercase tracking-widest">
                                                {link.type}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-4 pt-3 border-t border-slate-50 text-[10px] font-bold text-blue-600 flex items-center gap-1 opacity-80 group-hover:opacity-100 uppercase tracking-widest">
                                    Launch index Query
                                </div>
                            </a>
                        ))}
                    </div>
                </div>
            )}

            {/* Systematic Literature Review Screener PRISMA guidelines */}
            {data.prisma_tips && data.prisma_tips.length > 0 && (
               <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                  <div className="flex items-center gap-2.5 mb-4 border-b border-slate-100 pb-3">
                     <div className="p-1.5 bg-slate-900 text-white rounded-lg">
                        <ListChecks className="w-4 h-4" />
                     </div>
                     <div>
                        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-[0.2em]">PRISMA Screening & Validation Roadmap</h4>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Eligibility assessment recommendations</p>
                     </div>
                  </div>

                  <div className="space-y-3">
                     {data.prisma_tips.map((tip, idx) => (
                        <div key={idx} className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                           <div className="bg-indigo-50 text-indigo-600 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 shadow-sm border border-indigo-100">
                              {idx + 1}
                           </div>
                           <p className="text-sm text-slate-700 leading-relaxed font-semibold">{tip}</p>
                        </div>
                     ))}
                  </div>
               </div>
            )}
        </div>
    );
  };

  return (
    <div className="w-full bg-white rounded-2xl shadow-lg border border-blue-200 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-gradient-to-r from-blue-50 via-indigo-50/30 to-white px-6 py-5 border-b border-blue-100 flex justify-between items-center">
        <div className="flex items-center gap-3">
            <div className="bg-slate-950 p-2 rounded-xl shadow-md border border-slate-800 text-blue-400">
                <Crosshair className="w-5 h-5" />
            </div>
            <div>
               <h3 className="font-bold text-slate-900 text-sm font-tech leading-none">Precision Search Command</h3>
               <span className="text-[9px] text-blue-700/80 font-bold uppercase tracking-[0.15em] mt-1 inline-block">Platform Syntaxes & Grounding Active</span>
            </div>
        </div>
        <div className="text-xs text-emerald-700 font-mono bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100 flex items-center gap-1 font-bold">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> SOTA Configured
        </div>
      </div>
      
      <div className="p-6">
        <div className="mb-8 bg-slate-50 p-5 rounded-2xl border border-slate-100 flex items-start gap-3">
            <div className="p-2 bg-white rounded-xl shadow-sm border border-slate-200 shrink-0 mt-0.5 text-blue-500">
               <Crosshair className="w-4 h-4" />
            </div>
            <div>
               <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1">Search Directive Context</p>
               <p className="text-slate-800 font-medium text-sm whitespace-pre-wrap leading-relaxed">{result.originalQuery}</p>
            </div>
        </div>

        <div>{renderContent()}</div>

        {result.sources && result.sources.length > 0 && (
          <div className="mt-10 pt-6 border-t border-slate-100">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Globe className="w-3 h-3 text-indigo-500 animate-pulse" /> Grounding Sources Mapped
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {result.sources.map((source, idx) => (
                <a key={idx} href={source.uri} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-100 rounded-xl hover:border-blue-400 hover:bg-white hover:shadow-sm transition-all group">
                  <span className="text-xs font-bold text-slate-600 group-hover:text-blue-700 truncate mr-2">{source.title}</span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-500 transition-colors shrink-0" />
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
