import { useState, useEffect, useRef, useCallback } from 'react';
import {
  speakXenia,
  stopXeniaSpeech,
  getStoredVoiceAutoPlay,
  setStoredVoiceAutoPlay,
  getBestLatinFemaleVoice,
  getAllLatinSpanishVoices,
  getStoredSelectedVoiceURI,
  setStoredSelectedVoiceURI,
  isFemaleVoice,
  isSpainVoice,
} from '../utils/xeniaVoice';

// Declare Web Speech Recognition types for browser
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

const isBraveBrowser = (): boolean =>
  typeof navigator !== 'undefined' && Boolean((navigator as any).brave);

/** Mensaje claro cuando el navegador no deja hablar o escuchar a Xenia (pasa sobre todo en Brave). */
const voiceHelpMessage = (kind: 'speak' | 'listen'): string => {
  if (isBraveBrowser()) {
    return kind === 'speak'
      ? 'Brave bloquea las voces del sistema, por eso Xenia no habla acá. Para escucharla usá Microsoft Edge (tiene voces argentinas) o Chrome. Podés seguir escribiéndole normalmente.'
      : 'Brave no permite el dictado por voz. Para hablarle a Xenia usá Microsoft Edge o Chrome. Podés seguir escribiéndole normalmente.';
  }
  return kind === 'speak'
    ? 'Este navegador no tiene voces disponibles, por eso Xenia no puede hablar. Probá con Microsoft Edge (tiene voces argentinas) o Chrome.'
    : 'Este navegador no permite el dictado por voz o no tiene permiso para usar el micrófono. Probá con Microsoft Edge o Chrome.';
};

export function useXeniaVoice(onTranscriptReceived?: (transcript: string) => void) {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const [transcript, setTranscript] = useState('');
  const [autoVoice, setAutoVoice] = useState<boolean>(() => getStoredVoiceAutoPlay());
  const [isRecognitionSupported, setIsRecognitionSupported] = useState(false);
  const [hasLoadedVoices, setHasLoadedVoices] = useState(false);
  const [detectedVoiceName, setDetectedVoiceName] = useState<string>('');
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState<string>(() => getStoredSelectedVoiceURI());
  const [voiceIssue, setVoiceIssue] = useState<string | null>(null);
  const clearVoiceIssue = useCallback(() => setVoiceIssue(null), []);

  const recognitionRef = useRef<any>(null);
  const onTranscriptRef = useRef(onTranscriptReceived);
  const latestTranscriptRef = useRef('');

  useEffect(() => {
    onTranscriptRef.current = onTranscriptReceived;
  }, [onTranscriptReceived]);

  // Initialize SpeechSynthesis voices
  const refreshVoices = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const allLatin = getAllLatinSpanishVoices();
      setAvailableVoices(allLatin);

      const voice = getBestLatinFemaleVoice();
      if (voice) {
        setDetectedVoiceName(`${voice.name} (${voice.lang})`);
        if (!selectedVoiceURI) {
          setSelectedVoiceURI(voice.voiceURI || voice.name);
        }
      }
      setHasLoadedVoices(true);
    }
  }, [selectedVoiceURI]);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      refreshVoices();
      window.speechSynthesis.onvoiceschanged = refreshVoices;
    }
  }, [refreshVoices]);

  // Select a custom voice
  const selectVoice = useCallback((uri: string) => {
    setSelectedVoiceURI(uri);
    setStoredSelectedVoiceURI(uri);
    const voices = window.speechSynthesis?.getVoices() || [];
    const chosen = voices.find((v) => v.voiceURI === uri || v.name === uri);
    if (chosen) {
      setDetectedVoiceName(`${chosen.name} (${chosen.lang})`);
    }
  }, []);

  // Initialize SpeechRecognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognitionAPI =
        window.SpeechRecognition || window.webkitSpeechRecognition;

      if (SpeechRecognitionAPI) {
        setIsRecognitionSupported(true);
        const recognition = new SpeechRecognitionAPI();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = 'es-419'; // Standard Latin American Spanish

        recognition.onstart = () => {
          setIsListening(true);
        };

        recognition.onresult = (event: any) => {
          let currentTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            currentTranscript += event.results[i][0].transcript;
          }
          setTranscript(currentTranscript);
          latestTranscriptRef.current = currentTranscript;
        };

        recognition.onerror = (event: any) => {
          console.warn('Error en reconocimiento de voz:', event.error);
          setIsListening(false);
          if (['network', 'not-allowed', 'service-not-allowed', 'audio-capture'].includes(event?.error)) {
            setVoiceIssue(voiceHelpMessage('listen'));
          }
        };

        recognition.onend = () => {
          setIsListening(false);
          const finalVal = latestTranscriptRef.current.trim();
          if (finalVal) {
            onTranscriptRef.current?.(finalVal);
            // Clear ref to avoid repeating
            latestTranscriptRef.current = '';
            setTranscript('');
          }
        };

        recognitionRef.current = recognition;
      }
    }

    return () => {
      stopXeniaSpeech();
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {
          // ignore
        }
      }
    };
  }, []);

  // When speech ends and we have final transcript, notify callback
  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // ignore
      }
    }
    setIsListening(false);
  }, []);

  const startListening = useCallback(() => {
    // Stop speaking if Xenia is currently talking
    stopXeniaSpeech();
    setIsSpeaking(false);
    setSpeakingMessageId(null);
    setTranscript('');
    latestTranscriptRef.current = '';

    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.warn('No se pudo iniciar el micrófono:', err);
        try {
          recognitionRef.current.abort();
          setTimeout(() => {
            recognitionRef.current?.start();
            setIsListening(true);
          }, 100);
        } catch (e) {
          setIsListening(false);
        }
      }
    }
  }, []);

  // Speak a message
  const speakMessage = useCallback(
    (text: string, messageId?: string) => {
      if (isSpeaking && speakingMessageId === messageId) {
        stopXeniaSpeech();
        setIsSpeaking(false);
        setSpeakingMessageId(null);
        return;
      }

      // Sin voces instaladas/permitidas (Brave, algunos Linux): avisar en lugar de quedar en silencio
      const voicesNow = typeof window !== 'undefined' && 'speechSynthesis' in window ? window.speechSynthesis.getVoices() : [];
      if (typeof window === 'undefined' || !('speechSynthesis' in window) || voicesNow.length === 0) {
        setVoiceIssue(voiceHelpMessage('speak'));
        setIsSpeaking(false);
        setSpeakingMessageId(null);
        return;
      }

      setIsSpeaking(true);
      setSpeakingMessageId(messageId || null);

      speakXenia(text, {
        onStart: () => {
          setIsSpeaking(true);
          setSpeakingMessageId(messageId || null);
        },
        onEnd: () => {
          setIsSpeaking(false);
          setSpeakingMessageId(null);
        },
        onError: (err: any) => {
          setIsSpeaking(false);
          setSpeakingMessageId(null);
          // 'interrupted'/'canceled' ocurren al cortar la voz a propósito: no son fallas
          const code = err?.error;
          if (code && code !== 'interrupted' && code !== 'canceled') {
            setVoiceIssue(voiceHelpMessage('speak'));
          }
        },
      });
    },
    [isSpeaking, speakingMessageId]
  );

  const stopSpeaking = useCallback(() => {
    stopXeniaSpeech();
    setIsSpeaking(false);
    setSpeakingMessageId(null);
  }, []);

  const toggleAutoVoice = useCallback(() => {
    setAutoVoice((prev) => {
      const next = !prev;
      setStoredVoiceAutoPlay(next);
      if (!next) {
        stopXeniaSpeech();
        setIsSpeaking(false);
        setSpeakingMessageId(null);
      }
      return next;
    });
  }, []);

  return {
    isListening,
    isSpeaking,
    speakingMessageId,
    transcript,
    setTranscript,
    startListening,
    stopListening,
    speakMessage,
    stopSpeaking,
    autoVoice,
    toggleAutoVoice,
    isRecognitionSupported,
    detectedVoiceName,
    availableVoices,
    selectedVoiceURI,
    selectVoice,
    hasLoadedVoices,
    voiceIssue,
    clearVoiceIssue,
  };
}
