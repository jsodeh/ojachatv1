# Welcome to your GPT Engineer project

## Project info

**URL**: https://run.gptengineer.app/projects/9d4bcff1-da7e-4e73-bb35-7a988b4bdb7f/improve

## How can I edit this code?

There are several ways of editing your application.

**Use GPT Engineer**

Simply visit the GPT Engineer project at [GPT Engineer](https://gptengineer.app/projects/9d4bcff1-da7e-4e73-bb35-7a988b4bdb7f/improve) and start prompting.

Changes made via gptengineer.app will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in the GPT Engineer UI.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with .

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

All GPT Engineer projects can be deployed directly via the GPT Engineer app.

Simply visit your project at [GPT Engineer](https://gptengineer.app/projects/9d4bcff1-da7e-4e73-bb35-7a988b4bdb7f/improve) and click on Share -> Publish.

## I want to use a custom domain - is that possible?

We don't support custom domains (yet). If you want to deploy your project under your own domain then we recommend using Netlify. Visit our docs for more details: [Custom domains](https://docs.gptengineer.app/tips-tricks/custom-domain/)

# Voice Chat with ElevenLabs AI

This project demonstrates how to integrate ElevenLabs' conversational AI capabilities with speech recognition for a voice-based chat interface.

## Setup

1. Install dependencies:
```bash
npm install
# or
yarn
```

2. Create a `.env.local` file in the project root and add your ElevenLabs API key:
```
NEXT_PUBLIC_ELEVEN_LABS_API_KEY=your-api-key-here
```

3. (Optional) Configure a custom voice ID and model ID in the `voice-chat-demo.tsx` file.

## Features

- Real-time speech recognition
- Natural conversation flow with ElevenLabs AI
- Voice playback of AI responses
- Conversation history display
- Start/Stop listening controls
- Clear conversation option

## Usage

1. Navigate to `/voice-chat-demo` in your browser
2. Click the microphone button to start listening
3. Speak your message
4. The AI will respond with voice and text
5. Click the microphone again to stop listening
6. Use the clear button to reset the conversation

## Component Usage

```tsx
import { VoiceChat } from '../components/VoiceChat';

export default function YourPage() {
  return (
    <VoiceChat
      apiKey={process.env.NEXT_PUBLIC_ELEVEN_LABS_API_KEY}
      modelId="eleven_turbo_v2" // Optional
      voiceId="your-voice-id" // Optional
    />
  );
}
```

## Props

- `apiKey` (required): Your ElevenLabs API key
- `modelId` (optional): The ID of the ElevenLabs model to use
- `voiceId` (optional): The ID of the voice to use for responses
