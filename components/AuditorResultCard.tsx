import React, { useState } from 'react';
import { ShieldCheck, Copy, Check, FileCheck, ExternalLink } from 'lucide-react';
import { SearchResult } from '../types';

interface AuditorResultCardProps {
  result: SearchResult;
}

const AuditorResultCard: React.FC<AuditorResultCardProps> = ({ result }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(result.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Improved parser for sequential rendering of mixed markdown content
  const renderContent = (content: string) => {
    const lines = content.split('\n');
    const elements: React.ReactNode[] = [];
    let tableBuffer: string[][] = [];

    const renderTable = (rows: string[][]) => (
         <div className="overflow-x-auto border border-slate-200 rounded-lg mb-6 shadow-sm" key={`table-${Math.random()}`}>
            <table className="w-full text-sm text-left">
                <thead className="bg-amber-50 text-amber-900 uppercase font-semibold text-xs border-b border-amber-200">
                    <tr>
                        {rows[0].map((header, idx) => (
                            <th key={idx} className="px-4 py-3 whitespace-nowrap">{header}</th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                    {rows.slice(1).map((row, rowIdx) => (
                        <tr key={rowIdx} className="hover:bg-slate-50 transition-colors">
                            {row.map((cell, cellIdx) => (
                                <td key={cellIdx} className="px-4 py-3 text-slate-700 align-top">
                                    {/* Smart Highlighting for Status Column */}
                                    {cellIdx === 2 ? (
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold border ${
                                            cell.toLowerCase().includes('compliant') || cell.toLowerCase().includes('yes') ? 'bg-green-50 text-green-700 border-green-200' :
                                            cell.toLowerCase().includes('partial') ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                                            'bg-red-50 text-red-700 border-red-200'
                                        }`}>
                                            {cell}
                                        </span>
                                    ) : (
                                        cell
                                    )}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    const flushTable = () => {
      if (tableBuffer.length > 0) {
        elements.push(renderTable(tableBuffer));
        tableBuffer = [];
      }
    };

    lines.forEach((line, index) => {
        const trimmed = line.trim();
        if (!trimmed) return;

        if (trimmed.startsWith('|')) {
            const cells = trimmed.split('|').map(c => c.trim()).filter((_, idx, arr) => idx !== 0 && idx !== arr.length - 1);
            // Skip separator line |---|
            if (cells[0] && !cells[0].match(/^-+$/)) { 
                tableBuffer.push(cells);
            }
        } else {
            flushTable(); // End of table block if we hit text

            // Handle Headers with specific styles
            if (trimmed.startsWith('### 📋') || trimmed.includes('Classification')) {
                elements.push(
                    <h4 key={`h-${index}`} className="flex items-center gap-2 text-lg font-bold text-blue-900 mt-6 mb-3 bg-blue-50 p-3 rounded-lg border border-blue-100 shadow-sm">
                        {trimmed.replace(/###\s*/, '')}
                    </h4>
                );
            } else if (trimmed.startsWith('### 🔍') || trimmed.includes('Audit Findings')) {
                elements.push(
                    <h4 key={`h-${index}`} className="flex items-center gap-2 text-lg font-bold text-slate-800 mt-6 mb-3 border-b border-slate-200 pb-2">
                        {trimmed.replace(/###\s*/, '')}
                    </h4>
                );
            } else if (trimmed.startsWith('### ⚠️') || trimmed.includes('Risk Assessment')) {
                elements.push(
                    <h4 key={`h-${index}`} className="flex items-center gap-2 text-lg font-bold text-amber-900 mt-6 mb-3 bg-amber-50 p-3 rounded-lg border border-amber-100 shadow-sm">
                        {trimmed.replace(/###\s*/, '')}
                    </h4>
                );
            } else if (trimmed.startsWith('###')) {
                 elements.push(<h4 key={`h-${index}`} className="text-lg font-bold text-slate-800 mt-4 mb-2">{trimmed.replace(/###\s*/, '')}</h4>);
            } else if (trimmed.startsWith('-') || trimmed.startsWith('*')) {
                // List items
                 elements.push(<li key={`li-${index}`} className="ml-5 list-disc text-slate-700 text-sm mb-1.5 leading-relaxed">{trimmed.replace(/^[-*]\s*/, '').replace(/\*\*/g, '')}</li>);
            } else {
                // Paragraphs
                 elements.push(<p key={`p-${index}`} className="text-slate-700 text-sm mb-2 leading-relaxed">{trimmed.replace(/\*\*/g, '')}</p>);
            }
        }
    });
    flushTable(); // Flush if table is the last element

    return <div className="space-y-1">{elements}</div>;
  };

  return (
    <div className="w-full bg-white rounded-2xl shadow-lg border border-amber-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-gradient-to-r from-amber-50 to-yellow-50 px-6 py-4 border-b border-amber-100 flex justify-between items-center">
        <div className="flex items-center gap-2">
            <div className="bg-white p-1.5 rounded-md shadow-sm border border-amber-100 text-amber-600">
                <ShieldCheck className="w-4 h-4" />
            </div>
            <h3 className="font-semibold text-slate-800">Smart Regulatory Auditor</h3>
        </div>
        <div className="flex gap-2">
             <div className="flex items-center gap-2 text-xs font-mono bg-green-50 text-green-700 px-3 py-1 rounded-full border border-green-200">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="hidden sm:inline">ISO 10993 DB: Connected</span>
                <span className="sm:hidden">ISO: ON</span>
             </div>
             <div className="flex items-center gap-2 text-xs font-mono bg-blue-50 text-blue-700 px-3 py-1 rounded-full border border-blue-200">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="hidden sm:inline">ASTM F-Series: Active</span>
                <span className="sm:hidden">ASTM: ON</span>
             </div>
        </div>
      </div>
      
      <div className="p-6">
        <div className="mb-6 bg-slate-50 p-4 rounded-xl border border-slate-100">
            <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-2 flex items-center gap-1">
                <FileCheck className="w-3 h-3" /> Input Context
            </p>
            <p className="text-slate-600 italic text-sm line-clamp-2">
                "{result.originalQuery}"
            </p>
        </div>

        <div>
            {renderContent(result.content)}
        </div>

        <div className="mt-8 flex justify-between items-center">
             <a 
                href="https://www.iso.org/standard/68936.html" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-amber-700 hover:text-amber-900 font-medium transition-colors"
            >
                <ExternalLink className="w-3 h-3" /> Verify on ISO.org
            </a>
            <button 
                onClick={handleCopy}
                className="flex items-center gap-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 px-4 py-2 rounded-lg font-medium transition-colors text-sm"
            >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied' : 'Copy Audit Report'}
            </button>
        </div>
      </div>
    </div>
  );
};

export default AuditorResultCard;