
import React, { useRef } from 'react';
import { Microscope, Upload, User, Settings } from 'lucide-react';
import { UserProfile } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface HeaderProps {
  userProfile: UserProfile | null;
  onUpload: (file: File) => void;
  onProfileClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ userProfile, onUpload, onProfileClick }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { t } = useLanguage();

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUpload(file);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-indigo-600 rounded-lg">
            <Microscope className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              BioSearch <span className="text-indigo-600">Architect</span>
            </h1>
            <p className="text-xs text-slate-500 hidden sm:block">{t('app.subtitle')}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
           {/* Upload Action */}
           <input 
             type="file" 
             ref={fileInputRef} 
             className="hidden" 
             onChange={handleFileChange}
             accept=".pdf,.doc,.docx,.txt"
           />
           <button 
             onClick={handleUploadClick}
             className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors bg-slate-50 hover:bg-indigo-50 px-4 py-2 rounded-lg border border-slate-200 hover:border-indigo-200 shadow-sm"
             title="Upload your own article to the knowledge base"
           >
             <Upload className="w-4 h-4" />
             <span className="hidden sm:inline">{t('header.upload')}</span>
           </button>

           {/* Divider */}
           <div className="h-8 w-px bg-slate-200 mx-1 hidden sm:block"></div>
           
           {/* Profile Section */}
           {userProfile ? (
             <button 
               onClick={onProfileClick}
               className="flex items-center gap-3 group hover:bg-slate-50 p-1.5 rounded-xl transition-all border border-transparent hover:border-slate-100"
               title={t('profile.title')}
             >
                <div className="text-right hidden md:block">
                  <p className="text-sm font-bold text-slate-800 leading-none max-w-[150px] truncate group-hover:text-indigo-700">
                    {userProfile.email.split('@')[0]}
                  </p>
                  <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wide mt-1 truncate max-w-[150px] group-hover:text-indigo-500/80">
                    {userProfile.level}
                  </p>
                </div>
                <div className="relative">
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-100 to-violet-100 rounded-full flex items-center justify-center border-2 border-white shadow-md ring-1 ring-slate-100 text-indigo-700 font-bold select-none group-hover:scale-105 transition-transform">
                      {userProfile.email.charAt(0).toUpperCase()}
                    </div>
                    <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-sm border border-slate-100 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Settings className="w-3 h-3 text-slate-400" />
                    </div>
                </div>
             </button>
           ) : (
             <button 
                onClick={onProfileClick}
                className="flex items-center gap-2 text-slate-400 hover:text-indigo-600 transition-colors p-2 hover:bg-indigo-50 rounded-full"
             >
                <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center border-2 border-transparent group-hover:border-indigo-100">
                  <User className="w-5 h-5" />
                </div>
             </button>
           )}
        </div>
      </div>
    </header>
  );
};

export default Header;
