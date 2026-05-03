# AGENTS.md - Retro Fun Portfolio

## Commands

- `bun dev` - Start Vite dev server (includes Hono dev server for API routes)
- `bun run build` - TypeScript check + Vite build
- `bun run lint` - Run oxlint with type-aware rules
- `bun run lint:fix` - Auto-fix lint issues
- `bun run format` - Format with oxfmt
- `bun run format:check` - Check formatting without writing
- `bun run preview` - Preview production build

## Tech Stack

- **React 19** + TypeScript + Vite
- **State**: zustand (`src/store/`)
- **Windows**: react-rnd (draggable/resizable windows)
- **Animations**: motion (`motion/react`)
- **Audio**: howler
- **Backend**: Hono runs via `@hono/vite-dev-server` (API routes at `/api/*`)

## Architecture

- **Entry**: `src/main.tsx`, `src/App.tsx`
- **State store**: `src/store/windowStore.ts` - manages window lifecycle, focus, z-index
- **Components**: All windows wrap content in the `Window` component
- **API routes**: `src/server/index.ts`

## Styling

- **CSS Modules** for component styles (`*.module.css`)
- **Global CSS**: `src/styles/global.css` - theme variables, scanline/glitch effects
- **No Tailwind** - pure CSS only

## TypeScript

- Uses `verbatimModuleSyntax` - use type-only imports for interfaces
- Config: `tsconfig.app.json`, `tsconfig.node.json`

## Key Quirks

- Vite config includes Hono dev server - only `/api/*` routes are proxied to the backend
- Build output warns on CommonJS in ESM (filtered out in config)
- TypeScript ~6.0.2 (older version)
