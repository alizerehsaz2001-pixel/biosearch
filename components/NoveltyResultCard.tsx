import React, { useState, useMemo, useEffect } from 'react';
import { 
  Lightbulb, Copy, Check, Sparkles, Zap, Gauge, Sliders, Info, 
  LineChart, FileText, ExternalLink, HelpCircle, ChevronRight, 
  CheckCircle, AlertTriangle, RefreshCcw, DollarSign, TrendingUp,
  Brain, FileSpreadsheet, Search
} from 'lucide-react';
import { SearchResult } from '../types';
import { jsPDF } from 'jspdf';

interface NoveltyResultCardProps {
  result: SearchResult;
}

interface NoveltyIdea {
  title: string;
  hypothesis: string;
  innovation_gap: string;
  feasibility: 'High' | 'Medium' | 'Low';
  feasibility_explanation: string;
  experimental_steps: string[];
  materials: string[];
  estimated_budget: 'High' | 'Medium' | 'Low';
  estimated_budget_value: string;
  outcomes: string;
  risks: Array<{ risk: string; remediation: string }>;
  database_keywords: string[];
  simulated_variables: {
    x_label: string;
    y_label: string;
    data_points: Array<{ x: number; y: number }>;
  };
}

interface NoveltyData {
  ideas: NoveltyIdea[];
}

// Fallback legacy parser for backward compatibility
const parseLegacyMarkdown = (content: string): NoveltyIdea[] => {
  const fileIdeas = content.split('###').filter((i) => i.trim());
  return fileIdeas.map((ideaBlock, idx) => {
    const lines = ideaBlock.trim().split('\n');
    const title = lines[0]
      .replace(/^Idea \d+:\s*/, '')
      .replace(/^\*\*/, '')
      .replace(/\*\*$/, '')
      .trim();

    const hypothesis =
      lines
        .find((l) => l.toLowerCase().includes('hypothesis'))
        ?.replace(/^[-*]\s*\*\*Hypothesis:\*\*\s*/i, '') || '';
    const innovation =
      lines
        .find((l) => l.toLowerCase().includes('innovation'))
        ?.replace(/^[-*]\s*\*\*Innovation:\*\*\s*/i, '') || '';
    const feasibilityMatch = lines
      .find((l) => l.toLowerCase().includes('feasibility'))
      ?.replace(/^[-*]\s*\*\*Feasibility:\*\*\s*/i, '');
    let feasibility: 'High' | 'Medium' | 'Low' = 'Medium';
    if (feasibilityMatch?.toLowerCase().includes('high')) feasibility = 'High';
    else if (feasibilityMatch?.toLowerCase().includes('low')) feasibility = 'Low';

    return {
      title: title || `Research Strategy Option ${idx + 1}`,
      hypothesis: hypothesis || 'Synergistic combination of biomaterial parameters to achieve enhanced microenvironment viability.',
      innovation_gap: innovation || 'Unifying fabrication workflows across complementary polymers to resolve mechanical limitations.',
      feasibility,
      feasibility_explanation: feasibilityMatch || 'Compatible with standard laboratory setups.',
      experimental_steps: [
        'Step 1: Synthesis and characterization of base hydrogel components in an aqueous buffer.',
        'Step 2: Microfluidic blending or crosslinking validation at tailored temperatures.',
        'Step 3: Biocompatibility screenings via MTT cell-viability fluorescence assays.'
      ],
      materials: ['Base Polymer Scaffolding', 'Active Peptide Inducers', 'Isotonic Solvent Medium'],
      estimated_budget: 'Medium',
      estimated_budget_value: '$1,500 - $3,500',
      outcomes: 'Accelerated structural regeneration with controlled local drug-release profiles.',
      risks: [
        {
          risk: 'Accelerated hydrogel degradation leading to premature loss of scaffold shape.',
          remediation: 'Titrate crosslinker ratios or incorporate secondary nanofibrous reinforcements.'
        }
      ],
      database_keywords: ['biomaterials scaffold', 'tissue fabrication', 'cellular regeneration'],
      simulated_variables: {
        x_label: 'Nanofiller Load (wt%)',
        y_label: 'Ultimate Tensile Strength (MPa)',
        data_points: [
          { x: 0.0, y: 5.0 },
          { x: 1.0, y: 12.2 },
          { x: 2.0, y: 21.5 },
          { x: 3.0, y: 26.8 },
          { x: 4.0, y: 13.5 }
        ]
      }
    };
  });
};

const NoveltyResultCard: React.FC<NoveltyResultCardProps> = ({ result }) => {
  const [copied, setCopied] = useState(false);
  const [selectedIdeaIdx, setSelectedIdeaIdx] = useState<number>(0);
  const [activeTab, setActiveTab2] = useState<'overview' | 'simulation' | 'methodology'>('overview');
  const [sliderVal, setSliderVal] = useState<number>(1.5);
  const [checklist, setChecklist] = useState<Record<number, boolean[]>>({});
  const [showExplanation, setShowExplanation] = useState(false);

  // Parse result content safely
  const parsedData = useMemo<NoveltyData | null>(() => {
    if (!result.content) return null;
    try {
      const data = JSON.parse(result.content);
      if (data.ideas && Array.isArray(data.ideas)) {
        return data as NoveltyData;
      }
      return null;
    } catch {
      // Try extracting json blocks if present
      const jsonMatch = result.content.match(/```json\s*([\s\S]*?)\s*```/) || result.content.match(/```\s*([\s\S]*?)\s*```/);
      if (jsonMatch && jsonMatch[1]) {
        try {
          const data = JSON.parse(jsonMatch[1]);
          if (data.ideas && Array.isArray(data.ideas)) {
            return data as NoveltyData;
          }
        } catch {
          // ignore
        }
      }
      
      // Fallback to legacy markdown parser
      const legacyIdeas = parseLegacyMarkdown(result.content);
      if (legacyIdeas.length > 0) {
        return { ideas: legacyIdeas };
      }
      return null;
    }
  }, [result.content]);

  const ideas = parsedData?.ideas || [];
  const currentIdea = ideas[selectedIdeaIdx] || null;

  // Reactively initialize slider value based on the selected idea's simulated data points
  useEffect(() => {
    if (currentIdea && currentIdea.simulated_variables?.data_points?.length > 0) {
      const points = currentIdea.simulated_variables.data_points;
      const xs = points.map((p) => p.x);
      const minX = Math.min(...xs);
      const maxX = Math.max(...xs);
      // set slider chemical midpoint
      setSliderVal((minX + maxX) / 2);
    }
  }, [selectedIdeaIdx, currentIdea]);

  // Linear interpolation calculator for dynamic slider simulation
  const interpolatedValue = useMemo(() => {
    if (!currentIdea || !currentIdea.simulated_variables?.data_points) return 0;
    const points = [...currentIdea.simulated_variables.data_points].sort((a, b) => a.x - b.x);
    if (points.length === 0) return 0;

    if (sliderVal <= points[0].x) return points[0].y;
    if (sliderVal >= points[points.length - 1].x) return points[points.length - 1].y;

    for (let i = 0; i < points.length - 1; i++) {
      const p1 = points[i];
      const p2 = points[i + 1];
      if (sliderVal >= p1.x && sliderVal <= p2.x) {
        const ratio = (sliderVal - p1.x) / (p2.x - p1.x);
        return p1.y + ratio * (p2.y - p1.y);
      }
    }
    return points[0].y;
  }, [sliderVal, currentIdea]);

  const handleCopyAll = () => {
    let copyText = `BIOMATERIALS NOVEL RESEARCH PROPOSAL SPECIFICATIONS\nSource Context: ${result.originalQuery}\n\n`;
    ideas.forEach((idea, index) => {
      copyText += `IDEA ${index + 1}: ${idea.title}\n`;
      copyText += `Hypothesis: ${idea.hypothesis}\n`;
      copyText += `Innovation Gap: ${idea.innovation_gap}\n`;
      copyText += `Feasibility: ${idea.feasibility} - ${idea.feasibility_explanation}\n`;
      copyText += `Experimental Steps:\n` + idea.experimental_steps.map((s, i) => `  ${i + 1}. ${s}`).join('\n') + `\n`;
      copyText += `Materials Required: ${idea.materials.join(', ')}\n`;
      copyText += `Estimated Budget: ${idea.estimated_budget_value} (${idea.estimated_budget})\n`;
      copyText += `Expected Biological Outcomes: ${idea.outcomes}\n`;
      copyText += `Risks & Remediation:\n` + idea.risks.map((r) => `  - Risk: ${r.risk}\n    Remediation: ${r.remediation}`).join('\n') + `\n`;
      copyText += `-----------------------------------------------\n\n`;
    });

    navigator.clipboard.writeText(copyText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleChecklistStep = (ideaIdx: number, stepIdx: number) => {
    setChecklist((prev) => {
      const currentIdeaChecklist = prev[ideaIdx] || [false, false, false];
      const nextChecklist = [...currentIdeaChecklist];
      nextChecklist[stepIdx] = !nextChecklist[stepIdx];
      return {
        ...prev,
        [ideaIdx]: nextChecklist,
      };
    });
  };

  const handleExportPDF = () => {
    if (ideas.length === 0) return;

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    let currentPage = 1;
    const addHeaderAndFooter = (pdf: jsPDF) => {
      // Dark slate premium banner
      pdf.setFillColor(24, 24, 37); // Very deep charcoal
      pdf.rect(0, 0, 210, 32, 'F');
      
      pdf.setTextColor(255, 255, 255);
      pdf.setFont('Helvetica', 'bold');
      pdf.setFontSize(14);
      pdf.text('BioSearch INNOVATION ARCHITECT', 15, 14);
      
      pdf.setFont('Helvetica', 'normal');
      pdf.setFontSize(8);
      pdf.setTextColor(244, 63, 94); // Premium rose tint
      pdf.text('TRANSLATIONAL RESEARCH & HYPOTHESIS SPECIFICATION REPORT', 15, 22);
      
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(8);
      pdf.text(`Page ${currentPage}`, 182, 16);

      // Deep rose secondary divider line
      pdf.setFillColor(244, 63, 94); 
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

    // Executive Context Panel
    doc.setFillColor(254, 242, 244); // light rose background box
    doc.rect(margin, y, contentWidth, 18, 'F');
    doc.setDrawColor(251, 113, 133); // rose border
    doc.rect(margin, y, contentWidth, 18, 'D');

    doc.setTextColor(225, 29, 72); // rose-700
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('SOURCE RESEARCH QUERY CONTEXT', margin + 4, y + 6);
    
    doc.setTextColor(71, 85, 105);
    doc.setFont('Helvetica', 'italic');
    doc.setFontSize(8);
    const shortText = result.originalQuery.length > 95 ? result.originalQuery.substring(0, 95) + '...' : result.originalQuery;
    doc.text(`"${shortText}"`, margin + 4, y + 12);
    y += 28;

    // Output all ideas
    ideas.forEach((idea, idx) => {
      checkPageBreak(50);
      
      // Title Block
      doc.setDrawColor(244, 63, 94);
      doc.setFillColor(255, 255, 255);
      doc.setLineWidth(0.5);
      doc.line(margin, y, margin, y + 10); // visual sidebar separator
      
      doc.setTextColor(30, 41, 59);
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(11);
      doc.text(`IDEA ${idx + 1}: ${idea.title.toUpperCase()}`, margin + 3, y + 6);
      y += 14;

      // 1. Hypothesis
      checkPageBreak(25);
      doc.setTextColor(225, 29, 72); // rose header
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.text('WORKING HYPOTHESIS', margin, y);
      y += 4.5;
      
      doc.setTextColor(71, 85, 105);
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(8.5);
      const splitHypo = doc.splitTextToSize(idea.hypothesis, contentWidth);
      doc.text(splitHypo, margin, y);
      y += splitHypo.length * 4.5 + 4;

      // 2. Innovation Gap
      checkPageBreak(25);
      doc.setTextColor(225, 29, 72);
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.text('INNOVATION GAP & CONTRIBUTION', margin, y);
      y += 4.5;
      
      doc.setTextColor(71, 85, 105);
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(8.5);
      const splitGap = doc.splitTextToSize(idea.innovation_gap, contentWidth);
      doc.text(splitGap, margin, y);
      y += splitGap.length * 4.5 + 4;

      // 3. Experimental Steps
      checkPageBreak(30);
      doc.setTextColor(225, 29, 72);
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.text('LABORATORY EXPERIMENTAL WORKFLOW', margin, y);
      y += 5.5;

      idea.experimental_steps.forEach((step, stepI) => {
        checkPageBreak(12);
        doc.setFillColor(244, 63, 94);
        doc.circle(margin + 2, y - 1, 0.8, 'F'); // elegant step bullet
        
        doc.setTextColor(71, 85, 105);
        doc.setFont('Helvetica', 'normal');
        doc.setFontSize(8.5);
        const splitStep = doc.splitTextToSize(`${stepI + 1}. ${step}`, contentWidth - 8);
        doc.text(splitStep, margin + 6, y);
        y += splitStep.length * 4.5 + 1.5;
      });
      y += 3.5;

      // 4. Critical Parameters Card (Feasibility, Budget, Risks)
      checkPageBreak(35);
      doc.setFillColor(248, 250, 252); // light slate background
      doc.rect(margin, y - 2, contentWidth, 23, 'F');
      
      doc.setTextColor(30, 41, 59);
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(8);
      doc.text(`FEASIBILITY: ${idea.feasibility.toUpperCase()}`, margin + 4, y + 4);
      doc.text(`ESTIMATED BUDGET: ${idea.estimated_budget_value} (${idea.estimated_budget} complexity)`, margin + 4, y + 9);
      doc.text(`TARGET TRANSLATIONAL OUTCOMES:`, margin + 4, y + 14);
      
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(71, 85, 105);
      const splitOutcomes = doc.splitTextToSize(idea.outcomes, contentWidth - 65);
      doc.text(splitOutcomes, margin + 60, y + 14);

      y += 28;

      // Divider between ideas
      if (idx < ideas.length - 1) {
        checkPageBreak(10);
        doc.setDrawColor(226, 232, 240); // slate-200 line
        doc.setLineWidth(0.2);
        doc.line(margin, y, margin + contentWidth, y);
        y += 12;
      }
    });

    doc.save(`Novelty_Gen_Research_Proposal_Report.pdf`);
  };

  // Setup bounds for visual graph simulation mapping
  const points = currentIdea?.simulated_variables?.data_points || [];
  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);
  const minX = xs.length > 0 ? Math.min(...xs, 0) : 0;
  const maxX = xs.length > 0 ? Math.max(...xs, 5) : 5;
  const minY = ys.length > 0 ? Math.min(...ys, 0) : 0;
  const maxY = ys.length > 0 ? Math.max(...ys, 100) : 100;

  const padX = 26;
  const padY = 16;
  const graphW = 320;
  const graphH = 140;

  const mapToPixels = (x: number, y: number) => {
    const rangeX = maxX - minX || 1;
    const rangeY = maxY - minY || 1;
    // Map chemical variables to visual pixel coordinates
    const px = padX + ((x - minX) / rangeX) * (graphW - 2 * padX);
    const py = graphH - padY - ((y - minY) / rangeY) * (graphH - 2 * padY);
    return { x: px, y: py };
  };

  // Generate continuous line path for graph polyline visualization
  const polylineCoordsString = useMemo(() => {
    if (points.length === 0) return '';
    const sorted = [...points].sort((a, b) => a.x - b.x);
    return sorted
      .map((p) => {
        const { x, y } = mapToPixels(p.x, p.y);
        return `${x},${y}`;
      })
      .join(' ');
  }, [points, currentIdea]);

  const activeDotCoords = useMemo(() => {
    return mapToPixels(sliderVal, interpolatedValue);
  }, [sliderVal, interpolatedValue, currentIdea]);

  // Dynamic status evaluation text for translational biology predictions
  const evaluationMessage = useMemo(() => {
    if (!currentIdea) return null;
    const yLabel = currentIdea.simulated_variables.y_label.toLowerCase();
    
    if (yLabel.includes('viability') || yLabel.includes('cell')) {
      if (interpolatedValue > 85) {
        return { status: 'OPTIMAL BIOCOMPATIBILITY', color: 'text-emerald-600 bg-emerald-50 border-emerald-100', desc: 'No significant in vitro cytotoxicity detected. Cells maintain proliferation kinetics.' };
      } else if (interpolatedValue >= 60) {
        return { status: 'MODERATE CELL STRESS WARNING', color: 'text-amber-600 bg-amber-50 border-amber-100', desc: 'Sub-lethal physiological response. Recommend reducing polymer concentration.' };
      } else {
        return { status: 'HIGH CYTOTOXIC CRITICAL WARNING', color: 'text-rose-600 bg-rose-50 border-rose-100', desc: 'Severe cellular apoptotic triggering. Unviable microenvironment for clinical standard.' };
      }
    } else if (yLabel.includes('strength') || yLabel.includes('modulus') || yLabel.includes('tensile')) {
      if (interpolatedValue > 20) {
        return { status: 'SUPERIOR STRUCTURAL RIGIDITY', color: 'text-emerald-600 bg-emerald-50 border-emerald-100', desc: 'Capable of tolerating continuous orthopaedic physiological loading cycles.' };
      } else if (interpolatedValue >= 10) {
        return { status: 'SOFT-TISSUE SCAFFOLD COMPLIANT', color: 'text-blue-600 bg-blue-50 border-blue-100', desc: 'Matches mechanical elasticity indices for neural or cardiovascular scaffolding.' };
      } else {
        return { status: 'CRITICAL SCRUPLE DEFICIENCY', color: 'text-rose-600 bg-rose-50 border-rose-100', desc: 'Scaffold will fail and rupture rapidly under minimal standard biological strain.' };
      }
    }
    
    // Default fallback
    if (interpolatedValue > 70) {
      return { status: 'EXCELLENT PARAMETER INDEX', color: 'text-emerald-600 bg-emerald-50 border-emerald-100', desc: 'Highly promising result satisfying primary biomaterials specifications.' };
    } else {
      return { status: 'SUB-OPTIMAL RECONNAISSANCE INDEX', color: 'text-amber-600 bg-amber-50 border-amber-100', desc: 'Further optimization or reagent adjustment recommended.' };
    }
  }, [interpolatedValue, currentIdea]);

  if (ideas.length === 0 || !currentIdea) {
    return (
      <div className="p-8 text-center bg-white border border-slate-200 rounded-2xl shadow">
        <Info className="w-10 h-10 mx-auto mb-3 text-slate-400" />
        <p className="text-slate-600 font-medium">No novel research ideas could be extracted or parsed.</p>
        <p className="text-slate-400 text-sm mt-1">Please ensure the Gemini pipeline generated valid results.</p>
      </div>
    );
  }

  return (
    <div className="w-full bg-slate-50 rounded-2xl shadow-lg border border-pink-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Premium Dashboard Header Banner */}
      <div className="bg-gradient-to-r from-pink-50 via-rose-50 to-pink-100 px-6 py-5 border-b border-pink-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="bg-white p-1.5 rounded-lg shadow-sm border border-pink-100 text-rose-600">
              <Lightbulb className="w-4 h-4 text-rose-600 animate-pulse" />
            </div>
            <h3 className="font-bold text-slate-800 text-lg flex items-center gap-1">
              Translational Medicine Novelty Lab <Sparkles className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            </h3>
          </div>
          <p className="text-xs text-rose-800/80 font-medium tracking-wide">
            PRINCIPAL INVESTIGATOR SCRUTINY PORTAL / GENERATIVE TRANSLATIONAL DESIGNS
          </p>
        </div>
        
        <div className="flex items-center gap-2 w-full md:w-auto">
          <button 
            id="pdf-btn-novelty"
            onClick={handleExportPDF}
            className="flex-1 md:flex-none flex items-center justify-center gap-1.5 bg-rose-600 hover:bg-rose-700 text-white border border-rose-500 px-4 py-2 rounded-lg font-medium transition-colors text-sm shadow-sm"
          >
            <FileText className="w-4 h-4" />
            <span>Generate Academic PDF Proposal</span>
          </button>
        </div>
      </div>

      {/* Interactive Parameters Metadata Bar */}
      <div className="bg-white px-6 py-3 border-b border-slate-100 flex flex-col sm:flex-row justify-between text-xs text-slate-500 gap-2">
        <div className="flex items-center gap-3">
          <span className="font-mono bg-pink-50 text-rose-700 font-bold px-2 py-0.5 rounded border border-pink-100">
            {ideas.length} IDEAS DESIGNED
          </span>
          <span className="truncate max-w-xs md:max-w-md text-slate-600 font-semibold italic">
            Query: "{result.originalQuery}"
          </span>
        </div>
      </div>

      <div className="p-6">
        
        {/* Navigation / Segmented selector for Proposed Ideas */}
        <div className="mb-6">
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            SELECT PROPOSED RESEARCH PATHWAY / EXPERIMENTAL OPTION
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
            {ideas.map((idea, idx) => (
              <button
                key={idx}
                id={`idea-btn-${idx}`}
                onClick={() => {
                  setSelectedIdeaIdx(idx);
                  // Preserve active tab context gracefully
                }}
                className={`flex items-start gap-2.5 p-3 rounded-xl border text-left transition-all duration-300 ${
                  selectedIdeaIdx === idx 
                    ? 'border-rose-500 bg-rose-50/50 shadow-sm ring-1 ring-rose-300' 
                    : 'border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300'
                }`}
              >
                <div className={`mt-0.5 p-1 rounded-md font-mono text-xs font-bold ${
                  selectedIdeaIdx === idx 
                    ? 'bg-rose-600 text-white' 
                    : 'bg-slate-100 text-slate-600'
                }`}>
                  0{idx + 1}
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-slate-800 text-xs truncate uppercase tracking-tight">
                    {idea.title}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5 shrink-0 flex items-center gap-1.5 font-medium">
                    <span>Feasibility:</span>
                    <span className={`font-bold ${
                      idea.feasibility === 'High' ? 'text-emerald-600' :
                      idea.feasibility === 'Medium' ? 'text-amber-600' :
                      'text-rose-600'
                    }`}>
                      {idea.feasibility}
                    </span>
                    <span className="text-slate-300">|</span>
                    <span>Budget: {idea.estimated_budget}</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Selected Idea Detail Workspace */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden min-h-[420px] flex flex-col">
          
          {/* Internal Detail Tab Bar */}
          <div className="bg-slate-50 border-b border-slate-200 px-4 flex justify-between items-center h-12 shrink-0">
            <div className="flex gap-1">
              <button
                id="tab-overview"
                onClick={() => setActiveTab2('overview')}
                className={`h-12 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 ${
                  activeTab === 'overview' 
                    ? 'border-rose-600 text-rose-700' 
                    : 'border-transparent text-slate-600 hover:text-slate-800 hover:bg-slate-100/50'
                }`}
              >
                <Brain className="w-3.5 h-3.5" />
                <span>Overview & Novelty Gap</span>
              </button>
              
              <button
                id="tab-simulation"
                onClick={() => setActiveTab2('simulation')}
                className={`h-12 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 ${
                  activeTab === 'simulation' 
                    ? 'border-rose-600 text-rose-700' 
                    : 'border-transparent text-slate-600 hover:text-slate-800 hover:bg-slate-100/50'
                }`}
              >
                <LineChart className="w-3.5 h-3.5" />
                <span>Lab Sandbox & Simulation</span>
              </button>
              
              <button
                id="tab-methodology"
                onClick={() => setActiveTab2('methodology')}
                className={`h-12 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 ${
                  activeTab === 'methodology' 
                    ? 'border-rose-600 text-rose-700' 
                    : 'border-transparent text-slate-600 hover:text-slate-800 hover:bg-slate-100/50'
                }`}
              >
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Workflow & Risk Mitigation</span>
              </button>
            </div>
            
            <div className="text-[10px] uppercase font-mono tracking-widest text-[#cfcfd8] hidden sm:block">
              {currentIdea.title.substring(0, 32)}...
            </div>
          </div>

          {/* Dynamic Content Panel */}
          <div className="p-6 flex-1 bg-white">
            
            {/* Active Tab 1: Overview */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-bold text-slate-800 mb-1 leading-snug">
                    {currentIdea.title}
                  </h4>
                  <p className="text-xs text-rose-600 font-semibold tracking-wider uppercase">
                    ACTIVE HYPOTHESIS & SCIENTIFIC NOVELTY CRITERIA
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-slate-50 rounded-xl p-5 border border-slate-100 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] uppercase tracking-widest font-mono text-slate-400 block mb-1">
                        Working Hypothesis
                      </span>
                      <p className="text-slate-700 text-sm leading-relaxed font-medium">
                        {currentIdea.hypothesis}
                      </p>
                    </div>
                    <div className="mt-4 pt-4 border-t border-slate-100-style flex items-center gap-2">
                      <div className="bg-rose-100 p-1 rounded-md text-rose-600">
                        <Sparkles className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-[10px] text-rose-800 font-bold uppercase tracking-wide">
                        Proposed Paradigm Alignment
                      </span>
                    </div>
                  </div>

                  <div className="bg-slate-50 rounded-xl p-5 border border-slate-100 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] uppercase tracking-widest font-mono text-slate-400 block mb-1">
                        Innovation Gap Identified
                      </span>
                      <p className="text-slate-700 text-sm leading-relaxed font-semibold text-slate-800">
                        {currentIdea.innovation_gap}
                      </p>
                    </div>
                    <div className="mt-4 pt-4 border-t border-slate-100-style flex items-center gap-2">
                      <div className="bg-pink-100 p-1 rounded-md text-pink-600">
                        <Zap className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-[10px] text-pink-800 font-bold uppercase tracking-wide">
                        Overcoming Previous Scaffold Pitfalls
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="bg-emerald-50 text-emerald-600 p-2.5 rounded-lg border border-emerald-100 shrink-0">
                      <TrendingUp className="w-5 h-5" />
                    </div>
                    <div>
                      <h5 className="font-bold text-slate-800 text-sm">Target Translational outcomes</h5>
                      <p className="text-slate-600 text-xs mt-0.5 leading-relaxed">
                        {currentIdea.outcomes}
                      </p>
                    </div>
                  </div>
                  
                  <div className="bg-white px-3.5 py-2.5 rounded-lg border border-slate-150 flex flex-col justify-center items-start shrink-0 min-w-[150px]">
                    <span className="text-[10px] uppercase font-mono text-slate-400 block mb-0.5">Feasibility index</span>
                    <div className="flex items-center gap-1.5">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                        currentIdea.feasibility === 'High' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' :
                        currentIdea.feasibility === 'Medium' ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                        'bg-rose-100 text-rose-700 border border-rose-200'
                      }`}>
                        {currentIdea.feasibility} FEASIBILITY
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1">
                      {currentIdea.feasibility_explanation}
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    LITERATURE DATABASE DIRECT SEARCH KEYWORDS
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {currentIdea.database_keywords.map((queryText, kIdx) => (
                      <a
                        key={kIdx}
                        href={`https://pubmed.ncbi.nlm.nih.gov/?term=${encodeURIComponent(queryText)}`}
                        target="_blank"
                        referrerPolicy="no-referrer"
                        className="inline-flex items-center gap-1.5 bg-white hover:bg-rose-50 text-slate-700 hover:text-rose-700 border border-slate-200 hover:border-rose-350 px-3 py-1.5 rounded-lg text-xs font-medium shadow-sm transition-all"
                      >
                        <Search className="w-3.5 h-3.5 text-slate-400 hover:text-rose-500" />
                        <span>Search PubMed: "{queryText}"</span>
                        <ExternalLink className="w-3 h-3 text-slate-300" />
                      </a>
                    ))}
                    <a
                      href={`https://scholar.google.com/scholar?q=${encodeURIComponent(currentIdea.title)}`}
                      target="_blank"
                      referrerPolicy="no-referrer"
                      className="inline-flex items-center gap-1.5 bg-white hover:bg-rose-50 text-slate-700 hover:text-rose-700 border border-slate-200 hover:border-rose-350 px-3 py-1.5 rounded-lg text-xs font-medium shadow-sm transition-all"
                    >
                      <Search className="w-3.5 h-3.5 text-slate-400" />
                      <span>Search Google Scholar</span>
                      <ExternalLink className="w-3 h-3 text-slate-300" />
                    </a>
                  </div>
                </div>

              </div>
            )}

            {/* Active Tab 2: Lab Sandbox & Simulator */}
            {activeTab === 'simulation' && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-bold text-slate-800 mb-0.5">
                    Biological Parameter Interpolation Playground
                  </h4>
                  <p className="text-xs text-rose-600 font-semibold uppercase tracking-wider">
                    SIMULATE SCAFFOLD PREDICTIVE RETENTION OR REACTION KINETICS
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  
                  {/* Left Column: Interactive Param sliders & materials */}
                  <div className="lg:col-span-5 space-y-6">
                    <div className="bg-slate-50 p-4 border border-slate-200 rounded-xl">
                      <div className="flex justify-between items-center mb-2">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1.5">
                          <Sliders className="w-3.5 h-3.5 text-rose-500" />
                          <span>Adjust Parameter (X-Axis)</span>
                        </label>
                        <button 
                          onClick={() => setShowExplanation(!showExplanation)}
                          className="bg-white hover:bg-slate-100 p-1 rounded border text-slate-500 hover:text-slate-700"
                        >
                          <Info className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {showExplanation && (
                        <p className="text-[10px] text-slate-500 bg-white p-2.5 rounded-lg border border-slate-200 mb-3 leading-relaxed">
                          This simulator performs <strong>continuous linear interpolation</strong> across experimental data points defined in the paper summaries. Move the slider to forecast clinical response variables in real time.
                        </p>
                      )}

                      <div className="bg-white p-4 rounded-lg border border-slate-150 flex flex-col justify-center">
                        <p className="text-xs text-slate-500 font-semibold mb-1 uppercase tracking-tight">
                          {currentIdea.simulated_variables.x_label}
                        </p>
                        
                        <div className="flex items-center gap-4">
                          <input
                            type="range"
                            id="sandbox-slider"
                            min={minX}
                            max={maxX}
                            step={((maxX - minX) / 20) || 0.1}
                            value={sliderVal}
                            onChange={(e) => setSliderVal(parseFloat(e.target.value))}
                            className="flex-1 accent-rose-600 h-2 bg-slate-100 rounded-lg cursor-pointer"
                          />
                          <span className="font-mono text-sm font-bold text-rose-600 shrink-0 min-w-[50px] text-right">
                            {sliderVal.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3.5">
                      <div className="bg-slate-50 p-4 border border-slate-100 rounded-xl">
                        <span className="text-[10px] uppercase tracking-widest font-mono text-slate-400 block mb-1">
                          Materials / Biomolecules Required
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {currentIdea.materials.map((mat, mIdx) => (
                            <span 
                              key={mIdx}
                              className="inline-flex items-center gap-1 bg-white border border-slate-200 text-slate-700 px-2.5 py-1 rounded-md text-xs font-medium"
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0" />
                              {mat}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="bg-slate-50 p-4 border border-slate-100 rounded-xl flex items-center justify-between">
                        <div>
                          <span className="text-[10px] uppercase font-mono text-slate-400 block mb-0.5">
                            Estimated Budget Cost
                          </span>
                          <span className="font-bold text-slate-800 text-base">
                            {currentIdea.estimated_budget_value}
                          </span>
                        </div>
                        <div className="flex items-center gap-0.5 bg-rose-50 text-rose-700 border border-rose-100 font-bold px-2 py-1 rounded text-xs">
                          <DollarSign className="w-4 h-4 shrink-0" />
                          <span>{currentIdea.estimated_budget} BUDGET</span>
                        </div>
                      </div>
                    </div>

                  </div>

                  {/* Right Column: Graphs and simulated readouts */}
                  <div className="lg:col-span-7 space-y-4">
                    
                    {/* Simulated Readout Card */}
                    <div className="bg-slate-900 text-white rounded-xl p-4 shadow-sm border border-slate-800 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] uppercase tracking-widest font-mono text-emerald-400 block mb-0.5">
                          Predicted Response (Y-Axis)
                        </span>
                        <h5 className="font-semibold text-slate-300 text-xs truncate max-w-[240px]">
                          {currentIdea.simulated_variables.y_label}
                        </h5>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="font-mono text-2xl font-bold text-emerald-400 animate-pulse">
                          {interpolatedValue.toFixed(1)}%
                        </span>
                      </div>
                    </div>

                    {/* SVG Curve Plot */}
                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 relative flex justify-center items-center">
                      <svg 
                        id="simulation-svg"
                        width={graphW} 
                        height={graphH}
                        className="overflow-visible"
                      >
                        {/* Grid Lines */}
                        <line x1={padX} y1={padY} x2={graphW - padX} y2={padY} stroke="#e2e8f0" strokeDasharray="2 3" />
                        <line x1={padX} y1={graphH / 2} x2={graphW - padX} y2={graphH / 2} stroke="#e2e8f0" strokeDasharray="2 3" />
                        <line x1={padX} y1={graphH - padY} x2={graphW - padX} y2={graphH - padY} stroke="#cbd5e1" strokeWidth="1" />
                        
                        {/* Vertical Grids */}
                        <line x1={padX} y1={padY} x2={padX} y2={graphH - padY} stroke="#cbd5e1" strokeWidth="1" />
                        <line x1={graphW / 2} y1={padY} x2={graphW / 2} y2={graphH - padY} stroke="#e2e8f0" strokeDasharray="2 3" />
                        <line x1={graphW - padX} y1={padY} x2={graphW - padX} y2={graphH - padY} stroke="#e2e8f0" strokeDasharray="2 3" />

                        {/* Polyline curve mapping */}
                        {polylineCoordsString && (
                          <polyline
                            fill="none"
                            stroke="#f43f5e"
                            strokeWidth="2.5"
                            points={polylineCoordsString}
                            strokeLinecap="round"
                            className="transition-all duration-300"
                          />
                        )}

                        {/* Anchored original data points from JSON */}
                        {points.map((p, pIdx) => {
                          const { x, y } = mapToPixels(p.x, p.y);
                          const isClosest = Math.abs(sliderVal - p.x) < 0.2;
                          return (
                            <g key={pIdx}>
                              <circle
                                cx={x}
                                cy={y}
                                r={isClosest ? 4 : 2.5}
                                fill={isClosest ? '#db2777' : '#94a3b8'}
                                stroke="#ffffff"
                                strokeWidth="1"
                              />
                            </g>
                          );
                        })}

                        {/* Current Pulsing Slider state dot */}
                        {activeDotCoords && (
                          <g>
                            <circle
                              cx={activeDotCoords.x}
                              cy={activeDotCoords.y}
                              r="8"
                              fill="#f43f5e"
                              fillOpacity="0.25"
                              className="animate-ping"
                            />
                            <circle
                              cx={activeDotCoords.x}
                              cy={activeDotCoords.y}
                              r="4.5"
                              fill="#db2777"
                              stroke="#ffffff"
                              strokeWidth="1.5"
                            />
                          </g>
                        )}

                        {/* X and Y labels inside SVG */}
                        <text x={padX - 4} y={padY + 4} fontFamily="mono" fontSize="7" fill="#64748b" textAnchor="end">
                          MAX
                        </text>
                        <text x={padX - 4} y={graphH - padY + 2} fontFamily="mono" fontSize="7" fill="#64748b" textAnchor="end">
                          MIN
                        </text>

                        <text x={padX} y={graphH - padY + 11} fontFamily="mono" fontSize="7" fill="#64748b" textAnchor="middle">
                          {minX.toFixed(1)}
                        </text>
                        <text x={graphW - padX} y={graphH - padY + 11} fontFamily="mono" fontSize="7" fill="#64748b" textAnchor="middle">
                          {maxX.toFixed(1)}
                        </text>
                      </svg>
                      
                      <div className="absolute top-2.5 right-3 px-2 py-0.5 bg-white border border-slate-200 shadow-sm rounded text-[8px] font-bold text-slate-500 font-mono">
                        CURVE INTERPOLATION ACTIVE
                      </div>
                    </div>

                    {/* Alerting Response Evaluation */}
                    {evaluationMessage && (
                      <div className={`p-4 border rounded-xl shadow-xs leading-relaxed transition-all duration-300 ${evaluationMessage.color}`}>
                        <div className="flex items-center gap-1.5 font-bold text-xs">
                          <AlertTriangle className="w-4 h-4 shrink-0" />
                          <span>{evaluationMessage.status}</span>
                        </div>
                        <p className="text-xs mt-1 font-semibold opacity-90">
                          {evaluationMessage.desc}
                        </p>
                      </div>
                    )}

                  </div>

                </div>
              </div>
            )}

            {/* Active Tab 3: Detailed Methodology Checklists & Protocol */}
            {activeTab === 'methodology' && (
              <div className="space-y-6">
                
                {/* Protocol sandbox checklist */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <h4 className="text-lg font-bold text-slate-800">
                      Primary Experimental Protocol Pipeline
                    </h4>
                    <button
                      id="reset-checklist"
                      onClick={() => setChecklist((prev) => ({ ...prev, [selectedIdeaIdx]: [false, false, false] }))}
                      className="inline-flex items-center gap-1 text-slate-500 hover:text-rose-600 bg-slate-100 p-1.5 px-2 rounded-lg text-xs font-semibold"
                    >
                      <RefreshCcw className="w-3.5 h-3.5" />
                      <span>Reset Checklist</span>
                    </button>
                  </div>
                  <p className="text-xs text-rose-600 font-semibold tracking-wider uppercase mb-4">
                    INTERACTIVE BENCH ACTION STEPS REQUIRED
                  </p>

                  <div className="space-y-3">
                    {currentIdea.experimental_steps.map((step, sIdx) => {
                      const isChecked = (checklist[selectedIdeaIdx] || [false, false, false])[sIdx];
                      return (
                        <div
                          key={sIdx}
                          onClick={() => toggleChecklistStep(selectedIdeaIdx, sIdx)}
                          className={`flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-all ${
                            isChecked 
                              ? 'border-rose-400 bg-rose-50/20' 
                              : 'border-slate-200 bg-white hover:border-slate-350 hover:bg-slate-50/50'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {}} // toggled in container div onClick
                            className="mt-0.5 rounded text-rose-600 focus:ring-rose-500 w-4 h-4"
                          />
                          <div>
                            <span className="text-[10px] uppercase font-mono font-bold tracking-wide text-rose-500 block">
                              CRITICAL LAB STAGE {sIdx + 1}
                            </span>
                            <p className={`text-sm mt-0.5 ${isChecked ? 'text-slate-500 line-through' : 'text-slate-800 font-medium'}`}>
                              {step}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Risks details */}
                <div className="pt-4 border-t border-slate-150 space-y-3">
                  <span className="text-xs font-bold text-slate-500 block uppercase tracking-wider">
                    TRANSLATIONAL BIOMATERIAL RISK AUDITING & REMEDIATION
                  </span>
                  
                  {currentIdea.risks.map((riskObj, rIdx) => (
                    <div 
                      key={rIdx}
                      className="bg-rose-50/40 p-4 border border-rose-100 rounded-xl grid grid-cols-1 md:grid-cols-2 gap-4"
                    >
                      <div>
                        <div className="flex items-center gap-1 px-1 py-0.5 bg-rose-200 text-rose-700 text-[9px] font-bold rounded w-fit mb-1">
                          <AlertTriangle className="w-3.5 h-3.5" /> RISK HAZARD CRITERIA
                        </div>
                        <p className="text-xs font-semibold text-rose-950">
                          {riskObj.risk}
                        </p>
                      </div>
                      
                      <div className="border-t md:border-t-0 md:border-l border-rose-100 md:pl-4">
                        <div className="flex items-center gap-1 px-1 py-0.5 bg-emerald-150 text-emerald-700 text-[9px] font-bold rounded w-fit mb-1 border border-emerald-250">
                          <CheckCircle className="w-3.5 h-3.5" /> PI REMEDIATION PROTOCOL
                        </div>
                        <p className="text-xs font-semibold text-slate-700">
                          {riskObj.remediation}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

              </div>
            )}

          </div>

        </div>

        {/* Copy All Button */}
        <div className="mt-6 flex justify-end">
          <button 
            id="copy-ideas-btn"
            onClick={handleCopyAll}
            className="flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-4 py-2 rounded-lg font-medium transition-colors text-sm shadow-sm"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Clipboard Synced!' : 'Copy Complete Proposal to Clipboard'}
          </button>
        </div>

      </div>
    </div>
  );
};

export default NoveltyResultCard;
