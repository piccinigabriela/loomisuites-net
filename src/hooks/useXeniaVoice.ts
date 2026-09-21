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

  const recognitionRef = useRef<any>(null);

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
        };

        recognition.onerror = (event: any) => {
          console.warn('Error en reconocimiento de voz:', event.error);
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
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
        onError: () => {
          setIsSpeaking(false);
          setSpeakingMessageId(null);
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
  };
}
