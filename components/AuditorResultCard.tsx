import React, { useState } from 'react';
import { ShieldCheck, Copy, Check, FileCheck, ExternalLink, AlertTriangle, ClipboardList, BookOpen, AlertCircle } from 'lucide-react';
import { SearchResult } from '../types';

interface AuditorResultCardProps {
  result: SearchResult;
}

interface ComplianceItem {
  test_method: string;
  standard_clause: string;
  status: string;
  finding: string;
}

interface RiskAssessment {
  critical_findings: string[];
  remediation: string[];
}

interface DeviceClassification {
  category: string;
  duration: string;
  required_endpoints: string[];
}

interface AuditorData {
  device_classification: DeviceClassification;
  compliance_audit: ComplianceItem[];
  risk_assessment: RiskAssessment;
}

const AuditorResultCard: React.FC<AuditorResultCardProps> = ({ result }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(result.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
        return (
            <div className="p-4 bg-slate-50 rounded-xl text-slate-700 whitespace-pre-wrap">
                {result.content}
            </div>
        );
    }

    const data = JSON.parse(result.content) as AuditorData;

    return (
        <div className="space-y-8">
            {/* Device Classification Header */}
            <div className="bg-white p-6 rounded-xl border border-amber-100 shadow-sm">
                <h3 className="text-lg font-bold text-amber-900 mb-4 flex items-center gap-2">
                    <ClipboardList className="w-5 h-5 text-amber-600" />
                    Device Classification (ISO 10993-1)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                        <div>
                            <span className="text-xs font-semibold text-slate-400 uppercase block mb-1">Device Category</span>
                            <div className="font-medium text-slate-800 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">
                                {data.device_classification.category}
                            </div>
                        </div>
                        <div>
                            <span className="text-xs font-semibold text-slate-400 uppercase block mb-1">Contact Duration</span>
                            <div className="font-medium text-slate-800 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">
                                {data.device_classification.duration}
                            </div>
                        </div>
                    </div>
                    <div>
                        <span className="text-xs font-semibold text-slate-400 uppercase block mb-1">Required Biological Endpoints</span>
                        <div className="flex flex-wrap gap-2">
                            {data.device_classification.required_endpoints.map((endpoint, i) => (
                                <span key={i} className="px-2.5 py-1 bg-amber-50 text-amber-800 text-xs font-medium rounded-full border border-amber-100 flex items-center gap-1">
                                    <BookOpen className="w-3 h-3" /> {endpoint}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Compliance Audit Table */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-blue-600" />
                        Standards Compliance Audit
                    </h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-500 uppercase font-semibold text-xs border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-3 whitespace-nowrap">Test Method</th>
                                <th className="px-6 py-3 whitespace-nowrap">Standard Clause</th>
                                <th className="px-6 py-3 whitespace-nowrap">Status</th>
                                <th className="px-6 py-3">Finding / Gap Analysis</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {data.compliance_audit.map((item, idx) => (
                                <tr key={idx} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-slate-800">{item.test_method}</td>
                                    <td className="px-6 py-4 font-mono text-xs text-slate-500">{item.standard_clause}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                                            item.status.toLowerCase().includes('compliant') ? 'bg-green-50 text-green-700 border-green-200' :
                                            item.status.toLowerCase().includes('deviation') ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                                            item.status.toLowerCase().includes('missing') ? 'bg-slate-100 text-slate-600 border-slate-200' :
                                            'bg-red-50 text-red-700 border-red-200'
                                        }`}>
                                            {item.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-slate-600 leading-relaxed max-w-xs">{item.finding}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Risk Assessment */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Critical Findings */}
                <div className="bg-red-50 p-5 rounded-xl border border-red-100">
                    <h3 className="text-sm font-bold text-red-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" /> Critical Findings
                    </h3>
                    {data.risk_assessment.critical_findings.length > 0 ? (
                        <ul className="space-y-2">
                            {data.risk_assessment.critical_findings.map((finding, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm text-red-700">
                                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                                    {finding}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-sm text-red-600/70 italic">No critical findings identified.</p>
                    )}
                </div>

                {/* Remediation Plan */}
                <div className="bg-green-50 p-5 rounded-xl border border-green-100">
                    <h3 className="text-sm font-bold text-green-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <Check className="w-4 h-4" /> Remediation Plan
                    </h3>
                    {data.risk_assessment.remediation.length > 0 ? (
                        <ul className="space-y-2">
                            {data.risk_assessment.remediation.map((step, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm text-green-700">
                                    <div className="w-4 h-4 rounded-full bg-green-200 text-green-800 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                                        {i + 1}
                                    </div>
                                    {step}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-sm text-green-600/70 italic">No remediation actions required.</p>
                    )}
                </div>
            </div>
        </div>
    );
  };

  return (
    <div className="w-full bg-white rounded-2xl shadow-lg border border-amber-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-gradient-to-r from-amber-50 to-yellow-50 px-6 py-4 border-b border-amber-100 flex justify-between items-center">
        <div className="flex items-center gap-2">
            <div className="bg-white p-1.5 rounded-md shadow-sm border border-amber-100 text-amber-600">
                <ShieldCheck className="w-4 h-4" />
            </div>
            <h3 className="font-semibold text-slate-800">Smart Regulatory Auditor</h3>
        </div>
        <div className="flex gap-2">
             <div className="flex items-center gap-2 text-xs font-mono bg-green-50 text-green-700 px-3 py-1 rounded-full border border-green-200">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="hidden sm:inline">ISO 10993 DB: Connected</span>
                <span className="sm:hidden">ISO: ON</span>
             </div>
             <div className="flex items-center gap-2 text-xs font-mono bg-blue-50 text-blue-700 px-3 py-1 rounded-full border border-blue-200">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="hidden sm:inline">ASTM F-Series: Active</span>
                <span className="sm:hidden">ASTM: ON</span>
             </div>
        </div>
      </div>
      
      <div className="p-6">
        <div className="mb-6 bg-slate-50 p-4 rounded-xl border border-slate-100">
            <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-2 flex items-center gap-1">
                <FileCheck className="w-3 h-3" /> Input Context
            </p>
            <p className="text-slate-600 italic text-sm line-clamp-2">
                "{result.originalQuery}"
            </p>
        </div>

        <div>
            {renderContent()}
        </div>

        <div className="mt-8 flex justify-between items-center">
             <a 
                href="https://www.iso.org/standard/68936.html" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-amber-700 hover:text-amber-900 font-medium transition-colors"
            >
                <ExternalLink className="w-3 h-3" /> Verify on ISO.org
            </a>
            <button 
                onClick={handleCopy}
                className="flex items-center gap-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 px-4 py-2 rounded-lg font-medium transition-colors text-sm"
            >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied' : 'Copy Audit Report'}
            </button>
        </div>
      </div>
    </div>
  );
};

export default AuditorResultCard;