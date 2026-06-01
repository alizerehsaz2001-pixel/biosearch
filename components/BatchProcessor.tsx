import React, { useState, useRef, useEffect } from 'react';
import { 
  Layers, Upload, Play, CheckCircle2, XCircle, Loader2, Download, 
  Copy, Trash2, FileText, Settings, ShieldCheck, Activity, BrainCircuit,
  Info, ChevronDown, Sparkles, ChevronRight, Eye, ClipboardCheck, ArrowRightCircle
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useToast } from '../contexts/ToastContext';
import { generateSearchString, extractTechnicalData } from '../services/geminiService';
import { jsPDF } from 'jspdf';

interface BatchResultItem {
  entry: string;
  status: 'pending' | 'processing' | 'success' | 'error';
  content?: string;
  explanation?: string;
  error?: string;
}

export const BatchProcessor: React.FC = () => {
  const { t, language } = useLanguage();
  const { showToast } = useToast();
  const isRTL = language === 'he' || language === 'fa';

  const [rawText, setRawText] = useState('');
  const [fileName, setFileName] = useState('');
  const [useThinking, setUseThinking] = useState(false);
  const [taskType, setTaskType] = useState<'BOOLEAN_SEARCH' | 'DATA_EXTRACTION'>('BOOLEAN_SEARCH');
  
  const [entries, setEntries] = useState<string[]>([]);
  const [results, setResults] = useState<BatchResultItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingIndex, setProcessingIndex] = useState(-1);
  const [isDragging, setIsDragging] = useState(false);
  
  // Tab states: -1 for summary dashboard, 0+ for specific item details
  const [activeTab, setActiveTab] = useState<number>(-1);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Parse CSV helper
  const parseCSV = (text: string): string[] => {
    const rows: string[] = [];
    const lines = text.split(/\r?\n/);
    
    lines.forEach(line => {
      const trimmed = line.trim();
      if (!trimmed) return;
      
      // Matches cells ignoring commas inside quotes
      const cells = trimmed.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
      let targetText = cells[0] || '';
      
      // Clean leading/trailing double quotes
      if (targetText.startsWith('"') && targetText.endsWith('"')) {
        targetText = targetText.slice(1, -1);
      }
      
      const cleaned = targetText.replace(/""/g, '"').trim();
      if (cleaned) {
        rows.push(cleaned);
      }
    });
    
    // Skip header if first row resembles a generic name
    if (rows.length > 1) {
      const first = rows[0].toLowerCase();
      if (first.includes('abstract') || first.includes('topic') || first.includes('query') || first.includes('title')) {
        return rows.slice(1);
      }
    }
    
    return rows;
  };

  // File loading and parsing dispatcher
  const handleFileLoad = (file: File) => {
    setFileName(file.name);
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (!content) return;
      
      let parsed: string[] = [];
      const extension = file.name.split('.').pop()?.toLowerCase();
      
      if (extension === 'csv') {
        parsed = parseCSV(content);
      } else if (extension === 'json') {
        try {
          const jsonVal = JSON.parse(content);
          if (Array.isArray(jsonVal)) {
            parsed = jsonVal.map((item: any) => typeof item === 'object' ? JSON.stringify(item) : String(item));
          } else if (typeof jsonVal === 'object') {
            parsed = Object.values(jsonVal).map((item: any) => typeof item === 'object' ? JSON.stringify(item) : String(item));
          }
        } catch (err) {
          showToast('Failed to parse JSON file', 'error');
          return;
        }
      } else {
        // Plain text file - divide by line breaks
        parsed = content.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
      }
      
      if (parsed.length > 0) {
        setEntries(parsed);
        setRawText(parsed.join('\n'));
        showToast(`Successfully loaded ${parsed.length} entries.`, 'success');
      } else {
        showToast('No entries found in file.', 'info');
      }
    };
    
    reader.readAsText(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileLoad(file);
    }
  };

  // Watch manual text pastes and separate by newlines
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setRawText(val);
    const splitLines = val.split('\n').map(l => l.trim()).filter(Boolean);
    setEntries(splitLines);
  };

  const handleClear = () => {
    setRawText('');
    setEntries([]);
    setResults([]);
    setFileName('');
    setActiveTab(-1);
    setIsProcessing(false);
    setProcessingIndex(-1);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Start Batch execution sequential processing
  const handleStartProcessing = async () => {
    if (entries.length === 0) {
      showToast('Please state or load some entries to process.', 'error');
      return;
    }
    
    setIsProcessing(true);
    setActiveTab(-1); // Return to summary tab
    
    // Setup initial empty result array
    const initialResults: BatchResultItem[] = entries.map(entry => ({
      entry,
      status: 'pending'
    }));
    
    setResults(initialResults);
    
    // Loop through entries sequentially
    for (let i = 0; i < entries.length; i++) {
      setProcessingIndex(i);
      setResults(prev => {
        const copy = [...prev];
        copy[i].status = 'processing';
        return copy;
      });
      
      try {
        let content = '';
        let explanation = '';
        
        if (taskType === 'BOOLEAN_SEARCH') {
          const res = await generateSearchString(entries[i]);
          content = res.content;
          explanation = res.explanation || '';
        } else {
          const res = await extractTechnicalData(entries[i], useThinking);
          content = res.content;
        }
        
        setResults(prev => {
          const copy = [...prev];
          copy[i].status = 'success';
          copy[i].content = content;
          copy[i].explanation = explanation;
          return copy;
        });
      } catch (err: any) {
        const errorMsg = err.message || 'Unknown processing error';
        setResults(prev => {
          const copy = [...prev];
          copy[i].status = 'error';
          copy[i].error = errorMsg;
          return copy;
        });
      }
      
      // Short staggered pause to protect model API rate limits stability
      await new Promise(resolve => setTimeout(resolve, 800));
    }
    
    setIsProcessing(false);
    setProcessingIndex(-1);
    showToast(`Processed ${entries.length} queries successfully.`, 'success');
  };

  // Batch Export Handlers
  const exportCSV = () => {
    if (results.length === 0) return;
    
    let csvContent = 'data:text/csv;charset=utf-8,';
    
    if (taskType === 'BOOLEAN_SEARCH') {
      csvContent += '"Original Input (Research Topic)","Generated Boolean Query","Status","Explanation"\n';
      results.forEach(r => {
        let cleanQuery = r.content || '';
        try {
          const parsed = JSON.parse(r.content || '{}');
          cleanQuery = parsed.query || cleanQuery;
        } catch(e) {}
        
        const row = [
          `"${r.entry.replace(/"/g, '""')}"`,
          `"${cleanQuery.replace(/"/g, '""')}"`,
          `"${r.status}"`,
          `"${(r.explanation || r.error || '').replace(/"/g, '""')}"`
        ];
        csvContent += row.join(',') + '\n';
      });
    } else {
      csvContent += '"Original Abstract","Material Composition","Fabrication Method","Porosity","Mechanical Strength","Degradation Rate","Biological Summary"\n';
      results.forEach(r => {
        let material = 'N/A', fab = 'N/A', porosity = 'N/A', mechanical = 'N/A', degradation = 'N/A', bio = 'N/A';
        try {
          const parsed = JSON.parse(r.content || '{}');
          material = parsed.material_composition || material;
          fab = parsed.fabrication_method || fab;
          porosity = parsed.quantitative_properties?.porosity || porosity;
          mechanical = parsed.quantitative_properties?.mechanical_strength || mechanical;
          degradation = parsed.quantitative_properties?.degradation_rate || degradation;
          bio = parsed.biological_result || bio;
        } catch(e) {}
        
        const row = [
          `"${r.entry.replace(/"/g, '""')}"`,
          `"${material.replace(/"/g, '""')}"`,
          `"${fab.replace(/"/g, '""')}"`,
          `"${porosity.replace(/"/g, '""')}"`,
          `"${mechanical.replace(/"/g, '""')}"`,
          `"${degradation.replace(/"/g, '""')}"`,
          `"${bio.replace(/"/g, '""')}"`
        ];
        csvContent += row.join(',') + '\n';
      });
    }
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `bio_batch_report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportJSON = () => {
    if (results.length === 0) return;
    const items = results.map(r => {
      let parsedContent = r.content;
      try {
        parsedContent = JSON.parse(r.content || '{}');
      } catch(e) {}
      return {
        input: r.entry,
        status: r.status,
        result: parsedContent,
        explanation: r.explanation,
        error: r.error
      };
    });
    
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(items, null, 2));
    const link = document.createElement('a');
    link.setAttribute('href', dataStr);
    link.setAttribute('download', `bio_batch_report_${Date.now()}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportPDF = () => {
    if (results.length === 0) return;
    
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
    const pageHeight = 297;
    const margin = 15;
    const contentWidth = 180;
    let currentPage = 1;
    let y = 45;
    
    const addHeaderAndFooter = (pdf: jsPDF) => {
      // Header Banner
      pdf.setFillColor(15, 23, 42); // deep slate
      pdf.rect(0, 0, 210, 32, 'F');
      
      pdf.setTextColor(255, 255, 255);
      pdf.setFont('Helvetica', 'bold');
      pdf.setFontSize(14);
      pdf.text('BioSearch Catalyst', 15, 14);
      
      pdf.setFont('Helvetica', 'normal');
      pdf.setFontSize(8);
      pdf.setTextColor(150, 180, 255);
      pdf.text(`BATCH INTEL PROCESSOR REPORT  -  TASK TYPE: ${taskType}`, 15, 21);
      
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(8);
      pdf.text(`Page ${currentPage}`, 182, 16);

      // Teal boundary margin
      pdf.setFillColor(13, 148, 136); // teal line
      pdf.rect(0, 31, 210, 1.2, 'F');
    };
    
    const checkPageBreak = (neededHeight: number) => {
      if (y + neededHeight > pageHeight - 20) {
        doc.addPage();
        currentPage++;
        addHeaderAndFooter(doc);
        y = 45;
      }
    };
    
    addHeaderAndFooter(doc);
    
    // Title of Document
    doc.setTextColor(30, 41, 59);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('Automated Batch Extraction & Synthesis Report', margin, y);
    y += 8;
    
    doc.setTextColor(100, 116, 139);
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(`Generated on: ${new Date().toLocaleDateString()} @ ${new Date().toLocaleTimeString()}`, margin, y);
    y += 12;
    
    // Performance Summary box
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.rect(margin, y, contentWidth, 22, 'FD');
    
    doc.setTextColor(15, 23, 42);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('BATCH SUMMARY PROFILE', margin + 5, y + 6);
    
    doc.setTextColor(71, 85, 105);
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(8.5);
    const successCount = results.filter(r => r.status === 'success').length;
    const errorCount = results.filter(r => r.status === 'error').length;
    doc.text(`Total Entries Loaded: ${results.length}`, margin + 5, y + 12);
    doc.text(`Successfully Analyzed: ${successCount} node(s)`, margin + 70, y + 12);
    doc.text(`Failed Runs: ${errorCount} node(s)`, margin + 130, y + 12);
    y += 32;

    // Detailed Individual Entries
    doc.setTextColor(15, 23, 42);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('PROCESSED INDIVIDUAL RESULTS REPORT', margin, y);
    y += 8;
    
    results.forEach((r, idx) => {
      checkPageBreak(50);
      
      // Index Label Box
      doc.setFillColor(15, 23, 42);
      doc.rect(margin, y, 10, 6, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(8);
      doc.text(String(idx + 1), margin + 3.5, y + 4.2);
      
      doc.setTextColor(15, 23, 42);
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.text('ORIGINAL INPUT ENTRY:', margin + 13, y + 4.5);
      y += 8;
      
      // Wrap query text
      doc.setTextColor(80, 80, 80);
      doc.setFont('Helvetica', 'italic');
      doc.setFontSize(8.5);
      const queryLines = doc.splitTextToSize(`"${r.entry.trim()}"`, contentWidth - 4);
      checkPageBreak(queryLines.length * 4.5 + 4);
      doc.text(queryLines, margin + 2, y);
      y += (queryLines.length * 4.5) + 6;
      
      // Render Content based on success
      if (r.status === 'success' && r.content) {
        if (taskType === 'BOOLEAN_SEARCH') {
          // Boolean search PDF block
          let queryStr = r.content;
          let notes = r.explanation || '';
          try {
            const parsed = JSON.parse(r.content);
            queryStr = parsed.query || queryStr;
            notes = parsed.explanation || notes;
          } catch(e) {}
          
          doc.setFillColor(240, 253, 250); // soft teal/greenish card
          doc.setDrawColor(204, 251, 241);
          
          const wrappedQuery = doc.splitTextToSize(queryStr, contentWidth - 10);
          const blockHeight = wrappedQuery.length * 4.5 + 10;
          checkPageBreak(blockHeight + 15);
          
          doc.rect(margin, y, contentWidth, blockHeight, 'FD');
          doc.setTextColor(13, 148, 136);
          doc.setFont('Helvetica', 'bold');
          doc.setFontSize(8);
          doc.text('GENERATED BOOLEAN QUERY:', margin + 5, y + 5);
          
          doc.setTextColor(15, 23, 42);
          doc.setFont('Helvetica', 'normal');
          doc.setFontSize(8.5);
          doc.text(wrappedQuery, margin + 5, y + 10);
          y += blockHeight + 6;
          
          if (notes) {
            checkPageBreak(30);
            doc.setTextColor(100, 116, 139);
            doc.setFont('Helvetica', 'bold');
            doc.setFontSize(8);
            doc.text('STRATEGY AND SYNTAX ANALYSIS', margin + 2, y);
            y += 4;
            
            doc.setTextColor(51, 65, 85);
            doc.setFont('Helvetica', 'normal');
            doc.setFontSize(8);
            const wrappedExp = doc.splitTextToSize(notes, contentWidth - 4);
            checkPageBreak(wrappedExp.length * 4);
            doc.text(wrappedExp, margin + 2, y);
            y += (wrappedExp.length * 4) + 12;
          } else {
            y += 6;
          }
        } else {
          // Data extraction PDF block
          let material = 'N/A', fab = 'N/A', porosity = 'N/A', mechanical = 'N/A', degradation = 'N/A', bio = 'N/A';
          try {
            const parsed = JSON.parse(r.content);
            material = parsed.material_composition || material;
            fab = parsed.fabrication_method || fab;
            porosity = parsed.quantitative_properties?.porosity || porosity;
            mechanical = parsed.quantitative_properties?.mechanical_strength || mechanical;
            degradation = parsed.quantitative_properties?.degradation_rate || degradation;
            bio = parsed.biological_result || bio;
          } catch(e) {}
          
          // Draw metadata table
          checkPageBreak(40);
          doc.setDrawColor(226, 232, 240);
          doc.setFillColor(248, 250, 252);
          doc.rect(margin, y, contentWidth, 24, 'FD');
          
          doc.setTextColor(100, 116, 139);
          doc.setFont('Helvetica', 'bold');
          doc.setFontSize(7.5);
          doc.text('FABRICATION & COMPOSITION', margin + 4, y + 4);
          doc.text('QUANTITATIVE LAB PROPERTIES', margin + 90, y + 4);
          
          doc.setTextColor(15, 23, 42);
          doc.setFont('Helvetica', 'normal');
          doc.setFontSize(8);
          doc.text(`Material: ${material}`, margin + 4, y + 10);
          doc.text(`Fabrication: ${fab}`, margin + 4, y + 16);
          
          doc.text(`Porosity: ${porosity}`, margin + 90, y + 10);
          doc.text(`Strength: ${mechanical}`, margin + 90, y + 15);
          doc.text(`Degradation: ${degradation}`, margin + 90, y + 20);
          y += 28;
          
          checkPageBreak(25);
          doc.setFillColor(240, 253, 250);
          doc.rect(margin, y, contentWidth, 14, 'F');
          
          doc.setTextColor(13, 148, 136);
          doc.setFont('Helvetica', 'bold');
          doc.setFontSize(7.5);
          doc.text('BIOLOGICAL ACTION SUMMARY', margin + 4, y + 4.2);
          
          doc.setTextColor(15, 23, 42);
          doc.setFont('Helvetica', 'normal');
          doc.setFontSize(8);
          const wrappedBio = doc.splitTextToSize(bio, contentWidth - 8);
          doc.text(wrappedBio, margin + 4, y + 8.5);
          y += 20;
        }
      } else if (r.status === 'error') {
        doc.setFillColor(254, 242, 242);
        doc.setDrawColor(252, 165, 165);
        checkPageBreak(16);
        doc.rect(margin, y, contentWidth, 12, 'FD');
        doc.setTextColor(220, 38, 38);
        doc.setFont('Helvetica', 'bold');
        doc.setFontSize(8.5);
        doc.text(`Pipeline Fault Error: ${r.error || 'Connection Failed'}`, margin + 4, y + 7);
        y += 18;
      } else {
        doc.setTextColor(100, 116, 139);
        doc.setFont('Helvetica', 'italic');
        doc.setFontSize(8.5);
        doc.text('Status: Processing and API constraints skipped this row.', margin + 2, y);
        y += 10;
      }
      
      // Divider
      doc.setDrawColor(241, 245, 249);
      doc.line(margin, y - 2, margin + contentWidth, y - 2);
      y += 6;
    });
    
    doc.save(`bio_batch_study_${Date.now()}.pdf`);
    showToast('Batch PDF document drafted and downloaded.', 'success');
  };

  const handleCopyText = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
    showToast('Copied content to clipboard', 'success');
  };

  return (
    <div className="w-full grid gap-8 animate-in fade-in duration-300">
      
      {/* Intro Config Box */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm grid gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="flex items-center gap-3">
             <div className="p-2.5 bg-teal-50 text-teal-600 rounded-2xl border border-teal-100">
                 <Layers className="w-6 h-6" />
             </div>
             <div>
                <h3 className="text-xl font-bold text-slate-800 tracking-tight font-tech">Batch Processing Center</h3>
                <p className="text-xs text-slate-400 font-medium">Inject bulk studies and queue sequential processing pipelines</p>
             </div>
          </div>
          
          <div className="flex items-center gap-3">
             <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{t('mode.BATCH_PROCESSOR.desc')}</span>
             <span className="bg-teal-50 border border-teal-100 text-teal-700 text-[10px] font-bold uppercase tracking-[0.15em] px-2.5 py-1 rounded-full">v2.1 Parallel Stack</span>
          </div>
        </div>

        {/* Configurations Forms Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          
          {/* File Upload / Input (7 cols) */}
          <div className="md:col-span-8 flex flex-col gap-4">
             <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Input Entries List</span>
                {entries.length > 0 && (
                  <span className="bg-slate-100 border border-slate-200 text-slate-600 text-xs font-bold uppercase py-0.5 px-2 rounded">
                    {entries.length} Loaded Item(s)
                  </span>
                )}
             </div>

             {/* Drag Drop Area */}
             <div 
               onDragOver={handleDragOver}
               onDragLeave={handleDragLeave}
               onDrop={handleDrop}
               onClick={() => !isProcessing && fileInputRef.current?.click()}
               className={`
                 border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-300 flex flex-col items-center justify-center
                 ${isDragging 
                   ? 'border-teal-500 bg-teal-50/20' 
                   : 'border-slate-300 hover:border-teal-400 hover:bg-slate-50/20'}
                 ${isProcessing ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}
               `}
             >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleFileLoad(f);
                  }}
                  accept=".csv,.txt,.json"
                  className="hidden" 
                />
                <Upload className="w-8 h-8 text-slate-400 mb-2 hover:text-teal-500 transition-colors" />
                <p className="text-xs font-bold text-slate-600">Drag & Drop research file here</p>
                <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider">Supports CSV, JSON, TXT (One entry per line)</p>
                {fileName && (
                  <p className="mt-3 text-xs bg-slate-900 text-white rounded font-bold px-2 py-1 flex items-center gap-1.5 animate-bounce">
                    <FileText className="w-3.5 h-3.5 text-teal-400" />
                    {fileName}
                  </p>
                )}
             </div>

             <div className="relative">
                <textarea
                  ref={textareaRef}
                  value={rawText}
                  onChange={handleTextChange}
                  placeholder="Or paste multiple research topics or abstracts here... (Separate each topic with a new line)"
                  className="w-full p-4 h-32 rounded-2xl border border-slate-200 text-sm autofocus-none outline-none focus:ring-1 focus:ring-teal-500 focus:border-transparent transition-all"
                  disabled={isProcessing}
                />
                {entries.length > 0 && (
                  <button 
                    onClick={handleClear} 
                    className="absolute bottom-3 right-3 p-1.5 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded transition-all"
                    title="Clear entries"
                  >
                     <Trash2 className="w-4 h-4" />
                  </button>
                )}
             </div>
          </div>

          {/* Controls Config (4 cols) */}
          <div className="md:col-span-4 bg-slate-50 border border-slate-100 rounded-3xl p-5 flex flex-col gap-5">
             <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Processor Pipeline Output</h4>
                <div className="grid gap-2">
                   <button
                     onClick={() => !isProcessing && setTaskType('BOOLEAN_SEARCH')}
                     className={`
                       w-full flex items-center justify-between p-3.5 rounded-xl border text-left transition-all font-tech text-sm
                       ${taskType === 'BOOLEAN_SEARCH' 
                         ? 'bg-teal-600 text-white border-teal-700 shadow-md ring-1 ring-black/5' 
                         : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100/50'}
                       ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}
                     `}
                   >
                     <div className="flex items-center gap-2">
                        <Layers className="w-4 h-4" />
                        <span className="font-bold">Boolean Queries</span>
                     </div>
                     <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${taskType === 'BOOLEAN_SEARCH' ? 'bg-white/20' : 'bg-slate-100'}`}>PubMed Syntax</span>
                   </button>
                   
                   <button
                     onClick={() => !isProcessing && setTaskType('DATA_EXTRACTION')}
                     className={`
                       w-full flex items-center justify-between p-3.5 rounded-xl border text-left transition-all font-tech text-sm
                       ${taskType === 'DATA_EXTRACTION' 
                         ? 'bg-teal-600 text-white border-teal-700 shadow-md ring-1 ring-black/5' 
                         : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100/50'}
                       ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}
                     `}
                   >
                     <div className="flex items-center gap-2">
                        <Activity className="w-4 h-4" />
                        <span className="font-bold">Data Extraction</span>
                     </div>
                     <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${taskType === 'DATA_EXTRACTION' ? 'bg-white/20' : 'bg-slate-100'}`}>Quant Gaps</span>
                   </button>
                </div>
             </div>

             {taskType === 'DATA_EXTRACTION' && (
               <div className="flex items-center justify-between border-t border-slate-200 pt-4">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-tight flex items-center gap-1">
                     <BrainCircuit className="w-3.5 h-3.5 text-teal-600" />
                     Deep Clinical Reasoning
                  </span>
                  
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={useThinking} 
                      onChange={(e) => setUseThinking(e.target.checked)} 
                      className="sr-only peer" 
                      disabled={isProcessing}
                    />
                    <div className="w-8 h-4 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-teal-600"></div>
                  </label>
               </div>
             )}

             <button
               onClick={handleStartProcessing}
               disabled={isProcessing || entries.length === 0}
               className={`
                 w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold shadow-lg text-sm uppercase tracking-wider transition-all duration-200
                 ${isProcessing || entries.length === 0
                   ? 'bg-slate-100 text-slate-400 shadow-none cursor-not-allowed'
                   : 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white hover:shadow-xl hover:shadow-teal-100 active:scale-95'}
               `}
             >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Executing Pipeline {processingIndex + 1}/{entries.length}</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 text-white" />
                    <span>Run Batch Processor</span>
                  </>
                )}
             </button>
          </div>

        </div>
      </div>

      {/* Progress display overlay */}
      {isProcessing && (
         <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-2xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6 animate-pulse">
            <div className="absolute -right-12 -bottom-12 w-32 h-32 bg-teal-500/10 rounded-full blur-2xl" />
            
            <div className="flex items-center gap-4">
               <div className="p-3 bg-teal-500/20 rounded-full border border-teal-500/30 text-teal-400">
                  <Loader2 className="w-6 h-6 animate-spin" />
               </div>
               <div>
                  <h4 className="text-sm font-bold uppercase tracking-[0.2em] text-teal-400">Pipeline Synchronization Live</h4>
                  <p className="text-lg font-bold mt-1 text-slate-100">Processing Entry {processingIndex + 1} of {entries.length}</p>
                  <p className="text-xs text-slate-400 font-medium truncate max-w-sm mt-0.5 mt-1">Focusing: "{entries[processingIndex]}"</p>
               </div>
            </div>
            
            <div className="w-full md:w-64">
               <div className="flex justify-between text-xs text-slate-300 mb-1 font-mono">
                  <span>Progress Scale</span>
                  <span>{Math.round(((processingIndex + 1) / entries.length) * 100)}%</span>
               </div>
               <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-teal-500 transition-all duration-300" 
                    style={{ width: `${((processingIndex + 1) / entries.length) * 100}%` }}
                  />
               </div>
            </div>
         </div>
      )}

      {/* Results Workspace Dashboard */}
      {results.length > 0 && (
         <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-md">
            
            {/* Header with quick bulk down options */}
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
               <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-teal-600" />
                  <h3 className="font-bold text-slate-800 text-sm">Batch Output Directory</h3>
               </div>
               
               <div className="flex flex-wrap gap-2">
                  <button 
                    onClick={exportCSV}
                    disabled={isProcessing}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-widest rounded-lg shadow-sm transition-all disabled:opacity-50"
                  >
                     <Download className="w-3.5 h-3.5 text-teal-500" />
                     <span>Export CSV</span>
                  </button>
                  
                  <button 
                    onClick={exportJSON}
                    disabled={isProcessing}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-widest rounded-lg shadow-sm transition-all disabled:opacity-50"
                  >
                     <Download className="w-3.5 h-3.5 text-emerald-500" />
                     <span>Export JSON</span>
                  </button>
                  
                  <button 
                    onClick={exportPDF}
                    disabled={isProcessing}
                    className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white border border-slate-950 font-bold uppercase text-[10px] tracking-widest rounded-lg shadow-md transition-all disabled:opacity-50"
                  >
                     <FileText className="w-3.5 h-3.5 text-teal-400 animate-pulse" />
                     <span>Export Detailed PDF</span>
                  </button>
               </div>
            </div>

            {/* Layout divided: Index on left, tabs panels on right */}
            <div className="grid grid-cols-1 md:grid-cols-12 min-h-[450px]">
               
               {/* Index Sidebar list */}
               <div className="md:col-span-4 border-r border-slate-200 select-none max-h-[500px] overflow-y-auto no-scrollbar">
                  <div className="bg-slate-50/50 p-4 border-b border-slate-100 flex items-center justify-between">
                     <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Entry Catalog</span>
                     <span className="bg-slate-200 text-slate-700 text-[9px] font-bold py-0.5 px-1.5 rounded-full">
                       {results.length} Nodes
                     </span>
                  </div>
                  
                  <button
                    onClick={() => setActiveTab(-1)}
                    className={`
                      w-full text-left p-4 border-b border-slate-100 transition-all flex items-center gap-2 font-tech text-xs uppercase tracking-wider
                      ${activeTab === -1 ? 'bg-teal-50/45 border-l-4 border-l-teal-600 text-teal-900 font-bold' : 'text-slate-600 hover:bg-slate-50/80'}
                    `}
                  >
                     <Layers className="w-3.5 h-3.5 text-teal-600" />
                     <span>Overview Dashboard</span>
                  </button>
                  
                  <div className="divide-y divide-slate-100">
                     {results.map((r, index) => {
                       const isSelected = activeTab === index;
                       return (
                         <button
                           key={index}
                           onClick={() => setActiveTab(index)}
                           className={`
                             w-full text-left p-4.5 transition-all flex items-start gap-3 border-l-4 text-xs
                             ${isSelected 
                               ? 'bg-teal-50/20 border-l-teal-600 font-medium text-teal-950' 
                               : 'bg-transparent border-l-transparent text-slate-600 hover:bg-slate-50/45'}
                           `}
                         >
                           <span className={`inline-flex items-center justify-center shrink-0 w-5 h-5 rounded-md text-[10px] font-bold font-mono ${isSelected ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                              {index + 1}
                           </span>
                           <div className="min-w-0 flex-1">
                              <p className={`truncate font-medium text-xs ${isSelected ? 'text-slate-900 font-bold' : 'text-slate-700'}`}>
                                 {r.entry}
                              </p>
                              
                              <div className="flex items-center justify-between text-[10px] font-bold tracking-wide uppercase mt-1">
                                 {r.status === 'success' && (
                                    <span className="text-emerald-600 flex items-center gap-1">
                                       <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Success
                                    </span>
                                 )}
                                 {r.status === 'error' && (
                                    <span className="text-red-500 flex items-center gap-1">
                                       <XCircle className="w-3 h-3 text-red-500" /> Pipeline fault
                                    </span>
                                 )}
                                 {r.status === 'processing' && (
                                    <span className="text-teal-600 flex items-center gap-1 font-bold animate-pulse">
                                       <Loader2 className="w-3 h-3 animate-spin text-teal-500" /> active
                                    </span>
                                 )}
                                 {r.status === 'pending' && (
                                    <span className="text-slate-400 font-medium">Pending queue</span>
                                 )}
                              </div>
                           </div>
                         </button>
                       );
                     })}
                  </div>
               </div>

               {/* Active Panel View */}
               <div className="md:col-span-8 p-6 bg-slate-50/35 overflow-y-auto max-h-[500px]">
                  
                  {activeTab === -1 ? (
                     // SUMMARY DASHBOARD
                     <div className="space-y-6">
                        <div>
                           <h4 className="text-lg font-bold text-slate-800 tracking-tight font-tech">Pipeline Execution Report</h4>
                           <p className="text-xs text-slate-400 mt-0.5">Overall status review, health matrices and export capabilities</p>
                        </div>
                        
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                           <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm text-center">
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Queue Size</p>
                              <p className="text-2xl font-bold text-slate-800 font-mono">{results.length}</p>
                           </div>
                           <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm text-center">
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 text-emerald-600">Success</p>
                              <p className="text-2xl font-bold text-emerald-600 font-mono">
                                 {results.filter(r => r.status === 'success').length}
                              </p>
                           </div>
                           <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm text-center">
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 text-red-500">Failed</p>
                              <p className="text-2xl font-bold text-red-500 font-mono">
                                 {results.filter(r => r.status === 'error').length}
                              </p>
                           </div>
                           <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm text-center">
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 text-teal-600">Pending</p>
                              <p className="text-2xl font-bold text-teal-600 font-mono">
                                 {results.filter(r => r.status === 'pending' || r.status === 'processing').length}
                              </p>
                           </div>
                        </div>

                        {/* Staggered row card links list */}
                        <div className="space-y-3 pt-2">
                           <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Interactive Entries List</h4>
                           {results.map((r, index) => (
                             <div 
                               key={index}
                               onClick={() => setActiveTab(index)}
                               className="bg-white hover:bg-slate-50 rounded-2xl p-4.5 border border-slate-200 shadow-sm flex items-center justify-between cursor-pointer group transition-all duration-200 hover:-translate-y-0.5"
                             >
                                <div className="flex items-center gap-3 min-w-0">
                                   <div className={`shrink-0 w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold font-mono ${r.status === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                                      {index + 1}
                                   </div>
                                   <div className="min-w-0">
                                      <p className="text-sm text-slate-700 font-semibold truncate group-hover:text-teal-900">{r.entry}</p>
                                      <p className="text-[10px] text-slate-400 italic font-medium">Click to study detail analytics</p>
                                   </div>
                                </div>
                                <div className="flex items-center gap-2">
                                   {r.status === 'success' && <span className="bg-emerald-50 border border-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">OK</span>}
                                   {r.status === 'error' && <span className="bg-red-50 border border-red-150 text-red-700 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">Fault</span>}
                                   <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-teal-600 transition-all group-hover:translate-x-0.5" />
                                </div>
                             </div>
                           ))}
                        </div>
                     </div>
                  ) : (
                     // INDIVIDUAL SPECIFIED ENTRY RESULT TAB
                     <div className="space-y-6">
                        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                           <div>
                              <span className="bg-slate-900 text-white rounded font-bold font-mono text-[10px] tracking-widest uppercase px-2 py-0.5">
                                 Node {activeTab + 1} of {results.length}
                              </span>
                              <h4 className="text-md font-bold text-slate-800 tracking-tight mt-1 truncate max-w-md italic font-academic">
                                 "{results[activeTab].entry}"
                              </h4>
                           </div>
                           
                           {/* Quick toggle tab select */}
                           <div className="flex items-center gap-1.5 shrink-0">
                              <button 
                                onClick={() => setActiveTab(prev => Math.max(0, prev - 1))}
                                disabled={activeTab === 0}
                                className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-50 disabled:opacity-40 transition-all font-bold text-xs"
                              >
                                 Prev
                              </button>
                              <button 
                                onClick={() => setActiveTab(prev => Math.min(results.length - 1, prev + 1))}
                                disabled={activeTab === results.length - 1}
                                className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-50 disabled:opacity-40 transition-all font-bold text-xs"
                              >
                                 Next
                              </button>
                           </div>
                        </div>

                        {/* Rendering core generated result details */}
                        {results[activeTab].status === 'success' && results[activeTab].content ? (
                           taskType === 'BOOLEAN_SEARCH' ? (
                             // Render Boolean search query card
                             (() => {
                               let queryVal = results[activeTab].content || '';
                               let stepsExplanation = results[activeTab].explanation || '';
                               
                               try {
                                 const parsed = JSON.parse(results[activeTab].content || '{}');
                                 queryVal = parsed.query || queryVal;
                                 stepsExplanation = parsed.explanation || stepsExplanation;
                               } catch(e) {}
                               
                               return (
                                 <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                   <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                                      <div className="bg-teal-900 px-5 py-3.5 flex justify-between items-center text-white">
                                         <span className="text-xs font-bold uppercase tracking-widest font-tech text-teal-300">Target PubMed syntax query</span>
                                         <button 
                                           onClick={() => handleCopyText(queryVal, activeTab)}
                                           className="p-1.5 hover:bg-white/10 rounded transition-all text-white flex items-center gap-1 font-bold text-[10px] uppercase tracking-wider"
                                         >
                                            {copiedIndex === activeTab ? <ClipboardCheck className="w-3.5 h-3.5 text-teal-400" /> : <Copy className="w-3.5 h-3.5" />}
                                            <span>Copy Code</span>
                                         </button>
                                      </div>
                                      <div className="p-5 bg-slate-950 font-mono text-cyan-400 text-xs leading-relaxed whitespace-pre-wrap select-all break-all selection:bg-teal-900/50">
                                         {queryVal}
                                      </div>
                                   </div>

                                   {stepsExplanation && (
                                     <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm">
                                        <h5 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                                           <BrainCircuit className="w-4 h-4 text-teal-600" /> Code Generation strategy
                                        </h5>
                                        <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">
                                           {stepsExplanation}
                                        </p>
                                     </div>
                                   )}
                                 </div>
                               );
                             })()
                           ) : (
                             // Render Data Extraction Report card
                             (() => {
                               let material = 'N/A', fab = 'N/A', porosity = 'N/A', strength = 'N/A', degradation = 'N/A', bio = 'N/A';
                               try {
                                 const parsed = JSON.parse(results[activeTab].content || '{}');
                                 material = parsed.material_composition || material;
                                 fab = parsed.fabrication_method || fab;
                                 porosity = parsed.quantitative_properties?.porosity || porosity;
                                 strength = parsed.quantitative_properties?.mechanical_strength || strength;
                                 degradation = parsed.quantitative_properties?.degradation_rate || degradation;
                                 bio = parsed.biological_result || bio;
                               } catch(e) {}
                               
                               const renderVal = (v: string) => v && v !== 'N/A' ? <span className="text-slate-800 font-bold">{v}</span> : <span className="text-slate-400 italic">Not mentioned</span>;

                               return (
                                 <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                       <div className="bg-white rounded-2xl p-4.5 border border-slate-200 shadow-sm flex items-start gap-3">
                                          <div className="p-2 bg-cyan-50 text-cyan-600 rounded-xl border border-cyan-100">
                                             <Layers className="w-4 h-4" />
                                          </div>
                                          <div>
                                             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Composition</span>
                                             <div className="text-sm font-semibold text-slate-900 mt-0.5">{renderVal(material)}</div>
                                          </div>
                                       </div>
                                       
                                       <div className="bg-white rounded-2xl p-4.5 border border-slate-200 shadow-sm flex items-start gap-3">
                                          <div className="p-2 bg-cyan-50 text-cyan-600 rounded-xl border border-cyan-100">
                                             <Settings className="w-4 h-4" />
                                          </div>
                                          <div>
                                             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Fabrication System</span>
                                             <div className="text-sm font-semibold text-slate-900 mt-0.5">{renderVal(fab)}</div>
                                          </div>
                                       </div>
                                    </div>

                                    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                                       <div className="bg-slate-50 px-5 py-3 border-b border-slate-150 flex justify-between items-center text-slate-700">
                                          <span className="text-[10px] font-bold uppercase tracking-widest">Quantitative Matrix Specifications</span>
                                          <span className="text-[9px] font-mono text-slate-400 uppercase">ISO 10993</span>
                                       </div>
                                       <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
                                          <div className="p-5 hover:bg-slate-50/50 transition-colors">
                                             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Porosity</span>
                                             <div className="text-base font-bold text-slate-900">{renderVal(porosity)}</div>
                                          </div>
                                          <div className="p-5 hover:bg-slate-50/50 transition-colors">
                                             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Mechanical Strength</span>
                                             <div className="text-base font-bold text-slate-900">{renderVal(strength)}</div>
                                          </div>
                                          <div className="p-5 hover:bg-slate-50/50 transition-colors">
                                             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Degradation kinetics</span>
                                             <div className="text-base font-bold text-slate-900">{renderVal(degradation)}</div>
                                          </div>
                                       </div>
                                    </div>

                                    <div className="bg-gradient-to-tr from-green-50 to-emerald-50 rounded-3xl p-5 border border-green-150 shadow-sm">
                                       <h5 className="text-green-800 font-bold text-xs uppercase tracking-widest mb-2.5 flex items-center gap-1.5">
                                          <Activity className="w-4 h-4" /> Biological outcomes Summary
                                       </h5>
                                       <p className="text-slate-700 leading-relaxed text-sm">
                                          {renderVal(bio)}
                                       </p>
                                    </div>
                                 </div>
                               );
                             })()
                           )
                        ) : results[activeTab].status === 'error' ? (
                          <div className="bg-red-50 p-6 rounded-3xl border border-red-200 text-red-700 flex flex-col gap-2">
                             <h4 className="flex items-center gap-1.5 font-bold text-sm">
                                <XCircle className="w-5 h-5 text-red-500" />
                                Extraction pipeline faulted
                             </h4>
                             <p className="text-xs opacity-90 leading-relaxed max-w-xl font-medium">
                                The query request returned error code from the network model. This can occur due to service throttling, invalid input contents structure or parameter mismatch.
                             </p>
                             <div className="bg-white/40 border border-red-100 text-red-800 text-[11px] font-mono p-3 rounded-xl break-all">
                                Code message: {results[activeTab].error || 'Unexpected connection drop.'}
                             </div>
                          </div>
                        ) : results[activeTab].status === 'processing' ? (
                           <div className="bg-teal-50/30 py-12 flex flex-col items-center justify-center text-center gap-4 rounded-3xl border border-teal-150">
                              <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
                              <div>
                                 <h4 className="font-bold text-slate-800 text-sm">Pipeline Synchronization Active</h4>
                                 <p className="text-xs text-slate-400 mt-0.5">Contacting model endpoint to analyze research data...</p>
                              </div>
                           </div>
                        ) : (
                           <div className="bg-slate-50 py-12 flex flex-col items-center justify-center text-center gap-2 rounded-3xl border border-slate-200">
                              <Layers className="w-8 h-8 text-slate-300" />
                              <div>
                                 <h4 className="font-bold text-slate-600 text-sm">Item is in Processing Queue</h4>
                                 <p className="text-xs text-slate-400 mt-0.5">This entry will automatically activate once previous synchronization finishes.</p>
                              </div>
                           </div>
                        )}
                     </div>
                  )}

               </div>
               
            </div>
            
         </div>
      )}

    </div>
  );
};
