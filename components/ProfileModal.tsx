import React, { useState, useEffect } from 'react';
import { UserProfile, Language } from '../types';
import { BookOpen, GraduationCap, Building2, Briefcase, Mail, Check, X, User, Settings, Globe } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface ProfileModalProps {
  currentProfile: UserProfile;
  onSave: (profile: UserProfile) => void;
  onClose: () => void;
}

type Tab = 'PROFILE' | 'SETTINGS';

const ProfileModal: React.FC<ProfileModalProps> = ({ currentProfile, onSave, onClose }) => {
  const { language, setLanguage, t } = useLanguage();
  const [activeTab, setActiveTab] = useState<Tab>('PROFILE');
  const [formData, setFormData] = useState<UserProfile>(currentProfile);

  // Close on Escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.email && formData.education && formData.institution) {
      onSave(formData);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[200] overflow-y-auto flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="max-w-xl w-full bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200">
        
        <div className="bg-indigo-600 px-6 py-4 flex justify-between items-center">
            <div className="flex items-center gap-3 text-white">
                <div className="bg-white/20 p-2 rounded-lg">
                    {activeTab === 'PROFILE' ? <User className="w-5 h-5" /> : <Settings className="w-5 h-5" />}
                </div>
                <h2 className="text-lg font-bold">{t('profile.title')}</h2>
            </div>
            <button 
                onClick={onClose}
                className="text-indigo-100 hover:text-white hover:bg-white/10 p-2 rounded-full transition-colors"
            >
                <X className="w-5 h-5" />
            </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200">
            <button
                onClick={() => setActiveTab('PROFILE')}
                className={`flex-1 py-3 text-sm font-bold text-center transition-colors border-b-2 ${activeTab === 'PROFILE' ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            >
                {t('profile.tab.profile')}
            </button>
            <button
                onClick={() => setActiveTab('SETTINGS')}
                className={`flex-1 py-3 text-sm font-bold text-center transition-colors border-b-2 ${activeTab === 'SETTINGS' ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            >
                {t('profile.tab.settings')}
            </button>
        </div>

        <div className="p-6 md:p-8">
          {activeTab === 'PROFILE' ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5" /> Email Address
                  </label>
                  <input
                    required
                    type="email"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-slate-800 text-sm font-medium"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                        <BookOpen className="w-3.5 h-3.5" /> Field of Study
                      </label>
                      <input
                        required
                        type="text"
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-slate-800 text-sm font-medium"
                        value={formData.education}
                        onChange={(e) => setFormData({...formData, education: e.target.value})}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                        <Building2 className="w-3.5 h-3.5" /> Institution
                      </label>
                      <input
                        required
                        type="text"
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-slate-800 text-sm font-medium"
                        value={formData.institution}
                        onChange={(e) => setFormData({...formData, institution: e.target.value})}
                      />
                    </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                    <GraduationCap className="w-3.5 h-3.5" /> Level of Education
                  </label>
                  <div className="relative">
                    <select
                      required
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-slate-800 text-sm font-medium appearance-none cursor-pointer"
                      value={formData.level}
                      onChange={(e) => setFormData({...formData, level: e.target.value})}
                    >
                      <option>Undergraduate Student</option>
                      <option>Masters Student (MSc)</option>
                      <option>PhD Student</option>
                      <option>Postdoctoral Researcher</option>
                      <option>Professor / PI</option>
                      <option>Industry Researcher</option>
                      <option>Clinician / MD</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-slate-400">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                    <Briefcase className="w-3.5 h-3.5" /> Research Interests
                  </label>
                  <textarea
                    required
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-slate-800 text-sm font-medium min-h-[80px] resize-none"
                    value={formData.experience}
                    onChange={(e) => setFormData({...formData, experience: e.target.value})}
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-slate-100 mt-6">
                  <button
                      type="button"
                      onClick={onClose}
                      className="flex-1 py-3 px-4 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 transition-colors"
                  >
                      {t('profile.cancel')}
                  </button>
                  <button
                      type="submit"
                      className="flex-1 py-3 px-4 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-100 hover:shadow-indigo-200 transition-all flex items-center justify-center gap-2"
                  >
                      <Check className="w-4 h-4" />
                      {t('profile.save')}
                  </button>
              </div>
            </form>
          ) : (
             <div className="space-y-6">
                 <div className="space-y-4">
                     <h3 className="font-bold text-slate-800 text-md flex items-center gap-2">
                        <Globe className="w-4 h-4 text-slate-500" />
                        {t('settings.language_select')}
                     </h3>
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {(['en', 'fr', 'es', 'pt', 'de', 'it'] as Language[]).map((lang) => (
                             <button
                                key={lang}
                                onClick={() => setLanguage(lang)}
                                className={`flex items-center justify-between px-4 py-3 rounded-xl border transition-all ${
                                    language === lang 
                                    ? 'bg-indigo-50 border-indigo-500 text-indigo-700 shadow-sm' 
                                    : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                                }`}
                             >
                                <span className="font-medium">
                                    {lang === 'en' ? 'English' : 
                                     lang === 'fr' ? 'Français' : 
                                     lang === 'es' ? 'Español' : 
                                     lang === 'pt' ? 'Português' : 
                                     lang === 'de' ? 'Deutsch' : 'Italiano'}
                                </span>
                                {language === lang && <Check className="w-4 h-4" />}
                             </button>
                        ))}
                     </div>
                 </div>
                 
                 <div className="flex justify-end pt-4 border-t border-slate-100 mt-8">
                     <button
                        onClick={onClose}
                        className="py-2.5 px-6 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition-colors"
                     >
                         {t('welcome.button')}
                     </button>
                 </div>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;