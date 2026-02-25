import React, { useEffect, useRef } from 'react';
import mermaid from 'mermaid';

interface MermaidDiagramProps {
  chart: string;
}

const MermaidDiagram: React.FC<MermaidDiagramProps> = ({ chart }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    mermaid.initialize({ 
      startOnLoad: true,
      theme: 'default',
      securityLevel: 'loose',
      fontFamily: 'inherit'
    });
    
    if (containerRef.current) {
      mermaid.contentLoaded();
    }
  }, []);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.removeAttribute('data-processed');
      mermaid.run({
        nodes: [containerRef.current],
      });
    }
  }, [chart]);

  return (
    <div className="mermaid overflow-x-auto flex justify-center p-4 bg-white rounded-xl border border-slate-200 my-4" ref={containerRef}>
      {chart}
    </div>
  );
};

export default MermaidDiagram;
