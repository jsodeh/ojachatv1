import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ElevenLabsWidget from '../ElevenLabsWidget';

// Mock the script loading
const mockScript = {
  onload: null as (() => void) | null,
  onerror: null as (() => void) | null,
  src: '',
  async: false,
  defer: false,
};

const mockAppendChild = jest.fn();

beforeEach(() => {
  // Reset DOM
  document.head.innerHTML = '';
  
  // Mock createElement
  jest.spyOn(document, 'createElement').mockImplementation((tagName) => {
    if (tagName === 'script') {
      return mockScript as any;
    }
    return document.createElement(tagName);
  });
  
  // Mock appendChild
  jest.spyOn(document.head, 'appendChild').mockImplementation(mockAppendChild);
  
  // Clear mocks
  mockAppendChild.mockClear();
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('ElevenLabsWidget', () => {
  const testAgentId = 'agent_8501k1581przea2v263csxhvwf1r';

  test('renders loading state initially', () => {
    render(<ElevenLabsWidget agentId={testAgentId} />);
    
    expect(screen.getByText('Loading voice assistant...')).toBeInTheDocument();
  });

  test('loads script and renders widget on success', async () => {
    render(<ElevenLabsWidget agentId={testAgentId} />);
    
    // Verify script is created and appended
    expect(mockAppendChild).toHaveBeenCalledWith(mockScript);
    expect(mockScript.src).toBe('https://unpkg.com/@elevenlabs/convai-widget-embed');
    expect(mockScript.async).toBe(true);
    expect(mockScript.defer).toBe(true);
    
    // Simulate script load success
    if (mockScript.onload) {
      mockScript.onload();
    }
    
    await waitFor(() => {
      expect(screen.queryByText('Loading voice assistant...')).not.toBeInTheDocument();
    });
    
    // Check that widget container is rendered
    const widgetContainer = document.querySelector('.elevenlabs-widget-container');
    expect(widgetContainer).toBeInTheDocument();
  });

  test('handles script loading error', async () => {
    render(<ElevenLabsWidget agentId={testAgentId} />);
    
    // Simulate script load error
    if (mockScript.onerror) {
      mockScript.onerror();
    }
    
    await waitFor(() => {
      expect(screen.getByText('Voice Assistant Unavailable')).toBeInTheDocument();
      expect(screen.getByText('Failed to load ElevenLabs widget script')).toBeInTheDocument();
      expect(screen.getByText('Try Again')).toBeInTheDocument();
    });
  });

  test('applies custom className', () => {
    const customClass = 'custom-widget-class';
    render(<ElevenLabsWidget agentId={testAgentId} className={customClass} />);
    
    const loadingElement = document.querySelector(`.elevenlabs-widget-loading.${customClass}`);
    expect(loadingElement).toBeInTheDocument();
  });

  test('uses correct agent ID in widget element', async () => {
    render(<ElevenLabsWidget agentId={testAgentId} />);
    
    // Simulate script load success
    if (mockScript.onload) {
      mockScript.onload();
    }
    
    await waitFor(() => {
      const widgetContainer = document.querySelector('.elevenlabs-widget-container');
      expect(widgetContainer).toBeInTheDocument();
      expect(widgetContainer?.innerHTML).toContain(`agent-id="${testAgentId}"`);
    });
  });
});