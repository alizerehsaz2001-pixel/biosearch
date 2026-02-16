import { GoogleGenAI } from "@google/genai";

const SEARCH_SYSTEM_INSTRUCTION = `You are an expert Information Specialist and Biomedical Engineer. Your task is to translate natural language research topics into advanced boolean search strings suitable for PubMed and Scopus.

Follow this strict process:
1. Analyze the user's research topic to identify key concepts (e.g., Biomaterial type, Application, Disease model).
2. Expand keywords using MeSH terms (Medical Subject Headings) and synonyms (e.g., for "Hydrogel", use "Hydrogels"[MeSH] OR "Hydrogel networks" OR "Injectable gels").
3. Construct a robust query using AND/OR operators. Group concepts with parentheses.
4. Output ONLY the raw search string. Do not include markdown code blocks, explanations, or labels. Just the final query string.`;

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

const getAIClient = () => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing. Please check your environment variables.");
  }
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const generateSearchString = async (topic: string): Promise<string> => {
  const ai = getAIClient();

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: topic,
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