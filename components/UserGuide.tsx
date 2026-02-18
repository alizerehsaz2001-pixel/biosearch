
import React, { useEffect } from 'react';
import { X, MousePointerClick, Keyboard, Sparkles, FileOutput, ArrowRight } from 'lucide-react';

interface UserGuideProps {
  onClose: () => void;
}

const UserGuide: React.FC<UserGuideProps> = ({ onClose }) => {
  // Close on Escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const steps = [
    {
      icon: MousePointerClick,
      title: "1. Select Your Agent",
      desc: "Navigate the sidebar to choose a specialized module (e.g., Query Builder, Critical Analyst). Each agent is trained for a specific stage of the biomedical workflow.",
      color: "text-indigo-600",
      bg: "bg-indigo-100"
    },
    {
      icon: Keyboard,
      title: "2. Define Context",
      desc: "Enter your research topic, paste an abstract, or upload an image. Use specific keywords. You can also use Command + Enter to submit quickly.",
      color: "text-teal-600",
      bg: "bg-teal-100"
    },
    {
      icon: Sparkles,
      title: "3. Generate Architecture",
      desc: "The AI Architect processes your input using advanced frameworks (PICO, ISO 10993) to generate structured, validated research outputs.",
      color: "text-violet-600",
      bg: "bg-violet-100"
    },
    {
      icon: FileOutput,
      title: "4. Iteration & Export",
      desc: "Review the result. You can then 'Pivot' to another mode (e.g., from Search -> Protocol), save to your archive, or export to Word/PPT.",
      color: "text-amber-600",
      bg: "bg-amber-100"
    }
  ];

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[300] flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="max-w-4xl w-full bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col md:flex-row">
        
        {/* Left Visual Side */}
        <div className="md:w-1/3 bg-slate-900 p-8 text-white flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
            
            <div className="relative z-10">
                <h2 className="text-3xl font-bold mb-4 tracking-tight">Master Your<br/>Research<br/><span className="text-indigo-400">Workflow</span></h2>
                <p className="text-slate-400 text-sm leading-relaxed">
                    BioSearch Architect isn't just a chatbot. It's a suite of specialized engineering agents designed to accelerate every phase of biomaterials discovery.
                </p>
            </div>

            <div className="relative z-10 mt-8">
                <div className="flex items-center gap-3 text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                    Supported Workflows
                </div>
                <ul className="space-y-2 text-sm text-slate-300">
                    <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div> Literature Review</li>
                    <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div> Protocol Design</li>
                    <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-purple-400 rounded-full"></div> Data Extraction</li>
                    <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-orange-400 rounded-full"></div> Compliance Auditing</li>
                </ul>
            </div>
        </div>

        {/* Right Content Side */}
        <div className="flex-1 p-8 bg-white relative">
            <button 
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
            >
                <X className="w-6 h-6" />
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                {steps.map((step, idx) => (
                    <div key={idx} className="group p-4 rounded-xl border border-slate-100 hover:border-indigo-100 hover:bg-indigo-50/30 transition-all duration-300">
                        <div className={`w-10 h-10 rounded-lg ${step.bg} ${step.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                            <step.icon className="w-5 h-5" />
                        </div>
                        <h3 className="font-bold text-slate-900 mb-2">{step.title}</h3>
                        <p className="text-xs text-slate-500 leading-relaxed">
                            {step.desc}
                        </p>
                    </div>
                ))}
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end">
                <button
                    onClick={onClose}
                    className="flex items-center gap-2 bg-slate-900 hover:bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg hover:shadow-indigo-200"
                >
                    <span>Start Architecting</span>
                    <ArrowRight className="w-4 h-4" />
                </button>
            </div>
        </div>

      </div>
    </div>
  );
};

export default UserGuide;
