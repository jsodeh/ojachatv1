# Requirements Document

## Introduction

This feature involves migrating the OjaChat application from using ElevenLabs API-based conversational AI integration to their widget-based integration. The current implementation uses API keys and custom React components to handle voice conversations, but we need to replace this with ElevenLabs' embedded widget that provides a green floating action button for voice interactions.

## Requirements

### Requirement 1

**User Story:** As a user, I want to interact with the AI voice assistant through the ElevenLabs embedded widget, so that I can have voice conversations with a native widget experience.

#### Acceptance Criteria

1. WHEN the application loads THEN the system SHALL display the ElevenLabs conversational widget directly embedded in the page
2. WHEN the widget is loaded THEN the system SHALL show the native ElevenLabs interface with its own controls
3. WHEN the widget is active THEN the system SHALL allow voice conversations with the AI agent using agent ID "agent_8501k1581przea2v263csxhvwf1r"
4. WHEN the user interacts with the widget THEN the system SHALL provide the same conversational capabilities as the current implementation

### Requirement 2

**User Story:** As a developer, I want to remove API key dependencies from the application, so that the integration is simpler and more secure.

#### Acceptance Criteria

1. WHEN the migration is complete THEN the system SHALL NOT require VITE_ELEVEN_LABS_API_KEY environment variable
2. WHEN the migration is complete THEN the system SHALL NOT require VITE_ELEVENLABS_AGENT_ID environment variable
3. WHEN the application starts THEN the system SHALL load the ElevenLabs widget script from their CDN
4. WHEN the widget is initialized THEN the system SHALL use the hardcoded agent ID "agent_8501k1581przea2v263csxhvwf1r"

### Requirement 3

**User Story:** As a developer, I want to clean up the existing ElevenLabs implementation, so that the codebase is maintainable and doesn't contain unused code.

#### Acceptance Criteria

1. WHEN the migration is complete THEN the system SHALL NOT contain the ElevenLabsProvider component
2. WHEN the migration is complete THEN the system SHALL NOT contain the ElevenLabsConversationalModal component
3. WHEN the migration is complete THEN the system SHALL NOT import or use the @11labs/client package
4. WHEN the migration is complete THEN the system SHALL remove all references to the old API-based implementation

### Requirement 4

**User Story:** As a user, I want the voice assistant widget to be properly integrated into the application layout, so that it provides a seamless experience.

#### Acceptance Criteria

1. WHEN I am on any page of the application THEN the system SHALL display the embedded ElevenLabs widget
2. WHEN the widget is embedded THEN the system SHALL ensure it's positioned appropriately within the application layout
3. WHEN the widget loads THEN the system SHALL automatically initialize with the correct agent configuration
4. WHEN the page loads THEN the system SHALL load the ElevenLabs widget script and render the widget element without user intervention