import React, { useState, useMemo } from 'react';
import { 
  Crosshair, Copy, Check, ExternalLink, Globe, Database, 
  Search as SearchIcon, FileText, Info, BookOpen, AlertCircle, 
  CheckCircle, Tag, HelpCircle, ListChecks, Plus, Trash2,
  ArrowRight, FileCheck, Sparkles, Filter, RefreshCw
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

  // Parse Initial JSON
  const initialData = useMemo(() => {
    try {
      return JSON.parse(result.content);
    } catch (e) {
      const jsonMatch = result.content.match(/```json\s*([\s\S]*?)\s*```/) || result.content.match(/```\s*([\s\S]*?)\s*```/);
      if (jsonMatch && jsonMatch[1]) {
        try {
          return JSON.parse(jsonMatch[1]);
        } catch (innerE) {
          return null;
        }
      }
      return null;
    }
  }, [result.content]) as PrecisionSearchData | null;

  // Active Keyword Vocabulary States for Live Editing & Formulation
  const [meshTerms, setMeshTerms] = useState<string[]>(initialData?.search_vocab?.mesh_terms || []);
  const [synonyms, setSynonyms] = useState<string[]>(initialData?.search_vocab?.synonyms || []);
  const [exclusionTerms, setExclusionTerms] = useState<string[]>(initialData?.search_vocab?.exclusion_terms || []);

  // Inline forms to add new keywords
  const [newMesh, setNewMesh] = useState('');
  const [newSynonym, setNewSynonym] = useState('');
  const [newExclusion, setNewExclusion] = useState('');

  // Interactive PRISMA Funnel States
  const [showPrismaPlanner, setShowPrismaPlanner] = useState(true);
  const [dbRecords, setDbRecords] = useState(380);
  const [otherRecords, setOtherRecords] = useState(15);
  const [duplicatesRemoved, setDuplicatesRemoved] = useState(115);
  const [recordsScreened, setRecordsScreened] = useState(280);
  const [recordsExcluded, setRecordsExcluded] = useState(220);
  const [fullTextAssessed, setFullTextAssessed] = useState(60);
  const [fullTextExcluded, setFullTextExcluded] = useState(48);
  const [finalIncluded, setFinalIncluded] = useState(12);

  // Core local Boolean compiler compiling flawless query strings for all databases
  const compiledQueries = useMemo(() => {
    if (!initialData) return null;

    // --- PubMed Compiler ---
    let pubmed = '';
    const pubmedMeshList = meshTerms.map(t => `"${t}"[Mesh]`);
    const pubmedSynList = synonyms.map(s => `"${s}"[Title/Abstract]`);
    const pubmedExList = exclusionTerms.map(e => `"${e}"[Title/Abstract]`);
    
    let pubmedParts = [];
    if (pubmedMeshList.length > 0) pubmedParts.push(`(${pubmedMeshList.join(' OR ')})`);
    if (pubmedSynList.length > 0) pubmedParts.push(`(${pubmedSynList.join(' OR ')})`);
    let pubmedBase = pubmedParts.join(' AND ');
    if (pubmedExList.length > 0) {
      pubmed = pubmedBase ? `(${pubmedBase}) NOT (${pubmedExList.join(' OR ')})` : `NOT (${pubmedExList.join(' OR ')})`;
    } else {
      pubmed = pubmedBase;
    }

    // --- Scopus Compiler ---
    let scopus = '';
    const scopusMainList = [...meshTerms, ...synonyms];
    if (scopusMainList.length > 0) {
      scopus = `TITLE-ABS-KEY(${scopusMainList.map(t => `"${t}"`).join(' OR ')})`;
    }
    if (exclusionTerms.length > 0) {
      const scopusEx = `AND NOT TITLE-ABS-KEY(${exclusionTerms.map(e => `"${e}"`).join(' OR ')})`;
      scopus = scopus ? `(${scopus}) ${scopusEx}` : `NOT TITLE-ABS-KEY(${exclusionTerms.map(e => `"${e}"`).join(' OR ')})`;
    }

    // --- Google Scholar Compiler ---
    const scholarMain = [...meshTerms, ...synonyms].map(t => `"${t}"`).join(' ');
    const scholarEx = exclusionTerms.map(e => `-"${e}"`).join(' ');
    const scholar = `${scholarMain} ${scholarEx}`.trim();

    // --- arXiv Compiler ---
    let arxiv = '';
    const arxivMesh = meshTerms.map(t => `(ti:"${t}" OR abs:"${t}")`);
    const arxivSyn = synonyms.map(s => `(ti:"${s}" OR abs:"${s}")`);
    const arxivEx = exclusionTerms.map(e => `(ti:"${e}" OR abs:"${e}")`);
    let arxivParts = [];
    if (arxivMesh.length > 0) arxivParts.push(`(${arxivMesh.join(' OR ')})`);
    if (arxivSyn.length > 0) arxivParts.push(`(${arxivSyn.join(' OR ')})`);
    let arxivBase = arxivParts.join(' AND ');
    if (arxivEx.length > 0) {
      arxiv = arxivBase ? `(${arxivBase}) ANDNOT (${arxivEx.join(' OR ')})` : `ANDNOT (${arxivEx.join(' OR ')})`;
    } else {
      arxiv = arxivBase;
    }

    // --- Lens Compiler ---
    let lens = '';
    const lensMain = [...meshTerms, ...synonyms].map(t => `"${t}"`);
    if (lensMain.length > 0) {
      lens = `(${lensMain.join(' OR ')})`;
    }
    if (exclusionTerms.length > 0) {
      const lensEx = `NOT (${exclusionTerms.map(e => `"${e}"`).join(' OR ')})`;
      lens = lens ? `(${lens}) ${lensEx}` : `NOT (${exclusionTerms.map(e => `"${e}"`).join(' OR ')})`;
    }

    return {
      pubmed: pubmed || initialData.queries?.pubmed || initialData.query,
      scopus: scopus || initialData.queries?.scopus || initialData.query,
      scholar: scholar || initialData.queries?.scholar || initialData.query,
      arxiv: arxiv || initialData.queries?.arxiv || initialData.query,
      lens: lens || initialData.queries?.lens || initialData.query
    };
  }, [meshTerms, synonyms, exclusionTerms, initialData]);

  const activeTabQuery = useMemo(() => {
    if (!compiledQueries) return '';
    return compiledQueries[activeQueryTab] || '';
  }, [compiledQueries, activeQueryTab]);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
      setCopiedText(null);
    }, 2000);
  };

  // List modifiers
  const addMesh = () => {
    if (newMesh.trim() && !meshTerms.includes(newMesh.trim())) {
      setMeshTerms([...meshTerms, newMesh.trim()]);
      setNewMesh('');
    }
  };

  const removeMesh = (term: string) => {
    setMeshTerms(meshTerms.filter(t => t !== term));
  };

  const addSynonym = () => {
    if (newSynonym.trim() && !synonyms.includes(newSynonym.trim())) {
      setSynonyms([...synonyms, newSynonym.trim()]);
      setNewSynonym('');
    }
  };

  const removeSynonym = (term: string) => {
    setSynonyms(synonyms.filter(t => t !== term));
  };

  const addExclusion = () => {
    if (newExclusion.trim() && !exclusionTerms.includes(newExclusion.trim())) {
      setExclusionTerms([...exclusionTerms, newExclusion.trim()]);
      setNewExclusion('');
    }
  };

  const removeExclusion = (term: string) => {
    setExclusionTerms(exclusionTerms.filter(t => t !== term));
  };

  const resetVocab = () => {
    setMeshTerms(initialData?.search_vocab?.mesh_terms || []);
    setSynonyms(initialData?.search_vocab?.synonyms || []);
    setExclusionTerms(initialData?.search_vocab?.exclusion_terms || []);
  };

  // Direct Execution Search Gateways builder
  const getDynamicGateways = () => {
    if (!compiledQueries) return [];
    return [
      {
        platform: 'PubMed',
        url: `https://pubmed.ncbi.nlm.nih.gov/?term=${encodeURIComponent(compiledQueries.pubmed)}`,
        type: 'database',
        desc: 'National Library of Medicine'
      },
      {
        platform: 'Google Scholar',
        url: `https://scholar.google.com/scholar?q=${encodeURIComponent(compiledQueries.scholar)}`,
        type: 'search',
        desc: 'Broad literature indexing'
      },
      {
        platform: 'arXiv',
        url: `https://arxiv.org/search/?query=${encodeURIComponent(compiledQueries.arxiv)}&searchtype=all`,
        type: 'database',
        desc: 'Preprint database'
      },
      {
        platform: 'Lens.org',
        url: `https://www.lens.org/lens/search/scholar/list?q=${encodeURIComponent(compiledQueries.lens)}`,
        type: 'database',
        desc: 'Patent & Scholar tracker'
      }
    ];
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
    if (!initialData) {
        return renderLegacyContent(result.content);
    }

    const queryTabs = [
      { id: 'pubmed', label: 'PubMed', desc: 'NLM MeSH tags', val: compiledQueries?.pubmed },
      { id: 'scopus', label: 'Scopus / WoS', desc: 'TITLE-ABS-KEY & operators', val: compiledQueries?.scopus },
      { id: 'scholar', label: 'Google Scholar', desc: 'Quotation exclusions', val: compiledQueries?.scholar },
      { id: 'arxiv', label: 'arXiv', desc: 'E-prints prefixes', val: compiledQueries?.arxiv },
      { id: 'lens', label: 'Lens.org', desc: 'Patents and Scholar metadata', val: compiledQueries?.lens }
    ] as const;

    const dynamicGateways = getDynamicGateways();

    return (
        <div className="space-y-8">
            {/* Strategy Rationale */}
            <div className="bg-gradient-to-r from-blue-50/75 to-indigo-50/20 border border-blue-100/80 rounded-2xl p-6 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-600"></div>
                <div className="flex items-start gap-4">
                    <div className="p-3 bg-white border border-blue-200/60 rounded-xl shadow-sm text-blue-600 shrink-0">
                        <Info className="w-5 h-5 shrink-0" />
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-blue-900 uppercase tracking-widest mb-1.5 font-tech">Precision Strategy Alignment</h4>
                        <p className="text-sm text-blue-800/80 leading-relaxed font-semibold italic">{initialData.explanation}</p>
                    </div>
                </div>
            </div>

            {/* INTERACTIVE VOCABULARY AND CRITERIA BUILDER */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                    <div className="flex items-center gap-2">
                        <Tag className="w-5 h-5 text-blue-600 animate-pulse" />
                        <div>
                            <h4 className="font-bold text-slate-800 text-sm font-tech">Visual Query Terms Builder</h4>
                            <p className="text-xs text-slate-400 font-medium">Fine-tune logic variables and compile platform queries instantly</p>
                        </div>
                    </div>
                    
                    <button 
                        onClick={resetVocab}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-widest rounded-lg transition-all"
                    >
                        <RefreshCw className="w-3 h-3 text-slate-500" />
                        Revert to Baseline
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* PubMed MeSH terms */}
                    <div className="bg-slate-50/75 border border-slate-200/60 p-4.5 rounded-2xl flex flex-col justify-between min-h-[220px]">
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-[10px] font-bold text-blue-700 uppercase tracking-widest">Medical Subject Headings (MeSH)</span>
                                <span className="bg-blue-100/70 text-blue-800 text-[9px] font-bold px-1.5 py-0.5 rounded-full font-mono">{meshTerms.length}</span>
                            </div>
                            <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pb-2">
                                {meshTerms.map((term, idx) => (
                                    <span key={idx} className="inline-flex items-center gap-1 bg-white hover:bg-red-50 text-slate-800 hover:text-red-700 border border-slate-200 hover:border-red-200 px-2.5 py-1 rounded-lg text-xs font-semibold shadow-sm transition-all group">
                                        {term}
                                        <button onClick={() => removeMesh(term)} className="text-slate-400 group-hover:text-red-500 transition-colors">
                                            <Trash2 className="w-2.5 h-2.5" />
                                        </button>
                                    </span>
                                ))}
                                {meshTerms.length === 0 && <span className="text-xs text-slate-400 italic py-1">No MeSH terms in filter</span>}
                            </div>
                        </div>

                        <div className="mt-4 pt-3 border-t border-slate-200/55 flex gap-1.5">
                            <input 
                                placeholder="Add MeSH..." 
                                className="w-full px-2.5 py-1 text-xs bg-white border border-slate-200 rounded-lg outline-none focus:ring-1 focus:ring-blue-400 font-medium"
                                value={newMesh}
                                onChange={e => setNewMesh(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && addMesh()}
                            />
                            <button onClick={addMesh} className="p-1 px-2.5 bg-slate-900 text-white rounded-lg hover:bg-blue-600 transition-all text-xs font-bold font-mono">
                                <Plus className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>

                    {/* Focus Synonyms */}
                    <div className="bg-slate-50/75 border border-slate-200/60 p-4.5 rounded-2xl flex flex-col justify-between min-h-[220px]">
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-[10px] font-bold text-teal-700 uppercase tracking-widest">Scientific Synonyms</span>
                                <span className="bg-teal-100/70 text-teal-800 text-[9px] font-bold px-1.5 py-0.5 rounded-full font-mono">{synonyms.length}</span>
                            </div>
                            <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pb-2">
                                {synonyms.map((syn, idx) => (
                                    <span key={idx} className="inline-flex items-center gap-1 bg-white hover:bg-red-50 text-slate-800 hover:text-red-700 border border-slate-200 hover:border-red-200 px-2.5 py-1 rounded-lg text-xs font-semibold shadow-sm transition-all group">
                                        {syn}
                                        <button onClick={() => removeSynonym(syn)} className="text-slate-400 group-hover:text-red-500 transition-colors">
                                            <Trash2 className="w-2.5 h-2.5" />
                                        </button>
                                    </span>
                                ))}
                                {synonyms.length === 0 && <span className="text-xs text-slate-400 italic py-1">No synonyms in list</span>}
                            </div>
                        </div>

                        <div className="mt-4 pt-3 border-t border-slate-200/55 flex gap-1.5">
                            <input 
                                placeholder="Add Synonym..." 
                                className="w-full px-2.5 py-1 text-xs bg-white border border-slate-200 rounded-lg outline-none focus:ring-1 focus:ring-teal-400 font-medium"
                                value={newSynonym}
                                onChange={e => setNewSynonym(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && addSynonym()}
                            />
                            <button onClick={addSynonym} className="p-1 px-2.5 bg-slate-900 text-white rounded-lg hover:bg-teal-600 transition-all text-xs font-bold font-mono">
                                <Plus className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>

                    {/* Negative exclusions */}
                    <div className="bg-slate-50/75 border border-slate-200/60 p-4.5 rounded-2xl flex flex-col justify-between min-h-[220px]">
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-[10px] font-bold text-red-700 uppercase tracking-widest">Exclusion Words (NOT)</span>
                                <span className="bg-red-100/70 text-red-800 text-[9px] font-bold px-1.5 py-0.5 rounded-full font-mono">{exclusionTerms.length}</span>
                            </div>
                            <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pb-2">
                                {exclusionTerms.map((ex, idx) => (
                                    <span key={idx} className="inline-flex items-center gap-1 bg-white hover:bg-red-50 text-red-800 hover:text-red-700 border border-slate-200 hover:border-red-200 px-2.5 py-1 rounded-lg text-xs font-semibold shadow-sm transition-all group">
                                        {ex}
                                        <button onClick={() => removeExclusion(ex)} className="text-slate-400 group-hover:text-red-500 transition-colors">
                                            <Trash2 className="w-2.5 h-2.5" />
                                        </button>
                                    </span>
                                ))}
                                {exclusionTerms.length === 0 && <span className="text-xs text-slate-400 italic py-1">No exclusions in query</span>}
                            </div>
                        </div>

                        <div className="mt-4 pt-3 border-t border-slate-200/55 flex gap-1.5">
                            <input 
                                placeholder="Add Exclusion..." 
                                className="w-full px-2.5 py-1 text-xs bg-white border border-slate-200 rounded-lg outline-none focus:ring-1 focus:ring-red-400 font-medium"
                                value={newExclusion}
                                onChange={e => setNewExclusion(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && addExclusion()}
                            />
                            <button onClick={addExclusion} className="p-1 px-2.5 bg-slate-900 text-white rounded-lg hover:bg-red-600 transition-all text-xs font-bold font-mono">
                                <Plus className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* VISUAL SYNTATIC BOOLEAN QUERY BLOCK - Color-coded components */}
                <div className="bg-slate-950 rounded-2xl p-5 border border-slate-800 space-y-3 shadow-inner">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Structural Logical Query Expression</span>
                    <div className="flex flex-wrap items-center gap-2 font-mono text-[11px] leading-relaxed p-1">
                        <span className="text-yellow-500 font-bold">(</span>
                        
                        {/* MeSH chunk */}
                        {meshTerms.length > 0 ? (
                           <span className="flex items-center gap-1.5 border border-blue-500/30 bg-blue-950/40 px-2.5 py-1 rounded-lg text-blue-300">
                               <span>Mesh:</span>
                               <span className="text-[10px] font-bold uppercase block max-w-[200px] truncate">
                                   {meshTerms.join(' OR ')}
                               </span>
                           </span>
                        ) : (
                           <span className="text-slate-600 italic">No MeSH group</span>
                        )}

                        <span className="text-emerald-500 font-bold">AND</span>

                        {/* Synonym chunk */}
                        {synonyms.length > 0 ? (
                           <span className="flex items-center gap-1.5 border border-teal-500/30 bg-teal-950/40 px-2.5 py-1 rounded-lg text-teal-300">
                               <span>Title/Abs:</span>
                               <span className="text-[10px] font-bold uppercase block max-w-[200px] truncate">
                                   {synonyms.join(' OR ')}
                               </span>
                           </span>
                        ) : (
                           <span className="text-slate-600 italic">No Title/Abs synonyms</span>
                        )}

                        <span className="text-yellow-500 font-bold">)</span>

                        {exclusionTerms.length > 0 && (
                          <>
                             <span className="text-red-500 font-bold">NOT</span>
                             <span className="flex items-center gap-1.5 border border-red-500/30 bg-red-950/40 px-2.5 py-1 rounded-lg text-red-300">
                                 <span>Exclusions:</span>
                                 <span className="text-[10px] font-bold uppercase block max-w-[200px] truncate">
                                     {exclusionTerms.join(' OR ')}
                                 </span>
                             </span>
                          </>
                        )}
                    </div>
                </div>
            </div>

            {/* Platform-Specific Compiled Output Tabs */}
            <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
                <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                           <Database className="w-4 h-4 text-blue-600" /> Platform-Specific Advanced Queries
                        </h4>
                        <p className="text-[10px] text-slate-500 font-semibold mt-0.5">Syntactically compiled and structured real-time</p>
                    </div>

                    {/* Tabs switcher */}
                    <div className="flex flex-wrap p-1 bg-slate-200/60 rounded-xl self-start md:self-auto shrink-0 border border-slate-200 gap-1 select-none">
                        {queryTabs.map(tab => (
                           <button
                              key={tab.id}
                              onClick={() => setActiveQueryTab(tab.id)}
                              className={`
                                 px-3 py-1.5 rounded-lg text-xs font-bold transition-all
                                 ${activeQueryTab === tab.id 
                                 ? 'bg-slate-900 text-white shadow-sm' 
                                 : 'text-slate-600 hover:text-slate-900'}
                              `}
                           >
                              {tab.label}
                           </button>
                        ))}
                    </div>
                </div>

                {/* Query text box with copy feature */}
                <div className="p-6 space-y-4">
                    <div className="flex justify-between items-center bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-100">
                       <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                          <CheckCircle className="w-4 h-4 text-emerald-500" /> 
                          {queryTabs.find(t => t.id === activeQueryTab)?.label} Clause Output
                       </span>
                       <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{queryTabs.find(t => t.id === activeQueryTab)?.desc}</span>
                    </div>

                    <div className="relative group">
                        <pre className="bg-slate-950 text-blue-400 p-5 rounded-2xl text-xs font-mono overflow-y-auto border border-slate-800 shadow-inner whitespace-pre-wrap break-all leading-relaxed max-h-56 select-all pr-28">
                            {activeTabQuery}
                        </pre>
                        
                        <button 
                            onClick={() => handleCopy(activeTabQuery, activeQueryTab)}
                            className="absolute top-3 right-3 bg-slate-900/95 hover:bg-slate-800 text-slate-100 py-1.5 px-3.5 rounded-xl border border-slate-700 flex items-center gap-1.5 shadow-sm transition-all font-sans text-xs font-bold"
                        >
                            {copied && copiedText === activeQueryTab ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5 text-blue-400" />}
                            <span>{copied && copiedText === activeQueryTab ? 'Copied' : 'Copy Query'}</span>
                        </button>
                    </div>

                    {/* Dynamic Execution Bar */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-blue-50/40 border border-blue-100/50 p-4 rounded-2xl mt-4">
                        <div className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-blue-600" />
                            <p className="text-xs font-semibold text-blue-900">
                                Ready to test this exact formulated query in live database journals? 
                            </p>
                        </div>
                        <a 
                          href={
                              activeQueryTab === 'pubmed' 
                                ? `https://pubmed.ncbi.nlm.nih.gov/?term=${encodeURIComponent(activeTabQuery)}` 
                                : activeQueryTab === 'scholar' 
                                ? `https://scholar.google.com/scholar?q=${encodeURIComponent(activeTabQuery)}` 
                                : activeQueryTab === 'arxiv' 
                                ? `https://arxiv.org/search/?query=${encodeURIComponent(activeTabQuery)}&searchtype=all` 
                                : activeQueryTab === 'lens' 
                                ? `https://www.lens.org/lens/search/scholar/list?q=${encodeURIComponent(activeTabQuery)}` 
                                : `https://scholar.google.com/scholar?q=${encodeURIComponent(activeTabQuery)}`
                          }
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md flex items-center gap-1.5 text-xs font-bold transition-all hover:-translate-y-0.5 shrink-0"
                        >
                            <span>Live Database Launch</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                        </a>
                    </div>
                </div>
            </div>

            {/* Direct Query Search Portals */}
            <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                    <ExternalLink className="w-4 h-4 text-blue-600" /> Live Query Target Execution Portals
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {dynamicGateways.map((link, idx) => (
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
                            <div className="space-y-2">
                                <div className="flex items-center gap-2.5">
                                    <div className="bg-slate-100 p-2 rounded-lg group-hover:bg-blue-50 group-hover:text-blue-600 text-slate-600 transition-colors">
                                        <Database className="w-4 h-4 text-blue-600" />
                                    </div>
                                    <div className="min-w-0 pr-4">
                                        <h5 className="font-bold text-slate-900 group-hover:text-blue-700 truncate transition-colors text-xs font-tech">
                                            {link.platform}
                                        </h5>
                                        <span className="inline-block text-[9px] font-bold text-slate-400 uppercase tracking-widest line-clamp-1">
                                            {link.desc}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-4 pt-3 border-t border-slate-50 text-[10px] font-bold text-blue-600 flex items-center gap-1 opacity-80 group-hover:opacity-100 uppercase tracking-widest font-mono">
                                Launch Term Query
                            </div>
                        </a>
                    ))}
                </div>
            </div>

            {/* DYNAMIC SYSTEMATIC REVIEW PRISMA FLOWCHART PLANNER */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
                <div onClick={() => setShowPrismaPlanner(!showPrismaPlanner)} className="flex items-center justify-between cursor-pointer border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2.5">
                        <div className="p-1.5 bg-slate-900 text-white rounded-lg">
                            <ListChecks className="w-4 h-4" />
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-800 text-sm uppercase tracking-wider">Interactive PRISMA Systematic review funnel</h4>
                            <p className="text-[10px] text-slate-400 font-medium">Input your study findings below to render a live, dynamic filtering flowchart</p>
                        </div>
                    </div>
                    <span className="text-xs font-bold text-blue-600 hover:underline">
                        {showPrismaPlanner ? 'Collapse' : 'Expand Flowchart'}
                    </span>
                </div>

                {showPrismaPlanner && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-in fade-in duration-300">
                        {/* Interactive inputs form */}
                        <div className="lg:col-span-5 bg-slate-50 rounded-2xl p-4.5 border border-slate-150 grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">DB Records Found</label>
                                <input 
                                    type="number" 
                                    value={dbRecords} 
                                    onChange={e => setDbRecords(Math.max(0, parseInt(e.target.value) || 0))}
                                    className="w-full text-xs font-bold px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg outline-none focus:ring-1 focus:ring-blue-400"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Other Sources found</label>
                                <input 
                                    type="number" 
                                    value={otherRecords} 
                                    onChange={e => setOtherRecords(Math.max(0, parseInt(e.target.value) || 0))}
                                    className="w-full text-xs font-bold px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg outline-none focus:ring-1 focus:ring-blue-400"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Duplication Discards</label>
                                <input 
                                    type="number" 
                                    value={duplicatesRemoved} 
                                    onChange={e => setDuplicatesRemoved(Math.max(0, parseInt(e.target.value) || 0))}
                                    className="w-full text-xs font-bold px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg outline-none focus:ring-1 focus:ring-blue-400"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Title/Abs Screened</label>
                                <input 
                                    type="number" 
                                    value={recordsScreened} 
                                    onChange={e => setRecordsScreened(Math.max(0, parseInt(e.target.value) || 0))}
                                    className="w-full text-xs font-bold px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg outline-none focus:ring-1 focus:ring-blue-400"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[9px] font-bold text-red-500 uppercase tracking-wider block">Title/Abs Excluded</label>
                                <input 
                                    type="number" 
                                    value={recordsExcluded} 
                                    onChange={e => setRecordsExcluded(Math.max(0, parseInt(e.target.value) || 0))}
                                    className="w-full text-xs font-bold px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg outline-none focus:ring-1 focus:ring-blue-400"
                                />
                            </div>
                            <div className="space-y-1 bg-blue-50/50 p-1.5 rounded-lg border border-blue-100">
                                <label className="text-[9px] font-bold text-blue-700 uppercase tracking-wider block">Full-Text Assessed</label>
                                <input 
                                    type="number" 
                                    value={fullTextAssessed} 
                                    onChange={e => setFullTextAssessed(Math.max(0, parseInt(e.target.value) || 0))}
                                    className="w-full text-xs font-bold px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg outline-none focus:ring-1 focus:ring-blue-400"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[9px] font-bold text-red-500 uppercase tracking-wider block">Full-Text Excluded</label>
                                <input 
                                    type="number" 
                                    value={fullTextExcluded} 
                                    onChange={e => setFullTextExcluded(Math.max(0, parseInt(e.target.value) || 0))}
                                    className="w-full text-xs font-bold px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg outline-none focus:ring-1 focus:ring-blue-400"
                                />
                            </div>
                            <div className="space-y-1 bg-emerald-50/50 p-1.5 rounded-lg border border-emerald-100">
                                <label className="text-[9px] font-bold text-emerald-800 uppercase tracking-wider block">Finally Included</label>
                                <input 
                                    type="number" 
                                    value={finalIncluded} 
                                    onChange={e => setFinalIncluded(Math.max(0, parseInt(e.target.value) || 0))}
                                    className="w-full text-xs font-bold px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg outline-none focus:ring-1 focus:ring-blue-400"
                                />
                            </div>
                        </div>

                        {/* Interactive flow schematic visual graph diagram */}
                        <div className="lg:col-span-7 flex flex-col items-center justify-center p-6 bg-slate-50 rounded-2xl border border-slate-200 relative min-h-[380px]">
                            {/* Funnel chart steps */}
                            <div className="flex flex-col items-center w-full max-w-sm space-y-5">
                                {/* Databases records */}
                                <div className="w-full grid grid-cols-2 gap-4">
                                    <div className="bg-slate-900 text-white rounded-xl p-3 border border-slate-800 shadow-sm text-center">
                                        <p className="text-[9px] text-slate-400 uppercase tracking-wider font-bold">Databases</p>
                                        <p className="text-sm font-bold font-mono">{dbRecords}</p>
                                    </div>
                                    <div className="bg-slate-900/90 text-white rounded-xl p-3 border border-slate-800 shadow-sm text-center">
                                        <p className="text-[9px] text-slate-400 uppercase tracking-wider font-bold">Registers / Other</p>
                                        <p className="text-sm font-bold font-mono">{otherRecords}</p>
                                    </div>
                                </div>

                                <div className="h-4 w-[2px] bg-indigo-300 relative">
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-indigo-500" />
                                </div>

                                {/* Duplicates stage */}
                                <div className="w-full flex items-center gap-3">
                                    <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm flex-1 text-center relative">
                                        <span className="absolute -top-2 left-3 bg-indigo-50 text-indigo-700 text-[8px] font-bold px-1.5 rounded border border-indigo-100">Stage 1</span>
                                        <p className="text-[9px] text-sm text-slate-500 uppercase tracking-wider font-bold">Duplicates Checked</p>
                                        <p className="text-xs font-bold text-slate-800 mt-1 font-mono">
                                            {dbRecords + otherRecords} total records
                                        </p>
                                    </div>
                                    <div className="flex flex-col items-center shrink-0">
                                        <ArrowRight className="w-4 h-4 text-red-400" />
                                        <span className="text-[9px] text-red-500 font-bold font-mono mt-0.5">-{duplicatesRemoved}</span>
                                    </div>
                                    <div className="bg-red-50/50 border border-red-100 rounded-xl p-2.5 shadow-sm text-center shrink-0 w-24">
                                        <p className="text-[8px] text-red-600 uppercase tracking-wider font-bold">Discarded</p>
                                        <p className="text-xs font-bold text-red-700 font-mono">{duplicatesRemoved}</p>
                                    </div>
                                </div>

                                <div className="h-4 w-[2px] bg-indigo-300 relative">
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-indigo-500" />
                                </div>

                                {/* Screening stage */}
                                <div className="w-full flex items-center gap-3">
                                    <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm flex-1 text-center relative">
                                        <span className="absolute -top-2 left-3 bg-teal-50 text-teal-700 text-[8px] font-bold px-1.5 rounded border border-teal-100">Stage 2</span>
                                        <p className="text-[9px] text-slate-500 uppercase tracking-wider font-bold">Title/Abstract Screened</p>
                                        <p className="text-xs font-bold text-slate-800 mt-1 font-mono">
                                             {recordsScreened} records
                                        </p>
                                    </div>
                                    <div className="flex flex-col items-center shrink-0">
                                        <ArrowRight className="w-4 h-4 text-red-400" />
                                        <span className="text-[9px] text-red-500 font-bold font-mono mt-0.5">-{recordsExcluded}</span>
                                    </div>
                                    <div className="bg-red-50/50 border border-red-100 rounded-xl p-2.5 shadow-sm text-center shrink-0 w-24">
                                        <p className="text-[8px] text-red-600 uppercase tracking-wider font-bold">Excluded</p>
                                        <p className="text-xs font-bold text-red-700 font-mono">{recordsExcluded}</p>
                                    </div>
                                </div>

                                <div className="h-4 w-[2px] bg-blue-300 relative">
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-blue-500" />
                                </div>

                                {/* Full-text Eligibility stage */}
                                <div className="w-full flex items-center gap-3">
                                    <div className="bg-blue-50 border border-blue-200/65 rounded-xl p-3 shadow-sm flex-1 text-center relative">
                                        <span className="absolute -top-2 left-3 bg-blue-500 text-white text-[8px] font-bold px-1.5 rounded">Stage 3</span>
                                        <p className="text-[9px] text-blue-700 uppercase tracking-wider font-bold">Full-text Evaluation</p>
                                        <p className="text-xs font-bold text-blue-900 mt-1 font-mono">
                                             {fullTextAssessed} reports
                                        </p>
                                    </div>
                                    <div className="flex flex-col items-center shrink-0">
                                        <ArrowRight className="w-4 h-4 text-red-400" />
                                        <span className="text-[9px] text-red-500 font-bold font-mono mt-0.5">-{fullTextExcluded}</span>
                                    </div>
                                    <div className="bg-red-50/50 border border-red-100 rounded-xl p-2.5 shadow-sm text-center shrink-0 w-24">
                                        <p className="text-[8px] text-red-600 uppercase tracking-wider font-bold">Not Eligible</p>
                                        <p className="text-xs font-bold text-red-700 font-mono">{fullTextExcluded}</p>
                                    </div>
                                </div>

                                <div className="h-4 w-[2px] bg-emerald-400 relative">
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                                </div>

                                {/* Final synthesis count */}
                                <div className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl p-4.5 border border-emerald-700 shadow-md text-center relative">
                                    <span className="absolute -top-2 left-3 bg-emerald-800 text-white text-[8px] font-bold px-1.5 rounded">Endpoint</span>
                                    <p className="text-[10px] text-emerald-100 uppercase tracking-widest font-bold">Final Studies Included in Synthesis</p>
                                    <p className="text-lg font-bold font-mono mt-1">{finalIncluded}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Qualitative Screener Advice Tips */}
                {initialData.prisma_tips && initialData.prisma_tips.length > 0 && (
                   <div className="pt-4 border-t border-slate-100 space-y-3">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] block">Screener Quality Control Checks</span>
                      <div className="space-y-3">
                         {initialData.prisma_tips.map((tip, idx) => (
                            <div key={idx} className="flex items-start gap-3 p-3 bg-slate-50/80 rounded-xl border border-slate-100">
                               <div className="bg-indigo-50 text-indigo-700 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 shadow-sm border border-indigo-100">
                                  {idx + 1}
                               </div>
                               <p className="text-xs text-slate-700 leading-relaxed font-semibold">{tip}</p>
                            </div>
                         ))}
                      </div>
                   </div>
                )}
            </div>
        </div>
    );
  };

  return (
    <div className="w-full bg-white rounded-2xl shadow-lg border border-blue-200 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-gradient-to-r from-blue-50 via-indigo-50/20 to-white px-6 py-5 border-b border-blue-100 flex justify-between items-center">
        <div className="flex items-center gap-3">
            <div className="bg-slate-950 p-2 rounded-xl shadow-md border border-slate-800 text-blue-400">
                <Crosshair className="w-5 h-5" />
            </div>
            <div>
               <h3 className="font-bold text-slate-900 text-sm font-tech leading-none">Precision Search Command</h3>
               <span className="text-[10px] text-blue-700/80 font-bold uppercase tracking-[0.15em] mt-1.5 inline-block">Platform Syntaxes & Grounding Active</span>
            </div>
        </div>
        <div className="text-xs text-emerald-800 font-mono bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100 flex items-center gap-1 font-bold">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-600 animate-pulse" /> SOTA Active
        </div>
      </div>
      
      <div className="p-6">
        <div className="mb-8 bg-slate-50 p-5 rounded-2xl border border-slate-100 flex items-start gap-3">
            <div className="p-2 bg-white rounded-xl shadow-sm border border-slate-200 shrink-0 mt-0.5 text-blue-600">
               <Crosshair className="w-4 h-4" />
            </div>
            <div>
               <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1">Search Directive Context</p>
               <p className="text-slate-800 font-semibold text-sm whitespace-pre-wrap leading-relaxed">{result.originalQuery}</p>
            </div>
        </div>

        <div>{renderContent()}</div>

        {result.sources && result.sources.length > 0 && (
          <div className="mt-10 pt-6 border-t border-slate-150">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Globe className="w-3.5 h-3.5 text-indigo-500 animate-pulse" /> Grounding Sources Mapped
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
