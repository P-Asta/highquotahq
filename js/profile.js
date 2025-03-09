import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js';
import { updateDoc, doc, getDocs, collection } from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-storage.js';
import { auth, db } from './firebase.js';
import { loadNavbar, countryFlags } from './utils.js';
import { handleAuthButtons } from './auth.js';

// DOM elements
const profilePicture = document.getElementById("profile-picture");
const usernameDisplay = document.getElementById("username-display");
const createdAtDisplay = document.getElementById("created-at");
const bioDisplay = document.getElementById("bio");
const pronounsDisplay = document.getElementById("pronouns");
const countryDisplay = document.getElementById("country");

// Modal elements
const editProfileButton = document.getElementById("edit-profile-button");
const editProfileModal = document.getElementById("edit-profile-modal");
const saveChangesButton = document.getElementById("save-changes-button");
const cancelEditButton = document.getElementById("cancel-edit-button");
const bioInput = document.getElementById("bio-input");
const pronounsInput = document.getElementById("pronouns-input");
const countryInput = document.getElementById("country-input");
const profilePictureInput = document.getElementById("profile-picture-input");


const runsContainer = document.getElementById("runs-container");
const moddedRunsContainer = document.getElementById("modded-runs-container")

let profileUid = null; // Will store the UID of the profile being viewed

// Initialize Firebase Storage
const storage = getStorage();

// Check auth state and populate profile
onAuthStateChanged(auth, async (user) => {
  const params = new URLSearchParams(window.location.search);
  const username = params.get("username");
  console.log("Username from URL:", username);

  if (username) {
    // Fetch the user collection from Firestore using modular SDK
    const usersSnapshot = await getDocs(collection(db, "users"));
    
    usersSnapshot.forEach((docSnapshot) => {
      const userData = docSnapshot.data();

      if (userData.username === username) {
        profileUid = docSnapshot.id; // Set the UID for the profile being viewed

        // Fetch and display profile data
        profilePicture.src = userData.profilePicture || "/assets/default-avatar.png";
        usernameDisplay.textContent = userData.username;
        createdAtDisplay.textContent = `Joined: ${userData.createdAt}`;
        bioDisplay.textContent = userData.bio || "No bio available.";
        pronounsDisplay.textContent = `${userData.pronouns || "Pronouns: Not set"}`;

        // Get the country flag emoji from the countryFlags object
        const countryFlag = countryFlags[userData.country] || ''; // Default to an empty string if country not found

        // Display the country and flag
        countryDisplay.innerHTML = `${userData.country || "Country: Not set"} ${countryFlag}`;


        // Show edit button only if the logged-in user owns the profile
        if (user && user.uid === profileUid) {
          editProfileButton.style.display = "block";
        }
      }
    });
  }
});

// Show the modal when Edit Profile button is clicked
editProfileButton.addEventListener("click", () => {
    // Prefill the modal inputs with current profile data (if available)
    bioInput.value = document.getElementById("bio").textContent || "";
    pronounsInput.value = document.getElementById("pronouns").textContent || "";
    countryInput.value = document.getElementById("country").textContent || "";
  
    // Show the modal
    editProfileModal.classList.add("show");
});

// Close the modal when Cancel button is clicked
cancelEditButton.addEventListener("click", () => {
  editProfileModal.classList.remove("show");
});

// Save changes to Firestore
saveChangesButton.addEventListener("click", async () => {
  // Ensure the user is authenticated
  const user = auth.currentUser;
  if (!user) {
    alert("You must be logged in to update your profile.");
    return;
  }

  const bio = bioInput.value;
  const pronouns = pronounsInput.value;
  const country = countryInput.value;
    // Get the country flag emoji from the countryFlags object
  const countryFlag = countryFlags[countryInput.value] || ''; // Default to an empty string if country not found

  let newProfilePictureUrl = null;

  // Check if a new profile picture was uploaded
  if (profilePictureInput.files.length > 0) {
    const file = profilePictureInput.files[0];
    const storageRef = ref(storage, `profile_pictures/${user.uid}`);
    
    // Upload the image to Firebase Storage
    try {
      const uploadResult = await uploadBytes(storageRef, file);
      newProfilePictureUrl = await getDownloadURL(uploadResult.ref);
    } catch (error) {
      console.error("Error uploading profile picture:", error);
      alert("Error uploading profile picture. Please try again.");
      return;
    }
  }

  // Update the user data in Firestore
  try {
    const userRef = doc(db, "users", user.uid);  // Use current user's UID for the document reference
    const updates = {
        bio: bio,
        pronouns: pronouns,
        country: country,
      };
    
    // Only update the profile picture if a new one is uploaded
    if (newProfilePictureUrl) {
        updates.profilePicture = newProfilePictureUrl;
    }

    // Apply the updates to Firestore
    await updateDoc(userRef, updates);
    // After updating, close the modal and update the profile UI
    editProfileModal.classList.remove("show");

    // Update the profile displays with new data
    bioDisplay.textContent = bio || "No bio available.";
    pronounsDisplay.textContent = pronouns || "Pronouns: Not set";
    countryDisplay.innerHTML = `${countryInput.value || "Country: Not set"} ${countryFlag}`;


    alert("Profile updated successfully!");
  } catch (error) {
    console.error("Error updating profile:", error);
    alert("Error updating profile. Please try again.");
  }
});

// Function to display the runs on the player's profile
async function displayPlayerRuns(username) {
    // Define the leaderboard collections to check
    const leaderboardCollections = [
      "leaderboards_hq",
      "leaderboards_sdc",
      "leaderboards_smhq",
      "modded_hq",
      "modded_sdc",
      "modded_smhq"
    ];
  
    // Clear previous runs before fetching new ones
    runsContainer.innerHTML = "<h2>Lethal Company</h2>";
    moddedRunsContainer.innerHTML = "<h2>Modded Lethal Company</h2>";
  
    // Loop through each leaderboard collection
    for (const collectionName of leaderboardCollections) {
      const leaderboardSnapshot = await getDocs(collection(db, collectionName));
  
      // Loop through each document in the collection
      leaderboardSnapshot.forEach((docSnapshot) => {
        const run = docSnapshot.data();
        console.log("Leaderboard data:", run);
  

        // Check if the player's username exists in the players array
        const playerIndex = run.players.findIndex(player => 
            player.trim().toLowerCase() === username.trim().toLowerCase()
        );

  
        // If the username is found in this collection, display the runs
        if (playerIndex !== -1) {
          const player = run.players[playerIndex];
  
          // Create an element to display the run information
          const runDiv = document.createElement('div');
          runDiv.classList.add('run-entry');
  

          const playersDiv = document.createElement('div');
          playersDiv.classList.add('run-players');
          playersDiv.textContent = `Players: ${run.players.join(', ')}`;
          runDiv.appendChild(playersDiv);
      
          const versionDiv = document.createElement('div');
          versionDiv.classList.add('run-version');
          versionDiv.textContent = `Version: ${run.version}`;
          runDiv.appendChild(versionDiv);

          const valueDiv = document.createElement('div');
          valueDiv.classList.add('run-value');
      
          if (collectionName === "leaderboards_hq" || collectionName === "leaderboards_smhq") {
            valueDiv.textContent = `Quota Amount: ${run.quotaAmount || 0}`;
          } else if (collectionName === "leaderboards_sdc") {
            valueDiv.textContent = `Total Scrap: ${run.totalScrap || 0}`;
          }

          if (collectionName === "modded_hq" || collectionName === "modded_smhq") {
            valueDiv.textContent = `Quota Amount: ${run.quotaAmount || 0}`;
          } else if (collectionName === "modded_sdc") {
            valueDiv.textContent = `Total Scrap: ${run.totalScrap || 0}`;
          }

      
          runDiv.appendChild(valueDiv);
      
          const detailsButton = document.createElement('button');
          detailsButton.classList.add('view-details-btn');
          detailsButton.innerHTML = '→';
          detailsButton.onclick = () => showRunDetails(run, index);
          runDiv.appendChild(detailsButton);
    

          if (collectionName == 'leaderboards_hq') {
            runDiv.innerHTML = `
            <h3>High Quota</h3>
            <p><strong>Players:</strong> ${run.players.join(', ')}</p>
            <p><strong>Quota Amount:</strong> ${run.quotaAmount}</p>
            <p><strong>Version:</strong> ${run.version}</p>
          `;
          }

          if (collectionName == 'leaderboards_sdc') {
            runDiv.innerHTML = `
            <h3>Single Day Clear</h3>
            <p><strong>Players:</strong> ${run.players.join(', ')}</p>
            <p><strong>Total Scrap:</strong> ${run.totalScrap}</p>
            <p><strong>Moon:</strong> ${run.moon}</p>
          `;
          }

          if (collectionName == 'leaderboards_smhq') {
            runDiv.innerHTML = `
            <h3>Single Moon High Quota</h3>
            <p><strong>Players:</strong> ${run.players.join(', ')}</p>
            <p><strong>Quota Amount:</strong> ${run.quotaAmount}</p>
            <p><strong>Moon:</strong> ${run.moon}</p>
          `;
          }


          if (collectionName == 'modded_hq') {
            runDiv.innerHTML = `
            <h3>Modded High Quota</h3>
            <p><strong>Players:</strong> ${run.players.join(', ')}</p>
            <p><strong>Quota Amount:</strong> ${run.quotaAmount}</p>
            <p><strong>Mod:</strong> ${run.mod}</p>
            <p><strong>Version:</strong> ${run.version}</p>
          `;
          }

          if (collectionName == 'modded_sdc') {
            runDiv.innerHTML = `
            <h3>Modded Single Day Clear</h3>
            <p><strong>Players:</strong> ${run.players.join(', ')}</p>
            <p><strong>Total Scrap:</strong> ${run.totalScrap}</p>
            <p><strong>Mod:</strong> ${run.mod}</p>
            <p><strong>Moon:</strong> ${run.moon}</p>
          `;
          }

          if (collectionName == 'modded_smhq') {
            runDiv.innerHTML = `
            <h3>Modded Single Moon High Quota</h3>
            <p><strong>Players:</strong> ${run.players.join(', ')}</p>
            <p><strong>Quota Amount:</strong> ${run.quotaAmount}</p>
            <p><strong>Mod:</strong> ${run.mod}</p>
            <p><strong>Moon:</strong> ${run.moon}</p>
          `;
          }
          
          if (collectionName == 'leaderboards_hq' || collectionName === "leaderboards_smhq" || collectionName === "leaderboards_sdc") {
            runsContainer.appendChild(runDiv);
          } else if (collectionName == 'modded_hq' || collectionName === "modded_smhq" || collectionName === "modded_sdc") {
            moddedRunsContainer.appendChild(runDiv);
          }
        }
      });
    }
  }

  
  
  // Call the function to display runs when the profile page loads
  onAuthStateChanged(auth, (user) => {
    if (user) {
      // Fetch the username from the URL params
      const username = new URLSearchParams(window.location.search).get("username");
      displayPlayerRuns(username);
    }
  });

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
          <p><strong>Players:</strong> ${run.players.join(', ')}</p>
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
    } else {
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


document.addEventListener('DOMContentLoaded', function() {
    loadNavbar(handleAuthButtons);
  
      // Loop through options and prepend the flag
      for (let option of countryInput.options) {
          let countryName = option.textContent;
          if (countryFlags[countryName]) {
              option.textContent = `${countryFlags[countryName]} ${countryName}`;
          }
      }

});