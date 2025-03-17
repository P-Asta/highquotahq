import { loadNavbar } from './utils.js';
import { handleAuthButtons } from './auth.js';
import { doc, getDoc, setDoc, collection, addDoc } from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js';
import {  } from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js';
import { auth, db } from './firebase.js';

document.getElementById("leaderboardType").addEventListener("change", (event) => {
    const hqFields = document.getElementById("hqFields");
    const sdcFields = document.getElementById("sdcFields");
    const smhqFields = document.getElementById("smhqFields");
  
    hqFields.style.display = "none";
    sdcFields.style.display = "none";
    smhqFields.style.display = "none";
  
    if (event.target.value === "leaderboards_hq") {
      hqFields.style.display = "block";
    } else if (event.target.value === "leaderboards_sdc") {
      sdcFields.style.display = "block";
    } else if (event.target.value === "leaderboards_smhq") {
      smhqFields.style.display = "block";
    }
  });
  
  document.getElementById("runSubmissionForm").addEventListener("submit", async (event) => {
    event.preventDefault();
  
    const leaderboardType = document.getElementById("leaderboardType").value;
    const date = document.getElementById("date").value;
    
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
    if (leaderboardType === "leaderboards_hq") {
      runData = {
        ...runData,
        quotaAmount: parseInt(document.getElementById("quotaAmount").value, 10),
        quotaFulfilled: parseInt(document.getElementById("quotaFulfilled").value, 10),
        quotaReached: parseInt(document.getElementById("quotaReached").value, 10),
        totalScrap: parseInt(document.getElementById("totalScrap").value, 10),
      };
    } else if (leaderboardType === "leaderboards_sdc") {
      runData = {
        ...runData,
        moon: document.getElementById("moon").value.trim(),
        scrapType: document.getElementById("scrapType").value.trim(),
        totalScrap: parseInt(document.getElementById("totalScrapSDC").value, 10),
        equipment: document.getElementById("equipment").value.trim().split(",").map(item => item.trim()), // Split input into an array
      };
    } else if (leaderboardType === "leaderboards_smhq") {
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
    const leaderboardRef = collection(db, leaderboardType);
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