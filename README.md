# Ben's Guitarist Website  
Built with Jekyll and published on GitHub Pages.

## Website specs
The site is just a **single long page**, with each section declared in a Markdown file inside [**`pages/`**](/pages).

| Section | File | What you edit there |
|---|---|---|
| Top (`/`) | `pages/home.md` | your name, the "Check out my music" button, background picture, scroll text |
| Music (`/music`) | `pages/music.md` | the section heading. Each release is its own file in `pages/music/` (see below) |
| A release (`/music/stank-face`) | `pages/music/stank-face.md` | cover, type, date, the story (plain Markdown), `tracks:` and `links:` |
| Live! (`/live`) | `pages/live.md` | the `shows:` list. Past dates move to "Past gigs" by themselves |
| Videos (`/videos`) | `pages/videos.md` | the `videos:` list (YouTube IDs) |
| About (`/about`) | `pages/about.md` | your bio (plain Markdown) and portrait photo |
| Not-found page | `pages/404.md` | text shown for broken links |

`title:` and `subtitle:` in each file are the section's heading. Change the section order with `sections:` in **`_config.yml`**. The same file holds the menu, the social links (shown in that order), the mailing-list form and the intro on/off switch.

### Quick edits
- **Add a gig:** in `pages/live.md`, copy one `- date:` block, paste it under `shows:` and change it. Dates are day/month/year, e.g. `date: 21/11/2026`. Keep the two-space indentation.
- **Add a release:** copy a file in `pages/music/` (e.g. `stank-face.md`), rename it and edit it. The file name is the address: `pages/music/night-drive.md` → `/music/night-drive`. It shows up in the Music section by itself, newest `date:` first. Inside: `tracks:` is the tracklist, `links:` the streaming links (Spotify, Apple Music, YouTube, SoundCloud, Bandcamp, Tidal, Deezer, Amazon Music each get their icon). Every play button in the tracklist jumps down to those links. The card in the Music section takes its links from the same `links:` list (first 3), so each URL is written once; add `card_links:` to that file to pick others by name or add a card-only link.
- **Add a video:** in `pages/videos.md`, the ID is the part after `watch?v=`. YouTube supplies the thumbnail.
- **Change a picture:** upload it to `assets/img/...` (JPG is fine), then put its path in the page's file, e.g. `hero_image: /assets/img/home/my-photo.jpg`.
- **Mailing list:** paste your provider's form action URL (Mailchimp, Buttondown, Brevo, Formspree…) into `mailing_list.action` in `_config.yml`.

### License
Used this repo as a starting point: [*jekyll-theme-console*](https://github.com/b2a3e8/jekyll-theme-console)*,* which is [MIT Licensed](https://github.com/b2a3e8/jekyll-theme-console/blob/master/LICENSE.txt). All rights reserved regarding its original files.  
  
Concerning the current repository: *(C) 2026 Andrea Benini - [MIT License](/LICENSE).*
