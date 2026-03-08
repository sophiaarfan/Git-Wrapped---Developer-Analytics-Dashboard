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
        const prompt = `You are analyzing a developer's GitHub profile, and will give them a fun spotify-wrapped style archetpye based on ntheir profile data
    The profile data is as follows: 
    -Name: ${profile.name || profile.login}
    -Bio: ${profile.bio || 'none'}
    -Public repos: ${profile.public_repos}
    -Followers: ${profile.followers}
    Their repositories:
    ${repoSummary}

    Based on this data respond ONLY with a JSON object(NO markdown, NO explanation) in this exact format:
    "archetype": "The [Creative Title]",
    "emoji": "[One emoji matching the archetype chosen]"
    "description: "[2 Sentences describing their coding personality in a fun and witty way. Be specific to their actual data, mention real repo names or patterns noticed when possible Make it personal and a little playful.]"
}`;

        const AIresponse = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }]
                })
            }
        );

        const data = await response.json();

        if (data.error) {
            return res.status(500).json({ error: data.error.message });
        }

        const raw = data.candidates[0].content.parts[0].text;

        const clean = raw.replace(/```json|```/g, "").trim();
        const archetype = JSON.parse(clean);

        res.status(200).json(archetype);

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Something went wrong analyzing your profile.' });
    }
}
