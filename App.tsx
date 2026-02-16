import React, { useState } from 'react';
import Header from './components/Header';
import SearchInput from './components/SearchInput';
import ResultCard from './components/ResultCard';
import ProtocolCard from './components/ProtocolCard';
import ScreeningResultCard from './components/ScreeningResultCard';
import ExtractionResultCard from './components/ExtractionResultCard';
import AnalystResultCard from './components/AnalystResultCard';
import AuditorResultCard from './components/AuditorResultCard';
import History from './components/History';
import ModeSwitcher from './components/ModeSwitcher';
import { generateSearchString, generatePicoProtocol, screenAbstract, extractTechnicalData, generateCriticalAnalysis, generateIsoComplianceReview } from './services/geminiService';
import { QueryStatus, SearchResult, AppMode } from './types';
import { AlertCircle } from 'lucide-react';

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>('QUERY_BUILDER');
  const [status, setStatus] = useState<QueryStatus>(QueryStatus.IDLE);
  const [currentResult, setCurrentResult] = useState<SearchResult | null>(null);
  const [history, setHistory] = useState<SearchResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async (input: string, secondaryInput?: string) => {
    setStatus(QueryStatus.LOADING);
    setError(null);
    setCurrentResult(null);

    try {
      let content = '';
      if (mode === 'QUERY_BUILDER') {
        content = await generateSearchString(input);
      } else if (mode === 'PICO_PROTOCOL') {
        content = await generatePicoProtocol(input);
      } else if (mode === 'ABSTRACT_SCREENER') {
        if (!secondaryInput) throw new Error("Criteria is required for screening.");
        content = await screenAbstract(input, secondaryInput);
      } else if (mode === 'DATA_EXTRACTOR') {
        content = await extractTechnicalData(input);
      } else if (mode === 'CRITICAL_ANALYST') {
        content = await generateCriticalAnalysis(input);
      } else if (mode === 'ISO_COMPLIANCE_AUDITOR') {
        content = await generateIsoComplianceReview(input);
      }
      
      const newResult: SearchResult = {
        id: crypto.randomUUID(),
        originalQuery: input, // Stores the main input (abstract or topic)
        content,
        type: mode,
        timestamp: Date.now(),
      };

      setCurrentResult(newResult);
      setStatus(QueryStatus.SUCCESS);
      
      setHistory(prev => {
        const newHistory = [newResult, ...prev].slice(0, 10);
        return newHistory;
      });

    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
      setStatus(QueryStatus.ERROR);
    }
  };

  const handleHistorySelect = (result: SearchResult) => {
    if (result.type !== mode) {
        setMode(result.type);
    }
    setCurrentResult(result);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleModeChange = (newMode: AppMode) => {
    setMode(newMode);
    setCurrentResult(null);
    setError(null);
    setStatus(QueryStatus.IDLE);
  };

  const getGradient = () => {
      switch(mode) {
          case 'QUERY_BUILDER': return 'from-indigo-600 to-teal-500';
          case 'PICO_PROTOCOL': return 'from-teal-600 to-rose-500';
          case 'ABSTRACT_SCREENER': return 'from-rose-600 to-orange-500';
          case 'DATA_EXTRACTOR': return 'from-cyan-600 to-blue-500';
          case 'CRITICAL_ANALYST': return 'from-violet-600 to-fuchsia-500';
          case 'ISO_COMPLIANCE_AUDITOR': return 'from-amber-600 to-yellow-500';
      }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <Header />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        
        {/* Hero Section Text */}
        <div className="text-center mb-8 space-y-3">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Biomedical <span className={`text-transparent bg-clip-text bg-gradient-to-r ${getGradient()}`}>Research Architect</span>
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            {mode === 'QUERY_BUILDER' && 'Transform natural language topics into precision MeSH-enabled boolean strings for PubMed & Scopus.'}
            {mode === 'PICO_PROTOCOL' && 'Define structured PICO protocols and Inclusion/Exclusion criteria for systematic reviews.'}
            {mode === 'ABSTRACT_SCREENER' && 'Rapidly screen scientific abstracts against your inclusion/exclusion criteria using AI.'}
            {mode === 'DATA_EXTRACTOR' && 'Automatically extract key material properties, fabrication methods, and biological outcomes from text.'}
            {mode === 'CRITICAL_ANALYST' && 'Analyze data from multiple studies to identify material trends, performance gaps, and future directions.'}
            {mode === 'ISO_COMPLIANCE_AUDITOR' && 'Audit research methods against ISO 10993 and ASTM standards for regulatory compliance.'}
          </p>
        </div>

        {/* Mode Switcher */}
        <ModeSwitcher 
          currentMode={mode} 
          onModeChange={handleModeChange} 
          disabled={status === QueryStatus.LOADING}
        />

        {/* Input Section */}
        <div className="mb-10">
          <SearchInput onGenerate={handleGenerate} status={status} mode={mode} />
        </div>

        {/* Error Display */}
        {status === QueryStatus.ERROR && error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-red-700 animate-in fade-in slide-in-from-top-2">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Generation Failed</p>
              <p className="text-sm opacity-90">{error}</p>
            </div>
          </div>
        )}

        {/* Result Section */}
        {currentResult && (
           <>
             {currentResult.type === 'QUERY_BUILDER' && <ResultCard result={currentResult} />}
             {currentResult.type === 'PICO_PROTOCOL' && <ProtocolCard result={currentResult} />}
             {currentResult.type === 'ABSTRACT_SCREENER' && <ScreeningResultCard result={currentResult} />}
             {currentResult.type === 'DATA_EXTRACTOR' && <ExtractionResultCard result={currentResult} />}
             {currentResult.type === 'CRITICAL_ANALYST' && <AnalystResultCard result={currentResult} />}
             {currentResult.type === 'ISO_COMPLIANCE_AUDITOR' && <AuditorResultCard result={currentResult} />}
           </>
        )}

        {/* History Section */}
        <History history={history} onSelect={handleHistorySelect} />

      </main>
    </div>
  );
};

export default App;