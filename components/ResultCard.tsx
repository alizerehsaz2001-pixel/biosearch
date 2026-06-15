import React, { useState, useMemo } from 'react';
import { 
  Copy, Check, Database, ExternalLink, ArrowRightCircle, 
  Quote, Star, Search, Save, Info, Plus, Trash2, RefreshCw, 
  CheckCircle, Sparkles, ArrowRight, ListChecks, HelpCircle, 
  AlertCircle, ShieldCheck, BookOpen 
} from 'lucide-react';
import { SearchResult, AppMode } from '../types';

interface ResultCardProps {
  result: SearchResult;
  onContinue?: (mode: AppMode, content: string) => void;
  onToggleSave?: () => void;
  isSaved?: boolean;
}

interface SearchLink {
  platform: string;
  url: string;
  type: string;
}

interface QueryBuilderJSON {
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
}

const ResultCard: React.FC<ResultCardProps> = ({ result, onContinue, onToggleSave, isSaved }) => {
  const [copied, setCopied] = useState(false);
  const [copiedTab, setCopiedTab] = useState<string | null>(null);
  const [activeQueryTab, setActiveQueryTab] = useState<'pubmed' | 'scopus' | 'scholar' | 'arxiv' | 'lens'>('pubmed');

  // Parse structured JSON if present, else fallback
  const parsedData = useMemo(() => {
    try {
      return JSON.parse(result.content) as QueryBuilderJSON;
    } catch (e) {
      // Try regex search for block
      const jsonMatch = result.content.match(/```json\s*([\s\S]*?)\s*```/) || result.content.match(/```\s*([\s\S]*?)\s*```/);
      if (jsonMatch && jsonMatch[1]) {
        try {
          return JSON.parse(jsonMatch[1]) as QueryBuilderJSON;
        } catch (innerE) {
          return null;
        }
      }
      return null;
    }
  }, [result.content]);

  // If we have parsedData, use state for vocab terms to enable interactive updates
  const initialMesh = parsedData?.search_vocab?.mesh_terms || [];
  const initialSynonyms = parsedData?.search_vocab?.synonyms || [];
  const initialExclusions = parsedData?.search_vocab?.exclusion_terms || [];

  const [meshTerms, setMeshTerms] = useState<string[]>(initialMesh);
  const [synonyms, setSynonyms] = useState<string[]>(initialSynonyms);
  const [exclusionTerms, setExclusionTerms] = useState<string[]>(initialExclusions);

  // Sync state if result changes
  React.useEffect(() => {
    if (parsedData) {
      setMeshTerms(parsedData?.search_vocab?.mesh_terms || []);
      setSynonyms(parsedData?.search_vocab?.synonyms || []);
      setExclusionTerms(parsedData?.search_vocab?.exclusion_terms || []);
    }
  }, [result.id, parsedData]);

  // Form inputs for adding terms
  const [newMesh, setNewMesh] = useState('');
  const [newSynonym, setNewSynonym] = useState('');
  const [newExclusion, setNewExclusion] = useState('');

  // PRISMA diagram states
  const [showPrismaPlanner, setShowPrismaPlanner] = useState(true);
  const [dbRecords, setDbRecords] = useState(240);
  const [otherRecords, setOtherRecords] = useState(12);
  const [duplicatesRemoved, setDuplicatesRemoved] = useState(48);
  const [recordsScreened, setRecordsScreened] = useState(204);
  const [recordsExcluded, setRecordsExcluded] = useState(154);
  const [fullTextAssessed, setFullTextAssessed] = useState(50);
  const [fullTextExcluded, setFullTextExcluded] = useState(41);
  const [finalIncluded, setFinalIncluded] = useState(9);

  // Dynamic compiler based on local vocabulary updates
  const compiledQueries = useMemo(() => {
    if (!parsedData) return null;

    // Compile PubMed Clause
    let pubmedStr = '';
    const pubMedMesh = meshTerms.map(m => `"${m}"[Mesh]`);
    const pubMedSyn = synonyms.map(s => `"${s}"[Title/Abstract]`);
    const pubMedEx = exclusionTerms.map(e => `"${e}"[Title/Abstract]`);

    const pubParts: string[] = [];
    if (pubMedMesh.length > 0) pubParts.push(`(${pubMedMesh.join(' OR ')})`);
    if (pubMedSyn.length > 0) pubParts.push(`(${pubMedSyn.join(' OR ')})`);
    const pubBase = pubParts.length > 0 ? pubParts.join(' AND ') : '';
    if (pubMedEx.length > 0) {
      pubmedStr = pubBase ? `(${pubBase}) NOT (${pubMedEx.join(' OR ')})` : `NOT (${pubMedEx.join(' OR ')})`;
    } else {
      pubmedStr = pubBase;
    }

    // Compile Scopus Clause
    let scopusStr = '';
    const scopusAll = [...meshTerms, ...synonyms].map(t => `"${t}"`);
    if (scopusAll.length > 0) {
      scopusStr = `TITLE-ABS-KEY(${scopusAll.join(' OR ')})`;
    }
    if (exclusionTerms.length > 0) {
      const scEx = `AND NOT TITLE-ABS-KEY(${exclusionTerms.map(e => `"${e}"`).join(' OR ')})`;
      scopusStr = scopusStr ? `(${scopusStr}) ${scEx}` : `NOT TITLE-ABS-KEY(${exclusionTerms.map(e => `"${e}"`).join(' OR ')})`;
    }

    // Scholar standard phrasing
    const scholarMain = [...meshTerms, ...synonyms].map(t => `"${t}"`).join(' ');
    const scholarEx = exclusionTerms.map(e => `-"${e}"`).join(' ');
    const scholarStr = `${scholarMain} ${scholarEx}`.trim();

    // arXiv fields
    let arxivStr = '';
    const axMesh = meshTerms.map(m => `(ti:"${m}" OR abs:"${m}")`);
    const axSyn = synonyms.map(s => `(ti:"${s}" OR abs:"${s}")`);
    const axEx = exclusionTerms.map(e => `(ti:"${e}" OR abs:"${e}")`);
    const axParts: string[] = [];
    if (axMesh.length > 0) axParts.push(`(${axMesh.join(' OR ')})`);
    if (axSyn.length > 0) axParts.push(`(${axSyn.join(' OR ')})`);
    const axBase = axParts.length > 0 ? axParts.join(' AND ') : '';
    if (axEx.length > 0) {
      arxivStr = axBase ? `(${axBase}) ANDNOT (${axEx.join(' OR ')})` : `ANDNOT (${axEx.join(' OR ')})`;
    } else {
      arxivStr = axBase;
    }

    // Lens
    let lensStr = '';
    const lensAll = [...meshTerms, ...synonyms].map(t => `"${t}"`);
    if (lensAll.length > 0) {
      lensStr = `(${lensAll.join(' OR ')})`;
    }
    if (exclusionTerms.length > 0) {
      const lnEx = `NOT (${exclusionTerms.map(e => `"${e}"`).join(' OR ')})`;
      lensStr = lensStr ? `(${lensStr}) ${lnEx}` : `NOT (${exclusionTerms.map(e => `"${e}"`).join(' OR ')})`;
    }

    return {
      pubmed: pubmedStr || parsedData.queries?.pubmed || parsedData.query,
      scopus: scopusStr || parsedData.queries?.scopus || parsedData.query,
      scholar: scholarStr || parsedData.queries?.scholar || parsedData.query,
      arxiv: arxivStr || parsedData.queries?.arxiv || parsedData.query,
      lens: lensStr || parsedData.queries?.lens || parsedData.query,
    };
  }, [meshTerms, synonyms, exclusionTerms, parsedData]);

  const activeQueryText = useMemo(() => {
    if (!compiledQueries) return '';
    return compiledQueries[activeQueryTab] || '';
  }, [compiledQueries, activeQueryTab]);

  const handleCopy = (text: string, tabName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTab(tabName);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
      setCopiedTab(null);
    }, 2000);
  };

  const handleResetVocab = () => {
    if (parsedData) {
      setMeshTerms(parsedData?.search_vocab?.mesh_terms || []);
      setSynonyms(parsedData?.search_vocab?.synonyms || []);
      setExclusionTerms(parsedData?.search_vocab?.exclusion_terms || []);
    }
  };

  const handleAddMesh = () => {
    if (newMesh.trim() && !meshTerms.includes(newMesh.trim())) {
      setMeshTerms([...meshTerms, newMesh.trim()]);
      setNewMesh('');
    }
  };

  const handleRemoveMesh = (term: string) => {
    setMeshTerms(meshTerms.filter(t => t !== term));
  };

  const handleAddSynonym = () => {
    if (newSynonym.trim() && !synonyms.includes(newSynonym.trim())) {
      setSynonyms([...synonyms, newSynonym.trim()]);
      setNewSynonym('');
    }
  };

  const handleRemoveSynonym = (term: string) => {
    setSynonyms(synonyms.filter(t => t !== term));
  };

  const handleAddExclusion = () => {
    if (newExclusion.trim() && !exclusionTerms.includes(newExclusion.trim())) {
      setExclusionTerms([...exclusionTerms, newExclusion.trim()]);
      setNewExclusion('');
    }
  };

  const handleRemoveExclusion = (term: string) => {
    setExclusionTerms(exclusionTerms.filter(t => t !== term));
  };

  // Live Query Launch Links
  const pubMedLink = `https://pubmed.ncbi.nlm.nih.gov/?term=${encodeURIComponent(compiledQueries?.pubmed || result.content)}`;
  const scopusLink = `https://www.scopus.com/results/results.uri?s=${encodeURIComponent(compiledQueries?.scopus || result.content)}&src=s&sot=b`;
  const scholarLink = `https://scholar.google.com/scholar?q=${encodeURIComponent(compiledQueries?.scholar || result.content)}`;
  const arxivLink = `https://arxiv.org/search/?query=${encodeURIComponent(compiledQueries?.arxiv || result.content)}&searchtype=all`;
  const lensLink = `https://www.lens.org/lens/search/scholar/list?q=${encodeURIComponent(compiledQueries?.lens || result.content)}`;

  const activeLaunchLink = useMemo(() => {
    switch (activeQueryTab) {
      case 'pubmed': return pubMedLink;
      case 'scopus': return scopusLink;
      case 'scholar': return scholarLink;
      case 'arxiv': return arxivLink;
      case 'lens': return lensLink;
      default: return scholarLink;
    }
  }, [activeQueryTab, pubMedLink, scopusLink, scholarLink, arxivLink, lensLink]);

  // Legacy parser wrapper
  if (!parsedData) {
    return (
      <div className="w-full bg-white rounded-3xl shadow-lg border border-indigo-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="bg-gradient-to-r from-indigo-50 to-slate-50 px-6 py-4 border-b border-indigo-100 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-white p-1.5 rounded-md shadow-sm border border-indigo-100 text-indigo-600">
              <Database className="w-4 h-4" />
            </div>
            <h3 className="font-semibold text-slate-800">Generated Search String</h3>
          </div>
          <div className="flex items-center gap-2">
            {onToggleSave && (
              <button 
                onClick={onToggleSave}
                className={`p-1.5 rounded-lg border transition-all duration-200 ${
                  isSaved 
                    ? 'bg-amber-50 border-amber-200 text-amber-500 shadow-sm' 
                    : 'bg-white border-transparent text-slate-300 hover:text-amber-500 hover:bg-amber-50'
                }`}
                title={isSaved ? "Remove from Bookmarks" : "Save to Bookmarks"}
              >
                <Star className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
              </button>
            )}
            <div className="text-xs text-indigo-700 font-medium bg-white px-2 py-1 rounded border border-indigo-200 flex items-center gap-1 shadow-sm">
              <Quote className="w-3 h-3" />
              <span>140+ Citations</span>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          <div className="mb-4">
            <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-2">Original Topic</p>
            <p className="text-slate-700 italic border-l-2 border-slate-200 pl-3 py-1">
              "{result.originalQuery}"
            </p>
          </div>

          <div className="relative group">
            <pre className="bg-slate-900 text-slate-100 p-5 rounded-xl text-sm leading-relaxed whitespace-pre-wrap font-mono custom-scrollbar overflow-x-auto border border-slate-800 shadow-inner min-h-[100px]">
              {result.content}
            </pre>
            
            <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <button
                onClick={() => handleCopy(result.content, 'Legacy')}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white p-2 rounded-lg border border-slate-700 transition-colors shadow-lg backdrop-blur-sm"
              >
                {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {result.explanation && (
            <div className="mt-4 p-4 bg-indigo-50 border border-indigo-100 rounded-xl text-sm text-slate-700">
              <p className="font-semibold text-indigo-900 mb-1">Strategy Explanation:</p>
              <p>{result.explanation}</p>
            </div>
          )}

          {/* Action Buttons Grid */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-4 gap-3">
            <button 
              onClick={() => handleCopy(result.content, 'Legacy')}
              className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-lg font-semibold transition-all text-sm shadow-md shadow-indigo-100"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied!' : 'Copy Query'}
            </button>
            
            {onToggleSave && (
              <button 
                onClick={onToggleSave}
                className={`flex items-center justify-center gap-2 py-2.5 rounded-lg font-medium transition-colors text-sm shadow-sm border ${
                  isSaved 
                    ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100' 
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <Save className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
                {isSaved ? 'Saved' : 'Save String'}
              </button>
            )}

            <a 
              href={pubMedLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 py-2.5 rounded-lg font-medium transition-colors text-sm shadow-sm"
            >
              <Search className="w-4 h-4 text-indigo-500" />
              Test in PubMed
              <ExternalLink className="w-3 h-3 opacity-40" />
            </a>
            <a 
              href={scopusLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 py-2.5 rounded-lg font-medium transition-colors text-sm shadow-sm"
            >
              <Database className="w-4 h-4 text-orange-500" />
              Test in Scopus
              <ExternalLink className="w-3 h-3 opacity-40" />
            </a>
          </div>
          
          {onContinue && (
            <div className="mt-4 pt-4 border-t border-slate-100">
              <button
                onClick={() => onContinue('PICO_PROTOCOL', result.originalQuery)}
                className="w-full flex items-center justify-center gap-2 text-slate-500 hover:text-teal-600 hover:bg-teal-50 py-2 rounded-lg transition-colors text-sm font-medium"
              >
                <span>Next Step: Define PICO Protocol</span>
                <ArrowRightCircle className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // --- UPGRADED HIGH-FIDELITY WORKSPACE ---
  return (
    <div className="w-full bg-white rounded-3xl shadow-xl border border-indigo-100/90 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-0">
      
      {/* Top Ribbon Branding & Title */}
      <div className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-teal-600 px-6 py-5 flex justify-between items-center text-white">
        <div className="flex items-center gap-3">
          <div className="bg-white/10 p-2 rounded-xl backdrop-blur-md border border-white/10 text-white">
            <Sparkles className="w-5 h-5 text-yellow-300" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold tracking-[0.25em] text-indigo-200 block">AI Literary Search Engine</span>
            <h3 className="font-bold text-base md:text-lg text-white font-sans tracking-tight">Interactive Query Formulation Workspace</h3>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {onToggleSave && (
            <button 
              onClick={onToggleSave}
              className={`p-2 rounded-xl border transition-all duration-200 ${
                isSaved 
                  ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-sm' 
                  : 'bg-white/10 border-transparent text-white/70 hover:text-white hover:bg-white/20'
              }`}
              title={isSaved ? "Remove from Bookmarks" : "Save to Bookmarks"}
            >
              <Star className={`w-4 h-4 ${isSaved ? 'fill-current text-amber-300' : ''}`} />
            </button>
          )}

          <div className="hidden sm:flex text-xs text-emerald-200 font-bold bg-white/10 px-3 py-1.5 rounded-xl border border-white/10 items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
            <span>PRISMA Standardized</span>
          </div>
        </div>
      </div>

      <div className="p-6 md:p-8 space-y-8">
        
        {/* Original Query Topic Box */}
        <div className="space-y-2">
          <span className="text-xs uppercase font-bold tracking-wider text-slate-400">Target Concept Topic</span>
          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex items-start gap-3">
            <Quote className="w-4 h-4 text-indigo-500/50 shrink-0 mt-0.5" />
            <p className="text-slate-700 font-medium italic text-sm text-left">
              "{result.originalQuery}"
            </p>
          </div>
        </div>

        {/* Strategy Context Card */}
        <div className="bg-gradient-to-r from-indigo-50/70 to-indigo-50/10 border border-indigo-100 rounded-2xl p-5 relative overflow-hidden flex items-start gap-4">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-600"></div>
          <div className="p-2.5 bg-white border border-indigo-200/50 rounded-xl text-indigo-600 shrink-0 shadow-sm">
            <Info className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-indigo-900 uppercase tracking-widest mb-1">Syntactic Search Strategy</h4>
            <p className="text-sm text-slate-700 leading-relaxed font-semibold">{parsedData.explanation}</p>
          </div>
        </div>

        {/* INTERACTIVE VOCABULARY AND CRITERIA BUILDER */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h4 className="font-bold text-slate-800 text-sm font-sans flex items-center gap-2">
                <Database className="w-4 h-4 text-indigo-600" />
                <span>Search Keywords Vocabulary Board</span>
              </h4>
              <p className="text-xs text-slate-400 font-medium mt-0.5">Customize syntax components. Watch compiled queries adapt instantly</p>
            </div>
            
            <button 
              onClick={handleResetVocab}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-wider rounded-lg transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
              Reset baseline terms
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Medical Subject Headings */}
            <div className="bg-gradient-to-b from-indigo-50/40 to-white border border-indigo-100 p-4 rounded-xl flex flex-col justify-between min-h-[220px]">
              <div>
                <div className="flex items-center justify-between mb-3 border-b border-indigo-100/40 pb-2">
                  <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-widest font-mono">MeSH terms (Mesh)</span>
                  <span className="bg-indigo-100 text-indigo-800 text-[10px] font-bold px-1.5 py-0.5 rounded-full font-mono">{meshTerms.length}</span>
                </div>
                <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pb-2">
                  {meshTerms.map((term, index) => (
                    <span key={index} className="inline-flex items-center gap-1 bg-white hover:bg-red-50 text-slate-800 hover:text-red-700 border border-slate-200 hover:border-red-200 px-2.5 py-1 rounded-lg text-xs font-semibold shadow-xs transition-all group">
                      {term}
                      <button onClick={() => handleRemoveMesh(term)} className="text-slate-400 group-hover:text-red-500 transition-colors">
                        <Trash2 className="w-2.5 h-2.5" />
                      </button>
                    </span>
                  ))}
                  {meshTerms.length === 0 && <span className="text-xs text-slate-400 italic py-1">No MeSH elements</span>}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex gap-1.5">
                <input 
                  placeholder="New MeSH..." 
                  className="w-full px-2.5 py-1 text-xs bg-white border border-slate-200 rounded-lg outline-none focus:ring-1 focus:ring-indigo-400 font-medium"
                  value={newMesh}
                  onChange={e => setNewMesh(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAddMesh()}
                />
                <button onClick={handleAddMesh} className="p-1 px-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-all text-xs font-bold font-mono">
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* General Synonyms */}
            <div className="bg-gradient-to-b from-teal-50/40 to-white border border-teal-100 p-4 rounded-xl flex flex-col justify-between min-h-[220px]">
              <div>
                <div className="flex items-center justify-between mb-3 border-b border-teal-100/40 pb-2">
                  <span className="text-[10px] font-bold text-teal-700 uppercase tracking-widest font-mono font-sans">Synonyms (Title/Abs)</span>
                  <span className="bg-teal-100 text-teal-800 text-[10px] font-bold px-1.5 py-0.5 rounded-full font-mono">{synonyms.length}</span>
                </div>
                <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pb-2">
                  {synonyms.map((syn, index) => (
                    <span key={index} className="inline-flex items-center gap-1 bg-white hover:bg-red-50 text-slate-800 hover:text-red-700 border border-slate-200 hover:border-red-200 px-2.5 py-1 rounded-lg text-xs font-semibold shadow-xs transition-all group">
                      {syn}
                      <button onClick={() => handleRemoveSynonym(syn)} className="text-slate-400 group-hover:text-red-500 transition-colors">
                        <Trash2 className="w-2.5 h-2.5" />
                      </button>
                    </span>
                  ))}
                  {synonyms.length === 0 && <span className="text-xs text-slate-400 italic py-1">No synonyms entered</span>}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex gap-1.5">
                <input 
                  placeholder="New Synonym..." 
                  className="w-full px-2.5 py-1 text-xs bg-white border border-slate-200 rounded-lg outline-none focus:ring-1 focus:ring-teal-400 font-medium"
                  value={newSynonym}
                  onChange={e => setNewSynonym(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAddSynonym()}
                />
                <button onClick={handleAddSynonym} className="p-1 px-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-all text-xs font-bold font-mono">
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Exclusions group */}
            <div className="bg-gradient-to-b from-red-50/40 to-white border border-red-100 p-4 rounded-xl flex flex-col justify-between min-h-[220px]">
              <div>
                <div className="flex items-center justify-between mb-3 border-b border-red-100/40 pb-2">
                  <span className="text-[10px] font-bold text-red-700 uppercase tracking-widest font-mono">Exclusions (NOT)</span>
                  <span className="bg-red-100 text-red-800 text-[10px] font-bold px-1.5 py-0.5 rounded-full font-mono">{exclusionTerms.length}</span>
                </div>
                <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pb-2">
                  {exclusionTerms.map((ex, index) => (
                    <span key={index} className="inline-flex items-center gap-1 bg-white hover:bg-red-50 text-slate-800 hover:text-red-700 border border-slate-200 hover:border-red-200 px-2.5 py-1 rounded-lg text-xs font-semibold shadow-xs transition-all group">
                      {ex}
                      <button onClick={() => handleRemoveExclusion(ex)} className="text-slate-400 group-hover:text-red-500 transition-colors">
                        <Trash2 className="w-2.5 h-2.5" />
                      </button>
                    </span>
                  ))}
                  {exclusionTerms.length === 0 && <span className="text-xs text-slate-400 italic py-1">No exclusion terms</span>}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex gap-1.5">
                <input 
                  placeholder="Exclude term..." 
                  className="w-full px-2.5 py-1 text-xs bg-white border border-slate-200 rounded-lg outline-none focus:ring-1 focus:ring-red-400 font-medium"
                  value={newExclusion}
                  onChange={e => setNewExclusion(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAddExclusion()}
                />
                <button onClick={handleAddExclusion} className="p-1 px-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all text-xs font-bold font-mono">
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

          </div>

          {/* Visual color key boolean flowchart tree */}
          <div className="bg-slate-950 rounded-2xl p-4 border border-slate-800 shadow-inner">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] block mb-2">Live Expression Compiler preview</span>
            <div className="flex flex-wrap items-center gap-2 font-mono text-[11px] text-slate-300 leading-relaxed max-h-40 overflow-y-auto">
              <span className="text-indigo-400 font-bold">(</span>
              {meshTerms.length > 0 ? (
                <span className="bg-indigo-950/70 text-indigo-300 hover:bg-indigo-950 px-2.5 py-1 rounded border border-indigo-800/40 select-none">
                  [Mesh]: {meshTerms.join(' OR ')}
                </span>
              ) : (
                <span className="text-slate-600 italic">No MeSH Block</span>
              )}

              <span className="text-yellow-400 font-bold">AND</span>

              {synonyms.length > 0 ? (
                <span className="bg-teal-950/70 text-teal-300 hover:bg-teal-950 px-2.5 py-1 rounded border border-teal-850/40 select-none">
                  [Title/Abstract]: {synonyms.join(' OR ')}
                </span>
              ) : (
                <span className="text-slate-600 italic">No Synonyms Block</span>
              )}
              <span className="text-indigo-400 font-bold">)</span>

              {exclusionTerms.length > 0 && (
                <>
                  <span className="text-red-400 font-bold">NOT</span>
                  <span className="bg-red-950/70 text-red-300 hover:bg-red-950 px-2.5 py-1 rounded border border-red-850/40 select-none">
                    Exclusion: {exclusionTerms.join(' OR ')}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* COMPLIANT MULTI-PLATFORM TABS PANEL */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] block">Platform Synctatic Code compilation</span>
              <h4 className="font-bold text-slate-800 text-xs mt-0.5">Database optimized advanced clauses</h4>
            </div>

            <div className="flex flex-wrap p-1 bg-slate-200/60 rounded-xl justify-start items-center gap-1 border border-slate-200 select-none">
              {(['pubmed', 'scopus', 'scholar', 'arxiv', 'lens'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveQueryTab(tab)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all capitalize ${
                    activeQueryTab === tab 
                      ? 'bg-slate-900 text-white shadow-sm' 
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/40'
                  }`}
                >
                  {tab === 'scholar' ? 'Google Scholar' : tab === 'lens' ? 'Lens.org' : tab}
                </button>
              ))}
            </div>
          </div>

          <div className="p-6 space-y-4">
            <div className="flex justify-between items-center bg-indigo-50/50 border border-indigo-100/30 px-4 py-2.5 rounded-xl text-xs">
              <span className="font-bold text-indigo-950 flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                Standard {activeQueryTab.toUpperCase()} Boolean string ready
              </span>
              <span className="text-[10px] text-slate-400 font-mono font-bold uppercase">
                {activeQueryTab === 'pubmed' ? 'Mesh and [pt] tags matched' : 'Exact boolean expression'}
              </span>
            </div>

            <div className="relative group">
              <pre className="bg-slate-950 text-emerald-400 p-5 rounded-xl text-xs font-mono overflow-y-auto max-h-56 leading-relaxed border border-slate-800 whitespace-pre-wrap break-all pr-24 select-all shadow-inner">
                {activeQueryText}
              </pre>

              <button 
                onClick={() => handleCopy(activeQueryText, activeQueryTab)}
                className="absolute top-3.5 right-3.5 bg-slate-900/90 hover:bg-slate-800 text-white py-1.5 px-3 rounded-lg border border-slate-700 shadow flex items-center gap-1 text-[11px] font-sans font-semibold transition-all"
              >
                {copied && copiedTab === activeQueryTab ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-green-400" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>

            <div className="bg-indigo-50/50 border border-indigo-100 p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-600 animate-pulse shrink-0" />
                <p className="text-xs font-semibold text-indigo-900 leading-snug">
                  Execute this exact formulated query safely in live literature journals!
                </p>
              </div>

              <a 
                href={activeLaunchLink}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow flex items-center justify-center gap-1.5 text-xs font-bold transition-all shrink-0 hover:-translate-y-0.5"
              >
                <span>Launch in {activeQueryTab.toUpperCase()}</span>
                <ExternalLink className="w-3.5 h-3.5 text-indigo-100" />
              </a>
            </div>

          </div>
        </div>

        {/* DIRECT TARGET PORTALS */}
        <div className="space-y-3">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] block">Search portal gate launchers</span>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {[
              { label: 'PubMed', link: pubMedLink, tech: 'NLM medical library', color: 'text-blue-600' },
              { label: 'Scopus', link: scopusLink, tech: 'Elsevier indexing', color: 'text-orange-600' },
              { label: 'Google Scholar', link: scholarLink, tech: 'Broad search database', color: 'text-indigo-650' },
              { label: 'arXiv Preprints', link: arxivLink, tech: 'Physical & ML preprints', color: 'text-red-650' },
              { label: 'Lens.org', link: lensLink, tech: 'Patent & scholar tracker', color: 'text-emerald-650' }
            ].map((port, idx) => (
              <a 
                key={idx}
                href={port.link}
                target="_blank"
                rel="noopener noreferrer"
                className="group p-4 bg-white border border-slate-200 rounded-xl hover:border-indigo-400 hover:shadow-xs transition-all flex flex-col justify-between align-start text-left shrink-0"
              >
                <div className="flex items-start justify-between">
                  <Database className={`w-4 h-4 ${port.color}`} />
                  <ExternalLink className="w-3 h-3 text-slate-300 opacity-60 group-hover:opacity-100 group-hover:text-indigo-600" />
                </div>
                <div className="mt-4">
                  <p className="font-bold text-slate-800 text-xs tracking-tight group-hover:text-indigo-700 transition-colors">{port.label}</p>
                  <p className="text-[9px] text-slate-400 font-medium truncate font-mono mt-0.5">{port.tech}</p>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* INTERACTIVE PRISMA SYSTEMATIC REVIEW FLOW DIAGRAM FLOWCHART */}
        <div className="bg-slate-50/50 border border-slate-200 rounded-2xl p-6 space-y-6">
          <div onClick={() => setShowPrismaPlanner(!showPrismaPlanner)} className="flex items-center justify-between cursor-pointer border-b border-slate-200 pb-3 select-none">
            <div className="flex items-center gap-2.5">
              <div className="bg-slate-900 p-1.5 rounded-lg text-white">
                <ListChecks className="w-4.5 h-4.5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-800 text-sm tracking-tight font-sans">PRISMA Systematic Review Pipeline</h4>
                <p className="text-[10px] text-slate-400 font-medium mt-0.5">Edit study numbers in the left column to render a live filtering flowchart</p>
              </div>
            </div>
            
            <span className="text-xs font-bold text-indigo-600 hover:underline">
              {showPrismaPlanner ? 'Collapse Funnel' : 'Expand Funnel'}
            </span>
          </div>

          {showPrismaPlanner && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start animate-in fade-in duration-300">
              
              {/* Form Input fields */}
              <div className="md:col-span-5 bg-white border border-slate-200 rounded-xl p-4.5 grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-500 uppercase block tracking-wider">Database Records</label>
                  <input 
                    type="number" 
                    value={dbRecords} 
                    onChange={e => setDbRecords(Math.max(0, parseInt(e.target.value) || 0))} 
                    className="w-full text-xs font-semibold px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-1 focus:ring-indigo-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-500 uppercase block tracking-wider">Other registers</label>
                  <input 
                    type="number" 
                    value={otherRecords} 
                    onChange={e => setOtherRecords(Math.max(0, parseInt(e.target.value) || 0))} 
                    className="w-full text-xs font-semibold px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-1 focus:ring-indigo-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-500 uppercase block tracking-wider">Duplicate Rejects</label>
                  <input 
                    type="number" 
                    value={duplicatesRemoved} 
                    onChange={e => setDuplicatesRemoved(Math.max(0, parseInt(e.target.value) || 0))} 
                    className="w-full text-xs font-semibold px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-1 focus:ring-indigo-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-500 uppercase block tracking-wider">Abstracts Screened</label>
                  <input 
                    type="number" 
                    value={recordsScreened} 
                    onChange={e => setRecordsScreened(Math.max(0, parseInt(e.target.value) || 0))} 
                    className="w-full text-xs font-semibold px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-1 focus:ring-indigo-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-red-500 uppercase block tracking-wider">Abstract exclusions</label>
                  <input 
                    type="number" 
                    value={recordsExcluded} 
                    onChange={e => setRecordsExcluded(Math.max(0, parseInt(e.target.value) || 0))} 
                    className="w-full text-xs font-semibold px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-1 focus:ring-indigo-400"
                  />
                </div>

                <div className="space-y-1 bg-indigo-50/40 p-1 rounded-sm border border-indigo-150/50">
                  <label className="text-[9px] font-bold text-indigo-700 uppercase block tracking-wider">Full texts Screened</label>
                  <input 
                    type="number" 
                    value={fullTextAssessed} 
                    onChange={e => setFullTextAssessed(Math.max(0, parseInt(e.target.value) || 0))} 
                    className="w-full text-xs font-semibold px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-1 focus:ring-indigo-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-red-500 uppercase block tracking-wider">Exclusion Reasons</label>
                  <input 
                    type="number" 
                    value={fullTextExcluded} 
                    onChange={e => setFullTextExcluded(Math.max(0, parseInt(e.target.value) || 0))} 
                    className="w-full text-xs font-semibold px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-1 focus:ring-indigo-400"
                  />
                </div>

                <div className="space-y-1 bg-emerald-50/40 p-1 rounded-sm border border-emerald-150/55">
                  <label className="text-[9px] font-bold text-emerald-800 uppercase block tracking-wider">Fully Included</label>
                  <input 
                    type="number" 
                    value={finalIncluded} 
                    onChange={e => setFinalIncluded(Math.max(0, parseInt(e.target.value) || 0))} 
                    className="w-full text-xs font-semibold px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-1 focus:ring-indigo-400"
                  />
                </div>
              </div>

              {/* Dynamic Diagram Visual Flow */}
              <div className="md:col-span-7 bg-white p-5 rounded-xl border border-slate-200 flex flex-col justify-center items-center min-h-[350px]">
                <div className="flex flex-col items-center w-full max-w-sm space-y-4">
                  
                  {/* Database block */}
                  <div className="w-full grid grid-cols-2 gap-3">
                    <div className="bg-slate-900 text-white rounded-lg p-2.5 border border-slate-800 text-center">
                      <p className="text-[8px] text-slate-400 uppercase tracking-widest font-bold">Registers</p>
                      <p className="text-sm font-bold font-mono text-indigo-300">{dbRecords}</p>
                    </div>

                    <div className="bg-slate-900/90 text-white rounded-lg p-2.5 border border-slate-800 text-center">
                      <p className="text-[8px] text-slate-400 uppercase tracking-widest font-bold">Other Sources</p>
                      <p className="text-sm font-bold font-mono text-indigo-300">{otherRecords}</p>
                    </div>
                  </div>

                  <div className="h-3 w-[1.5px] bg-slate-350 relative">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-indigo-500" />
                  </div>

                  {/* Stage 1 Check */}
                  <div className="w-full flex items-center gap-2">
                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 flex-1 text-center relative">
                      <span className="absolute -top-2 left-2 bg-indigo-50 border border-indigo-100 text-indigo-700 text-[8px] font-bold px-1 py-0.5 rounded">Stage 1</span>
                      <p className="text-[9px] text-slate-500 uppercase font-bold">Deduplication Screening</p>
                      <p className="text-[11px] font-semibold text-slate-800 mt-1">{dbRecords + otherRecords} studies</p>
                    </div>
                    <div className="flex flex-col items-center">
                      <ArrowRight className="w-3.5 h-3.5 text-red-400" />
                      <span className="text-[8px] text-red-500 font-bold mt-0.5">-{duplicatesRemoved}</span>
                    </div>
                    <div className="bg-red-50/50 border border-red-100 rounded-lg p-2.5 text-center shrink-0 w-20">
                      <p className="text-[8px] text-red-600 uppercase font-bold">Duplicates</p>
                      <p className="text-[11px] font-bold font-mono text-red-700">{duplicatesRemoved}</p>
                    </div>
                  </div>

                  <div className="h-3 w-[1.5px] bg-slate-350 relative">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-indigo-500" />
                  </div>

                  {/* Stage 2 Check */}
                  <div className="w-full flex items-center gap-2">
                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 flex-1 text-center relative">
                      <span className="absolute -top-2 left-2 bg-teal-50 border border-teal-100 text-teal-700 text-[8px] font-bold px-1 py-0.5 rounded">Stage 2</span>
                      <p className="text-[9px] text-slate-500 uppercase font-bold">Title / Abstract Screening</p>
                      <p className="text-[11px] font-semibold text-slate-800 mt-1">{recordsScreened} records</p>
                    </div>
                    <div className="flex flex-col items-center">
                      <ArrowRight className="w-3.5 h-3.5 text-red-400" />
                      <span className="text-[8px] text-red-500 font-bold mt-0.5">-{recordsExcluded}</span>
                    </div>
                    <div className="bg-red-50/50 border border-red-100 rounded-lg p-2.5 text-center shrink-0 w-20">
                      <p className="text-[8px] text-red-600 uppercase font-bold">Excluded</p>
                      <p className="text-[11px] font-bold font-mono text-red-700">{recordsExcluded}</p>
                    </div>
                  </div>

                  <div className="h-3 w-[1.5px] bg-slate-350 relative">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-indigo-500" />
                  </div>

                  {/* Stage 3 Check */}
                  <div className="w-full flex items-center gap-2">
                    <div className="bg-indigo-50/40 border border-indigo-150 rounded-lg p-2.5 flex-1 text-center relative">
                      <span className="absolute -top-2 left-2 bg-indigo-500 text-white text-[8px] font-semibold px-1 py-0.5 rounded">Stage 3</span>
                      <p className="text-[9px] text-indigo-700 uppercase font-bold font-sans">Full-Text Eligibility Checked</p>
                      <p className="text-[11px] font-semibold text-indigo-900 mt-1">{fullTextAssessed} publications</p>
                    </div>
                    <div className="flex flex-col items-center">
                      <ArrowRight className="w-3.5 h-3.5 text-red-400" />
                      <span className="text-[8px] text-red-500 font-bold mt-0.5">-{fullTextExcluded}</span>
                    </div>
                    <div className="bg-red-50/50 border border-red-100 rounded-lg p-2.5 text-center shrink-0 w-20">
                      <p className="text-[8px] text-red-600 uppercase font-bold">Unsuitable</p>
                      <p className="text-[11px] font-bold font-mono text-red-700">{fullTextExcluded}</p>
                    </div>
                  </div>

                  <div className="h-3 w-[1.5px] bg-slate-350 relative">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                  </div>

                  {/* Endpoint Stage */}
                  <div className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white border border-emerald-700 rounded-lg py-3 px-4 text-center relative">
                    <span className="absolute -top-2 left-2 bg-emerald-800 text-emerald-100 text-[8px] font-bold px-1 rounded">Endpoint</span>
                    <p className="text-[9px] text-emerald-100 uppercase tracking-widest font-bold">Synthesis Included studies</p>
                    <p className="text-base font-bold font-mono mt-0.5">{finalIncluded} studies</p>
                  </div>

                </div>
              </div>

            </div>
          )}
        </div>

        {/* PRISMA TIPS & SCREENING ADVICE */}
        {parsedData.prisma_tips && parsedData.prisma_tips.length > 0 && (
          <div className="space-y-3">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] block">Screener Quality Control guidelines</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {parsedData.prisma_tips.map((tip, index) => (
                <div key={index} className="bg-amber-50/30 border border-amber-150/40 p-4 rounded-xl flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-bold text-slate-800 text-xs font-sans">Methodological Check #{index + 1}</h5>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed font-semibold">{tip}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Dynamic Action Controls / Continue Gate */}
        {onContinue && (
          <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-slate-400 font-semibold">
              <BookOpen className="w-4 h-4 text-slate-400" />
              <span>Next recommended study phase: Translate objectives, constraints into structural trial timelines</span>
            </div>

            <button
              onClick={() => onContinue('PICO_PROTOCOL', result.originalQuery)}
              className="flex items-center justify-center gap-2 border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold px-5 py-2.5 rounded-xl transition-all text-xs shrink-0"
            >
              <span>Map PICO Protocol parameters</span>
              <ArrowRightCircle className="w-4.5 h-4.5 text-indigo-600" />
            </button>
          </div>
        )}

      </div>

    </div>
  );
};

export default ResultCard;
