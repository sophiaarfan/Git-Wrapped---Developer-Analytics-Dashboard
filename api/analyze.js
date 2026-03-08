export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        return res.status(500).json({ error: 'API key not configured' });
    }
    try {
        const { repos, profile } = req.body;
        const repoSummary = repos.map(r => `${r.name} (${r.language || 'no language'}, ${r.stargazers_count} stars, created ${r.created_at.substring(0, 7)})`).join('\n');
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

        const AIresponse = await fetch(
           `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }]
                })
            }
        );

        const data = await AIresponse.json();
        console.log('Gemini raw response:', JSON.stringify(data));

        if (data.error) {
            console.error('Gemini API error:', data.error);
            return res.status(500).json({ error: data.error.message });
        }

        if (!data.candidates || data.candidates.length === 0) {
            console.error('No candidates in response:', JSON.stringify(data));
            return res.status(500).json({ error: 'No response from Gemini' });
        }

        const raw = data.candidates[0].content.parts[0].text;
        console.log('Raw text:', raw);

        const clean = raw.replace(/```json|```/g, "").trim();
        const archetype = JSON.parse(clean);

        res.status(200).json(archetype);

    } catch (error) {
        console.error('Error:', error.message, error.stack);
        res.status(500).json({ error: error.message });
    }
}