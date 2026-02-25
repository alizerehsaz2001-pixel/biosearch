import React, { useState } from 'react';
import { Copy, Check, FlaskConical, ExternalLink, Search, Beaker, AlertTriangle, ClipboardList } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { SearchResult } from '../types';

interface FormulationResultCardProps {
  result: SearchResult;
}

interface Ingredient {
  name: string;
  concentration: string;
  amount: string;
  mw?: string;
  role?: string;
}

interface FormulationData {
  title: string;
  ingredients: Ingredient[];
  protocol: string[];
  safety_notes?: string[];
}

const FormulationResultCard: React.FC<FormulationResultCardProps> = ({ result }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    // If structured data, copy a formatted string
    if (isJson(result.content)) {
        const data = JSON.parse(result.content) as FormulationData;
        const text = `
# ${data.title}

## Ingredients
${data.ingredients.map(i => `- ${i.name}: ${i.amount} (${i.concentration})`).join('\n')}

## Protocol
${data.protocol.map((step, i) => `${i + 1}. ${step}`).join('\n')}

## Notes
${data.safety_notes?.join('\n') || ''}
        `.trim();
        navigator.clipboard.writeText(text);
    } else {
        navigator.clipboard.writeText(result.content);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isJson = (str: string) => {
    try {
      JSON.parse(str);
      return true;
    } catch (e) {
      return false;
    }
  };

  const renderContent = () => {
    if (!isJson(result.content)) {
      return (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm prose prose-sm max-w-none prose-headings:text-cyan-900 prose-a:text-cyan-600">
          <ReactMarkdown>{result.content}</ReactMarkdown>
        </div>
      );
    }

    const data = JSON.parse(result.content) as FormulationData;

    return (
      <div className="space-y-8">
        {/* Title Section */}
        <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-slate-800 mb-2">{data.title}</h2>
            <div className="h-1 w-20 bg-cyan-500 mx-auto rounded-full"></div>
        </div>

        {/* Ingredients Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="bg-slate-50 px-6 py-3 border-b border-slate-200 flex items-center gap-2">
                <Beaker className="w-4 h-4 text-cyan-600" />
                <h3 className="font-semibold text-slate-700">Ingredients List</h3>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-3 w-1/3">Component</th>
                            <th className="px-6 py-3">Concentration</th>
                            <th className="px-6 py-3">Amount</th>
                            <th className="px-6 py-3">Function</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {data.ingredients.map((ing, idx) => (
                            <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                                <td className="px-6 py-4 font-medium text-slate-800">
                                    {ing.name}
                                    {ing.mw && <span className="block text-xs text-slate-400 font-normal mt-0.5">MW: {ing.mw}</span>}
                                </td>
                                <td className="px-6 py-4 text-slate-600 font-mono text-xs bg-slate-50/30">{ing.concentration}</td>
                                <td className="px-6 py-4 text-slate-700 font-bold">{ing.amount}</td>
                                <td className="px-6 py-4">
                                    {ing.role && (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-cyan-50 text-cyan-700 border border-cyan-100">
                                            {ing.role}
                                        </span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>

        {/* Protocol Steps */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="bg-slate-50 px-6 py-3 border-b border-slate-200 flex items-center gap-2">
                <ClipboardList className="w-4 h-4 text-cyan-600" />
                <h3 className="font-semibold text-slate-700">Preparation Protocol</h3>
            </div>
            <div className="p-6">
                <ol className="relative border-l border-slate-200 ml-3 space-y-6">
                    {data.protocol.map((step, idx) => (
                        <li key={idx} className="mb-2 ml-6">
                            <span className="absolute flex items-center justify-center w-6 h-6 bg-cyan-100 rounded-full -left-3 ring-4 ring-white text-xs font-bold text-cyan-700">
                                {idx + 1}
                            </span>
                            <p className="text-slate-700 leading-relaxed">{step}</p>
                        </li>
                    ))}
                </ol>
            </div>
        </div>

        {/* Safety Notes */}
        {data.safety_notes && data.safety_notes.length > 0 && (
            <div className="bg-amber-50 rounded-xl border border-amber-200 p-4 flex gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                    <h4 className="font-semibold text-amber-800 mb-1">Important Notes</h4>
                    <ul className="list-disc list-inside text-sm text-amber-700 space-y-1">
                        {data.safety_notes.map((note, idx) => (
                            <li key={idx}>{note}</li>
                        ))}
                    </ul>
                </div>
            </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full bg-white rounded-2xl shadow-lg border border-cyan-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-gradient-to-r from-cyan-50 to-sky-50 px-6 py-4 border-b border-cyan-100 flex justify-between items-center">
        <div className="flex items-center gap-2">
            <div className="bg-white p-1.5 rounded-md shadow-sm border border-cyan-100 text-cyan-600">
                <FlaskConical className="w-4 h-4" />
            </div>
            <h3 className="font-semibold text-slate-800">Chemical Formula & Recipe</h3>
        </div>
        <a 
            href="https://pubchem.ncbi.nlm.nih.gov/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs font-semibold text-cyan-700 bg-white border border-cyan-200 px-3 py-1.5 rounded-lg hover:bg-cyan-50 transition-colors shadow-sm"
        >
            <span>Search PubChem</span>
            <ExternalLink className="w-3 h-3" />
        </a>
      </div>
      
      <div className="p-6">
        <div className="mb-6">
            <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-2">Target Formulation</p>
            <p className="text-slate-800 font-medium italic border-l-4 border-cyan-200 pl-4 py-1 bg-cyan-50/50 rounded-r-lg">
                "{result.originalQuery}"
            </p>
        </div>

        {renderContent()}

        <div className="mt-6 flex justify-end gap-3">
            <a 
                href={`https://pubchem.ncbi.nlm.nih.gov/#query=${encodeURIComponent(result.originalQuery)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm shadow-sm"
            >
                <Search className="w-4 h-4" />
                Find on PubChem
            </a>
            <button 
                onClick={handleCopy}
                className="flex items-center gap-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 px-4 py-2 rounded-lg font-medium transition-colors text-sm"
            >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied' : 'Copy Recipe'}
            </button>
        </div>
      </div>
    </div>
  );
};

export default FormulationResultCard;
