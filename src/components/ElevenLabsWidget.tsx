import React, { useEffect, useState, useRef } from 'react';

// TypeScript interfaces for widget configuration
interface ElevenLabsWidgetProps {
  agentId: string;
  className?: string;
}

interface ScriptLoadingState {
  isLoaded: boolean;
  isLoading: boolean;
  error: string | null;
}

// Widget configuration interface for future extensibility
interface WidgetConfig {
  agentId: string;
  autoLoad: boolean;
  theme?: 'light' | 'dark';
}

// Extend the global Window interface to include the ElevenLabs widget
declare global {
  interface Window {
    ElevenLabsConvAI?: any;
  }
}

const ElevenLabsWidget: React.FC<ElevenLabsWidgetProps> = ({ 
  agentId, 
  className = '' 
}) => {
  const [scriptState, setScriptState] = useState<ScriptLoadingState>({
    isLoaded: false,
    isLoading: false,
    error: null
  });
  
  const widgetRef = useRef<HTMLDivElement>(null);
  const scriptLoadedRef = useRef(false);

  // Function to load the ElevenLabs CDN script
  const loadElevenLabsScript = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      // Check if script is already loaded
      if (scriptLoadedRef.current || window.ElevenLabsConvAI) {
        resolve();
        return;
      }

      // Check if script element already exists
      const existingScript = document.querySelector('script[src*="elevenlabs"]');
      if (existingScript) {
        existingScript.addEventListener('load', () => resolve());
        existingScript.addEventListener('error', () => reject(new Error('Script failed to load')));
        return;
      }

      // Create and load the script
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/@elevenlabs/convai-widget-embed';
      script.async = true;
      script.defer = true;

      script.onload = () => {
        scriptLoadedRef.current = true;
        resolve();
      };

      script.onerror = () => {
        reject(new Error('Failed to load ElevenLabs widget script'));
      };

      document.head.appendChild(script);
    });
  };

  // Effect to load the script and initialize the widget
  useEffect(() => {
    const initializeWidget = async () => {
      if (scriptState.isLoading || scriptState.isLoaded) {
        return;
      }

      setScriptState(prev => ({ ...prev, isLoading: true, error: null }));

      try {
        await loadElevenLabsScript();
        
        // Wait a bit for the script to fully initialize
        await new Promise(resolve => setTimeout(resolve, 100));
        
        setScriptState({
          isLoaded: true,
          isLoading: false,
          error: null
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        setScriptState({
          isLoaded: false,
          isLoading: false,
          error: errorMessage
        });
        console.error('Failed to load ElevenLabs widget:', error);
      }
    };

    initializeWidget();
  }, []);

  // Handle retry functionality
  const handleRetry = () => {
    setScriptState({
      isLoaded: false,
      isLoading: false,
      error: null
    });
    // Reset the script loaded ref to allow retry
    scriptLoadedRef.current = false;
  };

  // Render loading state
  if (scriptState.isLoading) {
    return (
      <div className={`elevenlabs-widget-loading ${className}`}>
        <div className="flex items-center justify-center p-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-sm text-gray-600">Loading voice assistant...</span>
        </div>
      </div>
    );
  }

  // Render error state
  if (scriptState.error) {
    return (
      <div className={`elevenlabs-widget-error ${className}`}>
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Voice Assistant Unavailable
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{scriptState.error}</p>
              </div>
              <div className="mt-3">
                <button
                  onClick={handleRetry}
                  className="bg-red-100 hover:bg-red-200 text-red-800 text-xs font-medium px-3 py-1 rounded-md transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render the widget when script is loaded
  if (scriptState.isLoaded) {
    return (
      <div ref={widgetRef} className={`elevenlabs-widget-container ${className}`}>
        <div 
          dangerouslySetInnerHTML={{
            __html: `<elevenlabs-convai agent-id="${agentId}"></elevenlabs-convai>`
          }}
        />
      </div>
    );
  }

  // Fallback render
  return null;
};

export default ElevenLabsWidget;