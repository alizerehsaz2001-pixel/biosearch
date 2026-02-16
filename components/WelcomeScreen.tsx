import React from 'react';
import { MODES } from './ModeSwitcher';
import { Microscope, ArrowRight } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface WelcomeScreenProps {
  onEnter: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onEnter }) => {
  const { t } = useLanguage();

  return (
    <div className="fixed inset-0 bg-slate-50 z-[100] overflow-y-auto animate-in fade-in duration-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        
        {/* Header */}
        <div className="text-center mb-16 space-y-4">
           <div className="inline-flex p-4 bg-indigo-600 rounded-2xl mb-2 shadow-xl shadow-indigo-200 transform hover:scale-110 transition-transform duration-300">
             <Microscope className="w-10 h-10 text-white" />
           </div>
           <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
             {t('welcome.title')} <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-teal-500">BioSearch Architect</span>
           </h1>
           <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
             {t('welcome.subtitle')}
           </p>
        </div>

        {/* Grid of Samaritans */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-20">
           {MODES.map((mode) => (
             <div key={mode.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-xl hover:border-indigo-100 transition-all duration-300 group">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-5 ${mode.bg} ${mode.color} group-hover:scale-110 transition-transform duration-300`}>
                  <mode.icon className="w-7 h-7" />
                </div>
                <h3 className="font-bold text-slate-900 text-lg mb-2 group-hover:text-indigo-700 transition-colors">{t(`mode.${mode.id}.label`)}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  "I am here to help you <span className="font-medium text-slate-700">{t(`mode.${mode.id}.desc`).toLowerCase()}</span>."
                </p>
             </div>
           ))}
        </div>

        {/* Enter Button */}
        <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-slate-50 via-slate-50 to-transparent flex flex-col items-center justify-center pointer-events-none">
           <button
             onClick={onEnter}
             className="pointer-events-auto flex items-center gap-3 bg-indigo-600 hover:bg-indigo-700 text-white text-lg font-bold px-10 py-4 rounded-full shadow-2xl shadow-indigo-300 hover:shadow-indigo-400 hover:-translate-y-1 active:translate-y-0 transition-all duration-300 mb-4"
           >
             <span>{t('welcome.button')}</span>
             <ArrowRight className="w-6 h-6" />
           </button>
           
           <p className="text-xs text-slate-400 font-medium pointer-events-auto">
             {t('sidebar.credit')} <span className="text-slate-600 font-bold">Ali Zerehsaz</span>
           </p>
        </div>
        
        {/* Spacer for fixed button */}
        <div className="h-32"></div>

      </div>
    </div>
  );
};

export default WelcomeScreen;