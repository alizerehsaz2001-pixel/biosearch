import React, { useState, useMemo, useEffect } from 'react';
import { 
  Presentation, Copy, Check, FileText, Code, PieChart, Info, Download, 
  Sparkles, MessageSquare, Layout, ChevronLeft, ChevronRight, Plus, 
  Trash, ArrowUp, ArrowDown, Palette, Edit3, BarChart2, PlusCircle,
  HelpCircle, CheckCircle, RefreshCw
} from 'lucide-react';
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

interface ThemeConfig {
  id: string;
  name: string;
  bgClass: string;          // Tailwind background for the live preview slide
  textTitleClass: string;   // Visual class for slide titles
  textContentClass: string; // Visual class for slide text
  accentBgClass: string;    // Accent badge backgrounds
  accentBorderClass: string;
  accentTextClass: string;
  borderHeaderClass: string; // Theme sub-divider line
  // PPTX generation parameters (Hex without #)
  pptxBg: string;           
  pptxTitleColor: string;
  pptxTextColor: string;
  pptxAccentColor: string;
  fontFace: string;
}

const THEMES: ThemeConfig[] = [
  {
    id: 'academic',
    name: 'Academic Slate',
    bgClass: 'bg-stone-50 border-stone-200 text-slate-800',
    textTitleClass: 'text-slate-900 font-serif border-rose-600',
    textContentClass: 'text-slate-700 font-sans',
    accentBgClass: 'bg-rose-50 border-rose-100 text-rose-700',
    accentBorderClass: 'border-rose-200',
    accentTextClass: 'text-rose-600',
    borderHeaderClass: 'bg-rose-650',
    pptxBg: 'FBFBF9',
    pptxTitleColor: '1E293B',
    pptxTextColor: '475569',
    pptxAccentColor: 'E11D48',
    fontFace: 'Georgia'
  },
  {
    id: 'biotech',
    name: 'Emerald BioTech',
    bgClass: 'bg-emerald-50/20 border-emerald-100 text-emerald-900',
    textTitleClass: 'text-emerald-950 font-sans font-extrabold border-emerald-600',
    textContentClass: 'text-emerald-900 font-sans',
    accentBgClass: 'bg-emerald-50 border-emerald-150 text-emerald-800',
    accentBorderClass: 'border-emerald-200',
    accentTextClass: 'text-emerald-600',
    borderHeaderClass: 'bg-emerald-600',
    pptxBg: 'F4FBF7',
    pptxTitleColor: '064E3B',
    pptxTextColor: '0F5132',
    pptxAccentColor: '10B981',
    fontFace: 'Arial'
  },
  {
    id: 'clinical',
    name: 'Clinical Teal',
    bgClass: 'bg-teal-50/20 border-teal-100 text-slate-800',
    textTitleClass: 'text-teal-950 font-sans font-bold border-teal-500',
    textContentClass: 'text-slate-700 font-sans',
    accentBgClass: 'bg-teal-50 border-teal-100 text-teal-800',
    accentBorderClass: 'border-teal-200',
    accentTextClass: 'text-teal-600',
    borderHeaderClass: 'bg-teal-500',
    pptxBg: 'F0FDFA',
    pptxTitleColor: '115E59',
    pptxTextColor: '334155',
    pptxAccentColor: '14B8A6',
    fontFace: 'Segoe UI'
  },
  {
    id: 'cosmic',
    name: 'Cosmic Dark',
    bgClass: 'bg-slate-900 border-indigo-950 text-slate-100',
    textTitleClass: 'text-cyan-400 font-mono font-bold border-indigo-500',
    textContentClass: 'text-slate-350 font-sans',
    accentBgClass: 'bg-indigo-950 border-indigo-800 text-indigo-300',
    accentBorderClass: 'border-indigo-700',
    accentTextClass: 'text-indigo-400',
    borderHeaderClass: 'bg-cyan-500',
    pptxBg: '0F172A',
    pptxTitleColor: '22D3EE',
    pptxTextColor: 'CBD5E1',
    pptxAccentColor: '818CF8',
    fontFace: 'Helvetica'
  },
  {
    id: 'brutalist',
    name: 'Brutalist Stark',
    bgClass: 'bg-white border-black text-black border-2',
    textTitleClass: 'text-black font-mono font-black border-yellow-500 border-b-2',
    textContentClass: 'text-black font-mono',
    accentBgClass: 'bg-yellow-105 border-black text-black border font-bold',
    accentBorderClass: 'border-black',
    accentTextClass: 'text-black',
    borderHeaderClass: 'bg-black',
    pptxBg: 'FFFFFF',
    pptxTitleColor: '000000',
    pptxTextColor: '000000',
    pptxAccentColor: 'F59E0B',
    fontFace: 'Courier New'
  }
];

const PPTResultCard: React.FC<PPTResultCardProps> = ({ result }) => {
  const [copied, setCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [selectedThemeId, setSelectedThemeId] = useState<string>('academic');
  const [activeSlideIdx, setActiveSlideIdx] = useState<number>(0);
  const [stateData, setStateData] = useState<PPTData | null>(null);
  const [isLiveEditorOpen, setIsLiveEditorOpen] = useState<boolean>(true);
  
  // Parse presentation JSON safely
  useEffect(() => {
    try {
      const rawContent = result.content.replace(/```json\n?|\n?```/g, "").trim();
      const parsed = JSON.parse(rawContent) as PPTData;
      if (parsed && Array.isArray(parsed.slides)) {
        setStateData(parsed);
      }
    } catch (e) {
      // Robust recovery parser if model drops truncated code block
      console.error("Failed to parse PPT JSON", e);
      const cleaned = result.content.match(/```json\s*([\s\S]*?)\s*```/) || result.content.match(/```\s*([\s\S]*?)\s*```/);
      if (cleaned && cleaned[1]) {
        try {
          const parsed = JSON.parse(cleaned[1]) as PPTData;
          if (parsed && Array.isArray(parsed.slides)) {
            setStateData(parsed);
            return;
          }
        } catch {
          // ignore
        }
      }
      
      // Fallback manual construct if parsing collapses
      setStateData({
        presentation_title: "Biomaterials & Mechanical Integration Matrix",
        presentation_author: "Translational BioSearch Lab",
        presentation_theme: "Industrial",
        slides: [
          {
            title: "Executive Synthesis & Scaffold Matrix Overview",
            layout: "title_and_content",
            content: [
              "Investigating composite hydrogel formulations under local strain indices.",
              "Tailoring physical pore parameters to enable cellular vascularization.",
              "Optimizing mechanical thresholds to resist premature enzymatic failure."
            ],
            visual_description: "3D model schematic of pore structure showing nutrient exchange",
            speaker_notes: "Welcome, colleagues. Today we trace computational models mapped against wet-lab experimental cell counts."
          }
        ]
      });
    }
  }, [result.content]);

  const activeTheme = useMemo(() => {
    return THEMES.find(t => t.id === selectedThemeId) || THEMES[0];
  }, [selectedThemeId]);

  const currentSlide = useMemo(() => {
    if (!stateData || !stateData.slides) return null;
    return stateData.slides[activeSlideIdx] || stateData.slides[0] || null;
  }, [stateData, activeSlideIdx]);

  const handleCopyJSON = () => {
    if (!stateData) return;
    navigator.clipboard.writeText(JSON.stringify(stateData, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // PPTX Generation with PPTXGenJS using custom selected designer themes
  const handleDownloadPPTX = async () => {
    if (!stateData) return;
    setIsDownloading(true);

    try {
      const pres = new pptxgen();
      
      // Set presentation properties
      pres.title = stateData.presentation_title;
      pres.author = stateData.presentation_author || "Biomaterials Research Architect";
      pres.layout = "LAYOUT_16x9"; // Premium modern widescreen

      // Theme configuration settings
      const themeColors = activeTheme;

      // 1. Generate Title Slide
      const titleSlide = pres.addSlide();
      titleSlide.background = { color: themeColors.pptxBg };
      
      // Decorative Title Accent Block
      titleSlide.addShape(pres.ShapeType.rect, { 
        x: 0, y: 0, w: '100%', h: 0.15, 
        fill: { color: themeColors.pptxAccentColor } 
      });

      titleSlide.addText(stateData.presentation_title.toUpperCase(), {
        x: 0.8, y: "30%", w: 11.5, align: "left",
        fontSize: 38, color: themeColors.pptxTitleColor, bold: true, 
        fontFace: themeColors.fontFace
      });

      if (stateData.presentation_author) {
        titleSlide.addText(`${stateData.presentation_author}  |  Scientific Communications`, {
          x: 0.8, y: "52%", w: 11.5, align: "left",
          fontSize: 18, color: themeColors.pptxTextColor, fontFace: themeColors.fontFace,
          italic: true
        });
      }

      // 2. Generate Content Slides
      stateData.slides.forEach((slideData, idx) => {
        const slide = pres.addSlide();
        
        // Background color & Accent Banner
        slide.background = { color: themeColors.pptxBg };
        
        slide.addShape(pres.ShapeType.rect, { 
          x: 0, y: 0, w: '100%', h: 0.35, 
          fill: { color: themeColors.pptxTitleColor } 
        });

        // Add Slide Title in dark header band
        slide.addText(slideData.title.toUpperCase(), {
          x: 0.6, y: 0.05, w: 12.0, h: 0.25,
          fontSize: 16, color: "FFFFFF", bold: true, fontFace: themeColors.fontFace
        });

        // Layout Routing
        const hasChart = slideData.chart_data && slideData.chart_data.labels && slideData.chart_data.labels.length > 0;
        const hasVisual = !!slideData.visual_description;

        if (slideData.layout === 'chart_and_text' || hasChart) {
          // Render Left side text bullets, Right side Native Chart!
          if (slideData.content && slideData.content.length > 0) {
            slide.addText(
              slideData.content.map(bullet => ({ text: `• ${bullet}`, options: { breakLine: true } })),
              { 
                x: 0.6, y: 0.8, w: 6.0, h: 5.5, 
                fontSize: 13, color: themeColors.pptxTextColor, 
                fontFace: themeColors.fontFace, lineSpacing: 22 
              }
            );
          }

          // Native presentation chart insert
          if (slideData.chart_data) {
            try {
              const nativeChartData = [
                {
                  name: slideData.title,
                  labels: slideData.chart_data.labels,
                  values: slideData.chart_data.values
                }
              ];
              // Map local types to pptxgen chart types
              let chartType = pres.ChartType.bar;
              if (slideData.chart_data.type === 'line') chartType = pres.ChartType.line;
              if (slideData.chart_data.type === 'pie') chartType = pres.ChartType.pie;

              slide.addChart(chartType, nativeChartData, {
                x: 7.0, y: 1.0, w: 5.5, h: 4.8,
                showLegend: true,
                chartColors: [themeColors.pptxAccentColor, '1E293B', '64748B', '94A3B8', 'CBD5E1']
              });
            } catch (chartErr) {
              console.error("Native chart export error:", chartErr);
              // Fallback block shape
              slide.addShape(pres.ShapeType.rect, { 
                x: 7.0, y: 1.2, w: 5.2, h: 4.4, 
                fill: { color: "F1F5F9" }, line: { color: themeColors.pptxAccentColor, width: 1.5 } 
              });
              slide.addText(`[Data Viz Fallback:\n${slideData.chart_data.labels.join(', ')}\nValues: ${slideData.chart_data.values.join(', ')}]`, {
                x: 7.2, y: 2.2, w: 4.8, h: 2.4, align: "center", fontSize: 11, color: "475569"
              });
            }
          }
        } 
        else if (slideData.layout === 'two_column' || hasVisual) {
          // Left column bullets
          if (slideData.content && slideData.content.length > 0) {
            slide.addText(
              slideData.content.map(bullet => ({ text: `• ${bullet}`, options: { breakLine: true } })),
              { 
                x: 0.6, y: 0.8, w: 6.2, h: 5.5, 
                fontSize: 13, color: themeColors.pptxTextColor, 
                fontFace: themeColors.fontFace, lineSpacing: 22 
              }
            );
          }

          // Right column visual mock block
          slide.addShape(pres.ShapeType.rect, { 
            x: 7.2, y: 1.2, w: 5.0, h: 4.4, 
            fill: { color: "F8FAFC" }, line: { color: "E2E8F0", width: 1.5 } 
          });

          slide.addText(`VISUAL SCHEMATIC SUGGESTION`, {
            x: 7.2, y: 1.4, w: 5.0, h: 0.4, align: "center", bold: true, fontSize: 10, color: themeColors.pptxAccentColor
          });

          slide.addText(slideData.visual_description || "High-resolution diagram representing study parameters.", {
            x: 7.4, y: 2.2, w: 4.6, h: 3.0, align: "center", fontSize: 10.5, color: "475569", 
            fontFace: themeColors.fontFace
          });
        } 
        else {
          // Standard full-width clean text layout
          if (slideData.content && slideData.content.length > 0) {
            slide.addText(
              slideData.content.map(bullet => ({ text: `• ${bullet}`, options: { breakLine: true } })),
              { 
                x: 0.8, y: 1.0, w: 11.5, h: 5.0, 
                fontSize: 14.5, color: themeColors.pptxTextColor, 
                fontFace: themeColors.fontFace, lineSpacing: 25 
              }
            );
          }
        }

        // Add Slide numbers and clean footer to each slide
        slide.addText(`Slide ${idx + 1} of ${stateData.slides.length}  |  ${stateData.presentation_title}`, {
          x: 0.6, y: 6.9, w: 11.5, h: 0.3,
          fontSize: 8.5, color: "94A3B8", fontFace: themeColors.fontFace
        });

        // Add Speaker Notes to slide properties
        if (slideData.speaker_notes) {
          slide.addNotes(slideData.speaker_notes);
        }
      });

      // Export presentation down to browser client
      const fileSafeName = stateData.presentation_title.replace(/[^\w\s-]/gi, '').trim().substring(0, 48);
      pres.writeFile({ fileName: `Studio_PPT-${fileSafeName}.pptx` });

    } catch (err) {
      console.error("Failed to compile PPTX output binary", err);
    } finally {
      setIsDownloading(false);
    }
  };

  // Mutative content editor actions
  const updateSlideTitle = (newVal: string) => {
    if (!stateData) return;
    setStateData(prev => {
      if (!prev) return null;
      const copy = { ...prev };
      copy.slides = [...copy.slides];
      copy.slides[activeSlideIdx] = { ...copy.slides[activeSlideIdx], title: newVal };
      return copy;
    });
  };

  const updateSlideLayout = (newLayout: string) => {
    if (!stateData) return;
    setStateData(prev => {
      if (!prev) return null;
      const copy = { ...prev };
      copy.slides = [...copy.slides];
      copy.slides[activeSlideIdx] = { ...copy.slides[activeSlideIdx], layout: newLayout };
      return copy;
    });
  };

  const updateBulletText = (bIdx: number, newVal: string) => {
    if (!stateData || !currentSlide) return;
    setStateData(prev => {
      if (!prev) return null;
      const copy = { ...prev };
      copy.slides = [...copy.slides];
      const sCopy = { ...copy.slides[activeSlideIdx] };
      const contentCopy = [...sCopy.content];
      contentCopy[bIdx] = newVal;
      sCopy.content = contentCopy;
      copy.slides[activeSlideIdx] = sCopy;
      return copy;
    });
  };

  const addBulletPoint = () => {
    if (!stateData || !currentSlide) return;
    setStateData(prev => {
      if (!prev) return null;
      const copy = { ...prev };
      copy.slides = [...copy.slides];
      const sCopy = { ...copy.slides[activeSlideIdx] };
      sCopy.content = [...sCopy.content, "New study milestone or scientific parameter statement."];
      copy.slides[activeSlideIdx] = sCopy;
      return copy;
    });
  };

  const deleteBulletPoint = (bIdx: number) => {
    if (!stateData || !currentSlide) return;
    setStateData(prev => {
      if (!prev) return null;
      const copy = { ...prev };
      copy.slides = [...copy.slides];
      const sCopy = { ...copy.slides[activeSlideIdx] };
      sCopy.content = sCopy.content.filter((_, i) => i !== bIdx);
      copy.slides[activeSlideIdx] = sCopy;
      return copy;
    });
  };

  const moveBulletUp = (bIdx: number) => {
    if (!stateData || !currentSlide || bIdx === 0) return;
    setStateData(prev => {
      if (!prev) return null;
      const copy = { ...prev };
      copy.slides = [...copy.slides];
      const sCopy = { ...copy.slides[activeSlideIdx] };
      const bullets = [...sCopy.content];
      const temp = bullets[bIdx - 1];
      bullets[bIdx - 1] = bullets[bIdx];
      bullets[bIdx] = temp;
      sCopy.content = bullets;
      copy.slides[activeSlideIdx] = sCopy;
      return copy;
    });
  };

  const moveBulletDown = (bIdx: number) => {
    if (!stateData || !currentSlide) return;
    if (bIdx === currentSlide.content.length - 1) return;
    setStateData(prev => {
      if (!prev) return null;
      const copy = { ...prev };
      copy.slides = [...copy.slides];
      const sCopy = { ...copy.slides[activeSlideIdx] };
      const bullets = [...sCopy.content];
      const temp = bullets[bIdx + 1];
      bullets[bIdx + 1] = bullets[bIdx];
      bullets[bIdx] = temp;
      sCopy.content = bullets;
      copy.slides[activeSlideIdx] = sCopy;
      return copy;
    });
  };

  const updateVisualMock = (newText: string) => {
    if (!stateData) return;
    setStateData(prev => {
      if (!prev) return null;
      const copy = { ...prev };
      copy.slides = [...copy.slides];
      copy.slides[activeSlideIdx] = { ...copy.slides[activeSlideIdx], visual_description: newText };
      return copy;
    });
  };

  const updateSpeakerNotes = (newNotes: string) => {
    if (!stateData) return;
    setStateData(prev => {
      if (!prev) return null;
      const copy = { ...prev };
      copy.slides = [...copy.slides];
      copy.slides[activeSlideIdx] = { ...copy.slides[activeSlideIdx], speaker_notes: newNotes };
      return copy;
    });
  };

  // Presentation Level Actions (Add, Delete, Duplicate, Re-order)
  const createNewEmptySlide = () => {
    if (!stateData) return;
    setStateData(prev => {
      if (!prev) return null;
      const copy = { ...prev };
      const newSlide: SlideData = {
        title: "New Investigation Slide Profile",
        layout: "title_and_content",
        content: [
          "Enter quantitative analysis and sample measurements.",
          "Describe correlation between scaffold design and cellular proliferation."
        ],
        visual_description: "Suggested conceptual diagram of mechanical testing configuration"
      };
      
      const slides = [...copy.slides];
      slides.splice(activeSlideIdx + 1, 0, newSlide);
      copy.slides = slides;
      return copy;
    });
    setActiveSlideIdx(prev => prev + 1);
  };

  const deleteCurrentSlide = () => {
    if (!stateData) return;
    if (stateData.slides.length <= 1) return; // Prevent draining outline
    
    setStateData(prev => {
      if (!prev) return null;
      const copy = { ...prev };
      copy.slides = copy.slides.filter((_, i) => i !== activeSlideIdx);
      return copy;
    });

    setActiveSlideIdx(prev => Math.max(0, prev - 1));
  };

  const duplicateCurrentSlide = () => {
    if (!stateData || !currentSlide) return;
    setStateData(prev => {
      if (!prev) return null;
      const copy = { ...prev };
      const duplicated: SlideData = JSON.parse(JSON.stringify(currentSlide));
      duplicated.title = `${duplicated.title} (Copy)`;
      const slides = [...copy.slides];
      slides.splice(activeSlideIdx + 1, 0, duplicated);
      copy.slides = slides;
      return copy;
    });
    setActiveSlideIdx(prev => prev + 1);
  };

  const moveSlideLeft = () => {
    if (activeSlideIdx === 0 || !stateData) return;
    setStateData(prev => {
      if (!prev) return null;
      const copy = { ...prev };
      const slides = [...copy.slides];
      const temp = slides[activeSlideIdx - 1];
      slides[activeSlideIdx - 1] = slides[activeSlideIdx];
      slides[activeSlideIdx] = temp;
      copy.slides = slides;
      return copy;
    });
    setActiveSlideIdx(prev => prev - 1);
  };

  const moveSlideRight = () => {
    if (!stateData) return;
    if (activeSlideIdx === stateData.slides.length - 1) return;
    setStateData(prev => {
      if (!prev) return null;
      const copy = { ...prev };
      const slides = [...copy.slides];
      const temp = slides[activeSlideIdx + 1];
      slides[activeSlideIdx + 1] = slides[activeSlideIdx];
      slides[activeSlideIdx] = temp;
      copy.slides = slides;
      return copy;
    });
    setActiveSlideIdx(prev => prev + 1);
  };

  // Edit native chart values inside selected slide
  const handleChartLabelEdit = (labelI: number, val: string) => {
    if (!stateData || !currentSlide || !currentSlide.chart_data) return;
    setStateData(prev => {
      if (!prev) return null;
      const copy = { ...prev };
      const curr = { ...copy.slides[activeSlideIdx] };
      if (curr.chart_data) {
        const labels = [...curr.chart_data.labels];
        labels[labelI] = val;
        curr.chart_data = { ...curr.chart_data, labels };
      }
      copy.slides[activeSlideIdx] = curr;
      return copy;
    });
  };

  const handleChartValueEdit = (valI: number, numVal: number) => {
    if (!stateData || !currentSlide) return;
    setStateData(prev => {
      if (!prev) return null;
      const copy = { ...prev };
      const curr = { ...copy.slides[activeSlideIdx] };
      if (curr.chart_data) {
        const values = [...curr.chart_data.values];
        values[valI] = numVal;
        curr.chart_data = { ...curr.chart_data, values };
      }
      copy.slides[activeSlideIdx] = curr;
      return copy;
    });
  };

  const addChartElement = () => {
    if (!stateData || !currentSlide) return;
    setStateData(prev => {
      if (!prev) return null;
      const copy = { ...prev };
      const curr = { ...copy.slides[activeSlideIdx] };
      if (curr.chart_data) {
        curr.chart_data = {
          ...curr.chart_data,
          labels: [...curr.chart_data.labels, "New Variable"],
          values: [...curr.chart_data.values, 50]
        };
      } else {
        // Create base chart template
        curr.chart_data = {
          type: "bar",
          labels: ["Control", "Test Form-A", "Test Form-B"],
          values: [25, 75, 90]
        };
      }
      copy.slides[activeSlideIdx] = curr;
      return copy;
    });
  };

  const deleteChartElement = (i: number) => {
    if (!stateData || !currentSlide || !currentSlide.chart_data) return;
    setStateData(prev => {
      if (!prev) return null;
      const copy = { ...prev };
      const curr = { ...copy.slides[activeSlideIdx] };
      if (curr.chart_data) {
        const labels = curr.chart_data.labels.filter((_, idx) => idx !== i);
        const values = curr.chart_data.values.filter((_, idx) => idx !== i);
        curr.chart_data = { ...curr.chart_data, labels, values };
      }
      copy.slides[activeSlideIdx] = curr;
      return copy;
    });
  };

  const hasChartDataIdx = currentSlide?.chart_data && currentSlide.chart_data.labels && currentSlide.chart_data.labels.length > 0;

  if (!stateData || !currentSlide) {
    return (
      <div className="bg-red-50 border border-red-200 p-8 rounded-xl text-center">
        <Info className="w-8 h-8 text-red-650 mx-auto mb-2 animate-bounce" />
        <p className="text-red-700 font-bold text-sm">Failed to initialize PPT workspace.</p>
        <p className="text-red-550 text-xs mt-1">Please re-generate the presentation blueprint or try another query.</p>
      </div>
    );
  }

  return (
    <div className="w-full bg-slate-100 rounded-3xl shadow-xl border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* 1. Header Area */}
      <div className="bg-slate-900 text-white px-6 py-5 border-b border-slate-800 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1 bg-clip-text">
            <div className="bg-amber-500/10 p-2 rounded-xl text-amber-500 border border-amber-500/20">
              <Presentation className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight font-sans tracking-wide">
                BioSearch PPT Slide Architect & Studio
              </h3>
              <p className="text-[10px] text-zinc-400 font-mono tracking-widest uppercase">
                ACADEMIC PRESENTATION ENGINE / EDITABLE MASTER CANVAS
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
          {/* Active theme dropdown selector */}
          <div className="flex items-center gap-1.5 bg-slate-800 border border-slate-755 px-2.5 py-1.5 rounded-xl shrink-0">
            <Palette className="w-3.5 h-3.5 text-amber-400" />
            <select
              id="theme-select"
              value={selectedThemeId}
              onChange={(e) => setSelectedThemeId(e.target.value)}
              className="bg-transparent border-none text-xs font-bold text-amber-200 focus:ring-0 cursor-pointer outline-none w-[110px]"
            >
              {THEMES.map(th => (
                <option key={th.id} value={th.id} className="bg-slate-900 text-white font-sans text-xs">
                  {th.name}
                </option>
              ))}
            </select>
          </div>

          <button
            id="editor-toggle-btn"
            onClick={() => setIsLiveEditorOpen(!isLiveEditorOpen)}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all shadow-sm ${
              isLiveEditorOpen 
                ? 'bg-slate-700 text-amber-200 border border-slate-600' 
                : 'bg-slate-800 text-slate-300 border border-slate-700 hover:text-white'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>{isLiveEditorOpen ? 'Hide Editor' : 'Show Live Editor'}</span>
          </button>

          <button 
            id="copy-json-btn"
            onClick={handleCopyJSON}
            className="bg-slate-800 hover:bg-slate-700 border border-slate-700 p-2 rounded-xl text-slate-350 hover:text-white transition-colors"
            title="Copy Outline JSON"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>

          <button 
            id="pptx-download-btn"
            onClick={handleDownloadPPTX}
            disabled={isDownloading}
            className="flex-1 lg:flex-none flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-700 text-white font-bold px-4.5 py-2.0 rounded-xl text-xs shadow-md transition-all active:scale-95 disabled:opacity-50"
          >
            {isDownloading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
            <span>{isDownloading ? 'Structuring...' : 'Download PPT Deck'}</span>
          </button>
        </div>
      </div>

      {/* 2. Slide Navigation Filmstrip Grid */}
      <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex items-center gap-3 overflow-x-auto select-none font-sans justify-start">
        {stateData.slides.map((slide, idx) => (
          <button
            key={idx}
            id={`filmstrip-slide-${idx}`}
            onClick={() => setActiveSlideIdx(idx)}
            className={`flex flex-col p-2.5 rounded-xl border-2 transition-all text-left min-w-[130px] max-w-[150px] shrink-0 relative ${
              activeSlideIdx === idx 
                ? 'border-amber-500 bg-slate-850 shadow-md scale-105' 
                : 'border-slate-800 bg-slate-900/50 hover:border-slate-700 hover:bg-slate-900'
            }`}
          >
            <div className="flex justify-between items-center mb-1 text-[9px] font-mono font-extrabold text-slate-450 uppercase shrink-0">
              <span>SLIDE 0{idx + 1}</span>
              <span className="text-[8px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-300 font-bold border border-slate-700">
                {slide.layout.toUpperCase().replace('_', ' ')}
              </span>
            </div>
            
            <p className="text-[10px] font-bold text-white truncate shrink-0 w-full">
              {slide.title}
            </p>
          </button>
        ))}

        <button
          id="btn-add-slide-mini"
          onClick={createNewEmptySlide}
          className="flex flex-col items-center justify-center p-3.5 rounded-xl border-2 border-dashed border-slate-800 hover:border-slate-600 bg-slate-900/20 text-slate-500 hover:text-amber-500 min-w-[130px] shrink-0 hover:bg-slate-900/40 transition-all cursor-pointer h-[50px] font-bold text-[10px] uppercase gap-1.5"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add Slide</span>
        </button>
      </div>

      {/* 3. Primary Workspace Area - Configured dynamically as single-column or interactive dual-column layout */}
      <div className="p-6 grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        
        {/* Left Section: Real-Time high-fidelity mockup workspace (Takes 7 or 12 cols dependent on editing mode) */}
        <div className={`${isLiveEditorOpen ? 'xl:col-span-7' : 'xl:col-span-12'} flex flex-col gap-4 w-full`}>
          
          {/* Timeline and Arrangement toolbar */}
          <div className="bg-white p-3.5 border border-slate-200.5 rounded-2xl flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-1">
              <span className="text-xs font-mono font-black text-slate-400 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded">
                STAGE {activeSlideIdx + 1} / {stateData.slides.length}
              </span>
              <div className="h-4 w-[1px] bg-slate-200 mx-2" />
              <span className="text-xs text-slate-600 font-bold tracking-tight bg-slate-50 border border-slate-150 px-2.5 py-0.5 rounded">
                Theme: <span className="text-amber-600">{activeTheme.name}</span>
              </span>
            </div>

            {/* Presentation manipulation buttons */}
            <div className="flex items-center gap-1.5">
              <button
                id="slide-up-btn"
                onClick={moveSlideLeft}
                disabled={activeSlideIdx === 0}
                className="bg-white hover:bg-slate-50 border border-slate-200 p-1.5 rounded-xl text-slate-500 disabled:opacity-30 disabled:pointer-events-none"
                title="Shift Slide Sequence Up"
              >
                <ArrowUp className="w-3.5 h-3.5" />
              </button>
              
              <button
                id="slide-down-btn"
                onClick={moveSlideRight}
                disabled={activeSlideIdx === stateData.slides.length - 1}
                className="bg-white hover:bg-slate-50 border border-slate-200 p-1.5 rounded-xl text-slate-500 disabled:opacity-30 disabled:pointer-events-none"
                title="Shift Slide Sequence Down"
              >
                <ArrowDown className="w-3.5 h-3.5" />
              </button>

              <div className="h-4 w-[1px] bg-slate-200 mx-1.5" />

              <button
                id="slide-duplicate-btn"
                onClick={duplicateCurrentSlide}
                className="bg-white hover:bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-xl text-xs font-bold text-slate-600 flex items-center gap-1 shadow-sm"
                title="Duplicate Current Layout Frame"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Dup</span>
              </button>

              <button
                id="slide-delete-btn"
                onClick={deleteCurrentSlide}
                disabled={stateData.slides.length <= 1}
                className="bg-rose-50 hover:bg-rose-100 border border-rose-100 px-2.5 py-1.5 rounded-xl text-xs font-bold text-rose-600 disabled:opacity-35 disabled:pointer-events-none flex items-center gap-1"
                title="Remove Selected Slide"
              >
                <Trash className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            </div>
          </div>

          {/* Premium Presentation Frame - Strictly styled to mimic actual widescreen physical slides in 16:9 ratio */}
          <div className="w-full relative shadow-md">
            
            <div className={`w-full aspect-[16/9] ${activeTheme.bgClass} rounded-2xl border p-8 flex flex-col justify-between transition-all duration-300 overflow-hidden relative shadow-lg`}>
              
              {/* Header section with brand accent line */}
              <div className="shrink-0">
                <div className="flex justify-between items-center mb-1.5">
                  <h4 className={`text-sm sm:text-lg md:text-xl font-bold tracking-tight uppercase select-none w-full truncate ${activeTheme.textTitleClass}`}>
                    {currentSlide.title}
                  </h4>
                </div>
                {/* Visual Accent Rule */}
                <div className={`w-full h-0.5 mb-4 ${activeTheme.borderHeaderClass}`} />
              </div>

              {/* Dynamic Content grid depending directly on slide layout parameters */}
              <div className="flex-1 min-h-0 flex gap-4 overflow-hidden py-1.5 items-stretch">
                
                {/* LAYOUT: CHART & TEXT */}
                {(currentSlide.layout === 'chart_and_text' || hasChartDataIdx) ? (
                  <div className="grid grid-cols-12 gap-4 w-full items-stretch">
                    
                    {/* Left Column Bullet items */}
                    <div className="col-span-7 flex flex-col justify-center">
                      <ul className="space-y-2 max-h-[170px] overflow-y-auto pr-1">
                        {currentSlide.content.map((point, pIdx) => (
                          <li key={pIdx} className={`text-2xs sm:text-xs md:text-[13px] leading-relaxed flex items-start gap-1.5 font-semibold ${activeTheme.textContentClass}`}>
                            <span className="text-amber-500 font-bold">•</span>
                            <span>{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Right Column Dynamic CSS Chart */}
                    <div className="col-span-5 bg-white/70 border border-slate-200/50 rounded-xl p-3 flex flex-col justify-between items-stretch shadow-inner text-slate-800">
                      <div className="text-[8px] font-bold text-slate-400 uppercase tracking-widest block text-center border-b pb-1">
                        DYNAMIC SIMULATED READOUT ({currentSlide.chart_data?.type.toUpperCase() || 'DATA'})
                      </div>
                      
                      <div className="flex-1 flex flex-col justify-center gap-1.5 py-1">
                        {currentSlide.chart_data?.labels.map((lbl, lIdx) => {
                          const valStr = currentSlide.chart_data?.values[lIdx] || 0;
                          return (
                            <div key={lIdx} className="space-y-0.5">
                              <div className="flex justify-between text-[7px] sm:text-[9px] font-bold text-slate-600">
                                <span className="truncate max-w-[80px]">{lbl}</span>
                                <span>{valStr}%</span>
                              </div>
                              <div className="w-full bg-slate-100 rounded-full h-1 border overflow-hidden">
                                <div 
                                  className="h-full bg-amber-500 rounded-full transition-all duration-500"
                                  style={{ width: `${Math.min(100, Math.max(0, valStr))}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <span className="text-[7px] text-slate-400 italic text-center text-2xs block">
                        Double-click or edit values on the right dashboard pane.
                      </span>
                    </div>

                  </div>
                ) : (currentSlide.layout === 'two_column' || !!currentSlide.visual_description) ? (
                  /* LAYOUT: TWO COLUMN (Text Left, Schematic Visual Right) */
                  <div className="grid grid-cols-12 gap-5 w-full items-stretch">
                    
                    {/* Left Column */}
                    <div className="col-span-7 flex flex-col justify-center">
                      <ul className="space-y-2.5 max-h-[175px] overflow-y-auto pr-1">
                        {currentSlide.content.map((point, pIdx) => (
                          <li key={pIdx} className={`text-2xs sm:text-xs md:text-[13.5px] leading-relaxed flex items-start gap-1.5 font-semibold ${activeTheme.textContentClass}`}>
                            <span className="text-rose-500 font-bold">•</span>
                            <span>{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Right Column Custom Scientific Schematic Mock */}
                    <div className="col-span-5 bg-white/70 border border-slate-200/50 rounded-xl p-3 flex flex-col justify-center items-center text-center shadow-inner relative gap-2">
                      <div className="bg-slate-150 text-amber-600 p-1.5 rounded-full border border-slate-250">
                        <Sparkles className="w-5 h-5" />
                      </div>
                      <span className="text-[7.5px] font-mono font-black text-slate-400 tracking-wider uppercase block">
                        Visual Schematic Mockup
                      </span>
                      <p className="text-[9px] text-slate-500 leading-snug font-semibold max-w-[130px] line-clamp-4">
                        {currentSlide.visual_description || "Suggestion: Model schematic display."}
                      </p>
                    </div>

                  </div>
                ) : (
                  /* LAYOUT: STANDARD WIDESCREEN FULL-WIDTH LIST */
                  <div className="w-full flex flex-col justify-center">
                    <ul className="space-y-3 max-h-[180px] overflow-y-auto pr-1">
                      {currentSlide.content.map((point, pIdx) => (
                        <li key={pIdx} className={`text-2xs sm:text-xs md:text-sm leading-relaxed flex items-start gap-2 font-semibold ${activeTheme.textContentClass}`}>
                          <span className="text-amber-500 font-bold">•</span>
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

              </div>

              {/* Slide stamp footer */}
              <div className="shrink-0 flex justify-between items-center text-[7px] sm:text-[9.5px] font-mono text-slate-400 border-t pt-2 border-slate-200/30">
                <span className="font-semibold uppercase tracking-wider truncate max-w-[200px]">
                  {stateData.presentation_title}
                </span>
                <span className="font-bold">
                  SLIDE {activeSlideIdx + 1} OF {stateData.slides.length}
                </span>
              </div>

            </div>

          </div>

          {/* Presenter speaker notes prompt display */}
          <div className="bg-white p-4 border border-rose-100 rounded-2xl shadow-sm text-xs">
            <div className="flex items-center gap-1.5 font-bold uppercase tracking-wide mb-2 text-rose-700">
              <MessageSquare className="w-3.5 h-3.5" />
              <span>PRESENTER SPEAKING script / NOTES</span>
            </div>
            
            <p className="font-medium text-slate-650 italic leading-relaxed whitespace-pre-wrap bg-rose-50/20 p-3 rounded-lg border border-pink-50 text-[12.5px]">
              {currentSlide.speaker_notes ? `"${currentSlide.speaker_notes}"` : '"No notes prepared for this slide. Speak naturally based on the points illustrated above."'}
            </p>
          </div>

        </div>

        {/* Right Section: Active Slide Editor Dashboard (Exposed dynamically if toggle is on) */}
        {isLiveEditorOpen && (
          <div className="xl:col-span-5 bg-white p-5 border border-slate-200 rounded-3xl space-y-5 shadow-sm overflow-y-auto max-h-[640px] animate-in slide-in-from-right-4 duration-300">
            
            {/* Action Card Label */}
            <div className="border-b pb-3 border-slate-100">
              <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
                <Edit3 className="w-3.5 h-3.5 text-rose-500" />
                <span>Active Slide Actions & Parameters</span>
              </h4>
              <p className="text-[10px] text-slate-400 mt-1">
                Customize values directly inside the outline to construct your perfect deck layout.
              </p>
            </div>

            {/* 1. Slide Title Input field */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">
                Slide Header / Title
              </label>
              <input
                id="edit-slide-title"
                type="text"
                value={currentSlide.title}
                onChange={(e) => updateSlideTitle(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-1 focus:ring-amber-400 font-semibold text-slate-800"
                placeholder="Enter slide content header"
              />
            </div>

            {/* 2. Slide Layout Toggle selectors */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">
                Structural Slide Layout
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: 'title_and_content', label: 'Standard Text', icon: FileText },
                  { id: 'two_column', label: 'Two Column', icon: Layout },
                  { id: 'chart_and_text', label: 'Chart Data', icon: PieChart }
                ].map(lay => (
                  <button
                    key={lay.id}
                    id={`layout-toggle-${lay.id}`}
                    onClick={() => updateSlideLayout(lay.id)}
                    className={`p-2 rounded-xl border text-[10px] font-bold flex flex-col items-center justify-center gap-1 transition-all ${
                      currentSlide.layout === lay.id 
                        ? 'border-amber-500 bg-amber-50 text-amber-800 font-extrabold' 
                        : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    <lay.icon className="w-3.5 h-3.5" />
                    <span>{lay.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Bullet list content items section with custom operators (Add, Delete, up, down) */}
            <div className="space-y-2">
              <div className="flex justify-between items-center mb-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">
                  Core Bullet milestones
                </label>
                <button
                  id="add-bullet-btn"
                  onClick={addBulletPoint}
                  className="bg-amber-50 hover:bg-amber-100 border border-amber-100 text-amber-700 px-2 py-1 rounded-lg text-[9px] font-bold flex items-center gap-1 shadow-sm transition-all"
                >
                  <Plus className="w-3 h-3" />
                  <span>Insert Milestone</span>
                </button>
              </div>

              <div className="space-y-2">
                {currentSlide.content.map((pointText, bIdx) => (
                  <div key={bIdx} className="group flex items-start gap-1.5 border border-slate-100 p-2.5 rounded-xl bg-slate-50/50">
                    <span className="text-[9px] font-mono font-bold text-slate-400 bg-white border border-slate-200 w-5 h-5 rounded flex items-center justify-center shrink-0 mt-0.5">
                      0{bIdx + 1}
                    </span>
                    
                    <textarea
                      id={`edit-bullet-${bIdx}`}
                      value={pointText}
                      onChange={(e) => updateBulletText(bIdx, e.target.value)}
                      rows={2}
                      className="flex-1 bg-white border border-slate-150 px-2 py-1 rounded-lg text-xs leading-normal outline-none focus:ring-1 focus:ring-amber-400 text-slate-700"
                    />

                    {/* Bullet modifications panel */}
                    <div className="flex flex-col gap-1 shrink-0">
                      <button
                        id={`bullet-up-${bIdx}`}
                        onClick={() => moveBulletUp(bIdx)}
                        disabled={bIdx === 0}
                        className="bg-white hover:bg-slate-100 border p-0.5 rounded text-slate-400 disabled:opacity-25"
                      >
                        <ArrowUp className="w-3 h-3" />
                      </button>
                      <button
                        id={`bullet-down-${bIdx}`}
                        onClick={() => moveBulletDown(bIdx)}
                        disabled={bIdx === currentSlide.content.length - 1}
                        className="bg-white hover:bg-slate-100 border p-0.5 rounded text-slate-400 disabled:opacity-25"
                      >
                        <ArrowDown className="w-3 h-3" />
                      </button>
                      <button
                        id={`bullet-del-${bIdx}`}
                        onClick={() => deleteBulletPoint(bIdx)}
                        className="bg-white hover:bg-rose-50 border border-slate-150 hover:border-rose-200 p-0.5 rounded text-slate-450 hover:text-rose-600"
                      >
                        <Trash className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 4. Chart configuration section (Visible only if layout has charts) */}
            {(currentSlide.layout === 'chart_and_text' || hasChartDataIdx) && (
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1">
                    <BarChart2 className="w-3.5 h-3.5 text-amber-500" />
                    <span>Configure Visual Dataset Metrics</span>
                  </label>
                  <button
                    id="add-chart-metric-btn"
                    onClick={addChartElement}
                    className="bg-slate-150 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded-lg text-[9px] font-bold flex items-center gap-1 shadow-xs"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Metric</span>
                  </button>
                </div>

                <div className="space-y-1.5">
                  {currentSlide.chart_data?.labels.map((lbl, i) => {
                    const numVal = currentSlide.chart_data?.values[i] || 0;
                    return (
                      <div key={i} className="flex gap-1.5 items-center">
                        <input
                          id={`edit-chart-lbl-${i}`}
                          type="text"
                          value={lbl}
                          onChange={(e) => handleChartLabelEdit(i, e.target.value)}
                          className="w-1/2 px-2.5 py-1 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none font-semibold text-slate-700"
                          placeholder="Category Label"
                        />
                        <input
                          id={`edit-chart-val-${i}`}
                          type="number"
                          value={numVal}
                          onChange={(e) => handleChartValueEdit(i, parseFloat(e.target.value) || 0)}
                          className="w-1/4 px-2.5 py-1 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none font-mono text-right font-bold text-emerald-600"
                          placeholder="%"
                          min="0"
                          max="100"
                        />
                        <button
                          id={`chart-metric-del-${i}`}
                          onClick={() => deleteChartElement(i)}
                          className="bg-white hover:bg-rose-50 border border-slate-150 hover:border-rose-250 p-1.5 rounded-lg text-slate-400 hover:text-rose-600 shrink-0"
                          title="Remove Category"
                        >
                          <Trash className="w-3 h-3" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 5. Custom Visual description suggestion input */}
            {(currentSlide.layout === 'two_column' || !!currentSlide.visual_description) && (
              <div className="space-y-1 pt-2 border-t border-slate-100">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">
                  Interactive Visual Asset Suggestion
                </label>
                <textarea
                  id="edit-visual-desc"
                  value={currentSlide.visual_description || ""}
                  onChange={(e) => updateVisualMock(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-1 focus:ring-amber-400 text-slate-700"
                  placeholder="e.g. 3D rendered polymer scaffold structure displaying pore diffusion"
                />
              </div>
            )}

            {/* 6. Presenter notes input text zone */}
            <div className="space-y-1 pt-2 border-t border-slate-100">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">
                Presenter speaking script
              </label>
              <textarea
                id="edit-speaker-notes"
                value={currentSlide.speaker_notes || ""}
                onChange={(e) => updateSpeakerNotes(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 text-xs bg-rose-50/15 border border-rose-100 rounded-lg outline-none focus:ring-1 focus:ring-amber-400 text-slate-755 leading-relaxed italic"
                placeholder="Enter speaker key narratives"
              />
            </div>

          </div>
        )}

      </div>

    </div>
  );
};

export default PPTResultCard;
