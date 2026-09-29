import React, { useState } from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  Radio,
  Upload,
  BookOpen,
  ChevronDown,
  Sparkles,
  Zap,
  Activity,
  Layers,
} from 'lucide-react';
import { Presentation, LiveVoiceState } from '../types';

interface HeaderProps {
  currentPresentation: Presentation;
  samplePresentations: Presentation[];
  onSelectPresentation: (p: Presentation) => void;
  onOpenUploadModal: () => void;
  voiceState: LiveVoiceState;
  onToggleMute: () => void;
  onReconnectLive: () => void;
  onChangeVoice: (voice: 'Zephyr' | 'Puck' | 'Charon' | 'Kore' | 'Fenrir') => void;
  currentSlideIndex: number;
  totalSlides: number;
  artifactCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentPresentation,
  samplePresentations,
  onSelectPresentation,
  onOpenUploadModal,
  voiceState,
  onToggleMute,
  onReconnectLive,
  onChangeVoice,
  currentSlideIndex,
  totalSlides,
  artifactCount,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isVoiceMenuOpen, setIsVoiceMenuOpen] = useState(false);

  const voices: ('Zephyr' | 'Puck' | 'Charon' | 'Kore' | 'Fenrir')[] = [
    'Zephyr',
    'Fenrir',
    'Kore',
    'Puck',
    'Charon',
  ];

  return (
    <header className="h-16 border-b border-slate-800 bg-slate-950/90 backdrop-blur-md px-4 lg:px-6 flex items-center justify-between z-30 select-none">
      {/* Left: Brand & Presentation Selector */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-600 via-amber-500 to-yellow-400 flex items-center justify-center shadow-lg shadow-amber-500/20 text-slate-950 font-black text-base">
              F
            </div>
            {voiceState.isConnected && (
              <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-slate-950 animate-pulse" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-black tracking-tight text-slate-100">FeynmanLive</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                Gemini 3.8 Live
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block font-medium">
              Tutor Académico &amp; Nanobanana
            </p>
          </div>
        </div>

        {/* Presentation Dropdown */}
        <div className="relative hidden md:block">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs text-slate-200 transition"
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-400" />
            <span className="max-w-[190px] truncate font-semibold">{currentPresentation.title}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {isDropdownOpen && (
            <div className="absolute left-0 mt-1.5 w-80 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl py-1.5 z-50">
              <div className="px-3 py-1 text-[10px] uppercase tracking-wider font-bold text-slate-400">
                Presentaciones Académicas
              </div>
              {samplePresentations.map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    onSelectPresentation(p);
                    setIsDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs transition flex items-center justify-between ${
                    p.id === currentPresentation.id
                      ? 'bg-amber-500/15 text-amber-300 font-semibold border-l-2 border-amber-500'
                      : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <div className="truncate pr-2">
                    <div className="truncate">{p.title}</div>
                    <div className="text-[10px] text-slate-500 font-normal">{p.category} · {p.slides.length} diapositivas</div>
                  </div>
                  {p.id === currentPresentation.id && (
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                  )}
                </button>
              ))}

              <div className="border-t border-slate-800 my-1" />
              <button
                onClick={() => {
                  setIsDropdownOpen(false);
                  onOpenUploadModal();
                }}
                className="w-full text-left px-3 py-2 text-xs text-indigo-400 hover:bg-slate-800 transition flex items-center gap-2 font-medium"
              >
                <Upload className="w-3.5 h-3.5" />
                Subir otra presentación en PDF...
              </button>
            </div>
          )}
        </div>

        {/* Upload Button */}
        <button
          onClick={onOpenUploadModal}
          className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 font-medium transition"
        >
          <Upload className="w-3.5 h-3.5 text-indigo-400" />
          <span>Subir PDF</span>
        </button>
      </div>

      {/* Center: Slide Progress Pill */}
      <div className="hidden lg:flex items-center gap-3 bg-slate-900/80 px-3.5 py-1.5 rounded-full border border-slate-800/80 text-xs">
        <div className="flex items-center gap-1.5 text-slate-300">
          <Layers className="w-3.5 h-3.5 text-amber-400" />
          <span className="font-semibold text-slate-100">Diapositiva {currentSlideIndex + 1}</span>
          <span className="text-slate-500">/ {totalSlides}</span>
        </div>
        <div className="w-1 h-1 rounded-full bg-slate-700" />
        <div className="flex items-center gap-1 text-slate-400 text-[11px]">
          <Sparkles className="w-3 h-3 text-cyan-400" />
          <span>{artifactCount} artefactos generados</span>
        </div>
      </div>

      {/* Right: Live Voice Control & Audio Visualizer */}
      <div className="flex items-center gap-3">
        {/* Voice Selector */}
        <div className="relative">
          <button
            onClick={() => setIsVoiceMenuOpen(!isVoiceMenuOpen)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs text-slate-300 transition"
            title="Seleccionar voz de Gemini"
          >
            <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline font-mono">{voiceState.selectedVoice}</span>
            <ChevronDown className="w-3 h-3 text-slate-500" />
          </button>

          {isVoiceMenuOpen && (
            <div className="absolute right-0 mt-1.5 w-44 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl py-1.5 z-50">
              <div className="px-3 py-1 text-[10px] uppercase tracking-wider font-bold text-slate-400">
                Voz de Feynman (Gemini)
              </div>
              {voices.map((v) => (
                <button
                  key={v}
                  onClick={() => {
                    onChangeVoice(v);
                    setIsVoiceMenuOpen(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 text-xs transition flex items-center justify-between ${
                    v === voiceState.selectedVoice
                      ? 'bg-cyan-500/20 text-cyan-300 font-semibold'
                      : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <span>{v}</span>
                  {v === voiceState.selectedVoice && (
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Live Status Pill & Microphone Toggle */}
        <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1 gap-1.5 shadow-inner">
          {/* Status Indicator */}
          <div
            onClick={onReconnectLive}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer transition ${
              voiceState.isSpeaking
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : voiceState.isConnected
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
            }`}
            title={voiceState.isConnected ? 'Conectado a Gemini 3.8 Live (Click para reconectar)' : 'Desconectado (Click para conectar)'}
          >
            {voiceState.isSpeaking ? (
              <>
                <Activity className="w-3.5 h-3.5 animate-pulse text-amber-400" />
                <span className="hidden sm:inline">Profesor Hablando...</span>
                <span className="sm:hidden">Hablando</span>
              </>
            ) : voiceState.isConnected ? (
              <>
                <Radio className="w-3.5 h-3.5 animate-pulse text-emerald-400" />
                <span className="hidden sm:inline">Live 3.8 Activo</span>
                <span className="sm:hidden">Live</span>
              </>
            ) : (
              <>
                <Zap className="w-3.5 h-3.5 text-rose-400" />
                <span>Reconectar</span>
              </>
            )}
          </div>

          {/* Microphone Mute Toggle */}
          <button
            onClick={onToggleMute}
            className={`p-2 rounded-lg transition ${
              voiceState.isMuted
                ? 'bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 border border-rose-500/40'
                : 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/40 shadow-lg shadow-emerald-500/10'
            }`}
            title={voiceState.isMuted ? 'Micrófono silenciado (Click para activar)' : 'Micrófono activo (Click para silenciar)'}
          >
            {voiceState.isMuted ? (
              <MicOff className="w-4 h-4" />
            ) : (
              <Mic className="w-4 h-4 animate-pulse" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
