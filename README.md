# Ben — artist website template (Jekyll)

A Jekyll site for **Andrea "Ben" Benini** with an animated intro (the name is hand-drawn, a guitar string snaps across, then the curtain lifts), a full-screen hero slideshow, news, tour dates, videos, music, timeline and shop. It started from [jekyll-theme-console](https://github.com/b2a3e8/jekyll-theme-console) (MIT, see `LICENSE.txt`), was stripped down and rebuilt. All images are placeholders labelled **REPLACE**!

## Publish on GitHub Pages (no install needed)

1. Create a new repository on GitHub.
   - Name it `YOUR-USERNAME.github.io` → the site is at `https://YOUR-USERNAME.github.io`.
   - Any other name (e.g. `ben`) → the site is at `https://YOUR-USERNAME.github.io/ben`.
2. Open `_config.yml` and set:
   - `url: "https://YOUR-USERNAME.github.io"`
   - `baseurl: ""` for a `username.github.io` repo, or `baseurl: "/ben"` (your repo name) for anything else.
3. Upload every file and folder from this zip to the repo (on GitHub: **Add file → Upload files**, drag the contents in, commit).
4. In the repo, go to **Settings → Pages → Build and deployment** and set **Source** to **GitHub Actions**. The workflow in `.github/workflows/pages.yml` then builds and deploys the site on every push, and once a day so past tour dates move to "Past shows". You can also start it by hand from the **Actions** tab with **Run workflow**.
5. Wait 1–2 minutes and the site is live.

**Cloudflare Pages:** connect the repo and set the framework preset to Jekyll. The build command is `jekyll build` and the output folder is `_site`.

## Where to change things

| What | File |
|---|---|
| Name, menu, socials, mailing list, home headings, intro on/off | `_config.yml` |
| Hero slideshow | `_data/banners.yml` |
| Tour dates (past dates move to "Past shows" automatically) | `_data/tour.yml` |
| Videos (YouTube IDs) | `_data/videos.yml` |
| Releases on the Music page | `_data/releases.yml` |
| Shop teaser items | `_data/shop.yml` |
| Timeline eras and events | `_data/timeline.yml` |
| News posts | `_posts/YYYY-MM-DD-title.md` |
| About, Terms, Privacy text | `about.md`, `terms.md`, `privacy.md` |
| Colours and fonts | `_sass/_variables.scss` |
| Intro timing and look | `_sass/_intro.scss` (the sequence is listed at the top) |
| Images | `assets/img/...` (replace the files, or point the yml files at new ones) |

### Tips
- **Images:** JPG or WebP works fine. Hero images should be about 1920×1080, and square images (news, covers, shop) about 1000×1000. When you change a file extension, update the path in the matching `.yml` file.
- **YouTube ID:** in `https://www.youtube.com/watch?v=abc123XYZ`, the ID is `abc123XYZ`.
- **Mailing list:** paste your provider's form action URL (Mailchimp, Buttondown, Brevo, Formspree…) into `mailing_list.action`.
- **Logo image:** set `logo_image: /assets/img/logo.svg` to use an image instead of the text logo.
- **Intro:** it plays once per browser session by default. Set `intro.once_per_session: false` to play it on every home-page visit, or `intro.enabled: false` to turn it off. Visitors can skip it with a click or keypress, and it's skipped automatically for people who prefer reduced motion.
- **Tour list:** the daily rebuild moves past dates into "Past shows" automatically. GitHub pauses scheduled runs after 60 days with no commits; re-enable the workflow from the Actions tab if that happens.
- **Share image:** `assets/img/og-image.jpg` (1200×630) is what WhatsApp, Instagram and others show when the site is shared.
- **Fonts** are self-hosted in `assets/fonts` (no Google requests). To change a font, add its `.woff2` files there and edit `_sass/_fonts.scss` and `_sass/_variables.scss`.
- **Action updates:** Dependabot opens a pull request when a newer version of an action in the workflow comes out. Merge it to stay warning-free.

## Preview on your computer (optional)

```bash
bundle install
bundle exec jekyll serve
# open http://localhost:4000
```
