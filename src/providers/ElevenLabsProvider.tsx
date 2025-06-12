import { createContext, useContext, ReactNode, useRef } from 'react';
import { Conversation } from '@11labs/client';

interface ElevenLabsContextType {
  startAgentSession: (handlers: ConversationHandlers) => Promise<void>;
  stopAgentSession: () => Promise<void>;
  transcriptAudio: (audioBlob: Blob) => Promise<string>;
}

interface ConversationHandlers {
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: any) => void;
  onModeChange?: (mode: any) => void;
  onTranscription?: (text: string) => void;
  onResponse?: (text: string) => void;
}

const ElevenLabsContext = createContext<ElevenLabsContextType | null>(null);

interface ElevenLabsProviderProps {
  children: ReactNode;
}

export function ElevenLabsProvider({ children }: ElevenLabsProviderProps) {
  const agentId = import.meta.env.VITE_ELEVENLABS_AGENT_ID;
  const apiKey = import.meta.env.VITE_ELEVEN_LABS_API_KEY;
  const conversationRef = useRef<any>(null);

  const startAgentSession = async (handlers: ConversationHandlers) => {
    if (!agentId || !apiKey) {
      throw new Error('Missing ElevenLabs agent ID or API key');
    }
    if (conversationRef.current) {
      await conversationRef.current.endSession();
      conversationRef.current = null;
    }
    conversationRef.current = await Conversation.startSession({
      agentId,
      ...handlers,
    });
  };

  const stopAgentSession = async () => {
    if (conversationRef.current) {
      await conversationRef.current.endSession();
      conversationRef.current = null;
    }
  };

  const transcriptAudio = async (audioBlob: Blob): Promise<string> => {
    if (!apiKey) {
      throw new Error('Missing ElevenLabs API key for transcription');
    }

    const formData = new FormData();
    formData.append('audio', audioBlob, 'audio.webm');
    formData.append('model_id', 'whisper-1'); // Use an appropriate ElevenLabs transcription model

    try {
      const response = await fetch('https://api.elevenlabs.io/v1/audio-transcriptions', {
        method: 'POST',
        headers: {
          'xi-api-key': apiKey,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to transcribe audio');
      }

      const data = await response.json();
      return data.text;
    } catch (error) {
      console.error('Error during audio transcription:', error);
      throw error;
    }
  };

  return (
    <ElevenLabsContext.Provider value={{ startAgentSession, stopAgentSession, transcriptAudio }}>
      {children}
    </ElevenLabsContext.Provider>
  );
}

export function useElevenLabs() {
  const context = useContext(ElevenLabsContext);
  if (!context) {
    throw new Error('useElevenLabs must be used within an ElevenLabsProvider');
  }
  return context;
} 