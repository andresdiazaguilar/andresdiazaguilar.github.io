# Personal academic website (Andres Diaz Aguilar)

Single-page academic site for master thesis applications (target: robot learning,
ideally learning-based control). Plain HTML/CSS in `docs/`, no build step, no framework.
See README.md for structure, editing, and publishing steps.

## Conventions (decided with the owner)
- Name spelled without accents: "Andres Diaz Aguilar" (matches the CV).
- On the site, always "ETH Zürich" with the umlaut (the CV PDF keeps "ETH Zurich"; leave it).
- Header: photo (`docs/follow-me.jpg`) with name + tagline overlaid bottom-right; height
  capped so the intro text is visible on a laptop's first screen; square crop on phones.
  No caption under the photo. Don't put it full-bleed.
- Section order: About, Publications, Research, Experience, Education, News, Outside the lab
  (personal bio: where I grew up, languages, hobbies; `id="misc"`). News sits
  low on purpose (too few items to lead with); move it to its own page once it has ~12+ items.
- Sticky section bar at the top (about · publications · research · experience · education · news · outside the lab),
  with a light/dark toggle on the right. Dark is the default for everyone (not system-based);
  a visitor's choice is remembered in their browser.
- Links in running text (About, research descriptions, Experience, News) use `--link`: a
  slightly softened orange in dark mode (accent mixed toward the text colour); in light mode
  links are the full accent `#c2410c` (mixing toward the paper looked washed out, toward the
  text turned brown) with no underline; on hover full orange + underline. Full orange always: the
  contact row under the photo and the paper/code/cite chips. People's names in `.meta` lines
  link to their Google Scholar (or a university profile if none) in the line's grey + underline.
  Author lists (`<div class="authors">`): co-authors grey, own name semibold (600) in text colour.
- Publications: full author lists, own name in `<span class="me">`. Reviewing is a single
  line under the publications, not a sub-section.
- Research entries: "Lab (Prof. head), Institution · supervised by <direct supervisors>",
  2–3 sentence description, outcome tag (`published` / `presented` / `in preparation`), links.
  Only supervisors on project lines; collaborators are credited via papers.
- Link rows (`.links`) are soft filled chips with a small icon, same text size as the outcome
  tags (owner didn't want bigger text). Icon comes from the class: `class="paper"` (also used
  for thesis), `class="code"`, and the cite button. A new link type needs its own icon class.
- Published papers have a "cite" button (BibTeX panel + copy). BibTeX lives once in
  `<template id="bib-<key>">` blocks near the end of index.html; take entries from Crossref
  (`curl -sL -H "Accept: application/x-bibtex" https://doi.org/<doi>`), don't type them by hand.
- Research figures: `docs/img/<name>.webp`, shown as a "figure plate" above the project title
  (full text width, natural height capped at 17rem, white card kept for consistency; owner supplies wide/short images). Text column is 46rem. Figures that arrive as PDFs
  (e.g. PowerPoint exports) must be rendered first (pdf.js in the browser pane worked; no
  pdftoppm/python on this machine).
- Experience: one line per role.
- American spelling in the site's own text (modeling, aging, -ize). Official names keep their
  spelling: paper titles, "PyBaMM Battery Modelling Conference", "Netherlands Organisation for
  Applied Scientific Research (TNO)".
- Owner prefers keeping their own wording; only smooth the flow, don't paraphrase key terms.
- Don't add files (e.g. thesis PDFs) to `docs/` unless asked: everything in `docs/` gets published.

## Status
- Live since Nov 2026 at https://andresdiazaguilar.github.io (public repo
  `andresdiazaguilar/andresdiazaguilar.github.io`, Pages from `main` / `docs`). This folder is
  the git repo; owner commits + pushes with GitHub Desktop. Edits go live ~1 min after a push.
- About text and Research descriptions are now in the owner's own words (Nov 2026).
- Section headings keep the orange "§" (Nov 2026). Alternatives tried and possibly revisited:
  the robot-arm icon (mask of `favicon.svg`, ~1.15em) or an orange "/".
- Candidate microstructure figure (thick block, original vs reconstruction, from the
  follow-up project's Obsidian notes, Meeting 13 image 38) was prepared but not used yet.
- Parked: animated figure in `drafts/scan.js`; previous favicon (LiDAR scan) in
  `drafts/favicon-scan.svg`. Current favicon is a tiny robot arm (`docs/favicon.svg`).

## Preview
`powershell -ExecutionPolicy Bypass -File serve.ps1 -Root docs` → http://localhost:8765
(also configured in `.claude/launch.json` as "site").
