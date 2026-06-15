import React, { useState, useMemo } from 'react';
import { 
  Copy, Check, FlaskConical, ExternalLink, Search, Beaker, AlertTriangle, 
  ClipboardList, Sliders, Calculator, ArrowRight, HelpCircle, FileText, 
  BookOpen, Scale, Sparkles, RefreshCw, Layers
} from 'lucide-react';
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
  
  // Interactive scaling state variables
  const [baseVolume, setBaseVolume] = useState<number>(100);
  const [targetVolume, setTargetVolume] = useState<number>(100);
  
  // Interactive Chemistry Calculators State
  const [activeCalcTab, setActiveCalcTab] = useState<'molar' | 'dilution'>('molar');
  
  // Tool 1: Molar Preparation Calculator state
  const [molarityInput, setMolarityInput] = useState<string>('50'); // in mM
  const [mwInput, setMwInput] = useState<string>('147.01'); // in g/mol
  const [volInput, setVolInput] = useState<string>('100'); // in mL
  
  // Tool 2: Dilution Planner (C1V1 = C2V2) state
  const [stockConc, setStockConc] = useState<string>('100'); // C1
  const [targetConc, setTargetConc] = useState<string>('10'); // C2
  const [desiredVol, setDesiredVol] = useState<string>('50'); // V2 (mL)

  const handleCopy = () => {
    if (isJson(result.content)) {
        const data = JSON.parse(result.content) as FormulationData;
        const text = `
# ${data.title} (Scaled to ${targetVolume} mL from Base ${baseVolume} mL)

## Ingredients List
${data.ingredients.map(i => {
  const scaled = scaleAmount(i.amount, targetVolume, baseVolume);
  return `- ${i.name}: ${scaled} (Base: ${i.amount}, Conc: ${i.concentration}${i.mw ? `, MW: ${i.mw}` : ''})`;
}).join('\n')}

## Preparation Protocol Steps
${data.protocol.map((step, i) => `${i + 1}. ${step}`).join('\n')}

## Safety & Storage Notes
${data.safety_notes?.map(note => `- ${note}`).join('\n') || 'None provided'}
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
    } catch {
      return false;
    }
  };

  // Helper parsing & scaling function that keeps units intact
  const scaleAmount = (amountStr: string, targetVol: number, baseVol: number) => {
    if (!amountStr) return 'N/A';
    if (targetVol === baseVol) return amountStr;
    
    // Attempt pattern matches: e.g. "2.5 g", "2.5g", "50 mL", "50mL", "3.0 mg/mL", "100µL"
    const regex = /^([\d.]+)\s*([a-zA-Z%µμ/]+.*)$/;
    const match = amountStr.trim().match(regex);
    
    if (match) {
      const val = parseFloat(match[1]);
      const unit = match[2];
      if (!isNaN(val)) {
        const scaledVal = (val * targetVol) / baseVol;
        // Float rounding to 3 decimal places
        const formattedVal = Number(scaledVal.toFixed(3));
        return `${formattedVal} ${unit}`;
      }
    }
    return `${amountStr} (unscaled)`;
  };

  const parsedFormulaData = useMemo((): FormulationData | null => {
    if (!isJson(result.content)) return null;
    try {
      return JSON.parse(result.content) as FormulationData;
    } catch {
      return null;
    }
  }, [result.content]);

  // Mass Calculation Outcome
  const weightResult = useMemo(() => {
    const m = parseFloat(molarityInput);
    const mw = parseFloat(mwInput);
    const v = parseFloat(volInput);
    
    if (isNaN(m) || isNaN(mw) || isNaN(v) || m <= 0 || mw <= 0 || v <= 0) {
      return null;
    }
    // Mass Required (mg) = Molarity (mM) * Volume (mL) * Molecular Weight (g/mol) / 1000
    const massMg = (m * v * mw) / 1000;
    return {
      mg: Number(massMg.toFixed(2)),
      g: Number((massMg / 1000).toFixed(5))
    };
  }, [molarityInput, mwInput, volInput]);

  // Dilution calculation outcomes
  const dilutionResult = useMemo(() => {
    const c1 = parseFloat(stockConc);
    const c2 = parseFloat(targetConc);
    const v2 = parseFloat(desiredVol);
    
    if (isNaN(c1) || isNaN(c2) || isNaN(v2) || c1 <= 0 || c2 <= 0 || v2 <= 0 || c2 >= c1) {
      return null;
    }
    // C1V1 = C2V2 => V1 = (C2 * V2) / C1
    const v1 = (c2 * v2) / c1;
    const solvent = v2 - v1;
    return {
      v1: Number(v1.toFixed(3)),
      solvent: Number(solvent.toFixed(3))
    };
  }, [stockConc, targetConc, desiredVol]);

  const renderContent = () => {
    if (!parsedFormulaData) {
      return (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm prose prose-sm max-w-none">
          <ReactMarkdown>{result.content}</ReactMarkdown>
        </div>
      );
    }

    const data = parsedFormulaData;

    return (
      <div className="space-y-8">
        
        {/* Dynamic Ingredient Control Board */}
        <div className="bg-gradient-to-r from-cyan-50/50 to-sky-50/50 p-5 rounded-2xl border border-cyan-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-black tracking-widest text-cyan-600 flex items-center gap-1">
              <Sliders className="w-3.5 h-3.5" /> Volumetric Scaler Hub
            </span>
            <p className="font-extrabold text-slate-800 text-sm">Scale ingredient requirements dynamically:</p>
            <p className="text-xs text-slate-500 font-medium">Original recipe calculates weights based on a standard laboratory volume.</p>
          </div>

          <div className="flex flex-wrap items-center gap-4 shrink-0">
            {/* Original Batch volume input */}
            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Original Volume</label>
              <div className="relative">
                <input 
                  type="number"
                  value={baseVolume}
                  onChange={e => setBaseVolume(Math.max(1, parseInt(e.target.value) || 100))}
                  className="w-20 pl-2 pr-7 py-1.5 text-xs font-bold border border-slate-250 bg-white rounded-lg outline-none focus:ring-1 focus:ring-cyan-500 text-center"
                />
                <span className="absolute right-2 top-2 text-[10px] font-bold text-slate-400">mL</span>
              </div>
            </div>

            <div className="pt-4 text-slate-400 hidden sm:block">
              <ArrowRight className="w-4 h-4" />
            </div>

            {/* Target formulation volume input */}
            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Target Vol</label>
              <div className="relative">
                <input 
                  type="number"
                  value={targetVolume}
                  onChange={e => setTargetVolume(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-24 pl-2 pr-7 py-1.5 text-xs font-bold border border-cyan-300 bg-white rounded-lg outline-none focus:ring-1 focus:ring-cyan-500 text-center text-cyan-700"
                />
                <span className="absolute right-2 top-2 text-[10px] font-extrabold text-cyan-600">mL</span>
              </div>
            </div>

            {/* Quick volume buttons select */}
            <div className="flex gap-1 pt-4 self-end">
              {[10, 25, 50, 100, 250].map(v => (
                <button
                  key={v}
                  onClick={() => setTargetVolume(v)}
                  className={`px-2 py-1 text-[10px] font-extrabold rounded-md shadow-xs border transition-all ${
                    targetVolume === v 
                      ? 'bg-cyan-600 border-cyan-600 text-white font-black'
                      : 'bg-white border-slate-200 text-slate-650 hover:bg-slate-55'
                  }`}
                >
                  {v}mL
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Dynamic Ingredients Table */}
        <div className="bg-white rounded-2xl border border-slate-150 shadow-sm overflow-hidden">
            <div className="bg-slate-55 px-6 py-4.5 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Beaker className="w-5 h-5 text-cyan-600" />
                    <h3 className="font-extrabold text-slate-800 text-sm">Dynamic Ingredients & Calculated Weights</h3>
                </div>
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-white px-3 py-1 rounded-lg border border-slate-200">
                    {data.ingredients.length} Compounds Defined
                </div>
            </div>
            
            <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                    <thead className="bg-slate-50 text-slate-500 font-bold text-[10px] uppercase tracking-widest border-b border-slate-150">
                        <tr>
                            <th className="px-6 py-3.5">Chemical Compound</th>
                            <th className="px-6 py-3.5">Base Conc.</th>
                            <th className="px-6 py-3.5 text-right">Base Amount ({baseVolume}mL)</th>
                            <th className="px-6 py-3.5 text-right bg-cyan-50/20 text-cyan-800 font-black">Scaled Amount ({targetVolume}mL)</th>
                            <th className="px-6 py-3.5 text-right">Research Links</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-150">
                        {data.ingredients.map((ing, idx) => {
                            const scaledAmount = scaleAmount(ing.amount, targetVolume, baseVolume);
                            return (
                                <tr key={idx} className="hover:bg-slate-50/40 transition-colors group">
                                    <td className="px-6 py-4.5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-xl bg-cyan-50 flex items-center justify-center text-cyan-600 font-black text-xs border border-cyan-100 group-hover:bg-cyan-100 transition-all">
                                                {ing.name ? ing.name.charAt(0).toUpperCase() : 'C'}
                                            </div>
                                            <div>
                                                <span className="font-extrabold text-slate-850 block text-[13px]">{ing.name}</span>
                                                <div className="flex items-center gap-1.5 mt-0.5">
                                                  {ing.role && (
                                                    <span className="text-[10px] text-slate-500 font-bold bg-slate-105 px-1.5 py-0.2 rounded uppercase tracking-wider">
                                                      {ing.role}
                                                    </span>
                                                  )}
                                                  {ing.mw && (
                                                    <span className="text-[10px] text-slate-400 font-mono">
                                                      MW: {ing.mw} g/mol
                                                    </span>
                                                  )}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4.5">
                                        <span className="px-2 py-0.5 bg-slate-100 text-slate-650 font-mono text-[11px] rounded border border-slate-200 font-bold">
                                            {ing.concentration}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4.5 text-right font-medium text-slate-500 font-mono">
                                        {ing.amount}
                                    </td>
                                    <td className="px-6 py-4.5 text-right bg-cyan-50/10 text-cyan-700 font-black font-mono text-[13px]">
                                        <span className="px-2 py-1 bg-cyan-50 border border-cyan-100 rounded-lg">
                                          {scaledAmount}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4.5 text-right">
                                        <div className="flex justify-end gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
                                            <a
                                              id={`pubchem-lookup-${idx}`}
                                              href={`https://pubchem.ncbi.nlm.nih.gov/#query=${encodeURIComponent(ing.name)}`}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="p-1 px-2 border border-slate-200 rounded hover:border-cyan-500 hover:text-cyan-600 bg-white text-[10px] font-black uppercase text-slate-500 transition-colors"
                                              title="PubChem Chemical properties"
                                            >
                                              PubChem
                                            </a>
                                            <a
                                              id={`sds-lookup-${idx}`}
                                              href={`https://www.google.com/search?q=${encodeURIComponent(ing.name)}+SDS+safety+data+sheet`}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="p-1 px-2 border border-slate-200 rounded hover:border-amber-500 hover:text-amber-600 bg-white text-[10px] font-black uppercase text-slate-500 transition-colors"
                                              title="Search SDS Safety Sheets"
                                            >
                                              SDS
                                            </a>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>

        {/* Dynamic Mathematical Tool Suites Section */}
        <div className="bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden">
            <div className="bg-slate-100 px-5 py-3 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Calculator className="w-4 h-4 text-cyan-600" />
                <h4 className="text-xs font-black text-slate-700 uppercase tracking-widest">
                  Integrated Laboratory Calculator Suite
                </h4>
              </div>

              {/* Tab Toggles */}
              <div className="flex gap-1.5">
                <button
                  id="tab-molar-btn"
                  onClick={() => setActiveCalcTab('molar')}
                  className={`px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest rounded-lg border transition-all ${
                    activeCalcTab === 'molar'
                      ? 'bg-cyan-600 border-cyan-600 text-white'
                      : 'bg-white border-slate-250 text-slate-505 hover:bg-slate-100'
                  }`}
                >
                  Molarity Weighing Helper
                </button>
                <button
                  id="tab-dilution-btn"
                  onClick={() => setActiveCalcTab('dilution')}
                  className={`px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest rounded-lg border transition-all ${
                    activeCalcTab === 'dilution'
                      ? 'bg-cyan-600 border-cyan-600 text-white'
                      : 'bg-white border-slate-250 text-slate-505 hover:bg-slate-100'
                  }`}
                >
                  C1V1 Dilution Planner
                </button>
              </div>
            </div>

            <div className="p-5">
              {activeCalcTab === 'molar' ? (
                <div className="space-y-4">
                  <div className="flex items-start gap-3 border-b border-slate-200 pb-3">
                    <Scale className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    <div>
                      <h5 className="text-xs font-black text-slate-800 uppercase tracking-wider">Molarity Weight & Mass Solver</h5>
                      <p className="text-[11px] text-slate-500">Calculate required solid reagent mass (mg) from Molarity, Molecular Weight, and volume target.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider">Target Molarity (mM)</label>
                      <input 
                        type="number" 
                        value={molarityInput} 
                        onChange={e => setMolarityInput(e.target.value)} 
                        className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg outline-none focus:ring-1 focus:ring-cyan-500 font-bold"
                        placeholder="e.g. 50"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider">Molecular Weight (g/mol)</label>
                      <input 
                        type="number" 
                        value={mwInput} 
                        onChange={e => setMwInput(e.target.value)} 
                        className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg outline-none focus:ring-1 focus:ring-cyan-500 font-bold"
                        placeholder="e.g. 110.98"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider">Volume (mL)</label>
                      <input 
                        type="number" 
                        value={volInput} 
                        onChange={e => setVolInput(e.target.value)} 
                        className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg outline-none focus:ring-1 focus:ring-cyan-500 font-bold"
                        placeholder="e.g. 100"
                      />
                    </div>
                  </div>

                  {weightResult ? (
                    <div className="bg-cyan-50/50 p-4 rounded-xl border border-cyan-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-cyan-850 font-black flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5 text-orange-400" /> Resulting Weight Requirement
                        </p>
                        <p className="text-xs text-slate-600 mt-0.5">Weigh and dissolve this quantity to make your perfect solution batch:</p>
                      </div>

                      <div className="flex items-baseline gap-4 text-right shrink-0">
                        <div>
                          <p className="text-xl font-black text-cyan-700 font-mono">{weightResult.mg} <span className="text-xs font-normal">mg</span></p>
                          <p className="text-[10px] text-slate-400 font-bold">milligrams</p>
                        </div>
                        <div className="h-8 w-[1px] bg-cyan-200" />
                        <div>
                          <p className="text-lg font-extrabold text-slate-700 font-mono">{weightResult.g} <span className="text-xs font-medium">g</span></p>
                          <p className="text-[10px] text-slate-400 font-bold">grams</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic">Enter valid molecular weight, volume, and molar coefficients to calculate.</p>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-start gap-3 border-b border-slate-200 pb-3">
                    <RefreshCw className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    <div>
                      <h5 className="text-xs font-black text-slate-800 uppercase tracking-wider">Dilution Stock Pipetting Solver (C1V1 = C2V2)</h5>
                      <p className="text-[11px] text-slate-500">Calculate necessary volumes of stock solution and pure solvent to prepare standard serial dilutions.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider">Stock Conc. C1 (e.g., mM or %)</label>
                      <input 
                        type="number" 
                        value={stockConc} 
                        onChange={e => setStockConc(e.target.value)} 
                        className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg outline-none focus:ring-1 focus:ring-cyan-500 font-bold"
                        placeholder="e.g. 100"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider">Target Conc. C2 (same unit)</label>
                      <input 
                        type="number" 
                        value={targetConc} 
                        onChange={e => setTargetConc(e.target.value)} 
                        className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg outline-none focus:ring-1 focus:ring-cyan-500 font-bold"
                        placeholder="e.g. 10"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider">Desired Target Vol V2 (mL)</label>
                      <input 
                        type="number" 
                        value={desiredVol} 
                        onChange={e => setDesiredVol(e.target.value)} 
                        className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg outline-none focus:ring-1 focus:ring-cyan-500 font-bold"
                        placeholder="e.g. 50"
                      />
                    </div>
                  </div>

                  {dilutionResult ? (
                    <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-emerald-850 font-black flex items-center gap-1 animate-pulse">
                          <Check className="w-3.5 h-3.5 text-emerald-600 font-bold" /> Calculated Pipetting Instructions
                        </p>
                        <p className="text-[12px] text-slate-700 mt-1 font-semibold">
                          Take <span className="text-emerald-700 font-black font-mono">{dilutionResult.v1} mL</span> of the stock solution, and dilute up to <span className="font-extrabold text-slate-800">{desiredVol} mL</span> by adding <span className="text-emerald-750 font-extrabold font-mono">{dilutionResult.solvent} mL</span> of solvent.
                        </p>
                      </div>

                      <div className="flex gap-4 shrink-0 text-right">
                        <div>
                          <p className="text-lg font-black text-emerald-700 font-mono">{dilutionResult.v1} <span className="text-xs font-normal">mL</span></p>
                          <p className="text-[9px] text-slate-400 font-bold">Stock (V1)</p>
                        </div>
                        <div className="h-8 w-[1px] bg-emerald-200" />
                        <div>
                          <p className="text-lg font-extrabold text-slate-650 font-mono">{dilutionResult.solvent} <span className="text-xs font-semibold">mL</span></p>
                          <p className="text-[9px] text-slate-400 font-bold">Solvent (Diluent)</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-amber-650 italic">C1 (Stock Conc) must be higher than C2 (Target Conc), and all parameters must be positive.</p>
                  )}
                </div>
              )}
            </div>
        </div>

        {/* Protocol Steps */}
        <div className="bg-white rounded-2xl border border-slate-150 shadow-sm overflow-hidden">
            <div className="bg-slate-55 px-6 py-4.5 border-b border-slate-200 flex items-center gap-2">
                <ClipboardList className="w-4 h-4 text-cyan-600" />
                <h3 className="font-extrabold text-slate-800 text-sm">Step-by-Step Preparation Protocol</h3>
            </div>
            <div className="p-6">
                <ol className="relative border-l border-slate-200 ml-4 space-y-6">
                    {data.protocol.map((step, idx) => (
                        <li key={idx} className="ml-6 group relative">
                            <span className="absolute flex items-center justify-center w-6 h-6 bg-cyan-50 rounded-full -left-9 ring-4 ring-white text-xs font-black text-cyan-705 group-hover:bg-cyan-600 group-hover:text-white transition-all">
                                {idx + 1}
                            </span>
                            <p className="text-slate-700 leading-relaxed text-[13.5px] font-semibold">{step}</p>
                        </li>
                    ))}
                </ol>
            </div>
        </div>

        {/* Safety Notes */}
        {data.safety_notes && data.safety_notes.length > 0 && (
            <div className="bg-amber-50/50 rounded-xl border border-amber-200 p-5 flex gap-3.5">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                    <h4 className="font-black text-amber-900 text-xs uppercase tracking-wider mb-1">Critical Formulation Specifications & Safety Notes</h4>
                    <ul className="list-disc list-inside text-xs text-amber-800 space-y-1.5 leading-relaxed font-semibold">
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
    <div className="w-full bg-white rounded-3xl shadow-xl border border-cyan-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Recipe Header */}
      <div className="bg-gradient-to-r from-cyan-600 to-teal-500 text-white px-6 py-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-2.5">
            <div className="bg-white/10 p-2.5 rounded-xl border border-white/20 text-white shadow-sm">
                <FlaskConical className="w-5 h-5 animate-pulse" />
            </div>
            <div>
                <h3 className="font-extrabold text-base font-sans tracking-wide leading-tight">
                  {parsedFormulaData ? parsedFormulaData.title : 'Target Chemical Recipe'}
                </h3>
                <p className="text-[10px] text-cyan-100 font-mono tracking-widest uppercase">
                  AUTOMATED LAB-BENCH RECIPE CALCULATOR & SPECS ARCHITECT
                </p>
            </div>
        </div>

        <a 
            href="https://pubchem.ncbi.nlm.nih.gov/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs font-extrabold text-cyan-700 bg-white border border-cyan-200 px-3.5 py-1.5 rounded-xl hover:bg-cyan-50 transition-colors shadow-xs"
        >
            <span>Search PubChem Hub</span>
            <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
      
      <div className="p-6 space-y-6">
        
        {/* original inquiry string */}
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-150 pb-3">
            <p className="text-[10px] uppercase tracking-wider text-slate-400 font-black mb-1.5">Original Inquiry Goal:</p>
            <p className="text-slate-800 text-xs font-semibold italic border-l-4 border-cyan-300 pl-4 py-0.5">
                "{result.originalQuery}"
            </p>
        </div>

        {renderContent()}

        {/* Global Action items */}
        <div className="pt-2 border-t border-slate-150 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
               *Calculation scales perfectly. Confirm compound concentrations before mixing on-bench.
            </p>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <a 
                  href={`https://pubchem.ncbi.nlm.nih.gov/#query=${encodeURIComponent(result.originalQuery)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-cyan-600 hover:bg-cyan-700 text-white px-4.5 py-2.0 rounded-xl font-extrabold transition-all text-xs shadow-md shadow-cyan-100 hover:shadow-cyan-200"
              >
                  <Search className="w-3.5 h-3.5" />
                  <span>PubChem Query Match</span>
              </a>

              <button 
                  onClick={handleCopy}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-250 px-4.5 py-2.0 rounded-xl font-extrabold transition-all text-xs"
              >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Recipe Copied' : 'Copy All Specs'}</span>
              </button>
            </div>
        </div>

      </div>
    </div>
  );
};

export default FormulationResultCard;
