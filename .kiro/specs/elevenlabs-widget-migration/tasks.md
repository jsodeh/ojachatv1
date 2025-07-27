# Implementation Plan

- [x] 1. Remove environment variables and update configuration
  - Remove `VITE_ELEVEN_LABS_API_KEY` and `VITE_ELEVENLABS_AGENT_ID` from `.env.local` file
  - Update any configuration files that reference these variables
  - _Requirements: 2.1, 2.2_

- [x] 2. Remove ElevenLabs dependencies from package.json
  - Remove `@11labs/client`, `@11labs/react`, and `elevenlabs` packages from package.json
  - Run npm install to update node_modules and lock files
  - _Requirements: 3.3_

- [ ] 3. Create ElevenLabs widget component
  - Create new `src/components/ElevenLabsWidget.tsx` component that renders the widget element
  - Implement script loading functionality to load the ElevenLabs CDN script
  - Add proper TypeScript interfaces for widget configuration
  - Handle loading states and error scenarios
  - _Requirements: 1.3, 2.3, 2.4_

- [ ] 4. Add widget script to HTML document
  - Add the ElevenLabs widget script tag to `index.html`
  - Ensure script loads asynchronously to avoid blocking page load
  - _Requirements: 2.3_

- [ ] 5. Replace floating action button with widget in App.tsx
  - Remove the floating action button and ElevenLabsConversationalModal from App.tsx
  - Replace with the new ElevenLabsWidget component
  - Position the widget appropriately within the application layout
  - _Requirements: 1.1, 1.2, 4.1, 4.2_

- [ ] 6. Remove ElevenLabsProvider and related imports
  - Remove `ElevenLabsProvider` import and wrapper from App.tsx
  - Delete the `src/providers/ElevenLabsProvider.tsx` file
  - Remove any other imports related to the old ElevenLabs implementation
  - _Requirements: 3.1, 3.4_

- [ ] 7. Remove ElevenLabsConversationalModal component
  - Delete the `src/components/ElevenLabsConversationalModal.tsx` file
  - Remove any imports or references to this component throughout the codebase
  - _Requirements: 3.2, 3.4_

- [ ] 8. Test widget integration and functionality
  - Write unit tests for the new ElevenLabsWidget component
  - Test script loading functionality
  - Test error handling scenarios
  - Verify that the widget initializes correctly with the specified agent ID
  - _Requirements: 1.4, 4.3_

- [ ] 9. Verify conversational capabilities
  - Test voice conversation functionality with the embedded widget
  - Ensure the widget maintains the same conversational capabilities as the previous implementation
  - Test widget behavior across different pages and user states
  - _Requirements: 1.3, 4.3_