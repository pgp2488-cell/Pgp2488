import React from 'react';
import { X, Download, Sparkles, AlertTriangle, Lightbulb, Compass } from 'lucide-react';
import { InfographicArtifact } from '../types';

interface InfographicModalProps {
  artifact: InfographicArtifact | null;
  onClose: () => void;
  onAskAboutInfographic: (topic: string) => void;
}

export const InfographicModal: React.FC<InfographicModalProps> = ({
  artifact,
  onClose,
  onAskAboutInfographic,
}) => {
  if (!artifact) return null;

  const handleDownload = () => {
    if (artifact.imageDataBase64) {
      const a = document.createElement('a');
      a.href = artifact.imageDataBase64;
      a.download = `nanobanana-${artifact.concept.replace(/\s+/g, '-').toLowerCase()}.png`;
      a.click();
    } else if (artifact.svgDiagram) {
      const blob = new Blob([artifact.svgDiagram], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `nanobanana-${artifact.concept.replace(/\s+/g, '-').toLowerCase()}.svg`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
      <div className="w-full max-w-5xl max-h-[92vh] bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-100">{artifact.title}</h3>
                <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Nanobanana Minimalist
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Infografía de Contexto Profundo y Método Feynman · {artifact.concept}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 font-medium flex items-center gap-1.5 transition"
            >
              <Download className="w-4 h-4" />
              Descargar Infografía
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Main Visual Display */}
          <div className="w-full rounded-xl overflow-hidden border border-slate-800 bg-slate-950 flex items-center justify-center p-2 min-h-[340px]">
            {artifact.imageDataBase64 ? (
              <img
                src={artifact.imageDataBase64}
                alt={artifact.title}
                className="w-full max-h-[460px] object-contain rounded-lg shadow-2xl"
              />
            ) : artifact.svgDiagram ? (
              <div
                className="w-full max-h-[460px] flex items-center justify-center"
                dangerouslySetInnerHTML={{ __html: artifact.svgDiagram }}
              />
            ) : (
              <div className="text-center py-12 text-slate-500 text-sm">
                Generando representación visual...
              </div>
            )}
          </div>

          {/* Deep Feynman Knowledge Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Box 1: Invariante Oculto */}
            <div className="bg-slate-950/70 border border-cyan-500/30 rounded-xl p-5 space-y-2">
              <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs uppercase tracking-wider">
                <Compass className="w-4 h-4" />
                El Invariante Oculto (Lo que verdaderamente ocurre)
              </div>
              <p className="text-sm text-slate-200 leading-relaxed font-medium">
                {artifact.invisibleInvariant}
              </p>
              <p className="text-xs text-slate-400 leading-relaxed pt-1">
                {artifact.deepContext}
              </p>
            </div>

            {/* Box 2: Analogía Feynman */}
            <div className="bg-slate-950/70 border border-amber-500/30 rounded-xl p-5 space-y-2">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
                <Lightbulb className="w-4 h-4" />
                Analogía Intuitiva de Feynman (Sin Jerga)
              </div>
              <p className="text-sm text-amber-200/90 italic leading-relaxed font-serif">
                "{artifact.feynmanAnalogy}"
              </p>
              <p className="text-xs text-slate-400 leading-relaxed pt-1">
                El cerebro humano almacena modelos mentales por comparación visual cotidiana, no por memorización mecánica de símbolos.
              </p>
            </div>

            {/* Box 3: Trampa Mental */}
            <div className="bg-slate-950/70 border border-rose-500/30 rounded-xl p-5 space-y-2">
              <div className="flex items-center gap-2 text-rose-400 font-bold text-xs uppercase tracking-wider">
                <AlertTriangle className="w-4 h-4" />
                La Trampa Conceptual Común
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {artifact.commonMisconception}
              </p>
            </div>

            {/* Box 4: Regla de Oro */}
            <div className="bg-slate-950/70 border border-emerald-500/30 rounded-xl p-5 space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
                <Sparkles className="w-4 h-4" />
                Regla Mnemotécnica / Conocimiento Esencial
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-semibold">
                {artifact.keyTakeaway}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            Puedes explorar o cuestionar detalles de este diagrama por voz en cualquier momento.
          </span>
          <button
            onClick={() => {
              onAskAboutInfographic(artifact.concept);
              onClose();
            }}
            className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition flex items-center gap-1.5 shadow-lg shadow-amber-500/20"
          >
            Preguntar por voz sobre esta infografía
          </button>
        </div>
      </div>
    </div>
  );
};
