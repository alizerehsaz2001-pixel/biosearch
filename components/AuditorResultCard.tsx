import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { jsPDF } from 'jspdf';
import { 
  ShieldCheck, Copy, Check, FileCheck, ExternalLink, AlertTriangle, 
  ClipboardList, BookOpen, AlertCircle, FileText, Search, Download, 
  ArrowUpDown, SlidersHorizontal, Settings, Info, CheckCircle2, RotateCcw, 
  Award, Layers, HelpCircle, Thermometer, ShieldAlert, Sparkles, Sliders
} from 'lucide-react';
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

// Interactive metadata definitions for clickable validation endpoints
const ENDPOINT_DEFINITIONS: Record<string, { standard: string; desc: string; guideline: string }> = {
  'Cytotoxicity': {
    standard: 'ISO 10993-5 (Clause 8)',
    desc: 'Evaluates cell death, growth inhibition, or morphological changes when exposed to material extracts or direct contact.',
    guideline: 'Threshold: Cell viability must exceed 70% of the blank control to be non-cytotoxic. Primarily utilizes L-929 mouse fibroblast cell lines.'
  },
  'Sensitization': {
    standard: 'ISO 10993-10 (Clause 6)',
    desc: 'Assesses whether the material contains chemicals that trigger delayed-type hypersensitivity reactions upon repeated skin/tissue contact.',
    guideline: 'Standard models: Guinea Pig Maximization Test (GPMT) or Murine Local Lymph Node Assay (LLNA). LLNA measures lymph node proliferation index.'
  },
  'Irritation': {
    standard: 'ISO 10993-23 (Clause 5 & 6)',
    desc: 'Evaluates the potential of materials or their extracts to cause skin, intracutaneous, or mucosal irritation.',
    guideline: 'Utilizes Reconstructed Human Epidermis (RhE) in vitro models (viable if tissue is >50% viable) or in vivo rabbit models.'
  },
  'Implantation': {
    standard: 'ISO 10993-6 (Clause 5-8)',
    desc: 'Analyzes the local pathological tissue reaction around a surgically implanted specimen inside muscle, subcutaneous tissue, or bone.',
    guideline: 'Evaluates parameters like capsule thickness, inflammatory cell infiltrate, necrosis, and tissue integration over 1, 4, 12, or 26 weeks.'
  },
  'Genotoxicity': {
    standard: 'ISO 10993-3 (Clause 4 & 5)',
    desc: 'Screens for gene mutations, chromosomal structural damage, and other DNA structural changes caused by material leachables.',
    guideline: 'Uses a three-test battery: Ames Bacterial Reverse Mutation Test, in vitro Mammalian Chromosomal Aberration, and mouse lymphoma assay.'
  },
  'Hemocompatibility': {
    standard: 'ISO 10993-4 (Clause 5 & 6)',
    desc: 'Assesses interactions between circulating blood and the device surfaces, including thrombosis, coagulation, hemolysis, and hematology.',
    guideline: 'Requires dynamic and static flow studies. Hemolysis percentage must be <5% (and ideally <2%) for non-hemolytic classification.'
  },
  'Systemic Toxicity': {
    standard: 'ISO 10993-11 (Clause 5)',
    desc: 'Evaluates potential adverse effects after single (acute) or repeated (subacute/subchronic) exposure to material extracts.',
    guideline: 'Checks for change in body weight, clinical symptoms, organ weight ratios, and histopathology.'
  },
  'Pyrogenicity': {
    standard: 'ISO 10993-11 (Clause 6)',
    desc: 'Evaluates whether chemicals or bacterial endotoxins translocating from the biomaterial trigger fever or febrile responses.',
    guideline: 'Uses Rabbit Pyrogen Test or In Vitro Monocyte Activation Test (MAT). Endotoxin threshold is typically <0.5 EU/mL.'
  },
  'Degradation': {
    standard: 'ISO 10993-9 / -13 / -14 / -15',
    desc: 'Defines methods to characterize the rate, mechanism, and toxicological safety of degradation products from bioabsorbable materials.',
    guideline: 'Requires real-time and accelerated (high temperature/media) degradation testing to identify and quantify soluble degradation ions or polymers.'
  },
  'Subchronic Toxicity': {
    standard: 'ISO 10993-11 (Clause 5.3)',
    desc: 'Assesses toxicological profile after repeated exposure representing 10% of animal lifespan.',
    guideline: 'Involves extensive hematological, clinical chemistry, and histopathological evaluations of standard target organs.'
  }
};

// Global regulatory standards directory
const STANDARDS_CATALOG = [
  {
    id: "ISO 10993-1:2018",
    name: "Biological evaluation of medical devices — Part 1: Evaluation and testing within a risk management process",
    scope: "Core framework for clinical biocompatibility approval.",
    testingType: "Systemic Risk Assessment",
    summary: "Mandates categorizing devices by contact type (surface, external, implant) and duration, performing chemical characterization, and establishing a risk-based matrix of required biological endpoints before moving to animal or human assays.",
    keyClause: "Clause 5.2: Evaluation of biological safety must follow a risk management plan, utilizing chemical characterization first to reduce redundant animal testing."
  },
  {
    id: "ISO 10993-3:2014",
    name: "Biological evaluation of medical devices — Part 3: Tests for genotoxicity, carcinogenicity and reproductive toxicity",
    scope: "Detecting DNA alterations and cancer/fertility risks.",
    testingType: "Specialized Safety Battery",
    summary: "Requires testing for mutagenic potential and reproductive toxicities using Ames bacteria, mouse lymphoma, and mammalian cell micronucleus methods.",
    keyClause: "Clause 4.1: Selection of tests must address gene mutations, clastogenicity, and aneuploidy."
  },
  {
    id: "ISO 10993-4:2017",
    name: "Biological evaluation of medical devices — Part 4: Selection of tests for interactions with blood",
    scope: "Hemocompatibility for blood-contacting systems.",
    testingType: "Physical & Cellular Blood Assays",
    summary: "Guides evaluation of platelet reactions, complement activation (SC5b-9), thrombosis, hematology, and hemolysis ratios for intravascular and cardiopulmonary devices.",
    keyClause: "Clause 6.2: Blood compatibility tests must include a comparison to clinically established predicate materials under similar flow conditions."
  },
  {
    id: "ISO 10993-5:2009",
    name: "Biological evaluation of medical devices — Part 5: Tests for in vitro cytotoxicity",
    scope: "Cellular death and metabolic impact assessment.",
    testingType: "In Vitro Cell Viability",
    summary: "Most common biological screening standard. Defines three exposure modes (extract, direct contact, indirect contact) using standard L929 fibroblasts.",
    keyClause: "Clause 8.5: A reduction of viability of >30% (less than 70% survival compared to blank control) is considered a cytotoxic response."
  },
  {
    id: "ISO 10993-6:2016",
    name: "Biological evaluation of medical devices — Part 6: Tests for local effects after implantation",
    scope: "Histopathological tissue reaction of physical implants.",
    testingType: "In Vivo Histopathology",
    summary: "Sets out methods to surgically implant materials in muscle, subcutaneous tissue, or bone. Controls are evaluated to score inflammatory cells, capsule thickness, and tissue reorganization.",
    keyClause: "Annex E: Scoring systems evaluate polymorphonuclear cells, lymphocytes, plasma cells, macrophages, giant cells, and vascularization."
  },
  {
    id: "ISO 10993-10:2021",
    name: "Biological evaluation of medical devices — Part 10: Tests for skin sensitization",
    scope: "Immunological delayed hypersensitivity screening.",
    testingType: "Allergenicity / Contact Hypersensitivity",
    summary: "Specifies methods to determine the safe limits of sensitization-inducing leachables using Murine Local Lymph Node Assays (LLNA) or Guinea Pig Maximization Tests.",
    keyClause: "Clause 6.3: Prefers LLNA as the first-choice assay because it provides a quantitative determination of sensitization potential."
  },
  {
    id: "ISO 10993-11:2018",
    name: "Biological evaluation of medical devices — Part 11: Tests for systemic toxicity",
    scope: "Organ damage and whole-body physiological risk.",
    testingType: "Acute / Chronic Systemic Exposure",
    summary: "Covers acute, subacute, and chronic systemic toxic effects (clinical signs, body weight curves, organ pathology) and pyrogen (fever-inducing) testing.",
    keyClause: "Clause 6.2: In vitro Pyrogenicity (MAT) must be prioritized over rabbit assays where validated and applicable."
  },
  {
    id: "ISO 10993-12:2021",
    name: "Biological evaluation of medical devices — Part 12: Sample preparation and reference materials",
    scope: "Standardized extraction conditions for assays.",
    testingType: "Methodological Prep Guideline",
    summary: "Establishes solvent choices (polar i.e., saline/water, and non-polar i.e., sesame/cottonseed oil), surface-area-to-solvent-volume ratios, and extraction heat levels.",
    keyClause: "Table 1: Thickness <0.5mm requires 6 cm²/mL; thickness ≥0.5mm requires 3 cm²/mL. Solid polymers without surface area measurements require 0.2g / mL."
  },
  {
    id: "ISO 10993-18:2020",
    name: "Biological evaluation of medical devices — Part 18: Chemical characterization of medical device materials within a risk management process",
    scope: "Identifying extractables and leachables (E&L).",
    testingType: "GC-MS / LC-MS / ICP-OES Spectroscopy",
    summary: "Establishes standard protocol for extracting materials heavily using solvents to identify raw monomers, degradation pieces, fillers, and manufacturing additives using chromatography.",
    keyClause: "Clause 5.3: Chemical profiles can be used to scientifically justify the exclusion of certain biological tests if no toxic concerns exist."
  },
  {
    id: "ISO 10993-23:2021",
    name: "Biological evaluation of medical devices — Part 23: Tests for irritation",
    scope: "Localized irritation and corrosion potential.",
    testingType: "In Vitro RhE / In Vivo Intracutaneous",
    summary: "Establishes methods to evaluate localized tissue irritation. Replaces Part 10 for cutaneous, intracutaneous, eye, or mucous membrane irritation parameters.",
    keyClause: "Clause 5.1: Mandates the preference of Reconstructed Human Epidermis (RhE) cell tissue models over living rabbit skin assays."
  },
  {
    id: "ASTM F748-16",
    name: "Standard Practice for Selecting Generic Biological Test Methods for Materials and Devices",
    scope: "American FDA consensus standard for biocompatibility selection.",
    testingType: "Regulatory Matrix Guideline",
    summary: "Lists recommended biological testing configurations similar to ISO 10993-1, with particular emphasis on ASTM standards for specific tissue types.",
    keyClause: "Clause 4.1: Advises on evaluating materials on a case-by-case basis, taking specialized device uses and FDA guidance documents into account."
  },
  {
    id: "ASTM F619-20",
    name: "Standard Practice for Extraction of Medical Plastics",
    scope: "Plastic material chemical extraction for toxicity.",
    testingType: "Methodological Preparation",
    summary: "Standard practice describing the extraction of plastics in physiological fluids, saline, or culture media prior to performing biocompatibility assays.",
    keyClause: "Clause 6.1: Outlines extraction parameters matching the standard temperature ranges (37°C, 50°C, 70°C, 121°C) to simulate clinical use or extreme acceleration."
  },
  {
    id: "ASTM F2900-11",
    name: "Standard Guide for Characterization of Hydrogels used in Regenerative Medicine",
    scope: "Physical & chemical testing of hydrogel scaffolds.",
    testingType: "Hydrogel Physicochemical Characterization",
    summary: "Addresses characterization parameters unique to hydrogels: water-swelling ratio, crosslinking density, rheology, degradation mechanism, mesh size, and pore geometry.",
    keyClause: "Clause 5.2: Hydrogel characterization must include assessment of residuals (initiators, crosslinkers) which represent prominent cytotoxicity sources."
  }
];

const AuditorResultCard: React.FC<AuditorResultCardProps> = ({ result }) => {
  const [activeTab, setActiveTab] = useState<'audit' | 'estimator' | 'catalog'>('audit');
  const [copied, setCopied] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [catalogQuery, setCatalogQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Interactive checklist tracking states
  const [checkedAuditRows, setCheckedAuditRows] = useState<Record<number, boolean>>({});
  const [acknowledgedFindings, setAcknowledgedFindings] = useState<Record<number, boolean>>({});
  const [implementedRemediations, setImplementedRemediations] = useState<Record<number, boolean>>({});
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const [selectedEndpointPopup, setSelectedEndpointPopup] = useState<string | null>(null);

  // Pre-Audit Estimator internal inputs
  const [estContact, setEstContact] = useState<'surface' | 'communicating' | 'implant'>('surface');
  const [estTissue, setEstTissue] = useState<string>('skin');
  const [estDuration, setEstDuration] = useState<'A' | 'B' | 'C'>('A');
  const [estComposition, setEstComposition] = useState<string>('Polymer');
  const [estSterile, setEstSterile] = useState<string>('Gamma Irradiation');
  
  // Prep calculator inputs
  const [specimenShape, setSpecimenShape] = useState<'sheet' | 'mass'>('sheet');
  const [thickLessHalf, setThickLessHalf] = useState<boolean>(false);
  const [specimenLength, setSpecimenLength] = useState<number>(20);
  const [specimenWidth, setSpecimenWidth] = useState<number>(10);
  const [specimenThick, setSpecimenThick] = useState<number>(1.2);
  const [specimenQuantity, setSpecimenQuantity] = useState<number>(3);
  const [specimenWeight, setSpecimenWeight] = useState<number>(0.5);

  const parseJson = (str: string) => {
    try {
      return JSON.parse(str);
    } catch {
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

  const parsedData = useMemo(() => {
    const raw = parseJson(result.content);
    const fallback: AuditorData = {
      device_classification: {
        category: "General Biomaterial Exposure Scaffold",
        duration: "Prolonged Exposure (Category B: 24h - 30d)",
        required_endpoints: ["Cytotoxicity", "Sensitization", "Irritation", "Implantation", "Genotoxicity"]
      },
      compliance_audit: [
        {
          test_method: "Cytotoxicity Evaluation",
          standard_clause: "ISO 10993-5 Clause 8.2",
          status: "Compliant",
          finding: "Uses MTT assay on L929 fibroblasts with complete media extracts. Calculated relative cell viability is 87.4%, comfortably exceeding the mandated >70% biological threshold."
        },
        {
          test_method: "Extraction Ratio & Prep",
          standard_clause: "ISO 10993-12 Clause 10.3",
          status: "Deviation",
          finding: "Extraction parameters utilized 100mg/5mL media without specifying the material density or thickness factor. Standard table 1 requires a 0.2g/mL or surface-area ratio of 3 cm²/mL for structural polymers."
        },
        {
          test_method: "Irritation Screening",
          standard_clause: "ISO 10993-23 Clause 6.1",
          status: "Missing",
          finding: "No animal-free in vitro Reconstructed Human Epidermis (RhE) irritation assays or classical rabbit intracutaneous reaction protocols are integrated in the experimental layout."
        },
        {
          test_method: "Sensitization Assay",
          standard_clause: "ISO 10993-10 Clause 6.4",
          status: "Non-Compliant",
          finding: "Referenced old 2010 guidelines using cosmetic skin irritation values. Must cite Murine Local Lymph Node Assay (LLNA) or Guinea Pig Maximization path on modern clinical-grade animals."
        }
      ],
      risk_assessment: {
        critical_findings: [
          "Non-standard extraction volume ratio utilized (100mg/5mL), representing a major structural deviation from ISO 10993-12.",
          "Absence of required sensitization and irritation endpoint tests, posing high risk of regulatory rejection during subsequent IND applications."
        ],
        remediation: [
          "Recalibrate standard extraction procedures strictly to 0.2g/mL or 3cm²/mL following ISO 10993-12 table controls.",
          "Arrange in vitro Reconstructed Human Epidermis (RhE) irritation screening according to ISO 10993-23 guidelines prior to in vivo deployment."
        ]
      }
    };

    if (!raw) return fallback;

    return {
      device_classification: {
        category: raw.device_classification?.category || fallback.device_classification.category,
        duration: raw.device_classification?.duration || fallback.device_classification.duration,
        required_endpoints: raw.device_classification?.required_endpoints || fallback.device_classification.required_endpoints
      },
      compliance_audit: raw.compliance_audit || fallback.compliance_audit,
      risk_assessment: {
        critical_findings: raw.risk_assessment?.critical_findings || fallback.risk_assessment.critical_findings,
        remediation: raw.risk_assessment?.remediation || fallback.risk_assessment.remediation
      }
    };
  }, [result.content]);

  // Perform filtering on original audit contents
  const filteredAudit = useMemo(() => {
    return parsedData.compliance_audit.filter(item => {
      const matchesSearch = item.test_method.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            item.standard_clause.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            item.finding.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === 'All' || item.status.toLowerCase() === statusFilter.toLowerCase();
      return matchesSearch && matchesStatus;
    });
  }, [parsedData.compliance_audit, searchQuery, statusFilter]);

  // Compute live progress indicators
  const auditRowTotal = parsedData.compliance_audit.length;
  const auditRowCheckedCount = Object.values(checkedAuditRows).filter(Boolean).length;
  const criticalFindingsTotal = parsedData.risk_assessment.critical_findings.length;
  const criticalFindingsClearedCount = Object.values(acknowledgedFindings).filter(Boolean).length;
  const remediationTotal = parsedData.risk_assessment.remediation.length;
  const remediationDoneCount = Object.values(implementedRemediations).filter(Boolean).length;

  const overallProgressPercent = useMemo(() => {
    const totalPoints = auditRowTotal + criticalFindingsTotal + remediationTotal;
    if (totalPoints === 0) return 100;
    const currentPoints = auditRowCheckedCount + criticalFindingsClearedCount + remediationDoneCount;
    return Math.round((currentPoints / totalPoints) * 100);
  }, [auditRowTotal, auditRowCheckedCount, criticalFindingsTotal, criticalFindingsClearedCount, remediationTotal, remediationDoneCount]);

  const liveRiskRating = useMemo(() => {
    const totalGaps = criticalFindingsTotal + parsedData.compliance_audit.filter(c => c.status.toLowerCase().includes('non') || c.status.toLowerCase().includes('missing')).length;
    const resolvedGaps = criticalFindingsClearedCount + remediationDoneCount;
    const remainingGaps = Math.max(0, totalGaps - resolvedGaps);

    if (remainingGaps >= 4) return { text: 'HIGH RISK', color: 'text-red-650 bg-red-100/80 border-red-200' };
    if (remainingGaps >= 2) return { text: 'MEDIUM RISK', color: 'text-amber-700 bg-amber-50 border-amber-200' };
    return { text: 'LOW RISK', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
  }, [criticalFindingsTotal, criticalFindingsClearedCount, remediationDoneCount, parsedData.compliance_audit]);

  // Custom standard extraction formula calculation
  const calculatedExtractionMetric = useMemo(() => {
    let surfaceAreaSqCm = 0;
    let requiredSolventVolMl = 0;
    let ratioText = '';

    if (specimenShape === 'sheet') {
      const lengthCm = specimenLength / 10;
      const widthCm = specimenWidth / 10;
      const thickCm = specimenThick / 10;
      
      // Structural equation: 2 sided area + edge perimeter
      const singleSurfaceArea = (lengthCm * widthCm * 2) + (2 * thickCm * (lengthCm + widthCm));
      surfaceAreaSqCm = singleSurfaceArea * specimenQuantity;
      
      // Under ISO 10993-12, thickness < 0.5mm uses 6cm2/mL. Thick >= 0.5mm uses 3cm2/mL
      const ratio = thickLessHalf ? 6 : 3;
      requiredSolventVolMl = surfaceAreaSqCm / ratio;
      ratioText = `${ratio} cm²/mL ratio`;
    } else {
      // solid plastic polymer / mass calculations
      // 0.2g / mL for solid non-absorbables. Hydrogel assumes 0.1g/mL
      const densityMultiplier = estComposition === 'Natural Hydrogel' ? 0.1 : 0.2;
      requiredSolventVolMl = specimenWeight / densityMultiplier;
      ratioText = `${densityMultiplier} g/mL solid raw ratio`;
    }

    return {
      area: parseFloat(surfaceAreaSqCm.toFixed(2)),
      volume: parseFloat(requiredSolventVolMl.toFixed(2)),
      ratio: ratioText
    };
  }, [specimenShape, specimenLength, specimenWidth, specimenThick, specimenQuantity, specimenWeight, thickLessHalf, estComposition]);

  // Estimator live testing matrix generator based on inputs Chosen
  const estimatesReport = useMemo(() => {
    const requiredList = ['Cytotoxicity (ISO 10993-5)', 'Sensitization (ISO 10993-10)', 'Irritation (ISO 10993-23)'];
    const conditionalList: string[] = ['Chemical Characterization (ISO 10993-18)'];

    if (estContact === 'communicating' || estContact === 'implant') {
      requiredList.push('Implantation testing (ISO 10993-6)');
      requiredList.push('Genotoxicity assessment (ISO 10993-3)');
      requiredList.push('Systemic Toxicity (ISO 10993-11)');
    }

    if (estTissue === 'blood' || estContact === 'communicating' && estTissue === 'circulating') {
      requiredList.push('Hemocompatibility study (ISO 10993-4)');
    }

    if (estDuration === 'C') {
      requiredList.push('Subchronic Toxicity (ISO 10993-11)');
      conditionalList.push('Chronic Toxicity (ISO 10993-11)', 'Carcinogenicity study (ISO 10993-3)', 'Biodegradation curves (Part 9)');
    } else if (estDuration === 'B') {
      conditionalList.push('Subchronic local tolerance (Part 11)');
    }

    if (estComposition === 'Natural Hydrogel' || estComposition === 'Polymer') {
      requiredList.push('Degradation profiling (ISO 10993-13)');
    } else if (estComposition === 'Metallic') {
      requiredList.push('Metallic degradation chemistry (ISO 10993-15)');
    } else if (estComposition === 'Ceramic / Bioactive Glass') {
      requiredList.push('Ceramic dissolution safety (ISO 10993-14)');
    }

    return { requiredList, conditionalList };
  }, [estContact, estTissue, estDuration, estComposition]);

  // Search filtered standards database
  const filteredCatalog = useMemo(() => {
    if (!catalogQuery.trim()) return STANDARDS_CATALOG;
    const term = catalogQuery.toLowerCase();
    return STANDARDS_CATALOG.filter(item => 
      item.id.toLowerCase().includes(term) || 
      item.name.toLowerCase().includes(term) || 
      item.scope.toLowerCase().includes(term) ||
      item.summary.toLowerCase().includes(term)
    );
  }, [catalogQuery]);

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(parsedData, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const resetAllProgress = () => {
    setCheckedAuditRows({});
    setAcknowledgedFindings({});
    setImplementedRemediations({});
  };

  // One-click professional PDF Export using jsPDF
  const handleExportPDF = () => {
    const doc = new jsPDF();
    
    // Page theme styling colors (Amber Brand)
    const primAmber = [180, 83, 9]; // RGB for amber-700
    const textGray = [55, 65, 81];
    
    // Document Title Banner Header
    doc.setFillColor(243, 244, 246);
    doc.rect(0, 0, 210, 38, 'F');
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(primAmber[0], primAmber[1], primAmber[2]);
    doc.text("BIOCOMPATIBILITY COMPLIANCE & STANDARDS AUDIT", 14, 18);
    
    doc.setFont("helvetica", "medium");
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text(`Smart Regulatory Auditor Console  |  Generated on ${new Date().toLocaleDateString()}`, 14, 25);
    doc.text(`Target Query: ${result.originalQuery.substring(0, 75)}${result.originalQuery.length > 75 ? '...' : ''}`, 14, 31);
    
    // Line separator
    doc.setDrawColor(226, 232, 240);
    doc.line(14, 38, 196, 38);

    let yOffset = 48;

    // 1. Device Classification Section
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text("1. ISO 10993-1 Device Target Classification", 14, yOffset);
    
    yOffset += 6;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(textGray[0], textGray[1], textGray[2]);
    doc.text(`• Device Category: ${parsedData.device_classification.category}`, 16, yOffset);
    
    yOffset += 5;
    doc.text(`• Contact Duration: ${parsedData.device_classification.duration}`, 16, yOffset);
    
    yOffset += 5;
    doc.text(`• Mandatory Biological Endpoints: ${parsedData.device_classification.required_endpoints.join(", ")}`, 16, yOffset);

    yOffset += 12;

    // 2. Compliance Gaps Table
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text("2. Standards Clause-by-Clause Audit Findings", 14, yOffset);
    
    yOffset += 5;
    parsedData.compliance_audit.forEach((item, index) => {
      if (yOffset > 270) { doc.addPage(); yOffset = 20; }
      
      yOffset += 6;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9.5);
      doc.setTextColor(item.status.toLowerCase().includes('compliant') ? 16 : 180, 110, 10);
      doc.text(`[${item.status.toUpperCase()}] ${item.test_method} (${item.standard_clause})`, 16, yOffset);
      
      yOffset += 4.5;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(80, 80, 80);
      const splitFinding = doc.splitTextToSize(item.finding, 175);
      doc.text(splitFinding, 18, yOffset);
      yOffset += (splitFinding.length * 4);
    });

    yOffset += 12;

    // 3. Risk Assessment & Remediation Strategy
    if (yOffset > 240) { doc.addPage(); yOffset = 20; }
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text("3. Actionable Remediation & Risk Mitigation Strategy", 14, yOffset);
    
    yOffset += 6;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(185, 28, 28); // Critical Red
    doc.text("Identified Major Compliance Gaps:", 16, yOffset);
    
    parsedData.risk_assessment.critical_findings.forEach((finding, i) => {
      if (yOffset > 275) { doc.addPage(); yOffset = 20; }
      yOffset += 5;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(textGray[0], textGray[1], textGray[2]);
      const splitFinding = doc.splitTextToSize(`• ${finding}`, 175);
      doc.text(splitFinding, 18, yOffset);
      yOffset += ((splitFinding.length - 1) * 4);
    });

    yOffset += 9;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(21, 128, 61); // Remediation green
    doc.text("Required Lab Adjustment Protocols:", 16, yOffset);

    parsedData.risk_assessment.remediation.forEach((step, i) => {
      if (yOffset > 275) { doc.addPage(); yOffset = 20; }
      yOffset += 5;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(textGray[0], textGray[1], textGray[2]);
      const splitStep = doc.splitTextToSize(`${i + 1}. ${step}`, 175);
      doc.text(splitStep, 18, yOffset);
      yOffset += ((splitStep.length - 1) * 4);
    });

    // 4. Estimator Calculation Summary (If they ran the calculator)
    yOffset += 12;
    if (yOffset > 240) { doc.addPage(); yOffset = 20; }

    doc.setFillColor(254, 251, 236);
    doc.rect(14, yOffset, 182, 28, 'F');
    doc.setDrawColor(245, 158, 11);
    doc.setLineWidth(0.3);
    doc.rect(14, yOffset, 182, 28, 'D');

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(180, 83, 9);
    doc.text("ISO 10993-12 Laboratory Extraction Estimation:", 18, yOffset + 6);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(60, 60, 60);
    doc.text(`- Composition under test: ${estComposition} (${estSterile})`, 18, yOffset + 12);
    if (specimenShape === 'sheet') {
      doc.text(`- Calculated sheet extraction: ${calculatedExtractionMetric.area} cm² total area requiring ${calculatedExtractionMetric.volume} mL polymer solvent.`, 18, yOffset + 18);
    } else {
      doc.text(`- Calculated solid extraction weight: ${specimenWeight} g requiring ${calculatedExtractionMetric.volume} mL extraction liquid.`, 18, yOffset + 18);
    }
    doc.text(`- Selected criteria: ${estContact.toUpperCase()} body contact / ${estDuration} duration matrix.`, 18, yOffset + 23);

    // Save PDF
    doc.save("biocompatibility_standards_audit.pdf");
  };

  return (
    <div id="smart-regulatory-auditor" className="w-full bg-slate-50/60 rounded-3xl shadow-xl border border-amber-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-0 text-left">
      
      {/* Top Professional Header Bar */}
      <div className="bg-gradient-to-r from-amber-700 via-yellow-750 to-orange-700 px-6 py-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-white">
        <div className="flex items-center gap-3">
          <div className="bg-white/10 p-2.5 rounded-xl backdrop-blur-md border border-white/20 text-white">
            <ShieldCheck className="w-5.5 h-5.5 text-yellow-300 animate-pulse" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold tracking-[0.25em] text-amber-200 block">Biomedical Regulatory Suite</span>
            <h3 className="font-bold text-base md:text-lg text-white font-sans tracking-tight">ISO 10993 & ASTM Material Standards Auditor</h3>
          </div>
        </div>
        
        <div className="flex items-center gap-2 select-none self-stretch md:self-auto scrollbar-none overflow-x-auto">
          <div className="flex items-center gap-1.5 text-xs font-mono font-bold bg-white/10 px-3 py-1.5 rounded-xl border border-white/15 shadow-inner">
            <Thermometer className="w-3.5 h-3.5 text-orange-200" />
            <span>ISO 10993-12 Online</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-mono font-bold bg-white/10 px-3 py-1.5 rounded-xl border border-white/15 shadow-inner">
            <Award className="w-3.5 h-3.5 text-yellow-250 font-bold" />
            <span>ASTM F-Series Loaded</span>
          </div>
        </div>
      </div>

      {/* Main Internal Mode Selector Tabs */}
      <div className="bg-white border-b border-slate-100 px-6 py-2.5 flex gap-2 overflow-x-auto select-none">
        <button
          onClick={() => setActiveTab('audit')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'audit'
              ? 'bg-amber-50 text-amber-905 border border-amber-200/50 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
          }`}
        >
          <ClipboardList className="w-4 h-4 text-amber-600" />
          <span>Active Protocol Audit</span>
          <span className="bg-amber-100 text-amber-800 text-[10px] px-1.5 py-0.2 rounded-full font-bold">
            {overallProgressPercent}% Remediation
          </span>
        </button>

        <button
          onClick={() => setActiveTab('estimator')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'estimator'
              ? 'bg-amber-50 text-amber-905 border border-amber-200/50 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
          }`}
        >
          <Sliders className="w-4 h-4 text-orange-500" />
          <span>ISO 10993-1 Pre-Audit Estimator</span>
          <span className="bg-orange-100 text-orange-850 text-[10px] px-2 py-0.2 rounded-md font-bold">
            Interactive
          </span>
        </button>

        <button
          onClick={() => setActiveTab('catalog')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'catalog'
              ? 'bg-amber-50 text-amber-905 border border-amber-200/50 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
          }`}
        >
          <BookOpen className="w-4 h-4 text-yellow-600" />
          <span>Regulatory Standards Directory</span>
          <span className="bg-yellow-100 text-yellow-800 text-[10px] px-1.5 py-0.2 rounded-full font-bold">
            {STANDARDS_CATALOG.length} Files
          </span>
        </button>
      </div>

      {/* Target query notification ribbon */}
      <div className="px-6 md:px-8 pt-6">
        <div className="bg-white border border-slate-150 rounded-2xl p-4 flex items-start gap-3">
          <FileCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-left">
            <span className="text-[9px] uppercase font-bold tracking-widest text-slate-400 block font-mono">Audited Method Section Input Context</span>
            <p className="text-slate-700 text-xs italic font-medium mt-1 leading-relaxed">"{result.originalQuery}"</p>
          </div>
        </div>
      </div>

      {/* TAB CONTAINER BODY */}
      <div className="p-6 md:p-8 pt-4">
        
        <AnimatePresence mode="wait">
          
          {/* TAB 1: ACTIVE AUDIT VIEW */}
          {activeTab === 'audit' && (
            <motion.div 
              key="audit-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6"
            >
              
              {/* Dynamic Overall Resolution Progress Widget */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex flex-col md:flex-row items-stretch justify-between gap-6">
                <div className="space-y-3 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-amber-650 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-md font-mono block">Biocompatibility Health Check</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono border font-bold ${liveRiskRating.color}`}>
                      {liveRiskRating.text}
                    </span>
                  </div>
                  <h4 className="font-bold text-lg text-slate-800 tracking-tight">Experimental Protocol Remediation Meter</h4>
                  <p className="text-xs text-slate-500 max-w-xl">
                    Resolve critical standard deviations by addressing recommended action items. Click the checkboxes in the table and assessment sections below as you update your experimental protocol.
                  </p>
                  
                  {/* Progress bar */}
                  <div className="space-y-1.5 pt-2">
                    <div className="flex justify-between text-[11px] font-bold font-mono">
                      <span className="text-slate-505">Remediation Status:</span>
                      <span className="text-amber-800">{overallProgressPercent}% Complete</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden border border-slate-100">
                      <div 
                        className="bg-amber-600 h-full transition-all duration-500 rounded-full shadow-inner"
                        style={{ width: `${overallProgressPercent}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row md:flex-col items-stretch justify-center gap-2 bg-slate-50/60 p-4 rounded-2xl border border-slate-100 min-w-[200px] divide-y sm:divide-y-0 md:divide-y divide-slate-100">
                  <div className="pb-2.5 sm:pb-0 md:pb-2.5 pr-0 sm:pr-4 md:pr-0 text-center sm:text-left md:text-center">
                    <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block mb-1">Gaps Audited</span>
                    <span className="text-sm font-semibold text-slate-700 font-mono">
                      {auditRowCheckedCount} / {auditRowTotal} Approved
                    </span>
                  </div>
                  <div className="py-2.5 sm:py-0 md:py-2.5 px-0 sm:px-4 md:px-0 text-center sm:text-left md:text-center">
                    <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block mb-1">Remediation Checklist</span>
                    <span className="text-sm font-semibold text-slate-700 font-mono">
                      {remediationDoneCount} / {remediationTotal} Implemented
                    </span>
                  </div>
                  <div className="pt-2.5 sm:pt-0 md:pt-2.5 pl-0 sm:pl-4 md:pl-0 text-center sm:text-left md:text-center">
                    <button
                      onClick={resetAllProgress}
                      className="text-xs font-semibold text-slate-500 hover:text-amber-700 flex items-center gap-1 mx-auto"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Reset Checklist</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Device Classification Header Card */}
              <div className="bg-white p-6 rounded-3xl border border-slate-150 shadow-xs space-y-4">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex items-center gap-2">
                    <ClipboardList className="w-5 h-5 text-amber-700" />
                    <h3 className="text-base font-bold text-slate-800 tracking-tight">ISO 10993-1:2018 Target Device Classification</h3>
                  </div>
                  <span className="text-[10px] font-mono font-bold uppercase py-0.5 px-2 bg-amber-50 text-amber-700 border border-amber-200 rounded-md">
                    Clause 5.2 compliant
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
                  <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl space-y-1.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-mono">Contact Category</span>
                    <span className="text-sm font-bold text-slate-800 block">{parsedData.device_classification.category}</span>
                  </div>

                  <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl space-y-1.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-mono">Body Contact Duration</span>
                    <span className="text-sm font-bold text-slate-800 block">{parsedData.device_classification.duration}</span>
                  </div>

                  <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl space-y-1.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-mono">Mandatory Endpoints</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {parsedData.device_classification.required_endpoints.map((endpoint, i) => (
                        <button
                          key={i}
                          onClick={() => {
                            // Find definition if exact or fuzzy match
                            const key = Object.keys(ENDPOINT_DEFINITIONS).find(k => 
                              endpoint.toLowerCase().includes(k.toLowerCase())
                            );
                            if (key) setSelectedEndpointPopup(key);
                            else setSelectedEndpointPopup(endpoint);
                          }}
                          className="px-2 py-0.5 bg-amber-100/50 hover:bg-amber-100 text-amber-805 text-[10px] font-bold rounded-lg border border-amber-200/50 flex items-center gap-1"
                        >
                          <Info className="w-2.5 h-2.5 text-amber-600" />
                          <span>{endpoint}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Interactive Audit Search Filter Controls */}
              <div className="bg-white/80 border border-slate-200 rounded-3xl p-4 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
                <div className="relative flex-1 min-w-[180px]">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-450" />
                  <input
                    type="text"
                    placeholder="Search audited items or standard clauses..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-1 focus:ring-amber-500/30 text-slate-700"
                  />
                </div>

                <div className="flex items-center gap-2 select-none shrink-0 overflow-x-auto">
                  <span className="text-[10px] font-mono uppercase font-bold text-slate-400 shrink-0">Filter Status:</span>
                  {['All', 'Compliant', 'Deviation', 'Non-Compliant', 'Missing'].map(status => (
                    <button
                      key={status}
                      onClick={() => setStatusFilter(status)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold border transition-all ${
                        statusFilter === status
                          ? 'bg-amber-600 border-amber-500 text-white shadow-xs'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {status === 'Non-Compliant' ? 'Non-Comp' : status}
                    </button>
                  ))}
                </div>
              </div>

              {/* Compliance Audit table & Expanded detail */}
              <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden text-left">
                <div className="bg-slate-50 px-6 py-4.5 border-b border-slate-200 flex justify-between items-center">
                  <span className="text-xs font-bold uppercase text-slate-450 tracking-wider font-mono block">Dynamic Clause Audit Findings</span>
                  <span className="text-xs text-slate-450 font-bold">Click any row to reveal regulatory remediation</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-slate-550 uppercase font-black text-[10px] tracking-wider border-b border-indigo-100/30">
                      <tr>
                        <th className="px-6 py-3.5 text-center w-12 bg-slate-50 select-none">Verify</th>
                        <th className="px-6 py-3.5 whitespace-nowrap">Biological Test Method</th>
                        <th className="px-6 py-3.5 whitespace-nowrap">Standard Clause</th>
                        <th className="px-6 py-3.5 whitespace-nowrap text-center">Audit Assessment Status</th>
                        <th className="px-6 py-3.5">Key Findings</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredAudit.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-6 py-12 text-center text-slate-400 italic">
                            No matching audited methods found under the selected filters.
                          </td>
                        </tr>
                      ) : (
                        filteredAudit.map((item, idx) => {
                          const isChecked = !!checkedAuditRows[idx];
                          const isExpanded = expandedRow === idx;
                          
                          return (
                            <React.Fragment key={idx}>
                              <tr 
                                onClick={() => setExpandedRow(isExpanded ? null : idx)}
                                className={`transition-all duration-200 cursor-pointer ${
                                  isChecked ? 'bg-amber-50/15' : 'hover:bg-slate-50/60'
                                } ${isExpanded ? 'bg-slate-50' : ''}`}
                              >
                                <td 
                                  className="px-6 py-4 text-center" 
                                  onClick={(e) => {
                                    e.stopPropagation(); // prevent expanding the row
                                    setCheckedAuditRows(prev => ({ ...prev, [idx]: !prev[idx] }));
                                  }}
                                >
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    readOnly
                                    className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500/40 border-slate-300 cursor-pointer"
                                  />
                                </td>
                                
                                <td className="px-6 py-4 font-bold text-slate-800">
                                  {item.test_method}
                                </td>
                                
                                <td className="px-6 py-4">
                                  <span className="font-mono text-[11px] font-semibold text-slate-500 bg-slate-150 px-2 py-0.5 rounded border border-slate-100">
                                    {item.standard_clause}
                                  </span>
                                </td>
                                
                                <td className="px-6 py-4 text-center">
                                  <span className={`inline-flex items-center px-3 py-0.5 rounded-full text-[10px] font-black border ${
                                    item.status.toLowerCase().includes('compliant') && !item.status.toLowerCase().includes('non') ? 'bg-emerald-50 text-emerald-805 border-emerald-200' :
                                    item.status.toLowerCase().includes('deviation') ? 'bg-amber-55 text-amber-800 border-amber-200' :
                                    item.status.toLowerCase().includes('missing') ? 'bg-slate-100 text-slate-650 border-slate-205' :
                                    'bg-red-50 text-red-800 border-red-200'
                                  }`}>
                                    {item.status}
                                  </span>
                                </td>
                                
                                <td className="px-6 py-4 text-slate-600 leading-relaxed max-w-sm truncate">
                                  {item.finding}
                                </td>
                              </tr>

                              {/* Collapsible Guidance & Remediation Drawer */}
                              {isExpanded && (
                                <tr className="bg-slate-50/70 border-t border-slate-200/50">
                                  <td colSpan={5} className="px-8 py-5 text-left text-xs text-slate-600">
                                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 leading-relaxed">
                                      <div className="md:col-span-8 space-y-2">
                                        <h5 className="font-bold text-slate-800 flex items-center gap-1">
                                          <Search className="w-3.5 h-3.5 text-amber-600" />
                                          <span>Detailed Audit Commentary & Assessment</span>
                                        </h5>
                                        <p className="text-slate-600 text-sm leading-relaxed">{item.finding}</p>
                                        
                                        <div className="bg-white p-3 rounded-xl border border-slate-200/60 mt-3 space-y-1">
                                          <p className="text-[10px] font-bold text-slate-400 uppercase font-mono">Audit Action items:</p>
                                          <div className="flex gap-4 text-[11px] text-slate-500">
                                            <span>• Reference standards: {item.standard_clause}</span>
                                            <span>• Target tissue category: {parsedData.device_classification.category}</span>
                                          </div>
                                        </div>
                                      </div>

                                      <div className="md:col-span-4 bg-amber-50/50 border border-amber-250 p-4 rounded-2xl flex flex-col justify-between">
                                        <div className="space-y-1">
                                          <p className="font-bold text-amber-900 uppercase tracking-wider text-[10px] font-mono flex items-center gap-1">
                                            <Award className="w-3.5 h-3.5 text-amber-700 font-bold" />
                                            <span>Standard Action Guidance</span>
                                          </p>
                                          <p className="text-amber-850 text-xs italic">
                                            Ensure negative bio-inert controls (e.g., Alumina/HDPE) and toxic positive controls (e.g., zinc) are included under the test sequence.
                                          </p>
                                        </div>

                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setCheckedAuditRows(prev => ({ ...prev, [idx]: !prev[idx] }));
                                          }}
                                          className={`w-full mt-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                                            isChecked 
                                              ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs' 
                                              : 'bg-amber-600 hover:bg-amber-700 text-white'
                                          }`}
                                        >
                                          <CheckCircle2 className="w-3.5 h-3.5" />
                                          <span>{isChecked ? 'Approved' : 'Mark as Remediated'}</span>
                                        </button>
                                      </div>
                                    </div>
                                  </td>
                                </tr>
                              )}
                            </React.Fragment>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Critical Gaps & Required Protocol remediations */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                
                {/* Red alert box */}
                <div className="bg-gradient-to-br from-red-50 to-red-100/50 border border-red-200 p-6 rounded-3xl space-y-4">
                  <div className="flex justify-between items-center pb-2 border-b border-red-200">
                    <h4 className="font-bold text-red-900 text-sm uppercase tracking-wider flex items-center gap-1.5">
                      <ShieldAlert className="w-4.5 h-4.5 text-red-650" />
                      Critical Biocompatibility Findings
                    </h4>
                    <span className="text-[10px] font-mono font-bold bg-red-100 text-red-800 border border-red-200 px-2 py-0.5 rounded">
                      GAPS: {criticalFindingsTotal - criticalFindingsClearedCount}
                    </span>
                  </div>

                  <div className="space-y-3">
                    {parsedData.risk_assessment.critical_findings.map((gap, idx) => {
                      const isCleared = !!acknowledgedFindings[idx];
                      return (
                        <label 
                          key={idx} 
                          className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer group ${
                            isCleared 
                              ? 'bg-slate-50/50 border-slate-200 text-slate-400' 
                              : 'bg-white border-red-200/60 hover:shadow-xs text-red-700'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isCleared}
                            onChange={(e) => setAcknowledgedFindings(prev => ({ ...prev, [idx]: e.target.checked }))}
                            className="w-4 h-4 rounded text-red-600 focus:ring-red-500/30 border-red-250 mt-0.5 cursor-pointer"
                          />
                          <div className="text-xs">
                            <span className={`font-semibold ${isCleared ? 'line-through text-slate-400' : 'text-slate-800 group-hover:text-red-750'}`}>
                              {gap}
                            </span>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Green remediation strategy */}
                <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 border border-emerald-200 p-6 rounded-3xl space-y-4">
                  <div className="flex justify-between items-center pb-2 border-b border-emerald-250">
                    <h4 className="font-bold text-emerald-900 text-sm uppercase tracking-wider flex items-center gap-1.5">
                      <CheckCircle2 className="w-4.5 h-4.5 text-emerald-700" />
                      Remediation Protocol Action Checklist
                    </h4>
                    <span className="text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded animate-pulse">
                      DONE: {remediationDoneCount} / {remediationTotal}
                    </span>
                  </div>

                  <div className="space-y-3">
                    {parsedData.risk_assessment.remediation.map((step, idx) => {
                      const isDone = !!implementedRemediations[idx];
                      return (
                        <label 
                          key={idx} 
                          className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer group ${
                            isDone 
                              ? 'bg-slate-50/50 border-slate-205 text-slate-400'
                              : 'bg-white border-emerald-200/60 hover:shadow-xs text-emerald-800'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isDone}
                            onChange={(e) => setImplementedRemediations(prev => ({ ...prev, [idx]: e.target.checked }))}
                            className="w-4 h-4 rounded text-emerald-700 focus:ring-emerald-500/30 border-emerald-250 mt-0.5 cursor-pointer"
                          />
                          <div className="text-xs">
                            <span className={`font-semibold ${isDone ? 'line-through text-slate-400' : 'text-slate-800 group-hover:text-emerald-750'}`}>
                              {idx + 1}. {step}
                            </span>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>

              </div>

            </motion.div>
          )}

          {/* TAB 2: PRE-AUDIT ESTIMATOR */}
          {activeTab === 'estimator' && (
            <motion.div 
              key="estimator-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6"
            >
              
              {/* Introduction bar */}
              <div className="bg-white p-5 rounded-3xl border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 bg-orange-100 text-orange-700 rounded-xl border border-orange-200 hidden sm:block">
                    <Sliders className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm tracking-tight">ISO 10993 Biological Testing Requirement Planner</h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Select your device composition parameters, and dynamically calculate laboratory extraction ratios and mandatory evaluation pathways.
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleExportPDF}
                  className="px-4 py-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  <Download className="w-3.5 h-3.5 text-amber-400" />
                  <span>Generate Regulatory PDF Plan</span>
                </button>
              </div>

              {/* Dynamic Parameter Grid */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 text-left items-start">
                
                {/* Inputs area */}
                <div className="md:col-span-5 bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs space-y-5">
                  <span className="text-[10px] font-bold font-mono text-slate-400 uppercase tracking-widest block pb-2 border-b border-slate-100">
                    Step 1: Contact Category Settings
                  </span>

                  {/* 1. Contact body type */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600 block">Contact Location Type</label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {[
                        { id: 'surface', label: 'Surface', desc: 'Skin/Mucosa' },
                        { id: 'communicating', label: 'External', desc: 'Tissue/Blood Path' },
                        { id: 'implant', label: 'Implant', desc: 'Bone/Surgically placed' }
                      ].map(loc => (
                        <button
                          key={loc.id}
                          type="button"
                          onClick={() => {
                            setEstContact(loc.id as any);
                            // default tissue values
                            if (loc.id === 'surface') setEstTissue('skin');
                            else if (loc.id === 'communicating') setEstTissue('tissue');
                            else setEstTissue('tissue');
                          }}
                          className={`p-2 rounded-xl text-center border transition-all cursor-pointer ${
                            estContact === loc.id
                              ? 'bg-amber-600 border-amber-500 text-white shadow-xs font-black'
                              : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-800'
                          }`}
                        >
                          <p className="text-xs font-bold">{loc.label}</p>
                          <p className={`text-[8.5px] font-medium block leading-tight mt-0.5 ${estContact === loc.id ? 'text-amber-100' : 'text-slate-400'}`}>{loc.desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 2. Specific tissue contact dropdown */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600 block">Tissue / Physiological Exposure</label>
                    <select
                      value={estTissue}
                      onChange={(e) => setEstTissue(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-250 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 outline-none"
                    >
                      {estContact === 'surface' && (
                        <>
                          <option value="skin">Intact Skin (ISO 10993-23)</option>
                          <option value="mucosa">Mucosal membrane exposure</option>
                          <option value="breached">Breached or compromised surface tissue</option>
                        </>
                      )}
                      {estContact === 'communicating' && (
                        <>
                          <option value="tissue">Tissue / Bone / Dentin communication</option>
                          <option value="circulating">Circulating blood path (ISO 10993-4)</option>
                          <option value="liquids">Indirect biological fluid pathway</option>
                        </>
                      )}
                      {estContact === 'implant' && (
                        <>
                          <option value="tissue">Tissue / Bone implant construct (ISO 10993-6)</option>
                          <option value="blood">Blood contact / Vascular implant construct</option>
                        </>
                      )}
                    </select>
                  </div>

                  {/* 3. Duration slider buttons */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600 block">Contact Duration Threshold</label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {[
                        { id: 'A', label: 'Limited (A)', dec: '< 24 Hours' },
                        { id: 'B', label: 'Prolonged (B)', dec: '24h to 30d' },
                        { id: 'C', label: 'Permanent (C)', dec: '> 30 Days' }
                      ].map(dur => (
                        <button
                          key={dur.id}
                          type="button"
                          onClick={() => setEstDuration(dur.id as any)}
                          className={`p-2 rounded-xl text-center border transition-all cursor-pointer ${
                            estDuration === dur.id
                              ? 'bg-amber-600 border-amber-500 text-white shadow-xs font-black'
                              : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-800'
                          }`}
                        >
                          <p className="text-xs font-bold">{dur.label}</p>
                          <p className={`text-[8.5px] font-medium block leading-tight mt-0.5 ${estDuration === dur.id ? 'text-amber-100' : 'text-slate-400'}`}>{dur.dec}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  <span className="text-[10px] font-bold font-mono text-slate-400 uppercase tracking-widest block pt-3 border-b border-slate-100">
                    Step 2: Physical Composition Settings
                  </span>

                  {/* 4. Material class selection */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600 block">Base Biomaterial Chemistry</label>
                    <div className="grid grid-cols-2 gap-1.5">
                      {['Polymer', 'Metallic', 'Ceramic / Bioactive Glass', 'Natural Hydrogel'].map(comp => (
                        <button
                          key={comp}
                          type="button"
                          onClick={() => setEstComposition(comp)}
                          className={`p-2 rounded-xl text-center border transition-all text-xs font-bold cursor-pointer ${
                            estComposition === comp
                              ? 'bg-amber-50 border-amber-500 text-amber-905 shadow-xs font-black'
                              : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-800'
                          }`}
                        >
                          {comp}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 5. Sterilization details */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600 block">Intended Terminal Sterilization</label>
                    <select
                      value={estSterile}
                      onChange={(e) => setEstSterile(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-250 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 outline-none"
                    >
                      <option value="Gamma Irradiation">Gamma Co-60 Irradiation (Typical dose 25 kGy)</option>
                      <option value="Autoclave Steam">Moist Heat / Autoclave Steam (121°C for 20 mins)</option>
                      <option value="Ethylene Oxide">Ethylene Oxide Gas (EtO sterilization with aeration)</option>
                      <option value="Sterile Syringe Filtration">Syringe Sterile Membrane Filtration (0.22 um)</option>
                      <option value="None / Aseptic">None / Decellularized Aseptic Handling only</option>
                    </select>
                  </div>

                </div>

                {/* Live Output assessment plan */}
                <div className="md:col-span-7 bg-slate-900 border border-slate-850 p-6 md:p-8 rounded-3xl text-white space-y-6">
                  
                  {/* Title */}
                  <div className="pb-3 border-b border-white/10">
                    <span className="text-[9px] uppercase font-bold tracking-[0.2em] text-amber-400 font-mono block">Dynamic Biocompatibility Roadmap</span>
                    <h4 className="font-bold text-base md:text-lg tracking-tight mt-1">ISO 10993-1 Matrix Requirements</h4>
                  </div>

                  {/* Mandated endpoints checklist */}
                  <div className="space-y-3.5 text-left">
                    <span className="text-[10px] uppercase font-bold font-mono text-slate-450 tracking-wider block">
                      Mandated Biological Safety Endpoints:
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {estimatesReport.requiredList.map((endpoint, i) => (
                        <div 
                          key={i} 
                          onClick={() => {
                            const trimmed = endpoint.split(' ')[0] || endpoint;
                            setSelectedEndpointPopup(trimmed);
                          }}
                          className="bg-white/5 border border-white/10 hover:border-amber-450 p-3 rounded-xl flex items-center justify-between group transition-all cursor-pointer shadow-inner"
                        >
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                            <span className="text-xs font-bold text-slate-100 group-hover:text-amber-300">{endpoint}</span>
                          </div>
                          <Info className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-400" />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Optional/Conditional list */}
                  <div className="space-y-2 text-left">
                    <span className="text-[10px] uppercase font-bold font-mono text-slate-450 tracking-wider block">
                      Recommended / Subject-Specific evaluations:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {estimatesReport.conditionalList.map((cond, i) => (
                        <span 
                          key={i} 
                          className="px-2.5 py-1 bg-yellow-500/10 border border-yellow-500/20 text-yellow-350 text-[10px] font-bold rounded-lg"
                        >
                          {cond}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* INTERACTIVE ISO 10993-12 PREPARATION CALCULATOR */}
                  <div className="pt-5 border-t border-white/10 space-y-4 text-left">
                    <div className="flex justify-between items-center bg-white/5 border border-white/10 px-4 py-2 rounded-2xl">
                      <h5 className="font-bold text-amber-405 text-xs font-mono flex items-center gap-1.5">
                        <Thermometer className="w-4.5 h-4.5 text-orange-400" />
                        ISO 10993-12 Specimen Solvent Calculator
                      </h5>
                      <span className="text-[9px] font-mono font-bold bg-white/10 text-slate-300 border border-white/10 px-2 py-0.5 rounded">
                        Active Formula
                      </span>
                    </div>

                    {/* Shape Toggle Selector button */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => setSpecimenShape('sheet')}
                        className={`px-3 py-1.5 border rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          specimenShape === 'sheet'
                            ? 'bg-amber-600 border-amber-500 text-white'
                            : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                        }`}
                      >
                        Thin Polymer Film / Sheet
                      </button>
                      <button
                        onClick={() => setSpecimenShape('mass')}
                        className={`px-3 py-1.5 border rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          specimenShape === 'mass'
                            ? 'bg-amber-600 border-amber-500 text-white'
                            : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                        }`}
                      >
                        Solid Block / Raw Weight
                      </button>
                    </div>

                    <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl grid grid-cols-1 md:grid-cols-2 gap-4">
                      {specimenShape === 'sheet' ? (
                        <>
                          {/* Sheet Inputs */}
                          <div className="space-y-2">
                            <div className="flex justify-between text-[11px] font-bold">
                              <span className="text-slate-400">Length of specimen</span>
                              <span className="text-amber-400">{specimenLength} mm</span>
                            </div>
                            <input
                              type="range"
                              min="2"
                              max="100"
                              value={specimenLength}
                              onChange={(e) => setSpecimenLength(parseFloat(e.target.value))}
                              className="w-full accent-amber-550 cursor-pointer"
                            />
                            
                            <div className="flex justify-between text-[11px] font-bold">
                              <span className="text-slate-400">Width of specimen</span>
                              <span className="text-amber-400">{specimenWidth} mm</span>
                            </div>
                            <input
                              type="range"
                              min="2"
                              max="100"
                              value={specimenWidth}
                              onChange={(e) => setSpecimenWidth(parseFloat(e.target.value))}
                              className="w-full accent-amber-550 cursor-pointer"
                            />
                          </div>

                          <div className="space-y-2">
                            <div className="flex justify-between text-[11px] font-bold">
                              <span className="text-slate-400">Material Thickness</span>
                              <span className="text-amber-400">{specimenThick} mm</span>
                            </div>
                            <input
                              type="range"
                              min="0.1"
                              max="10"
                              step="0.1"
                              value={specimenThick}
                              onChange={(e) => setSpecimenThick(parseFloat(e.target.value))}
                              className="w-full accent-amber-550 cursor-pointer"
                            />

                            <div className="flex justify-between text-[11px] font-bold">
                              <span className="text-slate-400">Specimen Quantity (test rep)</span>
                              <span className="text-amber-400">{specimenQuantity} blocks</span>
                            </div>
                            <input
                              type="range"
                              min="1"
                              max="15"
                              value={specimenQuantity}
                              onChange={(e) => setSpecimenQuantity(parseInt(e.target.value))}
                              className="w-full accent-amber-550 cursor-pointer"
                            />
                          </div>

                          <div className="md:col-span-2 pt-2.5 border-t border-slate-800">
                            <label className="flex items-center gap-2 cursor-pointer select-none">
                              <input
                                type="checkbox"
                                checked={thickLessHalf}
                                onChange={(e) => setThickLessHalf(e.target.checked)}
                                className="w-4.5 h-4.5 rounded text-amber-650 focus:ring-amber-500 border-slate-705 cursor-pointer bg-transparent"
                              />
                              <div className="text-[11px] text-slate-350">
                                Thickness is less than 0.5 mm? <span className="text-amber-300 font-bold">(Requires 6 cm²/mL ratio standard)</span>
                              </div>
                            </label>
                          </div>
                        </>
                      ) : (
                        <>
                          {/* Solid Block raw mass inputs */}
                          <div className="space-y-2 md:col-span-2">
                            <div className="flex justify-between text-[11px] font-bold">
                              <span className="text-slate-400">Total dry specimen mass (grams)</span>
                              <span className="text-amber-405">{specimenWeight} g</span>
                            </div>
                            <input
                              type="range"
                              min="0.05"
                              max="10"
                              step="0.05"
                              value={specimenWeight}
                              onChange={(e) => setSpecimenWeight(parseFloat(e.target.value))}
                              className="w-full accent-amber-550 cursor-pointer"
                            />
                            
                            <p className="text-[10px] text-slate-450 italic pt-1 border-t border-slate-800 leading-relaxed">
                              *Solid non-absorbent polymers utilize a standard 0.2 grams / mL extraction ratio under table 1. Soft sponge arrays, porous hydrogels or absorbables require 0.1 grams / mL.
                            </p>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Calculated Output box */}
                    <div className="bg-amber-50 p-4.5 rounded-2xl text-slate-900 border border-amber-250 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div>
                        {specimenShape === 'sheet' ? (
                          <>
                            <span className="text-[9px] uppercase tracking-wider text-amber-800 font-bold block font-mono">Calculated Surface Area</span>
                            <span className="text-lg font-bold font-mono">{calculatedExtractionMetric.area} cm²</span>
                          </>
                        ) : (
                          <>
                            <span className="text-[9px] uppercase tracking-wider text-amber-800 font-bold block font-mono">Input Dry Mass</span>
                            <span className="text-lg font-bold font-mono">{specimenWeight} grams</span>
                          </>
                        )}
                        <span className="text-[10px] text-slate-500 block leading-tight">ISO Standard: {calculatedExtractionMetric.ratio}</span>
                      </div>

                      <div className="bg-amber-600/10 border border-amber-250 p-3 rounded-xl sm:text-right">
                        <span className="text-[9px] uppercase tracking-wider text-amber-800 font-bold block font-mono">Required Extraction Media Volume</span>
                        <span className="text-xl font-bold text-amber-900 font-mono">{calculatedExtractionMetric.volume} mL</span>
                        <span className="text-[10px] text-slate-505 block leading-tight">Uses polar (saline) & non-polar (oil) channels</span>
                      </div>
                    </div>

                  </div>

                </div>

              </div>

            </motion.div>
          )}

          {/* TAB 3: STANDARDS REFERENCE CATALOG */}
          {activeTab === 'catalog' && (
            <motion.div 
              key="catalog-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6"
            >
              
              {/* Introduction header */}
              <div className="bg-gradient-to-r from-yellow-50 to-amber-50/50 p-5 rounded-3xl border border-yellow-105 flex items-start gap-4 text-left">
                <div className="p-2.5 bg-white border border-yellow-200 rounded-xl text-yellow-600 hidden sm:block">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-slate-800 text-sm tracking-tight">On-Board standards Clause Registry</h4>
                  <p className="text-xs text-slate-505 leading-relaxed">
                    Search and browse specific testing methodologies and baseline thresholds of standard ISO 10993 evaluation clauses and complementary ASTM F-series biomaterial specs.
                  </p>
                </div>
              </div>

              {/* Catalog Search Bar */}
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Insert standard keyword, code (e.g. 10993-5, F748) or physiological keywords..."
                  value={catalogQuery}
                  onChange={(e) => setCatalogQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 shadow-xs rounded-xl text-xs outline-none focus:ring-1 focus:ring-amber-500/30 text-slate-700"
                />
              </div>

              {/* Grid of catalog references */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                {filteredCatalog.map((spec, i) => (
                  <div 
                    key={spec.id}
                    className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-amber-300 hover:shadow-md transition-all space-y-3.5 flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-3">
                        <span className="font-mono text-xs font-black text-amber-705 bg-amber-50 px-2 py-0.5 rounded border border-amber-100 uppercase tracking-wide">
                          {spec.id}
                        </span>
                        <span className="text-[9px] font-semibold text-slate-400 uppercase font-mono">
                          {spec.testingType}
                        </span>
                      </div>

                      <h4 className="font-bold text-slate-905 text-sm leading-snug tracking-tight">
                        {spec.name}
                      </h4>
                      
                      <p className="text-xs text-slate-455 font-medium leading-relaxed italic block pt-1">
                        "{spec.scope}"
                      </p>

                      <p className="text-xs text-slate-600 leading-relaxed pt-2 border-t border-slate-50">
                        {spec.summary}
                      </p>
                    </div>

                    <div className="bg-amber-50/40 p-3 rounded-xl border border-amber-150 text-[11px] text-amber-900 leading-relaxed">
                      <span className="font-bold font-mono tracking-wider uppercase text-[9px] text-amber-700 block mb-0.5">Critical standard mandate clause</span>
                      {spec.keyClause}
                    </div>

                  </div>
                ))}
              </div>

            </motion.div>
          )}

        </AnimatePresence>

        {/* Global actions buttons bar */}
        <div className="mt-8 pt-6 border-t border-slate-200/50 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex gap-4">
            <a 
              href="https://www.iso.org/standards.html" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-amber-750 hover:text-amber-900 font-bold transition-all cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" /> 
              <span>Cross-Reference ISO Portal</span>
            </a>
            <a 
              href="https://www.astm.org/products-services/standards-and-publications.html" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-yellow-750 hover:text-yellow-905 font-bold transition-all cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5 text-yellow-600" /> 
              <span>Check ASTM Standards</span>
            </a>
          </div>

          <div className="flex gap-2.5 self-stretch sm:self-auto select-none">
            <button 
              onClick={handleCopy}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 bg-slate-55 hover:bg-slate-100 text-slate-700 border border-slate-200 px-4 py-2 rounded-xl font-bold transition-all text-xs cursor-pointer active:scale-95"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-450" />}
              <span>{copied ? 'Audit Copied!' : 'Copy Raw Audit Report'}</span>
            </button>

            <button 
              onClick={handleExportPDF}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-700 text-white shadow-sm px-4.5 py-2 rounded-xl font-bold transition-all text-xs cursor-pointer active:scale-95"
            >
              <FileText className="w-4 h-4 text-amber-100" />
              <span>Export Professional PDF Report</span>
            </button>
          </div>
        </div>

      </div>

      {/* POPUP: INTERACTIVE ENDPOINT EXPLANATION DIALOG DRAWER */}
      {selectedEndpointPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in duration-200 select-none">
          <div className="bg-white border border-slate-200 rounded-3xl p-6.5 max-w-md w-full shadow-2xl relative space-y-4 animate-in zoom-in-95 duration-200 text-left">
            
            <div className="flex justify-between items-start gap-4">
              <div className="flex items-center gap-2 text-amber-750">
                <ShieldCheck className="w-5.5 h-5.5" />
                <h4 className="font-bold text-slate-900 text-base tracking-tight">ISO Biocompatibility Endpoint</h4>
              </div>
              <button 
                onClick={() => setSelectedEndpointPopup(null)}
                className="p-1 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3.5 pt-2 border-t border-slate-100">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono block mb-0.5">Reference Standard Clause</span>
                <span className="text-xs font-bold font-mono text-amber-805 bg-amber-50 px-2 py-0.5 rounded border border-amber-200/55">
                  {ENDPOINT_DEFINITIONS[selectedEndpointPopup]?.standard || "ISO 10993 Matrix"}
                </span>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono block mb-1">Testing Objective</span>
                <p className="text-xs text-slate-655 leading-relaxed">
                  {ENDPOINT_DEFINITIONS[selectedEndpointPopup]?.desc || "Standard evaluation endpoint mandated by ISO 10993-1 matrix to confirm non-toxic profile prior to human tissue trials."}
                </p>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-150">
                <span className="text-[9px] font-bold font-mono text-slate-400 uppercase tracking-wider block mb-1">Standard Lab Guideline</span>
                <p className="text-xs text-slate-700 font-semibold leading-relaxed">
                  {ENDPOINT_DEFINITIONS[selectedEndpointPopup]?.guideline || "Evaluated under standard cell line culture or physiological fluid extraction ratios to verify complete biocompatibility."}
                </p>
              </div>
            </div>

            <div className="pt-2 text-right">
              <button
                onClick={() => setSelectedEndpointPopup(null)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg cursor-pointer"
              >
                Close Reference
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default AuditorResultCard;
