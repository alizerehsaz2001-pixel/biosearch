import React, { useState } from 'react';
import { ShieldCheck, Copy, Check, FileCheck, AlertOctagon } from 'lucide-react';
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

  // Simple Markdown Table Parser
  const renderContent = (content: string) => {
    const lines = content.split('\n');
    const tableRows: string[][] = [];
    const otherContent: React.ReactNode[] = [];
    let parsingTable = false;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        if (line.startsWith('|')) {
            parsingTable = true;
            // Split by pipe and remove empty first/last elements
            const cells = line.split('|').map(c => c.trim()).filter((_, idx, arr) => idx !== 0 && idx !== arr.length - 1);
            
            // Skip separator line (e.g., |---|---|)
            if (cells[0] && cells[0].match(/^-+$/)) continue;
            
            tableRows.push(cells);
        } else {
            parsingTable = false;
            // Clean up bold syntax for headers if any
            const cleanLine = line.replace(/\*\*/g, '').replace(/##/g, '');
            if (line.startsWith('##')) {
                otherContent.push(<h4 key={`h-${i}`} className="text-lg font-bold text-slate-800 mt-4 mb-2">{cleanLine}</h4>);
            } else if (line.startsWith('-')) {
                otherContent.push(<li key={`li-${i}`} className="ml-4 list-disc text-slate-700 text-sm mb-1">{cleanLine.replace(/^-/, '').trim()}</li>);
            } else {
                otherContent.push(<p key={`p-${i}`} className="text-slate-700 text-sm mb-2">{cleanLine}</p>);
            }
        }
    }

    return (
        <div className="space-y-6">
            {/* Render Table */}
            {tableRows.length > 0 && (
                <div className="overflow-x-auto border border-slate-200 rounded-lg">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-amber-50 text-amber-900 uppercase font-semibold text-xs border-b border-amber-200">
                            <tr>
                                {tableRows[0].map((header, idx) => (
                                    <th key={idx} className="px-4 py-3 whitespace-nowrap">{header}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {tableRows.slice(1).map((row, rowIdx) => (
                                <tr key={rowIdx} className="hover:bg-slate-50 transition-colors">
                                    {row.map((cell, cellIdx) => (
                                        <td key={cellIdx} className="px-4 py-3 text-slate-700 align-top">
                                            {/* Highlight Compliance Status */}
                                            {cellIdx === 2 ? (
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                                    cell.toLowerCase().includes('yes') || cell.toLowerCase().includes('compliant') ? 'bg-green-100 text-green-800' :
                                                    cell.toLowerCase().includes('partial') ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-red-100 text-red-800'
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
            )}

            {/* Render Summary/Notes */}
            {otherContent.length > 0 && (
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <h5 className="flex items-center gap-2 text-sm font-semibold text-slate-800 mb-2">
                        <AlertOctagon className="w-4 h-4 text-amber-600" />
                        Audit Notes
                    </h5>
                    {otherContent}
                </div>
            )}
        </div>
    );
  };

  return (
    <div className="w-full bg-white rounded-2xl shadow-lg border border-amber-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-gradient-to-r from-amber-50 to-yellow-50 px-6 py-4 border-b border-amber-100 flex justify-between items-center">
        <div className="flex items-center gap-2">
            <div className="bg-white p-1.5 rounded-md shadow-sm border border-amber-100 text-amber-600">
                <ShieldCheck className="w-4 h-4" />
            </div>
            <h3 className="font-semibold text-slate-800">ISO Regulatory Audit</h3>
        </div>
        <div className="text-xs text-amber-700/70 font-mono bg-amber-50 px-2 py-1 rounded border border-amber-100">
            ISO 10993 / ASTM F2900
        </div>
      </div>
      
      <div className="p-6">
        <div className="mb-6 bg-slate-50 p-4 rounded-xl border border-slate-100">
            <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-2 flex items-center gap-1">
                <FileCheck className="w-3 h-3" /> Source Methods Snippet
            </p>
            <p className="text-slate-600 italic text-sm line-clamp-3">
                "{result.originalQuery}"
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
                {copied ? 'Copied' : 'Copy Audit'}
            </button>
        </div>
      </div>
    </div>
  );
};

export default AuditorResultCard;