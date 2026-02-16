import React, { useState } from 'react';
import { Copy, Check, FileText, ClipboardList } from 'lucide-react';
import { SearchResult } from '../types';

interface ProtocolCardProps {
  result: SearchResult;
}

const ProtocolCard: React.FC<ProtocolCardProps> = ({ result }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(result.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Simple Markdown-like parser for the specific output format
  // Splits by sections "## Title" and lists "- **Key:** Value"
  const renderContent = (content: string) => {
    const lines = content.split('\n');
    const elements: React.ReactNode[] = [];
    let currentList: React.ReactNode[] = [];

    const flushList = (key: number) => {
        if (currentList.length > 0) {
            elements.push(<ul key={`list-${key}`} className="space-y-3 mb-6">{currentList}</ul>);
            currentList = [];
        }
    };

    lines.forEach((line, index) => {
        const trimmed = line.trim();
        if (!trimmed) return;

        if (trimmed.startsWith('## ')) {
            flushList(index);
            elements.push(
                <h3 key={`header-${index}`} className="text-lg font-bold text-slate-900 mt-6 mb-3 flex items-center gap-2 border-b border-slate-200 pb-2">
                   {trimmed.replace('## ', '')}
                </h3>
            );
        } else if (trimmed.startsWith('- **') || trimmed.startsWith('* **')) {
            // Parse list item with bold key
            // Regex to capture **Key:** Value
            const match = trimmed.match(/^[-*]\s*\*\*(.*?):\*\*\s*(.*)/);
            if (match) {
                const [_, key, value] = match;
                currentList.push(
                    <li key={`item-${index}`} className="flex flex-col sm:flex-row sm:items-start text-slate-700 text-sm">
                        <span className="font-semibold text-teal-700 sm:w-32 shrink-0">{key}:</span>
                        <span className="flex-1">{value}</span>
                    </li>
                );
            } else {
                 // Fallback for simple list items
                 currentList.push(<li key={`item-${index}`} className="text-slate-700 text-sm ml-4 list-disc">{trimmed.replace(/^[-*]\s*/, '')}</li>);
            }
        } else {
            // Regular text paragraph
            flushList(index);
            elements.push(<p key={`p-${index}`} className="text-slate-600 text-sm mb-2">{trimmed}</p>);
        }
    });
    flushList(lines.length);
    return elements;
  };

  return (
    <div className="w-full bg-white rounded-2xl shadow-lg border border-teal-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-gradient-to-r from-teal-50 to-emerald-50 px-6 py-4 border-b border-teal-100 flex justify-between items-center">
        <div className="flex items-center gap-2">
            <div className="bg-white p-1.5 rounded-md shadow-sm border border-teal-100 text-teal-600">
                <ClipboardList className="w-4 h-4" />
            </div>
            <h3 className="font-semibold text-slate-800">Study Protocol Definition</h3>
        </div>
        <div className="text-xs text-teal-700/70 font-mono bg-teal-50 px-2 py-1 rounded border border-teal-100">
            PICO / Inclusion Criteria
        </div>
      </div>
      
      <div className="p-6">
        <div className="mb-6">
            <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-2">Research Question</p>
            <p className="text-slate-800 font-medium italic border-l-4 border-teal-200 pl-4 py-1 bg-teal-50/50 rounded-r-lg">
                "{result.originalQuery}"
            </p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            {renderContent(result.content)}
        </div>

        <div className="mt-6 flex justify-end">
            <button 
                onClick={handleCopy}
                className="flex items-center gap-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 px-4 py-2 rounded-lg font-medium transition-colors text-sm"
            >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied' : 'Copy Protocol'}
            </button>
        </div>
      </div>
    </div>
  );
};

export default ProtocolCard;