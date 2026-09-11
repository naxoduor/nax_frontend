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

Set `VITE_API_BASE_URL` to the Java backend base URL to enable REST integration. Without it,
the alignment action uses the local demo simulator.

Suggested API endpoints:

- `GET /api/projects`
- `GET /api/sequences/:id`
- `POST /api/alignments`
- `GET /api/alignments/:id`
- `POST /api/analysis`
- `GET /api/tasks/:id`
- `GET /api/files/:id`
- `POST /api/ugene/schema/transfer`

The UGENE transfer endpoint receives a versioned JSON envelope. For a synchronous response,
return `{ "status": "completed", "sequences": [] }`. For an asynchronous response, return
`{ "status": "accepted", "taskId": "..." }`.

For Clustal Omega/MAFFT/Kalign, the browser should submit a task to the backend rather than executing binaries directly.
