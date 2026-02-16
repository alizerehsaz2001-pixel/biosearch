import React from 'react';
import { Filter, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { SearchResult } from '../types';

interface ScreeningResultCardProps {
  result: SearchResult;
}

interface ScreeningData {
  decision: "INCLUDE" | "EXCLUDE";
  reason: string;
  confidence_score: string | number;
}

const ScreeningResultCard: React.FC<ScreeningResultCardProps> = ({ result }) => {
  let data: ScreeningData | null = null;
  
  try {
    data = JSON.parse(result.content);
  } catch (e) {
    console.error("Failed to parse JSON content for screening result");
  }

  if (!data) {
    return (
        <div className="w-full bg-red-50 rounded-2xl p-6 border border-red-200 text-red-700">
            <p className="font-semibold flex items-center gap-2">
                <AlertCircle className="w-5 h-5"/> Error parsing result
            </p>
            <pre className="mt-2 text-xs opacity-75 whitespace-pre-wrap">{result.content}</pre>
        </div>
    );
  }

  const isIncluded = data.decision === 'INCLUDE';
  const confidence = Number(data.confidence_score);

  return (
    <div className="w-full bg-white rounded-2xl shadow-lg border border-rose-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-gradient-to-r from-rose-50 to-orange-50 px-6 py-4 border-b border-rose-100 flex justify-between items-center">
        <div className="flex items-center gap-2">
            <div className="bg-white p-1.5 rounded-md shadow-sm border border-rose-100 text-rose-600">
                <Filter className="w-4 h-4" />
            </div>
            <h3 className="font-semibold text-slate-800">Abstract Screening Result</h3>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono">
            <span className="text-slate-500">Confidence:</span>
            <div className="w-16 h-2 bg-slate-200 rounded-full overflow-hidden">
                <div 
                    className={`h-full rounded-full ${confidence >= 8 ? 'bg-green-500' : confidence >= 5 ? 'bg-yellow-500' : 'bg-red-500'}`} 
                    style={{ width: `${(confidence / 10) * 100}%` }}
                />
            </div>
            <span className="font-bold text-slate-700">{data.confidence_score}/10</span>
        </div>
      </div>
      
      <div className="p-6">
        <div className="flex items-start gap-4 mb-6">
            <div className={`shrink-0 p-3 rounded-full ${isIncluded ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                {isIncluded ? <CheckCircle className="w-8 h-8" /> : <XCircle className="w-8 h-8" />}
            </div>
            <div>
                <h4 className={`text-2xl font-bold tracking-tight mb-1 ${isIncluded ? 'text-green-700' : 'text-red-700'}`}>
                    {data.decision}
                </h4>
                <p className="text-slate-600 leading-relaxed">
                    {data.reason}
                </p>
            </div>
        </div>

        <div className="bg-slate-50 rounded-xl border border-slate-200 p-4">
             <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-2">Abstract Snippet</p>
             <p className="text-slate-600 italic text-sm line-clamp-3">
                 "{result.originalQuery}"
             </p>
        </div>
      </div>
    </div>
  );
};

export default ScreeningResultCard;