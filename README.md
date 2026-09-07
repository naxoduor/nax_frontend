# LAG — UGENE-style React + TypeScript UI

A standalone Vite + React + TypeScript implementation of a UGENE-inspired bioinformatics desktop workspace.

## Run

```bash
npm install
npm run dev
```

Then open the local URL printed by Vite.

## Included

- Desktop-style menu bar and toolbar
- Project tree
- Sequence/alignment tabs
- Multiple sequence alignment viewer
- DNA nucleotide coloring
- Consensus row
- Column selection
- Sequence row selection
- Search/filter
- Zoom control
- Inspector panel
- Tasks/console/log area
- Dark/light theme
- Responsive fallback that hides the inspector on smaller screens

## Backend integration

The UI is intentionally frontend-only. Replace the demo data/actions in `src/App.tsx` with calls to your Django/FastAPI backend.

Suggested API endpoints:

- `GET /api/projects`
- `GET /api/sequences/:id`
- `POST /api/alignments`
- `GET /api/alignments/:id`
- `POST /api/analysis`
- `GET /api/tasks/:id`
- `GET /api/files/:id`

For Clustal Omega/MAFFT/Kalign, the browser should submit a task to the backend rather than executing binaries directly.
