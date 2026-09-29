import React, { useState } from 'react';
import { X, Play, RefreshCw, Terminal, CheckCircle2, Sliders, Copy } from 'lucide-react';
import { CodeArtifact } from '../types';

interface CodeSandboxModalProps {
  artifact: CodeArtifact | null;
  onClose: () => void;
  onAskAboutCode: (codeTitle: string, question: string) => void;
}

export const CodeSandboxModal: React.FC<CodeSandboxModalProps> = ({
  artifact,
  onClose,
  onAskAboutCode,
}) => {
  if (!artifact) return null;

  const [inputVal, setInputVal] = useState<number>(50);
  const [secondaryVal, setSecondaryVal] = useState<number>(20);
  const [outputLogs, setOutputLogs] = useState<string[]>([
    `[Sandbox Inicializado] Entorno de ejecución seguro para "${artifact.title}"`,
    `Listo para ejecutar simulación interactiva.`,
  ]);
  const [isRunning, setIsRunning] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'simulation' | 'source'>('simulation');

  const handleCopy = () => {
    navigator.clipboard.writeText(artifact.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const runSimulation = () => {
    setIsRunning(true);
    const newLogs: string[] = [];

    newLogs.push(`>> Iniciando simulación con parámetro primario = ${inputVal}, secundario = ${secondaryVal}`);

    try {
      // Dynamic simulated calculations based on concept
      if (artifact.concept.toLowerCase().includes('incertidumbre') || artifact.title.toLowerCase().includes('cuántic')) {
        const deltaX = inputVal / 10;
        const hBar = 1.05457;
        const minDeltaP = (hBar / (2 * deltaX)).toFixed(4);
        newLogs.push(`>> Parámetro de Posición (Δx): ${deltaX.toFixed(2)} unidades`);
        newLogs.push(`>> Cálculo de Incertidumbre de Heisenberg: Δx · Δp ≥ ℏ/2`);
        newLogs.push(`>> Momento Mínimo Forzado (Δp): ≥ ${minDeltaP} J·s/m`);
        newLogs.push(`[INVARIANTE FEYNMAN]: Al reducir Δx a ${deltaX.toFixed(2)}, el momento se dispara a ${minDeltaP}. Es imposible conocer ambos a la vez.`);
      } else if (artifact.concept.toLowerCase().includes('atención') || artifact.title.toLowerCase().includes('transformer')) {
        const dK = inputVal;
        const scaleFactor = Math.sqrt(dK).toFixed(3);
        const rawScore = (inputVal * secondaryVal * 0.1).toFixed(2);
        const scaledScore = (Number(rawScore) / Number(scaleFactor)).toFixed(2);
        const softmaxApprox = (1 / (1 + Math.exp(-Number(scaledScore)))).toFixed(4);
        newLogs.push(`>> Dimensión latente d_k: ${dK}`);
        newLogs.push(`>> Factor de escala √d_k: ${scaleFactor}`);
        newLogs.push(`>> Producto escalar Q·K^T sin escala: ${rawScore}`);
        newLogs.push(`>> Producto escalado (Q·K^T)/√d_k: ${scaledScore}`);
        newLogs.push(`>> Peso Softmax resultante: ${softmaxApprox}`);
        newLogs.push(`[INVARIANTE FEYNMAN]: La división por √d_k mantiene el gradiente vivo y evita que el softmax colapse a 0 o 1.`);
      } else if (artifact.concept.toLowerCase().includes('raft') || artifact.title.toLowerCase().includes('consenso')) {
        const totalNodes = Math.max(3, Math.floor(inputVal / 15) * 2 + 1);
        const quorum = Math.floor(totalNodes / 2) + 1;
        const respondingNodes = Math.min(totalNodes, Math.floor((secondaryVal / 100) * totalNodes) + 1);
        const hasConsensus = respondingNodes >= quorum;
        newLogs.push(`>> Cluster Raft: ${totalNodes} nodos configurados.`);
        newLogs.push(`>> Quórum requerido (N/2 + 1): ${quorum} nodos.`);
        newLogs.push(`>> Nodos activos respondiendo al Latido: ${respondingNodes} nodos.`);
        newLogs.push(`>> Estado del Consenso: ${hasConsensus ? '✓ CONQUISTADO (Transacción confirmada en log)' : '✗ BLOQUEADO (Esperando quórum de mayoría)'}`);
        newLogs.push(`[INVARIANTE FEYNMAN]: Raft nunca compromete un comando sin la mayoría estricta de ${quorum} votos.`);
      } else {
        newLogs.push(`>> Ejecución de rutina matemática paramétrica...`);
        const val = Math.sin((inputVal * Math.PI) / 180) * (secondaryVal / 10);
        newLogs.push(`>> Resultado de cálculo dinámico: ${val.toFixed(4)}`);
        newLogs.push(`>> Estado de convergencia: OK`);
      }
    } catch (e: any) {
      newLogs.push(`[Error de ejecución]: ${e.message}`);
    }

    setTimeout(() => {
      setOutputLogs(newLogs);
      setIsRunning(false);
    }, 300);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="w-full max-w-4xl max-h-[90vh] bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-100">{artifact.title}</h3>
                <span className="px-2 py-0.5 rounded text-xs font-mono bg-slate-800 text-slate-300 uppercase">
                  {artifact.language}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Simulación interactiva y ejecutable · Concepto: <span className="text-amber-400 font-medium">{artifact.concept}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center justify-between px-6 pt-3 pb-2 border-b border-slate-800/60 bg-slate-900/60">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('simulation')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5 ${
                activeTab === 'simulation'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              Simulador Interactivo
            </button>
            <button
              onClick={() => setActiveTab('source')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5 ${
                activeTab === 'source'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              Código Fuente Completo
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-2.5 py-1 text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded border border-slate-800 flex items-center gap-1.5 transition"
            >
              {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copiado' : 'Copiar Código'}
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {activeTab === 'simulation' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Controls */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                  <h4 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-amber-400" />
                    Parámetros de Simulación
                  </h4>
                  <button
                    onClick={runSimulation}
                    disabled={isRunning}
                    className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg flex items-center gap-1.5 transition shadow-lg shadow-amber-500/20 active:scale-95 disabled:opacity-50"
                  >
                    {isRunning ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                    Ejecutar Simulación
                  </button>
                </div>

                <div className="space-y-4 pt-1">
                  <div>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-slate-300 font-medium">Parámetro Principal (Magnitud / Precisión)</span>
                      <span className="font-mono text-amber-400 font-semibold">{inputVal}</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="100"
                      value={inputVal}
                      onChange={(e) => setInputVal(Number(e.target.value))}
                      className="w-full accent-amber-500 bg-slate-800 h-2 rounded-lg cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                      <span>Mínimo (1)</span>
                      <span>Máximo (100)</span>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-slate-300 font-medium">Parámetro Secundario (Factor de Escala / Quórum)</span>
                      <span className="font-mono text-cyan-400 font-semibold">{secondaryVal}</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="100"
                      value={secondaryVal}
                      onChange={(e) => setSecondaryVal(Number(e.target.value))}
                      className="w-full accent-cyan-500 bg-slate-800 h-2 rounded-lg cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                      <span>1</span>
                      <span>100</span>
                    </div>
                  </div>

                  {/* Feynman Explanation note */}
                  <div className="p-3.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200/90 leading-relaxed">
                    <span className="font-bold text-amber-400 block mb-1">✦ Método Feynman en este código:</span>
                    {artifact.explanation}
                  </div>
                </div>
              </div>

              {/* Console Output */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 flex flex-col font-mono text-xs">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-slate-400">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                    <span className="ml-2 text-[11px] text-slate-400">Consola de Salida</span>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-semibold">ESTADO: ACTIVO</span>
                </div>

                <div className="flex-1 py-3 overflow-y-auto space-y-2 text-slate-300 max-h-64">
                  {outputLogs.map((log, idx) => (
                    <div
                      key={idx}
                      className={
                        log.startsWith('[INVARIANTE')
                          ? 'text-amber-400 font-bold bg-amber-500/10 p-2 rounded border border-amber-500/20'
                          : log.startsWith('>>')
                          ? 'text-cyan-300 font-medium'
                          : 'text-slate-400'
                      }
                    >
                      {log}
                    </div>
                  ))}
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Modo interactivo en vivo</span>
                  <button
                    onClick={() => {
                      setOutputLogs([`[Sandbox Reiniciado] Listo.`]);
                    }}
                    className="text-slate-400 hover:text-slate-200 hover:underline"
                  >
                    Limpiar consola
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden font-mono text-xs">
              <div className="px-4 py-2 bg-slate-900 border-b border-slate-800 flex justify-between items-center text-slate-400">
                <span>{artifact.title}.{artifact.language === 'python' ? 'py' : 'ts'}</span>
                <span>{artifact.code.split('\n').length} líneas</span>
              </div>
              <pre className="p-4 overflow-x-auto text-slate-300 leading-relaxed max-h-96">
                <code>{artifact.code}</code>
              </pre>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <div className="text-xs text-slate-400">
            ¿Dudas sobre esta simulación? Pregúntale al profesor Feynman por voz.
          </div>
          <button
            onClick={() => {
              onAskAboutCode(artifact.title, `¿Cómo se relaciona la simulación de "${artifact.title}" con la fórmula fundamental de la diapositiva?`);
              onClose();
            }}
            className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs transition flex items-center gap-1.5 shadow-lg shadow-indigo-600/30"
          >
            <span>Preguntar por voz sobre este código</span>
          </button>
        </div>
      </div>
    </div>
  );
};
