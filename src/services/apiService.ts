import { Artifact, InfographicArtifact, CodeArtifact, FeynmanCardArtifact } from '../types';

export const apiService = {
  /**
   * Request background Nanobanana minimalist infographic
   */
  async generateNanobananaInfographic(
    topic: string,
    visualDescription?: string,
    deepTakeaway?: string,
    slideNumber?: number
  ): Promise<InfographicArtifact> {
    const res = await fetch('/api/artifacts/nanobanana', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic, visualDescription, deepTakeaway, slideNumber }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Error al generar infografía de Nanobanana');
    }

    const data = await res.json();
    return data.artifact;
  },

  /**
   * Request background interactive code artifact
   */
  async generateInteractiveCode(
    topic: string,
    concept: string,
    slideTitle?: string,
    slideText?: string,
    slideNumber?: number,
    language = 'javascript'
  ): Promise<CodeArtifact> {
    const res = await fetch('/api/artifacts/code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic, concept, slideTitle, slideText, slideNumber, language }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Error al generar pieza de código');
    }

    const data = await res.json();
    return data.artifact;
  },

  /**
   * Request structured Feynman breakdown card
   */
  async generateFeynmanBreakdown(
    topic: string,
    slideTitle?: string,
    slideBullets?: string[],
    slideEquation?: string
  ): Promise<FeynmanCardArtifact> {
    const res = await fetch('/api/feynman/breakdown', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic, slideTitle, slideBullets, slideEquation }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Error al generar desglose de Feynman');
    }

    const data = await res.json();
    return data.artifact;
  },

  /**
   * Voice interaction fallback via Flash + TTS
   */
  async interactVoiceFallback(
    userText?: string,
    audioBase64?: string,
    currentSlide?: any,
    focusedArtifact?: any
  ): Promise<{
    userText: string;
    assistantText: string;
    audioWavBase64?: string;
    autoArtifact?: Artifact;
  }> {
    const res = await fetch('/api/voice/interact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userText, audioBase64, currentSlide, focusedArtifact }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Error en interacción por voz');
    }

    return await res.json();
  },
};
