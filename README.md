# Interface studies

Exploring interaction and aesthetics. Each study is one component, built in
code and kept small enough to stay legible.

The purpose is the isolation. Every study stands alone and no code is shared
between them by design, so a folder can be copied out and go on working
wherever it lands.

## Structure

Each study is a folder named `YYYY-MM-slug`:

```
2026-09-inked-plate-card/
├── ref.png          reference documentation, if there is any
├── notes.md         the decisions the build captures, and why
├── component.html   the markup for the component, and nothing else
├── component.css    self-contained, BEM-namespaced styles
├── demo.html        the page that shows the component off
└── preview.html     one instance, no chrome — the landing page's thumbnail
```

Where a study is inspired by something seen elsewhere, `ref.png` is the
reference it was built from and the credit is the `Inspiration:` line at the
bottom of that folder's `notes.md`. A study built from an original design has
nothing to reference and keeps the template's placeholder.

A seventh file, `component.js`, is allowed where the study depends on the
interaction or where CSS genuinely cannot do the job — three studies have one.
The component still works without it: script enhances, it does not constitute.

A study may also carry `component.react.jsx`, the component as a standalone
React component for an app or a Figma code layer. It is generated from the
three component files by `tools/react/` and never edited by hand — one study
has one so far.

Open `index.html` to browse. Each card opens that folder's `demo.html`.

## License

The code is MIT — see `LICENSE`. Copy a folder out and use it; that is what the
isolation is for.

**The `ref.png` files are not covered by it.** Where one is someone else's
work it belongs to them and is not the author's to license. One is not in the
repo at all: the reference for `2026-09-raster-pulse` carried a whole brand —
a logo, a wordmark and a tagline — and a public repo would have handed all of
it on, so it is kept locally.

The components themselves carry none of it — the copy, the branding and the
photography are deliberately left behind, which is the rule the whole repo is
built on.
