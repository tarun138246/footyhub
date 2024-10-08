// API Football configuration
const API_KEY = 'YOUR_API_KEY'; // Use your API key here
const API_BASE_URL = 'https://v3.football.api-sports.io';

// Cache object
let cache = {
    liveData: null,
    fixturesData: null,
    lastUpdated: null
};

// Function to fetch data from API Football
async function fetchFromAPI(endpoint) {
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'GET',
            headers: {
                'x-rapidapi-host': 'v3.football.api-sports.io',
                'x-rapidapi-key': API_KEY
            }
        });
        return await response.json();
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

// Function to update all sections
async function updateAllSections() {
    const currentTime = new Date().getTime();
    const twoHours = 2 * 60 * 60 * 1000; // 2 hours in milliseconds

    if (!cache.lastUpdated || (currentTime - cache.lastUpdated > twoHours)) {
        // Fetch live matches and upcoming fixtures in a single call
        cache.liveData = await fetchFromAPI('/fixtures?live=all');
        cache.fixturesData = await fetchFromAPI('/fixtures?next=4');
        cache.lastUpdated = currentTime;

        // Store cache in localStorage
        localStorage.setItem('footballApiCache', JSON.stringify(cache));
    }

    // Update the scoreboard with live matches
    updateScoreboard(cache.liveData);
    
    // Update news and events with upcoming fixtures
    updateNewsAndEvents(cache.fixturesData);
}

// Update scoreboard section
function updateScoreboard(data) {
    if (data && data.response && data.response.length > 0) {
        const match1 = data.response[0];
        const match2 = data.response[1] || match1;

        updateScoreboardCard('.home-scoreboard-card1', match1);
        updateScoreboardCard('.home-scoreboard-card2', match2);
    }
}

function updateScoreboardCard(selector, match) {
    const card = document.querySelector(selector);
    card.querySelector('.home-scoreboard-card-title1, .home-scoreboard-card-title2').textContent = match.league.name;
    card.querySelector('.home-scoreboard-card-subtitle1, .home-scoreboard-card-subtitle2').textContent = `${match.teams.home.name} vs ${match.teams.away.name}`;
    card.querySelector('.home-scoreboard-content1, .home-scoreboard-content2').textContent = `Score: ${match.goals.home}-${match.goals.away}`;
}

// Update news and events sections
function updateNewsAndEvents(data) {
    if (data && data.response && data.response.length > 0) {
        // Update news section with upcoming matches
        for (let i = 0; i < 3 && i < data.response.length; i++) {
            updateNewsCard(i + 1, data.response[i]);
        }

        // Update events section with upcoming matches
        for (let i = 0; i < 4 && i < data.response.length; i++) {
            updateEventCard(i + 1, data.response[i]);
        }
    }
}

function updateNewsCard(index, fixture) {
    const newsTitle = `Upcoming Match: ${fixture.teams.home.name} vs ${fixture.teams.away.name}`;
    const newsContent = `Get ready for an exciting match in the ${fixture.league.name} on ${new Date(fixture.fixture.date).toLocaleDateString()}. ${fixture.teams.home.name} will face ${fixture.teams.away.name} at ${fixture.fixture.venue.name}.`;
    
    document.querySelector(`.home-news-card${index}-title`).textContent = newsTitle;
    document.querySelector(`.home-news-card${index}-content`).textContent = newsContent;
}

function updateEventCard(index, event) {
    const eventCard = document.querySelector(`.home-events-section-card${index}`);
    eventCard.querySelector('.home-events-section-card-title').textContent = `Event ${index}`;
    eventCard.querySelector('.home-events-section-card-match-date').textContent = `Match Date & Time: ${new Date(event.fixture.date).toLocaleString()}`;
    eventCard.querySelector('.home-events-section-card-teams').textContent = `Teams: ${event.teams.home.name} vs ${event.teams.away.name}`;
    eventCard.querySelector('.home-events-section-card-stadium').textContent = `Stadium: ${event.fixture.venue.name}`;
}

// Function to load cache from localStorage
function loadCacheFromStorage() {
    const storedCache = localStorage.getItem('footballApiCache');
    if (storedCache) {
        cache = JSON.parse(storedCache);
    }
}

// Initial load
window.addEventListener('load', () => {
    loadCacheFromStorage();
    updateAllSections();
});

// Set up periodic updates (every 2 hours)
setInterval(updateAllSections, 2 * 60 * 60 * 1000);