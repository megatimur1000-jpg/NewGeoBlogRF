Map rendering contract (routes + markers)

1) Geometry priority (single source of truth)
- Final geometry is chosen in the page components and passed into the facade.
- Files and lines to see:
  - frontend/src/components/Maps/PostMap.tsx → finalGeometry is computed and used for BOTH line and markers.
  - frontend/src/components/Maps/PostMap.tsx → same logic.
- Rule:
  - If saved route_data.geometry exists AND it is not a straight line → use saved geometry.
  - Else → use rebuilt geometry from ORS (or input geometry fallback).

2) ORS proxy (roads snapping)
- Frontend always calls backend proxy on port 3002.
- File: frontend/src/services/routingService.ts
  - API origin: VITE_API_ORIGIN (fallback http://localhost:3002)
  - Endpoint: `${API_ORIGIN}/ors/v2/directions/{profile}/geojson`

3) MapsGL layering and marker offsets
- Markers are forced above route lines (high z-index + layer ordering).
- File: frontend/src/services/mapFacade/mapsglAdapter.ts (MapsGL adapter)
  - Marker vertical offsets:
    - END_MARKER_Y_OFFSET controls the end marker vertical shift.
    - WAYPOINT_Y_OFFSET controls intermediate points.
    - Start marker stays at 0.

3.1) Drop-shaped route markers (A/B): anchoring and pixel offsets
- Anchor is set to 'bottom' → geographic point corresponds to the tip of the drop (остриё).
- To ensure the end marker “B” tip exactly matches the last route coordinate while the canvas line is under it, we use a negative vertical offset equal to the marker height.
- Constants location and defaults:
  - frontend/src/services/mapFacade/mapsglAdapter.ts
    - MARKER_HEIGHT = 44 (matches iconSize[1] for A/B drop)
    - END_MARKER_Y_OFFSET = -MARKER_HEIGHT  // lift B by its full height
    - WAYPOINT_Y_OFFSET = -40               // optional for intermediate points
- What to change safely:
  - To move only the end marker higher/lower: edit END_MARKER_Y_OFFSET.
  - If icon size changes, set MARKER_HEIGHT to the new icon height and keep END_MARKER_Y_OFFSET = -MARKER_HEIGHT.
- What NOT to change:
  - Do not change anchor: it must remain 'bottom'.
  - Do not reduce DOM z-index or remove route layer reordering; otherwise the line may cover the marker.

4) What you SHOULD NOT change
- Do not give priority to a 2-point or straight saved geometry over rebuilt geometry.
- Do not switch ORS URL back to relative `/ors/...` — it must target API port 3002 via API_ORIGIN.
- Do not lower marker z-index or remove moveLayer logic in the adapter.

5) Quick knobs for adjustments
- End marker height: frontend/src/services/mapFacade/mapsglAdapter.ts → END_MARKER_Y_OFFSET.
- API origin (if backend not on 3002): set VITE_API_ORIGIN in frontend .env.

This document locks the current, working behavior so future edits don't break road following or marker layering.


