export interface Slide {
  id: string;
  slideNumber: number;
  title: string;
  subtitle?: string;
  bullets: string[];
  keyConcept: string;
  deepEquationOrFormula?: string;
  feynmanAnalogyHint: string;
  notes?: string;
  thumbnailColor?: string;
}

export interface Presentation {
  id: string;
  title: string;
  category: string;
  author?: string;
  description: string;
  slides: Slide[];
}

export type ArtifactType = 'infographic' | 'code' | 'feynman_card';

export interface InfographicArtifact {
  id: string;
  type: 'infographic';
  title: string;
  concept: string;
  slideNumber?: number;
  imageUrl?: string;
  imageDataBase64?: string;
  sourceModel: 'gemini-3.1-flash-lite-image' | 'gemini-3.8-flash' | 'nanobanana';
  deepContext: string;
  invisibleInvariant: string; // The core truth that doesn't change
  feynmanAnalogy: string;
  commonMisconception: string;
  keyTakeaway: string;
  svgDiagram?: string; // Rich SVG fallback / vector diagram
  timestamp: number;
}

export interface CodeArtifact {
  id: string;
  type: 'code';
  title: string;
  concept: string;
  slideNumber?: number;
  language: 'javascript' | 'python' | 'typescript';
  code: string;
  explanation: string;
  testCasesOrInputs?: { label: string; value: string | number }[];
  runnable: boolean;
  simulationType?: 'slider' | 'state_machine' | 'step_by_step' | 'console';
  timestamp: number;
}

export interface FeynmanCardArtifact {
  id: string;
  type: 'feynman_card';
  title: string;
  concept: string;
  slideNumber?: number;
  eli5Explanation: string; // Explain like I'm 5
  jargonDemystified: { term: string; simpleMeaning: string }[];
  deepUnderlyingMechanism: string;
  knowledgeCheckQuestion: string;
  suggestedAnswer: string;
  timestamp: number;
}

export type Artifact = InfographicArtifact | CodeArtifact | FeynmanCardArtifact;

export interface VoiceMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  text: string;
  audioUrl?: string;
  timestamp: number;
  triggeredArtifactId?: string;
}

export interface LiveVoiceState {
  isConnected: boolean;
  isConnecting: boolean;
  isListening: boolean;
  isSpeaking: boolean;
  isMuted: boolean;
  audioLevel: number;
  error?: string;
  selectedVoice: 'Zephyr' | 'Puck' | 'Charon' | 'Kore' | 'Fenrir';
}
