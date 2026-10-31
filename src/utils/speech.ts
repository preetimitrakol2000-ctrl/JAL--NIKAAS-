/**
 * Jal-Nikaas: Web Speech API (Text-To-Speech) Utility
 * Supports English, Bengali, and Hindi voice-assisted advisories for farmers and officers
 * Offline-first using local browser synthesized voices
 */

import { Language } from '../types';

export interface SpeechState {
  supported: boolean;
  speaking: boolean;
  paused: boolean;
  currentText: string | null;
  voiceName: string | null;
}

class SpeechController {
  private synth: SpeechSynthesis | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private listeners: Set<(state: SpeechState) => void> = new Set();
  private voices: SpeechSynthesisVoice[] = [];

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      this.loadVoices();
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => this.loadVoices();
      }
    }
  }

  private loadVoices() {
    if (!this.synth) return;
    this.voices = this.synth.getVoices();
  }

  public isSupported(): boolean {
    return this.synth !== null;
  }

  public getVoicesForLanguage(lang: Language): SpeechSynthesisVoice[] {
    if (!this.synth) return [];
    if (this.voices.length === 0) {
      this.voices = this.synth.getVoices();
    }

    const langCodes: Record<Language, string[]> = {
      en: ['en-IN', 'en-GB', 'en-US', 'en'],
      bn: ['bn-IN', 'bn-BD', 'bn'],
      hi: ['hi-IN', 'hi'],
    };

    const targetCodes = langCodes[lang] || ['en'];

    for (const code of targetCodes) {
      const match = this.voices.filter((v) =>
        v.lang.toLowerCase().startsWith(code.toLowerCase())
      );
      if (match.length > 0) return match;
    }

    // Fallback: return any available voices or default
    return this.voices;
  }

  public speak(
    text: string,
    lang: Language,
    onEndCallback?: () => void
  ): boolean {
    if (!this.synth) return false;

    // Stop previous utterance
    this.stop();

    const utterance = new SpeechSynthesisUtterance(text);
    const available = this.getVoicesForLanguage(lang);

    if (available.length > 0) {
      utterance.voice = available[0];
    }

    // Set speech rates for natural agricultural advisory comprehension
    utterance.rate = 0.95; // Slightly slower for clarity
    utterance.pitch = 1.0;
    utterance.lang = lang === 'bn' ? 'bn-IN' : lang === 'hi' ? 'hi-IN' : 'en-IN';

    utterance.onstart = () => {
      this.notify({
        supported: true,
        speaking: true,
        paused: false,
        currentText: text,
        voiceName: utterance.voice?.name || 'Default System Voice',
      });
    };

    utterance.onend = () => {
      this.currentUtterance = null;
      this.notify({
        supported: true,
        speaking: false,
        paused: false,
        currentText: null,
        voiceName: null,
      });
      if (onEndCallback) onEndCallback();
    };

    utterance.onerror = (e) => {
      // Speech cancel can trigger error event 'canceled' or 'interrupted', which is normal
      this.currentUtterance = null;
      this.notify({
        supported: true,
        speaking: false,
        paused: false,
        currentText: null,
        voiceName: null,
      });
    };

    utterance.onpause = () => {
      this.notify({
        supported: true,
        speaking: true,
        paused: true,
        currentText: text,
        voiceName: utterance.voice?.name || null,
      });
    };

    utterance.onresume = () => {
      this.notify({
        supported: true,
        speaking: true,
        paused: false,
        currentText: text,
        voiceName: utterance.voice?.name || null,
      });
    };

    this.currentUtterance = utterance;
    this.synth.speak(utterance);
    return true;
  }

  public pause() {
    if (this.synth && this.synth.speaking && !this.synth.paused) {
      this.synth.pause();
    }
  }

  public resume() {
    if (this.synth && this.synth.paused) {
      this.synth.resume();
    }
  }

  public stop() {
    if (this.synth) {
      this.synth.cancel();
      this.currentUtterance = null;
      this.notify({
        supported: true,
        speaking: false,
        paused: false,
        currentText: null,
        voiceName: null,
      });
    }
  }

  public subscribe(listener: (state: SpeechState) => void): () => void {
    this.listeners.add(listener);
    listener({
      supported: this.isSupported(),
      speaking: this.synth?.speaking || false,
      paused: this.synth?.paused || false,
      currentText: this.currentUtterance?.text || null,
      voiceName: this.currentUtterance?.voice?.name || null,
    });
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(state: SpeechState) {
    this.listeners.forEach((listener) => listener(state));
  }
}

export const speechController = new SpeechController();
