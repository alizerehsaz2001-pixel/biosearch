import os
import sys
import argparse
from google import genai

def generate_pubmed_string(topic, study_types=None):
    """
    Generates a detailed PubMed search string using Gemini API.
    """
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        print("Error: GEMINI_API_KEY environment variable not set.")
        sys.exit(1)

    client = genai.Client(api_key=api_key)
    
    system_instruction = """You are an expert Information Specialist and Biomaterials Engineer. Your task is to translate natural language research topics into advanced boolean search strings suitable for PubMed.

Follow this strict process:
1. Analyze the user's research topic to identify key concepts (e.g., Biomaterial type, Application, Disease model).
2. Expand keywords using MeSH terms (Medical Subject Headings) and synonyms (e.g., for "Hydrogel", use "Hydrogels"[MeSH] OR "Hydrogel networks" OR "Injectable gels").
3. Construct a robust query using AND/OR operators. Group concepts with parentheses.
4. If specific study types are requested (e.g., RCT, Systematic Review, Guidelines), append the correct publication type filters or search limits (e.g., "Practice Guideline"[pt], "Systematic Review"[pt], "Case Reports"[pt]).
5. Output ONLY the raw search string. Do not include markdown code blocks, explanations, or labels. Just the final query string."""

    prompt = f"Research Topic: {topic}"
    if study_types:
        prompt += f"\nRestrict results to these study types: {', '.join(study_types)}"

    try:
        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=prompt,
            config={
                "system_instruction": system_instruction,
                "temperature": 0.2,
            }
        )
        return response.text.strip()
    except Exception as e:
        print(f"Error calling Gemini API: {e}")
        sys.exit(1)

def main():
    parser = argparse.ArgumentParser(description="Generate advanced PubMed search strings using AI.")
    parser.add_argument("topic", help="The research topic or natural language query.")
    parser.add_argument("--types", help="Comma-separated list of study types (e.g., 'RCT,Systematic Review').")
    
    args = parser.parse_args()
    
    study_types = [t.strip() for t in args.types.split(",")] if args.types else None
    
    print(f"\n--- BioSearch Architect CLI ---")
    print(f"Topic: {args.topic}")
    if study_types:
        print(f"Filters: {', '.join(study_types)}")
    print(f"-------------------------------\n")
    
    print("Processing...\n")
    result = generate_pubmed_string(args.topic, study_types)
    
    print("--- GENERATED PUBMED QUERY ---")
    print(result)
    print("------------------------------")
    print("\nTip: You can paste this directly into the PubMed search bar.")

if __name__ == "__main__":
    main()
