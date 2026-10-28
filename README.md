# Meridian Recruitment: website

Next.js (App Router), TypeScript, Tailwind CSS v4, Motion. No database and no separate backend:
the interest form is a Next.js Server Action that emails the enquiry to the right inbox.

## Run it

```bash
npm install
cp .env.example .env.local      # then fill in the values
npm run dev                     # http://localhost:3000
```

With no email settings, submissions are printed to the terminal in development, so you can test the form straight away.
In production, a missing email setup shows the visitor an error (and logs it). It never pretends a lead was delivered.

## Email routing

| Setting | Meaning |
| --- | --- |
| `EMPLOYER_INBOX` | Where "I'm hiring" enquiries go (comma-separate for several) |
| `CANDIDATE_INBOX` | Where "I'm looking for work" enquiries go |
| `RESEND_API_KEY`, `MAIL_FROM` | Email provider (Resend). The sender domain must be verified |

To use AWS SES instead of Resend, replace the `fetch` call in `src/lib/email.ts`. Nothing else changes.

## Deploy

Vercel works with zero config. Add the environment variables in the project settings.
AWS Amplify Hosting also supports Next.js if the client wants everything in AWS (use the Sydney region).

## Where to edit things

- `src/lib/site.ts`: brand details, industries, the five checks, pricing, response-time promise
- `src/app/globals.css`: colour and type tokens
- `src/components/`: page sections
- `src/app/*/page.tsx`: pages and their SEO metadata

## Confirm with the client before launch (marked CONFIRM in `site.ts`)

1. Real enquiries email address, optional phone, legal entity name and ABN (for the privacy policy)
2. The "reply within one business day" promise
3. Published prices, GST wording, and whether fees charged to job seekers are permitted in each state
4. Privacy policy wording (this is a plain-language draft and needs a proper review)
5. Domain, then set `NEXT_PUBLIC_SITE_URL`

## Later: adding a database

When you want to keep submissions, write them to DynamoDB in `src/app/get-started/actions.ts` before or alongside sending the email.
For simple lead capture one table keyed by enquiry ID is enough.
