import React, { useState } from 'react';
import { Cpu, Copy, Check, Terminal, Layers, Settings, BrainCircuit, Activity, GitBranch, Database, BarChart, Download, Zap } from 'lucide-react';
import { SearchResult } from '../types';
import MermaidDiagram from './MermaidDiagram';

interface MLResultCardProps {
  result: SearchResult;
}

interface ArchitectureComponent {
  name: string;
  type: string;
  description: string;
  details: string;
}

interface PipelineStrategy {
  preprocessing: string[];
  loss_function: string;
  metrics: string[];
}

interface TrainingConfig {
  batch_size: string;
  learning_rate: string;
  optimizer: string;
  epochs: string;
}

interface MLArchitectureData {
  model_name: string;
  reasoning: string;
  architecture_components: ArchitectureComponent[];
  mermaid_diagram: string;
  pipeline_strategy: PipelineStrategy;
  training_config?: TrainingConfig;
  hardware_requirements?: string;
  implementation_code: string;
}

const MLResultCard: React.FC<MLResultCardProps> = ({ result }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(result.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
      if (!isJson(result.content)) return;
      const data = JSON.parse(result.content) as MLArchitectureData;
      const blob = new Blob([data.implementation_code], { type: 'text/x-python' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${data.model_name.replace(/\s+/g, '_').toLowerCase()}.py`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
  };

  const isJson = (str: string) => {
    try {
      JSON.parse(str);
      return true;
    } catch (e) {
      return false;
    }
  };

  const renderContent = () => {
    if (!isJson(result.content)) {
        // Fallback for legacy text format
        return renderLegacyContent(result.content);
    }

    const data = JSON.parse(result.content) as MLArchitectureData;

    return (
        <div className="space-y-8">
            {/* Model Header */}
            <div className="bg-white p-6 rounded-xl border border-fuchsia-100 shadow-sm">
                <h2 className="text-2xl font-bold text-fuchsia-900 mb-3 flex items-center gap-2">
                    <BrainCircuit className="w-6 h-6 text-fuchsia-600" />
                    {data.model_name}
                </h2>
                <p className="text-slate-700 leading-relaxed border-l-4 border-fuchsia-300 pl-4 italic">
                    {data.reasoning}
                </p>
            </div>

            {/* Architecture Diagram */}
            {data.mermaid_diagram && (
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                        <Activity className="w-4 h-4" /> Architecture Diagram
                    </h3>
                    <MermaidDiagram chart={data.mermaid_diagram} />
                </div>
            )}

            {/* Architecture Components Grid */}
            <div>
                <h3 className="text-lg font-bold text-fuchsia-900 mb-4 flex items-center gap-2">
                    <GitBranch className="w-5 h-5 text-fuchsia-600" />
                    Network Components
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {data.architecture_components.map((comp, idx) => (
                        <div key={idx} className="bg-white p-5 rounded-xl border border-slate-200 hover:border-fuchsia-200 hover:shadow-md transition-all">
                            <div className="flex justify-between items-start mb-2">
                                <h4 className="font-bold text-slate-800">{comp.name}</h4>
                                <span className="px-2 py-1 bg-fuchsia-50 text-fuchsia-700 text-xs font-mono rounded border border-fuchsia-100">
                                    {comp.type}
                                </span>
                            </div>
                            <p className="text-sm text-slate-600 mb-3">{comp.description}</p>
                            <p className="text-xs text-slate-500 font-mono bg-slate-50 p-2 rounded border border-slate-100">
                                {comp.details}
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Pipeline Strategy */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Preprocessing */}
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                    <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <Database className="w-4 h-4" /> Data Strategy
                    </h3>
                    <ul className="space-y-2">
                        {data.pipeline_strategy.preprocessing.map((step, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                                <Check className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                                {step}
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Configuration */}
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                    <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <Settings className="w-4 h-4" /> Configuration
                    </h3>
                    <div className="space-y-4">
                        <div>
                            <span className="text-xs font-semibold text-slate-400 uppercase block mb-1">Loss Function</span>
                            <div className="bg-fuchsia-50 text-fuchsia-800 px-3 py-2 rounded-lg font-medium text-sm border border-fuchsia-100">
                                {data.pipeline_strategy.loss_function}
                            </div>
                        </div>
                        <div>
                            <span className="text-xs font-semibold text-slate-400 uppercase block mb-1">Evaluation Metrics</span>
                            <div className="flex flex-wrap gap-2">
                                {data.pipeline_strategy.metrics.map((m, i) => (
                                    <span key={i} className="px-2.5 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded-full border border-slate-200 flex items-center gap-1">
                                        <BarChart className="w-3 h-3" /> {m}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Training & Hardware */}
            {(data.training_config || data.hardware_requirements) && (
                <div className="bg-slate-900 text-slate-300 p-5 rounded-xl border border-slate-700 shadow-sm">
                    <h3 className="text-sm font-bold text-fuchsia-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <Zap className="w-4 h-4" /> Training Specs
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {data.training_config && (
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="block text-slate-500 text-xs uppercase">Batch Size</span>
                                    <span className="font-mono text-white">{data.training_config.batch_size}</span>
                                </div>
                                <div>
                                    <span className="block text-slate-500 text-xs uppercase">Learning Rate</span>
                                    <span className="font-mono text-white">{data.training_config.learning_rate}</span>
                                </div>
                                <div>
                                    <span className="block text-slate-500 text-xs uppercase">Optimizer</span>
                                    <span className="font-mono text-white">{data.training_config.optimizer}</span>
                                </div>
                                <div>
                                    <span className="block text-slate-500 text-xs uppercase">Epochs</span>
                                    <span className="font-mono text-white">{data.training_config.epochs}</span>
                                </div>
                            </div>
                        )}
                        {data.hardware_requirements && (
                            <div className="border-t md:border-t-0 md:border-l border-slate-700 pt-4 md:pt-0 md:pl-6">
                                <span className="block text-slate-500 text-xs uppercase mb-1">Recommended Hardware</span>
                                <p className="text-white font-medium">{data.hardware_requirements}</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Implementation Code */}
            <div className="bg-slate-900 rounded-xl overflow-hidden shadow-lg border border-slate-700">
                <div className="bg-slate-800 px-4 py-2 flex justify-between items-center border-b border-slate-700">
                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-300">
                        <Terminal className="w-4 h-4 text-fuchsia-400" />
                        Python Implementation
                    </div>
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={handleDownload}
                            className="text-xs text-slate-400 hover:text-white transition-colors flex items-center gap-1 px-2 py-1 hover:bg-slate-700 rounded"
                            title="Download .py file"
                        >
                            <Download className="w-3 h-3" /> Download
                        </button>
                        <button 
                            onClick={() => {
                                navigator.clipboard.writeText(data.implementation_code);
                                setCopied(true);
                                setTimeout(() => setCopied(false), 2000);
                            }}
                            className="text-xs text-slate-400 hover:text-white transition-colors flex items-center gap-1 px-2 py-1 hover:bg-slate-700 rounded"
                        >
                            {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                            {copied ? 'Copied' : 'Copy'}
                        </button>
                    </div>
                </div>
                <div className="p-4 overflow-x-auto">
                    <pre className="text-slate-300 font-mono text-xs leading-relaxed">
                        {data.implementation_code}
                    </pre>
                </div>
            </div>
        </div>
    );
  };

  const renderLegacyContent = (content: string) => {
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
            {renderContent()}
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