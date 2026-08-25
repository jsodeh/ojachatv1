# OjaChat: AI-Powered Local Shopping Assistant

OjaChat is a conversational voice and text shopping assistant designed to simplify market runs and local shopping in Nigeria. Built as a Progressive Web App (PWA), it leverages artificial intelligence to help users check prices, buy foodstuff, find medicines, and coordinate group deliveries.

OjaChat interfaces with an automation backend powered by **n8n** and utilizes **Supabase** for database management, authentication, and metered usage tracking.

---

## 🌟 Core Features

- **🤖 AI-Driven Conversational Agent**: Text and voice interface that acts as a personal shopper, query router, and price validator.
- **🎙️ Voice Conversational Mode**: Real-time voice interaction powered by **ElevenLabs Conversational AI**, providing natural and responsive vocal conversations.
- **🛒 Complete Local Delivery Checkout**:
  - Detailed product cart and group order checkout flows.
  - Integrated **Google Maps Geocoder** address selection modal.
  - Custom delivery scheduler with date calendar and slot limits.
- **💳 Tiered Subscription & Metered Limits**:
  - **Basic Plan (Free)**: Access to essential chat features, voice conversations, and basic shopping actions with metered limits.
  - **Market PRO**: Offers unlimited chat access with elevated word and voice limits.
  - **Premium**: High-volume tier featuring expanded word limits, voice duration, and auto-shopping features.
  - **OjaPRIME**: Complete access package with unlimited usage, dedicated support, and free deliveries.
- **📱 Progressive Web App (PWA)**:
  - Cache-first Service Worker offline capabilities.
  - Mobile optimized layout with app shell, dynamic drawer modals, and custom iOS startup splash screens.
  - PWA asset pipeline to generate multi-size app icons and launch splashes.

---

## 🛠️ Technology Stack

- **Frontend Framework**: [Vite](https://vitejs.dev/) + [React](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/) + [Radix UI](https://www.radix-ui.com/) + [Lucide Icons](https://lucide.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) + [PostCSS](https://postcss.org/)
- **Routing**: [React Router DOM v6](https://reactrouter.com/)
- **Database & Auth**: [Supabase](https://supabase.com/) (PostgreSQL, RLS Policies, Database Functions, Edge Functions, Storage Buckets)
- **Voice Synthesis/AI**: [ElevenLabs Conversational Web SDK](https://elevenlabs.io/)
- **LLM/Workflow Orchestration**: [n8n](https://n8n.io/)
- **Image Processing**: [Sharp](https://sharp.pixelplumbing.com/) (Asset generation pipeline)

---

## 📂 Project Structure

```
├── .cursor/                # Cursor development guidelines & settings
├── .vscode/                # VS Code deployment & editor settings
├── n8n-workflows/          # Exported n8n production automation JSON workflows
├── public/                 # Static PWA assets, icons, manifest, service workers
├── scripts/                # Development & CLI helper scripts
│   ├── check-admin.ts      # Query admin roles list in Supabase
│   ├── test-connection.ts  # Test client connection to Supabase
│   └── generate-pwa-assets.js # Resize raw logos to generate PWA icons
├── src/                    # React Source Directory
│   ├── components/         # Reusable UI components & modals
│   ├── contexts/           # Global React Context Providers (Auth, Cart, Subscription, Theme)
│   ├── hooks/              # Custom react hooks (animated hints, locations, subscription status)
│   ├── integrations/       # API Clients configurations
│   ├── pages/              # Primary route views (Index, Privacy, Terms, SubscriptionPage)
│   ├── providers/          # ElevenLabs voice provider contexts
│   └── styles/             # Tailwind theme configurations
├── supabase/               # Supabase backend repository
│   ├── functions/          # Deno Edge Functions (reset limits, n8n-router)
│   ├── migrations/         # PostgreSQL schema migrations
│   └── scripts/            # Storage bucket SQL/Bash setup helpers
├── tailwind.config.ts      # Tailwind design token configuration
└── tsconfig.json           # TypeScript configuration
```

---

## 🚀 Local Installation & Setup

### Prerequisites

Make sure you have [Node.js](https://nodejs.org/) (v18+) and [npm](https://www.npmjs.com/) or [Bun](https://bun.sh/) installed.

### 1. Clone the repository
```bash
git clone https://github.com/your-username/ojachat.git
cd ojachat
```

### 2. Install dependencies
```bash
npm install
```

### 3. Setup Environment Variables
Create a `.env.local` file in the root directory and specify the following variables:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key # Dev scripts only

# Google Maps API Key
VITE_GOOGLE_MAPS_API_KEY=your-google-maps-api-key

# ElevenLabs Voice Configuration
NEXT_PUBLIC_ELEVEN_LABS_API_KEY=your-eleven-labs-api-key
```

### 4. Run the Development Server
```bash
npm run dev
```
The app will start at `http://localhost:8888` (or port configured in `vite.config.ts`).

---

## 🗄️ Supabase Backend Configuration

OjaChat utilizes Supabase database migrations to manage users, roles, subscriptions, and usage logs.

### 1. Database Migrations
To push current migrations to your Supabase project:
```bash
npx supabase db push
```

The migrations cover:
- `user_roles`: Admin, manager, and user access levels.
- `subscription_plans`: Subscription tiers metadata and limits.
- `user_subscriptions`: Subscriptions mapping users to tiers.
- `subscription_usage`: Metered usage counts (chats, voice minutes, words).
- `profiles`: User information schema.

### 2. Setup Storage Buckets
Run the storage configurations to create the `avatars` bucket and configure RLS:
```bash
# SQL way: copy-paste contents of the file in the Supabase SQL editor
# or run the helper bash script:
chmod +x supabase/scripts/setup-storage.sh
./supabase/scripts/setup-storage.sh
```

### 3. Deploy Edge Functions
Deploy the utility edge functions used for router routing and resetting usage limits:
```bash
npx supabase functions deploy reset-usage-limits
npx supabase functions deploy n8n-router

# Schedule the limit reset cron to execute daily
npx supabase functions schedule cron '0 0 * * *' reset-usage-limits
```

---

## 🔗 n8n Workflow Routing

The AI chat is orchestrated using the n8n JSON workflows stored in the `n8n-workflows/` directory:
- **`OjaChat Assistant.json`**: Primary chat coordinator router that handles query processing, entity extraction, and price validations.
- **`firecrawl_webhook_scraper.json`**: Real-time market product scaper webhook powered by Firecrawl.
- **`product_scraper_workflow.json`**: Background product indexing and matching workflow.

Import these JSON files directly into your self-hosted or cloud n8n workspace to instantiate the routers.

---

## 🛠️ CLI Helper Tools

Run these scripts locally to manage and troubleshoot the application:

- **Generate PWA Assets**:
  Generate PWA multi-sized icons and iOS splash screens from your source logo in `assets/ojastack.png`.
  ```bash
  npm run generate-pwa-assets
  ```
- **Check Admins**:
  Lists all users currently registered with admin roles in your database.
  ```bash
  npx ts-node-esm scripts/check-admin.ts
  ```
- **Test Connection**:
  Tests connection to your remote Supabase instance.
  ```bash
  npx ts-node-esm scripts/test-connection.ts
  ```

---

## 📝 License

This project is open-source and licensed under the [ISC License](LICENSE).
