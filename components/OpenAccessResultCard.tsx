
import React from 'react';
import { Unlock, ExternalLink, FileText, Bookmark, BookOpen, Globe, Search } from 'lucide-react';
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

const OpenAccessResultCard: React.FC<OpenAccessResultCardProps> = ({ result }) => {
  let articles: ArticleOA[] = [];
  try {
    const parsed = JSON.parse(result.content);
    articles = Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error("JSON Parse Error for Open Access Articles", e);
  }

  if (articles.length === 0) {
    return (
      <div className="w-full bg-white rounded-2xl shadow-lg border border-teal-100 p-8 text-center animate-in fade-in duration-500">
        <Search className="w-12 h-12 text-slate-200 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-slate-800 mb-2">No Open Access Articles Found</h3>
        <p className="text-slate-500 text-sm max-w-md mx-auto">
          We couldn't find direct legal free links for this specific query. Try broading your keywords or checking institutional access.
        </p>
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
