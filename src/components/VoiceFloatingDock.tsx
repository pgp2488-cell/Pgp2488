import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Send,
  Sparkles,
  Code2,
  Lightbulb,
  Radio,
  Volume2,
} from 'lucide-react';
import { LiveVoiceState } from '../types';

interface VoiceFloatingDockProps {
  voiceState: LiveVoiceState;
  onToggleMute: () => void;
  onSendMessage: (text: string) => void;
  onRequestNanobanana: () => void;
  onRequestCode: () => void;
  onRequestEli5: () => void;
  lastTranscriptText: string;
  isProcessing: boolean;
}

export const VoiceFloatingDock: React.FC<VoiceFloatingDockProps> = ({
  voiceState,
  onToggleMute,
  onSendMessage,
  onRequestNanobanana,
  onRequestCode,
  onRequestEli5,
  lastTranscriptText,
  isProcessing,
}) => {
  const [textInput, setTextInput] = useState('');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Animated Audio Waveform in Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let phase = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const numBars = 16;
      const barWidth = 3;
      const gap = 3;
      const totalWidth = numBars * (barWidth + gap);
      const startX = (canvas.width - totalWidth) / 2;

      // Base activity if speaking or mic level
      const activity = voiceState.isSpeaking
        ? 0.7 + Math.sin(phase * 4) * 0.3
        : !voiceState.isMuted && voiceState.audioLevel > 0.05
        ? Math.min(1, voiceState.audioLevel)
        : 0.15;

      for (let i = 0; i < numBars; i++) {
        const x = startX + i * (barWidth + gap);
        const wave = Math.sin(phase * 3 + (i / numBars) * Math.PI * 2);
        const height = Math.max(3, activity * canvas.height * (0.4 + 0.6 * Math.abs(wave)));
        const y = (canvas.height - height) / 2;

        ctx.fillStyle = voiceState.isSpeaking
          ? '#f59e0b'
          : !voiceState.isMuted
          ? '#06b6d4'
          : '#475569';
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, height, 1.5);
        ctx.fill();
      }

      phase += 0.05;
      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [voiceState.isSpeaking, voiceState.audioLevel, voiceState.isMuted]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!textInput.trim() || isProcessing) return;
    onSendMessage(textInput.trim());
    setTextInput('');
  };

  return (
    <div className="border-t border-slate-800/80 bg-slate-950/95 backdrop-blur-md px-4 py-3 z-20 flex flex-col gap-2">
      {/* Live Transcript / Subtitle Ticker */}
      {lastTranscriptText && (
        <div className="max-w-4xl mx-auto w-full flex items-center gap-2 text-xs bg-slate-900/80 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-300">
          <div className="flex items-center gap-1 text-amber-400 font-bold shrink-0">
            <Radio className="w-3 h-3 animate-pulse" />
            <span className="text-[11px]">En vivo:</span>
          </div>
          <span className="truncate text-slate-200">{lastTranscriptText}</span>
        </div>
      )}

      {/* Main Controls Row */}
      <div className="max-w-4xl mx-auto w-full flex items-center justify-between gap-3">
        {/* Left: Quick simultaneous actions */}
        <div className="hidden md:flex items-center gap-2">
          <button
            onClick={onRequestNanobanana}
            className="px-2.5 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-semibold flex items-center gap-1.5 transition"
            title="Pedir infografía minimalista a Nanobanana"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Infografía Nanobanana</span>
          </button>

          <button
            onClick={onRequestCode}
            className="px-2.5 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-xs font-semibold flex items-center gap-1.5 transition"
            title="Crear código interactivo en panel lateral"
          >
            <Code2 className="w-3.5 h-3.5 text-cyan-400" />
            <span>Código</span>
          </button>

          <button
            onClick={onRequestEli5}
            className="px-2.5 py-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-semibold flex items-center gap-1.5 transition"
            title="Explicar con analogía simple (Feynman)"
          >
            <Lightbulb className="w-3.5 h-3.5 text-indigo-400" />
            <span>Explicación Simple</span>
          </button>
        </div>

        {/* Center: Live Mic Toggle & Waveform */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleMute}
            className={`w-11 h-11 rounded-full flex items-center justify-center transition shadow-lg ${
              voiceState.isSpeaking
                ? 'bg-amber-500 text-slate-950 ring-4 ring-amber-500/30 shadow-amber-500/30 animate-pulse'
                : !voiceState.isMuted
                ? 'bg-emerald-500 text-slate-950 ring-4 ring-emerald-500/30 shadow-emerald-500/30'
                : 'bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700'
            }`}
            title={voiceState.isMuted ? 'Activar micrófono' : 'Silenciar micrófono'}
          >
            {voiceState.isSpeaking ? (
              <Volume2 className="w-5 h-5 animate-bounce" />
            ) : !voiceState.isMuted ? (
              <Mic className="w-5 h-5 animate-pulse" />
            ) : (
              <MicOff className="w-5 h-5" />
            )}
          </button>

          {/* Waveform Canvas */}
          <canvas
            ref={canvasRef}
            width={120}
            height={32}
            className="rounded-lg bg-slate-900 border border-slate-800/80 hidden sm:block"
          />
        </div>

        {/* Right: Text Input fallback */}
        <form onSubmit={handleSubmit} className="flex-1 md:flex-initial flex items-center gap-1.5 max-w-md">
          <input
            type="text"
            placeholder="Escribe tu duda al profesor Feynman..."
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            disabled={isProcessing}
            className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition"
          />
          <button
            type="submit"
            disabled={!textInput.trim() || isProcessing}
            className="p-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition disabled:opacity-40 shrink-0"
            title="Enviar mensaje"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
