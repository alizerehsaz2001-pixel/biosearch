import React, { useState } from 'react';
import { Lightbulb, Copy, Check, Sparkles, Zap, Gauge } from 'lucide-react';
import { SearchResult } from '../types';

interface NoveltyResultCardProps {
  result: SearchResult;
}

const NoveltyResultCard: React.FC<NoveltyResultCardProps> = ({ result }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(result.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Parse ideas by "### " separator
  const renderIdeas = (content: string) => {
    const ideas = content.split('###').filter(i => i.trim());
    
    return ideas.map((ideaBlock, index) => {
        const lines = ideaBlock.trim().split('\n');
        const title = lines[0].replace(/^Idea \d+:\s*/, '').replace(/^\*\*/, '').replace(/\*\*$/, '');
        
        // Extract specific fields using simple parsing
        const hypothesis = lines.find(l => l.includes('Hypothesis'))?.replace(/^[-*]\s*\*\*Hypothesis:\*\*\s*/, '') || '';
        const innovation = lines.find(l => l.includes('Innovation'))?.replace(/^[-*]\s*\*\*Innovation:\*\*\s*/, '') || '';
        const feasibility = lines.find(l => l.includes('Feasibility'))?.replace(/^[-*]\s*\*\*Feasibility:\*\*\s*/, '') || '';
        
        // Fallback content if parsing fails (unlikely given prompt instructions)
        const bodyContent = lines.slice(1).filter(l => !l.includes('Hypothesis') && !l.includes('Innovation') && !l.includes('Feasibility')).join(' ');

        return (
            <div key={index} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow duration-300">
                <div className="flex items-start gap-3 mb-4">
                    <div className="bg-pink-100 p-2 rounded-lg text-pink-600 shrink-0 mt-1">
                        <Sparkles className="w-5 h-5" />
                    </div>
                    <h4 className="text-lg font-bold text-slate-800 leading-tight">
                        {title}
                    </h4>
                </div>
                
                <div className="space-y-4">
                    {hypothesis && (
                        <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                             <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-1 flex items-center gap-1">
                                <Lightbulb className="w-3 h-3" /> Hypothesis
                             </p>
                             <p className="text-slate-700 text-sm leading-relaxed">{hypothesis}</p>
                        </div>
                    )}
                    
                    {innovation && (
                        <div>
                            <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-1 flex items-center gap-1">
                                <Zap className="w-3 h-3" /> Innovation Gap
                             </p>
                             <p className="text-slate-600 text-sm leading-relaxed">{innovation}</p>
                        </div>
                    )}

                    {feasibility && (
                        <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                            <Gauge className="w-4 h-4 text-slate-400" />
                            <span className="text-xs font-semibold text-slate-500 uppercase">Feasibility:</span>
                            <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                                feasibility.toLowerCase().includes('high') ? 'bg-green-100 text-green-700' :
                                feasibility.toLowerCase().includes('medium') ? 'bg-yellow-100 text-yellow-700' :
                                'bg-slate-100 text-slate-700'
                            }`}>
                                {feasibility}
                            </span>
                        </div>
                    )}
                </div>
            </div>
        );
    });
  };

  return (
    <div className="w-full bg-slate-50 rounded-2xl shadow-lg border border-pink-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-gradient-to-r from-pink-50 to-rose-50 px-6 py-4 border-b border-pink-100 flex justify-between items-center">
        <div className="flex items-center gap-2">
            <div className="bg-white p-1.5 rounded-md shadow-sm border border-pink-100 text-pink-600">
                <Lightbulb className="w-4 h-4" />
            </div>
            <h3 className="font-semibold text-slate-800">Novelty Generator</h3>
        </div>
        <div className="text-xs text-pink-700/70 font-mono bg-pink-50 px-2 py-1 rounded border border-pink-100">
            Principal Investigator Mode
        </div>
      </div>
      
      <div className="p-6">
        <div className="mb-6">
            <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-2">Source Context</p>
            <p className="text-slate-600 italic text-sm line-clamp-2">
                "{result.originalQuery}"
            </p>
        </div>

        <div className="grid grid-cols-1 gap-6">
            {renderIdeas(result.content)}
        </div>

        <div className="mt-8 flex justify-end">
            <button 
                onClick={handleCopy}
                className="flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-4 py-2 rounded-lg font-medium transition-colors text-sm shadow-sm"
            >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied' : 'Copy All Ideas'}
            </button>
        </div>
      </div>
    </div>
  );
};

export default NoveltyResultCard;