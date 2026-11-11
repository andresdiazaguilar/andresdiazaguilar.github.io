# Personal website

Plain HTML + CSS, no framework, no build step. Everything that gets published is in `docs/`.

```
docs/            <- the website (this folder is what GitHub Pages publishes)
  index.html     all content
  style.css      colours (top of file), typography, layout
  follow-me.jpg  header photo
  favicon.svg
  cv.pdf         replace this file whenever the CV changes (keep the name)
  .nojekyll      tells GitHub Pages to serve files as-is
drafts/
  scan.js        parked: animated "perceive + plan" figure (not published)
serve.ps1        local preview server
```

## Editing

- **Add a paper / project / job:** copy an `<article class="entry">…</article>` block in
  `docs/index.html` and edit it. Wrap your own name in `<span class="me">…</span>`.
- **Outcome tags** under a project: `<div class="venue"><span class="tag mono">published</span> …</div>`.
- **News item:** copy an `<li>` in the News list (newest first).
- **Update the CV:** overwrite `docs/cv.pdf`, same name, so the link keeps working.
- **Accent colour:** `--accent` at the top of `docs/style.css` (light and dark).
- Update the "Updated …" date in the footer.

Preview locally:

```bash
powershell -ExecutionPolicy Bypass -File serve.ps1 -Root docs
```

then open http://localhost:8765.

## Saving to GitHub (private, not published)

1. Install GitHub Desktop (desktop.github.com) and sign in.
2. File → Add local repository → choose this folder → "create a repository" when asked.
3. Name it `<your-username>.github.io` (e.g. `andresdiazaguilar.github.io`).
4. "Publish repository" → keep **"Keep this code private"** ticked.

From then on: edit files, then in GitHub Desktop write a short summary → "Commit to main" → "Push origin".

## Publishing (when ready)

GitHub Pages is free for **public** repositories (private ones need a paid plan).

1. On github.com, open the repo → Settings → General → Danger Zone → Change visibility → Public.
2. Settings → Pages → Source: "Deploy from a branch", branch `main`, folder **`/docs`** → Save.
3. After a minute or two the site is live at `https://<your-username>.github.io`.

Every later push to `main` updates the live site automatically.

### Custom domain (optional, recommended)

Buy e.g. `andresdiazaguilar.com` (Cloudflare Registrar or Porkbun, ~10 USD/yr). In the repo:
Settings → Pages → Custom domain, add the DNS records GitHub shows, tick "Enforce HTTPS".
Put that URL on your CV; if you ever change hosts, the link stays the same.

## When to outgrow this

If you end up with many publications or want a blog, move to a static-site generator
(Astro or Hugo) with publications in a data file. Keep the same CSS and domain.
