# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Two readers in equal measure, and neither outranks the other.

- **People lifting a technique.** Designers and design engineers who come
  for one decision — a border treatment, a hover behaviour, a shader — and
  want to see it working, read why it is the way it is, and take the folder
  or the Figma component with them.
- **People reading it as a portfolio.** Not the primary purpose today, but
  the site may later serve as a portfolio piece, so the craft of the index
  and each demo page is itself on show.

## Product Purpose

An open notebook of interaction and aesthetics: one component per study,
its decisions written down, built in Figma and code, each folder standing on
its own.

Success is two things, of roughly equal weight:

- **Studies get opened** — a reader goes past the thumbnail into a
  `demo.html`, to see the component and the study in full and take what they
  came for: a technique, an idea, inspiration.
- **Figma file engagement** — duplicates and likes on the Community listing
  (https://www.figma.com/community/file/1683607518896928224/interface-studies),
  which are counted there and nowhere else.

## Positioning

A notebook rather than a library or a gallery. The study is the product: the
design and the component, in code and in Figma. What a neighbouring component
collection could not truthfully claim: each study exists as both code and a
matching Figma page, is a folder that keeps working when copied out alone — no
shared code, no dependencies, no build step — and writes down the decisions
behind it (`notes.md`, rendered on its demo page). The decisions back the work
up and show the ability to make them; they are not the product, and reading
them is not a goal in itself.

## Operating Context

- Read at `interface-studies.pages.dev` or opened locally over `file://`,
  which rules out fetch, shared storage and any build step.
- The index is a rail of live component previews; a card runs in place,
  opens a full-size quick look with its variants, or links to the study's
  demo page.
- Each study has a companion page in the Figma Community file, laid out in
  the same four chapters on every page.
- Bilingual, English and Danish; light and dark themes. Both choices travel
  in links between the index and demo pages.

## Capabilities and Constraints

- Plain HTML, CSS and JS. No framework and no dependencies in anything a page
  loads. A study may carry a generated React adapter (`component.react.jsx`),
  which is committed output rather than source.
- Study folders are independent. Never extract shared styles, tokens or
  scripts across them; duplication is intentional.
- The index (`index.html`, `index.css`, `index.js`) is site chrome with its
  own visual system and never reaches into a study's classes.
- Each study sets its own visual world. There is no single design system that
  spans the studies; the index's design system is the index's alone.
- `CLAUDE.md` is the authoritative, detailed rulebook for folder structure,
  the preview message contract, themes, motion and git. This file does not
  restate it.

## Brand Commitments

- Name: Interface Studies. Author byline: louval (Louis Dyrhauge).
- Masthead line: "Exploring interaction and aesthetics."
- Voice: declarative and precise, reasoning stated alongside the decision,
  measured numbers over adjectives. No disclaimers arguing with charges
  nobody made.
- Where a study took something from someone else's work, it keeps the
  technique and leaves the copy, logo, product name and photography behind.
  Provenance lives in the `Inspiration:` line at the end of `notes.md`.

## Evidence on Hand

- Eight studies (`2026-09-*` folders), each with `notes.md`, a demo page and a
  live preview.
- The Figma Community file linked above; `og.png` social card rendered from
  `og.html`.
- No testimonials, usage figures, download counts or press. Do not invent any.

## Product Principles

1. **The study is the product.** The component and its design lead every
   surface; the decisions are there for whoever wants the why, and back the
   work up rather than stand in front of it.
2. **Isolation is the promise.** Anything that makes one folder depend on
   another, or on the index, breaks the thing the site claims.
3. **Two media, one study.** Code and Figma are equal halves; each should
   point to the other.
4. **Show the live thing.** The index shows running components, not pictures
   of them.
5. **Measured, not asserted.** Claims about contrast, performance or motion
   are backed by a measurement or not made.

## Accessibility & Inclusion

- WCAG 2.2 AA in both themes: 4.5:1 text, 3:1 large text and meaningful
  graphics. Muted text below 4.5:1 only under the documented conditions in
  `CLAUDE.md`, never below 3:1, and recorded in that study's `notes.md`.
- Works at 320px with no horizontal scroll.
- Nothing is reachable only by hover; touch has an equivalent.
- Reduced motion is honoured: nothing moves by itself unasked.
