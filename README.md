# Car Planner

Static pages for buying a used car in South Africa.

- **`model.html`** — a live finance model. Drag your cash, monthly saving, Uber drain, car price, drive-away costs, interest rate and monthly payment, and see every purchase month's loan, minimum instalment, headroom, payoff period and total cost of credit at once. Compares a personal loan (with credit life at R3 per R1,000 of outstanding balance) against secured vehicle finance side by side.
- **`paydown.html`** — a debt paydown model. Once you have the loan, drag the extra you pay each month (and any lump sum) and watch the interest, the term and the debt-free date move. Breaks the cost of credit into interest, credit life, service fees and initiation, plots the falling balance against the minimum-only case, and lays out a ladder of extra amounts side by side.
- **`kit.html`** — a field checklist. Listing screens, the hill test (Nm ÷ tonne), the mileage test (km ÷ year), questions to ask a dealer, drive-away costs, and what to confirm before signing.
- **`index.html`** — a small landing page linking them.

- **`baleno.html`** — the Monday viewing page for one specific car: tickable checklist, dealer questions with a note box under each, per-section notes, five live calculators (monthly cost and payoff with named scenarios, fee check, cash to drive away, km per year, hill test), copy-ready messages, and a "Copy all my notes" backup button.

## Backend

There is no build step or dependency. Five HTML files with inline CSS and vanilla JavaScript. The external requests are Google Fonts and, only on `baleno.html` and only if you turn sync on, Supabase.

`model.html`, `paydown.html` and `kit.html` store everything in your own browser via `localStorage` and transmit nothing.

`baleno.html` saves to `localStorage` first. If you enter a sync passphrase (8+ characters, same one on each device) it also syncs to the `say-yes-to-29` Supabase project so notes survive a cleared browser and follow you between phone and laptop. The data lives in one table, `public.carplanner_state`, which has row-level security on and no direct access; the page can only reach it through two functions, `carplanner_get` and `carplanner_put`, which look the row up by the SHA-256 hash of your passphrase. Anyone without the passphrase cannot read or write your notes. The publishable key in the page is meant to be public. There is no account system.

## Deploy

### GitHub Pages

Already wired up. `.github/workflows/pages.yml` publishes the repo root on every
push to `main`, and turns Pages on by itself the first time it runs — there is
nothing to click. The site is live at
<https://madele-theron.github.io/car-planner/>.

To deploy a fork instead, push it to GitHub and the same workflow does the rest.
You can also run it by hand from **Actions → Deploy to GitHub Pages → Run
workflow**.

### Vercel

1. Import the repo at [vercel.com/new](https://vercel.com/new).
2. Framework preset: **Other**. No build command, no output directory.
3. Deploy. Every push to `main` redeploys automatically.

Netlify and Cloudflare Pages work the same way — no build command, publish the repo root.

## Add it to your phone

Open the deployed URL, then **Share → Add to Home Screen**. It opens full-screen like an app and works from the icon.

## Changing the defaults

The starting values live in one place near the top of the script in each page. In `model.html`:

```js
var DEFAULTS = { cash:85000, contrib:6000, raid:2000, price:190000, setup:14000,
                 rate:13.4, pay:3000, salary:30000, prod:"loan", sel:3 };
```

And in `paydown.html`:

```js
var DEFAULTS = { loan:130000, rate:13.4, term:72, extra:500, lump:0, lumpat:6, prod:"loan" };
```

`paydown.html` also has a **Pull my numbers from the Money Model** button, which appears only when you have used `model.html` on that device. It reads the loan, rate and loan type the model works out for the purchase month you selected there.

Anything you change in the browser is remembered on that device, so you only need to edit this if you want different values on a fresh device. **Reset to defaults** restores them.

## A note on the numbers

The instalment model is calibrated against real South African bank estimates at 13.40% over 72 months, matching to within R1 across R100,000, R120,000 and R130,000 loans. It accounts for:

- capital and interest over the contracted term
- the monthly service fee (R69)
- the initiation fee (R1,207.50), added to the loan
- credit life at R3 per R1,000 of outstanding balance, which falls as the balance does

Because credit life scales with the balance, it behaves exactly like extra interest — roughly 3.6% a year on top of the quoted rate. That is why the two lines on the chart diverge, and why the toggle matters.

Rates, fees and caps change. Confirm the current prime rate, the NCA initiation fee cap and provincial registration costs before relying on any of it.
