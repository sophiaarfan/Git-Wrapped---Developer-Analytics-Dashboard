export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
        return res.status(500).json({ error: 'API key not configured' });
    }
    try {
        const { repos, profile } = req.body;
        const repoSummary = repos.map(r =>
            `${r.name} (${r.language || 'no language'}, ${r.stargazers_count} stars, created ${r.created_at.substring(0, 7)})`
        ).join('\n');

        const prompt = `You are analyzing a developer's GitHub profile to give them a fun, Spotify Wrapped-style personality archetype.
        Profile:
        - Name: ${profile.name || profile.login}
        - Bio: ${profile.bio || 'none'}
        - Public repos: ${profile.public_repos}
        - Followers: ${profile.followers}
        Repositories:
        ${repoSummary}
        Respond ONLY with a JSON object (no markdown, no explanation):
        {
          "archetype": "The [Creative Title]",
          "emoji": "[one emoji]",
          "description": "[2 fun sentences, mention real repo names]"
        }`;

        const AIresponse = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: 'claude-sonnet-4-20250514',
                max_tokens: 1024,
                messages: [{ role: 'user', content: prompt }]
            })
        });

        const data = await AIresponse.json();

        if (data.error) {
            console.error('Claude API error:', data.error);
            return res.status(500).json({ error: data.error.message });
        }

        const raw = data.content[0].text;
        const clean = raw.replace(/```json|```/g, '').trim();
        const archetype = JSON.parse(clean);

        res.status(200).json(archetype);

    } catch (error) {
        console.error('Error:', error.message, error.stack);
        res.status(500).json({ error: error.message });
    }
}