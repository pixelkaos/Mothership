# Mothership RPG Companion

A digital toolkit and companion app for the award-winning sci-fi horror tabletop RPG, **Mothership®**. This application is designed to streamline game preparation for Wardens (GMs) and enhance the gameplay experience for players by providing quick access to generators, character management tools, and rules references.

*(A screenshot of the application would be great here!)*

## About The Project

This project was born from a love for the gritty, blue-collar sci-fi horror of Mothership. The goal is to create a comprehensive, aesthetically-pleasing, and easy-to-use web application that assists in running and playing the game. By leveraging modern web technologies and the power of generative AI, this companion app aims to reduce prep time and inspire creativity at the gaming table.

The UI is built around a flexible system of dockable panels, allowing you to arrange your tools on screen however you like.

### Built With

- React 19 + TypeScript
- Vite 6 (SWC React plugin)
- Tailwind CSS (compiled via PostCSS)
- Ollama (local LLM for story generation)
- Google Gemini (image generation)
- @randsum/roller (dice engine)

## Features

The Mothership RPG Companion is packed with features to help you get your next session off the ground:

*   **Derelict Generator & AI Gamemaster**:
    *   Instantly generate a complete derelict ship using the official random tables.
    *   With a single click, use a local Ollama model to weave the random data points into a cohesive, atmospheric, and spooky narrative description, providing instant adventure hooks.

*   **Comprehensive Character Hangar**:
    *   A full-featured character creation and management suite with multiple creation paths:
        *   **Character Wizard**: A step-by-step guide to building a new character from scratch.
        *   **Random Recruit Generator**: Create a complete, ready-to-play character in one click, including an AI-generated backstory (Ollama) and a portrait (from local picker or optional AI).
        *   **Portrait Picker**: Choose a portrait from local assets filtered by Class and Pronouns. Also supports optional AI Generate fallback.
        *   **Pre-Generated Characters**: Choose from a list of ready-made characters to jump right into the action.
        *   **Load/Save Functionality**: Export your character to a `.json` file and load them back in later.

*   **Shipyard Database**:
    *   Browse a database of all official ships, upgrades, and weapons from the Shipbreaker's Toolkit.
    *   Open any vessel directly in the Ship Manifest to use as a template for your own.

*   **Interactive Dockable UI Panels**:
    *   A persistent, multi-window UI that lets you manage your tools on screen. Panels remember their positions and can be opened, closed, and minimized.
    *   **Dice Roller**: Handles simple rolls and explicit 2d10 percentile Stat/Save checks (with adv/disadv) and logs digits correctly.
    *   **In-Game Character Sheet**: Tabbed view (Stats / Story) with a fullscreen portrait viewer on click; skills development (marks + level‑up), T/E/M indicator, and equipment table with AP and Credits indicators and AP +/- controls.
    *   **Ship Manifest**: Tabbed view (Stats / Map). Map includes the Deckplan editor.

*   **Navigable Rules Database**:
    *   An easy-to-navigate reference for the core player-facing rules of Mothership 1e.
    *   Includes expandable tables for equipment, armor, weapons, trinkets, and patches.

## Getting Started

Run the app locally with Vite.

### Prerequisites

- Node.js 18+ (LTS recommended)
- Ollama installed and running locally
  - Start the server: `ollama serve`
  - Pull the storytelling model: `ollama pull tohur/natsumura-storytelling-rp-llama-3.1`
- Google Gemini API key (optional; required only for AI portrait generation)

### Setup

1) Clone and install dependencies

```bash
git clone <this-repo-url>
cd <repo>
npm install
```

2) Configure environment variables (for AI features)

Copy `.env.example` to `.env` and set your key:

```bash
cp .env.example .env
# then edit .env.local (or .env) and set your keys
# Google Gemini (images only)
VITE_GEMINI_API_KEY=your_api_key_here

# Optional: Ollama overrides (auto-detect usually works)
# VITE_OLLAMA_BASE_URL=http://localhost:11434
# VITE_OLLAMA_MODEL=tohur/natsumura-storytelling-rp-llama-3.1
```

Notes:
- The key is used client-side via `import.meta.env.VITE_GEMINI_API_KEY` in `src/services/geminiService.ts`.
- For production deployments, consider proxying Gemini requests server-side to avoid exposing the key in client bundles.

3) Start the dev server

```bash
npm run dev
```

Build and preview:

```bash
npm run build
npm run preview
```

Vite will serve `index.html`, which loads the app from `src/index.tsx`.

Dev proxy for Ollama:
- In development, requests to `/ollama` are proxied to `http://localhost:11434` (see `vite.config.ts`).
- In production, set `VITE_OLLAMA_BASE_URL` or run your own reverse proxy to forward `/ollama` to your Ollama server (and enable CORS if needed).

4) (Optional) Add local portraits for the Portrait Picker

Place images under `src/data/CharacterPictures/<Class>/<Pronouns>/...` for example:

```
src/data/CharacterPictures/Marine/he_him/00001_Marine_he_him.png
src/data/CharacterPictures/Scientist/she_her/scientist_01.jpg
src/data/CharacterPictures/Teamster/they_them/teamster_portrait.webp
```

Notes:
- Pronouns folders: `he_him`, `she_her`, `they_them` (case-insensitive; underscores or separators are normalized).
- This directory is `.gitignored` by default to avoid committing large binaries. See `src/data/CharacterPictures/README.md`.

### Project Structure

```
src/
  App.tsx
  index.tsx
  index.css                # Tailwind + tokens import
  styles/
    tokens.css             # Design tokens (CSS variables)
  components/              # UI components (feature + ui subfolders)
  context/                 # React Contexts (state containers)
  hooks/                   # Reusable logic hooks
  views/                   # Top-level routes/views
  services/                # External API integrations (Gemini + Ollama client)
  utils/                   # Pure utilities (dice, helpers, character gen)
  data/                    # Data (e.g., shipData)
  constants.ts             # Source of truth for rules/items/tables
  constants/               # Domain-specific re-exports (rules, items, names, derelict)
  types.ts                 # Shared TypeScript types
tailwind.config.ts         # Tailwind configuration
postcss.config.js          # Tailwind + Autoprefixer
vite.config.ts             # Vite config (`@` alias → `src`)
```

### Path Aliases

- Import from `@` to reference files under `src/` (configured in both `vite.config.ts` and `tsconfig.json`).

Examples:

```ts
import { useDiceRoller } from '@/hooks/useDiceRoller';
import { SHIP_DATA } from '@/data/shipData';
import { TRINKETS } from '@/constants/items';
```

## Roadmap

This project is actively being developed. Here are some features planned for the future:

*   [ ] **AI Warden Chat**: An interactive chat mode where you can ask the AI Gamemaster questions about the derelict ship or session events.
*   [ ] **Campaign & Session Management**: Tools for Wardens to track campaign progress, notes, and NPCs.
*   [ ] **Bestiary**: A database of alien creatures and horrors, with AI-generated descriptions and stats.
*   [ ] **Ship-to-Ship Combat Helper**: A utility to manage the complexities of space combat.
*   [ ] **Mobile-First Responsive Overhaul**: Further improvements to the experience on mobile devices.

See the [open issues](https://github.com/your_username/your_repository/issues) for a full list of proposed features (and known issues).

## Development Notes

- Tailwind is compiled via PostCSS. Global tokens are imported at the top of `src/index.css`.
- Dice Engine: The custom roller was replaced with `@randsum/roller` behind an adapter in `src/utils/dice.ts`.
  - API: `parseAndRoll(formula, { zeroBased? })` and `rollDice(formula, { zeroBased? })`.
  - Percentile Stat/Save checks now roll explicit 2d10 (tens/ones) and record digits; table lookups still use 0–99 indexing for Mothership compatibility.
  - Counts like salvage, damage, and credits are now 1-based. This also fixes `1d1` always yielding 0; it now yields 1.
  - If you want legacy ranges for stats/saves/credits, call with `{ zeroBased: true }` at those sites.
- Story Generation: Gemini text endpoints were replaced with a local Ollama model for narratives (derelicts and character backstories).
  - Model defaults to `tohur/natsumura-storytelling-rp-llama-3.1`.
  - The app auto-detects an Ollama base URL among: `VITE_OLLAMA_BASE_URL`, `/ollama` (dev proxy), `http://localhost:11434`, `http://127.0.0.1:11434`.
  - A status badge in the header shows connectivity and model presence; see `src/components/OllamaStatusBadge.tsx`.
  - Tools → “Test Story AI” performs a quick end-to-end prompt to verify output.
- Portrait Generation: Still uses Gemini image API (requires `VITE_GEMINI_API_KEY`).
- Portrait Picker: Local assets filtered by Class and Pronouns; fullscreen viewer on the Character Sheet.
- The app uses multiple dockable panels (`src/context/PanelsContext.tsx`) that persist position/minimized state in `localStorage`.

## Scripts

- `npm run dev` — Start Vite dev server
- `npm run build` — Production build
- `npm run preview` — Preview the production build

## Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## License

Distributed under the MIT License. See `LICENSE.txt` for more information.

## Acknowledgments

*   This is an unofficial fan-made tool. **Mothership® Sci-Fi Horror RPG** is a trademark of **Tuesday Knight Games**. All rights reserved.
*   This project would not be possible without the incredible work of the team at Tuesday Knight Games. Please support them by purchasing the official Mothership rulebooks.
