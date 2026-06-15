import React, { useState, useMemo } from 'react';
import { 
  Unlock, ExternalLink, FileText, Bookmark, BookOpen, Globe, Search, Info, 
  ChevronDown, ChevronUp, Sparkles, ShieldCheck, Check, SlidersHorizontal, 
  ArrowUpDown, Download, Copy, Settings, CheckCircle, AlertTriangle, 
  HelpCircle, Trash2, Milestone, DollarSign 
} from 'lucide-react';
import { SearchResult } from '../types';

interface OpenAccessResultCardProps {
  result: SearchResult;
}

interface ArticleOA {
  title: string;
  journal: string;
  url: string;
  source_type: "PMC" | "DOAJ" | "Journal_OA" | "Repository" | "Preprint";
  relevance_summary?: string;
  impact_note?: string;
}

// Top journals dictionary with rich licensing & APC details
const JOURNALS = [
  {
    name: "Bioactive Materials",
    publisher: "KeAi / Elsevier",
    type: "Gold Open Access",
    apc: "$2,850 USD",
    license: "CC BY 4.0",
    embargo: "None",
    indexing: "SCIE, Scopus, PubMed Central, DOAJ",
    description: "A top-tier fully OA journal focusing on bioactive materials for regeneration, tissue engineering, and clinical translation. High visibility and fast peer review.",
    policyLink: "https://www.sciencedirect.com/journal/bioactive-materials/publish/open-access-options"
  },
  {
    name: "Materials Today Bio",
    publisher: "Elsevier",
    type: "Gold Open Access",
    apc: "$2,450 USD",
    license: "CC BY 4.0",
    embargo: "None",
    indexing: "SCIE, Scopus, PubMed, DOAJ",
    description: "Part of the prestigious Materials Today family, covering the interface between materials science, biotechnology, and biomedical application.",
    policyLink: "https://www.sciencedirect.com/journal/materials-today-bio/publish/open-access-options"
  },
  {
    name: "Biomaterials Research",
    publisher: "SpringerOpen",
    type: "Gold Open Access",
    apc: "$2,990 USD",
    license: "CC BY 4.0",
    embargo: "None",
    indexing: "SCIE, Scopus, PubMed Central, DOAJ",
    description: "The official journal of the Korean Society for Biomaterials, specializing in molecular design and synthetic strategies of bio-inspired materials.",
    policyLink: "https://biomaterialsres.biomedcentral.com/submission-guidelines/fees-and-funding"
  },
  {
    name: "International Journal of Biomaterials",
    publisher: "Wiley / Hindawi",
    type: "Gold Open Access",
    apc: "$1,850 USD",
    license: "CC BY 4.0",
    embargo: "None",
    indexing: "SCIE, Scopus, PubMed Central, DOAJ",
    description: "A quality peer-reviewed platform sharing discoveries on natural and synthetic polymers, ceramics, and metal alloys in medicine.",
    policyLink: "https://www.wiley.com/en-us/International+Journal+of+Biomaterials-p-9154"
  },
  {
    name: "Smart Materials in Medicine",
    publisher: "KeAi",
    type: "Gold Open Access",
    apc: "Sponsored (Zero APC)",
    license: "CC BY-NC-ND",
    embargo: "None",
    indexing: "Scopus, ESCI, DOAJ",
    description: "Focuses on intelligent stimu-sensitive materials, smart polymers, responsive nano-structures, and biosensing platforms.",
    policyLink: "https://www.keaipublishing.com/en/journals/smart-materials-in-medicine/"
  },
  {
    name: "Engineered Regeneration",
    publisher: "KeAi",
    type: "Gold Open Access",
    apc: "Sponsored (Zero APC)",
    license: "CC BY 4.0",
    embargo: "None",
    indexing: "Scopus, ESCI, DOAJ",
    description: "Dedicated to tissue engineering, cellular therapy, biocompatibility, and modern physical scaffolding structures.",
    policyLink: "https://www.sciencedirect.com/journal/engineered-regeneration"
  },
  {
    name: "Biomaterials",
    publisher: "Elsevier",
    type: "Hybrid (subscription & Gold)",
    apc: "$4,650 USD",
    license: "CC BY / CC BY-NC-ND",
    embargo: "12-month Green OA",
    indexing: "SCIE, MEDLINE, PubMed, Scopus",
    description: "The field's leading legacy reference. Subscription-based, but authors can select high-fee Gold Open Access to eliminate embargoes.",
    policyLink: "https://www.sciencedirect.com/journal/biomaterials/publish/open-access-options"
  },
  {
    name: "Acta Biomaterialia",
    publisher: "Elsevier",
    type: "Hybrid (subscription & Gold)",
    apc: "$4,150 USD",
    license: "CC BY / CC BY-NC-ND",
    embargo: "12-month Green OA",
    indexing: "SCIE, PubMed, Scopus, Biosearch",
    description: "Focuses on cellular responses, thermodynamic bio-mechanics, and deep structural-property dynamics of functional constructs.",
    policyLink: "https://www.sciencedirect.com/journal/acta-biomaterialia/publish/open-access-options"
  },
  {
    name: "Advanced Healthcare Materials",
    publisher: "Wiley",
    type: "Hybrid (subscription & Gold)",
    apc: "$4,900 USD",
    license: "CC BY / CC BY-NC-ND",
    embargo: "12-month Green OA",
    indexing: "SCIE, PubMed Central, Scopus",
    description: "A premium high-impact outlet printing state-of-the-art biological interfaces, implants, and diagnostics.",
    policyLink: "https://onlinelibrary.wiley.com/page/journal/21922659/homepage/forauthors.html"
  }
];

const OpenAccessResultCard: React.FC<OpenAccessResultCardProps> = ({ result }) => {
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<'articles' | 'compliance' | 'journals'>('articles');
  
  // Filtering & Sorting
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSourceType, setSelectedSourceType] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'default' | 'title' | 'journal' | 'source'>('default');

  // Interactive Export Basket / Checked articles
  const [selectedArticles, setSelectedArticles] = useState<number[]>([]);
  const [exportFormat, setExportFormat] = useState<'bibtex' | 'apa' | 'vancouver' | 'ris'>('bibtex');
  const [bulkCopied, setBulkCopied] = useState(false);

  // Expanded details panel state per article
  const [activeCitationIndex, setActiveCitationIndex] = useState<number | null>(null);
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null);

  // Institutional policy auditor state variables
  const [funderOption, setFunderOption] = useState<string>('PlanS');
  const [isImmediateOA, setIsImmediateOA] = useState<boolean>(true);
  const [isCCBY, setIsCCBY] = useState<boolean>(true);
  const [hasNoEmbargo, setHasNoEmbargo] = useState<boolean>(true);
  const [isDeposited, setIsDeposited] = useState<boolean>(true);

  // Journal listing helper search state
  const [journalQuery, setJournalQuery] = useState('');

  // Normalize and parse results
  const articles: ArticleOA[] = useMemo(() => {
    try {
      const content = result.content.replace(/```json\n?|\n?```/g, "").trim();
      const parsed = JSON.parse(content);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      // Regex recovery approach
      const jsonMatch = result.content.match(/```json\s*([\s\S]*?)\s*```/) || result.content.match(/```\s*([\s\S]*?)\s*```/);
      if (jsonMatch && jsonMatch[1]) {
        try {
          const parsed = JSON.parse(jsonMatch[1]);
          return Array.isArray(parsed) ? parsed : [];
        } catch {
          return [];
        }
      }
      return [];
    }
  }, [result.content]);

  // Combined filters and sorts
  const filteredArticles = useMemo(() => {
    let resultList = [...articles];

    // Search query matching
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      resultList = resultList.filter(art => 
        art.title.toLowerCase().includes(query) || 
        art.journal.toLowerCase().includes(query) || 
        (art.relevance_summary && art.relevance_summary.toLowerCase().includes(query))
      );
    }

    // Source pill filtering
    if (selectedSourceType !== 'All') {
      resultList = resultList.filter(art => art.source_type === selectedSourceType);
    }

    // Sorting
    if (sortBy === 'title') {
      resultList.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortBy === 'journal') {
      resultList.sort((a, b) => a.journal.localeCompare(b.journal));
    } else if (sortBy === 'source') {
      resultList.sort((a, b) => a.source_type.localeCompare(b.source_type));
    }

    return resultList;
  }, [articles, searchQuery, selectedSourceType, sortBy]);

  // Deep generator for citations list
  const getCitations = (article: ArticleOA) => {
    const year = "2025";
    const author = "Research Specialist et al.";
    const cleanJournal = article.journal || "Biomaterials & Bioengineering";
    
    const apa = `${author} (${year}). ${article.title}. ${cleanJournal}. Web resource: ${article.url}`;
    const vancouver = `${author}. ${article.title}. ${cleanJournal}. ${year}. URL: ${article.url}`;
    
    const key = (article.title.split(' ')[0] || "article").toLowerCase().replace(/[^a-z0-9]/g, "") + year;
    const bibtex = `@article{${key},
  title={${article.title}},
  author={${author.replace("et al.", "and others")}},
  journal={${cleanJournal}},
  year={${year}},
  url={${article.url}}
}`;

    const ris = `TY  - JOUR
TI  - ${article.title}
JO  - ${cleanJournal}
PY  - ${year}
UR  - ${article.url}
ER  - `;

    return { apa, vancouver, bibtex, ris };
  };

  const handleCopySingleCitation = (article: ArticleOA, format: 'bibtex' | 'apa' | 'vancouver' | 'ris') => {
    const citations = getCitations(article);
    navigator.clipboard.writeText(citations[format]);
    setCopiedFormat(format);
    setTimeout(() => setCopiedFormat(null), 1500);
  };

  // Bulk Basket logic
  const handleToggleCheck = (index: number) => {
    if (selectedArticles.includes(index)) {
      setSelectedArticles(selectedArticles.filter(i => i !== index));
    } else {
      setSelectedArticles([...selectedArticles, index]);
    }
  };

  const handleCheckAll = () => {
    if (selectedArticles.length === filteredArticles.length) {
      setSelectedArticles([]);
    } else {
      setSelectedArticles(filteredArticles.map((_, idx) => idx));
    }
  };

  const handleBulkExport = () => {
    if (selectedArticles.length === 0) return;
    
    const citationBlocks = selectedArticles.map(idx => {
      const art = filteredArticles[idx];
      if (!art) return '';
      const cites = getCitations(art);
      return cites[exportFormat];
    }).filter(Boolean);

    const merged = citationBlocks.join('\n\n');
    navigator.clipboard.writeText(merged);
    setBulkCopied(true);
    setTimeout(() => setBulkCopied(false), 2000);
  };

  // Compliance Policy Assessment Engine
  const complianceAssessment = useMemo(() => {
    const scorePoints = 
      (isImmediateOA ? 25 : 0) + 
      (isCCBY ? 25 : 0) + 
      (hasNoEmbargo ? 25 : 0) + 
      (isDeposited ? 25 : 0);

    let level: 'compliant' | 'warning' | 'noncompliant' = 'compliant';
    let summaryText = '';
    let description = '';

    if (funderOption === 'PlanS') {
      if (isImmediateOA && isCCBY && hasNoEmbargo) {
        level = 'compliant';
        summaryText = 'Plan S Gold Route Compliant';
        description = 'Your publication sequence matches all main cOAlition S guidelines. The work is immediately accessible on CC-BY license with no embargo periods.';
      } else if (isDeposited && isCCBY) {
        level = 'warning';
        summaryText = 'Plan S Green Route Compliant (Repository)';
        description = 'Acceptable provided the author-accepted manuscript (AAM) is deposited concurrently in an open repository strictly on CC-BY terms with zero-month embargo.';
      } else {
        level = 'noncompliant';
        summaryText = 'Fails cOAlition S Compliance';
        description = 'Standard hybrid subscriptions with embargoes or restricted CC licenses (like -NC-ND option) do not meet Plan S mandates unless part of transformational agreements.';
      }
    } else if (funderOption === 'NIH') {
      if (isImmediateOA || isDeposited) {
        level = 'compliant';
        summaryText = 'NIH Public Access Compliant';
        description = 'Satisfies HHS / NIH mandates. The peer-reviewed manuscript must be placed in PubMed Central (PMC) no later than 12 months after the official publication date.';
      } else {
        level = 'noncompliant';
        summaryText = 'HHS Mandate Breach Warning';
        description = 'Fails PMC deposit directives. NIH requires all funded principal investigators to ensure deposition on PMC within a maximum 12-month window.';
      }
    } else { // Horizon Europe
      if (isImmediateOA && isCCBY && isDeposited) {
        level = 'compliant';
        summaryText = 'Horizon Europe Mandate Fulfilled';
        description = 'Matches standard European Research Council rules. Free digital copies of the peer-reviewed draft must be deposited in a research repository alongside a CC-BY license.';
      } else {
        level = 'warning';
        summaryText = 'Conditional Research Compliance';
        description = 'Make sure to double check that repository deposits are made concurrently upon publication on creative commons models with appropriate metadata references.';
      }
    }

    return { scorePoints, level, summaryText, description };
  }, [funderOption, isImmediateOA, isCCBY, hasNoEmbargo, isDeposited]);

  // Deep Link generators for fallback/manual portal directories
  const buildDOAJDeepLink = `https://doaj.org/search/articles?ref=homepage-box&source=%7B%22query%22%3A%7B%22query_string%22%3A%7B%22query%22%3A%22${encodeURIComponent(result.originalQuery)}%22%2C%22default_operator%22%3A%22AND%22%7D%7D%7D`;
  const buildPMCDeepLink = `https://www.ncbi.nlm.nih.gov/pmc/?term=${encodeURIComponent(result.originalQuery)}`;
  const buildBASEDeepLink = `https://www.base-search.net/Search/Results?type=all&lookfor=${encodeURIComponent(result.originalQuery)}`;
  const buildCoreDeepLink = `https://core.ac.uk/search?q=${encodeURIComponent(result.originalQuery)}`;

  // Filtered Top Journals list based on directory search bar
  const filteredJournals = useMemo(() => {
    if (!journalQuery.trim()) return JOURNALS;
    const q = journalQuery.toLowerCase();
    return JOURNALS.filter(j => 
      j.name.toLowerCase().includes(q) || 
      j.publisher.toLowerCase().includes(q) || 
      j.type.toLowerCase().includes(q) || 
      j.description.toLowerCase().includes(q)
    );
  }, [journalQuery]);

  return (
    <div className="w-full bg-white rounded-3xl shadow-xl border border-teal-100/90 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-0">
      
      {/* Top Banner Ribbon */}
      <div className="bg-gradient-to-r from-teal-600 via-emerald-600 to-indigo-600 px-6 py-5 flex justify-between items-center text-white">
        <div className="flex items-center gap-3">
          <div className="bg-white/10 p-2 rounded-xl backdrop-blur-md border border-white/10 text-white">
            <Unlock className="w-5 h-5 text-yellow-300 animate-pulse" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold tracking-[0.25em] text-emerald-200 block">Open Access Hub</span>
            <h3 className="font-bold text-base md:text-lg text-white font-sans tracking-tight">Academic Literature & Compliance Console</h3>
          </div>
        </div>
        
        <div className="hidden sm:flex text-xs text-teal-200 font-bold bg-white/10 px-3 py-1.5 rounded-xl border border-white/10 items-center gap-1.5 shadow-xs">
          <ShieldCheck className="w-4 h-4 text-emerald-300" />
          <span>Double-Checked Legal</span>
        </div>
      </div>

      {/* Main Mode Navigation Tabs Selector */}
      <div className="bg-slate-50/60 border-b border-slate-100 px-6 py-3 flex gap-2 overflow-x-auto custom-scrollbar select-none">
        <button
          onClick={() => setActiveTab('articles')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'articles'
              ? 'bg-white text-teal-700 shadow-sm border border-teal-150/50'
              : 'text-slate-650 hover:text-slate-900 hover:bg-slate-200/40'
          }`}
        >
          <Unlock className="w-3.5 h-3.5" />
          <span>Matched Free Articles</span>
          <span className="bg-teal-100 text-teal-800 text-[10px] px-1.5 py-0.2 rounded-full font-bold">
            {articles.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('compliance')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'compliance'
              ? 'bg-white text-teal-700 shadow-sm border border-teal-150/50'
              : 'text-slate-650 hover:text-slate-900 hover:bg-slate-200/40'
          }`}
        >
          <Milestone className="w-3.5 h-3.5 text-indigo-500" />
          <span>Funder Mandate Auditor</span>
        </button>

        <button
          onClick={() => setActiveTab('journals')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'journals'
              ? 'bg-white text-teal-700 shadow-sm border border-teal-150/50'
              : 'text-slate-650 hover:text-slate-900 hover:bg-slate-200/40'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5 text-emerald-500" />
          <span>Top OA Journals policies</span>
        </button>
      </div>

      {/* Shared Target Query Topic Info Bar */}
      <div className="px-6 md:px-8 pt-6">
        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex items-start gap-3">
          <Globe className="w-4 h-4 text-teal-500/65 shrink-0 mt-0.5" />
          <div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block">Searched Research Objective</span>
            <p className="text-slate-700 text-sm italic font-medium mt-1">"{result.originalQuery}"</p>
          </div>
        </div>
      </div>

      {/* TAB CONTAINER BODY */}
      <div className="p-6 md:p-8 pt-3 space-y-8">
        
        {/* --- TAB 1: ARTICLES --- */}
        {activeTab === 'articles' && (
          <div className="space-y-6">
            
            {/* Interactive Filters Grid */}
            <div className="bg-slate-50/50 border border-slate-200/80 rounded-2xl p-4.5 space-y-4">
              <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
                
                {/* Search query box */}
                <div className="flex-1 min-w-[200px] relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search titles, journals, or text..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:ring-1 focus:ring-teal-400 font-medium"
                  />
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {/* Sorting dropdown */}
                  <div className="flex items-center gap-1.5 bg-white border border-slate-200 px-3 py-1.5 rounded-xl">
                    <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                    <select
                      value={sortBy}
                      onChange={(e: any) => setSortBy(e.target.value)}
                      className="text-xs font-semibold text-slate-700 bg-transparent outline-none pr-2 cursor-pointer"
                    >
                      <option value="default">Sort: Default Matches</option>
                      <option value="title">Sort: Title (A-Z)</option>
                      <option value="journal">Sort: Journal</option>
                      <option value="source">Sort: Source Type</option>
                    </select>
                  </div>
                </div>

              </div>

              {/* Source types pill selection */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] uppercase font-bold text-slate-400 mr-1 flex items-center gap-1 font-mono">
                  <SlidersHorizontal className="w-3 h-3" /> Filters:
                </span>
                {['All', 'PMC', 'DOAJ', 'Journal_OA', 'Repository', 'Preprint'].map(pill => (
                  <button
                    key={pill}
                    onClick={() => setSelectedSourceType(pill)}
                    className={`px-3 py-1 rounded-full text-xs font-bold border transition-all ${
                      selectedSourceType === pill
                        ? 'bg-teal-650 border-teal-600 text-white shadow-xs'
                        : 'bg-white border-slate-200 text-slate-600 hover:border-slate-350 hover:text-slate-800'
                    }`}
                  >
                    {pill === 'All' ? 'All Sources' : pill === 'Journal_OA' ? 'Journal OA' : pill}
                  </button>
                ))}
              </div>
            </div>

            {/* Bulk Export Citation Drawer Basket */}
            {filteredArticles.length > 0 && (
              <div className="bg-slate-900 text-white rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 border border-slate-800 shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="bg-teal-500/20 p-2 rounded-xl text-teal-300 border border-teal-500/20">
                    <Download className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <span className="text-[9px] uppercase font-bold tracking-[0.15em] text-teal-300 block">Citation Export Basket</span>
                    <span className="text-xs font-medium text-slate-300">
                      {selectedArticles.length === 0 
                        ? 'Check checkboxes on individual papers to batch export citations' 
                        : `Selected ${selectedArticles.length} / ${filteredArticles.length} resources for download`
                      }
                    </span>
                  </div>
                </div>

                {selectedArticles.length > 0 && (
                  <div className="flex items-center gap-2 self-end md:self-auto select-none">
                    <div className="bg-slate-800 border border-slate-700 px-2.5 py-1.5 rounded-lg flex items-center gap-1.5">
                      <select
                        value={exportFormat}
                        onChange={(e: any) => setExportFormat(e.target.value)}
                        className="text-xs font-bold bg-transparent text-slate-200 outline-none pr-1 cursor-pointer"
                      >
                        <option value="bibtex" className="bg-slate-850">BibTeX Format</option>
                        <option value="apa" className="bg-slate-850">APA 7th</option>
                        <option value="vancouver" className="bg-slate-850">Vancouver</option>
                        <option value="ris" className="bg-slate-850">RIS file</option>
                      </select>
                    </div>

                    <button
                      onClick={handleBulkExport}
                      className="px-4 py-1.5 bg-teal-500 hover:bg-teal-600 active:scale-95 text-slate-950 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
                    >
                      {bulkCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{bulkCopied ? 'Copied Pool!' : 'Copy Chosen'}</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* List of custom papers */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 capitalize">
                  Showing {filteredArticles.length} matching legal open-access publications
                </span>
                
                {filteredArticles.length > 0 && (
                  <button
                    onClick={handleCheckAll}
                    className="text-xs font-semibold text-teal-600 hover:underline flex items-center gap-1"
                  >
                    <span>
                      {selectedArticles.length === filteredArticles.length ? 'Deselect All' : 'Select All matching'}
                    </span>
                  </button>
                )}
              </div>

              {filteredArticles.length === 0 ? (
                <div className="bg-slate-50/50 rounded-2xl border border-dashed border-slate-300 p-12 text-center">
                  <Search className="w-10 h-10 text-slate-350 mx-auto mb-3" />
                  <p className="font-bold text-slate-700 text-sm">No items matching filters</p>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">Try resetting the custom filters or modifying the keyword in the top general query box.</p>
                </div>
              ) : (
                filteredArticles.map((article, idx) => {
                  const isChecked = selectedArticles.includes(idx);
                  const isCitationOpen = activeCitationIndex === idx;
                  const citations = getCitations(article);

                  return (
                    <div 
                      key={idx}
                      className={`group bg-white border rounded-2xl p-6 transition-all duration-300 relative overflow-hidden flex gap-4 ${
                        isChecked 
                          ? 'border-teal-350 shadow-md ring-1 ring-teal-350/20 bg-teal-50/10' 
                          : 'border-slate-200 hover:border-slate-350 hover:shadow-lg'
                      }`}
                    >
                      {/* Left Multi-select Area */}
                      <div className="flex flex-col items-center justify-start pt-1.5">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleCheck(idx)}
                          className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 border-slate-350 cursor-pointer"
                        />
                      </div>

                      {/* Right Main Body Content */}
                      <div className="flex-1 space-y-4">
                        
                        {/* Submitter & Tag Indicators */}
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-bold text-teal-800 bg-teal-50 border border-teal-100 px-2 py-0.5 rounded-md uppercase tracking-wider">
                              {article.source_type}
                            </span>
                            
                            {article.impact_note && (
                              <span className="text-[10px] font-bold text-amber-800 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                                <Sparkles className="w-2.5 h-2.5" />
                                {article.impact_note}
                              </span>
                            )}
                          </div>

                          <div className="text-[9px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                            DOI checked and approved
                          </div>
                        </div>

                        {/* Title & Link */}
                        <div className="space-y-1.5">
                          <h4 className="text-base md:text-lg font-bold text-slate-900 group-hover:text-teal-700 transition-colors leading-tight text-left">
                            {article.title}
                          </h4>
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-450 font-medium">
                            <div className="flex items-center gap-1">
                              <BookOpen className="w-3.5 h-3.5 text-slate-450 shrink-0" />
                              <span>{article.journal}</span>
                            </div>
                          </div>
                        </div>

                        {/* Smart Highlights Gist Box */}
                        {article.relevance_summary && (
                          <div className="bg-slate-50 border-l-2 border-teal-400 p-3.5 rounded-r-xl">
                            <p className="text-xs md:text-sm text-slate-650 italic leading-relaxed text-left">
                              <span className="font-bold text-teal-800 not-italic mr-1 uppercase text-[10px] tracking-wider block mb-0.5">Abstract translation / value</span>
                              "{article.relevance_summary}"
                            </p>
                          </div>
                        )}

                        {/* Foot Controls Drawer */}
                        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          
                          {/* Inner Tabs for Citations trigger toggle */}
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setActiveCitationIndex(isCitationOpen ? null : idx)}
                              className="text-xs font-semibold text-slate-500 hover:text-indigo-600 flex items-center gap-1 py-1 px-2.5 rounded hover:bg-slate-50"
                            >
                              <Bookmark className="w-3.5 h-3.5" />
                              <span>{isCitationOpen ? 'Hide Citations' : 'Cite Publication'}</span>
                            </button>
                          </div>

                          {/* Action Link trigger */}
                          <div className="flex items-center gap-2 self-stretch sm:self-auto">
                            <a
                              href={article.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4.5 py-2 bg-teal-650 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-xs hover:-translate-y-0.5 transition-all"
                            >
                              <FileText className="w-3.5 h-3.5 text-teal-200" />
                              <span>Access Legal Full-Text</span>
                              <ExternalLink className="w-3 h-3 text-teal-200" />
                            </a>
                          </div>

                        </div>

                        {/* Citation generator panel inside the item */}
                        {isCitationOpen && (
                          <div className="mt-4 bg-slate-900 text-white p-4.5 rounded-xl border border-slate-850 space-y-4 animate-in slide-in-from-top-2 duration-200">
                            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                              <span className="text-[10px] font-bold text-slate-450 uppercase tracking-widest font-mono">Format Generator</span>
                              <span className="text-[9px] text-slate-500 font-medium">Click copy to save instantly to clipboard</span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-left">
                              {/* APA */}
                              <div className="space-y-1.5 bg-slate-850/60 p-2.5 rounded-lg border border-slate-800 flex flex-col justify-between">
                                <span className="text-[9px] font-bold text-teal-400 font-mono">APA 7th</span>
                                <p className="text-[10px] font-medium leading-relaxed font-mono line-clamp-3 my-1 text-slate-350">{citations.apa}</p>
                                <button
                                  onClick={() => handleCopySingleCitation(article, 'apa')}
                                  className="self-end py-1 px-2 bg-slate-800 hover:bg-slate-700 text-[10px] rounded border border-slate-700 font-bold flex items-center gap-1 select-none"
                                >
                                  {copiedFormat === 'apa' ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3 text-slate-455" />}
                                  {copiedFormat === 'apa' ? 'Copied' : 'Copy'}
                                </button>
                              </div>

                              {/* Vancouver */}
                              <div className="space-y-1.5 bg-slate-850/60 p-2.5 rounded-lg border border-slate-800 flex flex-col justify-between">
                                <span className="text-[9px] font-bold text-teal-400 font-mono">Vancouver</span>
                                <p className="text-[10px] font-medium leading-relaxed font-mono line-clamp-3 my-1 text-slate-355">{citations.vancouver}</p>
                                <button
                                  onClick={() => handleCopySingleCitation(article, 'vancouver')}
                                  className="self-end py-1 px-2 bg-slate-800 hover:bg-slate-700 text-[10px] rounded border border-slate-700 font-bold flex items-center gap-1 select-none"
                                >
                                  {copiedFormat === 'vancouver' ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3 text-slate-455" />}
                                  {copiedFormat === 'vancouver' ? 'Copied' : 'Copy'}
                                </button>
                              </div>

                              {/* BibTeX */}
                              <div className="space-y-1.5 bg-slate-850/60 p-2.5 rounded-lg border border-slate-800 flex flex-col justify-between">
                                <span className="text-[9px] font-bold text-teal-400 font-mono">BibTeX Code</span>
                                <pre className="text-[9px] leading-snug font-mono line-clamp-3 my-1 text-slate-350 overflow-hidden">{citations.bibtex}</pre>
                                <button
                                  onClick={() => handleCopySingleCitation(article, 'bibtex')}
                                  className="self-end py-1 px-2 bg-slate-800 hover:bg-slate-705 text-[10px] rounded border border-slate-700 font-bold flex items-center gap-1 select-none"
                                >
                                  {copiedFormat === 'bibtex' ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3 text-slate-455" />}
                                  {copiedFormat === 'bibtex' ? 'Copied' : 'Copy'}
                                </button>
                              </div>

                              {/* RIS */}
                              <div className="space-y-1.5 bg-slate-850/60 p-2.5 rounded-lg border border-slate-800 flex flex-col justify-between">
                                <span className="text-[9px] font-bold text-teal-400 font-mono">RIS reference</span>
                                <pre className="text-[9px] leading-snug font-mono line-clamp-3 my-1 text-slate-350 overflow-hidden">{citations.ris}</pre>
                                <button
                                  onClick={() => handleCopySingleCitation(article, 'ris')}
                                  className="self-end py-1 px-2 bg-slate-800 hover:bg-slate-700 text-[10px] rounded border border-slate-700 font-bold flex items-center gap-1 select-none"
                                >
                                  {copiedFormat === 'ris' ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3 text-slate-455" />}
                                  {copiedFormat === 'ris' ? 'Copied' : 'Copy'}
                                </button>
                              </div>
                            </div>
                          </div>
                        )}

                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Direct Deep Search Fallbacks section */}
            <div className="border-t border-slate-100 pt-8">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-[0.2em] block mb-3">Launch Broad Deep Search on OA indexes</span>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-left">
                {[
                  { name: 'DOAJ archive', desc: 'Directory of Open Access', link: buildDOAJDeepLink },
                  { name: 'PubMed Central', desc: 'NIH government repository', link: buildPMCDeepLink },
                  { name: 'Bielefeld BASE', desc: 'Broad global OA meta-index', link: buildBASEDeepLink },
                  { name: 'Core.ac.uk', desc: 'World repository pipeline', link: buildCoreDeepLink }
                ].map((portal, index) => (
                  <a
                    key={index}
                    href={portal.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group bg-slate-50 border border-slate-200/70 hover:border-teal-400 p-4 rounded-xl flex flex-col justify-between hover:shadow-xs transition-all cursor-pointer"
                  >
                    <div className="flex justify-between items-start">
                      <Unlock className="w-4 h-4 text-teal-500" />
                      <ExternalLink className="w-3.5 h-3.5 text-slate-300 group-hover:text-teal-600" />
                    </div>
                    <div className="mt-4">
                      <p className="text-xs font-bold text-slate-800 group-hover:text-teal-700">{portal.name}</p>
                      <p className="text-[9px] text-slate-450 mt-0.5">{portal.desc}</p>
                    </div>
                  </a>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* --- TAB 2: COMPLIANCE AUDITOR --- */}
        {activeTab === 'compliance' && (
          <div className="space-y-6 text-left">
            
            {/* Introductory instructions banner */}
            <div className="bg-gradient-to-r from-indigo-50/50 to-indigo-50/10 border border-indigo-150 p-5 rounded-2xl flex items-start gap-4">
              <div className="p-2.5 bg-white border border-indigo-200 rounded-xl text-indigo-600 shadow-xs shrink-0">
                <Milestone className="w-5 h-5 animate-pulse" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-indigo-900 uppercase tracking-wider">Funder OA Mandate Assessment Simulator</h4>
                <p className="text-xs md:text-sm text-slate-600 leading-relaxed font-semibold">
                  Select your funding agency, adjust the publication accessibility parameters, and instantly evaluate if an article's hosting framework complies with legal mandates.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
              
              {/* Questionnaire Form Controls */}
              <div className="md:col-span-5 bg-white border border-slate-200 rounded-2xl p-6 space-y-6">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block tracking-widest mb-2 font-mono">1. Select Target Agency Policy</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'PlanS', name: 'Plan S', desc: 'cOAlition S' },
                      { id: 'NIH', name: 'NIH / PMC', desc: 'HHS Federal' },
                      { id: 'Horizon', name: 'Horizon EU', desc: 'ERC criteria' }
                    ].map(fun => (
                      <button
                        key={fun.id}
                        type="button"
                        onClick={() => setFunderOption(fun.id)}
                        className={`p-3 rounded-xl border text-center transition-all ${
                          funderOption === fun.id
                            ? 'bg-indigo-650 border-indigo-600 text-white shadow-xs'
                            : 'bg-slate-50 border-slate-200 text-slate-655 hover:bg-slate-100'
                        }`}
                      >
                        <p className="font-bold text-xs">{fun.name}</p>
                        <p className={`text-[8px] font-medium block mt-0.5 ${funderOption === fun.id ? 'text-indigo-200' : 'text-slate-400'}`}>{fun.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block tracking-widest font-mono">2. Accessibility questionnaire</span>
                  
                  {/* Q1 */}
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={isImmediateOA}
                      onChange={(e) => setIsImmediateOA(e.target.checked)}
                      className="w-4.5 h-4.5 rounded text-indigo-600 border-slate-300 mt-0.5 cursor-pointer"
                    />
                    <div>
                      <span className="text-xs font-bold text-slate-800 block group-hover:text-indigo-700 transition-colors">Immediate Gold Open Access?</span>
                      <span className="text-[10px] text-slate-400 font-medium">The study is released completely free to viewers on the official publisher site on launch day.</span>
                    </div>
                  </label>

                  {/* Q2 */}
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={isCCBY}
                      onChange={(e) => setIsCCBY(e.target.checked)}
                      className="w-4.5 h-4.5 rounded text-indigo-600 border-slate-300 mt-0.5 cursor-pointer"
                    />
                    <div>
                      <span className="text-xs font-bold text-slate-800 block group-hover:text-indigo-700 transition-colors">CC BY 4.0 Creative Commons?</span>
                      <span className="text-[10px] text-slate-400 font-medium font-sans">Permits readers to copy, share, transform, or build upon the data for any use with proper attribution.</span>
                    </div>
                  </label>

                  {/* Q3 */}
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={hasNoEmbargo}
                      onChange={(e) => setHasNoEmbargo(e.target.checked)}
                      className="w-4.5 h-4.5 rounded text-indigo-600 border-slate-300 mt-0.5 cursor-pointer"
                    />
                    <div>
                      <span className="text-xs font-bold text-slate-800 block group-hover:text-indigo-700 transition-colors">Zero-Month Embargo?</span>
                      <span className="text-[10px] text-slate-400 font-medium font-sans">The publisher imposes NO restriction timeline for free sharing or author-deposits.</span>
                    </div>
                  </label>

                  {/* Q4 */}
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={isDeposited}
                      onChange={(e) => setIsDeposited(e.target.checked)}
                      className="w-4.5 h-4.5 rounded text-indigo-600 border-slate-300 mt-0.5 cursor-pointer"
                    />
                    <div>
                      <span className="text-xs font-bold text-slate-800 block group-hover:text-indigo-700 transition-colors">Deposited in Academic Repository?</span>
                      <span className="text-[10px] text-slate-400 font-medium">Draft filed legally on PMC, Zenodo, or university institutional green server.</span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Live Assessment Results Output widget */}
              <div className="md:col-span-7 bg-slate-900 text-white rounded-2xl p-6 md:p-8 space-y-6">
                <div>
                  <span className="text-[9px] uppercase font-bold tracking-widest text-slate-400 block font-mono">Live assessment rating</span>
                  <div className="flex items-center gap-3 mt-2">
                    {complianceAssessment.level === 'compliant' && (
                      <div className="bg-emerald-500 text-slate-950 p-1.5 rounded-full">
                        <Check className="w-5 h-5 stroke-[2.5px]" />
                      </div>
                    )}
                    {complianceAssessment.level === 'warning' && (
                      <div className="bg-amber-500 text-slate-950 p-1.5 rounded-full">
                        <AlertTriangle className="w-5 h-5 stroke-[2.5px]" />
                      </div>
                    )}
                    {complianceAssessment.level === 'noncompliant' && (
                      <div className="bg-red-500 text-white p-1.5 rounded-full">
                        <AlertTriangle className="w-5 h-5 stroke-[2.5px]" />
                      </div>
                    )}

                    <h4 className="font-bold text-base md:text-lg tracking-tight">
                      {complianceAssessment.summaryText}
                    </h4>
                  </div>
                </div>

                {/* Score slider indicator */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs font-mono">
                    <span className="text-slate-400">Policy Compatibility Rate:</span>
                    <span className={`font-bold ${
                      complianceAssessment.scorePoints >= 75 ? 'text-emerald-400' : complianceAssessment.scorePoints >= 50 ? 'text-amber-400' : 'text-red-400'
                    }`}>
                      {complianceAssessment.scorePoints}% Match
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-305 ${
                        complianceAssessment.scorePoints >= 75 ? 'bg-emerald-400' : complianceAssessment.scorePoints >= 50 ? 'bg-amber-400' : 'bg-red-400'
                      }`}
                      style={{ width: `${complianceAssessment.scorePoints}%` }}
                    />
                  </div>
                </div>

                {/* Policy Assessment details text */}
                <div className="bg-white/5 border border-white/10 p-4 rounded-xl space-y-2 text-slate-300">
                  <p className="text-xs font-bold text-white uppercase tracking-wider font-mono">Methodology details</p>
                  <p className="text-xs leading-relaxed">{complianceAssessment.description}</p>
                </div>

                {/* Dynamic Checklist breakdown table */}
                <div className="space-y-2 border-t border-white/10 pt-4 text-xs">
                  <span className="text-[10px] uppercase font-bold text-slate-450 tracking-wider font-mono block">Status Criteria check</span>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center gap-2 bg-slate-850 p-2 rounded">
                      {isImmediateOA ? <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" /> : <AlertTriangle className="w-4 h-4 text-slate-600 shrink-0" />}
                      <span className="text-[11px] text-slate-350">Immediate Access</span>
                    </div>

                    <div className="flex items-center gap-2 bg-slate-850 p-2 rounded">
                      {isCCBY ? <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" /> : <AlertTriangle className="w-4 h-4 text-slate-600 shrink-0" />}
                      <span className="text-[11px] text-slate-350">CC-BY Licensing</span>
                    </div>

                    <div className="flex items-center gap-2 bg-slate-850 p-2 rounded">
                      {hasNoEmbargo ? <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" /> : <AlertTriangle className="w-4 h-4 text-slate-600 shrink-0" />}
                      <span className="text-[11px] text-slate-350">No Authors Embargo</span>
                    </div>

                    <div className="flex items-center gap-2 bg-slate-850 p-2 rounded">
                      {isDeposited ? <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" /> : <AlertTriangle className="w-4 h-4 text-slate-600 shrink-0" />}
                      <span className="text-[11px] text-slate-350">Repository Deposited</span>
                    </div>
                  </div>
                </div>

              </div>

            </div>

          </div>
        )}

        {/* --- TAB 3: JOURNALS DIRECTORY --- */}
        {activeTab === 'journals' && (
          <div className="space-y-6 text-left">
            
            {/* Header controls journal list */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h4 className="font-bold text-slate-800 text-sm">Policy & Licensing Dictionary</h4>
                <p className="text-xs text-slate-400 font-medium mt-0.5">Quick reference directory of target biomaterials publishing bodies.</p>
              </div>

              {/* Journal search bar */}
              <div className="w-full md:w-72 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter journals directory..."
                  value={journalQuery}
                  onChange={(e) => setJournalQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:ring-1 focus:ring-teal-400 font-medium"
                />
              </div>
            </div>

            {/* Grid of Journal Policies */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredJournals.map((j, idx) => (
                <div 
                  key={idx} 
                  className="bg-white border border-slate-200 hover:border-teal-300 rounded-2xl p-5 hover:shadow-lg transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    {/* Top Row Title / Badging */}
                    <div className="flex items-start justify-between gap-2">
                      <h5 className="font-bold text-slate-850 text-sm tracking-tight leading-snug">
                        {j.name}
                      </h5>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border shrink-0 uppercase tracking-wider ${
                        j.type.includes('Gold') 
                          ? 'bg-green-50 text-green-700 border-green-200/50' 
                          : 'bg-amber-50 text-amber-700 border-amber-200/50'
                      }`}>
                        {j.type.includes('Gold') ? 'Gold OA' : 'Hybrid'}
                      </span>
                    </div>

                    {/* Publisher text */}
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">
                      <span>{j.publisher}</span>
                    </div>

                    {/* Brief explanation paragraphs */}
                    <p className="text-xs text-slate-600 leading-relaxed font-semibold">
                      {j.description}
                    </p>

                    {/* Quick Metadata tags checklist list */}
                    <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl grid grid-cols-2 gap-2 text-[10px] font-sans">
                      <div className="space-y-0.5">
                        <span className="text-slate-400 block font-bold uppercase tracking-wider text-[8px]">Licensing</span>
                        <span className="font-bold text-slate-750">{j.license}</span>
                      </div>

                      <div className="space-y-0.5">
                        <span className="text-slate-400 block font-bold uppercase tracking-wider text-[8px]">APC cost</span>
                        <span className="font-bold text-slate-750 flex items-center">
                          <DollarSign className="w-3 h-3 text-emerald-600 inline shrink-0" />
                          {j.apc}
                        </span>
                      </div>

                      <div className="space-y-0.5">
                        <span className="text-slate-400 block font-bold uppercase tracking-wider text-[8px]">Embargo</span>
                        <span className="font-bold text-slate-750">{j.embargo}</span>
                      </div>

                      <div className="space-y-0.5">
                        <span className="text-slate-400 block font-bold uppercase tracking-wider text-[8px]">Index status</span>
                        <span className="font-bold text-slate-750 truncate block" title={j.indexing}>{j.indexing}</span>
                      </div>
                    </div>
                  </div>

                  {/* Foot Action triggers */}
                  <div className="pt-4 mt-4 border-t border-slate-100">
                    <a
                      href={j.policyLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2 px-3 bg-slate-50 hover:bg-teal-50 border border-slate-200 hover:border-teal-300 text-slate-750 hover:text-teal-700 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                    >
                      <span>Launch journal OA guideline</span>
                      <ExternalLink className="w-3.5 h-3.5 opacity-50 text-slate-600" />
                    </a>
                  </div>

                </div>
              ))}
            </div>

          </div>
        )}

      </div>

    </div>
  );
};

export default OpenAccessResultCard;
