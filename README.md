This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Enquiry emails

The reservation form sends each request by email from a Gmail account using [Nodemailer](https://nodemailer.com) (free, roughly 500 emails/day). The recipients are set in `ENQUIRY_TO` in `src/app/actions.ts`.

1. Turn on 2-Step Verification for the sending Google account, then create an [App Password](https://myaccount.google.com/apppasswords).
2. Add the credentials to `.env.local` locally, and to your host's environment variables in production:

   ```bash
   GMAIL_USER=gm.vpolishchuk@gmail.com
   GMAIL_APP_PASSWORD=abcdefghijklmnop
   ```

## Seasonal prices (Google Sheet)

The owner edits prices in a Google Sheet; the site reads it as CSV and refreshes within about 5 minutes, with no deploy.

- Columns (first row): `start`, `end`, `regular price`, `discounted price`, `description`, `min nights`. `end` is the first day that is **not** in the season. If `discounted price` is filled in (and lower than `regular price`), the table shows the regular price crossed out, the discounted price next to it, and `description` as a tooltip; quotes use the discounted price. Leave `discounted price` empty for no discount (`description` is then not shown).
- Format `start`, `end` and the price columns as **Plain text** so dates stay `YYYY-MM-DD` and prices keep a `.` decimal.
- Set `RATES_SHEET_URL` (locally in `.env.local`, and in the host's environment variables) to `https://docs.google.com/spreadsheets/d/<SHEET_ID>/export?format=csv&gid=<TAB_GID>`. Share the sheet as "Anyone with the link: Viewer" and keep edit access limited to the owner.
- After changing `.env.local`, restart `npm run dev`; the server only reads it at startup.
- If the sheet is unreachable or a row is invalid (bad date, overlapping seasons, ...), the site logs the problem and uses the fallback list in `src/lib/content.ts`.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
