# Murder Mystery Game

A mobile-first React-based murder mystery game for friends to play together online.

## Project Structure

```
├── src/                    # Frontend React application
│   ├── components/         # React components
│   │   ├── ui/             # Reusable UI components
│   │   ├── game/           # Game-specific components
│   │   ├── lobby/          # Lobby-related components
│   │   ├── chat/           # Chat system components
│   │   └── character/      # Character management components
│   ├── pages/              # Page components
│   ├── hooks/              # Custom React hooks
│   ├── stores/             # Zustand state stores
│   ├── types/              # TypeScript type definitions
│   ├── utils/              # Utility functions and constants
│   ├── services/           # External service integrations
│   ├── assets/             # Static assets
│   │   ├── images/         # Image files
│   │   └── audio/          # Audio files
│   └── data/               # Game scenario data
├── server/                 # Backend Node.js application
│   ├── src/                # Server source code
│   ├── dist/               # Compiled JavaScript (build output)
│   └── package.json        # Server dependencies
├── public/                 # Static assets
└── package.json            # Root package.json with workspace config
```

## Tech Stack

- **Architecture**: Monorepo with npm workspaces
- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Node.js + Express + TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Routing**: React Router DOM
- **Real-time Communication**: Socket.IO (Client & Server)
- **Code Quality**: ESLint + Prettier + Husky
- **Development**: Concurrently for running multiple services

## Development Scripts

### Frontend & Backend Together
- `bun dev:all` - Start both frontend and backend development servers (default, optimized for Bun)
- `npm run dev:all:npm` - Alternative using npm (if you prefer npm over Bun)

### Frontend Only
- `npm run dev` - Start frontend development server (Vite)
- `npm run build` - Build frontend for production
- `npm run preview` - Preview production build

### Backend Only
- `npm run server:dev` - Start backend development server
- `npm run server:build` - Build backend for production
- `npm run server:start` - Start production backend server

### Code Quality
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting

## Getting Started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start both frontend and backend development servers:

   ```bash
   bun dev:all
   ```

   Or if you prefer npm:
   ```bash
   npm run dev:all:npm
   ```

   This will start:
   - Frontend (React + Vite) on http://localhost:5173 (or 5174 if 5173 is busy)
   - Backend (Node.js + Socket.IO) on http://localhost:3001

3. Alternatively, you can start them individually:

   ```bash
   # Frontend only
   bun run dev
   # or: npm run dev

   # Backend only (in another terminal)
   bun run server:dev:bun
   # or: npm run server:dev
   ```

3. Open [http://localhost:5173](http://localhost:5173) in your browser

## Game Features

- Mobile-first responsive design
- Real-time multiplayer gameplay
- Character assignment and management
- Evidence locker system
- Public and private chat
- Accusation and reveal system
- Multiple game scenarios

## Development Guidelines

- Follow the established folder structure
- Use TypeScript for type safety
- Write mobile-first responsive CSS
- Follow the ESLint and Prettier configurations
- Use conventional commit messages
- Test on mobile devices regularly

# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      ...tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      ...tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      ...tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
]);
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x';
import reactDom from 'eslint-plugin-react-dom';

export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
]);
```
