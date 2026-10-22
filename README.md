# Ben — website

Live at **https://07080901.github.io**. Built with Jekyll and published by GitHub Pages.

## Edit the site

The site is **one long page**: hero → Music → Live! → Videos → About → mailing list → copyright. Each section is one Markdown file in **`pages/`**. Open it on GitHub, click the ✏️ pencil, change the text and commit. The site updates in about a minute.

| Section | File | What you edit there |
|---|---|---|
| Top (`/`) | `pages/home.md` | your name, the "Check out my music" button, background picture, scroll text |
| Music (`/music/`) | `pages/music.md` | the section heading. Each release is its own file in `pages/music/` (see below) |
| A release (`/music/stank-face/`) | `pages/music/stank-face.md` | cover, type, date, the story (plain Markdown), `tracks:` and `links:` |
| Live! (`/live/`) | `pages/live.md` | the `shows:` list. Past dates move to "Past gigs" by themselves |
| Videos (`/videos/`) | `pages/videos.md` | the `videos:` list (YouTube IDs) |
| About (`/about/`) | `pages/about.md` | your bio (plain Markdown) and portrait photo |
| Not-found page | `pages/404.md` | text shown for broken links |

`title:` and `subtitle:` in each file are the section's heading. Change the section order with `sections:` in **`_config.yml`**. The same file holds the menu, the social links (shown in that order), the mailing-list form and the intro on/off switch.

### Quick recipes

- **Add a gig:** in `pages/live.md`, copy one `- date:` block, paste it under `shows:` and change it. Keep the two-space indentation.
- **Add a release:** copy a file in `pages/music/` (e.g. `stank-face.md`), rename it and edit it. The file name is the address: `pages/music/night-drive.md` → `/music/night-drive/`. It shows up in the Music section by itself, newest `date:` first. Inside: `tracks:` is the tracklist, `links:` the streaming links (Spotify, Apple Music, YouTube, SoundCloud, Bandcamp, Tidal, Deezer, Amazon Music each get their icon). Every play button in the tracklist jumps down to those links.
- **Add a video:** in `pages/videos.md`, the ID is the part after `watch?v=`. YouTube supplies the thumbnail.
- **Change a picture:** upload it to `assets/img/...` (JPG is fine), then put its path in the page's file, e.g. `hero_image: /assets/img/home/my-photo.jpg`.
- **Mailing list:** paste your provider's form action URL (Mailchimp, Buttondown, Brevo, Formspree…) into `mailing_list.action` in `_config.yml`.

## Folders

```
pages/          ← the pages you edit (Markdown)
pages/music/    ← one file per release (single, EP, album)
_config.yml     ← site-wide settings
assets/img/     ← logo, pictures, favicon, share image
assets/css/  _sass/          ← styles (colours are at the top of _sass/_variables.scss)
assets/js/main.js            ← intro drawing, menu scrolling + URLs, videos
_layouts/  _includes/        ← page templates (you shouldn't need to touch these)
.github/workflows/pages.yml  ← builds & publishes the site
```

## Good to know

- **Intro:** your signature is written in one quick pencil pass, then the screen fades away (about 2 seconds). It plays once per visit, and only when someone lands on `/`. Click or press any key to skip it. The strokes in `_includes/intro.html` were traced from `assets/img/logo/ben.png`, so if you change the logo, either get a new trace or set `intro.enabled: false`. The speed is `DRAW_MS` at the top of `assets/js/main.js`.
- **Menu and addresses:** clicking Music, Live!, Videos or About scrolls smoothly to that section and the address bar changes to `/music/`, `/live/`… It also changes by itself while you scroll, and the matching menu item lights up. The logo takes you back to the top (`/`). Back and forward buttons work, and anyone opening `/live/` directly lands on that section.
- **Section magnet:** scrolling is free, but once you've scrolled about 3 mouse-wheel steps into the next (or previous) section and pause, the page glides to that section's start. Any scroll during the glide cancels it. Tune it with `PULL` (distance) and `IDLE_MS` (pause) in `assets/js/main.js`.
- **Publishing:** in **Settings → Pages**, *Source* must be **GitHub Actions**. The site rebuilds on every commit and once a day, which is what moves past gigs into "Past gigs". GitHub pauses the daily run after 60 days without commits; turn it back on from the **Actions** tab if that happens.
- **Action updates:** Dependabot opens a pull request when an action in the workflow has a new version. Merge it to stay free of warnings.

## Preview on your computer (optional)

```bash
bundle install
bundle exec jekyll serve   # → http://localhost:4000
```
