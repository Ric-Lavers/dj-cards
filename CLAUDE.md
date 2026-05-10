# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

DJ Cards is an SVG card generator for DJs — think baseball cards but for the dance music world. Each DJ gets a front (AI-processed photo + DJ name) and a back (stats, genres, BPM, skills, QR code). Cards are sequentially numbered and printable via SVG export.

Reference project for coding style: `/Users/riclavers/sites/personal/jambaroo-hackathon`

---

## Tech Stack

- **Next.js** (App Router)
- **MongoDB** via Mongoose
- **Next.js API routes** for backend (not Express — simpler than jambaroo for this scope)
- **styled-components v6** for all styling
- **SVG** for card generation (front + back templates)
- **AI image pipeline** — Replicate or fal.ai (background removal + pose-matched style prompt)

---

## Commands

```bash
npm run dev       # start dev server
npm run build     # production build
npm run lint      # ESLint
```

---

## App Routes

| Route | Purpose |
|---|---|
| `/invite/[token]` | Landing page — "Create yours" CTA |
| `/create` | Input form (all card fields) |
| `/create/preview` | Two-col sticky SVG preview (desktop), stacked (mobile) |
| `/card/[id]` | View card — invite others, order physical copy |
| `/artist/[id]` | Public profile (QR code destination) — **V2** |

---

## Data Models

```ts
// db/mongo/models/artist.schema.ts
Artist {
  djName: string
  photo: string                   // original upload URL
  editedPhoto: string             // AI-processed URL
  poseChoice: 'hands_in_air' | 'knob_twiddler' | 'headphone_grab'
  genres: [string, string]        // exactly 2
  stats: {
    yearsPlaying: number
    tracksUploaded: number
    totalFollowers: number
    bpm: number                   // favourite BPM — show prominently on back
    danceabilityScale: number     // 0–100 (danceability ↔ easy listening)
  }
  skills: ('scratching' | 'long_mixes' | 'vinyl' | 'cdjs' | 'ableton' | 'guitar' | 'vocalist' | string)[]
  cardNumber: number              // sequential, auto-assigned
  qrCodeUrl: string               // links to /artist/[id]
  contactDetails: {
    email: string
    instagram: string
    address: string               // for physical card postage
  }
  team: ObjectId                  // one team for MVP
}
```

---

## Folder Structure

```
app/
  _providers/          ← global client providers
  _utils/              ← route-local utilities
  api/
    _lib/              ← shared API utilities, server actions
    artist/route.ts
    card/route.ts
  invite/[token]/
    page.tsx
  create/
    _components/
    page.tsx
    preview/
      _components/
      page.tsx
  card/[id]/
    _components/
    page.tsx
component-library/     ← shared design system primitives
  CardFront/
  CardBack/
  svg/
  index.ts
db/
  mongo/
    connect.ts
    models/
      artist.schema.ts
      team.schema.ts
      invite.schema.ts
services/
  ai/
    removeBackground.ts
    applyPosePrompt.ts
styles/
  theme.ts
  globalStyle.ts
utils/
```

---

## Coding Conventions

These are derived from the reference project. Follow them precisely.

### State Setters — `s_` prefix

```ts
const [open, s_open] = useState(false)
const [loading, s_loading] = useState(false)
```

### Styled-Components

```ts
// component-name.styles.tsx
import * as S from "./component-name.styles"
export const Card = styled.div<{ $active: boolean }>`...`

// ComponentName.tsx
<S.Card $active={isActive} />
```

- Always `import * as S` — never named imports from styles files
- `$`-prefixed transient props
- Theme imported directly from `component-library/theme`, not via ThemeProvider prop
- Media queries inline: `@media screen and (width < ${theme.breakpoints.sm})`

### Components

```tsx
export const ArtistCard = memo(({ id, djName }: { id: string; djName: string }) => {
  function handleClick() { ... }
  return <S.Wrapper>...</S.Wrapper>
})
```

- `memo()` for list items
- Named function declarations inside components (not arrow functions)
- Props typed inline as object literal — no separate interface
- `"use client"` at top of any file with hooks or event handlers

### Context

```ts
export const CardCTX = createContext({ ... })
export const useCardCTX = () => useContext(CardCTX)
```

### Backend — Class Pattern (stateful services only)

```ts
export class ArtistRegistration {
  static async init({ djName }: Init) {
    const db = await ArtistModel.findOne({ djName })
    return new ArtistRegistration({ djName, db })
  }
  constructor({ djName, db }) { ... }
  async save() { ... }
}
```

Use classes only for stateful flows (registration, AI pipeline orchestration). Pure exported functions for everything else.

### MongoDB

```ts
// db/mongo/connect.ts — global-cached singleton
let cached = global.mongoose
if (!cached) cached = global.mongoose = { conn: null, promise: null }

// model singleton guard
const ArtistModel =
  (models.Artist as Model<ArtistDoc> | undefined) ||
  model<ArtistDoc>("Artist", ArtistSchema)
```

Always `JSON.parse(JSON.stringify(doc))` before passing Mongoose docs to client.

### Data Fetching

- External/AI APIs → `fetch()`
- Internal API calls → `axios` with interceptor instance
- No SWR / React Query — use `useEffect` + `useState`

### Server Components — Comma-Chained Consts

```ts
const artist = await getArtist(id),
  cardNumber = artist.cardNumber,
  jar = await cookies(),
  userId = jar.get("userId")?.value
```

### File Naming

| Type | Convention | Example |
|---|---|---|
| React component | `PascalCase.tsx` | `CardBack.tsx` |
| Styles | `kebab-case.styles.tsx` | `card-back.styles.tsx` |
| Utils/helpers | `camelCase.ts` | `generateQrCode.ts` |
| Schema | `thing.schema.ts` | `artist.schema.ts` |
| Route handler | `route.ts` | `route.ts` |

---

## SVG Card System

Cards are generated as SVG — designed to be imported into print templates later. The MVP generates basic layout with correct data populated; a designer will refine the template later.

**Front:** AI-processed photo (bg removed, pose-matched), side banner, DJ name, card number.

**Back:** DJ name, stats grid, genre badges, danceability scale (visual), BPM (prominent), skill icons, QR code.

---

## AI Image Pipeline

1. User uploads photo → store original URL
2. User selects pose (`hands_in_air`, `knob_twiddler`, `headphone_grab`)
3. Send to AI with pose prompt + shared system style prompt (consistent feel across all cards)
4. Remove background
5. Composite result onto SVG card layer

---

## MVP Scope Notes

- **One team only** for MVP — team expansion is V2
- **No DJ logos or label branding** on MVP cards
- **No auth** for initial build
- **QR code** links to `/artist/[id]` — domain TBD, generate with placeholder for now
- **Physical card ordering** — collect postal address on post-generate page
- **Holographic/special edition** — print job, not digital — out of scope
- `/artist/[id]` public profile page — V2
