'use client';

import { useState, useEffect } from 'react';

interface VoiceInputProps {
  onResult: (text: string) => void;
  placeholder?: string;
  continuous?: boolean;
}

export function VoiceInput({ onResult, placeholder = 'Tap to speak...', continuous = false }: VoiceInputProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setError('Speech recognition not supported in this browser');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = continuous;
    recognition.interimResults = true;

    recognition.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
        } else {
          interimTranscript += transcript;
        }
      }

      if (finalTranscript) {
        setTranscript(finalTranscript);
        onResult(finalTranscript);
      }
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setError(`Error: ${event.error}`);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    // Store recognition instance for cleanup
    (window as any).speechRecognitionInstance = recognition;

    return () => {
      recognition.abort();
    };
  }, [continuous, onResult]);

  const startListening = () => {
    setError(null);
    const recognition = (window as any).speechRecognitionInstance;
    if (recognition) {
      recognition.start();
      setIsListening(true);
    }
  };

  const stopListening = () => {
    const recognition = (window as any).speechRecognitionInstance;
    if (recognition) {
      recognition.stop();
      setIsListening(false);
    }
  };

  return (
    <div className="voice-input">
      <button
        onClick={isListening ? stopListening : startListening}
        className={`
          px-6 py-3 rounded-lg font-medium transition-all
          ${isListening
            ? 'bg-red-500 hover:bg-red-600 text-white'
            : 'bg-blue-500 hover:bg-blue-600 text-white'
          }
        `}
      >
        {isListening ? '🛑 Stop' : '🎤 Speak'}
      </button>

      {error && (
        <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {transcript && (
        <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-blue-900">{transcript}</p>
        </div>
      )}
    </div>
  );
}
