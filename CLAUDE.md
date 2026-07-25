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
- **AI image pipeline** — OpenAI `gpt-image-1` (`services/ai/generateSpecialSkillIcon.ts`, `services/ai/processArtistPhoto.ts`) — text-to-image for special-skill icons, image-edit for pose-matched DJ portraits. `@imgly/background-removal` runs client-side for the "cutout" pose option.

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
| `/create` | Input form + live flip preview (photo/pose, genres, skills, special skills, stats) — preview is inline on this page, there is no separate `/create/preview` route |
| `/deck` | Gallery of all artist cards, flip front/back |
| `/card/[id]` | View card — downloadable PNGs, invite others, order physical copy |
| `/card/[id]/edit` | Edit an artist's card (no auth — reached via a secret QR-code click on that artist's flipped-to-back deck card, not linked anywhere visibly) |
| `/special-skills` | Catalog of all special skills |
| `/special-skills/create` | Create a special skill — name + prompt → AI-generated icon (large + small) |
| `/special-skills/[id]` | Special skill detail/edit + which artists have picked it |
| `/print` | Print artist cards (fronts/backs/both, sheet layouts, bleed + crop marks) |
| `/print/skills` | Print special-skill cards, same flow/dimensions as `/print` |
| `/artist/[id]` | Public profile (QR code destination) — **V2, not built** |

---

## Data Models

```ts
// db/mongo/models/artist.schema.ts
Artist {
  djName: string
  editedPhoto: string              // AI-processed URL (Vercel Blob)
  poseChoice: 'hands_in_air' | 'knob_twiddler' | 'headphone_grab' | 'fist_pump'
            | 'the_lean' | 'eyes_closed' | 'natural' | 'original' | 'cutout'
  customPose: string                // freeform pose description, overrides poseChoice
  genres: [string, string]          // exactly 2, Mongoose-validated
  stats: {
    yearsPlaying: number
    tracksUploaded: number
    totalFollowers: number
    bpm: number                     // favourite BPM — show prominently on back
    danceabilityScale: number       // 0–100 (danceability ↔ easy listening)
  }
  skills: string[]                  // TS type is a Skill union, but the Mongoose field is
                                     // unrestricted `[{ type: String }]` — custom skills pass through
  specialSkills: string[]           // up to 2, names referencing the SpecialSkill catalog by name
  cardNumber: number                // sequential, auto-assigned
  qrCodeUrl: string                 // links to /artist/[id] (V2 — currently just a placeholder target)
  socials: { instagram: string; soundcloud: string }
  contactDetails: { email: string; phone?: string; address: string }
  invitedBy: ObjectId | null
  team: ObjectId                    // one team for MVP
}

// db/mongo/models/specialSkill.schema.ts
SpecialSkill {
  name: string             // unique
  prompt: string           // freeform concept text used for AI generation
  largeImage: string       // 1024x1024 card-sized icon (Vercel Blob URL)
  smallImage: string       // 40x40 sharp-resized icon, for compact/chip display
  invented: boolean        // true if created via the "+3 special skills" AI-invent button
  order: number
}
```

---

## Folder Structure

```
app/
  _providers/          ← global client providers
  api/
    artist/route.ts, artist/[id]/route.ts
    photo/route.ts               ← AI photo processing
    genres/route.ts
    special-skills/route.ts, [id]/route.ts, preview/route.ts, invent/route.ts
    invite/route.ts
  invite/[token]/
  create/
    _components/                 ← includes create-page.styles.tsx, reused by
                                    special-skills/create and card/[id]/edit
    page.tsx                     ← form + inline flip preview, no separate /preview route
  deck/
    _components/FlipCard.tsx
  card/[id]/
    _components/DownloadableCard.tsx
    page.tsx
    edit/
      _components/ArtistEditForm.tsx
  special-skills/
    page.tsx, create/page.tsx
    [id]/_components/{SpecialSkillEditForm,ArtistSpread}.tsx, page.tsx
  print/
    _components/{PrintPage,print-page.styles}.tsx
    page.tsx
    skills/_components/SkillPrintPage.tsx, page.tsx
component-library/     ← shared design system primitives, plain SVG (no styled-components)
  CardFront/, CardBack/          ← artist card front/back
  SkillCard/                     ← SkillCardFront/Back + ElectronDanceLogo, special-skill card front/back
  FlipPreview/                   ← generic 2-or-N-face flip/cycle wrapper, shared by all card types
  types.ts, index.ts
db/
  mongo/
    connect.ts
    models/
      artist.schema.ts, genre.schema.ts, specialSkill.schema.ts, team.schema.ts, invite.schema.ts
services/
  ai/
    processArtistPhoto.ts        ← images.edit, pose-matched DJ portraits
    generateSpecialSkillIcon.ts  ← images.generate, special-skill icons (large+small)
    inventSpecialSkillNames.ts   ← chat completion, "+3 special skills" button
    removeBackground.ts          ← unused; background removal actually runs client-side via
                                    @imgly/background-removal in app/create/page.tsx
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

Cards are plain SVG (`<svg viewBox="0 0 350 490">`, `theme.card` dimensions) with absolutely-positioned elements — no styled-components, no flex/grid. There are two independent card families, each a 2-sided front/back pair, both composed via the shared `FlipPreview` component:

- **Artist card** (`CardFront` + `CardBack`) — front: AI-processed photo, side banner, DJ name, card number. Back: DJ name, stats grid, genre badges, danceability scale, BPM, regular skill pills, up to 2 special-skill icons, QR code (secretly click-to-edit on the deck).
- **Special-skill card** (`SkillCardFront` + `SkillCardBack`) — front: the skill's AI-generated icon + name, styled like `CardFront`. Back: a uniform mark shared by every skill card (the real electron.dance SVG), not per-skill content.

Every card face supports a `squareCorners` prop for print (see `app/print/`), and print output uses the exact same SVG components/dimensions as the screen version.

**Before editing any of these components**, load the `svg-card-design` skill (`.claude/skills/svg-card-design/SKILL.md`) — it covers the unique-gradient-ID pattern, the fixed layout anchors that are easy to collide with, clipPath technique, print parity, and how to test flip interactions with the devtools MCP tools.

---

## AI Image Pipeline

**DJ portrait** (`services/ai/processArtistPhoto.ts`): user uploads a photo → picks a pose (or a custom pose description, or "natural"/"cutout") → `images.edit` transforms it with a shared style prompt (deep near-black `#0a0008` background, purple/gold rim lighting, cinematic — this exact palette is the "house style" reused everywhere else AI art appears on a card) → result becomes `editedPhoto`. The "cutout" pose instead runs client-side background removal (`@imgly/background-removal`) with no AI call. Preview flow returns a `data:` URL; only converted to a permanent Vercel Blob URL on final submit (`utils/uploadToBlob.ts`).

**Special-skill icon** (`services/ai/generateSpecialSkillIcon.ts`): no reference photo — pure `images.generate` (text-to-image) wrapping the user's freeform concept in the same style palette, explicitly excluding human figures for an abstract emblem look. Produces one `largeImage` (1024x1024) plus a `sharp`-resized `smallImage` (40x40) from the same generation.

---

## MVP Scope Notes

- **One team only** for MVP — team expansion is V2
- **No DJ logos or label branding** on MVP cards
- **No auth** for initial build
- **QR code** links to `/artist/[id]` — domain TBD, generate with placeholder for now
- **Physical card ordering** — collect postal address on post-generate page
- **Holographic/special edition** — print job, not digital — out of scope
- `/artist/[id]` public profile page — V2
