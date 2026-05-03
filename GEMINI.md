# GEMINI.md - Retro Fun Portfolio (Denpa Theme)

This project is a chaotic, multi-window "denpa" themed portfolio/desktop environment inspired by the visual style of _Psychos Syndrome!? Rhythm Psychosis_. It uses a modern React stack with high-performance animations and state management.

## Project Overview

- **Architecture:** Multi-window OS simulation.
- **Tech Stack:** React 19, TypeScript, Vite, Bun.
- **State Management:** `zustand` (managing window lifecycle, focus, and layout).
- **Window Management:** `react-rnd` for draggable and resizable window components.
- **Animations:** `motion` (imported from `motion/react`) for entrance and interaction effects.
- **Audio:** `howler` for sensory-overload sound effects.
- **Styling:** Pure CSS with **CSS Modules** for components and a central `global.css` for the theme and scanline/glitch effects. **No Tailwind CSS.**

## Key Commands

The project uses `bun` as the primary package manager.

- **Development:** `bun dev` - Starts the Vite development server.
- **Build:** `bun run build` - Compiles TypeScript and builds the production assets.
- **Lint:** `bun run lint` - Runs oxlint (type-aware) across the codebase.
- **Format:** `bun run format` - Formats the codebase using oxfmt.
- **Preview:** `bun run preview` - Previews the production build locally.

## Development Conventions

### Styling

- **CSS Modules:** Always use CSS Modules for component-specific styles (e.g., `ComponentName.module.css`).
- **Global Variables:** Define new colors, fonts, or reusable animations in `src/styles/global.css` using CSS variables.
- **Theme:** Adhere to the "Denpa" aesthetic: high contrast (magenta/cyan), scanlines, glitch effects, and retro-internet fonts (`MS UI Gothic`).

### Linting & Formatting

- **Linter:** oxlint is the primary linter. Use `oxlint-tsgolint` for type-aware rules.
- **Formatter:** oxfmt is used for code formatting. It is significantly faster than Prettier.
- **Scripts:** Use `bun run lint` and `bun run format` before pushing code.

### State & Windows

- **Store:** The `windowStore.ts` is the single source of truth for all open windows.
- **Focus:** All window interactions should trigger `focusWindow(id)` to update the z-index.
- **Spawning:** New windows should be added via the `addWindow` action in the store.

### Components

- **Window Component:** All content should be wrapped in the `Window` component to inherit dragging, resizing, and focus behavior.
- **Types:** Use type-only imports for interfaces defined in the store to comply with `verbatimModuleSyntax` in `tsconfig.json`.

## Directory Structure

- `src/components/`: React components (each in its own folder with a module CSS file).
- `src/store/`: Zustand stores for global state.
- `src/styles/`: Global styles, themes, and CSS resets.
- `public/`: Static assets (icons, sounds, images).
