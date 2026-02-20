
import React, { useState } from 'react';
import { Unlock, ExternalLink, FileText, Bookmark, BookOpen, Globe, Search, Info, ChevronDown, ChevronUp } from 'lucide-react';
import { SearchResult } from '../types';

interface OpenAccessResultCardProps {
  result: SearchResult;
}

interface ArticleOA {
  title: string;
  journal: string;
  url: string;
  open_access: boolean;
  source_type: "PMC" | "DOAJ" | "Journal_OA" | "Repository";
}

const JOURNALS = [
  {
    name: "Bioactive Materials",
    publisher: "KeAi / Elsevier",
    type: "Fully Open Access",
    description: "A top-tier fully OA journal focusing on bioactive materials for regeneration and therapy. High visibility and rapid peer review."
  },
  {
    name: "Materials Today Bio",
    publisher: "Elsevier",
    type: "Fully Open Access",
    description: "Part of the Materials Today family, covering the interface between materials science, biology, and medicine with a broad multidisciplinary scope."
  },
  {
    name: "Biomaterials Research",
    publisher: "SpringerOpen",
    type: "Fully Open Access",
    description: "The official journal of the Korean Society for Biomaterials, focusing on the development and clinical application of biomaterials."
  },
  {
    name: "International Journal of Biomaterials",
    publisher: "Wiley / Hindawi",
    type: "Fully Open Access",
    description: "A peer-reviewed, open access journal publishing original research and review articles on all aspects of biomaterials."
  },
  {
    name: "Smart Materials in Medicine",
    publisher: "KeAi",
    type: "Fully Open Access",
    description: "Focuses on stimuli-responsive and 'smart' materials for sensing, drug delivery, and tissue engineering applications."
  },
  {
    name: "Engineered Regeneration",
    publisher: "KeAi",
    type: "Fully Open Access",
    description: "Dedicated to tissue engineering and regenerative medicine, emphasizing the engineering aspects of biological regeneration."
  },
  {
    name: "Biomaterials",
    publisher: "Elsevier",
    type: "Hybrid (Gold OA Option)",
    description: "The flagship journal in the field. While subscription-based, it offers a Gold Open Access option for authors who pay an APC."
  },
  {
    name: "Acta Biomaterialia",
    publisher: "Elsevier",
    type: "Hybrid (Gold OA Option)",
    description: "Focuses on structure-property-function relationships in biomaterials. Offers Gold OA options for immediate free access."
  },
  {
    name: "Advanced Healthcare Materials",
    publisher: "Wiley",
    type: "Hybrid (Gold OA Option)",
    description: "A premium journal for high-impact healthcare materials research. Hybrid model allows for Open Access publication."
  }
];

const OpenAccessResultCard: React.FC<OpenAccessResultCardProps> = ({ result }) => {
  const [showJournals, setShowJournals] = useState(false);
  let articles: ArticleOA[] = [];
  try {
    const parsed = JSON.parse(result.content);
    articles = Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error("JSON Parse Error for Open Access Articles", e);
  }

  const renderJournalReference = () => (
    <div className="mt-8 border-t border-slate-100 pt-6">
      <button 
        onClick={() => setShowJournals(!showJournals)}
        className="flex items-center justify-between w-full bg-slate-50 hover:bg-slate-100 p-4 rounded-xl border border-slate-200 transition-all group"
      >
        <div className="flex items-center gap-3">
          <div className="bg-white p-2 rounded-lg border border-slate-200 text-teal-600 group-hover:text-teal-700">
            <BookOpen className="w-5 h-5" />
          </div>
          <div className="text-left">
            <h4 className="text-sm font-bold text-slate-800">Quick Reference: Top Biomaterials Journals</h4>
            <p className="text-xs text-slate-500">View Open Access policies for key journals</p>
          </div>
        </div>
        {showJournals ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
      </button>

      {showJournals && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 animate-in fade-in slide-in-from-top-2">
          {JOURNALS.map((j, idx) => (
            <div key={idx} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm hover:border-teal-100 transition-colors">
              <div className="flex justify-between items-start mb-2">
                <h5 className="font-bold text-slate-800 text-sm">{j.name}</h5>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${j.type.includes('Fully') ? 'bg-green-50 text-green-700 border-green-100' : 'bg-amber-50 text-amber-700 border-amber-100'}`}>
                  {j.type}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium mb-2 uppercase tracking-wide">{j.publisher}</p>
              <p className="text-xs text-slate-600 leading-relaxed">{j.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  if (articles.length === 0) {
    return (
      <div className="w-full bg-white rounded-2xl shadow-lg border border-teal-100 p-8 text-center animate-in fade-in duration-500">
        <Search className="w-12 h-12 text-slate-200 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-slate-800 mb-2">No Open Access Articles Found</h3>
        <p className="text-slate-500 text-sm max-w-md mx-auto mb-6">
          We couldn't find direct legal free links for this specific query. Try broading your keywords or checking institutional access.
        </p>
        
        <div className="text-left">
           {renderJournalReference()}
        </div>

        <div className="mt-6 p-4 bg-slate-50 rounded-xl border border-slate-100 text-left">
           <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Raw Response</p>
           <p className="text-xs font-mono text-slate-600 line-clamp-3 overflow-hidden">{result.content}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white rounded-2xl shadow-lg border border-teal-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="bg-gradient-to-r from-teal-50 to-emerald-50 px-6 py-4 border-b border-teal-100 flex justify-between items-center">
            <div className="flex items-center gap-2">
                <div className="bg-white p-1.5 rounded-md shadow-sm border border-teal-100 text-teal-600">
                    <Unlock className="w-4 h-4" />
                </div>
                <h3 className="font-semibold text-slate-800">Open Access Finder</h3>
            </div>
            <div className="flex items-center gap-2">
                <div className="text-xs text-teal-700/70 font-mono bg-teal-50 px-2 py-1 rounded border border-teal-100">
                    {articles.length} Results Found
                </div>
            </div>
        </div>
        
        <div className="p-6">
            <div className="mb-6 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-2">Search Topic</p>
                <p className="text-slate-700 font-medium italic">"{result.originalQuery}"</p>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {articles.map((article, index) => (
                    <div 
                        key={index} 
                        className="group bg-white border border-slate-200 rounded-xl p-5 hover:border-teal-300 hover:shadow-md transition-all duration-300 relative overflow-hidden"
                    >
                        {/* Status Stripe */}
                        <div className="absolute top-0 left-0 w-1 h-full bg-teal-500"></div>

                        <div className="flex justify-between items-start gap-4 mb-3">
                            <h4 className="text-base font-bold text-slate-900 group-hover:text-teal-700 leading-snug transition-colors">
                                {article.title}
                            </h4>
                            <div className="shrink-0 flex items-center gap-1.5 bg-green-50 text-green-700 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase border border-green-100">
                                <Unlock className="w-2.5 h-2.5" />
                                <span>Free</span>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-y-2 gap-x-4 mb-4">
                            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                                <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                                {article.journal}
                            </div>
                            <div className="flex items-center gap-1.5 text-xs font-bold text-teal-600 bg-teal-50 px-2 py-0.5 rounded border border-teal-100">
                                {article.source_type}
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <a 
                                href={article.url} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm transition-all active:scale-95"
                            >
                                <FileText className="w-4 h-4" />
                                Read Full Text
                                <ExternalLink className="w-3 h-3 opacity-60" />
                            </a>
                        </div>
                    </div>
                ))}
            </div>

            {renderJournalReference()}

            <div className="mt-8 pt-6 border-t border-slate-100">
                 <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex items-start gap-3">
                    <Globe className="w-5 h-5 text-slate-400 mt-0.5" />
                    <div>
                        <p className="text-xs uppercase font-bold text-slate-500 mb-1">Information Specialist Note</p>
                        <p className="text-sm text-slate-600 leading-relaxed">
                            These links lead directly to the publisher's site or an institutional repository where the article is legally available without a subscription. Always verify the license type (e.g., CC BY) if you intend to reuse figures or content.
                        </p>
                    </div>
                 </div>
            </div>
        </div>
    </div>
  );
};

export default OpenAccessResultCard;
