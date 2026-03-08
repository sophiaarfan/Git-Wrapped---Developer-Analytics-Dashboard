## GitHub Wrapped
A Spotify Wrapped-style year-in-review for your GitHub profile. Enter any GitHub username to get a visual breakdown of their coding activity, top languages, repo growth, and an AI-generated developer archetype.
## Features
- **Language Breakdown**: A pie chart for languages mainly used across all users’ repos
- **Developer Type**: Classifies the number of repos made based on their type (i.e., General, Technical, or Creative projects)
          Note: “creative” is defined as game-like/miscellaneous projects
- **Activity by Day**: What days of the week the user creates repos the most
- **Repo Growth Timeline**: cumulative repo count over time displayed in a line graph
- **Top Repositories**: your most starred projects
-  **Coding Consistency**: monthly repo creation patterns
-  **AI Developer Archetype**: Gemini AI reads your profile and gives you a fun personality archetype


[![Live Demo](https://img.shields.io/badge/Live%20Demo-F26A8D?style=for-the-badge&logo=google-chrome&logoColor=white)](https://git-wrapped-one.vercel.app)

## Note on the AI Archetype Feature
The AI archetype is powered by Google Gemini AI on the free tier. The free tier has a daily request limit, so if the archetype section shows an error, it likely means the quota has been reached. However, all cards other than the "archetype" card should function as intended.
Tech Stack
Frontend — HTML, CSS, JavaScript
Charts — Chart.js
Data — GitHub REST API (no auth required)
AI — Google Gemini API (`gemini-2.0-flash`)
Hosting — Vercel (serverless functions for API key security)

## Project Structure
- `index.html` main page
- `css/style.css` styles
- `js/script.js` frontend logic + chart generation
- `vercel.json` vercel routing config
- `api/analyze.js` serverless function, calls Gemini API

## Running Locally
This project uses a Vercel serverless function to keep the Gemini API key secure. To run locally:
1. Install the Vercel CLI: `npm i -g vercel`
2. Clone the repo and run `vercel dev`
3. Add your `GEMINI_API_KEY` to a `.env` file:
 ```
 GEMINI_API_KEY=your_key_here
 ```
4. Open `http://localhost:3000`

**Running non-AI features**: Simply download the project and open the `index.html` page to interact with the application.
