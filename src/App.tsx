import React, { useState, useEffect, useRef, useCallback } from 'react';
import { SAMPLE_PRESENTATIONS } from './data/samplePresentations';
import { Presentation, Slide, Artifact, InfographicArtifact, CodeArtifact, LiveVoiceState, VoiceMessage } from './types';
import { GeminiLiveService } from './services/geminiLiveService';
import { apiService } from './services/apiService';
import { Header } from './components/Header';
import { SlideViewer } from './components/SlideViewer';
import { LateralArtifactsPanel } from './components/LateralArtifactsPanel';
import { VoiceFloatingDock } from './components/VoiceFloatingDock';
import { CodeSandboxModal } from './components/CodeSandboxModal';
import { InfographicModal } from './components/InfographicModal';
import { PdfUploadModal } from './components/PdfUploadModal';

export default function App() {
  // Current Presentation & Slide
  const [presentations] = useState<Presentation[]>(SAMPLE_PRESENTATIONS);
  const [currentPresentation, setCurrentPresentation] = useState<Presentation>(SAMPLE_PRESENTATIONS[0]);
  const [currentSlideIndex, setCurrentSlideIndex] = useState<number>(0);

  // Lateral Artifacts
  const [artifacts, setArtifacts] = useState<Artifact[]>(() => {
    // Initial pre-seeded artifact for instant immersion
    return [
      {
        id: 'initial-info-1',
        type: 'infographic',
        title: 'Mapa Mental: Principio de Incertidumbre y Espacio de Fases',
        concept: 'Incertidumbre de Heisenberg (Δx · Δp ≥ ℏ/2)',
        slideNumber: 2,
        sourceModel: 'nanobanana',
        deepContext: 'El límite de incertidumbre no surge por imperfecciones en la medición, sino porque la posición y el momento lineal son variables conjugadas de Fourier. Al estrechar una función de onda en el espacio de coordenadas, su transformada en el espacio de momentos se ensancha matemáticamente.',
        invisibleInvariant: 'El área mínima del paquete de ondas en el espacio de fases cuántico nunca puede ser inferior a ℏ/2.',
        feynmanAnalogy: 'Un chasquido ultra breve de sonido no tiene una nota musical reconocible; para que el oído distinga el tono exacto, la onda debe extenderse en el tiempo.',
        commonMisconception: 'Creer que el fotón del microscopio "empuja" mecánicamente al electrón por torpeza técnica humana.',
        keyTakeaway: 'La incompatibilidad es una propiedad geométrica intrínseca de los operadores lineales.',
        svgDiagram: undefined,
        timestamp: Date.now() - 60000,
      } as InfographicArtifact,
    ];
  });
  const [focusedArtifact, setFocusedArtifact] = useState<Artifact | null>(artifacts[0]);

  // Voice & Live State
  const [voiceState, setVoiceState] = useState<LiveVoiceState>({
    isConnected: false,
    isConnecting: false,
    isListening: false,
    isSpeaking: false,
    isMuted: true, // start muted for user comfort until unmuted
    audioLevel: 0,
    selectedVoice: 'Zephyr',
  });

  const [voiceMessages, setVoiceMessages] = useState<VoiceMessage[]>([
    {
      id: 'welcome-1',
      role: 'assistant',
      text: '¡Hola! Soy tu tutor Feynman. Estoy listo para explorar juntos esta presentación. Pregúntame lo que quieras por voz; te lo explicaré con analogías simples y podemos pedir infografías a Nanobanana o escribir código interactivo sobre la marcha.',
      timestamp: Date.now(),
    },
  ]);

  const [lastTranscriptText, setLastTranscriptText] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isNanobananaLoading, setIsNanobananaLoading] = useState<boolean>(false);
  const [isCodeLoading, setIsCodeLoading] = useState<boolean>(false);

  // Modals
  const [isPdfModalOpen, setIsPdfModalOpen] = useState<boolean>(false);
  const [activeCodeModal, setActiveCodeModal] = useState<CodeArtifact | null>(null);
  const [activeInfographicModal, setActiveInfographicModal] = useState<InfographicArtifact | null>(null);

  // Live Service Reference
  const liveServiceRef = useRef<GeminiLiveService | null>(null);
  const currentSlide = currentPresentation.slides[currentSlideIndex] || currentPresentation.slides[0];

  // Sync context to Live session whenever slide or focused artifact changes
  const syncLiveContext = useCallback(() => {
    if (liveServiceRef.current) {
      liveServiceRef.current.updateContext({
        slideNumber: currentSlide.slideNumber,
        slideTitle: currentSlide.title,
        slideContent: `${currentSlide.bullets.join('. ')}. Clave: ${currentSlide.keyConcept}. Fórmula: ${currentSlide.deepEquationOrFormula || 'N/A'}`,
        focusedArtifact: focusedArtifact
          ? { id: focusedArtifact.id, type: focusedArtifact.type, title: focusedArtifact.title, concept: focusedArtifact.concept }
          : null,
      });
    }
  }, [currentSlide, focusedArtifact]);

  // Connect to Gemini 3.8 Live session
  const initLiveSession = useCallback(async (voiceName = 'Zephyr') => {
    setVoiceState((prev) => ({ ...prev, isConnecting: true, error: undefined }));

    try {
      if (liveServiceRef.current) {
        liveServiceRef.current.cleanup();
      }

      const live = new GeminiLiveService({
        onConnected: () => {
          setVoiceState((prev) => ({
            ...prev,
            isConnected: true,
            isConnecting: false,
            error: undefined,
          }));
          syncLiveContext();
        },
        onDisconnected: () => {
          setVoiceState((prev) => ({ ...prev, isConnected: false, isConnecting: false }));
        },
        onError: (err) => {
          setVoiceState((prev) => ({ ...prev, error: err, isConnecting: false }));
        },
        onTranscription: (role, text) => {
          setLastTranscriptText(text);
          setVoiceMessages((prev) => [
            ...prev,
            {
              id: `msg-${Date.now()}-${Math.random()}`,
              role,
              text,
              timestamp: Date.now(),
            },
          ]);
        },
        onArtifactCreated: (artifact) => {
          setArtifacts((prev) => [artifact, ...prev]);
          setFocusedArtifact(artifact);
        },
        onChangeSlide: (slideNumber) => {
          const targetIndex = slideNumber - 1;
          if (targetIndex >= 0 && targetIndex < currentPresentation.slides.length) {
            setCurrentSlideIndex(targetIndex);
          }
        },
        onSpeakingStateChange: (isSpeaking) => {
          setVoiceState((prev) => ({ ...prev, isSpeaking }));
        },
        onAudioLevel: (level) => {
          setVoiceState((prev) => ({ ...prev, audioLevel: level }));
        },
      });

      liveServiceRef.current = live;
      await live.connect(voiceName);

      // Start mic if not muted
      try {
        await live.startMicrophone();
        live.setMute(voiceState.isMuted);
      } catch (micErr) {
        console.warn('Microphone permission not granted yet:', micErr);
      }
    } catch (err: any) {
      console.error('Failed to connect to Live session:', err);
      setVoiceState((prev) => ({
        ...prev,
        isConnected: false,
        isConnecting: false,
        error: 'No se pudo conectar a Gemini 3.8 Live. El modo de respaldo está activo.',
      }));
    }
  }, [syncLiveContext, voiceState.isMuted, currentPresentation.slides.length]);

  useEffect(() => {
    initLiveSession(voiceState.selectedVoice);

    return () => {
      if (liveServiceRef.current) {
        liveServiceRef.current.cleanup();
      }
    };
  }, []); // Run on mount

  // Sync context when slide changes
  useEffect(() => {
    syncLiveContext();
  }, [currentSlideIndex, focusedArtifact, syncLiveContext]);

  // Toggle Microphone
  const handleToggleMute = async () => {
    const newMuted = !voiceState.isMuted;
    setVoiceState((prev) => ({ ...prev, isMuted: newMuted }));

    if (liveServiceRef.current) {
      if (!newMuted && !liveServiceRef.current.getIsConnected()) {
        await initLiveSession(voiceState.selectedVoice);
      }
      try {
        if (!newMuted) {
          await liveServiceRef.current.startMicrophone();
        }
        liveServiceRef.current.setMute(newMuted);
      } catch (e) {
        console.warn('Mic toggle notice:', e);
      }
    }
  };

  // Switch Voice
  const handleChangeVoice = (voice: 'Zephyr' | 'Puck' | 'Charon' | 'Kore' | 'Fenrir') => {
    setVoiceState((prev) => ({ ...prev, selectedVoice: voice }));
    if (liveServiceRef.current) {
      liveServiceRef.current.setVoice(
        voice,
        `Diapositiva actual: ${currentSlide.title}. Clave: ${currentSlide.keyConcept}`
      );
    }
  };

  // Slide Navigation
  const handlePrevSlide = () => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex(currentSlideIndex - 1);
    }
  };

  const handleNextSlide = () => {
    if (currentSlideIndex < currentPresentation.slides.length - 1) {
      setCurrentSlideIndex(currentSlideIndex + 1);
    }
  };

  const handleSelectSlide = (index: number) => {
    if (index >= 0 && index < currentPresentation.slides.length) {
      setCurrentSlideIndex(index);
    }
  };

  // Simultaneous Nanobanana Infographic Generator
  const handleRequestNanobanana = async () => {
    setIsNanobananaLoading(true);
    try {
      const artifact = await apiService.generateNanobananaInfographic(
        currentSlide.title,
        `Enfoque en ${currentSlide.keyConcept}. Pista intuitiva: ${currentSlide.feynmanAnalogyHint}`,
        'Contexto profundo e invariante conceptual',
        currentSlide.slideNumber
      );
      setArtifacts((prev) => [artifact, ...prev]);
      setFocusedArtifact(artifact);

      // Trigger Feynman voice response about the new infographic
      const prompt = `Profesor Feynman, acabo de solicitar a Nanobanana una infografía minimalista sobre "${currentSlide.title}". Explícame qué debemos observar en este esquema.`;
      handleSendMessage(prompt);
    } catch (err: any) {
      console.error('Error generating Nanobanana infographic:', err);
    } finally {
      setIsNanobananaLoading(false);
    }
  };

  // Simultaneous Code Generator
  const handleRequestCode = async () => {
    setIsCodeLoading(true);
    try {
      const artifact = await apiService.generateInteractiveCode(
        currentSlide.title,
        currentSlide.keyConcept,
        currentSlide.title,
        currentSlide.bullets.join('. '),
        currentSlide.slideNumber,
        'javascript'
      );
      setArtifacts((prev) => [artifact, ...prev]);
      setFocusedArtifact(artifact);

      const prompt = `Profesor Feynman, generé un bloque de código interactivo para simular "${currentSlide.keyConcept}". ¿Qué demuestra exactamente esta simulación?`;
      handleSendMessage(prompt);
    } catch (err: any) {
      console.error('Error generating code artifact:', err);
    } finally {
      setIsCodeLoading(false);
    }
  };

  // Generate Feynman Study Card
  const handleRequestFeynmanCard = async () => {
    try {
      const artifact = await apiService.generateFeynmanBreakdown(
        currentSlide.title,
        currentSlide.title,
        currentSlide.bullets,
        currentSlide.deepEquationOrFormula
      );
      setArtifacts((prev) => [artifact, ...prev]);
      setFocusedArtifact(artifact);
    } catch (err) {
      console.error('Error generating Feynman breakdown:', err);
    }
  };

  // Send message to Feynman (Live or Fallback)
  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    setIsProcessing(true);
    setVoiceMessages((prev) => [
      ...prev,
      {
        id: `user-${Date.now()}`,
        role: 'user',
        text,
        timestamp: Date.now(),
      },
    ]);

    // If Live WebSocket is active, send into live session
    if (liveServiceRef.current && liveServiceRef.current.getIsConnected()) {
      liveServiceRef.current.sendTextMessage(text);
      setIsProcessing(false);
      return;
    }

    // Otherwise use HTTP fallback with TTS audio
    try {
      const res = await apiService.interactVoiceFallback(
        text,
        undefined,
        currentSlide,
        focusedArtifact
      );

      setVoiceMessages((prev) => [
        ...prev,
        {
          id: `asst-${Date.now()}`,
          role: 'assistant',
          text: res.assistantText,
          timestamp: Date.now(),
        },
      ]);
      setLastTranscriptText(res.assistantText);

      if (res.autoArtifact) {
        setArtifacts((prev) => [res.autoArtifact!, ...prev]);
        setFocusedArtifact(res.autoArtifact!);
      }

      // Play audio if returned
      if (res.audioWavBase64) {
        const audio = new Audio(`data:audio/wav;base64,${res.audioWavBase64}`);
        setVoiceState((prev) => ({ ...prev, isSpeaking: true }));
        audio.onended = () => {
          setVoiceState((prev) => ({ ...prev, isSpeaking: false }));
        };
        audio.play().catch((e) => console.warn('Audio autoplay notice:', e));
      }
    } catch (err) {
      console.error('Fallback voice error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAskAboutArtifact = (art: Artifact, customPrompt?: string) => {
    setFocusedArtifact(art);
    const prompt =
      customPrompt ||
      `Profesor Feynman, hablemos sobre el artefacto "${art.title}" que tenemos enfocado en el panel lateral. ¿Cómo se conecta con la diapositiva actual?`;
    handleSendMessage(prompt);
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* Top Header */}
      <Header
        currentPresentation={currentPresentation}
        samplePresentations={presentations}
        onSelectPresentation={(p) => {
          setCurrentPresentation(p);
          setCurrentSlideIndex(0);
        }}
        onOpenUploadModal={() => setIsPdfModalOpen(true)}
        voiceState={voiceState}
        onToggleMute={handleToggleMute}
        onReconnectLive={() => initLiveSession(voiceState.selectedVoice)}
        onChangeVoice={handleChangeVoice}
        currentSlideIndex={currentSlideIndex}
        totalSlides={currentPresentation.slides.length}
        artifactCount={artifacts.length}
      />

      {/* Main Dual-Pane Area */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        {/* Left / Center: Slide Presentation Deck */}
        <SlideViewer
          currentSlide={currentSlide}
          totalSlides={currentPresentation.slides.length}
          currentSlideIndex={currentSlideIndex}
          onPrevSlide={handlePrevSlide}
          onNextSlide={handleNextSlide}
          onSelectSlide={handleSelectSlide}
          allSlides={currentPresentation.slides}
          onRequestNanobanana={handleRequestNanobanana}
          onRequestCode={handleRequestCode}
          onRequestFeynmanCard={handleRequestFeynmanCard}
          onQuickVoiceQuestion={handleSendMessage}
          isNanobananaLoading={isNanobananaLoading}
          isCodeLoading={isCodeLoading}
        />

        {/* Right: Lateral Artifacts Panel */}
        <LateralArtifactsPanel
          artifacts={artifacts}
          focusedArtifact={focusedArtifact}
          onSelectArtifact={(art) => setFocusedArtifact(art)}
          onOpenInfographicModal={(info) => setActiveInfographicModal(info)}
          onOpenCodeModal={(code) => setActiveCodeModal(code)}
          voiceMessages={voiceMessages}
          onAskAboutArtifact={handleAskAboutArtifact}
          onRequestNanobananaQuick={handleRequestNanobanana}
          onRequestCodeQuick={handleRequestCode}
        />
      </div>

      {/* Floating Bottom Voice Control Dock */}
      <VoiceFloatingDock
        voiceState={voiceState}
        onToggleMute={handleToggleMute}
        onSendMessage={handleSendMessage}
        onRequestNanobanana={handleRequestNanobanana}
        onRequestCode={handleRequestCode}
        onRequestEli5={() => {
          handleSendMessage(
            `Profesor Feynman, explícame la diapositiva actual ("${currentSlide.title}") usando el método Feynman: con una analogía simple de la vida cotidiana.`
          );
        }}
        lastTranscriptText={lastTranscriptText}
        isProcessing={isProcessing}
      />

      {/* Interactive Code Sandbox Modal */}
      <CodeSandboxModal
        artifact={activeCodeModal}
        onClose={() => setActiveCodeModal(null)}
        onAskAboutCode={(codeTitle, question) => {
          handleSendMessage(question || `Profesor Feynman, tengo una duda sobre la simulación de "${codeTitle}".`);
        }}
      />

      {/* Nanobanana Infographic Fullscreen Modal */}
      <InfographicModal
        artifact={activeInfographicModal}
        onClose={() => setActiveInfographicModal(null)}
        onAskAboutInfographic={(concept) => {
          handleSendMessage(
            `Profesor Feynman, explícame paso a paso los componentes de la infografía de Nanobanana para "${concept}".`
          );
        }}
      />

      {/* PDF Upload Modal */}
      <PdfUploadModal
        isOpen={isPdfModalOpen}
        onClose={() => setIsPdfModalOpen(false)}
        onPresentationLoaded={(p) => {
          setCurrentPresentation(p);
          setCurrentSlideIndex(0);
        }}
      />
    </div>
  );
}
