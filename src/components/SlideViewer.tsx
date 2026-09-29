import React from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Code2,
  Lightbulb,
  FileQuestion,
  HelpCircle,
  Compass,
} from 'lucide-react';
import { Slide } from '../types';

interface SlideViewerProps {
  currentSlide: Slide;
  totalSlides: number;
  currentSlideIndex: number;
  onPrevSlide: () => void;
  onNextSlide: () => void;
  onSelectSlide: (index: number) => void;
  allSlides: Slide[];
  onRequestNanobanana: () => void;
  onRequestCode: () => void;
  onRequestFeynmanCard: () => void;
  onQuickVoiceQuestion: (question: string) => void;
  isNanobananaLoading: boolean;
  isCodeLoading: boolean;
}

export const SlideViewer: React.FC<SlideViewerProps> = ({
  currentSlide,
  totalSlides,
  currentSlideIndex,
  onPrevSlide,
  onNextSlide,
  onSelectSlide,
  allSlides,
  onRequestNanobanana,
  onRequestCode,
  onRequestFeynmanCard,
  onQuickVoiceQuestion,
  isNanobananaLoading,
  isCodeLoading,
}) => {
  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 overflow-hidden relative">
      {/* Slide Canvas Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 flex flex-col justify-between">
        <div className="max-w-4xl mx-auto w-full space-y-6">
          {/* Slide Glass Card */}
          <div className="relative rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-900/40 border border-slate-800 shadow-2xl p-6 sm:p-8 overflow-hidden">
            {/* Top Accent Gradient Line */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-cyan-500 to-indigo-500" />

            {/* Slide Metadata Bar */}
            <div className="flex items-center justify-between text-xs text-slate-400 mb-4 pb-3 border-b border-slate-800/80">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full font-mono text-[11px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                  Diapositiva #{currentSlide.slideNumber}
                </span>
                <span className="text-slate-500">•</span>
                <span className="text-slate-400 font-medium">Contenido Académico</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={onPrevSlide}
                  disabled={currentSlideIndex === 0}
                  className="p-1 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition"
                  title="Diapositiva anterior"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="font-mono text-slate-300">
                  {currentSlideIndex + 1} / {totalSlides}
                </span>
                <button
                  onClick={onNextSlide}
                  disabled={currentSlideIndex === totalSlides - 1}
                  className="p-1 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition"
                  title="Diapositiva siguiente"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Slide Title */}
            <div className="space-y-1 mb-6">
              <h2 className="text-2xl sm:text-3xl font-black text-slate-100 tracking-tight leading-tight">
                {currentSlide.title}
              </h2>
              {currentSlide.subtitle && (
                <p className="text-sm sm:text-base text-cyan-400 font-medium">
                  {currentSlide.subtitle}
                </p>
              )}
            </div>

            {/* Slide Bullets */}
            <div className="space-y-3.5 mb-6">
              {currentSlide.bullets.map((bullet, idx) => (
                <div key={idx} className="flex items-start gap-3 text-slate-300 text-sm sm:text-[15px] leading-relaxed">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 shrink-0 shadow-sm shadow-amber-400/50" />
                  <p>{bullet}</p>
                </div>
              ))}
            </div>

            {/* Deep Equation / Formula Box (if exists) */}
            {currentSlide.deepEquationOrFormula && (
              <div className="p-4 rounded-xl bg-slate-950/80 border border-cyan-500/30 mb-6 font-mono text-xs sm:text-sm text-cyan-300 flex items-center justify-between shadow-inner">
                <div className="flex items-center gap-2.5">
                  <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider font-sans bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                    Ecuación Invariante
                  </span>
                  <span className="text-slate-200 font-bold tracking-wider">
                    {currentSlide.deepEquationOrFormula}
                  </span>
                </div>
                <button
                  onClick={() => onQuickVoiceQuestion(`Profesor Feynman, ¿cuál es el significado intuitivo de la fórmula "${currentSlide.deepEquationOrFormula}"?`)}
                  className="text-xs text-cyan-400 hover:text-cyan-200 underline flex items-center gap-1 font-sans font-medium"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  Preguntar por voz
                </button>
              </div>
            )}

            {/* Feynman Intuitive Hint Anchor */}
            {currentSlide.feynmanAnalogyHint && (
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
                <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 shrink-0 mt-0.5">
                  <Lightbulb className="w-4 h-4" />
                </div>
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
                    Pista Intuitiva de Feynman (Visualización Mental):
                  </span>
                  <p className="text-xs sm:text-sm text-amber-200/90 italic font-serif leading-relaxed">
                    "{currentSlide.feynmanAnalogyHint}"
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Quick Feynman Voice Query Prompts */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-slate-400 font-semibold uppercase tracking-wider">
              <FileQuestion className="w-3.5 h-3.5 text-amber-400" />
              <span>Preguntas directas recomendadas al Profesor Feynman:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => onQuickVoiceQuestion(`Profesor, explícame la diapositiva "${currentSlide.title}" con una analogía simple como si tuviera 10 años.`)}
                className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 font-medium transition hover:border-amber-500/40 hover:text-amber-300 text-left"
              >
                ✦ Explícamelo como a un niño de 10 años
              </button>
              <button
                onClick={() => onQuickVoiceQuestion(`¿Cuál es el error mental más común que la gente comete con "${currentSlide.keyConcept}"?`)}
                className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 font-medium transition hover:border-rose-500/40 hover:text-rose-300 text-left"
              >
                ⚡ ¿Dónde suele equivocarse la gente aquí?
              </button>
              <button
                onClick={() => onQuickVoiceQuestion(`Ponme un ejemplo del mundo real donde se aplique "${currentSlide.keyConcept}".`)}
                className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 font-medium transition hover:border-cyan-500/40 hover:text-cyan-300 text-left"
              >
                ◎ Ejemplo tangible del mundo real
              </button>
            </div>
          </div>

          {/* Simultaneous Background Artifact Generation Dock */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="space-y-0.5 text-center sm:text-left">
              <h4 className="text-xs font-bold text-slate-200 flex items-center justify-center sm:justify-start gap-1.5">
                <Compass className="w-3.5 h-3.5 text-amber-400" />
                Generación Simultánea de Artefactos (Segundo Plano)
              </h4>
              <p className="text-[11px] text-slate-400">
                Pide infografías a Nanobanana o simulaciones en código mientras sigues hablando con Feynman
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={onRequestNanobanana}
                disabled={isNanobananaLoading}
                className="px-3.5 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 font-bold text-xs flex items-center gap-1.5 transition active:scale-95 disabled:opacity-50 shadow-lg shadow-amber-500/10"
              >
                <Sparkles className={`w-3.5 h-3.5 ${isNanobananaLoading ? 'animate-spin' : ''}`} />
                <span>{isNanobananaLoading ? 'Nanobanana...' : 'Pedir Infografía Nanobanana'}</span>
              </button>

              <button
                onClick={onRequestCode}
                disabled={isCodeLoading}
                className="px-3.5 py-2 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/40 text-cyan-300 font-bold text-xs flex items-center gap-1.5 transition active:scale-95 disabled:opacity-50 shadow-lg shadow-cyan-500/10"
              >
                <Code2 className={`w-3.5 h-3.5 ${isCodeLoading ? 'animate-spin' : ''}`} />
                <span>{isCodeLoading ? 'Generando...' : 'Crear Código Interactivo'}</span>
              </button>

              <button
                onClick={onRequestFeynmanCard}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-medium transition active:scale-95"
                title="Generar Ficha de Estudio Feynman"
              >
                <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Slide Thumbnails Bottom Rail */}
      <div className="h-20 border-t border-slate-800/80 bg-slate-950/95 px-4 flex items-center gap-3 overflow-x-auto select-none">
        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider shrink-0 hidden sm:inline">
          Diapositivas:
        </span>
        {allSlides.map((slide, idx) => (
          <button
            key={slide.id}
            onClick={() => onSelectSlide(idx)}
            className={`h-14 min-w-[130px] rounded-lg p-2 text-left border transition relative flex flex-col justify-between overflow-hidden shrink-0 ${
              idx === currentSlideIndex
                ? 'border-amber-500 bg-amber-500/10 shadow-lg shadow-amber-500/10'
                : 'border-slate-800 bg-slate-900/60 hover:border-slate-700 hover:bg-slate-900'
            }`}
          >
            <div className="flex items-center justify-between text-[10px]">
              <span className={`font-mono font-bold ${idx === currentSlideIndex ? 'text-amber-400' : 'text-slate-500'}`}>
                #{idx + 1}
              </span>
              {idx === currentSlideIndex && (
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              )}
            </div>
            <div className="text-[11px] text-slate-300 font-semibold truncate leading-tight">
              {slide.title}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
