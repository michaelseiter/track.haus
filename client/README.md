# Track Haus Lit Client

This is an alternative client implementation for Track Haus using Lit, showcasing a Web Components approach.

## Key Features

- Uses native Web Components via Lit
- Real-time updates using Server-Sent Events
- Minimal dependencies
- TypeScript support
- Fast and lightweight

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

The application will be available at http://localhost:5173

## Project Structure

```
src/
├── components/           # Web Components
│   ├── track-list.ts    # Main track display component
│   └── nav-bar.ts       # Navigation component
├── main.ts              # Component registration
└── index.html          # Entry point
```

## Why Lit?

This implementation uses Lit because:
- Native Web Components that work anywhere
- Extremely lightweight (~5KB)
- Simple, reactive properties
- Great TypeScript support
- Efficient rendering with lit-html
