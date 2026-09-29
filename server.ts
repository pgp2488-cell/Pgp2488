import express, { Request, Response } from 'express';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { WebSocketServer, WebSocket } from 'ws';
import { GoogleGenAI, Modality, FunctionDeclaration, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

const server = http.createServer(app);

// Initialize Gemini SDK with User-Agent header as required
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// System instruction for Professor Feynman persona in Live session
const FEYNMAN_PROFESSOR_PROMPT = `
Eres el Profesor Richard Feynman: un pedagogo apasionado, elocuente y lúcido.
Tu misión es enseñar y debatir el contenido de las diapositivas académicas y responder dudas de los estudiantes en tiempo real vía voz.

Reglas indispensables del Método Feynman:
1. Explica los conceptos más complejos con una analogía cotidiana intuitiva ("Explícaselo a un niño de 10 años").
2. Destruye el lenguaje inflado y el tecnicismo vacuo: desmitifica la jerga matemática o técnica con el significado físico real bajo el capó.
3. Señala explícitamente el Invariante Oculto (la verdad profunda que no cambia) y la trampa mental común en la que cae la gente.
4. Capacidad de Multitarea / Herramientas simultáneas:
   - Si el estudiante pregunta sobre algo que necesita visualización geométrica, di que vas a solicitar una infografía minimalista a Nanobanana y llama a la herramienta 'generateNanobananaInfographic'.
   - Si el concepto se entiende mejor con una simulación o cálculo (como un bucle, un cálculo de atención o un temporizador de Raft), di que vas a preparar un bloque de código interactivo en el panel lateral y llama a 'createInteractiveCode'.
   - Si el alumno te pregunta sobre un artefacto del panel lateral que está enfocado, explícalo detalladamente con paciencia y buen humor.
5. Mantén un tono enérgico, cálido, conversacional y entusiasta, con frases cortas adecuadas para voz natural en español.
`;

// Tool Declarations for Live API and Function Calling
const generateInfographicDecl: FunctionDeclaration = {
  name: 'generateNanobananaInfographic',
  description: 'Genera una infografía minimalista con Nanobanana en segundo plano para visualizar un concepto de la diapositiva en el panel lateral.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      topic: { type: Type.STRING, description: 'Concepto clave a ilustrar (ej: "Principio de Incertidumbre", "Mecanismo QKV", "Temporizadores Raft")' },
      visualDescription: { type: Type.STRING, description: 'Descripción de la infografía minimalista y su relación visual' },
      deepTakeaway: { type: Type.STRING, description: 'La verdad profunda que debe quedar grabada en la memoria' },
    },
    required: ['topic', 'visualDescription', 'deepTakeaway'],
  },
};

const createInteractiveCodeDecl: FunctionDeclaration = {
  name: 'createInteractiveCode',
  description: 'Crea un bloque de código ejecutable o interactivo en el panel lateral para simular o demostrar el concepto.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING, description: 'Título descriptivo del código' },
      concept: { type: Type.STRING, description: 'Concepto que demuestra el código' },
      language: { type: Type.STRING, description: 'Lenguaje: javascript, typescript o python' },
      code: { type: Type.STRING, description: 'Código fuente ejecutable o demostrativo completo' },
      explanation: { type: Type.STRING, description: 'Breve explicación paso a paso de lo que ocurre en el código' },
    },
    required: ['title', 'concept', 'code', 'explanation'],
  },
};

const explainFeynmanCardDecl: FunctionDeclaration = {
  name: 'explainWithFeynmanMethod',
  description: 'Crea una ficha estructurada de Método Feynman con analogía simple y trampa mental en el panel lateral.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      concept: { type: Type.STRING, description: 'Nombre del concepto' },
      analogy: { type: Type.STRING, description: 'Analogía intuitiva de la vida cotidiana' },
      underlyingTruth: { type: Type.STRING, description: 'Qué pasa realmente bajo el capó' },
      misconception: { type: Type.STRING, description: 'Error o trampa conceptual más común' },
    },
    required: ['concept', 'analogy', 'underlyingTruth', 'misconception'],
  },
};

const changeSlideDecl: FunctionDeclaration = {
  name: 'setFocusedSlide',
  description: 'Cambia la diapositiva activa para que el estudiante vea la diapositiva a la que te estás refiriendo.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      slideNumber: { type: Type.NUMBER, description: 'Número de la diapositiva (1-indexado)' },
      reason: { type: Type.STRING, description: 'Por qué diriges la atención a esta diapositiva' },
    },
    required: ['slideNumber'],
  },
};

// --- WebSocket Server for Gemini 3.8 Live ---
const wss = new WebSocketServer({ server, path: '/ws/live' });

wss.on('connection', async (clientWs: WebSocket) => {
  console.log('[Live WS] Client connected to Gemini 3.8 Live session');

  let liveSession: any = null;
  let currentVoice = 'Zephyr';

  // Helper to safely execute background nanobanana infographic
  const runBackgroundInfographic = async (topic: string, visualDesc: string, takeaway: string, slideNumber?: number) => {
    try {
      console.log(`[Nanobanana Background] Generating infographic for: ${topic}`);
      const artifact = await generateNanobananaInfographicInternal(topic, visualDesc, takeaway, slideNumber);
      if (clientWs.readyState === WebSocket.OPEN) {
        clientWs.send(JSON.stringify({
          type: 'artifact_created',
          artifact,
        }));
      }
      return artifact;
    } catch (err) {
      console.error('[Nanobanana Background] Error:', err);
      return null;
    }
  };

  // Helper to safely execute background code creation
  const runBackgroundCode = async (title: string, concept: string, code: string, explanation: string, language = 'javascript', slideNumber?: number) => {
    try {
      const artifact = {
        id: `code-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        type: 'code' as const,
        title,
        concept,
        slideNumber,
        language: (language || 'javascript') as 'javascript' | 'typescript' | 'python',
        code,
        explanation,
        runnable: true,
        simulationType: 'slider' as const,
        timestamp: Date.now(),
      };
      if (clientWs.readyState === WebSocket.OPEN) {
        clientWs.send(JSON.stringify({
          type: 'artifact_created',
          artifact,
        }));
      }
      return artifact;
    } catch (err) {
      console.error('[Code Background] Error:', err);
      return null;
    }
  };

  const connectLive = async (voiceName: string = 'Zephyr', initialContext?: string) => {
    try {
      const fullInstruction = initialContext
        ? `${FEYNMAN_PROFESSOR_PROMPT}\n\nCONTEXTO DE LA PRESENTACIÓN Y ESTUDIANTE ACTUAL:\n${initialContext}`
        : FEYNMAN_PROFESSOR_PROMPT;

      liveSession = await ai.live.connect({
        model: 'gemini-3.8-live',
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: voiceName || 'Zephyr' },
            },
          },
          systemInstruction: fullInstruction,
          outputAudioTranscription: {},
          inputAudioTranscription: {},
          tools: [
            {
              functionDeclarations: [
                generateInfographicDecl,
                createInteractiveCodeDecl,
                explainFeynmanCardDecl,
                changeSlideDecl,
              ],
            },
          ],
        },
        callbacks: {
          onmessage: async (message: any) => {
            try {
              // 1. Audio stream from model
              const audioData = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
              if (audioData && clientWs.readyState === WebSocket.OPEN) {
                clientWs.send(JSON.stringify({ type: 'audio', audio: audioData }));
              }

              // 2. Transcription stream (model output or input transcript)
              if (message.serverContent?.outputAudioTranscription?.text) {
                const text = message.serverContent.outputAudioTranscription.text;
                if (clientWs.readyState === WebSocket.OPEN) {
                  clientWs.send(JSON.stringify({ type: 'transcription', role: 'assistant', text }));
                }
              }

              if (message.serverContent?.inputAudioTranscription?.text) {
                const text = message.serverContent.inputAudioTranscription.text;
                if (clientWs.readyState === WebSocket.OPEN) {
                  clientWs.send(JSON.stringify({ type: 'transcription', role: 'user', text }));
                }
              }

              // 3. User interruption
              if (message.serverContent?.interrupted && clientWs.readyState === WebSocket.OPEN) {
                clientWs.send(JSON.stringify({ type: 'interrupted' }));
              }

              // 4. Handle Function Calls in Live API
              if (message.toolCall?.functionCalls) {
                for (const call of message.toolCall.functionCalls) {
                  const { name, args, id } = call;
                  console.log(`[Live WS] Tool call received: ${name}`, args);

                  let toolResult: any = { status: 'success' };

                  if (name === 'generateNanobananaInfographic') {
                    const art = await runBackgroundInfographic(args.topic, args.visualDescription, args.deepTakeaway);
                    toolResult = {
                      status: 'success',
                      message: `Infografía de Nanobanana generada y colocada en el panel lateral para ${args.topic}`,
                      artifactId: art?.id,
                    };
                  } else if (name === 'createInteractiveCode') {
                    const art = await runBackgroundCode(args.title, args.concept, args.code, args.explanation, args.language);
                    toolResult = {
                      status: 'success',
                      message: `Pieza de código interactiva creada en el panel lateral`,
                      artifactId: art?.id,
                    };
                  } else if (name === 'explainWithFeynmanMethod') {
                    const feynmanArtifact = {
                      id: `feynman-${Date.now()}`,
                      type: 'feynman_card' as const,
                      title: `Ficha Feynman: ${args.concept}`,
                      concept: args.concept,
                      eli5Explanation: args.analogy,
                      jargonDemystified: [],
                      deepUnderlyingMechanism: args.underlyingTruth,
                      knowledgeCheckQuestion: `¿Cómo aplicarías "${args.concept}" si cambian las condiciones iniciales?`,
                      suggestedAnswer: args.underlyingTruth,
                      timestamp: Date.now(),
                    };
                    if (clientWs.readyState === WebSocket.OPEN) {
                      clientWs.send(JSON.stringify({
                        type: 'artifact_created',
                        artifact: feynmanArtifact,
                      }));
                    }
                    toolResult = { status: 'success', message: 'Ficha de Método Feynman añadida al panel lateral' };
                  } else if (name === 'setFocusedSlide') {
                    if (clientWs.readyState === WebSocket.OPEN) {
                      clientWs.send(JSON.stringify({
                        type: 'change_slide',
                        slideNumber: args.slideNumber,
                        reason: args.reason,
                      }));
                    }
                    toolResult = { status: 'success', currentSlide: args.slideNumber };
                  }

                  // Respond back to Live session
                  if (liveSession && typeof liveSession.sendToolResponse === 'function') {
                    await liveSession.sendToolResponse({
                      functionResponses: [
                        {
                          id,
                          name,
                          response: toolResult,
                        },
                      ],
                    });
                  }
                }
              }
            } catch (msgErr) {
              console.error('[Live WS onmessage error]:', msgErr);
            }
          },
        },
      });

      if (clientWs.readyState === WebSocket.OPEN) {
        clientWs.send(JSON.stringify({ type: 'connected', model: 'gemini-3.8-live' }));
      }
    } catch (err: any) {
      console.error('[Live WS connect error]:', err?.message || err);
      if (clientWs.readyState === WebSocket.OPEN) {
        clientWs.send(JSON.stringify({
          type: 'error',
          error: `Error al conectar con Gemini 3.8 Live: ${err?.message || 'Verifica API Key'}. Modo fallback activo.`,
        }));
      }
    }
  };

  // Initial connection
  connectLive(currentVoice);

  clientWs.on('message', async (data: Buffer | string) => {
    try {
      const msg = JSON.parse(data.toString());

      if (msg.type === 'audio' && msg.audio) {
        // Stream raw 16kHz PCM audio to Gemini Live
        if (liveSession && typeof liveSession.sendRealtimeInput === 'function') {
          liveSession.sendRealtimeInput({
            audio: { data: msg.audio, mimeType: 'audio/pcm;rate=16000' },
          });
        }
      } else if (msg.type === 'text' && msg.text) {
        // Send text prompt into the live conversation
        if (liveSession && typeof liveSession.sendRealtimeInput === 'function') {
          liveSession.sendRealtimeInput({
            text: msg.text,
          });
        }
      } else if (msg.type === 'update_context') {
        // When student switches slide or focuses an artifact, inject context
        const contextUpdate = `
[ACTUALIZACIÓN DE ESTADO DEL ESTUDIANTE]:
- Diapositiva actual: ${msg.slideNumber || 'N/A'} - "${msg.slideTitle || 'N/A'}"
- Contenido de la diapositiva: ${msg.slideContent || 'N/A'}
- Artefacto lateral enfocado: ${msg.focusedArtifact ? JSON.stringify(msg.focusedArtifact) : 'Ninguno'}
- Si el estudiante te hace preguntas ambiguas como "¿qué significa esto?", asume que se refiere a este contenido.`;

        if (liveSession && typeof liveSession.sendRealtimeInput === 'function') {
          liveSession.sendRealtimeInput({
            text: contextUpdate,
          });
        }
      } else if (msg.type === 'set_voice') {
        currentVoice = msg.voice || 'Zephyr';
        if (liveSession && typeof liveSession.close === 'function') {
          try { liveSession.close(); } catch (_) {}
        }
        await connectLive(currentVoice, msg.currentContext);
      }
    } catch (parseErr) {
      console.error('[Live WS incoming message error]:', parseErr);
    }
  });

  clientWs.on('close', () => {
    console.log('[Live WS] Client disconnected');
    if (liveSession && typeof liveSession.close === 'function') {
      try { liveSession.close(); } catch (_) {}
    }
  });
});

// --- Helper for Nanobanana Infographic Generation ---
async function generateNanobananaInfographicInternal(
  topic: string,
  visualDescription?: string,
  deepTakeaway?: string,
  slideNumber?: number
) {
  const id = `info-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

  // 1. Synthesize structured Feynman knowledge analysis using gemini-3.8-flash
  const analysisPrompt = `
Genera un desglose conceptual profundo y minimalista para una infografía del concepto: "${topic}".
Contexto adicional o foco: "${visualDescription || ''} - ${deepTakeaway || ''}".
Aplica el Método Feynman de aprendizaje.

Devuelve estrictamente un objeto JSON con esta estructura exacta:
{
  "title": "Título corto y contundente",
  "concept": "${topic}",
  "deepContext": "Explicación profunda de lo que sucede bajo el capó sin ambigüedades",
  "invisibleInvariant": "La verdad fundamental o invariante físico/lógico que nunca cambia",
  "feynmanAnalogy": "Una analogía cotidiana visual y brillante",
  "commonMisconception": "El error mental más común que confunde a los estudiantes",
  "keyTakeaway": "La regla de oro en una sola oración memorable",
  "svgConcept": "diagrama"
}
`;

  let analysisData: any = {
    title: topic,
    concept: topic,
    deepContext: `Análisis fundamental de ${topic}: las relaciones causales e invariantes determinan el comportamiento del sistema.`,
    invisibleInvariant: 'La conservación y la invariancia de escala gobiernan el fenómeno.',
    feynmanAnalogy: 'Imagina un sistema de engranajes donde cada vuelta pequeña mueve con precisión una rueda gigante.',
    commonMisconception: 'Creer que el fenómeno es aleatorio cuando en realidad está rigurosamente acotado por las condiciones de contorno.',
    keyTakeaway: 'Comprende el invariante y todo el resto de la teoría se deduce por sí solo.',
  };

  try {
    const analysisResponse = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: analysisPrompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    if (analysisResponse.text) {
      const parsed = JSON.parse(analysisResponse.text);
      analysisData = { ...analysisData, ...parsed };
    }
  } catch (err) {
    console.warn('[Feynman Analysis fallback triggered]:', err);
  }

  // 2. Nanobanana Image Generation via gemini-3.1-flash-lite-image
  let imageDataBase64: string | undefined = undefined;
  let sourceModel: 'gemini-3.1-flash-lite-image' | 'gemini-3.8-flash' = 'gemini-3.1-flash-lite-image';

  try {
    const imagePrompt = `
Academic minimalist infographic illustration about: "${topic}".
Visual focus: ${visualDescription || analysisData.feynmanAnalogy}.
Style: High-end Swiss graphic design, stark dark slate background (#0a0f1d), sharp geometric lines, crisp diagrams, glowing amber (#f59e0b) and cyan accents, pure conceptual clarity, schematic blueprint aesthetic, clean typography placeholders, zero clutter, museum-quality educational diagram.
`;

    const imgRes = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite-image',
      contents: {
        parts: [{ text: imagePrompt }],
      },
      config: {
        imageConfig: {
          aspectRatio: '16:9',
        },
      },
    });

    if (imgRes.candidates?.[0]?.content?.parts) {
      for (const part of imgRes.candidates[0].content.parts) {
        if (part.inlineData?.data) {
          imageDataBase64 = `data:image/png;base64,${part.inlineData.data}`;
          break;
        }
      }
    }
  } catch (imgErr: any) {
    console.warn('[Nanobanana Image API notice]:', imgErr?.message || imgErr);
    sourceModel = 'gemini-3.8-flash';
  }

  // Generate a clean geometric SVG diagram for instant visual rendering or fallback
  const svgDiagram = generateMinimalistSvgDiagram(topic, analysisData);

  return {
    id,
    type: 'infographic' as const,
    title: analysisData.title || topic,
    concept: topic,
    slideNumber,
    imageDataBase64,
    sourceModel,
    deepContext: analysisData.deepContext,
    invisibleInvariant: analysisData.invisibleInvariant,
    feynmanAnalogy: analysisData.feynmanAnalogy,
    commonMisconception: analysisData.commonMisconception,
    keyTakeaway: analysisData.keyTakeaway,
    svgDiagram,
    timestamp: Date.now(),
  };
}

// Generate aesthetic minimalist SVG infographic diagram
function generateMinimalistSvgDiagram(topic: string, data: any) {
  const safeTopic = topic.replace(/[<>&"]/g, '');
  const safeTitle = (data.title || topic).replace(/[<>&"]/g, '');
  const safeInvariant = (data.invisibleInvariant || '').slice(0, 75).replace(/[<>&"]/g, '');
  const safeAnalogy = (data.feynmanAnalogy || '').slice(0, 90).replace(/[<>&"]/g, '');

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450" width="100%" height="100%" class="rounded-xl shadow-2xl">
    <defs>
      <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#0a0f1d"/>
        <stop offset="50%" stop-color="#0d1527"/>
        <stop offset="100%" stop-color="#070a14"/>
      </linearGradient>
      <linearGradient id="amberGlow" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#f59e0b" stop-opacity="0.8"/>
        <stop offset="100%" stop-color="#d97706" stop-opacity="0.2"/>
      </linearGradient>
      <linearGradient id="cyanGlow" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#06b6d4" stop-opacity="0.9"/>
        <stop offset="100%" stop-color="#3b82f6" stop-opacity="0.3"/>
      </linearGradient>
      <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="8" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    </defs>

    <!-- Canvas Background -->
    <rect width="800" height="450" fill="url(#bgGrad)" rx="16"/>

    <!-- Subtle Grid Blueprint Lines -->
    <g opacity="0.08" stroke="#38bdf8" stroke-width="1">
      <line x1="100" y1="0" x2="100" y2="450"/>
      <line x1="200" y1="0" x2="200" y2="450"/>
      <line x1="300" y1="0" x2="300" y2="450"/>
      <line x1="400" y1="0" x2="400" y2="450"/>
      <line x1="500" y1="0" x2="500" y2="450"/>
      <line x1="600" y1="0" x2="600" y2="450"/>
      <line x1="700" y1="0" x2="700" y2="450"/>
      <line x1="0" y1="75" x2="800" y2="75"/>
      <line x1="0" y1="150" x2="800" y2="150"/>
      <line x1="0" y1="225" x2="800" y2="225"/>
      <line x1="0" y1="300" x2="800" y2="300"/>
      <line x1="0" y1="375" x2="800" y2="375"/>
    </g>

    <!-- Header & Badge -->
    <rect x="40" y="32" width="130" height="24" rx="12" fill="#f59e0b" fill-opacity="0.15" stroke="#f59e0b" stroke-opacity="0.5"/>
    <text x="52" y="48" fill="#fbbf24" font-family="system-ui, sans-serif" font-size="11" font-weight="700" letter-spacing="1">NANOBANANA INFOGRAFÍA</text>
    <text x="760" y="48" text-anchor="end" fill="#64748b" font-family="monospace" font-size="11">MÉTODO FEYNMAN</text>

    <!-- Main Title -->
    <text x="40" y="95" fill="#f8fafc" font-family="system-ui, sans-serif" font-size="24" font-weight="800">${safeTitle}</text>
    <text x="40" y="122" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="13">${safeTopic} · Arquitectura Conceptual &amp; Visual</text>

    <!-- Left: Geometric Concept Model -->
    <g transform="translate(40, 150)">
      <!-- Main Glass Card -->
      <rect width="360" height="250" rx="12" fill="#1e293b" fill-opacity="0.4" stroke="#334155" stroke-width="1.5"/>
      
      <!-- Vector Waves / Quantum Orbitals / Attention Network -->
      <circle cx="180" cy="115" r="70" fill="none" stroke="url(#cyanGlow)" stroke-width="2" stroke-dasharray="4 4" filter="url(#glow)"/>
      <circle cx="180" cy="115" r="45" fill="none" stroke="#f59e0b" stroke-width="2" opacity="0.8"/>
      <circle cx="180" cy="115" r="6" fill="#38bdf8" filter="url(#glow)"/>

      <!-- Vector Axes & Projections -->
      <line x1="70" y1="115" x2="290" y2="115" stroke="#475569" stroke-width="1.5" stroke-dasharray="2 2"/>
      <line x1="180" y1="35" x2="180" y2="195" stroke="#475569" stroke-width="1.5" stroke-dasharray="2 2"/>

      <!-- Dynamic Tangent Arrows -->
      <path d="M 125,75 Q 180,45 235,75" fill="none" stroke="#f59e0b" stroke-width="2.5" marker-end="url(#arrow)"/>
      <path d="M 125,155 Q 180,185 235,155" fill="none" stroke="#06b6d4" stroke-width="2.5"/>

      <!-- Bottom Card Label -->
      <rect x="20" y="210" width="320" height="28" rx="6" fill="#0f172a" stroke="#1e293b"/>
      <text x="32" y="228" fill="#38bdf8" font-family="monospace" font-size="11">INVARIANTE:</text>
      <text x="110" y="228" fill="#e2e8f0" font-family="system-ui, sans-serif" font-size="11" font-weight="500">${safeInvariant}...</text>
    </g>

    <!-- Right: Feynman Insight Cards -->
    <g transform="translate(420, 150)">
      <!-- Box 1: Analogía Intuitiva -->
      <rect width="340" height="115" rx="12" fill="#1e293b" fill-opacity="0.5" stroke="#f59e0b" stroke-opacity="0.3" stroke-width="1.5"/>
      <circle cx="28" cy="28" r="10" fill="#f59e0b" fill-opacity="0.2"/>
      <text x="25" y="32" fill="#fbbf24" font-family="system-ui" font-size="12" font-weight="bold">✦</text>
      <text x="46" y="32" fill="#fbbf24" font-family="system-ui, sans-serif" font-size="13" font-weight="700">Analogía de Feynman (Intuitiva)</text>
      <text x="20" y="60" width="300" fill="#cbd5e1" font-family="system-ui, sans-serif" font-size="12" font-style="italic">"${safeAnalogy}..."</text>
      <text x="20" y="95" fill="#64748b" font-family="system-ui, sans-serif" font-size="10">El cerebro humano comprende mejor por metáfora física directa.</text>

      <!-- Box 2: Núcleo y Regla de Oro -->
      <g transform="translate(0, 130)">
        <rect width="340" height="120" rx="12" fill="#1e293b" fill-opacity="0.5" stroke="#06b6d4" stroke-opacity="0.3" stroke-width="1.5"/>
        <circle cx="28" cy="28" r="10" fill="#06b6d4" fill-opacity="0.2"/>
        <text x="24" y="32" fill="#38bdf8" font-family="system-ui" font-size="12" font-weight="bold">◎</text>
        <text x="46" y="32" fill="#38bdf8" font-family="system-ui, sans-serif" font-size="13" font-weight="700">Mecanismo Profundo &amp; Trampa Evitada</text>
        <text x="20" y="58" fill="#e2e8f0" font-family="system-ui, sans-serif" font-size="11">Cuidado con la trampa clásica: no confundir efecto de medida con error instrumental.</text>
        <rect x="20" y="78" width="300" height="26" rx="6" fill="#064e3b" fill-opacity="0.4" stroke="#059669" stroke-opacity="0.5"/>
        <text x="30" y="95" fill="#34d399" font-family="system-ui, sans-serif" font-size="11" font-weight="600">✓ Takeaway: El límite es una ley geométrica fundamental.</text>
      </g>
    </g>
  </svg>`;
}

// --- REST Endpoints ---

// 1. Nanobanana Infographic Generator (Simultaneous background task)
app.post('/api/artifacts/nanobanana', async (req: Request, res: Response) => {
  try {
    const { topic, visualDescription, deepTakeaway, slideNumber } = req.body;
    if (!topic) {
      return res.status(400).json({ error: 'topic is required' });
    }

    const artifact = await generateNanobananaInfographicInternal(
      topic,
      visualDescription,
      deepTakeaway,
      slideNumber
    );

    res.json({ success: true, artifact });
  } catch (err: any) {
    console.error('[API /api/artifacts/nanobanana error]:', err);
    res.status(500).json({ error: err.message || 'Error generating infographic' });
  }
});

// 2. Interactive Code Generator
app.post('/api/artifacts/code', async (req: Request, res: Response) => {
  try {
    const { topic, concept, slideTitle, slideText, slideNumber, language = 'javascript' } = req.body;

    const prompt = `
Eres un educador técnico de clase mundial que usa el Método Feynman.
Crea una pieza de código limpio, visual y ejecutable en ${language} que demuestre de forma interactiva el concepto: "${concept || topic}".
Contexto de la diapositiva: "${slideTitle || ''} - ${slideText || ''}".

Requisitos:
- El código debe ser autocontenido, fácil de entender y con comentarios pedagógicos en español.
- Si es JavaScript/TypeScript, debe tener una función simular(...) o interactiva con parámetros ajustables (ej: sliders, iteraciones, estado).
- Agrega una explicación paso a paso de lo que ocurre en cada parte crítica.

Devuelve estrictamente un objeto JSON:
{
  "title": "Título descriptivo del código (ej: Simulación de Incertidumbre Posición vs Momento)",
  "concept": "${concept || topic}",
  "language": "${language}",
  "code": "// Código completo...",
  "explanation": "Explicación conceptual paso a paso en español...",
  "runnable": true,
  "simulationType": "slider",
  "testCasesOrInputs": [
    { "label": "Parámetro 1", "value": 10 },
    { "label": "Parámetro 2", "value": 50 }
  ]
}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    let codeData: any;
    try {
      codeData = JSON.parse(response.text || '{}');
    } catch {
      codeData = {
        title: `Código Demostrativo: ${concept || topic}`,
        concept: concept || topic,
        language: 'javascript',
        code: `// Simulación de ${concept || topic}\nfunction simulate(input = 42) {\n  console.log("Calculando estado cuántico con input:", input);\n  const result = Math.sin(input) * Math.cos(input / 2);\n  return { input, result: Number(result.toFixed(4)) };\n}\nconsole.log(simulate(10));`,
        explanation: 'Función demostrativa básica con cálculo paramétrico.',
        runnable: true,
        simulationType: 'console',
      };
    }

    const artifact = {
      id: `code-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      type: 'code' as const,
      title: codeData.title || `Simulación de ${concept || topic}`,
      concept: concept || topic,
      slideNumber,
      language: codeData.language || language,
      code: codeData.code,
      explanation: codeData.explanation,
      runnable: codeData.runnable ?? true,
      simulationType: codeData.simulationType || 'slider',
      testCasesOrInputs: codeData.testCasesOrInputs || [],
      timestamp: Date.now(),
    };

    res.json({ success: true, artifact });
  } catch (err: any) {
    console.error('[API /api/artifacts/code error]:', err);
    res.status(500).json({ error: err.message || 'Error generating code artifact' });
  }
});

// 3. Structured Feynman Breakdown
app.post('/api/feynman/breakdown', async (req: Request, res: Response) => {
  try {
    const { topic, slideTitle, slideBullets, slideEquation } = req.body;

    const prompt = `
Aplica el Método Feynman riguroso para la diapositiva:
Título: ${slideTitle || topic}
Puntos: ${JSON.stringify(slideBullets || [])}
Fórmula/Ecuación: ${slideEquation || 'N/A'}

Devuelve estrictamente un objeto JSON:
{
  "title": "Ficha Feynman: ${topic || slideTitle}",
  "concept": "${topic || slideTitle}",
  "eli5Explanation": "Explicación simple como si el oyente tuviera 10 años (metáfora clara)",
  "jargonDemystified": [
    { "term": "Término técnico 1", "simpleMeaning": "Qué significa en cristiano" },
    { "term": "Término técnico 2", "simpleMeaning": "Qué significa en cristiano" }
  ],
  "deepUnderlyingMechanism": "Explicación rigurosa de lo que pasa de verdad bajo el capó",
  "knowledgeCheckQuestion": "Una pregunta desafiante para comprobar si el estudiante realmente lo entendió",
  "suggestedAnswer": "La respuesta correcta explicada intuitivamente"
}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');

    const artifact = {
      id: `feynman-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      type: 'feynman_card' as const,
      title: parsed.title || `Ficha Feynman: ${topic || slideTitle}`,
      concept: topic || slideTitle,
      eli5Explanation: parsed.eli5Explanation || 'Explicación simplificada del fenómeno.',
      jargonDemystified: parsed.jargonDemystified || [],
      deepUnderlyingMechanism: parsed.deepUnderlyingMechanism || 'Mecanismo físico fundamental.',
      knowledgeCheckQuestion: parsed.knowledgeCheckQuestion || '¿Qué ocurre al variar las condiciones límite?',
      suggestedAnswer: parsed.suggestedAnswer || 'El sistema responde de acuerdo con el principio de conservación.',
      timestamp: Date.now(),
    };

    res.json({ success: true, artifact });
  } catch (err: any) {
    console.error('[API /api/feynman/breakdown error]:', err);
    res.status(500).json({ error: err.message || 'Error generating Feynman breakdown' });
  }
});

// 4. Voice Interaction Fallback (Transcription + Feynman text + TTS audio)
app.post('/api/voice/interact', async (req: Request, res: Response) => {
  try {
    const { userText, audioBase64, currentSlide, focusedArtifact, history = [] } = req.body;

    let promptText = userText;

    // If audio is provided instead of text, transcribe with gemini-3.5-transcribe
    if (!promptText && audioBase64) {
      try {
        const transcribeRes = await ai.models.generateContent({
          model: 'gemini-3.5-transcribe',
          contents: {
            parts: [
              {
                inlineData: {
                  mimeType: 'audio/webm',
                  data: audioBase64.replace(/^data:audio\/\w+;base64,/, ''),
                },
              },
              { text: 'Transcribe fielmente lo que dice el estudiante en español.' },
            ],
          },
        });
        promptText = transcribeRes.text?.trim() || '';
      } catch (transcribeErr) {
        console.warn('[Transcription notice]:', transcribeErr);
      }
    }

    if (!promptText) {
      return res.status(400).json({ error: 'No text or recognizable audio provided.' });
    }

    // Build context
    const contextPrompt = `
Eres el Profesor Richard Feynman.
El estudiante te está preguntando o hablando sobre una presentación académica:
Diapositiva Actual: ${currentSlide ? `Diapositiva #${currentSlide.slideNumber}: ${currentSlide.title}. Clave: ${currentSlide.keyConcept}. Fórmula: ${currentSlide.deepEquationOrFormula || 'N/A'}` : 'Sin diapositiva seleccionada'}
Artefacto lateral enfocado: ${focusedArtifact ? `[Tipo: ${focusedArtifact.type}, Título: ${focusedArtifact.title}, Concepto: ${focusedArtifact.concept}]` : 'Ninguno'}

Pregunta o comentario del estudiante: "${promptText}"

Instrucciones:
1. Responde con el estilo característico de Feynman: apasionado, con una analogía simple, desenmascarando la jerga técnica.
2. Si el estudiante te pide una infografía ("hazme una infografía", "quiero ver un esquema", "pídele a nanobanana"), indícaselo entusiastamente al principio de tu respuesta.
3. Si el estudiante te pide código o una prueba práctica, indícale que vas a preparar la pieza interactiva.
4. Mantén la respuesta concisa y oral (máximo 3 párrafos cortos) para que suene excelente cuando se reproduzca por voz.
`;

    const chatResponse = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: contextPrompt,
    });

    const assistantText = chatResponse.text || '¡Esa es una pregunta fascinante! Pensemos en esto desde los primeros principios...';

    // Now synthesize high-clarity voice with gemini-3.8-flash-lite-tts
    let audioWavBase64: string | undefined = undefined;
    try {
      const ttsResponse = await ai.models.generateContent({
        model: 'gemini-3.8-flash-lite-tts',
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: assistantText,
                speechMetadata: {
                  style: 'Warm, enthusiastic, brilliant physics professor speaking clearly in Spanish',
                },
              },
            ],
          },
        ],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Zephyr' },
            },
          },
        },
      });

      const audioPart = ttsResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (audioPart) {
        audioWavBase64 = audioPart;
      }
    } catch (ttsErr) {
      console.warn('[TTS audio notice]:', ttsErr);
    }

    // Check if user requested an infographic or code to trigger background creation
    let autoArtifact: any = null;
    const lowerPrompt = promptText.toLowerCase();
    if (lowerPrompt.includes('infografía') || lowerPrompt.includes('nanobanana') || lowerPrompt.includes('esquema visual') || lowerPrompt.includes('diagrama')) {
      const topic = currentSlide?.title || 'Concepto Académico';
      autoArtifact = await generateNanobananaInfographicInternal(topic, promptText, 'Visualización de contexto profundo', currentSlide?.slideNumber);
    } else if (lowerPrompt.includes('código') || lowerPrompt.includes('programar') || lowerPrompt.includes('simulaci') || lowerPrompt.includes('ejemplo de código')) {
      // Auto trigger code
      const topic = currentSlide?.title || 'Algoritmo';
      const codeRes = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `Crea un código interactivo en JavaScript para simular: ${topic}. Devuelve solo JSON: { "title": "Simulación", "concept": "${topic}", "code": "// code", "explanation": "explicación" }`,
        config: { responseMimeType: 'application/json' },
      });
      try {
        const parsedCode = JSON.parse(codeRes.text || '{}');
        autoArtifact = {
          id: `code-${Date.now()}`,
          type: 'code' as const,
          title: parsedCode.title || `Simulación de ${topic}`,
          concept: topic,
          slideNumber: currentSlide?.slideNumber,
          language: 'javascript' as const,
          code: parsedCode.code || '// código',
          explanation: parsedCode.explanation || 'Demostración práctica del concepto.',
          runnable: true,
          simulationType: 'slider' as const,
          timestamp: Date.now(),
        };
      } catch (_) {}
    }

    res.json({
      userText: promptText,
      assistantText,
      audioWavBase64,
      autoArtifact,
    });
  } catch (err: any) {
    console.error('[API /api/voice/interact error]:', err);
    res.status(500).json({ error: err.message || 'Error processing voice interaction' });
  }
});

// Setup Vite middlewares in dev or static files in production
const isProduction = process.env.NODE_ENV === 'production';

if (!isProduction) {
  const { createServer: createViteServer } = await import('vite');
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
} else {
  app.use(express.static(path.resolve(__dirname, 'dist')));
  app.get('*', (_req: Request, res: Response) => {
    res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
  });
}

const PORT = parseInt(process.env.PORT || '3000', 10);
server.listen(PORT, '0.0.0.0', () => {
  console.log(`[FeynmanLive Server] Running on http://0.0.0.0:${PORT}`);
});
