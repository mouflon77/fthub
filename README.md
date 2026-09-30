# Frontier Tech Hub

Marketing site for [frontiertechhub.com](https://frontiertechhub.com). A single static page —
hero, About, Work, Contact — sitting over a real-time glass garden that responds to the cursor.

No CMS, no auth, no database, no contact form. All copy and links live in `lib/site.ts`.

```bash
npm install
npm run dev        # http://localhost:3000
npm run build
npm run typecheck
npm run lint
npm run shoot      # headless screenshots + shader error check (needs a running server)
```

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · three.js · React Three Fiber · postprocessing.
No CSS framework and no animation library: the styling is one hand-written sheet of design
tokens and glass recipes, and the scroll reveals are an `IntersectionObserver`.

## How the garden works

Everything you see growing is generated in the browser at load and drawn in **three draw calls** —
one merged geometry for all the flowers, one for the grass, one point cloud for the fireflies.
Per-plant data (base position, seed, tint, bend weight) rides on vertex attributes so all the
animation happens on the GPU.

| Concern | Where | Note |
| --- | --- | --- |
| Wind field | `lib/glsl/wind.ts` | Ambient breeze, cursor swirl, click gust rings |
| Environment | `lib/glsl/sky.ts` | One analytic sky, shared by the backdrop, the haze and the glass |
| Glass | `lib/glsl/glass.ts` | Fresnel, absorption, iridescence, transmission, speculars |
| Flower geometry | `lib/garden/flowers.ts` | Parametric petals, tapered stems, leaves, stamens |
| Shared uniforms | `lib/garden/state.ts` | One object by reference, so the whole scene agrees |

Three details worth knowing before you change anything:

- **Refraction with no render target.** The glass shader evaluates `ftSky()` along the refracted
  and reflected rays. Because the backdrop is drawn with that same function, petals really do bend
  the environment behind them — without a transmission pass or a cubemap.
- **The wind is one function.** Flowers, grass, fireflies and the ripples on the ground all call
  `ftWindAt()`, which is why the air reads as a single moving thing. Its fluid feel comes from
  blending two differently lagged springs of the cursor velocity, giving overshoot and settle
  rather than a rigid follow.
- **Blend order is baked.** Flowers are alpha blended in one draw call with depth writes off, so
  `flowerSpecs()` sorts plants back to front at build time. That is correct only because the camera
  drifts rather than orbits. If you ever let the camera swing around, this needs revisiting.

## Performance and accessibility

`lib/garden/quality.ts` picks a tier from viewport width, core count and pointer type, scaling
vertex counts, device pixel ratio and antialiasing. Bloom stays on at every tier because without it
the glass reads as flat plastic.

`prefers-reduced-motion` drops the wind to a near standstill and disables CSS transitions; the
scene still renders so the page does not lose its identity. The garden canvas is `aria-hidden`, the
page has a skip link and landmarks, and every control has a visible focus ring.

## Editing content

- **Copy, links, project cards, socials:** `lib/site.ts`
- **Product screenshots:** `public/work/*.jpg` (refresh with `node scripts/capture-work.mjs`)
- **Brand colours, glass recipe, type scale:** `:root` in `app/globals.css`
- **Scene composition:** `ZONES` in `lib/garden/flowers.ts` places flowers and deliberately keeps
  a clear corridor up the middle of the frame for the headline
- **Logo:** `components/ui/Logo.tsx` is the mark rebuilt as vector so it can be lit;
  `components/garden/Emblem.tsx` is the same mark extruded as glass in the scene

LinkedIn and X for the studio live in `contact.links`. Product socials live on each project in
`work.projects`. Drop in extra handles or replacement screenshots there.
