import React, { useState } from 'react';
import { Presentation, Copy, Check, FileText, Code, PieChart, Info } from 'lucide-react';
import { SearchResult } from '../types';

interface PPTResultCardProps {
  result: SearchResult;
}

const PPTResultCard: React.FC<PPTResultCardProps> = ({ result }) => {
  const [copied, setCopied] = useState(false);
  const [copiedJSON, setCopiedJSON] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(result.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const parseContent = (content: string) => {
    const parts = content.split('```json');
    const markdownOutline = parts[0].trim();
    let jsonContent = '';
    if (parts.length > 1) {
      jsonContent = parts[1].split('```')[0].trim();
    }
    return { markdownOutline, jsonContent };
  };

  const { markdownOutline, jsonContent } = parseContent(result.content);

  const handleCopyJSON = () => {
    if (jsonContent) {
      navigator.clipboard.writeText(jsonContent);
      setCopiedJSON(true);
      setTimeout(() => setCopiedJSON(false), 2000);
    }
  };

  const renderOutline = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, i) => {
      const trimmed = line.trim();
      if (!trimmed) return <br key={i} />;

      if (trimmed.startsWith('### ')) {
        return <h3 key={i} className="text-xl font-bold text-slate-900 mt-8 mb-4 border-b pb-2 flex items-center gap-2">
            {trimmed.includes('Slide Outline') ? <Presentation className="w-5 h-5 text-amber-600" /> : null}
            {trimmed.replace(/###\s*/, '')}
        </h3>;
      }
      
      if (trimmed.startsWith('- **Title:**')) {
          return <h4 key={i} className="text-lg font-bold text-slate-800 mt-6 mb-2 flex items-center gap-2 bg-amber-50 p-2 rounded-lg">
              <FileText className="w-4 h-4 text-amber-600" />
              {trimmed.replace('- **Title:**', '').trim()}
          </h4>;
      }

      if (trimmed.startsWith('- **Visual:**')) {
          return <div key={i} className="flex items-center gap-2 text-sm font-semibold text-amber-700 bg-amber-50/50 px-3 py-1 rounded-full w-fit mb-3">
              <PieChart className="w-3 h-3" />
              Visual Type: {trimmed.replace('- **Visual:**', '').trim()}
          </div>;
      }

      if (trimmed.startsWith('- **Content:**')) {
          return <div key={i} className="mb-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">Slide Data</span>
              <div className="text-slate-700 text-sm pl-4 border-l-2 border-slate-100 italic">
                {trimmed.replace('- **Content:**', '').trim()}
              </div>
          </div>;
      }

      if (trimmed.startsWith('- **Takeaway:**')) {
          return <div key={i} className="mt-2 bg-slate-50 p-3 rounded-lg border border-slate-200">
              <p className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1 mb-1">
                  <Info className="w-3 h-3" /> Key Insight
              </p>
              <p className="text-slate-800 text-sm font-medium">{trimmed.replace('- **Takeaway:**', '').trim()}</p>
          </div>;
      }

      return <p key={i} className="text-slate-600 text-sm mb-1">{trimmed.replace(/\*\*/g, '')}</p>;
    });
  };

  return (
    <div className="w-full bg-white rounded-2xl shadow-lg border border-amber-200 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 px-6 py-4 border-b border-amber-100 flex justify-between items-center">
        <div className="flex items-center gap-2">
            <div className="bg-white p-1.5 rounded-md shadow-sm border border-amber-100 text-amber-600">
                <Presentation className="w-4 h-4" />
            </div>
            <h3 className="font-semibold text-slate-800">Scientific PPT Architect</h3>
        </div>
        <div className="text-xs text-amber-700/70 font-mono bg-amber-50 px-2 py-1 rounded border border-amber-100">
            Slide Design Specialist
        </div>
      </div>
      
      <div className="p-6">
        <div className="mb-6 bg-slate-50 p-4 rounded-xl border border-slate-100">
            <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-2">Input Data Source</p>
            <p className="text-slate-600 italic text-sm line-clamp-2">
                "{result.originalQuery}"
            </p>
        </div>

        <div className="bg-white mb-10">
            {renderOutline(markdownOutline)}
        </div>

        {jsonContent && (
            <div className="mt-8">
                <div className="flex justify-between items-center mb-3">
                    <h4 className="flex items-center gap-2 text-sm font-bold text-slate-700">
                        <Code className="w-4 h-4 text-amber-600" />
                        Google Slides JSON (Apps Script Compatible)
                    </h4>
                    <button 
                        onClick={handleCopyJSON}
                        className="text-amber-600 hover:text-amber-800 text-xs font-semibold flex items-center gap-1 bg-amber-50 px-2 py-1 rounded transition-colors"
                    >
                        {copiedJSON ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        {copiedJSON ? 'Copied JSON' : 'Copy JSON'}
                    </button>
                </div>
                <pre className="bg-slate-900 text-amber-400 p-5 rounded-xl text-xs font-mono overflow-x-auto border border-slate-800 shadow-inner">
                    {jsonContent}
                </pre>
            </div>
        )}

        <div className="mt-8 flex justify-end">
            <button 
                onClick={handleCopy}
                className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 px-6 py-2.5 rounded-lg font-bold transition-all text-sm shadow-sm"
            >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied Full Report' : 'Copy Outline & JSON'}
            </button>
        </div>
      </div>
    </div>
  );
};

export default PPTResultCard;