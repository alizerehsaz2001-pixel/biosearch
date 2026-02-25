import React, { useState } from 'react';
import { Cpu, Copy, Check, Terminal, Layers, Settings, BrainCircuit, Activity } from 'lucide-react';
import { SearchResult } from '../types';
import MermaidDiagram from './MermaidDiagram';

interface MLResultCardProps {
  result: SearchResult;
}

const MLResultCard: React.FC<MLResultCardProps> = ({ result }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(result.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const renderContent = (content: string) => {
    // Split content by mermaid blocks first to handle diagram
    const mermaidRegex = /```mermaid([\s\S]*?)```/g;
    const mermaidMatch = mermaidRegex.exec(content);
    const mermaidChart = mermaidMatch ? mermaidMatch[1].trim() : null;

    // Remove mermaid block from content for text processing
    const contentWithoutMermaid = content.replace(mermaidRegex, '');
    
    // Split by python code block
    const parts = contentWithoutMermaid.split('```python');
    const textPart = parts[0];
    const pythonCode = parts.length > 1 ? parts[1].split('```')[0].trim() : null;

    const sections: React.ReactNode[] = [];
    const lines = textPart.split('\n');
    let currentBlock: React.ReactNode[] = [];
    
    lines.forEach((line, i) => {
        const trimmed = line.trim();
        if(!trimmed) return;

        if (trimmed.startsWith('### 🧠') || trimmed.includes('Model Architecture')) {
            if(currentBlock.length) sections.push(<div key={`b-${i}`} className="mb-4">{currentBlock}</div>);
            currentBlock = [];
            sections.push(
                <h3 key={i} className="flex items-center gap-2 text-lg font-bold text-fuchsia-900 mt-6 mb-3 border-b border-fuchsia-100 pb-2">
                   <BrainCircuit className="w-5 h-5 text-fuchsia-600" />
                   {trimmed.replace(/###\s*[🧠]?/, '')}
                </h3>
            );
        } else if (trimmed.startsWith('### 📊') || trimmed.includes('Architecture Diagram')) {
             if(currentBlock.length) sections.push(<div key={`b-${i}`} className="mb-4">{currentBlock}</div>);
             currentBlock = [];
             sections.push(
                <h3 key={i} className="flex items-center gap-2 text-lg font-bold text-fuchsia-900 mt-6 mb-3 border-b border-fuchsia-100 pb-2">
                   <Activity className="w-5 h-5 text-fuchsia-600" />
                   Architecture Diagram
                </h3>
             );
             if (mermaidChart) {
                 sections.push(<MermaidDiagram key="mermaid" chart={mermaidChart} />);
             }
        } else if (trimmed.startsWith('### 🛠️') || trimmed.includes('Pipeline Strategy')) {
             if(currentBlock.length) sections.push(<div key={`b-${i}`} className="mb-4">{currentBlock}</div>);
             currentBlock = [];
             sections.push(
                <h3 key={i} className="flex items-center gap-2 text-lg font-bold text-fuchsia-900 mt-6 mb-3 border-b border-fuchsia-100 pb-2">
                   <Settings className="w-5 h-5 text-fuchsia-600" />
                   {trimmed.replace(/###\s*[🛠️]?/, '')}
                </h3>
             );
        } else if (trimmed.startsWith('### 💻') || trimmed.includes('Implementation')) {
             // Skip header
        } else if (trimmed.startsWith('**') && trimmed.includes(':')) {
             currentBlock.push(
                 <div key={i} className="mb-2 text-sm text-slate-700 bg-white p-3 rounded-lg border border-slate-100 shadow-sm">
                     <span className="font-bold text-fuchsia-800">{trimmed.split(':')[0].replace(/\*\*/g, '')}:</span>
                     <span className="ml-2">{trimmed.split(':')[1]?.replace(/\*\*/g, '')}</span>
                 </div>
             )
        } else if (trimmed.startsWith('-')) {
             currentBlock.push(<li key={i} className="ml-4 list-disc text-slate-700 text-sm mb-1">{trimmed.replace(/^-/, '')}</li>);
        } else {
             currentBlock.push(<p key={i} className="text-slate-700 text-sm mb-2">{trimmed.replace(/\*\*/g, '')}</p>);
        }
    });
    if(currentBlock.length) sections.push(<div key="end-text" className="mb-4">{currentBlock}</div>);

    if (pythonCode) {
        sections.push(
            <div key="code" className="mt-6">
                <div className="flex items-center gap-2 mb-2 text-sm font-semibold text-slate-700">
                    <Terminal className="w-4 h-4 text-fuchsia-600" />
                    Python Implementation (Scaffolding)
                </div>
                <div className="bg-slate-900 rounded-xl p-4 overflow-x-auto border border-slate-700 shadow-inner">
                    <pre className="text-slate-300 font-mono text-xs leading-relaxed">
                        {pythonCode}
                    </pre>
                </div>
            </div>
        );
    }

    return sections;
  };

  return (
    <div className="w-full bg-slate-50 rounded-2xl shadow-lg border border-fuchsia-200 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-gradient-to-r from-fuchsia-50 to-purple-50 px-6 py-4 border-b border-fuchsia-100 flex justify-between items-center">
        <div className="flex items-center gap-2">
            <div className="bg-white p-1.5 rounded-md shadow-sm border border-fuchsia-100 text-fuchsia-600">
                <Cpu className="w-4 h-4" />
            </div>
            <h3 className="font-semibold text-slate-800">Bio-AI Model Specification</h3>
        </div>
        <div className="text-xs text-fuchsia-700/70 font-mono bg-fuchsia-50 px-2 py-1 rounded border border-fuchsia-100">
            Deep Learning Architect
        </div>
      </div>
      
      <div className="p-6">
        <div className="mb-6 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-2 flex items-center gap-1">
                <Layers className="w-3 h-3" /> Research Data Context
            </p>
            <p className="text-slate-800 italic text-sm font-medium">
                "{result.originalQuery}"
            </p>
        </div>

        <div>
            {renderContent(result.content)}
        </div>

        <div className="mt-8 flex justify-end">
            <button 
                onClick={handleCopy}
                className="flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-4 py-2 rounded-lg font-medium transition-colors text-sm shadow-sm"
            >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied' : 'Copy Spec & Code'}
            </button>
        </div>
      </div>
    </div>
  );
};

export default MLResultCard;