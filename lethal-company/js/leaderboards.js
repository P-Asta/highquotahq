import { loadNavbar, countryFlags } from './utils.js';
import { handleAuthButtons } from './auth.js';
import { doc, getDoc, getDocs, collection, query, where, updateDoc, Timestamp, orderBy, limit } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";
import { db, auth } from "./firebase.js";


// Get the DOM elements
const collectionBtns = document.querySelectorAll('.collection-btn');
const filterSections = document.querySelectorAll('.filter-section');
const filterBtns = document.querySelectorAll('.filter-btn');
const leaderboard = document.getElementById('leaderboard');

// Set up active collection
let activeCollection = 'leaderboards_hq';
let activeFilters = {
  playerCount: ['1'],
  versions: [],
  unrestricted: false,
  moon: [],
  scrapType: [],
};

// Ensure "Player 1" button is visually active on page load
document.querySelector('[data-filter="1"]').classList.add('active');

const CACHE_KEY_PREFIX = 'leaderboard-cache-';
const CACHE_EXPIRY_MS = 10 * 60 * 1000 * 144; // 24 hrs

// Fetch raw runs data from cache or Firestore
const fetchRawRuns = async () => {
  const cacheKey = CACHE_KEY_PREFIX + activeCollection;
  const cached = localStorage.getItem(cacheKey);

  if (cached) {
    const cachedData = JSON.parse(cached);
    const age = Date.now() - cachedData.timestamp;
    if (age < CACHE_EXPIRY_MS) {
      console.log('Using cached data for', activeCollection);
      return cachedData.runs;  // raw data, unfiltered
    }
  }

  // If no cache or cache expired, fetch fresh data
  try {
    const querySnapshot = await getDocs(collection(db, activeCollection));
    const runs = querySnapshot.docs.map(doc => doc.data());

    localStorage.setItem(cacheKey, JSON.stringify({
      runs,
      timestamp: Date.now()
    }));

    return runs;
  } catch (error) {
    console.error("Error fetching leaderboard data:", error);
    throw error;
  }
};

// Apply filters and sorting in-memory
const filterAndSortRuns = (runs) => {
  // Filter
  const filteredRuns = runs.filter(run => {
    const playerCount = run.players?.length || 0;
    const matchesPlayerCount = activeFilters.playerCount.length === 0 || 
                               activeFilters.playerCount.includes(playerCount.toString());

    const version = run.version;
    const matchesVersion = activeFilters.versions.length === 0 || 
                           activeFilters.versions.includes(version);

    const moon = run.moon || '';
    const matchesMoon = activeFilters.moon.length === 0 || 
                        activeFilters.moon.includes(moon);

    const scrapType = run.scrapType || '';
    const matchesScrapType = activeFilters.scrapType.length === 0 ||
                             activeFilters.scrapType.includes(scrapType);

    const isVerified = run.verified === true;
    const isUnrestricted = run.unrestricted || false;
    const showUnrestricted = activeFilters.unrestricted;

    const unrestrictedFilter = showUnrestricted || !isUnrestricted;

    return matchesPlayerCount && matchesVersion && matchesMoon && matchesScrapType && isVerified && unrestrictedFilter;
  });

  // Determine sort key
  let sortKey;
  if (activeCollection === "leaderboards_hq" || activeCollection === "leaderboards_smhq") {
    sortKey = "quotaAmount";
  } else if (activeCollection === "leaderboards_sdc") {
    sortKey = "totalScrap";
  }

  // Sort descending by key
  const sortedRuns = filteredRuns.sort((a, b) => (b[sortKey] || 0) - (a[sortKey] || 0));

  // Add position number
  sortedRuns.forEach((run, index) => {
    run.position = index + 1;
  });

  return sortedRuns;
};

// Main function to fetch data & update leaderboard display
const fetchLeaderboardData = async () => {
  leaderboard.innerHTML = 'Loading...';

  try {
    const rawRuns = await fetchRawRuns();           // get raw cached or fresh runs
    const filteredSortedRuns = filterAndSortRuns(rawRuns); // filter & sort in-memory
    displayLeaderboard(filteredSortedRuns);         // show leaderboard
  } catch {
    leaderboard.innerHTML = 'Error loading leaderboard.';
  }
};

// Map DOM filter IDs to activeFilters keys
const filterTypeMap = {
  'player-count': 'playerCount',
  'version': 'versions',
  'unrestricted': 'unrestricted',
  'moon': 'moon',
  'scrap-type': 'scrapType',
};

// Event listener for filter buttons
filterBtns.forEach((btn) => {
  btn.addEventListener('click', (event) => {
    event.preventDefault();

    // Get the filter type from the parent container's ID
    const filterCategory = btn.closest('.filter-category');
    if (!filterCategory) {
      console.error("Filter button is missing a valid parent with the 'filter-category' class.");
      return;
    }

    const rawFilterType = filterCategory.id.replace('-filters', '');
    const filterType = filterTypeMap[rawFilterType];

    // Ensure the filter type exists in activeFilters
    if (!filterType || !activeFilters.hasOwnProperty(filterType)) {
      console.error(`Filter type '${rawFilterType}' does not exist in activeFilters.`);
      return;
    }

    const filterValue = btn.getAttribute('data-filter');

    if (filterType === 'unrestricted') {
      activeFilters.unrestricted = !activeFilters.unrestricted;
      btn.classList.toggle('active', activeFilters.unrestricted);
    } else if (filterType === 'playerCount') {
      activeFilters.playerCount = [filterValue];

      filterCategory.querySelectorAll('.filter-btn').forEach(button => button.classList.remove('active'));
      btn.classList.add('active');
    } else if (filterType === 'moon') {
      activeFilters.moon = [filterValue];

      filterCategory.querySelectorAll('.filter-btn').forEach(button => button.classList.remove('active'));
      btn.classList.add('active');
    } else {
      const isActive = btn.classList.contains('active');
      if (isActive) {
        btn.classList.remove('active');
        activeFilters[filterType] = activeFilters[filterType].filter((value) => value !== filterValue);
      } else {
        btn.classList.add('active');
        activeFilters[filterType].push(filterValue);
      }
    }

    // Fetch and display leaderboard data based on active filters
    fetchLeaderboardData();
  });
});

// Event listener for collection buttons
collectionBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    // Set active collection
    activeCollection = btn.getAttribute('data-collection');

    // Reset active filters when switching collections
    activeFilters = {
      playerCount: ['1'],
      versions: [],
      unrestricted: false,
      moon: [],
      scrapType: [],
    };

    if (activeCollection == 'leaderboards_sdc' || activeCollection == 'leaderboards_smhq') {
      activeFilters.moon = ['41-Experimentation']
    }


    // Update UI to reflect selected collection
    collectionBtns.forEach(button => button.classList.remove('active'));
    btn.classList.add('active');

    // Reset filter button states
    document.querySelectorAll('.filter-section .filter-btn').forEach(button => button.classList.remove('active'));
    
    const playerOneButton = document.querySelector(`#${activeCollection}-filters [data-filter="1"]`);
    if (playerOneButton) playerOneButton.classList.add('active');

    const moonButton = document.querySelector(`#${activeCollection}-filters [data-filter="41-Experimentation"]`);
    if (moonButton) moonButton.classList.add('active');

    // Hide/show collection-specific filters
    document.querySelectorAll('.filter-section').forEach(section => {
      section.classList.remove('active');
    });
    document.getElementById(`${activeCollection}-filters`).classList.add('active');

    // Fetch leaderboard data for the new collection
    fetchLeaderboardData();
  });
});



const displayLeaderboard = (runs) => {
  leaderboard.innerHTML = '';

  if (runs.length === 0) {
    leaderboard.innerHTML = '<p>No runs found with the selected filters.</p>';
    return;
  }

  runs.sort((a, b) => {
    const valueA = a.quotaAmount || a.totalScrap || 0;
    const valueB = b.quotaAmount || b.totalScrap || 0;
    return valueB - valueA;
  });

  let currentRank = 1;
  let previousValue = null;
  let positionTracker = 1;


  runs.forEach((run, index) => {
    const runValue = run.quotaAmount || run.totalScrap || 0;
    
    if (runValue !== previousValue) {
      currentRank = positionTracker;
    }
    previousValue = runValue;
    positionTracker++; 


    const runDiv = document.createElement('div');
    runDiv.classList.add('run-entry');

    const positionDiv = document.createElement('div');
    positionDiv.classList.add('run-position');
    positionDiv.textContent = `#${currentRank}`;

    if (currentRank === 1) positionDiv.classList.add('gold');
    else if (currentRank === 2) positionDiv.classList.add('silver');
    else if (currentRank === 3) positionDiv.classList.add('bronze');

    runDiv.appendChild(positionDiv);

    const playersDiv = document.createElement('div');
    playersDiv.classList.add('run-players');
    playersDiv.textContent = `Players: `;

    run.players.forEach((player, i) => {
      const playerLink = document.createElement('a');
      playerLink.href = `/pages/profile.html?username=${encodeURIComponent(player)}`;
      playerLink.textContent = player;
      playerLink.classList.add('player-link');

      playersDiv.appendChild(playerLink);

      if (i < run.players.length - 1) {
        playersDiv.appendChild(document.createTextNode(', '));
      }
    });

    runDiv.appendChild(playersDiv);

    const versionDiv = document.createElement('div');
    versionDiv.classList.add('run-version');
    versionDiv.textContent = `Version: ${run.version}`;
    runDiv.appendChild(versionDiv);

    const valueDiv = document.createElement('div');
    valueDiv.classList.add('run-value');

    if (activeCollection === "leaderboards_hq" || activeCollection === "leaderboards_smhq") {
      valueDiv.textContent = `Quota Amount: ${run.quotaAmount || 0}`;
    } else if (activeCollection === "leaderboards_sdc") {
      valueDiv.textContent = `Total Scrap: ${run.totalScrap || 0}`;
    }
    runDiv.appendChild(valueDiv);

    const detailsButton = document.createElement('button');
    detailsButton.classList.add('view-details-btn');
    detailsButton.innerHTML = '→';
    detailsButton.onclick = () => showRunDetails(run, index);
    runDiv.appendChild(detailsButton);

    leaderboard.appendChild(runDiv);
  });
};


export function showRunDetails(run, index) {
  const detailsPanel = document.getElementById('details-panel');
  
  // Helper function to format timestamps
  const formatTimestamp = (timestamp) => {
    if (timestamp && timestamp.toDate) {
      return new Date(timestamp.toDate()).toLocaleString();
    }
    return 'N/A';
  };

  // Helper function to format and display videos
  const formatVideos = (videosMap) => {
    if (videosMap && typeof videosMap === 'object') {
      return Object.keys(videosMap).map(playerName => {
        const videos = videosMap[playerName];
        if (Array.isArray(videos)) {
          return `
            <div class="video-card">
              <h4>Videos for ${playerName}</h4>
              <div class="video-links">
                ${videos.map(video => `<a href="${video}" target="_blank"><img src="https://img.youtube.com/vi/${getVideoId(video)}/hqdefault.jpg" alt="${video}" class="video-thumbnail"></a>`).join('')}
              </div>
            </div>
          `;
        }
        return '';
      }).join('');
    }
    return 'No videos available.';
  };

  // Helper function to extract YouTube video ID from URL
  const getVideoId = (url) => {
    const regex = /(?:https?:\/\/(?:www\.)?youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/([a-zA-Z0-9_-]+))|youtu\.be\/([a-zA-Z0-9_-]+))/;
    const match = url.match(regex);
    return match ? match[1] || match[2] : '';
  };

  // details panel HTML content
  let runDetailsHtml = `
    <button id="close-btn" class="close-btn">←</button>
    <h2>Run Details</h2>
    <div class="run-details">
      <div class="video-section">${formatVideos(run.videos)}</div>
      <div class="stats-section">
        <h3>Run Information</h3>
        <p><strong>Players:</strong> 
          ${run.players.map(player => 
            `<a href="/pages/profile.html?username=${encodeURIComponent(player)}" class="player-link">${player}</a>`
          ).join(', ')}
        </p>
        <p><strong>Date:</strong> ${formatTimestamp(run.date)}</p>
  `;

  if (activeCollection === 'leaderboards_hq') {
    runDetailsHtml += `
      <p><strong>Quota Amount:</strong> ${run.quotaAmount}</p>
      <p><strong>Quota Fulfilled:</strong> ${run.quotaFulfilled}</p>
      <p><strong>Quota Reached:</strong> ${run.quotaReached}</p>
      <p><strong>Total Scrap:</strong> ${run.totalScrap}</p>
      <p><strong>Unrestricted:</strong> ${run.unrestricted ? 'Yes' : 'No'}</p>
      <p><strong>Verified At:</strong> ${formatTimestamp(run.verifiedAt)}</p>
      <p><strong>Verified By:</strong> ${run.verifiedBy}</p>
      <p><strong>Version:</strong> ${run.version}</p>
    `;
  }
  else if (activeCollection === 'leaderboards_sdc') {
    runDetailsHtml += `
      <p><strong>Total Scrap:</strong> ${run.totalScrap}</p>
      <p><strong>Scrap Type:</strong> ${run.scrapType}</p>
      <p><strong>Equipment:</strong> ${run.equipment}</p>
      <p><strong>Moon:</strong> ${run.moon}</p>
      <p><strong>Unrestricted:</strong> ${run.unrestricted ? 'Yes' : 'No'}</p>
      <p><strong>Verified At:</strong> ${formatTimestamp(run.verifiedAt)}</p>
      <p><strong>Verified By:</strong> ${run.verifiedBy}</p>
      <p><strong>Version:</strong> ${run.version}</p>
    `;
  }
  else if (activeCollection === 'leaderboards_smhq') {
    runDetailsHtml += `
      <p><strong>Quota Amount:</strong> ${run.quotaAmount}</p>
      <p><strong>Quota Fulfilled:</strong> ${run.quotaFulfilled}</p>
      <p><strong>Quota Reached:</strong> ${run.quotaReached}</p>
      <p><strong>Total Scrap:</strong> ${run.totalScrap}</p>
      <p><strong>Moon:</strong> ${run.moon}</p>
      <p><strong>Unrestricted:</strong> ${run.unrestricted ? 'Yes' : 'No'}</p>
      <p><strong>Verified At:</strong> ${formatTimestamp(run.verifiedAt)}</p>
      <p><strong>Verified By:</strong> ${run.verifiedBy}</p>
      <p><strong>Version:</strong> ${run.version}</p>
    `;
  }
  else {
    runDetailsHtml += `
      <p><strong>Additional Info:</strong> ${run.someOtherDetail || 'No additional info available.'}</p>
    `;
  }

  
  detailsPanel.innerHTML = runDetailsHtml;

  setTimeout(() => {
    detailsPanel.classList.add('active');
  }, 50);

  setTimeout(() => {
    const leaderboard = document.getElementById('leaderboard');
    const filters = document.getElementById('filters');
    leaderboard.classList.add('hidden');
    filters.classList.add('hidden');
  }, 50);

  const closeBtn = document.getElementById('close-btn');
  if (closeBtn) {
    closeBtn.addEventListener('click', closeRunDetails);
  }
}

function closeRunDetails() {
  const detailsPanel = document.getElementById('details-panel');
  detailsPanel.classList.remove('active');
  
  const leaderboard = document.getElementById('leaderboard');
  const filters = document.getElementById('filters');
  leaderboard.classList.remove('hidden');
  filters.classList.remove('hidden');
}



fetchLeaderboardData();



document.addEventListener('DOMContentLoaded', function() {
    loadNavbar(handleAuthButtons);
});
