```markdown
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

... (содержимое сохранено)

``` 
