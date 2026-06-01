import React, { useState } from 'react';
import { 
  Copy, Check, FileText, ClipboardList, Info, Users, 
  FlaskConical, Shuffle, Activity, BookOpen, Clock, 
  CheckCircle2, XCircle, ChevronRight, Play, Eye, EyeOff, LayoutGrid, Workflow, FileDown
} from 'lucide-react';
import { SearchResult } from '../types';
import MermaidDiagram from './MermaidDiagram';
import { jsPDF } from 'jspdf';

interface ProtocolCardProps {
  result: SearchResult;
}

interface PICOData {
  pico: {
    population: string;
    intervention: string;
    comparison: string;
    outcome: string;
    study_design: string;
  };
  inclusion_criteria: string[];
  exclusion_criteria: string[];
  search_goal: string;
  timeline_steps?: {
    phase: string;
    duration: string;
    description: string;
  }[];
  mermaid_diagram?: string;
}

const ProtocolCard: React.FC<ProtocolCardProps> = ({ result }) => {
  const [copied, setCopied] = useState(false);
  const [showRawMermaid, setShowRawMermaid] = useState(false);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const parseJson = (str: string): PICOData | null => {
    try {
      return JSON.parse(str);
    } catch (e) {
      // Find JSON block if wrapped in markdown
      const jsonMatch = str.match(/```json\s*([\s\S]*?)\s*```/) || str.match(/```\s*([\s\S]*?)\s*```/);
      if (jsonMatch && jsonMatch[1]) {
        try {
          return JSON.parse(jsonMatch[1]);
        } catch (innerE) {
          return null;
        }
      }
      return null;
    }
  };

  // Simple Markdown-like parser for the specific legacy output format
  const renderLegacyContent = (content: string) => {
    const lines = content.split('\n');
    const elements: React.ReactNode[] = [];
    let currentList: React.ReactNode[] = [];

    const flushList = (key: number) => {
        if (currentList.length > 0) {
            elements.push(<ul key={`list-${key}`} className="space-y-3 mb-6">{currentList}</ul>);
            currentList = [];
        }
    };

    lines.forEach((line, index) => {
        const trimmed = line.trim();
        if (!trimmed) return;

        if (trimmed.startsWith('## ')) {
            flushList(index);
            elements.push(
                <h3 key={`header-${index}`} className="text-lg font-bold text-slate-900 mt-6 mb-3 flex items-center gap-2 border-b border-slate-200 pb-2">
                   {trimmed.replace('## ', '')}
                </h3>
            );
        } else if (trimmed.startsWith('- **') || trimmed.startsWith('* **')) {
            const match = trimmed.match(/^[-*]\s*\*\*(.*?):\*\*\s*(.*)/);
            if (match) {
                const [_, key, value] = match;
                currentList.push(
                    <li key={`item-${index}`} className="flex flex-col sm:flex-row sm:items-start text-slate-700 text-sm">
                        <span className="font-semibold text-teal-700 sm:w-32 shrink-0">{key}:</span>
                        <span className="flex-1">{value}</span>
                    </li>
                );
            } else {
                 currentList.push(<li key={`item-${index}`} className="text-slate-700 text-sm ml-4 list-disc">{trimmed.replace(/^[-*]\s*/, '')}</li>);
            }
        } else {
            flushList(index);
            elements.push(<p key={`p-${index}`} className="text-slate-600 text-sm mb-2">{trimmed}</p>);
        }
    });
    flushList(lines.length);
    return elements;
  };

  const data = parseJson(result.content);

  const handleExportPDF = () => {
    if (!data) return;

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    let currentPage = 1;
    const addHeaderAndFooter = (pdf: jsPDF) => {
      // Sleek Header
      pdf.setFillColor(15, 23, 42); // deep slate
      pdf.rect(0, 0, 210, 32, 'F');
      
      pdf.setTextColor(255, 255, 255);
      pdf.setFont('Helvetica', 'bold');
      pdf.setFontSize(14);
      pdf.text('BioSearch ARCHITECT', 15, 14);
      
      pdf.setFont('Helvetica', 'normal');
      pdf.setFontSize(8);
      pdf.setTextColor(150, 180, 255);
      pdf.text('PICOs SYSTEMATIC LITERATURE REVIEW EXPERIMENTAL PROTOCOL', 15, 21);
      
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(8);
      pdf.text(`Page ${currentPage}`, 182, 16);

      // Accent border
      pdf.setFillColor(20, 184, 166); // teal accent line
      pdf.rect(0, 31, 210, 1.2, 'F');
    };

    addHeaderAndFooter(doc);

    let y = 45;
    const pageHeight = 297;
    const margin = 15;
    const contentWidth = 180;

    const checkPageBreak = (neededHeight: number) => {
      if (y + neededHeight > pageHeight - 20) {
        doc.addPage();
        currentPage++;
        addHeaderAndFooter(doc);
        y = 45;
      }
    };

    // 1. Research Question Block
    doc.setTextColor(100, 116, 139);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(8);
    doc.text('TARGET BIOMEDICAL RESEARCH FOCUS:', margin, y);
    y += 5;

    doc.setTextColor(30, 41, 59);
    doc.setFont('Helvetica', 'italic');
    doc.setFontSize(10);
    const queryLines = doc.splitTextToSize(`"${result.originalQuery}"`, contentWidth);
    checkPageBreak(queryLines.length * 5 + 6);
    doc.text(queryLines, margin, y);
    y += (queryLines.length * 5) + 8;

    // 2. Strategic Goal Box with style
    doc.setFillColor(240, 253, 250); // Teal-50
    doc.setDrawColor(204, 251, 241);
    doc.rect(margin, y, contentWidth, 22, 'FD');
    
    doc.setTextColor(13, 148, 136); // Teal-600
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(8);
    doc.text('STRATEGIC DESIGN OBJECTIVE', margin + 5, y + 6);
    
    doc.setTextColor(15, 23, 42); // Slate-900
    doc.setFont('Helvetica', 'oblique');
    doc.setFontSize(9.5);
    const goalLines = doc.splitTextToSize(data.search_goal, contentWidth - 10);
    doc.text(goalLines, margin + 5, y + 13);
    y += 30;

    // 3. PICO Components Matrix Table
    checkPageBreak(50);
    doc.setTextColor(100, 116, 139);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.text('I. PICOs PROTOCOL CRITERIA MATRIX', margin, y);
    y += 6;

    // Table Header
    doc.setFillColor(15, 23, 42);
    doc.rect(margin, y, contentWidth, 8, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(8);
    doc.text('COMPONENT CODE', margin + 3, y + 5.5);
    doc.text('DRAFT SPECIFICATIONS', margin + 50, y + 5.5);
    y += 8;

    const printPicoRow = (code: string, textValue: string) => {
      const wrapped = doc.splitTextToSize(textValue || 'Not specified', contentWidth - 53);
      const rowHeight = Math.max(10, wrapped.length * 4.5 + 4);
      checkPageBreak(rowHeight);

      // Row background
      doc.setFillColor(248, 250, 252);
      doc.rect(margin, y, contentWidth, rowHeight, 'F');
      doc.setDrawColor(226, 232, 240);
      doc.line(margin, y + rowHeight, margin + contentWidth, y + rowHeight);

      doc.setTextColor(15, 23, 42);
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(8);
      doc.text(code, margin + 3, y + 6.5);

      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(8);
      doc.text(wrapped, margin + 50, y + 6.5);
      y += rowHeight;
    };

    printPicoRow('P - Population', data.pico.population);
    printPicoRow('I - Intervention', data.pico.intervention);
    printPicoRow('C - Comparison', data.pico.comparison);
    printPicoRow('O - Outcome', data.pico.outcome);
    printPicoRow('S - Study Design', data.pico.study_design);
    y += 8;

    // 4. Eligibility screening criteria
    checkPageBreak(30);
    doc.setTextColor(100, 116, 139);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.text('II. ADHERENCE ELIGIBILITY SCREENING RULES', margin, y);
    y += 6;

    doc.setTextColor(16, 185, 129); // emerald-600
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.text('[+] INCLUSION CRITERIA', margin, y);
    y += 5;

    doc.setFont('Helvetica', 'normal');
    doc.setTextColor(51, 65, 85);
    data.inclusion_criteria.forEach(item => {
      const lines = doc.splitTextToSize(`•  ${item}`, contentWidth - 6);
      checkPageBreak(lines.length * 4.5 + 2);
      doc.text(lines, margin + 3, y);
      y += (lines.length * 4.5) + 1.5;
    });

    y += 4;
    checkPageBreak(25);
    doc.setTextColor(239, 68, 68); // red-500
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.text('[-] EXCLUSION CRITERIA', margin, y);
    y += 5;

    doc.setFont('Helvetica', 'normal');
    doc.setTextColor(51, 65, 85);
    data.exclusion_criteria.forEach(item => {
      const lines = doc.splitTextToSize(`•  ${item}`, contentWidth - 6);
      checkPageBreak(lines.length * 4.5 + 2);
      doc.text(lines, margin + 3, y);
      y += (lines.length * 4.5) + 1.5;
    });

    y += 8;

    // 5. Visual Flowchart Diagram Section
    if (data.mermaid_diagram) {
      checkPageBreak(35);
      doc.setTextColor(100, 116, 139);
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.text('III. PROTOCOL PROCESS FLOWCHART TOPOLOGY', margin, y);
      y += 6;

      doc.setFillColor(248, 250, 252);
      doc.rect(margin, y, contentWidth, 24, 'F');
      doc.setDrawColor(226, 232, 240);
      doc.rect(margin, y, contentWidth, 24, 'D');

      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(71, 85, 105);
      const diagramLines = doc.splitTextToSize(data.mermaid_diagram.replace(/\\n/g, '\n'), contentWidth - 10);
      
      let subY = y + 5;
      for (let i = 0; i < Math.min(4, diagramLines.length); i++) {
        doc.text(diagramLines[i], margin + 5, subY);
        subY += 4.5;
      }
      y += 28;
    }

    // 6. Chronological Experimental Timeline
    if (data.timeline_steps && data.timeline_steps.length > 0) {
      checkPageBreak(40);
      doc.setTextColor(100, 116, 139);
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.text('IV. SYSTEMATIC REVIEW EXPERIMENTAL TIMELINE', margin, y);
      y += 6;

      data.timeline_steps.forEach((step, idx) => {
        const wrappedDesc = doc.splitTextToSize(step.description, contentWidth - 40);
        const neededHeight = Math.max(16, wrappedDesc.length * 4.5 + 8);
        checkPageBreak(neededHeight);

        doc.setFillColor(248, 250, 252);
        doc.setDrawColor(226, 232, 240);
        doc.rect(margin, y, contentWidth, neededHeight - 2, 'F');
        doc.rect(margin, y, contentWidth, neededHeight - 2, 'D');

        doc.setTextColor(30, 41, 59);
        doc.setFont('Helvetica', 'bold');
        doc.setFontSize(8);
        doc.text(`[Phase ${idx + 1}] ${step.phase}`, margin + 5, y + 5.5);

        doc.setTextColor(13, 148, 136);
        doc.setFont('Helvetica', 'bold');
        doc.text(step.duration, margin + 140, y + 5.5);

        doc.setTextColor(71, 85, 105);
        doc.setFont('Helvetica', 'normal');
        doc.setFontSize(8);
        doc.text(wrappedDesc, margin + 5, y + 11.5);

        y += neededHeight;
      });
    }

    doc.save(`BioSearch_PICOs_Protocol_${Date.now()}.pdf`);
  };

  return (
    <div className="w-full bg-white rounded-2xl shadow-lg border border-teal-200 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header and Branding */}
      <div className="bg-gradient-to-r from-teal-50 via-emerald-50/20 to-white px-6 py-5 border-b border-teal-100 flex justify-between items-center">
        <div className="flex items-center gap-3">
            <div className="bg-slate-950 p-2 rounded-xl shadow-md border border-slate-800 text-teal-400">
                <Workflow className="w-5 h-5 animate-pulse" />
            </div>
            <div>
               <h3 className="font-bold text-slate-900 text-sm font-tech leading-none">PICOs Systematic Protocol</h3>
               <span className="text-[9px] text-teal-700 font-bold uppercase tracking-[0.15em] mt-1 inline-block">SOTA Design Specifications</span>
            </div>
        </div>
        <div className="flex items-center gap-2.5">
            {data && (
              <button
                onClick={handleExportPDF}
                className="text-xs text-white bg-teal-600 hover:bg-teal-700 font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-sm transition-all cursor-pointer border border-teal-500"
              >
                <FileDown className="w-3.5 h-3.5" />
                <span>Export PDF</span>
              </button>
            )}
            <div className="text-xs text-teal-700 font-mono bg-teal-50 px-2.5 py-1 rounded-full border border-teal-100 flex items-center gap-1 font-bold">
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" /> Grounded Design
            </div>
        </div>
      </div>
      
      <div className="p-6 space-y-8">
        {/* Research Objective Prompt Question */}
        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 flex items-start gap-3">
            <div className="p-2 bg-white rounded-xl shadow-sm border border-slate-200 shrink-0 mt-0.5 text-teal-600">
               <ClipboardList className="w-4 h-4" />
            </div>
            <div className="flex-1">
               <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1">Target Research Question</p>
               <p className="text-slate-800 font-medium text-sm whitespace-pre-wrap leading-relaxed">"{result.originalQuery}"</p>
            </div>
        </div>

        {data ? (
          <>
            {/* Strategic Mission Goal */}
            <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-5 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500"></div>
                <div className="flex items-start gap-3.5">
                    <div className="p-2.5 bg-white border border-emerald-200 rounded-xl shadow-sm text-emerald-600">
                        <Info className="w-4 h-4 shrink-0" />
                    </div>
                    <div>
                        <h4 className="text-[10px] font-bold text-emerald-800 uppercase tracking-widest mb-1">Strategic Objective</h4>
                        <p className="text-sm text-emerald-900 leading-relaxed font-medium italic font-academic">{data.search_goal}</p>
                    </div>
                </div>
            </div>

            {/* PICO components grid */}
            <div>
               <h4 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                  <LayoutGrid className="w-4 h-4 text-teal-500" /> Defined PICOs Criteria Matrix
               </h4>
               
               <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  {/* P */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-teal-400 hover:shadow-sm transition-all flex flex-col justify-between">
                     <div>
                        <div className="inline-flex p-2 bg-teal-50 text-teal-600 rounded-xl mb-3.5 border border-teal-100/70">
                           <Users className="w-4 h-4" />
                        </div>
                        <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Population (P)</h5>
                        <p className="text-xs font-bold text-slate-800 leading-relaxed font-academic">{data.pico.population}</p>
                     </div>
                  </div>

                  {/* I */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-teal-400 hover:shadow-sm transition-all flex flex-col justify-between">
                     <div>
                        <div className="inline-flex p-2 bg-rose-50 text-rose-600 rounded-xl mb-3.5 border border-rose-100/70">
                           <FlaskConical className="w-4 h-4" />
                        </div>
                        <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Intervention (I)</h5>
                        <p className="text-xs font-bold text-slate-800 leading-relaxed font-academic">{data.pico.intervention}</p>
                     </div>
                  </div>

                  {/* C */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-teal-400 hover:shadow-sm transition-all flex flex-col justify-between">
                     <div>
                        <div className="inline-flex p-2 bg-amber-50 text-amber-600 rounded-xl mb-3.5 border border-amber-100/70">
                           <Shuffle className="w-4 h-4" />
                        </div>
                        <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Comparison (C)</h5>
                        <p className="text-xs font-bold text-slate-800 leading-relaxed font-academic">{data.pico.comparison}</p>
                     </div>
                  </div>

                  {/* O */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-teal-400 hover:shadow-sm transition-all flex flex-col justify-between">
                     <div>
                        <div className="inline-flex p-2 bg-indigo-50 text-indigo-600 rounded-xl mb-3.5 border border-indigo-100/70">
                           <Activity className="w-4 h-4" />
                        </div>
                        <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Outcome (O)</h5>
                        <p className="text-xs font-bold text-slate-800 leading-relaxed font-academic">{data.pico.outcome}</p>
                     </div>
                  </div>

                  {/* S */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-teal-400 hover:shadow-sm transition-all flex flex-col justify-between">
                     <div>
                        <div className="inline-flex p-2 bg-purple-50 text-purple-600 rounded-xl mb-3.5 border border-purple-100/70">
                           <BookOpen className="w-4 h-4" />
                        </div>
                        <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Study Design (S)</h5>
                        <p className="text-xs font-bold text-slate-800 leading-relaxed font-academic">{data.pico.study_design}</p>
                     </div>
                  </div>
               </div>
            </div>

            {/* Side-by-Side Inclusion / Exclusion Eligibility screening */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Inclusion */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm relative overflow-hidden">
                   <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
                   <h4 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                       <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Precise Inclusion Criteria
                   </h4>
                   <ul className="space-y-3">
                      {data.inclusion_criteria.map((item, idx) => (
                         <li key={idx} className="flex items-start gap-3 p-3 bg-slate-50/50 rounded-xl border border-slate-100">
                             <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 mt-2"></div>
                             <span className="text-xs font-bold text-slate-700 leading-relaxed">{item}</span>
                         </li>
                      ))}
                   </ul>
                </div>

                {/* Exclusion */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm relative overflow-hidden">
                   <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
                   <h4 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                       <XCircle className="w-4 h-4 text-red-500" /> Precise Exclusion Criteria
                   </h4>
                   <ul className="space-y-3">
                      {data.exclusion_criteria.map((item, idx) => (
                         <li key={idx} className="flex items-start gap-3 p-3 bg-slate-50/50 rounded-xl border border-slate-100">
                             <div className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0 mt-2"></div>
                             <span className="text-xs font-bold text-slate-700 leading-relaxed">{item}</span>
                         </li>
                      ))}
                   </ul>
                </div>
            </div>

            {/* Visual Flowchart Diagram Section */}
            {data.mermaid_diagram && (
               <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-indigo-100 pb-3">
                     <div className="flex items-center gap-2.5">
                        <div className="p-1.5 bg-slate-900 text-white rounded-lg">
                           <Workflow className="w-4 h-4" />
                        </div>
                        <div>
                           <h4 className="text-xs font-bold text-slate-800 uppercase tracking-[0.2em]">Protocol Process Flowchart</h4>
                           <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Synthesized process logic topology</p>
                        </div>
                     </div>
                     <button
                        onClick={() => setShowRawMermaid(!showRawMermaid)}
                        className="text-xs text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1.5 uppercase tracking-widest"
                     >
                        {showRawMermaid ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        <span>{showRawMermaid ? 'Hide Code' : 'View Source'}</span>
                     </button>
                  </div>

                  {showRawMermaid && (
                     <pre className="bg-slate-950 text-blue-400 p-4 rounded-xl text-xs font-mono overflow-auto max-h-40 border border-slate-800">
                        {data.mermaid_diagram}
                     </pre>
                  )}

                  <div className="bg-slate-50 border border-slate-100 p-2 rounded-2xl flex justify-center">
                     <div className="w-full max-w-2xl">
                        <MermaidDiagram chart={data.mermaid_diagram} />
                     </div>
                  </div>
               </div>
            )}

            {/* Chronological Steps / Experimental Timeline */}
            {data.timeline_steps && data.timeline_steps.length > 0 && (
               <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                     <Clock className="w-4 h-4 text-teal-500 animate-pulse" /> Review Protocol Experimental Timeline
                  </h4>

                  <div className="space-y-6 relative border-l border-slate-200 ml-4 pl-6">
                     {data.timeline_steps.map((step, idx) => (
                        <div key={idx} className="relative">
                           {/* Bullet dot */}
                           <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-slate-900 border-2 border-white shadow-sm flex items-center justify-center text-[8px] font-bold text-white">
                              {idx + 1}
                           </div>

                           <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                              <div className="flex-1">
                                 <h5 className="text-xs font-bold text-slate-800 uppercase tracking-widest mb-1.5">{step.phase}</h5>
                                 <p className="text-xs text-slate-600 leading-relaxed font-semibold">{step.description}</p>
                              </div>
                              <span className="text-[10px] font-extrabold text-teal-700 bg-teal-50 border border-teal-100/70 px-2.5 py-1 rounded-lg shrink-0 sm:self-start">
                                 {step.duration}
                              </span>
                           </div>
                        </div>
                     ))}
                  </div>
               </div>
            )}
          </>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            {renderLegacyContent(result.content)}
          </div>
        )}

        {/* Global actions row */}
        <div className="flex justify-end items-center gap-3 pt-4 border-t border-slate-100">
            {data && (
              <button 
                  onClick={handleExportPDF}
                  className="flex items-center gap-2 text-white bg-slate-900 hover:bg-slate-800 px-4 py-2 rounded-lg font-medium transition-colors text-sm cursor-pointer shadow-sm border border-slate-700"
              >
                  <FileDown className="w-4 h-4 text-teal-400" />
                  <span>Download Protocol PDF</span>
              </button>
            )}
            <button 
                onClick={() => handleCopy(result.content)}
                className="flex items-center gap-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 px-4 py-2 rounded-lg font-medium transition-colors text-sm"
            >
                {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied Full Output' : 'Copy Full Protocol Output'}
            </button>
        </div>
      </div>
    </div>
  );
};

export default ProtocolCard;
