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
    displayPlayerRuns(username);
  }
});

editProfileButton.addEventListener("click", () => {
    bioInput.value = document.getElementById("bio").textContent || "";
    pronounsInput.value = document.getElementById("pronouns").textContent || "";
    countryInput.value = document.getElementById("country").textContent || "";
  
    editProfileModal.classList.add("show");
    editProfileModal.classList.remove("hidden");
});

cancelEditButton.addEventListener("click", () => {
  editProfileModal.classList.remove("show");
  editProfileModal.classList.add("hidden");
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
    editProfileModal.classList.add("hidden");

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
    'leaderboards_hq',
    'leaderboards_smhq',
    'leaderboards_sdc',
    'lc_modded_brutal_hq',
    'lc_modded_brutal_smhq',
    'lc_modded_brutal_sdc',
    'lc_modded_eclipsed_hq',
    'lc_modded_eclipsed_smhq',
    'lc_modded_wesleysmoons_hq',
    'lc_modded_wesleysmoons_smhq',
    'lc_modded_wesleysmoons_sdc',
    'lc_modded_classicmoons_hq',
    'lc_modded_classicmoons_smhq',
    'lc_modded_classicmoons_sdc'
  ];

  const collectionDisplayNames = {
    'leaderboards_hq': 'High Quota',
    'leaderboards_smhq': 'Single Moon High Quota',
    'leaderboards_sdc': 'Single Day Clear',
    'lc_modded_brutal_hq': 'Brutal Company High Quota',
    'lc_modded_brutal_smhq': 'Brutal Company Single Moon High Quota',
    'lc_modded_brutal_sdc': 'Brutal Company Single Day Clear',
    'lc_modded_eclipsed_hq': 'Eclipsed Only High Quota',
    'lc_modded_eclipsed_smhq': 'Eclipsed Only Single Moon High Quota',
    'lc_modded_wesleysmoons_hq': "Wesley's Moons High Quota",
    'lc_modded_wesleysmoons_smhq': "Wesley's Moons Single Moon High Quota",
    'lc_modded_wesleysmoons_sdc': "Wesley's Moons Single Day Clear",
    'lc_modded_classicmoons_hq': 'Classic Moons High Quota',
    'lc_modded_classicmoons_smhq': 'Classic Moons Single Moon High Quota',
    'lc_modded_classicmoons_sdc': 'Classic Moons Single Day Clear'
  };

  runsContainer.innerHTML = "<h2>Lethal Company</h2>";
  moddedRunsContainer.innerHTML = "<h2>Modded Lethal Company</h2>";

  for (const collectionName of leaderboardCollections) {
    const runsRef = collection(db, collectionName);
    const q = query(runsRef, where("players", "array-contains", normalizedUsername));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty){
      continue;
    }
    const sectionHeader = document.createElement('h3');
    sectionHeader.textContent = collectionDisplayNames[collectionName] || collectionName;
    const collectionContainer = document.createElement('div');
    if (collectionName.startsWith("lc_modded")){
        moddedRunsContainer.appendChild(sectionHeader);
        moddedRunsContainer.appendChild(collectionContainer);
    }else{
      runsContainer.appendChild(sectionHeader);
      runsContainer.appendChild(collectionContainer);
    }

    querySnapshot.forEach((docSnapshot) => {
      const run = docSnapshot.data();
      const runId = docSnapshot.id;
      
      const players = run.players || ['Unknown Player'];
      const version = run.version || 'Unknown Version';

      const runDiv = document.createElement('div');
      runDiv.classList.add('run-entry');

      // basic run info
      const playersDiv = document.createElement('div');
      playersDiv.classList.add('run-players');
      playersDiv.textContent = `Players: ${run.players.join(', ')}`;
      runDiv.appendChild(playersDiv);

      const metadataDiv = document.createElement('div');
      metadataDiv.classList.add('run-metadata');
      if (collectionName.endsWith("smhq") || collectionName.endsWith("sdc")){
        metadataDiv.textContent = `Moon: ${run.moon} - Version: ${version}`
      }else{
      metadataDiv.textContent = `Version: ${version}`;
      }
      runDiv.appendChild(metadataDiv);

      const valueDiv = document.createElement('div');
      valueDiv.classList.add('run-value');

      if (collectionName.endsWith('hq')) {
        valueDiv.textContent = `Quota Amount: ${run.quotaAmount || 0}`;
      } else if (collectionName.endsWith('sdc')) {
        valueDiv.textContent = `Total Scrap: ${run.totalScrap || 0}`;
      }

      runDiv.appendChild(valueDiv);

      const detailsButton = document.createElement('button');
      detailsButton.classList.add('view-details-btn');
      detailsButton.innerHTML = '→';
      detailsButton.onclick = () => showRunDetails(run, runId, collectionName);
      runDiv.appendChild(detailsButton);

      collectionContainer.appendChild(runDiv);
    });
  }
}

export function showRunDetails(run, index, collectionName) {
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
                ${videos.map(video => `<div class=video-thumbnail-cropper><a href="${video}" target="_blank"><img src="${getThumbnail(video)}" alt="${video}" class="video-thumbnail"></a></div>`).join('')}
              </div>
            </div>
          `;
        }
        return '';
      }).join('');
    }
    return 'No videos available.';
  };

  const getThumbnail = (url) => {
    const videoId = getVideoId(url);
    if (videoId === ''){
      return `/assets/link_thumbnail.png`;
    }else{
      return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
    }
  }

  const getVideoId = (url) => {
    const regex = /(?:https?:\/\/(?:www\.)?youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?|watch(?:\/|\?\S*v=))([a-zA-Z0-9_-]+))|youtu\.be\/([a-zA-Z0-9_-]+))/;
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
        <p><strong>Players:</strong> 
          ${run.players.map(player => 
            `<a href="/pages/profile.html?username=${encodeURIComponent(player)}" class="player-link">${player}</a>`
          ).join(', ')}
        </p>
        <p><strong>Date:</strong> ${formatTimestamp(run.date)}</p>
  `;

  if (collectionName.endsWith('_hq')) {
    runDetailsHtml += `
      <p><strong>Quota Amount:</strong> ${run.quotaAmount}</p>
      <p><strong>Quota Fulfilled:</strong> ${run.quotaFulfilled}</p>
      <p><strong>Quota Reached:</strong> ${run.quotaReached}</p>
      <p><strong>Total Scrap:</strong> ${run.totalScrap}</p>
      <p><strong>Verified At:</strong> ${formatTimestamp(run.verifiedAt)}</p>
      <p><strong>Verified By:</strong> ${run.verifiedBy}</p>
      <p><strong>Version:</strong> ${run.version}</p>
    `;
  }
  else if (collectionName.endsWith('_sdc')) {
    runDetailsHtml += `
      <p><strong>Total Scrap:</strong> ${run.totalScrap}</p>
      <p><strong>Scrap Type:</strong> ${run.scrapType}</p>
      <p><strong>Equipment:</strong> ${run.equipment}</p>
      <p><strong>Moon:</strong> ${run.moon}</p>
      <p><strong>Verified At:</strong> ${formatTimestamp(run.verifiedAt)}</p>
      <p><strong>Verified By:</strong> ${run.verifiedBy}</p>
      <p><strong>Version:</strong> ${run.version}</p>
    `;
  }
  else if (collectionName.endsWith('_smhq')) {
    runDetailsHtml += `
      <p><strong>Quota Amount:</strong> ${run.quotaAmount}</p>
      <p><strong>Quota Fulfilled:</strong> ${run.quotaFulfilled}</p>
      <p><strong>Quota Reached:</strong> ${run.quotaReached}</p>
      <p><strong>Total Scrap:</strong> ${run.totalScrap}</p>
      <p><strong>Moon:</strong> ${run.moon}</p>
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
    const profilecard = document.getElementById('profile-card');
    const editprofile = document.getElementById('edit-profile-modal');
    const runscontainer = document.getElementById('runs-container');
    const modrunscontainer = document.getElementById('modded-runs-container');
    profilecard.classList.add('hidden');
    editprofile.classList.add('hidden');
    runscontainer.classList.add('hidden');
    modrunscontainer.classList.add('hidden');
  }, 50);

  const closeBtn = document.getElementById('close-btn');
  if (closeBtn) {
    closeBtn.addEventListener('click', closeRunDetails);
  }
}

function closeRunDetails() {
  const detailsPanel = document.getElementById('details-panel');
  detailsPanel.classList.remove('active');
  
  const profilecard = document.getElementById('profile-card');
  const editprofile = document.getElementById('edit-profile-modal');
  const runscontainer = document.getElementById('runs-container');
  const modrunscontainer = document.getElementById('modded-runs-container');
  profilecard.classList.remove('hidden');
  editprofile.classList.remove('hidden');
  runscontainer.classList.remove('hidden');
  modrunscontainer.classList.remove('hidden');
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
