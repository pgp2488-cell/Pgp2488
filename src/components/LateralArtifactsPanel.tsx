import React, { useState } from 'react';
import {
  Layers,
  Sparkles,
  Code2,
  Lightbulb,
  Maximize2,
  Play,
  MessageSquare,
  HelpCircle,
  Radio,
  CheckCircle,
  Compass,
  ArrowRight,
} from 'lucide-react';
import { Artifact, InfographicArtifact, CodeArtifact, FeynmanCardArtifact, VoiceMessage } from '../types';

interface LateralArtifactsPanelProps {
  artifacts: Artifact[];
  focusedArtifact: Artifact | null;
  onSelectArtifact: (artifact: Artifact | null) => void;
  onOpenInfographicModal: (art: InfographicArtifact) => void;
  onOpenCodeModal: (art: CodeArtifact) => void;
  voiceMessages: VoiceMessage[];
  onAskAboutArtifact: (artifact: Artifact, customPrompt?: string) => void;
  onRequestNanobananaQuick: () => void;
  onRequestCodeQuick: () => void;
}

export const LateralArtifactsPanel: React.FC<LateralArtifactsPanelProps> = ({
  artifacts,
  focusedArtifact,
  onSelectArtifact,
  onOpenInfographicModal,
  onOpenCodeModal,
  voiceMessages,
  onAskAboutArtifact,
  onRequestNanobananaQuick,
  onRequestCodeQuick,
}) => {
  const [activeTab, setActiveTab] = useState<'artifacts' | 'transcript' | 'feynman_guide'>('artifacts');
  const [filterType, setFilterType] = useState<'all' | 'infographic' | 'code' | 'feynman_card'>('all');

  const filteredArtifacts = artifacts.filter((a) => {
    if (filterType === 'all') return true;
    return a.type === filterType;
  });

  return (
    <aside className="w-full lg:w-[420px] xl:w-[460px] h-full border-l border-slate-800 bg-slate-950 flex flex-col overflow-hidden">
      {/* Panel Navigation Tabs */}
      <div className="flex items-center border-b border-slate-800 bg-slate-900/70 p-2 gap-1.5 shrink-0">
        <button
          onClick={() => setActiveTab('artifacts')}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
            activeTab === 'artifacts'
              ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Layers className="w-3.5 h-3.5 text-amber-400" />
          <span>Artefactos</span>
          {artifacts.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-amber-500/20 text-amber-300 ml-1">
              {artifacts.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('transcript')}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
            activeTab === 'transcript'
              ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
          <span>Diálogo en Vivo</span>
          {voiceMessages.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-cyan-500/20 text-cyan-300 ml-1">
              {voiceMessages.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('feynman_guide')}
          className={`py-2 px-2.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 ${
            activeTab === 'feynman_guide'
              ? 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
          title="Método de Aprendizaje Feynman"
        >
          <Lightbulb className="w-3.5 h-3.5 text-indigo-400" />
          <span className="hidden sm:inline">Método</span>
        </button>
      </div>

      {/* Focused Artifact Banner */}
      {focusedArtifact && activeTab === 'artifacts' && (
        <div className="bg-gradient-to-r from-amber-500/20 via-cyan-500/20 to-indigo-500/20 border-b border-amber-500/30 p-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 overflow-hidden">
            <Radio className="w-3.5 h-3.5 text-amber-400 animate-pulse shrink-0" />
            <div className="truncate">
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
                Foco Activo de Discusión por Voz
              </span>
              <span className="text-xs text-slate-100 font-semibold truncate block">
                {focusedArtifact.title}
              </span>
            </div>
          </div>
          <button
            onClick={() => onSelectArtifact(null)}
            className="text-[11px] text-slate-400 hover:text-slate-200 hover:underline shrink-0 ml-2"
          >
            Quitar foco
          </button>
        </div>
      )}

      {/* TAB 1: ARTIFACTS LIST */}
      {activeTab === 'artifacts' && (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Filter Pills */}
          <div className="px-4 py-2.5 border-b border-slate-800/60 bg-slate-950 flex items-center gap-1.5 overflow-x-auto shrink-0 select-none">
            <button
              onClick={() => setFilterType('all')}
              className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition shrink-0 ${
                filterType === 'all'
                  ? 'bg-slate-700 text-slate-100'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200'
              }`}
            >
              Todos ({artifacts.length})
            </button>
            <button
              onClick={() => setFilterType('infographic')}
              className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition shrink-0 flex items-center gap-1 ${
                filterType === 'infographic'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sparkles className="w-3 h-3 text-amber-400" />
              Nanobanana
            </button>
            <button
              onClick={() => setFilterType('code')}
              className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition shrink-0 flex items-center gap-1 ${
                filterType === 'code'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Code2 className="w-3 h-3 text-cyan-400" />
              Código
            </button>
            <button
              onClick={() => setFilterType('feynman_card')}
              className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition shrink-0 flex items-center gap-1 ${
                filterType === 'feynman_card'
                  ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Lightbulb className="w-3 h-3 text-indigo-400" />
              Fichas
            </button>
          </div>

          {/* Artifacts Scrollable Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {filteredArtifacts.length === 0 ? (
              <div className="text-center py-12 px-4 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-slate-500">
                  <Compass className="w-6 h-6 text-amber-400/60" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-200">
                    Aún no hay artefactos en este panel
                  </h4>
                  <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                    Pídele al profesor Feynman por voz o presiona los botones para generar infografías a Nanobanana o bloques de código interactivo.
                  </p>
                </div>
                <div className="pt-2 flex flex-col gap-2 max-w-xs mx-auto">
                  <button
                    onClick={onRequestNanobananaQuick}
                    className="px-3 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-xs font-bold transition flex items-center justify-center gap-2"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Pedir infografía a Nanobanana
                  </button>
                  <button
                    onClick={onRequestCodeQuick}
                    className="px-3 py-2 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-300 text-xs font-bold transition flex items-center justify-center gap-2"
                  >
                    <Code2 className="w-3.5 h-3.5" />
                    Crear código interactivo
                  </button>
                </div>
              </div>
            ) : (
              filteredArtifacts.map((art) => {
                const isFocused = focusedArtifact?.id === art.id;

                if (art.type === 'infographic') {
                  const info = art as InfographicArtifact;
                  return (
                    <div
                      key={info.id}
                      onClick={() => onSelectArtifact(info)}
                      className={`rounded-xl border transition p-4 cursor-pointer relative overflow-hidden space-y-3 ${
                        isFocused
                          ? 'bg-slate-900 border-amber-500/80 shadow-xl shadow-amber-500/10 ring-1 ring-amber-500/50'
                          : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                      }`}
                    >
                      {/* Badge & Model */}
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                          <Sparkles className="w-3 h-3" />
                          Nanobanana Infografía
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenInfographicModal(info);
                            }}
                            className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
                            title="Ver a pantalla completa"
                          >
                            <Maximize2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Title */}
                      <div>
                        <h4 className="text-sm font-bold text-slate-100 leading-snug">
                          {info.title}
                        </h4>
                        <p className="text-xs text-amber-400/90 font-medium mt-0.5">
                          Concepto: {info.concept}
                        </p>
                      </div>

                      {/* Visual Preview */}
                      <div className="w-full h-36 rounded-lg bg-slate-950 border border-slate-800 overflow-hidden flex items-center justify-center relative">
                        {info.imageDataBase64 ? (
                          <img
                            src={info.imageDataBase64}
                            alt={info.title}
                            className="w-full h-full object-cover"
                          />
                        ) : info.svgDiagram ? (
                          <div
                            className="w-full h-full flex items-center justify-center scale-90"
                            dangerouslySetInnerHTML={{ __html: info.svgDiagram }}
                          />
                        ) : (
                          <span className="text-xs text-slate-500">Cargando gráfico...</span>
                        )}
                      </div>

                      {/* Knowledge Invariant Snippet */}
                      <div className="text-xs space-y-1.5 text-slate-300">
                        <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
                          <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider block mb-0.5">
                            Invariante Oculto:
                          </span>
                          <p className="text-slate-300 text-xs leading-relaxed line-clamp-2">
                            {info.invisibleInvariant}
                          </p>
                        </div>
                        <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
                          <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block mb-0.5">
                            Analogía Feynman:
                          </span>
                          <p className="text-amber-200/90 italic text-xs leading-relaxed line-clamp-2">
                            "{info.feynmanAnalogy}"
                          </p>
                        </div>
                      </div>

                      {/* Footer Action */}
                      <div className="flex items-center justify-between pt-1 text-[11px]">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onAskAboutArtifact(info, `Profesor, explícame los detalles de esta infografía de Nanobanana sobre "${info.concept}".`);
                          }}
                          className="text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1 transition"
                        >
                          <span>Preguntar por voz sobre esto</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                        <span className="text-slate-500 text-[10px]">
                          {isFocused ? 'Enfocado ✓' : 'Click para enfocar'}
                        </span>
                      </div>
                    </div>
                  );
                }

                if (art.type === 'code') {
                  const codeArt = art as CodeArtifact;
                  return (
                    <div
                      key={codeArt.id}
                      onClick={() => onSelectArtifact(codeArt)}
                      className={`rounded-xl border transition p-4 cursor-pointer relative overflow-hidden space-y-3 ${
                        isFocused
                          ? 'bg-slate-900 border-cyan-500/80 shadow-xl shadow-cyan-500/10 ring-1 ring-cyan-500/50'
                          : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                      }`}
                    >
                      {/* Badge */}
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
                          <Code2 className="w-3 h-3" />
                          Código Interactivo ({codeArt.language})
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenCodeModal(codeArt);
                          }}
                          className="px-2.5 py-1 rounded bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold flex items-center gap-1 transition shadow-sm"
                        >
                          <Play className="w-3 h-3 fill-current" />
                          <span>Simular</span>
                        </button>
                      </div>

                      {/* Title */}
                      <div>
                        <h4 className="text-sm font-bold text-slate-100 leading-snug">
                          {codeArt.title}
                        </h4>
                        <p className="text-xs text-cyan-400/90 font-medium mt-0.5">
                          {codeArt.concept}
                        </p>
                      </div>

                      {/* Code preview snippet */}
                      <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 font-mono text-[11px] text-slate-300 max-h-24 overflow-hidden relative">
                        <pre>
                          <code>{codeArt.code.slice(0, 180)}...</code>
                        </pre>
                        <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-slate-950 to-transparent" />
                      </div>

                      {/* Explanation */}
                      <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                        {codeArt.explanation}
                      </p>

                      {/* Footer Action */}
                      <div className="flex items-center justify-between pt-1 text-[11px]">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onAskAboutArtifact(codeArt, `Profesor Feynman, ¿qué demuestra exactamente el código de "${codeArt.title}"?`);
                          }}
                          className="text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1 transition"
                        >
                          <span>Preguntar por voz sobre el código</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                        <span className="text-slate-500 text-[10px]">
                          {isFocused ? 'Enfocado ✓' : 'Click para enfocar'}
                        </span>
                      </div>
                    </div>
                  );
                }

                if (art.type === 'feynman_card') {
                  const card = art as FeynmanCardArtifact;
                  return (
                    <div
                      key={card.id}
                      onClick={() => onSelectArtifact(card)}
                      className={`rounded-xl border transition p-4 cursor-pointer relative overflow-hidden space-y-3 ${
                        isFocused
                          ? 'bg-slate-900 border-indigo-500/80 shadow-xl shadow-indigo-500/10 ring-1 ring-indigo-500/50'
                          : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">
                          <Lightbulb className="w-3 h-3" />
                          Ficha Método Feynman
                        </span>
                      </div>

                      <div>
                        <h4 className="text-sm font-bold text-slate-100">
                          {card.title}
                        </h4>
                      </div>

                      <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200/90 italic font-serif">
                        "{card.eli5Explanation}"
                      </div>

                      <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 space-y-1">
                        <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block">
                          Pregunta de Validación de Comprensión:
                        </span>
                        <p className="text-slate-200 font-medium">{card.knowledgeCheckQuestion}</p>
                      </div>

                      <div className="flex items-center justify-between pt-1 text-[11px]">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onAskAboutArtifact(card, `Profesor Feynman, pongámonos a prueba con la pregunta de la ficha: "${card.knowledgeCheckQuestion}".`);
                          }}
                          className="text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 transition"
                        >
                          <span>Responder por voz a Feynman</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                }

                return null;
              })
            )}
          </div>
        </div>
      )}

      {/* TAB 2: LIVE DIALOGUE & TRANSCRIPTION */}
      {activeTab === 'transcript' && (
        <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs leading-relaxed">
          {voiceMessages.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <MessageSquare className="w-8 h-8 mx-auto mb-2 text-slate-600" />
              <p>Habla por el micrófono para iniciar la conversación con el Profesor Feynman.</p>
            </div>
          ) : (
            voiceMessages.map((msg) => (
              <div
                key={msg.id}
                className={`p-3 rounded-xl border ${
                  msg.role === 'user'
                    ? 'bg-slate-900 border-slate-800 ml-6 text-slate-200'
                    : 'bg-slate-900/90 border-amber-500/20 mr-6 text-amber-100/90'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 mb-1">
                  <span className={msg.role === 'assistant' ? 'text-amber-400' : 'text-slate-300'}>
                    {msg.role === 'user' ? 'Tú (Estudiante)' : 'Profesor Feynman'}
                  </span>
                  <span className="font-mono text-slate-500">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="whitespace-pre-wrap">{msg.text}</p>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 3: FEYNMAN METHOD GUIDE */}
      {activeTab === 'feynman_guide' && (
        <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs text-slate-300">
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-1.5">
            <h4 className="text-sm font-bold text-amber-300 flex items-center gap-1.5">
              <Lightbulb className="w-4 h-4 text-amber-400" />
              El Método Feynman para Dominio Académico
            </h4>
            <p className="text-amber-200/80 leading-relaxed text-[11px]">
              "Si no puedes explicarlo de forma sencilla a alguien sin formación en el tema, es que tú mismo no lo entiendes." — Richard Feynman.
            </p>
          </div>

          <div className="space-y-3">
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider">
                Paso 1: Identificar el Concepto
              </span>
              <p className="text-slate-300 text-xs">
                Selecciona una diapositiva o fórmula compleja. No la memorices; visualiza su significado físico o computacional.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                Paso 2: Enseñar con Analogía Simple
              </span>
              <p className="text-slate-300 text-xs">
                Pregunta al profesor: <em>"Explícamelo como a un niño de 10 años"</em>. Busca metáforas mecánicas, hidráulicas o sociales directas.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider">
                Paso 3: Localizar la Brecha y la Jerga
              </span>
              <p className="text-slate-300 text-xs">
                Si tropiezas con una palabra técnica inflada, deten al profesor y pídele que la reemplace por su sentido físico directo.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                Paso 4: Fijar con Infografía y Código
              </span>
              <p className="text-slate-300 text-xs">
                Genera una infografía minimalista con Nanobanana y ejecuta el código en el panel lateral para tocar las variables con tus propias manos.
              </p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};
