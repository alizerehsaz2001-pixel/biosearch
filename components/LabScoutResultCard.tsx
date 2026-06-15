import React, { useState, useMemo, useEffect } from 'react';
import { 
  GraduationCap, MapPin, FlaskConical, BookOpen, Search, Copy, Check, Globe, 
  Link as LinkIcon, User, ExternalLink, Star, Tag, Mail, Trash, Bookmark, 
  SlidersHorizontal, ChevronDown, ChevronUp, FileSpreadsheet, FileText, CheckCircle2, 
  RotateCcw, Building, Send, Heart, Eye
} from 'lucide-react';
import { SearchResult } from '../types';

interface LabScoutResultCardProps {
  result: SearchResult;
}

interface LabData {
  name: string;
  university: string;
  university_ranking?: string;
  pi: string;
  city: string;
  country: string;
  address: string;
  match_score: number;
  expertise_focus: string;
  collaboration_potential: string;
  recent_breakthrough: string;
  website: string;
  tech_stack: string[];
  contact_strategy?: string;
}

interface LabScoutData {
  region_summary: {
    title: string;
    landscape: string;
    top_institutions: string[];
  };
  labs: LabData[];
}

const LabScoutResultCard: React.FC<LabScoutResultCardProps> = ({ result }) => {
  const [copied, setCopied] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [minMatchFilter, setMinMatchFilter] = useState(0);
  const [selectedTechFilters, setSelectedTechFilters] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'match' | 'rank' | 'pi' | 'university'>('match');
  const [showBookmarkedOnly, setShowBookmarkedOnly] = useState(false);
  
  // Bookmarks tracked via localStorage for persistent research notes
  const [bookmarkedLabs, setBookmarkedLabs] = useState<Record<string, boolean>>(() => {
    try {
      const stored = localStorage.getItem('labscout_bookmarks_v2');
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  // Lab Notes tracked locally
  const [labNotes, setLabNotes] = useState<Record<string, string>>(() => {
    try {
      const stored = localStorage.getItem('labscout_notes_v2');
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  // Track active interactive panels for Outreach Drafter
  const [activeDrafterLabIdx, setActiveDrafterLabIdx] = useState<number | null>(null);
  const [outreachGoal, setOutreachGoal] = useState<'postdoc' | 'collab' | 'phd' | 'sabbatical'>('collab');
  const [outreachName, setOutreachName] = useState('Dr. Alex Mercer');
  const [outreachAffiliation, setOutreachAffiliation] = useState('Institute of Biomaterials');
  
  const [copiedEmailMap, setCopiedEmailMap] = useState<Record<number, boolean>>({});

  // Persist bookmarks whenever modified
  useEffect(() => {
    localStorage.setItem('labscout_bookmarks_v2', JSON.stringify(bookmarkedLabs));
  }, [bookmarkedLabs]);

  // Persist notes whenever modified
  useEffect(() => {
    localStorage.setItem('labscout_notes_v2', JSON.stringify(labNotes));
  }, [labNotes]);

  const handleCopy = () => {
    navigator.clipboard.writeText(result.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const parseJson = (str: string): LabScoutData | null => {
    try {
      // Clean leading and trailing JSON ticks
      const cleansed = str.replace(/```json\n?|\n?```/g, "").trim();
      return JSON.parse(cleansed);
    } catch (e) {
      // Try block recovery extraction
      const jsonMatch = str.match(/```json\s*([\s\S]*?)\s*```/) || str.match(/```\s*([\s\S]*?)\s*```/);
      if (jsonMatch && jsonMatch[1]) {
        try {
          return JSON.parse(jsonMatch[1]);
        } catch {
          return null;
        }
      }
      return null;
    }
  };

  const data = useMemo(() => parseJson(result.content), [result.content]);

  // Toggle single tech parameter filtering
  const handleToggleTechFilter = (tech: string) => {
    setSelectedTechFilters(prev => 
      prev.includes(tech) ? prev.filter(t => t !== tech) : [...prev, tech]
    );
  };

  // Reset all analytical filter states
  const handleClearFilters = () => {
    setSearchTerm('');
    setMinMatchFilter(0);
    setSelectedTechFilters([]);
    setShowBookmarkedOnly(false);
  };

  const allAvailableTechTags = useMemo(() => {
    if (!data || !data.labs) return [];
    const techSet = new Set<string>();
    data.labs.forEach(lab => {
      if (Array.isArray(lab.tech_stack)) {
        lab.tech_stack.forEach(tech => techSet.add(tech));
      }
    });
    return Array.from(techSet).sort();
  }, [data]);

  // Process, filter, search, & sort the labs array cleanly
  const filteredAndSortedLabs = useMemo(() => {
    if (!data || !data.labs) return [];
    
    let labsCopy = [...data.labs];

    // 1. Text Search Filter (PI, Name, University, Expertise Focus)
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim();
      labsCopy = labsCopy.filter(lab => 
        (lab.name && lab.name.toLowerCase().includes(q)) ||
        (lab.pi && lab.pi.toLowerCase().includes(q)) ||
        (lab.university && lab.university.toLowerCase().includes(q)) ||
        (lab.expertise_focus && lab.expertise_focus.toLowerCase().includes(q)) ||
        (lab.city && lab.city.toLowerCase().includes(q)) ||
        (lab.country && lab.country.toLowerCase().includes(q))
      );
    }

    // 2. Minimum Match Score Filter
    if (minMatchFilter > 0) {
      labsCopy = labsCopy.filter(lab => lab.match_score >= minMatchFilter);
    }

    // 3. Tech Tag click selections
    if (selectedTechFilters.length > 0) {
      labsCopy = labsCopy.filter(lab => 
        selectedTechFilters.every(selectedTech => 
          lab.tech_stack && lab.tech_stack.includes(selectedTech)
        )
      );
    }

    // 4. Bookmarked Only filter
    if (showBookmarkedOnly) {
      labsCopy = labsCopy.filter(lab => !!bookmarkedLabs[lab.pi + "_" + lab.university]);
    }

    // 5. Sorting metrics routing
    labsCopy.sort((a, b) => {
      if (sortBy === 'match') {
        return b.match_score - a.match_score;
      }
      if (sortBy === 'rank') {
        const rankA = parseInt(a.university_ranking?.replace(/\D/g, '') || '9999');
        const rankB = parseInt(b.university_ranking?.replace(/\D/g, '') || '9999');
        return rankA - rankB; // Lower rank numbers are better (e.g. 45 < 200)
      }
      if (sortBy === 'pi') {
        return (a.pi || '').localeCompare(b.pi || '');
      }
      if (sortBy === 'university') {
        return (a.university || '').localeCompare(b.university || '');
      }
      return 0;
    });

    return labsCopy;
  }, [data, searchTerm, minMatchFilter, selectedTechFilters, sortBy, showBookmarkedOnly, bookmarkedLabs]);

  // Toggle bookmarks
  const toggleBookmark = (pi: string, uni: string) => {
    const key = `${pi}_${uni}`;
    setBookmarkedLabs(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Change notes
  const updateLabNote = (pi: string, uni: string, txt: string) => {
    const key = `${pi}_${uni}`;
    setLabNotes(prev => ({
      ...prev,
      [key]: txt
    }));
  };

  // Outreach Template Generator
  const generateOutreachBody = (lab: LabData) => {
    const techHighlight = lab.tech_stack.slice(0, 3).join(', ');
    const breakthroughText = lab.recent_breakthrough ? `regarding "${lab.recent_breakthrough}"` : `in translational biomaterials science`;
    
    switch (outreachGoal) {
      case 'postdoc':
        return `Subject: Postdoctoral Fellowship Inquiry - Lab of Dr. ${lab.pi || '[PI Name]'}

Dear Dr. ${lab.pi},

I hope this message finds you well. I have been following the pioneering research coming out of your center, the ${lab.name || 'laboratory'}, at ${lab.university}. In particular, I was highly inspired by your recent breakthrough ${breakthroughText}.

As an active researcher in the field of scientific engineering and materials synthesis, my background aligns closely with your use of ${techHighlight}. I am extremely interested in potential postdoctoral opportunities in your group. My previous work investigated advanced formulations, and I believe my skillset could significantly accelerate your upcoming milestones.

Could we schedule a brief 10-minute introductory videocall to discuss how my profile aligns with your group's strategic horizons? My CV and key publication profiles are attached.

Thank you very much for your time and guidance.

Sincerely,

${outreachName}
${outreachAffiliation}`;

      case 'phd':
        return `Subject: Prospective Ph.D. Candidate - Graduate Research Inquiry

Dear Dr. ${lab.pi},

My name is ${outreachName}, and I am writing to express my earnest interest in joining your research group at ${lab.university} as a Ph.D. candidate.

Your laboratory's work optimizing ${techHighlight}, as well as your latest breakthrough concerning "${lab.recent_breakthrough || 'advanced techniques'}", perfectly aligns with my scientific goals. I possess structured training in relevant methods, and I am highly motivated to contribute to your group's upcoming laboratory milestones.

Could you let me know if you are actively looking to admit new graduate researchers for the upcoming institutional term? I would appreciate the opportunity to share my academic transcripts, portfolio, and discuss research synergies.

Warmest regards,

${outreachName}
${outreachAffiliation}`;

      case 'sabbatical':
        return `Subject: Visiting Scholar & Sabbatical Hosting Inquiry - Dr. ${lab.pi}

Dear Dr. ${lab.pi},

I am writing to inquire about the potential of visiting your renowned research center, the ${lab.name}, at ${lab.university}, as a visiting scientist for an upcoming academic term.

I am highly intrigued by your focus on ${lab.expertise_focus || 'this research theme'} and your extensive instrumentation in ${techHighlight}. Specifically, I would love to learn more and potentially co-develop pathways based on your work ${breakthroughText}.

A study visit to your facilities would cultivate profound international networks and allow us to combine our technical methodologies to address challenging material limits.

Looking forward to your favorable response.

With respect,

${outreachName}
${outreachAffiliation}`;

      case 'collab':
      default:
        return `Subject: Academic Collaboration Inquiry - Synergistic Research in Biomaterials

Dear Dr. ${lab.pi},

I hope you are having a productive week. My name is ${outreachName} from the ${outreachAffiliation}. I am reaching out to propose an academic collaboration between our research groups in the area of experimental engineering.

We have been deeply impressed by your group's expertise in ${techHighlight}, mapped beautifully in your recent breakthrough: ${breakthroughText}. Our team has complementary assets in structural modeling and bio-characterization. 

I believe that combining your technical stack with our material formulation pipelines would construct a highly competitive translational platform.

Would you be open to an online video conference in the coming weeks to present our current tracks and identify concrete research projects to tackle together?

Best regards,

${outreachName}
${outreachAffiliation}`;
    }
  };

  const handleCopyEmail = (idx: number, body: string) => {
    navigator.clipboard.writeText(body);
    setCopiedEmailMap(prev => ({ ...prev, [idx]: true }));
    setTimeout(() => {
      setCopiedEmailMap(prev => ({ ...prev, [idx]: false }));
    }, 2000);
  };

  const handleExportCSV = () => {
    if (!data || !data.labs) return;
    const headers = 'PI,Lab Name,University,QS Ranking,Location,Match Score,Technical Stack,Recent Breakthrough,Website\n';
    const rows = filteredAndSortedLabs.map(lab => {
      const safePi = `"${lab.pi.replace(/"/g, '""')}"`;
      const safeName = `"${lab.name.replace(/"/g, '""')}"`;
      const safeUni = `"${lab.university.replace(/"/g, '""')}"`;
      const safeRank = `"${(lab.university_ranking || '').replace(/"/g, '""')}"`;
      const safeLoc = `"${lab.city}, ${lab.country}"`;
      const safeBreakthrough = `"${(lab.recent_breakthrough || '').replace(/"/g, '""')}"`;
      const safeWeb = `"${lab.website || ''}"`;
      const safeStack = `"${lab.tech_stack.join(', ')}"`;
      return `${safePi},${safeName},${safeUni},${safeRank},${safeLoc},${lab.match_score}%,${safeStack},${safeBreakthrough},${safeWeb}`;
    }).join('\n');

    const csvContent = "data:text/csv;charset=utf-8," + encodeURIComponent(headers + rows);
    const link = document.createElement("a");
    link.setAttribute("href", csvContent);
    link.setAttribute("download", `Scout_Report-${data.region_summary?.title?.replace(/\s+/g, '_') || 'Labs'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!data) {
    return (
      <div className="w-full bg-orange-50/50 border border-orange-200 p-8 rounded-2xl text-center">
        <FlaskConical className="w-10 h-10 text-orange-600 mx-auto mb-3 animate-bounce" />
        <h4 className="font-bold text-slate-800 text-sm">Parsing Search Output...</h4>
        <p className="text-xs text-slate-500 mt-1">If this persists, copy the raw markdown response below:</p>
        <div className="mt-4 p-4 text-left bg-white border border-orange-100 rounded-xl text-xs overflow-auto max-h-48 text-slate-650 font-mono">
          {result.content}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white rounded-3xl shadow-xl border border-orange-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* 1. Brand Header */}
      <div className="bg-gradient-to-r from-orange-600 to-amber-500 text-white px-6 py-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1 text-white">
            <div className="bg-white/10 p-2 rounded-xl border border-white/20">
              <FlaskConical className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight font-sans tracking-wide">
                International Lab Scout & Outreach Hub
              </h3>
              <p className="text-[10px] text-orange-100 font-mono tracking-widest uppercase">
                GLOBAL EXPERTISE IDENTIFICATION & SMART ACADEMIC MATCHMAKING
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <button
            id="csv-export-btn"
            onClick={handleExportCSV}
            className="flex-1 md:flex-none flex items-center justify-center gap-1.5 bg-orange-700/40 hover:bg-orange-700/60 border border-orange-400/30 text-white font-bold px-3.5 py-1.5 rounded-xl text-xs transition-all active:scale-95"
            title="Export shortlist to Excel/CSV"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <button 
            id="raw-copy-btn"
            onClick={handleCopy}
            className="flex-1 md:flex-none flex items-center justify-center gap-1.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold px-3.5 py-1.5 rounded-xl text-xs transition-all active:scale-95"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-orange-200" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied!' : 'Copy Code'}</span>
          </button>
        </div>
      </div>

      {/* 2. Region overview landscape card */}
      {data.region_summary && (
        <div className="m-6 p-6 bg-gradient-to-br from-orange-50/70 to-amber-50/50 border border-orange-100 rounded-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform duration-500">
            <Globe className="w-24 h-24 text-orange-950" />
          </div>
          <div className="relative z-10 space-y-3.5">
            <div className="flex items-center gap-2.5">
              <span className="p-1 px-2.5 rounded-full bg-orange-500 text-white text-[10px] font-mono tracking-widest font-black uppercase">
                Ecosystem Report
              </span>
              <div className="h-4 w-[1px] bg-orange-200" />
              <h4 className="font-extrabold text-slate-800 text-sm tracking-tight">
                {data.region_summary.title}
              </h4>
            </div>

            <p className="text-slate-650 leading-relaxed max-w-4xl text-[13px] font-medium font-sans">
              {data.region_summary.landscape}
            </p>

            <div className="flex flex-wrap gap-2 items-center pt-1.5">
              <span className="text-[10px] font-black text-orange-850 uppercase tracking-widest flex items-center gap-1">
                <GraduationCap className="w-3.5 h-3.5" /> Major Hubs Identified:
              </span>
              {data.region_summary.top_institutions.map((inst, i) => (
                <span key={i} className="px-3 py-1 bg-white border border-orange-150 text-orange-900 text-[11px] font-bold rounded-lg shadow-sm">
                  {inst}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 3. Search and interactive analysis panel */}
      <div className="mx-6 p-5 bg-slate-50 rounded-2xl border border-slate-200/60 space-y-4">
        
        <div className="flex items-center justify-between border-b pb-2.5 border-slate-200">
          <div className="flex items-center gap-1.5">
            <SlidersHorizontal className="w-4 h-4 text-orange-600" />
            <h5 className="text-xs font-bold text-slate-700 uppercase tracking-widest">
              Live filter & Analytics dashboard ({filteredAndSortedLabs.length} matching)
            </h5>
          </div>
          
          <button
            id="clear-filters-btn"
            onClick={handleClearFilters}
            className="text-[10px] font-extrabold text-slate-400 hover:text-orange-600 transition-colors uppercase flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset filters</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          
          {/* Keyword Search */}
          <div className="space-y-1 md:col-span-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">
              Search parameters or keys
            </label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
              <input
                id="workspace-search"
                type="text"
                placeholder="Filter by PI, university, focus term, or location..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-xl outline-none focus:ring-1 focus:ring-orange-500 font-medium text-slate-700 shadow-sm"
              />
            </div>
          </div>

          {/* Score filter */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">
              Minimum Match Score ({minMatchFilter}%)
            </label>
            <select
              id="score-dropdown"
              value={minMatchFilter}
              onChange={e => setMinMatchFilter(parseInt(e.target.value))}
              className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl outline-none cursor-pointer focus:ring-1 focus:ring-orange-500 text-slate-650 font-bold shadow-sm"
            >
              <option value="0">All Match Scores</option>
              <option value="60">60% Match or higher</option>
              <option value="70">70% Match or higher</option>
              <option value="80">80% Match or higher</option>
              <option value="90">90% Match or higher</option>
            </select>
          </div>

          {/* Sorter */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">
              Sort laboratory records
            </label>
            <select
              id="sort-dropdown"
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl outline-none cursor-pointer focus:ring-1 focus:ring-orange-500 text-slate-650 font-bold shadow-sm"
            >
              <option value="match">Highest Match Score</option>
              <option value="rank">Top University Rank</option>
              <option value="pi">PI Name Alphabetically</option>
              <option value="university">University Name</option>
            </select>
          </div>

        </div>

        {/* Dynamic filters list: Interactive tech keywords cloud */}
        {allAvailableTechTags.length > 0 && (
          <div className="space-y-1.5 border-t border-slate-200/60 pt-3">
            <div className="flex justify-between items-center text-[9.5px] uppercase tracking-wider font-extrabold text-slate-400">
              <span>Filter strictly by scientific method tag:</span>
              {selectedTechFilters.length > 0 && (
                <span className="text-orange-600 font-bold">
                  {selectedTechFilters.length} Active Tags
                </span>
              )}
            </div>
            
            <div className="flex flex-wrap gap-1.5">
              {allAvailableTechTags.map(tech => {
                const isActive = selectedTechFilters.includes(tech);
                return (
                  <button
                    key={tech}
                    id={`tech-filter-tag-${tech.replace(/\s+/g, '_')}`}
                    onClick={() => handleToggleTechFilter(tech)}
                    className={`px-2.5 py-1 text-[11px] font-bold rounded-lg border transition-all ${
                      isActive 
                        ? 'bg-orange-600 border-orange-600 text-white shadow-sm font-extrabold' 
                        : 'bg-white border-slate-250 text-slate-600 hover:bg-slate-100 hover:text-slate-800 shadow-sm'
                    }`}
                  >
                    {tech}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Shortlist check */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-200/60 w-full justify-between flex-wrap gap-y-2">
          <label className="flex items-center gap-2 cursor-pointer group">
            <input
              id="bookmarks-toggle"
              type="checkbox"
              checked={showBookmarkedOnly}
              onChange={e => setShowBookmarkedOnly(e.target.checked)}
              className="w-4 h-4 text-orange-600 rounded border-slate-300 focus:ring-orange-500 focus:border-orange-500"
            />
            <span className="text-xs font-bold text-slate-500 group-hover:text-amber-700 transition-colors flex items-center gap-1">
              <Bookmark className="w-3.5 h-3.5 fill-amber-500/10 text-amber-500" />
              <span>Show Bookmarked/Shortlisted Labs Only</span>
            </span>
          </label>

          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
            Original Query: <span className="text-slate-600 italic">"{result.originalQuery}"</span>
          </p>
        </div>

      </div>

      {/* 4. Active List of Labs */}
      <div className="p-6 space-y-6">
        {filteredAndSortedLabs.length === 0 ? (
          <div className="bg-slate-50 border border-slate-150 p-12 text-center rounded-2xl">
            <Building className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h4 className="font-extrabold text-slate-700 text-sm">No laboratory centers match your indices.</h4>
            <p className="text-xs text-slate-400 mt-1">Try resetting filter keywords or relaxing match parameters above.</p>
          </div>
        ) : (
          filteredAndSortedLabs.map((lab, idx) => {
            const isBookmarked = !!bookmarkedLabs[`${lab.pi}_${lab.university}`];
            const labNoteText = labNotes[`${lab.pi}_${lab.university}`] || '';
            const isDrafterOpen = activeDrafterLabIdx === idx;

            // Generate search query links
            const scholarSearch = `https://scholar.google.com/scholar?q=${encodeURIComponent(`${lab.pi} ${lab.university} biomaterials`)}`;
            const mapQuery = lab.address || `${lab.university} ${lab.city} ${lab.country}`;
            const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}`;

            return (
              <div 
                key={idx} 
                className={`bg-white rounded-2xl border transition-all overflow-hidden relative shadow-sm hover:shadow-md ${
                  isBookmarked ? 'border-amber-400 ring-2 ring-amber-400/10' : 'border-slate-150'
                }`}
              >
                
                {/* Lab Card Header Badge */}
                <div className="bg-slate-50 px-5 py-4 border-b border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                  
                  {/* Left branding */}
                  <div className="flex items-start gap-3.5">
                    <div className="bg-white p-2.5 rounded-xl text-orange-500 border border-slate-250 shrink-0 mt-0.5 shadow-sm">
                      <FlaskConical className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <h4 className="text-[17px] font-black text-slate-800 leading-tight">
                        {lab.name}
                      </h4>
                      <div className="flex flex-wrap items-center gap-1.5 mt-1.5 text-xs text-slate-500 font-medium font-sans">
                        <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-semibold text-slate-650">{lab.university}</span>
                        {lab.university_ranking && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[10.5px] font-extrabold border border-blue-100">
                            {lab.university_ranking}
                          </span>
                        )}
                        <span className="text-slate-350">•</span>
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-slate-600">{lab.city}, {lab.country}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right matching details & bookmarks */}
                  <div className="flex items-center gap-3 justify-end shrink-0 self-end sm:self-auto">
                    
                    <div className="flex flex-col items-end">
                      <div className="flex items-center gap-0.5 mb-0.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star 
                            key={s} 
                            className={`w-3.5 h-3.5 ${lab.match_score >= s * 20 ? 'fill-orange-400 text-orange-400' : 'text-slate-200'}`} 
                          />
                        ))}
                      </div>
                      <span className="text-[11px] font-black text-slate-500 tracking-wider font-mono">
                        {lab.match_score}% ACCURACY MATCH
                      </span>
                    </div>

                    <div className="h-6 w-[1px] bg-slate-200" />

                    <button
                      id={`bookmark-btn-${idx}`}
                      onClick={() => toggleBookmark(lab.pi, lab.university)}
                      className={`p-2 rounded-xl border transition-all ${
                        isBookmarked 
                          ? 'bg-amber-500/10 border-amber-300 text-amber-500' 
                          : 'bg-white border-slate-200 text-slate-450 hover:text-slate-600 hover:bg-slate-50'
                      }`}
                      title={isBookmarked ? "Shortlisted!" : "Bookmark laboratory"}
                    >
                      <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-amber-500' : ''}`} />
                    </button>

                  </div>

                </div>

                {/* Sub Body Panel wrapper */}
                <div className="p-5 space-y-5">
                  
                  {/* Row: Principal Investigator, Location, & tech tags */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch">
                    
                    {/* Left details (4 cols) */}
                    <div className="md:col-span-4 space-y-3 flex flex-col justify-between">
                      <div className="bg-slate-50 hover:bg-slate-100/70 p-3.5 rounded-xl border border-slate-150 relative space-y-1">
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 uppercase tracking-widest font-bold">
                          <User className="w-3.5 h-3.5 text-orange-500" />
                          <span>Principal Investigator</span>
                        </div>
                        <p className="text-[15px] font-extrabold text-slate-800">
                          {lab.pi}
                        </p>
                        <p className="text-[11px] text-slate-400 italic">
                          Published Senior Faculty Author
                        </p>
                      </div>

                      <div className="flex items-center justify-between text-xs text-slate-500 px-1 py-1.5 bg-slate-50/50 rounded-xl border border-slate-150-dot">
                        <div className="flex items-center gap-1.5 truncate">
                          <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                          <span className="truncate text-[11px] font-medium text-slate-600">{lab.address || `${lab.city}, ${lab.country}`}</span>
                        </div>
                        
                        <a
                          id={`map-link-${idx}`}
                          href={mapUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-2 bg-white border border-slate-200 text-blue-600 px-3 py-1 font-extrabold rounded-lg hover:border-blue-200 uppercase tracking-widest text-[10px] shadow-sm transition-all text-center shrink-0"
                        >
                          Map View
                        </a>
                      </div>
                    </div>

                    {/* Technical stack tags clouds (8 cols) */}
                    <div className="md:col-span-8 bg-slate-50 p-4 rounded-xl border border-slate-150 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-1 mb-2">
                          <Tag className="w-3.5 h-3.5 text-slate-450" />
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                            Active Methodology & Instrumentation Stack
                          </span>
                        </div>
                        
                        <div className="flex flex-wrap gap-1.5">
                          {lab.tech_stack.map((tech, i) => {
                            const isFilteringByThis = selectedTechFilters.includes(tech);
                            return (
                              <button
                                key={i}
                                id={`tech-tag-badge-${idx}-${i}`}
                                onClick={() => handleToggleTechFilter(tech)}
                                className={`px-2.5 py-0.5 text-[10.5px] font-bold rounded-md transition-all ${
                                  isFilteringByThis
                                    ? 'bg-orange-600 text-white font-extrabold'
                                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-800'
                                } shadow-inner`}
                                title="Click to filter other labs by this technique"
                              >
                                {tech}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <p className="text-[10px] text-slate-400 italic mt-3 block border-t pt-2 border-slate-200">
                        *Indices mapped directly against global NIH and PubMed registries.
                      </p>
                    </div>

                  </div>

                  {/* Core expertise & Synergy note side-by-side */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    <div className="bg-blue-50/20 p-4.5 rounded-xl border border-blue-100/50 space-y-1.5">
                      <h5 className="text-[11px] font-bold text-blue-900 uppercase tracking-widest flex items-center gap-1.5">
                        <Tag className="w-3.5 h-3.5 text-blue-500 font-bold" />
                        <span>Scope & Expertise Focus</span>
                      </h5>
                      <p className="text-[13px] text-slate-700 leading-relaxed font-semibold">
                        {lab.expertise_focus}
                      </p>
                    </div>

                    <div className="bg-amber-50/20 p-4.5 rounded-xl border border-amber-100/50 space-y-1.5">
                      <h5 className="text-[11px] font-bold text-amber-900 uppercase tracking-widest flex items-center gap-1.5">
                        <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500/10 font-bold" />
                        <span>Translation & Collaborative Potential</span>
                      </h5>
                      <p className="text-[13px] text-slate-700 leading-relaxed font-semibold">
                        {lab.collaboration_potential}
                      </p>
                    </div>

                  </div>

                  {/* Breakthrough Block */}
                  {lab.recent_breakthrough && (
                    <div className="bg-slate-900 p-4.5 rounded-xl shadow-inner relative group border border-slate-800">
                      <div className="flex justify-between items-center mb-1.5">
                        <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-orange-400" /> 
                          <span>Latest Research Breakthrough milestone (2024-2026)</span>
                        </p>
                        
                        <a 
                          id={`scholar-insight-${idx}`}
                          href={scholarSearch}
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-[10px] text-orange-400 hover:text-orange-300 font-bold flex items-center gap-1.5 pb-0.5 border-b border-orange-500/10 hover:border-orange-400 transition-all"
                        >
                          <span>Google Scholar Profile</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                      <p className="text-white text-sm italic font-semibold leading-relaxed">
                        "{lab.recent_breakthrough}"
                      </p>
                    </div>
                  )}

                  {/* Header Strategist Advice & Interactive Email tool toggle */}
                  <div className="border border-slate-150 rounded-2xl overflow-hidden shadow-xs">
                    
                    <div className="bg-slate-50 px-4 py-3 flex items-center justify-between border-b border-slate-100">
                      <div className="flex items-start gap-3">
                        <div className="bg-indigo-100 text-indigo-600 p-1.5 rounded-lg shrink-0 mt-0.5 border border-indigo-200">
                          <Mail className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <h5 className="text-xs font-bold text-indigo-950 uppercase tracking-wider">
                            Headhunter Strategic Contact Strategy
                          </h5>
                          {lab.contact_strategy && (
                            <p className="text-xs text-indigo-800 leading-relaxed font-medium italic mt-0.5">
                              "{lab.contact_strategy}"
                            </p>
                          )}
                        </div>
                      </div>

                      <button
                        id={`outreach-toggle-${idx}`}
                        onClick={() => setActiveDrafterLabIdx(isDrafterOpen ? null : idx)}
                        className={`px-3.5 py-1.5 text-xs font-bold rounded-xl border flex items-center gap-1.5 transition-all shadow-xs shrink-0 ml-4 ${
                          isDrafterOpen
                            ? 'bg-amber-600 border-amber-500 text-white hover:bg-amber-700'
                            : 'bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100'
                        }`}
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>{isDrafterOpen ? 'Hide Assistant' : 'Open Outreach Planner'}</span>
                      </button>
                    </div>

                    {/* EXPANDED OUTREACH EMAIL ASSISTANT INJECTOR */}
                    {isDrafterOpen && (
                      <div className="p-5 bg-stone-50 border-t border-slate-100 space-y-4 animate-in slide-in-from-top-2 duration-300">
                        <div className="bg-white p-4 border border-indigo-100/80 rounded-xl space-y-3">
                          <h6 className="text-[11px] font-black text-indigo-900 uppercase tracking-widest flex items-center gap-1.5 border-b pb-1.5">
                            <Send className="w-3.5 h-3.5 text-indigo-500" />
                            <span>Outreach Generation Config</span>
                          </h6>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            
                            <div className="space-y-1">
                              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">
                                Outreach Goal / Purpose
                              </label>
                              <select
                                id="outreach-purpose"
                                value={outreachGoal}
                                onChange={e => setOutreachGoal(e.target.value as any)}
                                className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer font-bold"
                              >
                                <option value="collab">Academic Collaboration Proposal</option>
                                <option value="postdoc">Postdoctoral Application</option>
                                <option value="phd">Prospective Ph.D. Applicant</option>
                                <option value="sabbatical">Sabbatical/Visiting Scholar</option>
                              </select>
                            </div>

                            <div className="space-y-1">
                              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">
                                Your Signature Name
                              </label>
                              <input
                                id="outreach-sender-name"
                                type="text"
                                value={outreachName}
                                onChange={e => setOutreachName(e.target.value)}
                                className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs outline-none focus:ring-1 focus:ring-indigo-500 font-bold text-slate-705"
                                placeholder="Your Name"
                              />
                            </div>

                            <div className="space-y-1">
                              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">
                                Your Affiliation / University
                              </label>
                              <input
                                id="outreach-sender-org"
                                type="text"
                                value={outreachAffiliation}
                                onChange={e => setOutreachAffiliation(e.target.value)}
                                className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs outline-none focus:ring-1 focus:ring-indigo-500 font-bold text-slate-705"
                                placeholder="e.g. Yale University"
                              />
                            </div>

                          </div>
                        </div>

                        {/* Textarea presentation with formatted template output */}
                        <div className="space-y-1.5">
                          <div className="flex justify-between items-center bg-indigo-950 text-white px-3.5 py-2.0 rounded-t-xl text-xs font-mono">
                            <span className="font-bold text-orange-400 tracking-wider">EMAIL OUTLINE & TRANSMITTAL SCRIPT</span>
                            <button
                              id={`copy-email-btn-${idx}`}
                              onClick={() => handleCopyEmail(idx, generateOutreachBody(lab))}
                              className="bg-white/10 hover:bg-white/20 px-3 py-1 font-bold text-[10.5px] rounded border border-white/15 uppercase tracking-widest flex items-center gap-1 text-white"
                            >
                              {copiedEmailMap[idx] ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                              <span>{copiedEmailMap[idx] ? 'Copied' : 'Copy Email'}</span>
                            </button>
                          </div>
                          
                          <textarea
                            id={`outreach-textarea-${idx}`}
                            readOnly
                            rows={12}
                            value={generateOutreachBody(lab)}
                            className="w-full p-4.5 bg-slate-900 text-white font-mono text-[12.5px] leading-relaxed rounded-b-xl border-none outline-none resize-none focus:ring-0 select-text"
                          />
                        </div>
                      </div>
                    )}

                  </div>

                  {/* Quantitative Notes for this lab */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-slate-400" />
                      <span>Quantitative Researcher Notes (Saved Automatically)</span>
                    </label>
                    
                    <textarea
                      id={`notes-textarea-${idx}`}
                      rows={2}
                      value={labNoteText}
                      onChange={e => updateLabNote(lab.pi, lab.university, e.target.value)}
                      placeholder="Type details concerning this PI, follow-up timelines, paper targets or conference meetups..."
                      className="w-full px-3.5 py-2.0 text-xs bg-slate-50/50 border border-slate-250 rounded-xl outline-none focus:ring-1 focus:ring-orange-500 font-medium text-slate-700"
                    />
                  </div>

                  {/* Dynamic Action Buttons: Site visits and Scholar searches */}
                  <div className="flex flex-wrap gap-2 pt-1.5 justify-end">
                    
                    <a
                      id={`scholar-profile-${idx}`}
                      href={scholarSearch}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-extrabold text-slate-500 hover:text-slate-800 flex items-center gap-1.5 px-3.5 py-2.0 rounded-xl hover:bg-slate-100 border border-slate-200 transition-colors bg-white shadow-xs"
                    >
                      <Search className="w-3.5 h-3.5 text-slate-400" />
                      <span>PI Publication Record</span>
                    </a>

                    {lab.website && lab.website !== 'N/A' && (
                      <a
                        id={`lab-website-${idx}`}
                        href={lab.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-orange-600 hover:bg-orange-700 text-white text-xs font-extrabold px-4.5 py-2.0 rounded-xl flex items-center gap-1.5 transition-all shadow-md shadow-orange-100 hover:shadow-orange-200 active:scale-95"
                      >
                        <Globe className="w-3.5 h-3.5 animate-spin-slow" />
                        <span>Visit Institutional Site</span>
                      </a>
                    )}

                  </div>

                </div>

              </div>
            );
          })
        )}
      </div>

    </div>
  );
};

export default LabScoutResultCard;
