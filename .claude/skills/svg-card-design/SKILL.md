---
name: svg-card-design
description: Use when creating, editing, or debugging the SVG trading-card components in component-library/ (CardFront, CardBack, SkillCardFront, SkillCardBack, and any future card face) or their deck/print/flip integration. Covers card layout math, gradient/clipPath ID collisions, print parity, and AI icon generation prompts. Triggers on requests to add/resize/reposition anything on a card face, add a new card type, wire a card into print, or generate on-brand AI artwork for a card.
---

# SVG Card Design — dj-cards

Hard-won specifics from building the Special Skills feature. Read before touching `component-library/*Card*` or `app/print/**`.

## The card components are plain SVG, not styled-components

`CardFront`, `CardBack`, `SkillCardFront`, `SkillCardBack` are all `<svg viewBox="0 0 350 490">` with every element absolutely positioned by hand-picked x/y numbers — no flex, no grid, no styled-components. `theme.card` (`styles/theme.ts`) is `{ width: 350, height: 490, borderRadius: 12 }`; always derive `W`/`H` from it, never hardcode.

## Every `<defs>` id must be suffixed with `${uid}`

Multiple instances of the same card render on one page at once (the deck grid, print sheets — up to dozens). Every component takes an `instanceId` prop and does:

```ts
const uid = instanceId ? `-${instanceId}` : ""
```

Then every `id` in `<defs>` (gradients, clipPaths, patterns) is `` `some-name${uid}` ``, and every reference is `` url(#some-name${uid}) ``. Skip this and every card on the page silently renders using the *first* instance's gradient/clip — a subtle bug that looks fine for a single card and breaks silently in the deck/print grid.

## Rounded-corner image clipping: use a real `<clipPath>`, not CSS `inset()`

`clip-path: inset(0 round 8px)` as an SVG presentation attribute is unreliable across renderers (works in some live-browser paints, not guaranteed for print/export). Use a proper reusable clipPath instead:

```tsx
<clipPath id={`icon-clip${uid}`} clipPathUnits="objectBoundingBox">
  <rect x={0} y={0} width={1} height={1} rx={0.12} ry={0.12} />
</clipPath>
...
<image ... clipPath={`url(#icon-clip${uid})`} />
```

`objectBoundingBox` units mean one clipPath def works for every instance regardless of that instance's x/y/size — no need to duplicate it per icon.

## Layout math must be verified visually, not just by hand-arithmetic

This codebase's SVG has several *fixed* anchors that aren't obvious from a diff: the header gold divider is hardcoded at `y1={62}`, the QR block is bottom-anchored via `H - 105`, etc. Shifting an earlier section's y-offset to reclaim space (e.g. to make room for bigger icons) can silently collide with one of these fixed lines — exactly what happened when the stats grid got shifted to `y=62`, landing it directly on the header divider. **After any coordinate change, actually render it with real data and screenshot it** (see testing section below) before considering the change done. Reading the JSX and doing the addition in your head is not enough.

## Print parity checklist

Every card face needs to work identically on-screen and in the print flow:
- Accept a `squareCorners?: boolean` prop; when true, `rx=0`/`ry=0` instead of `theme.card.borderRadius`, and skip the screen-only gold outer border (`{!squareCorners && <rect .../>}`).
- Use the exact same `W`/`H` from `theme.card` — never a different size for print.
- Print pages (`app/print/_components/print-page.styles.tsx`) already have generic, dimension-matched styled components (`CardWrap`, `BleedSheet`, `BleedCardWrap`, `CropMarks`, sheet chunking) — reuse them for any new print flow rather than inventing new print CSS. See `app/print/skills/_components/SkillPrintPage.tsx` for a full second print flow built by copying `PrintPage.tsx`'s structure.

## Testing flip-card interactions with the chrome-devtools MCP tools

`FlipPreview` (`component-library/FlipPreview/FlipPreview.tsx`) wraps faces in a `Scene` div that owns the `onClick` flip handler. Two gotchas discovered the hard way:

1. **Click the `Scene` itself (or a descendant, e.g. its `<svg>`), never a parent wrapper.** The DOM shape per card is `<div><div (FlipPreview root)><Scene>...</Scene></div><CardNumber/><HintTap/></div>` — clicking `CardNumber.previousElementSibling` gets you the FlipPreview root, which has no listener; you need `.firstElementChild` (Scene) or something inside it, since click events only bubble *up* to ancestors, never down to children.
2. **Wait ~700ms after the click before screenshotting.** The flip is a 550ms CSS transition; a screenshot taken immediately captures a mid-rotation frame that can still show the old face (or nothing looks visibly different) even though the state genuinely toggled. Read `getComputedStyle(innerDiv).transform` after the wait to confirm the flipped matrix before trusting a screenshot.

## AI icon generation prompt pattern (`services/ai/generateSpecialSkillIcon.ts`)

For on-brand generated artwork (no reference photo needed — pure `client.images.generate`, not `.edit`): wrap the user's freeform concept text in the shared card-aesthetic style block (deep near-black `#0a0008` background, electric purple + gold rim lighting, high contrast, cinematic — the same palette `CardFront`'s portrait prompt uses) and let the concept drive the *scene*. If an abstract emblem/icon look is wanted rather than an illustrated character, say so explicitly ("no human figures, people, faces, or hands") — the model defaults to illustrating a person performing the action otherwise.

## Git worktree hygiene

If you isolate a large change in a git worktree (`Agent` tool's `isolation: "worktree"`, or manual `git worktree add`), **remove it with `git worktree remove <path>`** once merged — don't just leave it or `rm -rf` it. A leftover worktree directory under `.claude/worktrees/` sits inside the repo tree and gets swept into `npm run lint`'s file scan (including its own `.next` build output), producing a wall of bogus errors that look like a real regression.
