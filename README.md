# CM Outreach Insights Dashboard

A dashboard for visualizing CM Outreach Activities in Gujarat, built with Next.js, Recharts, and Leaflet maps.

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Styling:** Tailwind CSS + shadcn/ui
- **Charts:** Recharts
- **Maps:** Leaflet + React-Leaflet
- **Data:** local Excel file (`exceljs`)
- **Deployment:** Vercel

## Getting Started

```bash
npm install
npm run dev
```

The app runs at [http://localhost:4000](http://localhost:4000).

## Environment Variables

The dashboard needs no environment variables.

## Data

All data comes from `data/cm_visits.xlsx` (sheet `Data`, one row per event; see the `Notes` sheet for column conventions). Edit the file and restart or hit **Refresh** to see changes; production caches the data for 6 hours.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run linter |
