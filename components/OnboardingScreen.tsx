import React, { useState } from 'react';
import { UserProfile } from '../types';
import { BookOpen, GraduationCap, Building2, Briefcase, Mail, ArrowRight, Quote } from 'lucide-react';

interface OnboardingScreenProps {
  onComplete: (profile: UserProfile) => void;
}

const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onComplete }) => {
  const [formData, setFormData] = useState<UserProfile>({
    email: '',
    education: '',
    institution: '',
    level: 'PhD Student',
    experience: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.email && formData.education && formData.institution) {
      onComplete(formData);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-50 z-[200] overflow-y-auto flex items-center justify-center min-h-screen p-4">
      <div className="max-w-2xl w-full bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in duration-500">
        
        {/* Header Section with Quote */}
        <div className="bg-indigo-900 px-8 py-10 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
          <div className="relative z-10">
            <Quote className="w-8 h-8 text-indigo-400 mx-auto mb-4 opacity-80" />
            <h1 className="text-2xl md:text-3xl font-serif font-medium text-white italic leading-relaxed tracking-wide">
              "Let knowledge grow from more to more; <br/>and so be human life enriched."
            </h1>
            <div className="w-16 h-1 bg-indigo-500 mx-auto mt-6 rounded-full"></div>
          </div>
        </div>

        {/* Form Section */}
        <div className="p-8 md:p-10">
          <div className="mb-8 text-center">
            <h2 className="text-xl font-bold text-slate-800">Researcher Profile</h2>
            <p className="text-sm text-slate-500 mt-1">Please provide your academic background to initialize the architecture.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                  <Mail className="w-3 h-3" /> Email Address
                </label>
                <input
                  required
                  type="email"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-slate-800 text-sm font-medium"
                  placeholder="researcher@university.edu"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                  <BookOpen className="w-3 h-3" /> Field of Study
                </label>
                <input
                  required
                  type="text"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-slate-800 text-sm font-medium"
                  placeholder="e.g. Biomaterials Engineering"
                  value={formData.education}
                  onChange={(e) => setFormData({...formData, education: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                  <Building2 className="w-3 h-3" /> Institution / Place of Study
                </label>
                <input
                  required
                  type="text"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-slate-800 text-sm font-medium"
                  placeholder="e.g. MIT, Cambridge, Private Lab"
                  value={formData.institution}
                  onChange={(e) => setFormData({...formData, institution: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                  <GraduationCap className="w-3 h-3" /> Level of Education
                </label>
                <div className="relative">
                  <select
                    required
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-slate-800 text-sm font-medium appearance-none cursor-pointer"
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
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                <Briefcase className="w-3 h-3" /> Key Experiences / Research Interests
              </label>
              <textarea
                required
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-slate-800 text-sm font-medium min-h-[100px] resize-none placeholder:font-normal"
                placeholder="Briefly describe your research focus or expertise (e.g., 'Specializing in hydrogel synthesis for tissue engineering...')"
                value={formData.experience}
                onChange={(e) => setFormData({...formData, experience: e.target.value})}
              />
            </div>

            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-lg py-4 rounded-xl shadow-lg shadow-indigo-200 hover:shadow-indigo-300 transform transition-all duration-200 hover:-translate-y-1 flex items-center justify-center gap-2 mt-4"
            >
              <span>Enter BioSearch Architect</span>
              <ArrowRight className="w-5 h-5" />
            </button>

          </form>
        </div>
      </div>
    </div>
  );
};

export default OnboardingScreen;