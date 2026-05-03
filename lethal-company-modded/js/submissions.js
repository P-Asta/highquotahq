import { loadNavbar } from './utils.js';
import { handleAuthButtons } from './auth.js';
import { doc, getDoc, setDoc, collection, addDoc } from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js';
import {  } from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js';
import { auth, db } from './firebase.js';

const gameData = {
  // moons
  vanilla_moons: [
    "41-Experimentation",
    "220-Assurance",
    "56-Vow",
    "21-Offense",
    "61-March",
    "20-Adamance",
    "85-Rend",
    "7-Dine",
    "8-Titan",
    "68-Artifice",
    "5-Embrion"
  ],
  wesleys_moons: [
    "76-Acidir",
    "240-Alcatras",
    "57-Asteroid-13",
    "44-Atlantica",
    "288-Berunah",
    "235-Calist",
    "842-Core",
    "42-Cosmocos",
    "328-Crowd",
    "537-Cubatres",
    "354-Demetrica",
    "724-Descent",
    "48-Desolation",
    "135-Duckstroid-14",
    "555-Empra",
    "154-Etern",
    "475-Extort",
    "29-Faith",
    "141-Filitrios",
    "25-Fission-C",
    "36-Gloom",
    "147-Gratar",
    "58-Hyve",
    "42-Hyx",
    "46-Infernis",
    "84-Junic",
    "35-Lecaro",
    "234-Motra",
    "495-Narcotic",
    "134-Oldred",
    "94-Polarus",
    "214-Release",
    "648-Repress",
    "398-Roart",
    "4-Thalasso",
    "132-Trite",
    "67-Utril"
  ],
  classic_moons: [
    "320-Blurance",
    "51-Verdance",
    "184-Derelict",
    "130-Gorgonzola",
    "5-Tandraus",
    "131-Lertz",
    "143-Scallg",
    "86-Synthesis",
    "13-Kast",
    "154-Etern",
    "43-Orion",
    "2742-Jabiua"
  ],
  // versions
  brutal_versions: ["v49", "v50", "v56", "v62", "v64", "v69", "v72", "v73"],
  eclipsed_versions: ["v40", "v45", "v49", "v50", "v56", "v62", "v64", "v69", "v72", "v73", "v81"],
  wesleys_versions: ["v69", "v72", "v73"],
  classic_versions: ["v56", "v62", "v64", "v69", "v72", "v73"]
}

document.getElementById("modpack").addEventListener("change", (event) => {
  const leaderboardSelector = document.getElementById('leaderboardType');
  const sdcOption = leaderboardSelector.querySelector('option[value="sdc"]');
  leaderboardSelector.value = 'hq';
  const hqFields = document.getElementById("hqFields");
  const smhqFields = document.getElementById("smhqFields");
  const sdcFields = document.getElementById("sdcFields");
  hqFields.style.display = "block";
  smhqFields.style.display = "none";
  sdcFields.style.display = "none";

  if (event.target.value === "lc_modded_eclipsed_"){
    sdcOption.disabled = true;
  }else{
    sdcOption.disabled = false;
  }

  if (event.target.value === 'lc_modded_brutal_'){
    populateDropdown('moon', 'vanilla_moons');
    populateDropdown('moonSMHQ', 'vanilla_moons');
    populateDropdown('version', 'brutal_versions');
  }else if (event.target.value === 'lc_modded_eclipsed_'){
    populateDropdown('moon', 'vanilla_moons');
    populateDropdown('moonSMHQ', 'vanilla_moons');
    populateDropdown('version', 'eclipsed_versions');
  }else if (event.target.value === 'lc_modded_wesleysmoons_'){
    populateDropdown('moon', 'wesleys_moons');
    populateDropdown('moonSMHQ', 'wesleys_moons');
    populateDropdown('version', 'wesleys_versions');
  }else if (event.target.value === 'lc_modded_classicmoons_'){
    populateDropdown('moon', 'classic_moons');
    populateDropdown('moonSMHQ', 'classic_moons');
    populateDropdown('version', 'classic_versions');
  }
})

document.getElementById("leaderboardType").addEventListener("change", (event) => {
  const hqFields = document.getElementById("hqFields");
  const smhqFields = document.getElementById("smhqFields");
  const sdcFields = document.getElementById("sdcFields");

  hqFields.style.display = "none";
  smhqFields.style.display = "none";
  sdcFields.style.display = "none";

  if (event.target.value === "hq") {
    hqFields.style.display = "block";
  } else if (event.target.value === "smhq") {
    smhqFields.style.display = "block";
  } else if (event.target.value === "sdc") {
    sdcFields.style.display = "block";
  }
});
  
document.getElementById("runSubmissionForm").addEventListener("submit", async (event) => {
  event.preventDefault();

  const leaderboardType = document.getElementById("leaderboardType").value;
  const modpack = document.getElementById("modpack").value;
  const date = document.getElementById("date").value;
  const collectionName = modpack + leaderboardType;
  
  // Collect players (up to 4)
  const players = [
    document.getElementById("player1").value.trim(),
    document.getElementById("player2").value.trim(),
    document.getElementById("player3").value.trim(),
    document.getElementById("player4").value.trim(),
  ].filter(player => player); // Remove empty fields
  
  const version = document.getElementById("version").value.trim();
  
  // Handle video inputs for each player
  const videos = {};
  players.forEach((player, index) => {
    const videosInput = document.getElementById(`videos${index + 1}`).value.trim();
    if (videosInput) {
      videos[player] = videosInput.split(",").map(v => v.trim()); // Split videos by commas
    }
  });

  const logs = document.getElementById("logs").value;

  const comments = document.getElementById("comments").value;

  let runData = {
    date: new Date(date),
    players,
    version,
    videos,
    verified: false,
    logs,
    comments,
  };

  // Add leaderboard-specific fields
  if (leaderboardType === "hq") {
    runData = {
      ...runData,
      quotaAmount: parseInt(document.getElementById("quotaAmount").value, 10),
      quotaFulfilled: parseInt(document.getElementById("quotaFulfilled").value, 10),
      quotaReached: parseInt(document.getElementById("quotaReached").value, 10),
      totalScrap: parseInt(document.getElementById("totalScrap").value, 10),
    };
  } else if (leaderboardType === "sdc") {
    runData = {
      ...runData,
      moon: document.getElementById("moon").value.trim(),
      scrapType: document.getElementById("scrapType").value.trim(),
      totalScrap: parseInt(document.getElementById("totalScrapSDC").value, 10),
      equipment: document.getElementById("equipment").value.trim().split(",").map(item => item.trim()), // Split input into an array
    };
  } else if (leaderboardType === "smhq") {
    runData = {
      ...runData,
      moon: document.getElementById("moonSMHQ").value.trim(),
      quotaAmount: parseInt(document.getElementById("quotaAmountSMHQ").value, 10),
      quotaFulfilled: parseInt(document.getElementById("quotaFulfilledSMHQ").value, 10),
      quotaReached: parseInt(document.getElementById("quotaReachedSMHQ").value, 10),
      totalScrap: parseInt(document.getElementById("totalScrapSMHQ").value, 10),
    };
  }

  // Use modular SDK syntax to add the document
  try {
    const leaderboardRef = collection(db, collectionName);
    await addDoc(leaderboardRef, runData);
    alert("Run submitted successfully!");
    document.getElementById("runSubmissionForm").reset();
  } catch (error) {
    console.error("Error submitting run:", error);
    alert("There was an error submitting your run. Please try again.");
  }
});
  

document.addEventListener('DOMContentLoaded', function() {
    loadNavbar(handleAuthButtons);
});

function populateDropdown(selectId, category) {
  const selectMenu = document.getElementById(selectId);
  const dataArray = gameData[category];

  const firstOption = selectMenu.options[0];
  selectMenu.innerHTML = '';
  selectMenu.appendChild(firstOption);

  const fragment = document.createDocumentFragment();

  dataArray.forEach(item => {
    const opt = document.createElement('option');
    opt.value = item;
    opt.textContent = item;
    fragment.appendChild(opt);
  });

  selectMenu.appendChild(fragment);
}
