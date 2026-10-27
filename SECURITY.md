# Security

Statify is a static site: it has no server, no accounts and no database, and your listening data stays in your browser.

## Reporting a vulnerability

Please report problems **privately** through GitHub: *Security → Report a vulnerability* in this repository. Do not open a public issue for a vulnerability, and do not attach your streaming history.

I will answer as soon as I can, usually within a week.

## What counts

- Cross-site scripting or injection through crafted export files, artist names or backup files
- Anything that makes the app send listening data to a third party
- Weaknesses in the service worker or the Content-Security-Policy in `vercel.json`

## Supported versions

Only the latest version on `main` (live at https://statify.njo.quest) is supported.
