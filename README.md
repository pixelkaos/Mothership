# Mothership RPG Companion

A digital toolkit and companion app for the award-winning sci-fi horror tabletop RPG, **Mothership®**. This application is designed to streamline game preparation for Wardens (GMs) and enhance the gameplay experience for players by providing quick access to generators, character management tools, and rules references.

*(A screenshot of the application would be great here!)*

## About The Project

This project was born from a love for the gritty, blue-collar sci-fi horror of Mothership. The goal is to create a comprehensive, aesthetically-pleasing, and easy-to-use web application that assists in running and playing the game. By leveraging modern web technologies and the power of generative AI, this companion app aims to reduce prep time and inspire creativity at the gaming table.

The UI is built around a flexible system of dockable panels, allowing you to arrange your tools on screen however you like.

### Built With

*   **[React](https://reactjs.org/)**: For building the user interface.
*   **[TypeScript](https://www.typescriptlang.org/)**: For robust, type-safe code.
*   **[Tailwind CSS](https://tailwindcss.com/)**: For rapid, utility-first styling.
*   **[Google Gemini API](https://ai.google.dev/)**: For generative AI features like atmospheric descriptions, character backstories, and portrait generation.

## Features

The Mothership RPG Companion is packed with features to help you get your next session off the ground:

*   **Derelict Generator & AI Gamemaster**:
    *   Instantly generate a complete derelict ship using the official random tables.
    *   With a single click, use the Gemini API to weave the random data points into a cohesive, atmospheric, and spooky narrative description, providing instant adventure hooks.

*   **Comprehensive Character Hangar**:
    *   A full-featured character creation and management suite with multiple creation paths:
        *   **Character Wizard**: A step-by-step guide to building a new character from scratch.
        *   **Random Recruit Generator**: Create a complete, ready-to-play character in one click, including an AI-generated backstory and portrait.
        *   **Pre-Generated Characters**: Choose from a list of ready-made characters to jump right into the action.
        *   **Load/Save Functionality**: Export your character to a `.json` file and load them back in later.

*   **Shipyard Database**:
    *   Browse a database of all official ships, upgrades, and weapons from the Shipbreaker's Toolkit.
    *   Open any vessel directly in the Ship Manifest to use as a template for your own.

*   **Interactive Dockable UI Panels**:
    *   A persistent, multi-window UI that lets you manage your tools on screen. Panels remember their positions and can be opened, closed, and minimized.
    *   **Dice Roller**: A full-featured dice roller that can handle simple rolls, stat/save checks for the active character, damage rolls, and more.
    *   **In-Game Character Sheet**: A compact, persistent view of your active character for quick reference during play. You can trigger stat and save rolls directly from the sheet.
    *   **Ship Manifest**: A fully editable sheet for tracking your ship's status, from hull points and megadamage to crew and cargo. Can be populated from the Derelict Generator or the Shipyard.

*   **Navigable Rules Database**:
    *   An easy-to-navigate reference for the core player-facing rules of Mothership 1e.
    *   Includes expandable tables for equipment, armor, weapons, trinkets, and patches.

## Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

You will need a modern web browser and a Google Gemini API key.

### Installation

1.  Clone the repo:
    ```sh
    git clone https://github.com/your_username/your_repository.git
    ```
2.  Set up your API key. The application expects the Google Gemini API key to be available as an environment variable named `API_KEY`. You will need to create a mechanism to load it (e.g., using a `.env` file with a build tool like Vite, or by setting it in your deployment environment).
    ```
    API_KEY='YOUR_API_KEY'
    ```
3.  Open `index.html` in your browser. Since the project uses ES modules and an import map, it should run directly in modern browsers without a build step.

## Roadmap

This project is actively being developed. Here are some features planned for the future:

*   [ ] **AI Warden Chat**: An interactive chat mode where you can ask the AI Gamemaster questions about the derelict ship or session events.
*   [ ] **Campaign & Session Management**: Tools for Wardens to track campaign progress, notes, and NPCs.
*   [ ] **Bestiary**: A database of alien creatures and horrors, with AI-generated descriptions and stats.
*   [ ] **Ship-to-Ship Combat Helper**: A utility to manage the complexities of space combat.
*   [ ] **Mobile-First Responsive Overhaul**: Further improvements to the experience on mobile devices.

See the [open issues](https://github.com/your_username/your_repository/issues) for a full list of proposed features (and known issues).

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
