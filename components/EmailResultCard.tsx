import React, { useState } from 'react';
import { Mail, Copy, Check, Send, User } from 'lucide-react';
import { SearchResult } from '../types';

interface EmailResultCardProps {
  result: SearchResult;
}

const EmailResultCard: React.FC<EmailResultCardProps> = ({ result }) => {
  const [copiedSubject, setCopiedSubject] = useState(false);
  const [copiedBody, setCopiedBody] = useState(false);

  // Parse output into Subject and Body
  const parseEmail = (content: string) => {
    const lines = content.split('\n');
    let subject = '';
    let bodyStartIndex = 0;

    // Try to find subject line
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].toLowerCase().startsWith('**subject:**') || lines[i].toLowerCase().startsWith('subject:')) {
            subject = lines[i].replace(/\*\*Subject:\*\*/i, '').replace(/Subject:/i, '').trim();
            bodyStartIndex = i + 1;
            break;
        }
    }

    // Identify where the body starts (skip "Body:" or empty lines)
    while (bodyStartIndex < lines.length) {
        const line = lines[bodyStartIndex].trim().toLowerCase();
        if (line === '**body:**' || line === 'body:' || line === '') {
            bodyStartIndex++;
        } else {
            break;
        }
    }

    const body = lines.slice(bodyStartIndex).join('\n').trim();
    return { subject, body };
  };

  const { subject, body } = parseEmail(result.content);

  const handleCopySubject = () => {
    navigator.clipboard.writeText(subject);
    setCopiedSubject(true);
    setTimeout(() => setCopiedSubject(false), 2000);
  };

  const handleCopyBody = () => {
    navigator.clipboard.writeText(body);
    setCopiedBody(true);
    setTimeout(() => setCopiedBody(false), 2000);
  };

  return (
    <div className="w-full bg-white rounded-2xl shadow-lg border border-purple-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 px-6 py-4 border-b border-purple-100 flex justify-between items-center">
        <div className="flex items-center gap-2">
            <div className="bg-white p-1.5 rounded-md shadow-sm border border-purple-100 text-purple-600">
                <Mail className="w-4 h-4" />
            </div>
            <h3 className="font-semibold text-slate-800">Academic Email Draft</h3>
        </div>
        <div className="text-xs text-purple-700/70 font-mono bg-purple-50 px-2 py-1 rounded border border-purple-100">
            Communication Strategist
        </div>
      </div>
      
      <div className="p-6">
        <div className="mb-6 bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-start gap-3">
             <User className="w-4 h-4 text-slate-400 mt-1 shrink-0" />
             <div>
                <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-1">Target & Goal</p>
                <p className="text-slate-600 italic text-sm line-clamp-2">
                    "{result.originalQuery}"
                </p>
             </div>
        </div>

        <div className="space-y-4">
            {/* Subject Line Box */}
            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 flex justify-between items-center">
                     <span className="text-xs font-semibold text-slate-500 uppercase">Subject Line</span>
                     <button 
                        onClick={handleCopySubject} 
                        className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all shadow-sm border ${
                            copiedSubject 
                            ? 'bg-green-50 border-green-200 text-green-700' 
                            : 'bg-white border-slate-200 hover:border-purple-300 hover:bg-purple-50 text-slate-600 hover:text-purple-700'
                        }`}
                     >
                        {copiedSubject ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        {copiedSubject ? 'Copied!' : 'Copy Subject'}
                     </button>
                </div>
                <div className="p-4 bg-white font-medium text-slate-800 text-sm">
                    {subject || "No Subject Line Generated"}
                </div>
            </div>

            {/* Body Box */}
            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 flex justify-between items-center">
                     <span className="text-xs font-semibold text-slate-500 uppercase">Email Body</span>
                     <button 
                        onClick={handleCopyBody} 
                        className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all shadow-sm border ${
                            copiedBody 
                            ? 'bg-green-50 border-green-200 text-green-700' 
                            : 'bg-white border-slate-200 hover:border-purple-300 hover:bg-purple-50 text-slate-600 hover:text-purple-700'
                        }`}
                     >
                        {copiedBody ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        {copiedBody ? 'Copied!' : 'Copy Body'}
                     </button>
                </div>
                <div className="p-4 bg-white text-slate-700 text-sm whitespace-pre-wrap leading-relaxed">
                    {body}
                </div>
            </div>
        </div>

        <div className="mt-8 flex justify-end gap-3">
            <button 
                onClick={handleCopyBody}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all text-sm shadow-md border ${
                    copiedBody 
                    ? 'bg-green-600 text-white border-green-700' 
                    : 'bg-purple-600 hover:bg-purple-700 text-white border-transparent'
                }`}
            >
                {copiedBody ? <Check className="w-4 h-4" /> : <Send className="w-4 h-4" />}
                <span>{copiedBody ? 'Body Copied' : 'Ready to Send'}</span>
            </button>
        </div>
      </div>
    </div>
  );
};

export default EmailResultCard;