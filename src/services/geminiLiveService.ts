/**
 * Service for Gemini 3.8 Live real-time bidirectional voice & multimodal interaction.
 * Bridges browser microphone (16kHz PCM) and Gemini 3.8 Live audio playback (24kHz PCM),
 * alongside real-time simultaneous artifact triggers (Nanobanana & Code).
 */

import { Artifact } from '../types';

export interface LiveCallbacks {
  onConnected?: () => void;
  onDisconnected?: () => void;
  onError?: (err: string) => void;
  onTranscription?: (role: 'user' | 'assistant', text: string) => void;
  onArtifactCreated?: (artifact: Artifact) => void;
  onChangeSlide?: (slideNumber: number, reason?: string) => void;
  onSpeakingStateChange?: (isSpeaking: boolean) => void;
  onAudioLevel?: (level: number) => void;
}

export class GeminiLiveService {
  private ws: WebSocket | null = null;
  private inputAudioCtx: AudioContext | null = null;
  private outputAudioCtx: AudioContext | null = null;
  private mediaStream: MediaStream | null = null;
  private scriptProcessor: ScriptProcessorNode | null = null;
  private callbacks: LiveCallbacks = {};

  private isConnected = false;
  private isListening = false;
  private isMuted = false;
  private nextPlayTime = 0;
  private activeSourceNodes: AudioBufferSourceNode[] = [];
  private selectedVoice: string = 'Zephyr';

  constructor(callbacks: LiveCallbacks = {}) {
    this.callbacks = callbacks;
  }

  public setCallbacks(callbacks: LiveCallbacks) {
    this.callbacks = { ...this.callbacks, ...callbacks };
  }

  public async connect(voice: string = 'Zephyr') {
    this.selectedVoice = voice;
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws/live`;

    return new Promise<void>((resolve, reject) => {
      try {
        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = () => {
          console.log('[GeminiLive Client] WebSocket connected to server');
          this.isConnected = true;
          this.callbacks.onConnected?.();
          resolve();
        };

        this.ws.onmessage = async (event) => {
          try {
            const data = JSON.parse(event.data);
            this.handleServerMessage(data);
          } catch (e) {
            console.error('[GeminiLive Client] Error parsing message:', e);
          }
        };

        this.ws.onerror = (error) => {
          console.error('[GeminiLive Client] WebSocket error:', error);
          this.callbacks.onError?.('Error de conexión con el servidor Live');
          reject(error);
        };

        this.ws.onclose = () => {
          console.log('[GeminiLive Client] WebSocket closed');
          this.cleanup();
          this.callbacks.onDisconnected?.();
        };
      } catch (err: any) {
        reject(err);
      }
    });
  }

  public async startMicrophone() {
    if (!navigator.mediaDevices?.getUserMedia) {
      throw new Error('El navegador no soporta captura de audio.');
    }

    try {
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 16000,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      // 16kHz context for speech input to Gemini Live
      this.inputAudioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: 16000,
      });

      const source = this.inputAudioCtx.createMediaStreamSource(this.mediaStream);
      // ScriptProcessor to stream PCM chunks
      this.scriptProcessor = this.inputAudioCtx.createScriptProcessor(4096, 1, 1);

      source.connect(this.scriptProcessor);
      this.scriptProcessor.connect(this.inputAudioCtx.destination);

      this.scriptProcessor.onaudioprocess = (e) => {
        if (!this.isConnected || this.isMuted) return;

        const inputData = e.inputBuffer.getChannelData(0);

        // Calculate audio level for visualizer
        let sum = 0;
        for (let i = 0; i < inputData.length; i++) {
          sum += Math.abs(inputData[i]);
        }
        const avg = sum / inputData.length;
        this.callbacks.onAudioLevel?.(Math.min(1, avg * 8));

        // Convert Float32 to 16-bit PCM (Little-Endian)
        const pcm16 = this.floatTo16BitPCM(inputData);
        const base64 = this.arrayBufferToBase64(pcm16.buffer);

        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
          this.ws.send(JSON.stringify({
            type: 'audio',
            audio: base64,
          }));
        }
      };

      this.isListening = true;
    } catch (err: any) {
      console.error('[GeminiLive Client] Microphone error:', err);
      this.callbacks.onError?.(`Permiso de micrófono denegado: ${err.message}`);
      throw err;
    }
  }

  public stopMicrophone() {
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => track.stop());
      this.mediaStream = null;
    }
    if (this.scriptProcessor) {
      this.scriptProcessor.disconnect();
      this.scriptProcessor = null;
    }
    if (this.inputAudioCtx) {
      this.inputAudioCtx.close();
      this.inputAudioCtx = null;
    }
    this.isListening = false;
  }

  public setMute(muted: boolean) {
    this.isMuted = muted;
  }

  public getIsMuted() {
    return this.isMuted;
  }

  public getIsConnected() {
    return this.isConnected;
  }

  public sendTextMessage(text: string) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'text',
        text,
      }));
      this.callbacks.onTranscription?.('user', text);
    }
  }

  public updateContext(context: {
    slideNumber?: number;
    slideTitle?: string;
    slideContent?: string;
    focusedArtifact?: any;
  }) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'update_context',
        ...context,
      }));
    }
  }

  public setVoice(voice: string, currentContext?: string) {
    this.selectedVoice = voice;
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'set_voice',
        voice,
        currentContext,
      }));
    }
  }

  private handleServerMessage(msg: any) {
    if (msg.type === 'audio' && msg.audio) {
      this.playAudioChunk(msg.audio);
    } else if (msg.type === 'transcription') {
      this.callbacks.onTranscription?.(msg.role, msg.text);
    } else if (msg.type === 'interrupted') {
      this.stopPlayback();
    } else if (msg.type === 'artifact_created' && msg.artifact) {
      this.callbacks.onArtifactCreated?.(msg.artifact);
    } else if (msg.type === 'change_slide' && msg.slideNumber) {
      this.callbacks.onChangeSlide?.(msg.slideNumber, msg.reason);
    } else if (msg.type === 'error') {
      this.callbacks.onError?.(msg.error);
    }
  }

  // Plays 24kHz raw PCM chunk seamlessly
  private playAudioChunk(base64Data: string) {
    if (!this.outputAudioCtx || this.outputAudioCtx.state === 'closed') {
      this.outputAudioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: 24000,
      });
      this.nextPlayTime = this.outputAudioCtx.currentTime;
    }

    if (this.outputAudioCtx.state === 'suspended') {
      this.outputAudioCtx.resume();
    }

    const binaryString = atob(base64Data);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    const int16Array = new Int16Array(bytes.buffer);
    const float32Array = new Float32Array(int16Array.length);
    for (let i = 0; i < int16Array.length; i++) {
      float32Array[i] = int16Array[i] / 32768.0;
    }

    const audioBuffer = this.outputAudioCtx.createBuffer(1, float32Array.length, 24000);
    audioBuffer.getChannelData(0).set(float32Array);

    const source = this.outputAudioCtx.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(this.outputAudioCtx.destination);

    const currentTime = this.outputAudioCtx.currentTime;
    if (this.nextPlayTime < currentTime) {
      this.nextPlayTime = currentTime;
    }

    source.start(this.nextPlayTime);
    this.nextPlayTime += audioBuffer.duration;

    this.activeSourceNodes.push(source);
    this.callbacks.onSpeakingStateChange?.(true);

    source.onended = () => {
      const idx = this.activeSourceNodes.indexOf(source);
      if (idx !== -1) {
        this.activeSourceNodes.splice(idx, 1);
      }
      if (this.activeSourceNodes.length === 0) {
        this.callbacks.onSpeakingStateChange?.(false);
      }
    };
  }

  private stopPlayback() {
    this.activeSourceNodes.forEach((node) => {
      try { node.stop(); } catch (_) {}
    });
    this.activeSourceNodes = [];
    if (this.outputAudioCtx) {
      this.nextPlayTime = this.outputAudioCtx.currentTime;
    }
    this.callbacks.onSpeakingStateChange?.(false);
  }

  private floatTo16BitPCM(input: Float32Array): Int16Array {
    const output = new Int16Array(input.length);
    for (let i = 0; i < input.length; i++) {
      const s = Math.max(-1, Math.min(1, input[i]));
      output[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
    }
    return output;
  }

  private arrayBufferToBase64(buffer: ArrayBufferLike): string {
    let binary = '';
    const bytes = new Uint8Array(buffer as ArrayBuffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  public cleanup() {
    this.stopMicrophone();
    this.stopPlayback();
    if (this.outputAudioCtx) {
      this.outputAudioCtx.close();
      this.outputAudioCtx = null;
    }
    if (this.ws) {
      try { this.ws.close(); } catch (_) {}
      this.ws = null;
    }
    this.isConnected = false;
  }
}
