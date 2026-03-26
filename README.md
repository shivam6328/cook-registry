# Cook Registry

A small frontend prototype for a **private chef marketplace**.

- Cooks can **sign up for work** (they appear as `Available`).
- Customers can **request a cook** (the app matches them with the next available cook).
- Existing active matches can be marked **complete**, which returns the cook to the available pool.

## Matching logic (prototype)

1. The app takes all cooks where `status === "available"`.
2. If a customer provides a `cuisineHint`, the first available cook whose `specialty` includes that hint (case-insensitive) is selected.
3. Otherwise, the first available cook in the list is selected.

Everything is stored locally in the browser using `localStorage` (so it works for demos, not for real multi-user systems).

## Live site

https://shivam6328.github.io/cook-registry/

## How to run locally

```bash
cd cook-registry
npm install
npm run dev
```

Then open the URL Vite prints (usually `http://localhost:5173/`).

## GitHub Pages deployment

This repo uses a GitHub Actions workflow at `.github/workflows/pages.yml`.

- Pushes to `main` trigger the workflow.
- The workflow builds the app and deploys the `dist/` folder to GitHub Pages.

## Notes / next steps

For a production system you would typically replace `localStorage` with a backend (database + auth) and implement real-time matching, notifications, and audit trails.
