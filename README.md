# maryamkameli.github.io

Personal academic site. Plain HTML, CSS, and a little JavaScript. No build step, no Jekyll, no dependencies.

```
index.html     all the content
style.css      all the styling (colors and fonts are at the very top)
main.js        theme toggle, mobile menu, news collapse
assets/        your photo, CV, and project thumbnails
```

---

## 1. Put it online

1. On GitHub, create a new **public** repo named exactly `maryamkameli.github.io`. The name has to match your username or Pages will not serve it at the root URL.
2. Upload these files to the root of the repo (drag and drop in the browser works, or `git push`).
3. Go to **Settings → Pages**. Under "Build and deployment", set Source to **Deploy from a branch**, branch `main`, folder `/ (root)`. Save.
4. Wait two or three minutes. Your site is at `https://maryamkameli.github.io/`.

With git:

```bash
git init
git add .
git commit -m "Initial site"
git branch -M main
git remote add origin https://github.com/maryamkameli/maryamkameli.github.io.git
git push -u origin main
```

To preview locally before pushing, open `index.html` in a browser. That is it. If you want a real local server:

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

---

## 2. Fill in the placeholders

Search `index.html` for `EDIT:` to find every spot. The important ones:

| What | Where |
|---|---|
| Your photo | save a square image as `assets/photo.jpg` |
| Your CV | save as `assets/cv.pdf` |
| Paper links | the `<a href="#">` chips in the Publications section |
| Paper dates in News | two items are marked `2026`, set the real months |
| Project thumbnails | `assets/avatars.jpg`, `locomotion.jpg`, `emg.jpg`, `robots.jpg`, `falls.jpg`, `seizure.jpg` |
| Site URL | the `og:url`, `og:image`, and `canonical` tags in `<head>` |
| "Last updated" | bottom of the page, in the footer |

If a photo or thumbnail file is missing the page still renders correctly. The portrait falls back to your initials and empty thumbnail strips collapse, so nothing looks broken while you gather images.

---

## 3. Add a news item

Copy one block, put it at the **top** of `<ul class="news">`, edit the two fields:

```html
<li class="news-item">
  <div class="news-date">Oct 2026</div>
  <div class="news-body">Presented <em>NPR Locomotion</em> at <strong>IEEE ISMAR</strong> in Seoul.</div>
</li>
```

Use `<strong>` for venues and names, `<em>` for paper titles. Only the newest five show by default and the rest sit behind a "Show all news" button. To change that number, edit `NEWS_VISIBLE` at the top of `main.js`.

## 4. Add a publication

Copy one block into `<ol class="pubs">` in the right chronological spot:

```html
<li class="pub">
  <div class="pub-year">2027</div>
  <div class="pub-body">
    <h3 class="pub-title">Your Paper Title</h3>
    <p class="pub-authors"><strong>Maryam Kameli</strong>, Coauthor Name</p>
    <p class="pub-venue">Full Venue Name <span class="badge">Short Name</span></p>
    <p class="pub-links">
      <a href="https://...">Paper</a>
      <a href="https://doi.org/...">DOI</a>
      <a href="https://github.com/...">Code</a>
    </p>
  </div>
</li>
```

Delete any link chip you do not have. Keep your own name in `<strong>` so it stands out in the author list.

---

## 5. Change the look

Everything visual is in the `:root` block at the top of `style.css`.

```css
--accent:  #4239b8;   /* links, hover states, badges */
--paper:   #fcfbf9;   /* page background */
--ink:     #16181d;   /* body text */
```

Change `--accent` and the whole site shifts. There is a matching dark palette right below it, so edit both if you change colors. Dark mode follows the visitor's system setting and the toggle in the corner overrides it.

Fonts are Newsreader for headings and Inter for body, loaded from Google Fonts in `<head>`. Swap the `--font-display` and `--font-body` variables to change them.

---

## 6. Custom domain, later

If you buy a domain, add a file named `CNAME` containing just the domain (`maryamkameli.com`), then point a CNAME DNS record at `maryamkameli.github.io`. GitHub's Pages settings walk through it.
