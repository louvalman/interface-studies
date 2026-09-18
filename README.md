# Interface studies

Exploring interaction and aesthetics. Each study is one component, built in
code and kept small enough to stay legible. Some start from
an interface seen elsewhere and keep its construction rather than its content;
others are built from scratch against an original Figma design.

The purpose is the isolation. Every study stands alone and no code is shared
between them by design, so a folder can be copied out and go on working
wherever it lands.

## Structure

Each study is a folder named `YYYY-MM-slug`:

```
2026-09-brutalist-price-card/
├── ref.png          the reference image: a source screenshot, or a Figma export
├── notes.md         the decisions the build captures, and why
├── component.html   the markup for the component, and nothing else
├── component.css    self-contained, BEM-namespaced styles
├── demo.html        the page that shows the component off
└── preview.html     one instance, no chrome — the landing page's thumbnail
```

A seventh file, `component.js`, is allowed where the study depends on the
interaction or where CSS genuinely cannot do the job — three studies have one.
The component still works without it: script enhances, it does not constitute.

## Adding a study

1. Copy `_template/` to a new folder named `YYYY-MM-slug`.
2. Add `ref.png` — a screenshot of the source, or an export of the Figma frame
   the component was built from. A study built from an original design has
   nothing to reference and keeps the template's placeholder; two of them do.
3. Fill in `notes.md`: `type:` on the first line, then a short paragraph on what
   the component is, then the specific decisions the build captures. The
   `Inspiration:` line — a URL, or a note that the design is original — is the
   **last** line of the file, not the first. Where a study started is a
   footnote, not its subject.
4. Build `component.html` and `component.css`, using `demo.html` to develop and
   review the states.
5. Copy the component markup into `preview.html` and wire up its message
   handler, so the index can show the live component rather than `ref.png`.
   Keep the two in step by hand; there is no build step.
6. Render `notes.md` into `demo.html`'s `Decisions` block, and give the page
   an `<h1>`.
7. Add an `<article class="piece">` block to `index.html`, with a `data-date`
   so the rail can sort it.
8. Add the card's Danish strings to the `COPY` table in `index.js`. Without
   them the card stays English when the page is switched.

Open `index.html` to browse. Each card opens that folder's `demo.html`.

The rules for what belongs in each file live in `CLAUDE.md`.

## Working in a clone

The repo enforces its own git rules, and the enforcement needs one line per
clone:

```
git config core.hooksPath .githooks
```

`.git/hooks`, where git actually looks, lives inside `.git` and is never
cloned — so a hook written there reaches no other machine. The hooks are a
tracked directory instead, and that setting is what points git at it. Without
it the files sit there doing nothing.

`.githooks/pre-commit` refuses a commit whose author or committer address is
not the repo's, and warns on a branch named after a tool. `.githooks/commit-msg`
refuses an attribution trailer, a link to a working session, and a
generated-with line. Every one of those is something that had to be stripped
out of this history by a rewrite once, which is why they are checked rather
than merely written down — the rules are in `CLAUDE.md`, and the file could not
enforce itself.

Claude Code sessions set both the identity and the hooks path themselves, from
`.claude/`. A clone used from a terminal sets them by hand:

```
git config user.name  "Louis Dyrhauge"
git config user.email "94385943+louvalman@users.noreply.github.com"
```

## License

The code is MIT — see `LICENSE`. Copy a folder out and use it; that is what the
isolation is for.

**The `ref.png` files are not covered by it.** Where a study started from an
interface seen elsewhere, its reference image is someone else's work, kept in
the folder as the record of what the build was based on and credited on that
study's `Inspiration:` line. Those images belong to their respective owners and
are not the author's to license. One is not in the repo at all: the reference
for `2026-09-raster-pulse` carried a whole brand — a logo, a wordmark and a
tagline — and a public repo would have handed all of it on, so it is kept
locally and the `Inspiration:` line does the work instead.

The components themselves carry none of it — the copy, the branding and the
photography are deliberately left behind, which is the rule the whole repo is
built on.
