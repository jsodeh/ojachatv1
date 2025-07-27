# Design Document

## Overview

This design outlines the migration from ElevenLabs API-based conversational AI integration to their widget-based approach. The current implementation uses custom React components (`ElevenLabsProvider` and `ElevenLabsConversationalModal`) with API keys to handle voice conversations. The new approach will use ElevenLabs' embedded widget that provides a native conversational interface without requiring API key management.

## Architecture

### Current Architecture
- **ElevenLabsProvider**: React context provider that manages API connections using `@11labs/client`
- **ElevenLabsConversationalModal**: Custom modal component with audio visualization and recording controls
- **Environment Variables**: `VITE_ELEVEN_LABS_API_KEY` and `VITE_ELEVENLABS_AGENT_ID` for authentication
- **Dependencies**: `@11labs/client`, `@11labs/react`, and `elevenlabs` packages

### New Architecture
- **Widget Integration**: Direct HTML element `<elevenlabs-convai>` embedded in the application
- **Script Loading**: CDN-based script loading from `https://unpkg.com/@elevenlabs/convai-widget-embed`
- **No API Keys**: Widget handles authentication internally using the agent ID
- **Simplified Dependencies**: Remove ElevenLabs-related packages from package.json

## Components and Interfaces

### 1. Widget Integration Component
A new React component that handles the ElevenLabs widget integration:

```typescript
interface ElevenLabsWidgetProps {
  agentId: string;
  className?: string;
}

// Component will render the widget element and handle script loading
```

### 2. Script Loading Strategy
- Load the ElevenLabs widget script asynchronously in the HTML head or through dynamic script injection
- Ensure the script is loaded before the widget element is rendered
- Handle loading states and error scenarios

### 3. Widget Placement
- Replace the current floating action button and modal with the embedded widget
- Position the widget appropriately within the application layout
- Ensure the widget doesn't interfere with existing UI elements

## Data Models

### Widget Configuration
```typescript
interface WidgetConfig {
  agentId: string; // "agent_8501k1581przea2v263csxhvwf1r"
  autoLoad: boolean;
  theme?: 'light' | 'dark';
}
```

### Script Loading State
```typescript
interface ScriptLoadingState {
  isLoaded: boolean;
  isLoading: boolean;
  error: string | null;
}
```

## Error Handling

### Script Loading Errors
- Handle cases where the CDN script fails to load
- Provide fallback UI or error messages to users
- Implement retry mechanisms for transient failures

### Widget Initialization Errors
- Handle cases where the widget fails to initialize
- Provide user-friendly error messages
- Log errors for debugging purposes

### Browser Compatibility
- Ensure the widget works across supported browsers
- Handle cases where custom elements are not supported
- Provide graceful degradation for older browsers

## Testing Strategy

### Unit Tests
- Test the widget component rendering
- Test script loading functionality
- Test error handling scenarios
- Mock the ElevenLabs widget for testing

### Integration Tests
- Test widget integration within the main application
- Test widget functionality across different pages
- Test widget behavior with different user authentication states

### Manual Testing
- Test voice functionality with the actual widget
- Test widget appearance and positioning
- Test widget behavior on different devices and screen sizes
- Verify that the widget maintains the same conversational capabilities

## Migration Steps

### Phase 1: Environment Cleanup
1. Remove `VITE_ELEVEN_LABS_API_KEY` and `VITE_ELEVENLABS_AGENT_ID` from environment files
2. Update any documentation referencing these environment variables

### Phase 2: Dependency Cleanup
1. Remove `@11labs/client`, `@11labs/react`, and `elevenlabs` packages from package.json
2. Remove imports and references to these packages throughout the codebase

### Phase 3: Component Replacement
1. Create new `ElevenLabsWidget` component
2. Replace the floating action button and modal in `App.tsx`
3. Remove `ElevenLabsProvider` and `ElevenLabsConversationalModal` components

### Phase 4: Script Integration
1. Add the ElevenLabs widget script to `index.html` or implement dynamic loading
2. Ensure proper script loading and initialization
3. Handle loading states and error scenarios

### Phase 5: Testing and Validation
1. Test the new widget functionality
2. Verify that all conversational features work as expected
3. Ensure proper error handling and user experience

## Security Considerations

### Removed Attack Vectors
- No longer storing sensitive API keys in environment variables
- No client-side API key exposure
- Reduced dependency on third-party packages

### New Considerations
- Trust in ElevenLabs CDN for script delivery
- Widget security handled by ElevenLabs infrastructure
- Agent ID is public but this is acceptable for widget-based integration

## Performance Considerations

### Improvements
- Reduced bundle size by removing ElevenLabs packages
- Faster initial load time without heavy dependencies
- CDN-based script loading with caching benefits

### Monitoring
- Monitor script loading performance
- Track widget initialization time
- Monitor any impact on overall application performance

## Accessibility

### Widget Accessibility
- Ensure the ElevenLabs widget meets accessibility standards
- Verify keyboard navigation support
- Test with screen readers and assistive technologies

### Integration Accessibility
- Maintain proper ARIA labels and descriptions
- Ensure the widget is properly announced to screen readers
- Provide alternative access methods if needed