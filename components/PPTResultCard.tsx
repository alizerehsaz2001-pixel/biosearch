import React, { useState } from 'react';
import { Presentation, Copy, Check, FileText, Code, PieChart, Info, Download, Sparkles, MessageSquare, Layout } from 'lucide-react';
import { SearchResult } from '../types';
import pptxgen from "pptxgenjs";

interface SlideData {
  title: string;
  layout: string;
  content: string[];
  visual_description?: string;
  chart_data?: {
    type: string;
    labels: string[];
    values: number[];
  };
  speaker_notes?: string;
}

interface PPTData {
  presentation_title: string;
  presentation_author?: string;
  presentation_theme?: string;
  slides: SlideData[];
}

interface PPTResultCardProps {
  result: SearchResult;
}

const PPTResultCard: React.FC<PPTResultCardProps> = ({ result }) => {
  const [copied, setCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  let data: PPTData | null = null;
  try {
    const rawContent = result.content.replace(/```json\n?|\n?```/g, "").trim();
    data = JSON.parse(rawContent);
  } catch (e) {
    console.error("Failed to parse PPT JSON", e);
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = async () => {
    if (!data) return;
    setIsDownloading(true);

    try {
      const pres = new pptxgen();
      pres.title = data.presentation_title;
      pres.author = data.presentation_author || "Biomaterials Research Architect";

      // Title Slide
      const titleSlide = pres.addSlide();
      titleSlide.background = { color: "F8FAFC" };
      titleSlide.addText(data.presentation_title, {
        x: 0, y: "30%", w: "100%", align: "center",
        fontSize: 44, color: "1E293B", bold: true, fontFace: "Arial"
      });
      if (data.presentation_author) {
        titleSlide.addText(data.presentation_author, {
          x: 0, y: "50%", w: "100%", align: "center",
          fontSize: 24, color: "64748B", fontFace: "Arial"
        });
      }

      // Content Slides
      data.slides.forEach(slideData => {
        const slide = pres.addSlide();
        
        // Add Title
        slide.addText(slideData.title, {
          x: 0.5, y: 0.5, w: 9, h: 1,
          fontSize: 32, color: "0F172A", bold: true, fontFace: "Arial"
        });

        // Add Content
        if (slideData.content && slideData.content.length > 0) {
          slide.addText(
            slideData.content.map(point => ({ text: point, options: { bullet: true, indentLevel: 0 } })),
            { x: 0.5, y: 1.5, w: 9, h: 4, fontSize: 18, color: "334155", fontFace: "Arial" }
          );
        }

        // Add Speaker Notes
        if (slideData.speaker_notes) {
          slide.addNotes(slideData.speaker_notes);
        }

        // Placeholder for Visuals
        if (slideData.visual_description) {
           slide.addShape(pres.ShapeType.rect, { x: 6, y: 2, w: 3, h: 3, fill: { color: "F1F5F9" }, line: { color: "CBD5E1", width: 1 } });
           slide.addText(`[Visual Suggested: ${slideData.visual_description}]`, {
             x: 6, y: 2.5, w: 3, h: 2, align: "center", fontSize: 12, color: "94A3B8"
           });
        }
      });

      pres.writeFile({ fileName: `${data.presentation_title.replace(/[^\w\s]/gi, '')}.pptx` });
    } catch (error) {
      console.error("Error generating PPTX:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  if (!data) {
    return (
      <div className="bg-red-50 border border-red-200 p-4 rounded-xl text-red-700 text-sm">
        Error: Could not render presentation data. Please try again.
      </div>
    );
  }

  return (
    <div className="w-full bg-white rounded-2xl shadow-lg border border-amber-200 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 px-6 py-4 border-b border-amber-100 flex justify-between items-center">
        <div className="flex items-center gap-2">
            <div className="bg-white p-1.5 rounded-md shadow-sm border border-amber-100 text-amber-600">
                <Presentation className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm leading-tight font-tech tracking-tight">{data.presentation_title}</h3>
              <p className="text-[10px] text-amber-700/70 font-bold uppercase tracking-widest">{data.presentation_theme || 'Scientific'} Design Template</p>
            </div>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={handleCopy}
            className="p-2 hover:bg-white/50 rounded-lg transition-colors text-slate-500 hover:text-amber-600"
            title="Copy JSON Data"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          </button>
          <button 
            onClick={handleDownload}
            disabled={isDownloading}
            className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-4 py-1.5 rounded-lg text-xs font-bold shadow-sm transition-all active:scale-95 disabled:opacity-50"
          >
            {isDownloading ? <Sparkles className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
            {isDownloading ? 'Generating...' : 'Download (.pptx)'}
          </button>
        </div>
      </div>
      
      <div className="p-6">
        <div className="mb-8 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between border-b border-slate-100 pb-6">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Presenter</span>
            <p className="text-sm font-bold text-slate-700">{data.presentation_author || 'Research Architect AI'}</p>
          </div>
          <div className="flex gap-3">
             <div className="bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Slides</span>
                <span className="text-sm font-bold text-slate-700">{data.slides.length}</span>
             </div>
             <div className="bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Format</span>
                <span className="text-sm font-bold text-slate-700">Widescreen 16:9</span>
             </div>
          </div>
        </div>

        <div className="space-y-8">
          {data.slides.map((slide, idx) => (
            <div key={idx} className="group relative">
               <div className="absolute -left-3 top-0 bottom-0 w-1 bg-amber-200 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
               
               <div className="flex items-start gap-4 mb-3">
                  <div className="bg-slate-900 text-white text-[10px] font-bold w-6 h-6 rounded flex items-center justify-center shrink-0 mt-1 shadow-sm">
                    {idx + 1}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-bold text-slate-900 mb-4 group-hover:text-amber-700 transition-colors">
                      {slide.title}
                    </h4>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 mb-2">
                             <FileText className="w-3 h-3" /> Bullet Points
                          </span>
                          <ul className="space-y-2">
                            {slide.content.map((point, pIdx) => (
                              <li key={pIdx} className="text-sm text-slate-700 flex items-start gap-2">
                                <span className="text-amber-500 font-bold mt-0.5">•</span>
                                {point}
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        {slide.speaker_notes && (
                          <div className="bg-amber-50/30 p-4 rounded-xl border border-amber-100/50">
                             <span className="text-[10px] font-bold text-amber-800 uppercase tracking-widest flex items-center gap-1.5 mb-2">
                               <MessageSquare className="w-3 h-3" /> Speaker Notes
                             </span>
                             <p className="text-sm text-amber-900 italic font-medium leading-relaxed">
                               {slide.speaker_notes}
                             </p>
                          </div>
                        )}
                      </div>

                      <div className="space-y-4">
                         <div className="bg-white border-2 border-dashed border-slate-200 rounded-xl p-6 flex flex-col items-center justify-center text-center min-h-[160px]">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 mb-3">
                               <Layout className="w-3 h-3" /> Visual Strategy
                            </span>
                            <div className="bg-slate-50 p-3 rounded-full mb-3">
                               {slide.chart_data ? <PieChart className="w-6 h-6 text-indigo-500" /> : <Sparkles className="w-6 h-6 text-amber-500" />}
                            </div>
                            <p className="text-xs text-slate-500 font-medium max-w-[200px]">
                               {slide.visual_description || "Suggestion: High-resolution schematic or results figure."}
                            </p>
                            {slide.chart_data && (
                               <div className="mt-3 text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100 uppercase">
                                  {slide.chart_data.type} Chart Suggested
                               </div>
                            )}
                         </div>
                      </div>
                    </div>
                  </div>
               </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PPTResultCard;