import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, ArrowRight, FileText, Filter, FlaskConical, BrainCircuit, ShieldCheck, Lightbulb, Check, Scan, Upload, X, Compass, Unlock, GraduationCap, Wrench, Mail, Cpu } from 'lucide-react';
import { QueryStatus, AppMode } from '../types';

interface SearchInputProps {
  onGenerate: (input: string, secondaryInput?: string, options?: string[], imageData?: string) => void;
  status: QueryStatus;
  mode: AppMode;
  initialValue?: string;
}

const STUDY_TYPES = [
  'Randomized Controlled Trial',
  'Systematic Review',
  'Meta-Analysis',
  'Review',
  'Clinical Trial',
  'Animal Study',
  'In Vitro'
];

const SearchInput: React.FC<SearchInputProps> = ({ onGenerate, status, mode, initialValue }) => {
  const [input, setInput] = useState('');
  const [criteria, setCriteria] = useState('');
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const criteriaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Effect to update input when initialValue changes (Context Caching/Chaining)
  useEffect(() => {
    if (initialValue) {
      setInput(initialValue);
      // Reset height calculation
      if (textareaRef.current) {
         textareaRef.current.style.height = 'auto';
         setTimeout(() => {
             if (textareaRef.current) {
                 textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
             }
         }, 0);
      }
    }
  }, [initialValue]);

  // Reset filters/image when mode changes
  useEffect(() => {
    setSelectedFilters([]);
    if (mode !== 'IMAGE_ANALYZER') {
        setSelectedImage(null);
    }
  }, [mode]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (status === QueryStatus.LOADING) return;

    if (mode === 'IMAGE_ANALYZER') {
        if (!selectedImage) return; // Must have image
        onGenerate(input, undefined, undefined, selectedImage);
    } else if (input.trim()) {
       onGenerate(input, criteria, selectedFilters);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.metaKey) {
      handleSubmit(e as unknown as React.FormEvent);
    }
  };

  const toggleFilter = (filter: string) => {
    setSelectedFilters(prev => 
      prev.includes(filter) 
        ? prev.filter(f => f !== filter) 
        : [...prev, filter]
    );
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
            setSelectedImage(reader.result as string);
        };
        reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
      setSelectedImage(null);
      if (fileInputRef.current) {
          fileInputRef.current.value = '';
      }
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
    if (criteriaRef.current) {
        criteriaRef.current.style.height = 'auto';
        criteriaRef.current.style.height = criteriaRef.current.scrollHeight + 'px';
    }
  }, [input, criteria, mode]);

  const isLoading = status === QueryStatus.LOADING;

  let placeholder = '';
  let buttonLabel = '';
  let buttonIcon = <Sparkles className="w-4 h-4" />;
  let buttonColor = '';

  switch (mode) {
    case 'QUERY_BUILDER':
        placeholder = "Describe your research topic (e.g., 'Use of hydrogels for myocardial infarction regeneration')...";
        buttonLabel = 'Generate Query';
        buttonIcon = <Sparkles className="w-4 h-4" />;
        buttonColor = "bg-indigo-600 text-white hover:bg-indigo-700";
        break;
    case 'PICO_PROTOCOL':
        placeholder = "Enter your research question (e.g., 'Does the use of PLGA nanoparticles improve drug delivery efficacy in glioblastoma compared to free drug?')...";
        buttonLabel = 'Define Protocol';
        buttonIcon = <FileText className="w-4 h-4" />;
        buttonColor = "bg-teal-600 text-white hover:bg-teal-700";
        break;
    case 'ABSTRACT_SCREENER':
        placeholder = "Paste the abstract here...";
        buttonLabel = 'Screen Abstract';
        buttonIcon = <Filter className="w-4 h-4" />;
        buttonColor = "bg-rose-600 text-white hover:bg-rose-700";
        break;
    case 'DATA_EXTRACTOR':
        placeholder = "Paste the Abstract or Methods section to extract quantitative data...";
        buttonLabel = 'Extract Data';
        buttonIcon = <FlaskConical className="w-4 h-4" />;
        buttonColor = "bg-cyan-600 text-white hover:bg-cyan-700";
        break;
    case 'CRITICAL_ANALYST':
        placeholder = "Paste key findings or data points from multiple studies to analyze trends and gaps...";
        buttonLabel = 'Analyze Gaps';
        buttonIcon = <BrainCircuit className="w-4 h-4" />;
        buttonColor = "bg-violet-600 text-white hover:bg-violet-700";
        break;
    case 'ISO_COMPLIANCE_AUDITOR':
        placeholder = "Paste the Methods section to audit against ISO 10993 and ASTM standards...";
        buttonLabel = 'Audit Compliance';
        buttonIcon = <ShieldCheck className="w-4 h-4" />;
        buttonColor = "bg-amber-600 text-white hover:bg-amber-700";
        break;
    case 'NOVELTY_GENERATOR':
        placeholder = "Paste summaries of analyzed papers to generate novel research hypotheses...";
        buttonLabel = 'Generate Ideas';
        buttonIcon = <Lightbulb className="w-4 h-4" />;
        buttonColor = "bg-pink-600 text-white hover:bg-pink-700";
        break;
    case 'IMAGE_ANALYZER':
        placeholder = "Ask a question about the image (optional)...";
        buttonLabel = 'Analyze Image';
        buttonIcon = <Scan className="w-4 h-4" />;
        buttonColor = "bg-blue-600 text-white hover:bg-blue-700";
        break;
    case 'RESOURCE_SCOUT':
        placeholder = "Enter your research topic to find the best databases (e.g., 'Biodegradation kinetics of PLA scaffolds')...";
        buttonLabel = 'Find Resources';
        buttonIcon = <Compass className="w-4 h-4" />;
        buttonColor = "bg-emerald-600 text-white hover:bg-emerald-700";
        break;
    case 'OPEN_ACCESS_FINDER':
        placeholder = "Enter Article DOI (e.g., 10.1038/...) or Title to find legal PDF links...";
        buttonLabel = 'Find PDF';
        buttonIcon = <Unlock className="w-4 h-4" />;
        buttonColor = "bg-teal-600 text-white hover:bg-teal-700";
        break;
    case 'LAB_SCOUT':
        placeholder = "Enter research topic and target region (e.g., 'pH-sensitive hydrogels for glioblastoma in South Korea')...";
        buttonLabel = 'Find Labs';
        buttonIcon = <GraduationCap className="w-4 h-4" />;
        buttonColor = "bg-orange-600 text-white hover:bg-orange-700";
        break;
    case 'PROTOCOL_TROUBLESHOOTER':
        placeholder = "Describe your failed experiment (e.g., 'PLGA nanoparticles aggregated during solvent evaporation')...";
        buttonLabel = 'Diagnose Issue';
        buttonIcon = <Wrench className="w-4 h-4" />;
        buttonColor = "bg-red-600 text-white hover:bg-red-700";
        break;
    case 'ACADEMIC_EMAIL_DRAFTER':
        placeholder = "Recipient: [Name/Uni], Goal: [PhD/Collab/Question], Context: [My background/work]...";
        buttonLabel = 'Draft Email';
        buttonIcon = <Mail className="w-4 h-4" />;
        buttonColor = "bg-purple-600 text-white hover:bg-purple-700";
        break;
    case 'ML_DEEP_LEARNING_ARCHITECT':
        placeholder = "Describe your data and goal (e.g., 'Classify H&E stained histology images for cancer grading')...";
        buttonLabel = 'Design AI Model';
        buttonIcon = <Cpu className="w-4 h-4" />;
        buttonColor = "bg-fuchsia-600 text-white hover:bg-fuchsia-700";
        break;
  }

  const isButtonDisabled = isLoading || 
    (mode === 'IMAGE_ANALYZER' && !selectedImage) ||
    (mode !== 'IMAGE_ANALYZER' && !input.trim());

  return (
    <div className={`w-full bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden transition-all duration-300 focus-within:ring-2 focus-within:border-transparent ${
        mode === 'QUERY_BUILDER' ? 'focus-within:ring-indigo-500/20' : 
        mode === 'PICO_PROTOCOL' ? 'focus-within:ring-teal-500/20' : 
        mode === 'ABSTRACT_SCREENER' ? 'focus-within:ring-rose-500/20' : 
        mode === 'DATA_EXTRACTOR' ? 'focus-within:ring-cyan-500/20' :
        mode === 'CRITICAL_ANALYST' ? 'focus-within:ring-violet-500/20' :
        mode === 'ISO_COMPLIANCE_AUDITOR' ? 'focus-within:ring-amber-500/20' :
        mode === 'NOVELTY_GENERATOR' ? 'focus-within:ring-pink-500/20' :
        mode === 'IMAGE_ANALYZER' ? 'focus-within:ring-blue-500/20' :
        mode === 'RESOURCE_SCOUT' ? 'focus-within:ring-emerald-500/20' :
        mode === 'LAB_SCOUT' ? 'focus-within:ring-orange-500/20' :
        mode === 'PROTOCOL_TROUBLESHOOTER' ? 'focus-within:ring-red-500/20' :
        mode === 'ACADEMIC_EMAIL_DRAFTER' ? 'focus-within:ring-purple-500/20' :
        mode === 'ML_DEEP_LEARNING_ARCHITECT' ? 'focus-within:ring-fuchsia-500/20' :
        'focus-within:ring-teal-500/20'
    }`}>
      <form onSubmit={handleSubmit} className="relative flex flex-col">
        
        {/* Criteria Input for Screener Mode */}
        {mode === 'ABSTRACT_SCREENER' && (
             <div className="p-1 border-b border-slate-100 bg-slate-50/50">
                <textarea
                    ref={criteriaRef}
                    value={criteria}
                    onChange={(e) => setCriteria(e.target.value)}
                    placeholder="Define Inclusion/Exclusion Criteria (Optional, e.g., 'Include only in vivo studies')..."
                    className="w-full p-4 min-h-[80px] text-sm text-slate-700 placeholder:text-slate-400 border-none outline-none resize-none bg-transparent"
                    disabled={isLoading}
                />
            </div>
        )}

        {/* Image Upload Area for Image Analyzer */}
        {mode === 'IMAGE_ANALYZER' && (
            <div className="p-4 border-b border-slate-100 bg-slate-50/30">
                {!selectedImage ? (
                    <div 
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-slate-300 rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition-colors group"
                    >
                        <Upload className="w-8 h-8 text-slate-400 group-hover:text-blue-500 mb-2" />
                        <p className="text-sm font-medium text-slate-600 group-hover:text-blue-600">Click to upload an image</p>
                        <p className="text-xs text-slate-400 mt-1">PNG, JPG, or WEBP</p>
                    </div>
                ) : (
                    <div className="relative inline-block">
                        <img src={selectedImage} alt="Preview" className="h-48 rounded-lg shadow-sm border border-slate-200 object-contain bg-white" />
                        <button 
                            type="button"
                            onClick={handleRemoveImage}
                            className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow-md border border-slate-200 text-slate-500 hover:text-red-500"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                )}
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                    accept="image/*" 
                    className="hidden" 
                />
            </div>
        )}

        <div className="p-1">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className={`w-full p-4 min-h-[120px] text-lg text-slate-800 placeholder:text-slate-400 border-none outline-none resize-none bg-transparent ${mode === 'ABSTRACT_SCREENER' || mode === 'CRITICAL_ANALYST' || mode === 'ISO_COMPLIANCE_AUDITOR' || mode === 'NOVELTY_GENERATOR' || mode === 'PROTOCOL_TROUBLESHOOTER' || mode === 'ACADEMIC_EMAIL_DRAFTER' || mode === 'ML_DEEP_LEARNING_ARCHITECT' ? 'min-h-[150px]' : ''}`}
            disabled={isLoading}
          />
        </div>

        {/* Filters for Query Builder */}
        {mode === 'QUERY_BUILDER' && (
          <div className="px-4 pb-2 flex flex-wrap gap-2 items-center border-t border-slate-50 pt-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mr-1">Study Types:</span>
            {STUDY_TYPES.map(type => {
              const isActive = selectedFilters.includes(type);
              return (
                <button 
                  key={type}
                  type="button"
                  onClick={() => toggleFilter(type)}
                  disabled={isLoading}
                  className={`
                    text-[11px] px-2.5 py-1 rounded-full border transition-all duration-200 flex items-center gap-1.5 font-medium
                    ${isActive 
                      ? 'bg-indigo-50 border-indigo-200 text-indigo-700 shadow-sm' 
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300'}
                  `}
                >
                   {isActive && <Check className="w-3 h-3" />}
                  {type}
                </button>
              );
            })}
          </div>
        )}
        
        <div className="flex items-center justify-between px-4 pb-4 pt-4 bg-gradient-to-t from-white via-white to-transparent">
          <div className="text-xs text-slate-400 font-medium">
             {mode === 'ABSTRACT_SCREENER' 
                ? <span className="hidden sm:inline">Paste abstract and criteria. </span>
                : mode === 'CRITICAL_ANALYST'
                ? <span className="hidden sm:inline">Paste multiple study findings. </span>
                : mode === 'ISO_COMPLIANCE_AUDITOR'
                ? <span className="hidden sm:inline">Paste Methods section. </span>
                : mode === 'NOVELTY_GENERATOR'
                ? <span className="hidden sm:inline">Paste paper summaries. </span>
                : mode === 'IMAGE_ANALYZER'
                ? <span className="hidden sm:inline">Upload image and describe context. </span>
                : mode === 'RESOURCE_SCOUT'
                ? <span className="hidden sm:inline">Describe your topic to find databases. </span>
                : mode === 'OPEN_ACCESS_FINDER'
                ? <span className="hidden sm:inline">Enter DOI to find legal PDF. </span>
                : mode === 'LAB_SCOUT'
                ? <span className="hidden sm:inline">Enter topic and target region. </span>
                : mode === 'PROTOCOL_TROUBLESHOOTER'
                ? <span className="hidden sm:inline">Describe failed experiment details. </span>
                : mode === 'ACADEMIC_EMAIL_DRAFTER'
                ? <span className="hidden sm:inline">Enter Recipient, Goal, and Context. </span>
                : mode === 'ML_DEEP_LEARNING_ARCHITECT'
                ? <span className="hidden sm:inline">Enter Data Type and Goal. </span>
                : <span className="hidden sm:inline">Pro Tip: Be specific. </span>
             }
            <span className="inline-block bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 text-[10px] tracking-wide">⌘ + Enter</span> to submit
          </div>
          
          <button
            type="submit"
            disabled={isButtonDisabled}
            className={`
              flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200
              ${isButtonDisabled
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                : `${buttonColor} hover:shadow-md active:transform active:scale-95`}
            `}
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                {buttonIcon}
                <span>{buttonLabel}</span>
                <ArrowRight className="w-4 h-4 opacity-60" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SearchInput;