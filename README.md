# GitHub Wrapped

A Spotify Wrapped-style breakdown of any GitHub profile. Enter a username to get a visual summary of coding activity, language distribution, repo growth, and an AI-generated developer archetype.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-F26A8D?style=for-the-badge&logo=google-chrome&logoColor=white)](https://git-wrapped-one.vercel.app)

## Stack

| Layer | Tech |
|---|---|
| Frontend | HTML, CSS, vanilla JS |
| Charts | Chart.js |
| Data | GitHub REST API (no auth required) |
| AI | Anthropic API (`claude-sonnet-4-20250514`) |
| Hosting | Vercel |
| Serverless | Vercel Edge Functions (`/api/analyze.js`) |

## Features

- Language breakdown pie chart across all public repos
- Developer type classification — General, Technical, or Creative projects
- Activity by day — which days of the week the user creates repos most
- Repo growth timeline as a cumulative line graph
- Top repositories by star count
- Coding consistency via monthly repo creation patterns
- AI-generated developer archetype based on profile activity

## Project Structure

```
git-wrapped/
├── index.html
├── vercel.json
├── css/
│   └── style.css
├── js/
│   └── script.js
└── api/
    └── analyze.js
```

## How It Works

1. User enters any GitHub username
2. The frontend fetches public repo data from the GitHub REST API
3. Chart.js renders six visualizations from the response data
4. The frontend sends a profile summary to `/api/analyze`
5. The serverless function constructs a prompt and calls the Anthropic API
6. Claude returns a personalized developer archetype, rendered as a card

## Environment Variables

| Variable | Description |
|---|---|
| `ANTHROPIC_API_KEY` | Your Anthropic API key — keep this server-side only |

The key is only ever used in the serverless function (`/api/analyze.js`) and never exposed to the client.

## Running Locally

This project uses a Vercel serverless function to keep the API key secure. To run locally:

1. Install the Vercel CLI: `npm i -g vercel`
2. Clone the repo and run `vercel dev`
3. Add your `ANTHROPIC_API_KEY` to a `.env` file:
   ```
   ANTHROPIC_API_KEY=your_key_here
   ```
4. Open `http://localhost:3000`

> **Non-AI features only:** Download the project and open `index.html` directly — all charts and visualizations work without a server.
