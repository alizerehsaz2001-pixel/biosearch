import { GoogleGenAI } from "@google/genai";

const SEARCH_SYSTEM_INSTRUCTION = `You are an expert Information Specialist and Biomedical Engineer. Your task is to translate natural language research topics into advanced boolean search strings suitable for PubMed and Scopus.

Follow this strict process:
1. Analyze the user's research topic to identify key concepts (e.g., Biomaterial type, Application, Disease model).
2. Expand keywords using MeSH terms (Medical Subject Headings) and synonyms (e.g., for "Hydrogel", use "Hydrogels"[MeSH] OR "Hydrogel networks" OR "Injectable gels").
3. Construct a robust query using AND/OR operators. Group concepts with parentheses.
4. If specific study types are requested (e.g., RCT, Review), append the correct publication type filters or search limits (e.g., "Randomized Controlled Trial"[pt] or "Meta-Analysis"[pt]). For "Animal Study", ensure appropriate MeSH terms are used if strictly required, or exclude Human studies if implied.
5. Output ONLY the raw search string. Do not include markdown code blocks, explanations, or labels. Just the final query string.`;

const PICO_SYSTEM_INSTRUCTION = `You are a Senior Researcher designing a systematic review protocol for biomaterials. Your goal is to define the PICOs framework based on a research question.

Output Format (Markdown):
## PICOs Criteria
- **Population:** [Target cells, tissue, or animal model]
- **Intervention:** [Specific biomaterial, e.g., PLGA nanoparticles, chitosan hydrogel]
- **Comparison:** [Control groups, e.g., untreated, standard drug, commercial material]
- **Outcome:** [Key metrics, e.g., degradation rate, encapsulation efficiency, cell viability %]
- **Study Design:** [e.g., In vitro, In vivo, Clinical trials]

## Inclusion/Exclusion Criteria
- **Include:** [List specific rules]
- **Exclude:** [List specific rules]`;

const SCREENER_SYSTEM_INSTRUCTION = `You are a stringent Research Assistant tasked with screening scientific abstracts based on predefined criteria.
I will provide an abstract and the inclusion/exclusion criteria.

Your Task:
1. Read the abstract carefully.
2. Evaluate it against the criteria.
3. Decide "INCLUDE" or "EXCLUDE".
4. Provide a strictly formatted JSON response.

Output JSON Format:
{
  "decision": "INCLUDE" | "EXCLUDE",
  "reason": "Short explanation referencing the specific criterion violated or met",
  "confidence_score": "1-10"
}`;

const EXTRACTOR_SYSTEM_INSTRUCTION = `You are a Biomaterials Data Scientist. Extract specific technical parameters from the provided text (Abstract or Methods section). Focus on quantitative data.

Target Fields:
- Material_Type (e.g., Alginate, PCL)
- Fabrication_Method (e.g., Electrospinning, 3D Bioprinting)
- Physical_Props (pore size, porosity %, Young's modulus, degradation time)
- Biological_Outcomes (cell viability %, IC50, tumor size reduction)

Output JSON Format:
{
  "material_composition": "String",
  "fabrication_method": "String",
  "quantitative_properties": {
      "porosity": "Value + Unit",
      "mechanical_strength": "Value + Unit",
      "degradation_rate": "Value + Unit"
  },
  "biological_result": "Summary string"
}
If a value is not mentioned, return "N/A".`;

const ANALYST_SYSTEM_INSTRUCTION = `You are a Reviewer for a high-impact biomaterials journal. Summarize the provided extracted data from multiple studies.

Your analysis must cover:
1. **Material Trends:** Which materials are dominating this specific niche?
2. **Performance Comparison:** Compare efficacy (e.g., which formulation showed the highest drug release?).
3. **Methodological Flaws:** Identify common missing characterizations (e.g., "Most studies lacked long-term in vivo biodegradation data").
4. **Conclusion:** Suggest the next logical step for research.

Keep the tone academic, objective, and critical. Use Markdown for formatting.`;

const AUDITOR_SYSTEM_INSTRUCTION = `You are a Regulatory Affairs Specialist for medical devices. Evaluate the provided "Methods" section against key ISO standards.

Reference Standards:
- **ISO 10993-5:** Tests for in vitro cytotoxicity.
- **ISO 10993-10:** Tests for irritation and skin sensitization.
- **ASTM F2900:** Characterization of Hydrogels.

Task:
1. Identify which tests were performed.
2. Flag missing control groups (positive/negative) required by ISO.
3. Verification: Did they follow standard cell lines (e.g., L929) and time points (24h, 48h)?

Output Table:
| Test Category | Method Used | ISO Compliance? | Missing/Notes |
|---------------|-------------|-----------------|---------------|
| Cytotoxicity  | MTT Assay   | Partial         | Used non-standard cell line |

Provide the response strictly as a Markdown table followed by a brief textual summary of critical compliance gaps if any.`;

const NOVELTY_SYSTEM_INSTRUCTION = `You are a Principal Investigator (PI) in Biomaterials. Based on the summaries of the analyzed papers, propose 3 novel research ideas.

Criteria for Novelty:
- Combine materials or methods from different papers (e.g., "Use the fabrication method from Paper A with the polymer from Paper B").
- Address a specific limitation identified in the analysis.

Output Format:
### Idea 1: [Title]
- **Hypothesis:** [If we combine X and Y...]
- **Innovation:** [Why is this new?]
- **Feasibility:** [Low/Medium/High based on standard lab equipment]

Repeat for 3 ideas. Use Markdown formatting.`;

const IMAGE_SYSTEM_INSTRUCTION = `You are a Scientific Image Analyst. Your task is to extract information from biomedical images (e.g., microscopy images, charts, graphs, or screenshots of research papers).

If the image is text (e.g., a paper screenshot):
- Transcribe the text accurately.
- Summarize the key scientific findings.

If the image is a figure/graph:
- Describe the axes, data trends, and significant differences.
- Interpret the statistical significance if visible (e.g., p-values, stars).

If the image is a microscopy/material image:
- Describe the morphology (e.g., porous structure, cell alignment).
- Estimate quantitative features if possible (e.g., "pores appear to be roughly 100-200µm").

Provide the output in structured Markdown.`;

const RESOURCE_SCOUT_INSTRUCTION = `You are a Research Librarian and Biomedical Engineering Information Specialist. Your goal is to direct the user to the *best* specific database for their query and generate direct search URLs.

Database Expertise:
- **PubMed:** For biological outcomes, toxicity, and clinical applications.
- **SciFinder/Reaxys:** For chemical synthesis and polymer structures.
- **Web of Science/Scopus:** For broad literature reviews and citation tracking.
- **ScienceDirect (Elsevier) / SpringerLink:** For full-text publisher-specific access.
- **Polymer Library:** For specific mechanical properties.

Task:
1. Analyze the user's query.
2. Select the top 2-3 most relevant databases.
3. Generate direct search URLs for:
   - PubMed
   - Google Scholar
   - ScienceDirect
   - SpringerLink
   (Use standard URL parameters, e.g., ?term= for PubMed, ?q= for Scholar/ScienceDirect, ?query= for Springer).
4. Explain *why* you chose the specific databases in your analysis.

Output JSON Format:
{
  "analysis": "Brief analysis explaining the best resources for this specific topic.",
  "recommendations": [
    { "name": "Database Name", "reason": "Why this is good for this topic" }
  ],
  "links": {
    "pubmed": "URL",
    "google_scholar": "URL",
    "sciencedirect": "URL",
    "springer": "URL"
  }
}`;

const OPEN_ACCESS_SYSTEM_INSTRUCTION = `You are an Open Access Advocate. Your goal is to help users find a free, legal PDF link for a given paper.

Input: User provides a DOI or Title.

Task:
1. Identify the DOI if provided, or search strategy for the title.
2. Construct search URLs for:
   - Unpaywall API: https://api.unpaywall.org/v2/[DOI]?email=unpaywall_check@example.com
   - Core.ac.uk: https://core.ac.uk/search?q=[Title or DOI]
   - Google Scholar: https://scholar.google.com/scholar?q=[Title or DOI]
3. If the paper is recent (2024-2026), suggest bioRxiv/medRxiv search.

Output JSON Format:
{
  "doi": "Extracted DOI or N/A",
  "title": "Extracted Title or N/A",
  "links": {
      "unpaywall": "URL",
      "core": "URL",
      "google_scholar": "URL",
      "biorxiv": "URL or null"
  },
  "status_explanation": "Brief analysis of OA likelihood (Gold/Green/Paywalled).",
  "alternative_text": "Advice: 'If paywalled, try searching the title on ResearchGate or use the DOI on Anna's Archive.'"
}`;

const LAB_SCOUT_SYSTEM_INSTRUCTION = `You are an Academic Headhunter specializing in Biomedical Engineering.
Your goal is to identify active research groups and professors based on a specific research topic provided by the user.

Input: User provides a Topic and a Target Region.

Task:
1. **Identify Key Labs:** Find 3-5 prominent laboratories or professors who have published significant papers on this specific topic in the last 3-5 years.
2. **Verify Activity:** Ensure they are still active (recent publications in 2024-2026).
3. **Analyze Fit:** Briefly explain *why* this lab is a good match (e.g., "They focus specifically on the *synthesis* part which matches your skill set").
4. **University Details:** Mention the university and country.

Output Format (Markdown):
### 1. Prof. [Name] - [University, Country]
- **Lab Name:** [e.g., Smart Materials Lab]
- **Key Recent Paper:** [Title of a 2024-2026 paper]
- **Research Focus:** [One sentence summary]
- **Why Match:** [Specific reason]
- **Website/Profile:** [Link if available or N/A]

(Repeat for other labs)`;

const TROUBLESHOOTER_SYSTEM_INSTRUCTION = `You are a Senior Lab Manager with 20 years of experience in Biomaterials synthesis.
The user will describe a failed experiment (e.g., "My alginate hydrogel is too soft" or "PLGA nanoparticles aggregated").

Task:
1. **Diagnosis:** List the 3 most likely chemical or physical reasons for the failure (e.g., pH, temperature, stirring speed, impurities).
2. **Solution:** Propose specific adjustments to the protocol for each cause.
3. **Debug Steps:** Suggest a quick "control experiment" to isolate the variable.

Output Format:
Please use Markdown with clear headers.

### Diagnosis 1: [Cause Name]
- **Explanation:** [Why this causes the issue]
- **Fix:** [Specific adjustment]
- **Control Check:** [Quick test]

(Repeat for 3 diagnoses)`;

const getAIClient = () => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing. Please check your environment variables.");
  }
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const generateSearchString = async (topic: string, studyTypes?: string[]): Promise<string> => {
  const ai = getAIClient();
  let prompt = topic;

  if (studyTypes && studyTypes.length > 0) {
    prompt = `Topic: ${topic}\n\nRestrict results to these study types: ${studyTypes.join(', ')}. Apply appropriate field tags (e.g., [pt] for PubMed).`;
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction: SEARCH_SYSTEM_INSTRUCTION,
        temperature: 0.2,
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response generated from the model.");
    
    return text.replace(/^```\w*\n?/, '').replace(/\n?```$/, '').trim();

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to generate search string. Please try again.");
  }
};

export const generatePicoProtocol = async (topic: string): Promise<string> => {
  const ai = getAIClient();

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: topic,
      config: {
        systemInstruction: PICO_SYSTEM_INSTRUCTION,
        temperature: 0.4,
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response generated from the model.");
    
    return text;

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to generate protocol definition. Please try again.");
  }
};

export const screenAbstract = async (abstract: string, criteria: string): Promise<string> => {
  const ai = getAIClient();
  const prompt = `Criteria:\n${criteria}\n\nAbstract:\n${abstract}`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction: SCREENER_SYSTEM_INSTRUCTION,
        responseMimeType: 'application/json',
        temperature: 0.1,
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response generated from the model.");
    
    return text;

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to screen abstract. Please try again.");
  }
};

export const extractTechnicalData = async (textInput: string): Promise<string> => {
  const ai = getAIClient();

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: textInput,
      config: {
        systemInstruction: EXTRACTOR_SYSTEM_INSTRUCTION,
        responseMimeType: 'application/json',
        temperature: 0.1,
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response generated from the model.");
    
    return text;

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to extract data. Please try again.");
  }
};

export const generateCriticalAnalysis = async (dataInput: string): Promise<string> => {
  const ai = getAIClient();

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: dataInput,
      config: {
        systemInstruction: ANALYST_SYSTEM_INSTRUCTION,
        temperature: 0.5,
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response generated from the model.");
    
    return text;

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to generate critical analysis. Please try again.");
  }
};

export const generateIsoComplianceReview = async (methodsSection: string): Promise<string> => {
  const ai = getAIClient();

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: methodsSection,
      config: {
        systemInstruction: AUDITOR_SYSTEM_INSTRUCTION,
        temperature: 0.2,
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response generated from the model.");
    
    return text;

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to generate ISO compliance review. Please try again.");
  }
};

export const generateNoveltyIdeas = async (summaryInput: string): Promise<string> => {
  const ai = getAIClient();

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: summaryInput,
      config: {
        systemInstruction: NOVELTY_SYSTEM_INSTRUCTION,
        temperature: 0.7, // Higher temperature for creativity
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response generated from the model.");
    
    return text;

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to generate novel research ideas. Please try again.");
  }
};

export const analyzeImage = async (imageBase64: string, promptText: string): Promise<string> => {
  const ai = getAIClient();

  // Clean base64 string if it contains the data URL prefix
  const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");
  // Simple check for mime type, default to png if not found in string (though usually passed with prefix in UI)
  const mimeType = imageBase64.match(/^data:(image\/\w+);base64,/) ? imageBase64.match(/^data:(image\/\w+);base64,/)?.[1] : 'image/png';

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview', // MUST use Pro for vision tasks
      contents: {
        parts: [
            {
                inlineData: {
                    mimeType: mimeType || 'image/png',
                    data: base64Data
                }
            },
            {
                text: promptText || "Analyze this image in the context of biomedical research. Extract text and explain figures."
            }
        ]
      },
      config: {
        systemInstruction: IMAGE_SYSTEM_INSTRUCTION,
        temperature: 0.3,
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response generated from the model.");
    
    return text;

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to analyze image. Please ensure the format is supported.");
  }
};

export const generateResourceSuggestions = async (topic: string): Promise<string> => {
  const ai = getAIClient();

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: topic,
      config: {
        systemInstruction: RESOURCE_SCOUT_INSTRUCTION,
        responseMimeType: 'application/json',
        temperature: 0.3,
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response generated from the model.");
    
    return text;

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to suggest resources. Please try again.");
  }
};

export const findOpenAccess = async (input: string): Promise<string> => {
  const ai = getAIClient();

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: input,
      config: {
        systemInstruction: OPEN_ACCESS_SYSTEM_INSTRUCTION,
        responseMimeType: 'application/json',
        temperature: 0.2,
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response generated from the model.");
    
    return text;

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to find open access info. Please try again.");
  }
};

export const findLabs = async (input: string): Promise<string> => {
  const ai = getAIClient();

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: input,
      config: {
        systemInstruction: LAB_SCOUT_SYSTEM_INSTRUCTION,
        temperature: 0.4,
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response generated from the model.");
    
    return text;

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to find labs. Please try again.");
  }
};

export const troubleshootProtocol = async (input: string): Promise<string> => {
  const ai = getAIClient();

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: input,
      config: {
        systemInstruction: TROUBLESHOOTER_SYSTEM_INSTRUCTION,
        temperature: 0.5,
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response generated from the model.");
    
    return text;

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to troubleshoot protocol. Please try again.");
  }
};