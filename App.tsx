
import React, { useState, useEffect, useMemo } from 'react';
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
import EmailResultCard from './components/EmailResultCard';
import MLResultCard from './components/MLResultCard';
import PPTResultCard from './components/PPTResultCard';
import PrecisionSearchResultCard from './components/PrecisionSearchResultCard';
import History from './components/History';
import ModeSwitcher from './components/ModeSwitcher';
import WelcomeScreen from './components/WelcomeScreen';
import OnboardingScreen from './components/OnboardingScreen';
import ProfileModal from './components/ProfileModal';
import { generateSearchString, generatePicoProtocol, screenAbstract, extractTechnicalData, generateCriticalAnalysis, generateIsoComplianceReview, generateNoveltyIdeas, analyzeImage, generateResourceSuggestions, findOpenAccess, findLabs, troubleshootProtocol, generateAcademicEmail, generateMLArchitecture, generatePptOutline, generatePrecisionSearch } from './services/geminiService';
import { QueryStatus, SearchResult, AppMode, GroundingSource, UserProfile } from './types';
import { AlertCircle, Star, Bookmark, Trash2, ChevronRight, FolderHeart } from 'lucide-react';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';

const AppContent: React.FC = () => {
  const { t } = useLanguage();
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [showWelcome, setShowWelcome] = useState(true);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [mode, setMode] = useState<AppMode>('QUERY_BUILDER');
  const [status, setStatus] = useState<QueryStatus>(QueryStatus.IDLE);
  const [currentResult, setCurrentResult] = useState<SearchResult | null>(null);
  const [history, setHistory] = useState<SearchResult[]>([]);
  const [savedResults, setSavedResults] = useState<SearchResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [inputVal, setInputVal] = useState<string>('');

  // Load state from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('bio_search_saved');
    const hist = localStorage.getItem('bio_search_history');
    const profile = localStorage.getItem('bio_search_profile');

    if (saved) {
      try { setSavedResults(JSON.parse(saved)); } catch (e) {}
    }
    if (hist) {
      try { setHistory(JSON.parse(hist)); } catch (e) {}
    }
    if (profile) {
      try { 
        setUserProfile(JSON.parse(profile));
        setShowOnboarding(false); // Skip onboarding if profile exists
      } catch (e) {}
    }
  }, []);

  // Sync states to localStorage
  useEffect(() => {
    localStorage.setItem('bio_search_saved', JSON.stringify(savedResults));
  }, [savedResults]);

  useEffect(() => {
    localStorage.setItem('bio_search_history', JSON.stringify(history));
  }, [history]);

  const handleOnboardingComplete = (profile: UserProfile) => {
    setUserProfile(profile);
    localStorage.setItem('bio_search_profile', JSON.stringify(profile));
    setShowOnboarding(false);
  };

  const handleProfileUpdate = (updatedProfile: UserProfile) => {
    setUserProfile(updatedProfile);
    localStorage.setItem('bio_search_profile', JSON.stringify(updatedProfile));
    setShowProfileModal(false);
  };

  const handleUploadArticle = (file: File) => {
    // Simulating an upload process
    alert(`Document "${file.name}" has been successfully uploaded to your private research workspace.`);
  };

  const savedIds = useMemo(() => savedResults.map(r => r.id), [savedResults]);

  const handleGenerate = async (input: string, secondaryInput?: string, options?: string[], imageData?: string) => {
    setStatus(QueryStatus.LOADING);
    setError(null);
    setCurrentResult(null);

    try {
      let resultData: { content: string, sources?: GroundingSource[] } = { content: '' };
      
      if (mode === 'QUERY_BUILDER') {
        resultData = await generateSearchString(input, options);
      } else if (mode === 'PRECISION_SEARCH_COMMANDER') {
        resultData = await generatePrecisionSearch(input);
      } else if (mode === 'PICO_PROTOCOL') {
        resultData = await generatePicoProtocol(input);
      } else if (mode === 'ABSTRACT_SCREENER') {
        const criteria = secondaryInput || "Scientific validity and relevance to the topic.";
        resultData = await screenAbstract(input, criteria);
      } else if (mode === 'DATA_EXTRACTOR') {
        resultData = await extractTechnicalData(input);
      } else if (mode === 'CRITICAL_ANALYST') {
        resultData = await generateCriticalAnalysis(input);
      } else if (mode === 'ISO_COMPLIANCE_AUDITOR') {
        resultData = await generateIsoComplianceReview(input);
      } else if (mode === 'NOVELTY_GENERATOR') {
        resultData = await generateNoveltyIdeas(input);
      } else if (mode === 'IMAGE_ANALYZER') {
        if (!imageData) throw new Error("No image data provided.");
        resultData = await analyzeImage(imageData, input);
      } else if (mode === 'RESOURCE_SCOUT') {
        resultData = await generateResourceSuggestions(input);
      } else if (mode === 'OPEN_ACCESS_FINDER') {
        resultData = await findOpenAccess(input);
      } else if (mode === 'LAB_SCOUT') {
        resultData = await findLabs(input);
      } else if (mode === 'PROTOCOL_TROUBLESHOOTER') {
        resultData = await troubleshootProtocol(input);
      } else if (mode === 'ACADEMIC_EMAIL_DRAFTER') {
        resultData = await generateAcademicEmail(input);
      } else if (mode === 'ML_DEEP_LEARNING_ARCHITECT') {
        resultData = await generateMLArchitecture(input);
      } else if (mode === 'PPT_ARCHITECT') {
        resultData = await generatePptOutline(input);
      }
      
      const newResult: SearchResult = {
        id: crypto.randomUUID(),
        originalQuery: input,
        content: resultData.content,
        sources: resultData.sources,
        type: mode,
        timestamp: Date.now(),
        isSaved: false,
      };

      setCurrentResult(newResult);
      setStatus(QueryStatus.SUCCESS);
      setHistory(prev => [newResult, ...prev].slice(0, 50));

    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
      setStatus(QueryStatus.ERROR);
    }
  };

  const handleSaveToggle = (result: SearchResult) => {
    const isCurrentlySaved = savedIds.includes(result.id);
    if (isCurrentlySaved) {
      setSavedResults(prev => prev.filter(r => r.id !== result.id));
    } else {
      setSavedResults(prev => [{ ...result, isSaved: true }, ...prev]);
    }
  };

  const handleDeleteSaved = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSavedResults(prev => prev.filter(r => r.id !== id));
  };

  const handleArchiveSelect = (result: SearchResult) => {
    setMode(result.type);
    setCurrentResult(result);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleModeChange = (newMode: AppMode) => {
    setMode(newMode);
    setCurrentResult(null);
    setError(null);
    setStatus(QueryStatus.IDLE);
    setInputVal('');
  };

  const handleContinue = (nextMode: AppMode, content: string) => {
    setMode(nextMode);
    setInputVal(content);
    setCurrentResult(null);
    setStatus(QueryStatus.IDLE);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isCurrentSaved = currentResult ? savedIds.includes(currentResult.id) : false;

  const getGradient = () => {
    switch(mode) {
      case 'QUERY_BUILDER': return 'from-indigo-600 to-teal-500';
      case 'PRECISION_SEARCH_COMMANDER': return 'from-blue-600 to-indigo-500';
      case 'PICO_PROTOCOL': return 'from-teal-600 to-rose-500';
      case 'ABSTRACT_SCREENER': return 'from-rose-600 to-orange-500';
      case 'DATA_EXTRACTOR': return 'from-cyan-600 to-blue-500';
      case 'CRITICAL_ANALYST': return 'from-violet-600 to-fuchsia-500';
      case 'ISO_COMPLIANCE_AUDITOR': return 'from-amber-600 to-yellow-500';
      default: return 'from-indigo-600 to-teal-500';
    }
  };

  if (showOnboarding) return <OnboardingScreen onComplete={handleOnboardingComplete} />;
  
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header 
        userProfile={userProfile} 
        onUpload={handleUploadArticle} 
        onProfileClick={() => setShowProfileModal(true)} 
      />
      
      {showWelcome && <WelcomeScreen onEnter={() => setShowWelcome(false)} />}
      
      {showProfileModal && userProfile && (
        <ProfileModal 
          currentProfile={userProfile} 
          onSave={handleProfileUpdate} 
          onClose={() => setShowProfileModal(false)} 
        />
      )}

      {!showWelcome && (
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row flex-1 w-full">
        {/* Sidebar */}
        <aside className="hidden md:flex w-72 shrink-0 border-r border-slate-200 bg-white p-6 overflow-y-auto max-h-[calc(100vh-4rem)] sticky top-16 flex-col">
           <div className="mb-8">
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4 px-1">{t('sidebar.modules')}</h3>
              <ModeSwitcher currentMode={mode} onModeChange={handleModeChange} disabled={status === QueryStatus.LOADING} orientation="vertical" />
           </div>

           {savedResults.length > 0 && (
             <div className="mb-8">
                <div className="flex items-center justify-between mb-4 px-1">
                  <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">{t('sidebar.saved')}</h3>
                  <span className="bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded-full">{savedResults.length}</span>
                </div>
                <div className="space-y-1.5">
                  {savedResults.slice(0, 8).map(saved => (
                    <button
                      key={saved.id}
                      onClick={() => handleArchiveSelect(saved)}
                      className="w-full text-left group p-2 rounded-xl border border-transparent hover:border-amber-100 hover:bg-amber-50/30 transition-all flex items-start gap-3"
                    >
                      <div className="mt-1 shrink-0">
                        <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-slate-700 truncate group-hover:text-amber-800">
                          {saved.originalQuery || 'Research Node'}
                        </p>
                        <p className="text-[9px] text-slate-400 truncate font-bold uppercase tracking-wider mt-0.5">{t(`mode.${saved.type}.label`)}</p>
                      </div>
                      <button 
                        onClick={(e) => handleDeleteSaved(saved.id, e)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-slate-300 hover:text-red-500 transition-all"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </button>
                  ))}
                  {savedResults.length > 8 && (
                    <p className="text-[10px] text-slate-400 italic text-center pt-2">Plus {savedResults.length - 8} more in archive...</p>
                  )}
                </div>
             </div>
           )}

           <div className="mt-auto p-4 bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-2xl shadow-lg shadow-indigo-200">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 bg-white/20 rounded-lg">
                  <FolderHeart className="w-4 h-4 text-white" />
                </div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">{t('sidebar.cloud')}</h4>
              </div>
              {userProfile ? (
                 <div>
                    <p className="text-[10px] text-indigo-100/80 leading-relaxed font-medium">
                      {t('sidebar.welcome_user')} <span className="text-white font-bold">{userProfile.email}</span>.
                    </p>
                    <p className="text-[9px] text-indigo-200 mt-1 uppercase tracking-wide">{userProfile.level}</p>
                 </div>
              ) : (
                <p className="text-[10px] text-indigo-100/80 leading-relaxed font-medium">
                  {t('sidebar.login_prompt')}
                </p>
              )}
           </div>

           <div className="mt-4 text-center pb-2">
             <p className="text-[10px] text-slate-400 font-medium">
               {t('sidebar.credit')} <span className="text-slate-600 font-bold block">Ali Zerehsaz</span>
             </p>
           </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 w-full min-w-0">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-10 py-12">
            <div className="md:hidden mb-8">
              <ModeSwitcher currentMode={mode} onModeChange={handleModeChange} disabled={status === QueryStatus.LOADING} orientation="horizontal" />
            </div>

            <div className="text-center mb-10 space-y-4">
              <h2 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">
                {t('hero.title_start')} <span className={`text-transparent bg-clip-text bg-gradient-to-r ${getGradient()}`}>{t('hero.title_end')}</span>
              </h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto font-medium leading-relaxed">
                {t('hero.subtitle')}
              </p>
            </div>

            <div className="mb-12">
              <SearchInput onGenerate={handleGenerate} status={status} mode={mode} initialValue={inputVal} />
            </div>

            {status === QueryStatus.ERROR && error && (
              <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3 text-red-700 shadow-sm animate-in fade-in slide-in-from-top-2">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <div><p className="font-bold">System Error</p><p className="text-sm font-medium opacity-90">{error}</p></div>
              </div>
            )}

            {currentResult && (
              <div className="mb-16 relative">
                {/* Save Toggle Overlay */}
                <div className="absolute -top-14 right-0 z-10 flex items-center gap-2 animate-in fade-in slide-in-from-right-4">
                   <button 
                    onClick={() => handleSaveToggle(currentResult)}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-full shadow-xl border transition-all font-bold text-xs uppercase tracking-widest
                      ${isCurrentSaved 
                        ? 'bg-amber-500 text-white border-amber-600 scale-105' 
                        : 'bg-white text-slate-600 border-slate-200 hover:border-amber-300 hover:text-amber-600 hover:bg-amber-50/30'}`}
                  >
                    <Star className={`w-4 h-4 ${isCurrentSaved ? 'fill-current' : ''}`} />
                    <span>{isCurrentSaved ? 'In Favorites' : 'Bookmark Node'}</span>
                  </button>
                </div>

                <div className="transition-all duration-500">
                  {currentResult.type === 'QUERY_BUILDER' && <ResultCard result={currentResult} onContinue={handleContinue} onToggleSave={() => handleSaveToggle(currentResult)} isSaved={isCurrentSaved} />}
                  {currentResult.type === 'PRECISION_SEARCH_COMMANDER' && <PrecisionSearchResultCard result={currentResult} />}
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
                  {currentResult.type === 'ACADEMIC_EMAIL_DRAFTER' && <EmailResultCard result={currentResult} />}
                  {currentResult.type === 'ML_DEEP_LEARNING_ARCHITECT' && <MLResultCard result={currentResult} />}
                  {currentResult.type === 'PPT_ARCHITECT' && <PPTResultCard result={currentResult} />}
                </div>
              </div>
            )}

            <History history={history} savedResults={savedResults} onSelect={handleArchiveSelect} />
          </div>
        </main>
        )}
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
};

export default App;
