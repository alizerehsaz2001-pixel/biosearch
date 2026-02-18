
import React, { useState, useEffect, useRef } from 'react';
import { AudioWaveform, Play, Pause, RotateCcw, Volume2, Waves, Activity } from 'lucide-react';
import { SearchResult } from '../types';
import { decodeBase64, decodeAudioData } from '../services/geminiService';

interface VoiceAssistantCardProps {
  result: SearchResult;
}

const VoiceAssistantCard: React.FC<VoiceAssistantCardProps> = ({ result }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const audioBufferRef = useRef<AudioBuffer | null>(null);
  const startTimeRef = useRef<number>(0);
  const pausedAtRef = useRef<number>(0);

  useEffect(() => {
    return () => {
      stopAudio();
    };
  }, []);

  const initAudio = async () => {
    if (!result.audioData) return;
    if (audioBufferRef.current) return;

    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      audioContextRef.current = audioCtx;
      
      const pcmBytes = decodeBase64(result.audioData);
      const audioBuffer = await decodeAudioData(pcmBytes, audioCtx, 24000, 1);
      audioBufferRef.current = audioBuffer;
    } catch (e) {
      console.error("Audio initialization failed", e);
    }
  };

  const playAudio = async () => {
    await initAudio();
    if (!audioBufferRef.current || !audioContextRef.current) return;

    const ctx = audioContextRef.current;
    const source = ctx.createBufferSource();
    source.buffer = audioBufferRef.current;
    source.connect(ctx.destination);
    
    source.onended = () => {
      if (Math.abs(ctx.currentTime - startTimeRef.current - audioBufferRef.current!.duration) < 0.1) {
        setIsPlaying(false);
        setProgress(0);
        pausedAtRef.current = 0;
      }
    };

    const offset = pausedAtRef.current;
    source.start(0, offset);
    startTimeRef.current = ctx.currentTime - offset;
    sourceNodeRef.current = source;
    setIsPlaying(true);
    
    requestAnimationFrame(updateProgress);
  };

  const updateProgress = () => {
    if (!isPlaying || !audioBufferRef.current || !audioContextRef.current) return;
    const ctx = audioContextRef.current;
    const elapsed = ctx.currentTime - startTimeRef.current;
    const duration = audioBufferRef.current.duration;
    const p = (elapsed / duration) * 100;
    setProgress(Math.min(p, 100));
    
    if (p < 100) {
      requestAnimationFrame(updateProgress);
    }
  };

  const pauseAudio = () => {
    if (sourceNodeRef.current && audioContextRef.current) {
      pausedAtRef.current = audioContextRef.current.currentTime - startTimeRef.current;
      sourceNodeRef.current.stop();
      sourceNodeRef.current = null;
      setIsPlaying(false);
    }
  };

  const stopAudio = () => {
    if (sourceNodeRef.current) {
      sourceNodeRef.current.stop();
      sourceNodeRef.current = null;
    }
    setIsPlaying(false);
    setProgress(0);
    pausedAtRef.current = 0;
  };

  const togglePlay = () => {
    if (isPlaying) {
      pauseAudio();
    } else {
      playAudio();
    }
  };

  return (
    <div className="w-full bg-white rounded-2xl shadow-lg border border-indigo-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-gradient-to-r from-indigo-50 to-blue-50 px-6 py-4 border-b border-indigo-100 flex justify-between items-center">
        <div className="flex items-center gap-2">
            <div className="bg-white p-1.5 rounded-md shadow-sm border border-indigo-100 text-indigo-600">
                <AudioWaveform className="w-4 h-4" />
            </div>
            <h3 className="font-semibold text-slate-800">Voice Research Briefing</h3>
        </div>
        <div className="flex items-center gap-2">
             <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-bold uppercase transition-all ${isPlaying ? 'bg-indigo-600 text-white animate-pulse' : 'bg-slate-100 text-slate-400'}`}>
                <Volume2 className="w-3 h-3" />
                {isPlaying ? 'Now Playing' : 'Ready'}
             </div>
        </div>
      </div>
      
      <div className="p-8">
        <div className="flex flex-col items-center mb-8">
            <div className={`relative w-24 h-24 rounded-full flex items-center justify-center mb-6 transition-all duration-500 ${isPlaying ? 'bg-indigo-600 shadow-2xl shadow-indigo-300 scale-110' : 'bg-slate-100'}`}>
                {isPlaying ? (
                    <Waves className="w-12 h-12 text-white animate-pulse" />
                ) : (
                    <AudioWaveform className="w-12 h-12 text-slate-300" />
                )}
                
                {/* Rotating Progress Ring */}
                <svg className="absolute inset-0 w-full h-full -rotate-90">
                    <circle 
                        cx="48" cy="48" r="45" 
                        fill="transparent" 
                        stroke="currentColor" 
                        strokeWidth="4" 
                        className="text-slate-100"
                    />
                    <circle 
                        cx="48" cy="48" r="45" 
                        fill="transparent" 
                        stroke="currentColor" 
                        strokeWidth="4" 
                        strokeDasharray={282}
                        strokeDashoffset={282 - (282 * progress) / 100}
                        className="text-indigo-500 transition-all duration-300"
                    />
                </svg>
            </div>

            <div className="flex items-center gap-4">
                <button 
                    onClick={() => { stopAudio(); playAudio(); }}
                    className="p-3 bg-slate-50 hover:bg-slate-100 rounded-full border border-slate-200 text-slate-600 transition-all active:scale-90"
                    title="Restart"
                >
                    <RotateCcw className="w-5 h-5" />
                </button>
                <button 
                    onClick={togglePlay}
                    className="w-16 h-16 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-lg shadow-indigo-200 flex items-center justify-center transition-all hover:scale-105 active:scale-95"
                >
                    {isPlaying ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current ml-1" />}
                </button>
                <div className="w-11 h-11 bg-transparent" /> {/* Spacer */}
            </div>
        </div>

        <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 relative">
            <div className="absolute top-4 right-4 text-slate-200">
                <Activity className="w-8 h-8" />
            </div>
            <p className="text-xs uppercase font-black text-slate-400 mb-3 tracking-widest">Scientific Briefing Script</p>
            <div className="prose prose-sm prose-slate max-w-none">
                <p className="text-slate-700 leading-relaxed italic text-base">
                    {result.content}
                </p>
            </div>
        </div>
        
        <div className="mt-8 flex justify-center">
            <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                <AudioWaveform className="w-3 h-3" />
                Narrated by Gemini Flash TTS
            </div>
        </div>
      </div>
    </div>
  );
};

export default VoiceAssistantCard;
