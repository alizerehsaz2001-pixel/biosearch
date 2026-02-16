import React, { useState } from 'react';
import { Scan, Copy, Check, FileText } from 'lucide-react';
import { SearchResult } from '../types';

interface ImageResultCardProps {
  result: SearchResult;
}

const ImageResultCard: React.FC<ImageResultCardProps> = ({ result }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(result.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Simple parser to render markdown headers and lists nicely
  const renderContent = (content: string) => {
    const lines = content.split('\n');
    return lines.map((line, index) => {
        const trimmed = line.trim();
        if (!trimmed) return <br key={index} />;

        if (trimmed.startsWith('## ')) {
            return <h3 key={index} className="text-lg font-bold text-slate-900 mt-6 mb-3 border-b border-slate-100 pb-2">{trimmed.replace('## ', '')}</h3>
        }
        if (trimmed.startsWith('### ')) {
            return <h4 key={index} className="text-md font-bold text-slate-800 mt-4 mb-2">{trimmed.replace('### ', '')}</h4>
        }
        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
            return <li key={index} className="ml-5 list-disc text-slate-700 mb-1 leading-relaxed text-sm">{trimmed.replace(/^[-*]\s/, '')}</li>
        }
        
        return <p key={index} className="text-slate-700 mb-2 leading-relaxed text-sm">{trimmed.replace(/\*\*/g, '')}</p>
    });
  };

  return (
    <div className="w-full bg-white rounded-2xl shadow-lg border border-blue-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-blue-100 flex justify-between items-center">
        <div className="flex items-center gap-2">
            <div className="bg-white p-1.5 rounded-md shadow-sm border border-blue-100 text-blue-600">
                <Scan className="w-4 h-4" />
            </div>
            <h3 className="font-semibold text-slate-800">Image Analysis Result</h3>
        </div>
        <div className="text-xs text-blue-700/70 font-mono bg-blue-50 px-2 py-1 rounded border border-blue-100">
            Gemini Vision Pro
        </div>
      </div>
      
      <div className="p-6">
        <div className="mb-6 bg-slate-50 p-4 rounded-xl border border-slate-100">
            <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-2 flex items-center gap-1">
                <FileText className="w-3 h-3" /> Context Provided
            </p>
            <p className="text-slate-600 italic text-sm">
                "{result.originalQuery || "No specific text context provided."}"
            </p>
        </div>

        <div className="bg-white">
            {renderContent(result.content)}
        </div>

        <div className="mt-6 flex justify-end">
            <button 
                onClick={handleCopy}
                className="flex items-center gap-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 px-4 py-2 rounded-lg font-medium transition-colors text-sm"
            >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied' : 'Copy Text'}
            </button>
        </div>
      </div>
    </div>
  );
};

export default ImageResultCard;