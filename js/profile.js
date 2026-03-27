import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js';
import { updateDoc, doc, getDocs, collection, query, where } from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-storage.js';
import { auth, db } from './firebase.js';
import { loadNavbar, countryFlags } from './utils.js';
import { handleAuthButtons } from './auth.js';

const profilePicture = document.getElementById("profile-picture");
const usernameDisplay = document.getElementById("username-display");
const createdAtDisplay = document.getElementById("created-at");
const bioDisplay = document.getElementById("bio");
const pronounsDisplay = document.getElementById("pronouns");
const countryDisplay = document.getElementById("country");

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

let profileUid = null;

const storage = getStorage();

async function fetchUserByUsername(username) {
  const usersRef = collection(db, "users");
  const q = query(usersRef, where("username", "==", username));
  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) {
    console.log("User not found");
    return null;
  }

  const userDoc = querySnapshot.docs[0];
  const userData = userDoc.data();
  return { id: userDoc.id, data: userData };
}

onAuthStateChanged(auth, async (user) => {
  const params = new URLSearchParams(window.location.search);
  const username = params.get("username");
  console.log("Username from URL:", username);

  if (username) {
    const userRecord = await fetchUserByUsername(username);
    if (!userRecord) {
      console.log("user not found");
      return;
    }

    profileUid = userRecord.id;
    const userData = userRecord.data;

    profilePicture.src = userData.profilePicture || "/assets/default-avatar.png";
    usernameDisplay.textContent = userData.username;
    createdAtDisplay.textContent = `Joined: ${userData.createdAt?.toDate ? userData.createdAt.toDate().toLocaleDateString() : userData.createdAt || "N/A"}`;
    bioDisplay.textContent = userData.bio || "No bio available.";
    pronounsDisplay.textContent = `${userData.pronouns || "Pronouns: Not set"}`;

    const countryFlag = countryFlags[userData.country] || '';
    countryDisplay.innerHTML = `${userData.country || "Country: Not set"} ${countryFlag}`;

    if (user && user.uid === profileUid) {
      editProfileButton.style.display = "block";
    }
  }
});

editProfileButton.addEventListener("click", () => {
    bioInput.value = document.getElementById("bio").textContent || "";
    pronounsInput.value = document.getElementById("pronouns").textContent || "";
    countryInput.value = document.getElementById("country").textContent || "";
  
    editProfileModal.classList.add("show");
});

cancelEditButton.addEventListener("click", () => {
  editProfileModal.classList.remove("show");
});

saveChangesButton.addEventListener("click", async () => {
  const user = auth.currentUser;
  if (!user) {
    alert("You must be logged in to update your profile.");
    return;
  }

  const bio = bioInput.value;
  const pronouns = pronounsInput.value;
  const country = countryInput.value;
  const countryFlag = countryFlags[countryInput.value] || '';

  let newProfilePictureUrl = null;

  if (profilePictureInput.files.length > 0) {
    const file = profilePictureInput.files[0];
    const storageRef = ref(storage, `profile_pictures/${user.uid}`);
    
    try {
      const uploadResult = await uploadBytes(storageRef, file);
      newProfilePictureUrl = await getDownloadURL(uploadResult.ref);
    } catch (error) {
      console.error("Error uploading profile picture:", error);
      alert("Error uploading profile picture. Please try again.");
      return;
    }
  }

  try {
    const userRef = doc(db, "users", user.uid);
    const updates = {
        bio: bio,
        pronouns: pronouns,
        country: country,
      };
    
    if (newProfilePictureUrl) {
        updates.profilePicture = newProfilePictureUrl;
    }

    await updateDoc(userRef, updates);
    editProfileModal.classList.remove("show");

    bioDisplay.textContent = bio || "No bio available.";
    pronounsDisplay.textContent = pronouns || "Pronouns: Not set";
    countryDisplay.innerHTML = `${countryInput.value || "Country: Not set"} ${countryFlag}`;


    alert("Profile updated successfully!");
  } catch (error) {
    console.error("Error updating profile:", error);
    alert("Error updating profile. Please try again.");
  }
});

async function displayPlayerRuns(username) {
  const normalizedUsername = username.trim();

  const leaderboardCollections = [
    "leaderboards_hq",
    "leaderboards_sdc",
    "leaderboards_smhq",
    "modded_hq",
    "modded_sdc",
    "modded_smhq"
  ];

  runsContainer.innerHTML = "<h2>Lethal Company</h2>";
  moddedRunsContainer.innerHTML = "<h2>Modded Lethal Company</h2>";

  for (const collectionName of leaderboardCollections) {
    const runsRef = collection(db, collectionName);
    const q = query(runsRef, where("players", "array-contains", normalizedUsername));
    const querySnapshot = await getDocs(q);

    querySnapshot.forEach((docSnapshot) => {
      const run = docSnapshot.data();

      const runDiv = document.createElement('div');
      runDiv.classList.add('run-entry');

      // basic run info
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

      if (collectionName === "leaderboards_hq" || collectionName === "leaderboards_smhq" || collectionName === "modded_hq" || collectionName === "modded_smhq") {
        valueDiv.textContent = `Quota Amount: ${run.quotaAmount || 0}`;
      } else if (collectionName === "leaderboards_sdc" || collectionName === "modded_sdc") {
        valueDiv.textContent = `Total Scrap: ${run.totalScrap || 0}`;
      }
      runDiv.appendChild(valueDiv);

      if (collectionName.startsWith("modded")) {
        moddedRunsContainer.appendChild(runDiv);
      } else {
        runsContainer.appendChild(runDiv);
      }
    });
  }
}


  
  
  onAuthStateChanged(auth, (user) => {
    if (user) {
      const username = new URLSearchParams(window.location.search).get("username");
      if (username) {
          displayPlayerRuns(username);
      }
    }
  });

  export function showRunDetails(run, index) {
    const detailsPanel = document.getElementById('details-panel');
    
    const formatTimestamp = (timestamp) => {
      if (timestamp && timestamp.toDate) {
        return new Date(timestamp.toDate()).toLocaleString();
      }
      return 'N/A';
    };
  
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
  
    const getVideoId = (url) => {
      const regex = /(?:https?:\/\/(?:www\.)?youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/([a-zA-Z0-9_-]+))|youtu\.be\/([a-zA-Z0-9_-]+))/;
      const match = url.match(regex);
      return match ? match[1] || match[2] : '';
    };
  
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
  
      for (let option of countryInput.options) {
          let countryName = option.textContent;
          if (countryFlags[countryName]) {
              option.textContent = `${countryFlags[countryName]} ${countryName}`;
          }
      }

});
