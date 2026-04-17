
The user wants location-gated cleaner discovery: before showing any cleaner cards, ask for ZIP code, then filter cleaners to that area.

Existing pieces I can leverage:
- `useCleaners` hook fetches from `cleaner_public_profiles` (has `travel_radius_km`, no lat/lng exposed publicly).
- `cleaner_service_areas` table stores per-cleaner ZIP/city/state/lat/lng/radius — this is the right matching surface.
- `useAddressAutocomplete` (Nominatim) can geocode a ZIP to lat/lng for distance math.
- `Discover.tsx` is the cleaner browsing page (need to confirm but it's the obvious target).

Matching strategy (simple, fast, no PostGIS needed):
1. Exact ZIP match in `cleaner_service_areas.zip_code` → strongest signal.
2. Fallback: geocode ZIP → lat/lng, then haversine distance vs each service area's lat/lng within its `radius_miles` (or cleaner's `travel_radius_km`).

Persist ZIP in localStorage so we don't re-prompt every visit. Allow change anytime.

# Plan: ZIP-gated cleaner discovery

## 1. ZIP gate UI (Discover page)
- Before any cleaner cards render, if no ZIP in localStorage (`puretask_client_zip`), show a centered card: "Find cleaners near you" with a 5-digit ZIP input + "Search" button.
- Validate 5-digit US ZIP. On submit, geocode via Nominatim (`postalcode=XXXXX&country=us`) to get lat/lng + city/state.
- Save `{ zip, lat, lng, city, state }` to localStorage and React state.

## 2. Location bar (after ZIP set)
- Replace gate with a slim bar at top of Discover: "Showing cleaners near **{city}, {state} {zip}**" + "Change" button (reopens the ZIP modal).

## 3. New hook: `useCleanersByZip(zip, lat, lng)`
- Query `cleaner_service_areas` joined with `cleaner_public_profiles`:
  - First pass: rows where `zip_code = :zip` → mark as "Serves your ZIP".
  - Second pass: rows with lat/lng where haversine distance ≤ `radius_miles` → mark as "In service radius" + show distance.
- Dedupe by cleaner_id, sort: exact ZIP match → distance asc → rating desc.
- Return enriched `CleanerListing[]` with `matchType` and `distanceMiles`.

## 4. Update Discover page
- Swap `useCleaners` for `useCleanersByZip` once ZIP is set.
- Add badge on each cleaner card: "Serves your area" or "{X} mi away".
- Empty state: "No cleaners serve {zip} yet — try a nearby ZIP" with change button.

## 5. Pass ZIP through to booking
- When client clicks a cleaner → book, prefill the booking address ZIP with the saved ZIP (small UX win, easy via URL param or context).

## Technical notes
- Nominatim is already used for autocomplete — same endpoint, just `postalcode` param. No new dependency.
- Haversine in pure JS (~10 lines) — no PostGIS migration needed.
- All filtering is client-side after one query, fine for current scale.
- Files touched: `src/pages/Discover.tsx`, new `src/hooks/useCleanersByZip.ts`, new `src/components/discover/ZipGate.tsx`, new `src/components/discover/LocationBar.tsx`.
