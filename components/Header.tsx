
import React from 'react';
import { Microscope, Search } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-indigo-600 rounded-lg">
            <Microscope className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              BioSearch <span className="text-indigo-600">Architect</span>
            </h1>
            <p className="text-xs text-slate-500 hidden sm:block">Biomaterials Query Engineering Powered by Gemini</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
           <a 
             href="#" 
             className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors flex items-center gap-1"
           >
             <Search className="w-4 h-4" />
             <span>New Query</span>
           </a>
        </div>
      </div>
    </header>
  );
};

export default Header;
