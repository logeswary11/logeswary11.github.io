# Logeswary — personal website

Static HTML, CSS and JavaScript, ready for GitHub Pages. No npm install or frontend build framework is required.

## Publish

1. Extract this ZIP and put its **contents** at the root of a GitHub repository. `index.html` must be at the repository root. Include the `.github/workflows/pages.yml` file; Finder hides folders beginning with a dot (press Command + Shift + . to reveal them). GitHub Desktop or git will include it.
2. Use a `main` branch. If your default branch has a different name, change `branches: [main]` in the workflow.
3. In GitHub, open **Settings → Pages → Build and deployment → Source → GitHub Actions**.
4. Open **Actions → Publish site and sync Beehiiv → Run workflow**. Subsequent pushes to `main` deploy automatically.
5. If using a custom domain, enter your own domain in **Settings → Pages → Custom domain** and follow GitHub's DNS instructions. No domain has been invented in this package.

Upload the entire folder contents, not just the HTML files: each page uses local CSS and JavaScript. The workflow publishes only the four pages, public assets and the generated article feed; setup scripts and credentials are not published.

## Automatic Beehiiv articles

**The sync is prepared, but is not connected until you add these two GitHub secrets.**

In the repository, open **Settings → Secrets and variables → Actions → New repository secret**:

| Secret name | Value |
| --- | --- |
| `BEEHIIV_API_KEY` | Your Beehiiv API key with permission to read your publication's posts |
| `BEEHIIV_PUBLICATION_ID` | Your Beehiiv publication ID beginning with `pub_` |

Get these from your Beehiiv account's API settings. Do not put the API key in HTML, JavaScript, this README or a public commit.

Tag posts with **Beyond the Pitch Deck** in Beehiiv's **content tags**. Publish them to the web, or to both email and web, with feed visibility enabled. Subscriber tags do not select articles.

The workflow runs at minutes 17 and 47 each hour. After adding the secrets, run it manually once. A successful run fetches every page of matching posts and redeploys the site. New tagged posts then appear on the next successful run. GitHub schedules can be delayed; this is a periodic sync, not an instant webhook. Scheduled workflows in inactive public repositories can be disabled by GitHub after 60 days without repository activity; check Actions if updates stop.

The seven existing curated articles remain in `data/writings-seed.json`. New automatic additions must carry the requested tag. Drafts, future scheduled posts, hidden posts, email-only posts and Daily Briefs are excluded. Removing a tag removes an automatically imported post on the next sync unless it is also in the curated seed list.

If Beehiiv is unavailable or the credentials are invalid, the workflow fails before deployment and the existing live site stays published. Before initial setup, manual/push deployments can use the bundled article list; scheduled runs clearly report missing credentials. Open pages refresh the published JSON every five minutes.

## Editing

| Location | Purpose |
| --- | --- |
| `index.html` | Bio hero, About carousel and testimonials |
| `work.html` | Work hero, services and FAQ |
| `library.html` | Projects, writing archive and portfolio popup |
| `venture-scout.html` | Venture Scout page |
| `assets/css/` | Page styles and shared theme/layout styles |
| `assets/js/` | Interactions and runtime configuration |
| `data/writings-seed.json` | Curated articles retained alongside the tagged feed |
| `data/writings.json` | Generated public article feed |
| `scripts/` | Beehiiv synchronisation and public-file packaging |
| `.github/workflows/pages.yml` | Scheduled sync and Pages deployment |

`assets/js/writings-data.js` is generated alongside the JSON feed so the saved archive works when the site is opened locally. Do not edit generated files to add new posts; use Beehiiv tags or the seed list.

### Payments

Paste real Stripe Payment Links into `assets/js/work-services-config.js`:

- `paymentLinks.fundraisingOS` → Fundraising OS
- `paymentLinks.deckReview` → Pitch Deck Review

Until then, purchase buttons show the existing checkout notice. Display prices are $299 and $199. Stripe controls the actual charge independently. Existing booking destinations are preserved.

## Preview and checks

For a local preview, run `python3 -m http.server 8000` from this folder and visit `http://localhost:8000`.

Source, asset references, JavaScript syntax, and Beehiiv filtering/pagination were checked. The test browser could not be installed in the editing environment, so responsive visual rendering and the live Beehiiv connection are not verified. CSS animations respect reduced-motion preferences.

## References

- Beehiiv post API and content tags: https://developers.beehiiv.com/api-reference/posts/index
- API setup: https://developers.beehiiv.com/welcome/getting-started
- GitHub Pages workflows: https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages
- Scheduled workflows: https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#schedule

Third-party component attribution is in `assets/THIRD-PARTY.txt`. The runner and satellite are original lightweight vector graphics, with no character or graphics library dependency.

The About carousel uses its previous layout, without the cosmos and satellite additions. Other site updates are preserved.
