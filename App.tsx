import React, { useState } from 'react';
import Header from './components/Header';
import SearchInput from './components/SearchInput';
import ResultCard from './components/ResultCard';
import ProtocolCard from './components/ProtocolCard';
import ScreeningResultCard from './components/ScreeningResultCard';
import ExtractionResultCard from './components/ExtractionResultCard';
import AnalystResultCard from './components/AnalystResultCard';
import AuditorResultCard from './components/AuditorResultCard';
import NoveltyResultCard from './components/NoveltyResultCard';
import ImageResultCard from './components/ImageResultCard';
import ResourceScoutCard from './components/ResourceScoutCard';
import OpenAccessResultCard from './components/OpenAccessResultCard';
import LabScoutResultCard from './components/LabScoutResultCard';
import TroubleshooterResultCard from './components/TroubleshooterResultCard';
import History from './components/History';
import ModeSwitcher from './components/ModeSwitcher';
import { generateSearchString, generatePicoProtocol, screenAbstract, extractTechnicalData, generateCriticalAnalysis, generateIsoComplianceReview, generateNoveltyIdeas, analyzeImage, generateResourceSuggestions, findOpenAccess, findLabs, troubleshootProtocol } from './services/geminiService';
import { QueryStatus, SearchResult, AppMode } from './types';
import { AlertCircle } from 'lucide-react';

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>('QUERY_BUILDER');
  const [status, setStatus] = useState<QueryStatus>(QueryStatus.IDLE);
  const [currentResult, setCurrentResult] = useState<SearchResult | null>(null);
  const [history, setHistory] = useState<SearchResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [inputVal, setInputVal] = useState<string>('');

  const handleGenerate = async (input: string, secondaryInput?: string, options?: string[], imageData?: string) => {
    setStatus(QueryStatus.LOADING);
    setError(null);
    setCurrentResult(null);

    try {
      let content = '';
      if (mode === 'QUERY_BUILDER') {
        content = await generateSearchString(input, options);
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
      } else if (mode === 'NOVELTY_GENERATOR') {
        content = await generateNoveltyIdeas(input);
      } else if (mode === 'IMAGE_ANALYZER') {
        if (!imageData) throw new Error("No image data provided.");
        content = await analyzeImage(imageData, input);
      } else if (mode === 'RESOURCE_SCOUT') {
        content = await generateResourceSuggestions(input);
      } else if (mode === 'OPEN_ACCESS_FINDER') {
        content = await findOpenAccess(input);
      } else if (mode === 'LAB_SCOUT') {
        content = await findLabs(input);
      } else if (mode === 'PROTOCOL_TROUBLESHOOTER') {
        content = await troubleshootProtocol(input);
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
    setInputVal(''); // Reset input on manual mode switch
  };

  const handleContinue = (nextMode: AppMode, content: string) => {
    setMode(nextMode);
    setInputVal(content);
    setCurrentResult(null);
    setStatus(QueryStatus.IDLE);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getGradient = () => {
      switch(mode) {
          case 'QUERY_BUILDER': return 'from-indigo-600 to-teal-500';
          case 'PICO_PROTOCOL': return 'from-teal-600 to-rose-500';
          case 'ABSTRACT_SCREENER': return 'from-rose-600 to-orange-500';
          case 'DATA_EXTRACTOR': return 'from-cyan-600 to-blue-500';
          case 'CRITICAL_ANALYST': return 'from-violet-600 to-fuchsia-500';
          case 'ISO_COMPLIANCE_AUDITOR': return 'from-amber-600 to-yellow-500';
          case 'NOVELTY_GENERATOR': return 'from-pink-600 to-rose-500';
          case 'IMAGE_ANALYZER': return 'from-blue-600 to-indigo-500';
          case 'RESOURCE_SCOUT': return 'from-emerald-600 to-teal-500';
          case 'OPEN_ACCESS_FINDER': return 'from-teal-600 to-emerald-500';
          case 'LAB_SCOUT': return 'from-orange-600 to-amber-500';
          case 'PROTOCOL_TROUBLESHOOTER': return 'from-red-600 to-orange-500';
      }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      <div className="max-w-7xl mx-auto flex flex-col md:flex-row min-h-[calc(100vh-4rem)]">
        {/* Sidebar - Desktop */}
        <aside className="hidden md:block w-72 shrink-0 border-r border-slate-200 bg-slate-50/50 p-6 overflow-y-auto max-h-[calc(100vh-4rem)] sticky top-16">
           <div className="mb-6">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 px-1">Modules</h3>
              <ModeSwitcher 
                currentMode={mode} 
                onModeChange={handleModeChange} 
                disabled={status === QueryStatus.LOADING}
                orientation="vertical"
              />
           </div>
           
           <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-100/50">
              <h4 className="text-xs font-semibold text-indigo-900 mb-1">BioSearch Pro</h4>
              <p className="text-[10px] text-indigo-700/70 leading-relaxed">
                Unlock advanced features like Batch Processing and Team Collaboration.
              </p>
           </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 w-full min-w-0">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            
            {/* Mobile Mode Switcher */}
            <div className="md:hidden mb-8">
              <ModeSwitcher 
                currentMode={mode} 
                onModeChange={handleModeChange} 
                disabled={status === QueryStatus.LOADING}
                orientation="horizontal"
              />
            </div>

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
                {mode === 'NOVELTY_GENERATOR' && 'Synthesize findings to propose novel, high-impact research hypotheses and innovations.'}
                {mode === 'IMAGE_ANALYZER' && 'Extract text, analyze graphs, and interpret scientific figures from uploaded images.'}
                {mode === 'RESOURCE_SCOUT' && 'Identify the best databases (PubMed, Scopus, Elsevier) for your specific query and get direct search links.'}
                {mode === 'OPEN_ACCESS_FINDER' && 'Find free, legal PDF links for articles using DOI or Title via Unpaywall and Core.ac.uk.'}
                {mode === 'LAB_SCOUT' && 'Find active research groups and professors in your niche with recent publications (2024-2026).'}
                {mode === 'PROTOCOL_TROUBLESHOOTER' && 'Diagnose experimental failures with senior lab manager insights and step-by-step fixes.'}
              </p>
            </div>

            {/* Input Section */}
            <div className="mb-10">
              <SearchInput 
                onGenerate={handleGenerate} 
                status={status} 
                mode={mode} 
                initialValue={inputVal}
              />
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
              <div className="mb-12">
                {currentResult.type === 'QUERY_BUILDER' && <ResultCard result={currentResult} onContinue={handleContinue} />}
                {currentResult.type === 'PICO_PROTOCOL' && <ProtocolCard result={currentResult} />}
                {currentResult.type === 'ABSTRACT_SCREENER' && <ScreeningResultCard result={currentResult} onContinue={handleContinue} />}
                {currentResult.type === 'DATA_EXTRACTOR' && <ExtractionResultCard result={currentResult} onContinue={handleContinue} />}
                {currentResult.type === 'CRITICAL_ANALYST' && <AnalystResultCard result={currentResult} onContinue={handleContinue} />}
                {currentResult.type === 'ISO_COMPLIANCE_AUDITOR' && <AuditorResultCard result={currentResult} />}
                {currentResult.type === 'NOVELTY_GENERATOR' && <NoveltyResultCard result={currentResult} />}
                {currentResult.type === 'IMAGE_ANALYZER' && <ImageResultCard result={currentResult} />}
                {currentResult.type === 'RESOURCE_SCOUT' && <ResourceScoutCard result={currentResult} />}
                {currentResult.type === 'OPEN_ACCESS_FINDER' && <OpenAccessResultCard result={currentResult} />}
                {currentResult.type === 'LAB_SCOUT' && <LabScoutResultCard result={currentResult} />}
                {currentResult.type === 'PROTOCOL_TROUBLESHOOTER' && <TroubleshooterResultCard result={currentResult} />}
              </div>
            )}

            {/* History Section */}
            <History history={history} onSelect={handleHistorySelect} />

          </div>
        </main>
      </div>
    </div>
  );
};

export default App;