import React, { useEffect, useState, useId } from 'react';
import mermaid from 'mermaid';

interface MermaidDiagramProps {
  chart: string;
}

// Initialize once
mermaid.initialize({
  startOnLoad: false,
  theme: 'default',
  securityLevel: 'loose',
  fontFamily: 'inherit',
  suppressErrorRendering: true,
});

const MermaidDiagram: React.FC<MermaidDiagramProps> = ({ chart }) => {
  const [svg, setSvg] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  
  // Create a unique ID for this instance. 
  // We strip colons because they can be problematic in IDs for some tools.
  const rawId = useId();
  const uniqueId = `mermaid-${rawId.replace(/:/g, '')}`;

  useEffect(() => {
    let mounted = true;

    const renderDiagram = async () => {
      if (!chart) return;

      try {
        setError(null);
        // mermaid.render returns an object { svg } in v10+
        // It generates the SVG string without needing a container in the DOM for the output
        const { svg } = await mermaid.render(uniqueId, chart);
        
        if (mounted) {
            setSvg(svg);
        }
      } catch (err) {
        console.error('Mermaid rendering failed:', err);
        if (mounted) {
            // Check if it's a syntax error or something else
            setError('Failed to render diagram. The syntax might be incorrect.');
        }
      }
    };

    renderDiagram();

    return () => {
      mounted = false;
    };
  }, [chart, uniqueId]);

  if (error) {
      return (
          <div className="p-4 border border-red-200 bg-red-50 text-red-600 rounded-xl text-sm font-mono whitespace-pre-wrap">
              <p className="font-bold mb-2">Diagram Error</p>
              {error}
              <div className="mt-2 text-xs text-slate-500 border-t border-red-100 pt-2 opacity-75">
                  {chart.slice(0, 100)}...
              </div>
          </div>
      );
  }

  if (!svg) {
      return (
          <div className="p-8 flex justify-center items-center bg-slate-50 rounded-xl border border-slate-100 text-slate-400 text-sm animate-pulse">
              Generating diagram...
          </div>
      );
  }

  return (
    <div 
      className="mermaid-container overflow-x-auto flex justify-center p-4 bg-white rounded-xl border border-slate-200 my-4"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
};

export default MermaidDiagram;
