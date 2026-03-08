
let charts = [];
async function analyze() {
    const user = document.getElementById("username").value.trim();
    if (!user) {
        alert("Please enter a GitHub username.");
        return;
    }
    try {
        const profileRes = await fetch(`https://api.github.com/users/${user}`);
        const profile = await profileRes.json();
        if (profile.message === "Not Found") {
            alert("User not found. Please check the username and try again.");
            return;
        }
        const repoRes = await fetch(`https://api.github.com/users/${user}/repos?per_page=100`);
        const repos = await repoRes.json();
        if(!Array.isArray(repos)) {
            throw new Error("GitHub repo API returned invalid data");
        }
        displayProfile(profile);
        analyzeRepos(repos);
        fetchArchetype(profile, repos)
    } catch (error) {
        console.error("Error fetching data from GitHub API:", error);
        alert("An error occurred while fetching data. Please try again later.");
    }
}
function displayProfile(profileData) {
    const profile = document.getElementById("profile");
    profile.innerHTML = `
        <img src="${profileData.avatar_url}" width="100">
        <h2>${profileData.name || profileData.login}</h2>
        <p>${profileData.bio || ""}</p>
        <p>Followers: ${profileData.followers} | Following: ${profileData.following} | Repos: ${profileData.public_repos}</p>
        `;
}
function analyzeRepos(repos) {
    if (!Array.isArray(repos) || repos.length === 0) {
        alert("No repositories found for this user.");
        return;
    }
    let programmingLanguages = {};
    let types = { "General": 0, "Technical": 0, "Creative": 0 };
    let weekActivity = [0, 0, 0, 0, 0, 0, 0];
    let monthly = new Array(12).fill(0);
    let timeline = {};
    let topRepos = [];
    repos.forEach(repo => {
        if (repo.language) {
            programmingLanguages[repo.language] = (programmingLanguages[repo.language] || 0) + 1;
        }
        const name = repo.name.toLowerCase();
        if (name.includes("blog") || name.includes("website") || name.includes("portfolio")) {
            types["General"]++;
        } else if (name.includes("game") || name.includes("app") || name.includes("design") || name.includes("quiz")) {
            types["Creative"]++;
        }
        else {
            types["Technical"]++;
        }
        const createdAt = new Date(repo.created_at);
        weekActivity[createdAt.getDay()]++;
        monthly[createdAt.getMonth()]++;
      
        timeline[repo.created_at] = 1;
        topRepos.push({ name: repo.name, stars: repo.stargazers_count || 0 });
    });
    topRepos.sort((a, b) => b.stars - a.stars);
    topRepos = topRepos.slice(0, 5);
    generateCharts(programmingLanguages, types, weekActivity, timeline, topRepos, monthly);
    generateWrapped(programmingLanguages, weekActivity);
}
function removeCharts() {
    charts.forEach(chart => chart.destroy());
    charts = [];
}
function generateCharts(programmingLanguages, types, weekActivity, timeline, topRepos, monthly) {
    removeCharts();
    const colours = [
        "#ff99c8",
        "#cdb4db",
        "#a2d2ff",
        "#ff8fab",
        "#9ec1a3",
        "#fec89a"
    ];
    charts.push(new Chart(document.getElementById("languageChart"), {
        type: "pie",
        data: {
            labels: Object.keys(programmingLanguages),
            datasets: [{ data: Object.values(programmingLanguages), backgroundColor: colours }]
        }
    }
    ));
    charts.push(new Chart(document.getElementById("typeChart"), {
        type: "doughnut",
        data: {
            labels: Object.keys(types),
            datasets: [{ data: Object.values(types), backgroundColor: colours }]
        }
    }
    ));
    charts.push(new Chart(document.getElementById("weekChart"), {
        type: "bar",
        data: {
            labels: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
            datasets: [{ label: "Repos Created", data: weekActivity, backgroundColor: colours }]
        }
    }
    ));
    const sortedDates = Object.keys(timeline).sort();
    let culm = [];
    let total = 0;
    sortedDates.forEach(date => {
        total += timeline[date];
        culm.push(total);
    });
    charts.push(new Chart(document.getElementById("timelineChart"), {
        type: "line",
        data: {
            labels: sortedDates.map(d=>d.substring(0,7)),
            datasets: [{ label: "Total Repos Created", data: culm, borderColor: "#f3a3c8", backgroundColor: "rgba(255, 188, 220, 0.88)", tension: 0.23, fill:true,pointRadius:5}]
        }
    }
    ));
    charts.push(new Chart(document.getElementById("monthlyChart"), {
        type: "bar",
        data: {
            labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
            datasets: [{ label: "Repos Created", data: monthly, backgroundColor: colours }]
        }
    }
    ));
    charts.push(new Chart(document.getElementById("topReposChart"), {
        type: "bar",
        data: {
            labels: topRepos.map(r => r.name),
            datasets: [{ label: "Stars", data: topRepos.map(r => r.stars), backgroundColor: colours }]
        },
        options: {
            indexAcxis: "y"
        }
    }));
}

function generateWrapped(programmingLanguages, weekActivity) {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const wrapped = document.getElementById("wrapped");
    const topLanguage = Object.keys(programmingLanguages).length > 0 ? Object.keys(programmingLanguages).reduce((a, b) => programmingLanguages[a] > programmingLanguages[b] ? a : b) : "None";
    const mostActive = weekActivity.indexOf(Math.max(...weekActivity));
    const mostActiveDay = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][mostActive];
    wrapped.innerHTML = `
        <h2>Your GitHub Wrapped</h2>
        <p><strong>Top Language:</strong> ${topLanguage}</p>
        <p><strong>Most active day of the week:</strong> ${mostActiveDay}</p>
    `;
}

async function fetchArchetype(profile,repos) {
    const card = document.getElementById("archetypeCard");
    const content = document.getElementById("archetypeContent");

    card.style.display = "block";
    content.innerHTML = `
        <div class="archetype-loading">
            <div class="spinner"></div>
            <p>Gemini is analyzing your commits...</p>
        </div>`;

    try {
        const response = await fetch('api/analyze.js', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ profile, repos })
        });
        if(!response.ok) throw new Error('call to API failed');
        const archetype= await response.json();
        content.innerHTML  =`
            <div class="archetype-result">
                <div class="archetype-emoji">${archetype.emoji}</div>
                <div class="archetype-title">${archetype.archetype}</div>
                <p class="archetype-description">${archetype.description}</p>
            </div>`;
    }catch(error) {
        console.error('archetype fetch failed:', error);
        content.innerHTML=`<p style "color:red"> Couln't load your archetype :( -- check console for details</p>`;

    }
}


