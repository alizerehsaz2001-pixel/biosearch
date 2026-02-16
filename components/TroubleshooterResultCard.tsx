import React, { useState } from 'react';
import { Wrench, Copy, Check, AlertTriangle, Activity, Thermometer } from 'lucide-react';
import { SearchResult } from '../types';

interface TroubleshooterResultCardProps {
  result: SearchResult;
}

const TroubleshooterResultCard: React.FC<TroubleshooterResultCardProps> = ({ result }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(result.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const renderContent = (content: string) => {
    const lines = content.split('\n');
    return lines.map((line, index) => {
      const trimmed = line.trim();
      if (!trimmed) return <br key={index} />;

      // Header for Diagnosis
      if (trimmed.startsWith('### ')) {
        return (
          <div key={index} className="flex items-center gap-2 mt-6 mb-3 pb-1 border-b border-red-100">
             <AlertTriangle className="w-5 h-5 text-red-500" />
             <h3 className="text-lg font-bold text-slate-800">{trimmed.replace('### ', '')}</h3>
          </div>
        );
      }

      // Specific List items parsing
      if (trimmed.includes('**Explanation:**')) {
          return (
              <div key={index} className="ml-2 mb-2 text-sm text-slate-700 bg-slate-50 p-2 rounded-lg border-l-2 border-slate-300">
                  <span className="font-semibold text-slate-900 block mb-1">Diagnosis Analysis:</span>
                  {trimmed.replace(/^[-*]\s*\*\*Explanation:\*\*\s*/, '')}
              </div>
          )
      }

       if (trimmed.includes('**Fix:**')) {
          return (
              <div key={index} className="ml-2 mb-2 text-sm text-emerald-800 bg-emerald-50 p-2 rounded-lg border-l-2 border-emerald-300">
                  <span className="font-semibold text-emerald-900 block mb-1">Recommended Fix:</span>
                  {trimmed.replace(/^[-*]\s*\*\*Fix:\*\*\s*/, '')}
              </div>
          )
      }

       if (trimmed.includes('**Control Check:**') || trimmed.includes('**Check:**')) {
          return (
              <div key={index} className="ml-2 mb-2 text-sm text-blue-800 bg-blue-50 p-2 rounded-lg border-l-2 border-blue-300">
                  <span className="font-semibold text-blue-900 block mb-1">Debug Step:</span>
                  {trimmed.replace(/^[-*]\s*\*\*Control Check:\*\*\s*/, '').replace(/^[-*]\s*\*\*Check:\*\*\s*/, '')}
              </div>
          )
      }

      // Default rendering for other lines
      const cleanLine = trimmed.replace(/\*\*/g, '');
      if (trimmed.startsWith('-') || trimmed.startsWith('*')) {
          return <li key={index} className="ml-6 list-disc text-slate-700 mb-1 text-sm">{cleanLine.replace(/^[-*]\s/, '')}</li>
      }

      return <p key={index} className="text-slate-700 mb-2 text-sm">{cleanLine}</p>;
    });
  };

  return (
    <div className="w-full bg-white rounded-2xl shadow-lg border border-red-200 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-gradient-to-r from-red-50 to-orange-50 px-6 py-4 border-b border-red-100 flex justify-between items-center">
        <div className="flex items-center gap-2">
            <div className="bg-white p-1.5 rounded-md shadow-sm border border-red-100 text-red-600">
                <Wrench className="w-4 h-4" />
            </div>
            <h3 className="font-semibold text-slate-800">Protocol Troubleshooter</h3>
        </div>
        <div className="text-xs text-red-700/70 font-mono bg-red-50 px-2 py-1 rounded border border-red-100">
            Senior Lab Manager
        </div>
      </div>
      
      <div className="p-6">
        <div className="mb-6 bg-slate-50 p-4 rounded-xl border border-slate-100">
            <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-2 flex items-center gap-1">
                <Activity className="w-3 h-3" /> Reported Issue
            </p>
            <p className="text-slate-700 italic text-sm">
                "{result.originalQuery}"
            </p>
        </div>

        <div className="bg-white">
            {renderContent(result.content)}
        </div>

        <div className="mt-8 flex justify-end">
            <button 
                onClick={handleCopy}
                className="flex items-center gap-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 px-4 py-2 rounded-lg font-medium transition-colors text-sm"
            >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied' : 'Copy Diagnosis'}
            </button>
        </div>
      </div>
    </div>
  );
};

export default TroubleshooterResultCard;