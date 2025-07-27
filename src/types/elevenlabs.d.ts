// TypeScript declarations for ElevenLabs widget
declare namespace JSX {
  interface IntrinsicElements {
    'elevenlabs-convai': {
      'agent-id': string;
      children?: React.ReactNode;
    };
  }
}

// Global window interface extension
declare global {
  interface Window {
    ElevenLabsConvAI?: any;
  }
}

export {};