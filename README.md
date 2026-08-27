# Car Planner

Static pages for buying a used car in South Africa.

- **`model.html`** — a live finance model. Drag your cash, monthly saving, Uber drain, car price, drive-away costs, interest rate and monthly payment, and see every purchase month's loan, minimum instalment, headroom, payoff period and total cost of credit at once. Compares a personal loan (with credit life at R3 per R1,000 of outstanding balance) against secured vehicle finance side by side.
- **`paydown.html`** — a debt paydown model. Once you have the loan, drag the extra you pay each month (and any lump sum) and watch the interest, the term and the debt-free date move. Breaks the cost of credit into interest, credit life, service fees and initiation, plots the falling balance against the minimum-only case, and lays out a ladder of extra amounts side by side.
- **`kit.html`** — a field checklist. Listing screens, the hill test (Nm ÷ tonne), the mileage test (km ÷ year), questions to ask a dealer, drive-away costs, and what to confirm before signing.
- **`index.html`** — a small landing page linking them.

## No backend

There is no server, database, build step or dependency. Four HTML files with inline CSS and vanilla JavaScript. The only external request is to Google Fonts.

Everything you type is stored in your own browser via `localStorage` and never leaves the device. There is no account and nothing is transmitted anywhere.

## Deploy

### GitHub Pages

1. Push this repo to GitHub.
2. **Settings → Pages → Source: Deploy from a branch → `main` / `root`.**
3. It goes live at `https://<username>.github.io/<repo>/` in a minute or so.

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
