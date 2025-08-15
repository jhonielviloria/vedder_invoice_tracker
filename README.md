# Invoice Status Tracker

A lightweight React + Vite + Tailwind prototype to manage clients and track invoice creation status over time.

## Features
- Client CRUD (name, frequency, instructions)
- Dynamic invoice grid by month with applicability based on frequency
- Status cycling per invoice (Not Done, Completed, Recurring Done)
- Notes per invoice cell (modal + tooltip)
- LocalStorage persistence

## Getting Started

Install dependencies and run the dev server.

```
npm install
npm run dev
```

Open http://localhost:5173

## Tech Stack
- React 18 + TypeScript
- Vite
- Tailwind CSS

## Data Model
See `src/types.ts`.

## Next Ideas
- Filtering / search clients
- Export to CSV / print view
- Authentication & backend persistence
- Role-based access if expanded
