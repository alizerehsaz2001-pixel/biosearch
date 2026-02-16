import React from 'react';
import { FlaskConical, AlertCircle, Layers, Settings, Activity } from 'lucide-react';
import { SearchResult } from '../types';

interface ExtractionResultCardProps {
  result: SearchResult;
}

interface QuantitativeProperties {
  porosity?: string;
  mechanical_strength?: string;
  degradation_rate?: string;
  [key: string]: string | undefined;
}

interface ExtractionData {
  material_composition: string;
  fabrication_method: string;
  quantitative_properties: QuantitativeProperties;
  biological_result: string;
}

const ExtractionResultCard: React.FC<ExtractionResultCardProps> = ({ result }) => {
  let data: ExtractionData | null = null;
  
  try {
    data = JSON.parse(result.content);
  } catch (e) {
    console.error("Failed to parse JSON content for extraction result");
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

  const renderValue = (val: string | undefined) => {
    if (!val || val === 'N/A') return <span className="text-slate-400 italic">N/A</span>;
    return <span className="text-slate-800 font-medium">{val}</span>;
  };

  return (
    <div className="w-full bg-white rounded-2xl shadow-lg border border-cyan-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-gradient-to-r from-cyan-50 to-sky-50 px-6 py-4 border-b border-cyan-100 flex justify-between items-center">
        <div className="flex items-center gap-2">
            <div className="bg-white p-1.5 rounded-md shadow-sm border border-cyan-100 text-cyan-600">
                <FlaskConical className="w-4 h-4" />
            </div>
            <h3 className="font-semibold text-slate-800">Biomaterials Data Extraction</h3>
        </div>
        <div className="text-xs text-cyan-700/70 font-mono bg-cyan-50 px-2 py-1 rounded border border-cyan-100">
            Technical Parameters
        </div>
      </div>
      
      <div className="p-6 grid gap-6">
        
        {/* Main Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                <div className="flex items-center gap-2 mb-2 text-slate-500 text-sm font-medium">
                    <Layers className="w-4 h-4 text-cyan-600" />
                    Material Composition
                </div>
                <div className="text-lg text-slate-900 font-semibold">
                    {renderValue(data.material_composition)}
                </div>
            </div>
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                <div className="flex items-center gap-2 mb-2 text-slate-500 text-sm font-medium">
                    <Settings className="w-4 h-4 text-cyan-600" />
                    Fabrication Method
                </div>
                <div className="text-lg text-slate-900 font-semibold">
                    {renderValue(data.fabrication_method)}
                </div>
            </div>
        </div>

        {/* Quantitative Properties */}
        <div className="border border-slate-200 rounded-xl overflow-hidden">
            <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Quantitative Properties
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
                <div className="p-4">
                    <p className="text-xs text-slate-500 mb-1">Porosity</p>
                    <p className="text-sm">{renderValue(data.quantitative_properties?.porosity)}</p>
                </div>
                <div className="p-4">
                    <p className="text-xs text-slate-500 mb-1">Mechanical Strength</p>
                    <p className="text-sm">{renderValue(data.quantitative_properties?.mechanical_strength)}</p>
                </div>
                <div className="p-4">
                    <p className="text-xs text-slate-500 mb-1">Degradation Rate</p>
                    <p className="text-sm">{renderValue(data.quantitative_properties?.degradation_rate)}</p>
                </div>
            </div>
        </div>

        {/* Biological Result */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-5 border border-green-100">
            <div className="flex items-center gap-2 mb-3 text-green-800 font-semibold">
                <Activity className="w-5 h-5" />
                Biological Outcomes
            </div>
            <p className="text-slate-700 leading-relaxed text-sm">
                {renderValue(data.biological_result)}
            </p>
        </div>

      </div>
    </div>
  );
};

export default ExtractionResultCard;