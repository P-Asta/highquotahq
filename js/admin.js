import { loadNavbar } from './utils.js';
import { handleAuthButtons } from './auth.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";
import { doc, getDoc, getDocs, collection, query, where, updateDoc, Timestamp, orderBy, limit, deleteDoc, writeBatch } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";
import { db, auth } from "./firebase.js";

function loadAdminInterface(user) {
    const adminSection = document.getElementById('admin-interface');
    const verifierSection = document.getElementById('verifier-interface');
    const moddedVerifierSection = document.getElementById('modded-verifier-interface');
    const recentVerifiedRunsSection = document.getElementById('recent-verified-runs-interface');
    const sidebar = document.getElementById('sidebar');

    if (user) {
        // Get user data from Firestore
        const userDocRef = doc(db, 'users', user.uid); // Assuming your users are stored with userId as document ID
        getDoc(userDocRef).then((docSnapshot) => {
            if (docSnapshot.exists()) {
                const userData = docSnapshot.data();
                const roles = userData.roles || [];

                // Show appropriate sidebar options based on roles
                sidebar.innerHTML = ''; // Clear previous buttons

                // Show only relevant sidebar options
                if (roles.includes('admin')) {
                    const adminBtn = document.createElement("button");
                    adminBtn.id = "admin-btn";
                    adminBtn.classList.add("sidebar-btn");
                    adminBtn.textContent = "Admin";
                    sidebar.appendChild(adminBtn);
                }
                if (roles.includes('verifier')) {
                    const verifierBtn = document.createElement("button");
                    verifierBtn.id = "verifier-btn";
                    verifierBtn.classList.add("sidebar-btn");
                    verifierBtn.textContent = "Verifier";
                    sidebar.appendChild(verifierBtn);
                }
                if (roles.includes('modded-verifier')) {
                    const moddedVerifierBtn = document.createElement("button");
                    moddedVerifierBtn.id = "modded-verifier-btn";
                    moddedVerifierBtn.classList.add("sidebar-btn");
                    moddedVerifierBtn.textContent = "Modded Verifier";
                    sidebar.appendChild(moddedVerifierBtn);
                }
                if (roles.includes('admin') || roles.includes('verifier') || roles.includes('modded-verifier')) {
                    const recentVerifiedRunsBtn = document.createElement("button");
                    recentVerifiedRunsBtn.id = "recent-verified-runs-btn";
                    recentVerifiedRunsBtn.classList.add("sidebar-btn");
                    recentVerifiedRunsBtn.textContent = "Recently Verified Runs";
                    sidebar.appendChild(recentVerifiedRunsBtn);
                }

                // Now, attach the event listeners to the buttons (after they are added to the DOM)
                const adminBtn = document.getElementById("admin-btn");
                const verifierBtn = document.getElementById("verifier-btn");
                const moddedVerifierBtn = document.getElementById("modded-verifier-btn");
                const recentVerifiedRunsBtn = document.getElementById("recent-verified-runs-btn");

                if (adminBtn) {
                    adminBtn.addEventListener("click", () => {
                        console.log('Admin button clicked');
                        hideAllInterfaces(); // Hide all interfaces first
                        adminSection.classList.add("show"); // Show admin interface using CSS class
                        highlightActiveButton(adminBtn); // Highlight active button
                    });
                }

                if (verifierBtn) {
                    verifierBtn.addEventListener("click", () => {
                        console.log('Verifier button clicked');
                        hideAllInterfaces(); // Hide all interfaces first
                        verifierSection.classList.add("show"); // Show verifier interface using CSS class
                        highlightActiveButton(verifierBtn); // Highlight active button
                        loadVerifierInterface();
                    });
                }

                if (moddedVerifierBtn) {
                    moddedVerifierBtn.addEventListener("click", () => {
                        console.log('Modded Verifier button clicked');
                        hideAllInterfaces(); // Hide all interfaces first
                        moddedVerifierSection.classList.add("show"); // Show modded verifier interface using CSS class
                        highlightActiveButton(moddedVerifierBtn); // Highlight active button
                        loadModdedVerifierInterface();
                    });
                }

                if (recentVerifiedRunsBtn) {
                    recentVerifiedRunsBtn.addEventListener("click", () => {
                        console.log('recent runs button clicked');
                        hideAllInterfaces();
                        recentVerifiedRunsSection.classList.add("show");
                        highlightActiveButton(recentVerifiedRunsBtn);
                        
                    });
                }

                // Hide all sections by default
                hideAllInterfaces(); // Call this function to hide all interfaces
            }
        }).catch((error) => {
            console.error("Error fetching user data: ", error);
        });
    } else {
        console.log("No user logged in");
    }
}

// Function to highlight the active button
const highlightActiveButton = (button) => {
    // Remove active class from all buttons
    const buttons = document.querySelectorAll(".sidebar-btn");
    buttons.forEach(btn => btn.classList.remove("active"));
    
    // Add active class to the clicked button
    button.classList.add("active");
};

const hideAllInterfaces = () => {
    const adminSection = document.getElementById('admin-interface');
    const verifierSection = document.getElementById('verifier-interface');
    const moddedVerifierSection = document.getElementById('modded-verifier-interface');
    const recentVerifiedRunsSection = document.getElementById('recent-verified-runs-interface');
    
    console.log('Hiding all interfaces');
    adminSection.classList.remove("show");
    verifierSection.classList.remove("show");
    moddedVerifierSection.classList.remove("show");
    recentVerifiedRunsSection.classList.remove("show");
};



// Admin Interface JavaScript

const assignRolesButton = document.getElementById('assign-roles-button');
const removeRoleButton = document.getElementById('remove-role-button');
const banUserButton = document.getElementById('ban-user-button');
const unbanUserButton = document.getElementById('unban-user-button');
const usernameInput = document.getElementById('username');
const roleSelect = document.getElementById('role');
const feedbackDiv = document.getElementById('feedback');

// Function to assign a role to a user
const assignRole = async () => {
    const username = usernameInput.value.trim();
    const role = roleSelect.value;

    if (!username) {
        feedbackDiv.textContent = 'Please enter a username.';
        feedbackDiv.style.display = 'block';
        return;
    }

    try {
        const usersCollectionRef = collection(db, 'users');
        const q = query(usersCollectionRef, where('username', '==', username));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            feedbackDiv.textContent = `User with username ${username} not found.`;
            feedbackDiv.style.display = 'block';
            return;
        }

        const userDoc = querySnapshot.docs[0];
        const userData = userDoc.data();
        const roles = userData.roles || [];

        if (!roles.includes(role)) {
            roles.push(role);
        }

        await updateDoc(userDoc.ref, { roles });

        feedbackDiv.textContent = `Role ${role} assigned to ${username}.`;
        feedbackDiv.style.display = 'block';
    } catch (error) {
        feedbackDiv.textContent = `Error assigning role: ${error.message}`;
        feedbackDiv.style.display = 'block';
    }
};

// Function to remove a role from a user
const removeRole = async () => {
    const username = usernameInput.value.trim();
    const role = roleSelect.value;

    if (!username) {
        feedbackDiv.textContent = 'Please enter a username.';
        feedbackDiv.style.display = 'block';
        return;
    }

    try {
        const usersCollectionRef = collection(db, 'users');
        const q = query(usersCollectionRef, where('username', '==', username));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            feedbackDiv.textContent = `User with username ${username} not found.`;
            feedbackDiv.style.display = 'block';
            return;
        }

        const userDoc = querySnapshot.docs[0];
        const userData = userDoc.data();
        const roles = userData.roles || [];

        // Remove the selected role from the user's roles array
        const updatedRoles = roles.filter((roleName) => roleName !== role);

        await updateDoc(userDoc.ref, { roles: updatedRoles });

        feedbackDiv.textContent = `Role ${role} removed from ${username}.`;
        feedbackDiv.style.display = 'block';
    } catch (error) {
        feedbackDiv.textContent = `Error removing role: ${error.message}`;
        feedbackDiv.style.display = 'block';
    }
};

// Function to ban a user and delete all their runs
const banUser = async () => {
    const username = usernameInput.value.trim();

    if (!username) {
        feedbackDiv.textContent = 'Please enter a username.';
        feedbackDiv.style.display = 'block';
        return;
    }

    const confirmBan = window.confirm(`Are you sure you want to ban ${username}?`);
    if (!confirmBan) return;

    try {
        const usersCollectionRef = collection(db, 'users');
        const q = query(usersCollectionRef, where('username', '==', username));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            feedbackDiv.textContent = `User with username ${username} not found.`;
            feedbackDiv.style.display = 'block';
            return;
        }

        const userDoc = querySnapshot.docs[0];

        // Mark user as banned
        await updateDoc(userDoc.ref, { banned: true });

        // Collections to check for runs
        const collections = [
            'leaderboards_hq', 'leaderboards_sdc', 'leaderboards_smhq',
            'modded_hq', 'modded_sdc', 'modded_smhq'
        ];

        const batch = writeBatch(db);

        for (const collectionName of collections) {
            const runsRef = collection(db, collectionName);
            const runsQuery = query(runsRef, where("players", "array-contains", username));
            const runsSnapshot = await getDocs(runsQuery);

            runsSnapshot.forEach(docSnap => {
                batch.delete(docSnap.ref);
            });
        }

        await batch.commit(); // Execute batch delete

        feedbackDiv.textContent = `${username} has been banned, and all their runs have been deleted.`;
        feedbackDiv.style.display = 'block';
    } catch (error) {
        feedbackDiv.textContent = `Error banning user: ${error.message}`;
        feedbackDiv.style.display = 'block';
        console.error("Error banning user:", error);
    }
};

// Function to unban a user
const unbanUser = async () => {
    const username = usernameInput.value.trim();

    if (!username) {
        feedbackDiv.textContent = 'Please enter a username.';
        feedbackDiv.style.display = 'block';
        return;
    }

    try {
        const usersCollectionRef = collection(db, 'users');
        const q = query(usersCollectionRef, where('username', '==', username));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            feedbackDiv.textContent = `User with username ${username} not found.`;
            feedbackDiv.style.display = 'block';
            return;
        }

        const userDoc = querySnapshot.docs[0];
        await updateDoc(userDoc.ref, { banned: false });

        feedbackDiv.textContent = `${username} has been unbanned.`;
        feedbackDiv.style.display = 'block';
    } catch (error) {
        feedbackDiv.textContent = `Error unbanning user: ${error.message}`;
        feedbackDiv.style.display = 'block';
    }
};

// Verifier Interface JavaScript


export function fetchUnverifiedRuns(role) {

    let collections = [];
    let runListContainer = null;

    if (role == "verifier") {
        collections = ['leaderboards_hq', 'leaderboards_smhq', 'leaderboards_sdc'];
        runListContainer = document.getElementById('run-list');
    } else if (role == "moddedVerifier") {
        collections = ['modded_hq', 'modded_smhq', 'modded_sdc'];
        runListContainer = document.getElementById('modded-run-list');
    }


    runListContainer.innerHTML = '';  // Clear any existing runs

    collections.forEach((collectionName) => {
        const runsRef = collection(db, collectionName);
        const q = query(runsRef, where('verified', '==', false));

        getDocs(q)
            .then((querySnapshot) => {
                querySnapshot.forEach((docSnapshot) => {
                    const run = docSnapshot.data();
                    const runId = docSnapshot.id;
                    const claimedBy = run.claimedBy || 'Unclaimed';

                    const players = run.players || ['Unknown Player'];
                    const date = run.date ? new Date(run.date.seconds * 1000).toLocaleString() : 'Unknown Date';
                    const version = run.version || 'Unknown Version';
                    const videos = run.videos || {};  // Assuming videos is a map
                    const videos = run.videos || {};

                    const runItem = document.createElement('div');
                    runItem.classList.add('run-item');
                    runItem.classList.add('clickable-run-item');
                    runItem.setAttribute('data-run-id', runId);
                    runItem.setAttribute('data-collection', collectionName);

                    let additionalInfo = '';

                    // Display the correct fields based on collection
                    if (collectionName === 'leaderboards_hq') {
                        const quotaAmount = run.quotaAmount || 'N/A';
                        const quotaFulfilled = run.quotaFulfilled || 'N/A';
                        const quotaReached = run.quotaReached || 'N/A';
                        const totalScrap = run.totalScrap || 'N/A';

                        additionalInfo = `
                            <p><strong>Quota Amount:</strong> ${quotaAmount}</p>
                            <p><strong>Quota Fulfilled:</strong> ${quotaFulfilled}</p>
                            <p><strong>Quota Reached:</strong> ${quotaReached}</p>
                            <p><strong>Total Scrap:</strong> ${totalScrap}</p>
                        `;
                    } else if (collectionName === 'leaderboards_sdc') {
                        const equipment = Array.isArray(run.equipment) ? run.equipment.join(', ') : (typeof run.equipment === 'string' ? run.equipment : '');
                        const moon = run.moon || 'Unknown Moon';
                        const scrapType = run.scrapType || 'Unknown Scrap Type';
                        const totalScrap = run.totalScrap || 'N/A';

                        additionalInfo = `
                            <p><strong>Equipment:</strong> ${equipment}</p>
                            <p><strong>Moon:</strong> ${moon}</p>
                            <p><strong>Scrap Type:</strong> ${scrapType}</p>
                            <p><strong>Total Scrap:</strong> ${totalScrap}</p>
                        `;
                    } else if (collectionName === 'leaderboards_smhq') {
                        const moon = run.moon || 'Unknown Moon';
                        const quotaAmount = run.quotaAmount || 'N/A';
                        const quotaFulfilled = run.quotaFulfilled || 'N/A';
                        const quotaReached = run.quotaReached || 'N/A';
                        const totalScrap = run.totalScrap || 'N/A';

                        additionalInfo = `
                            <p><strong>Moon:</strong> ${moon}</p>
                            <p><strong>Quota Amount:</strong> ${quotaAmount}</p>
                            <p><strong>Quota Fulfilled:</strong> ${quotaFulfilled}</p>
                            <p><strong>Quota Reached:</strong> ${quotaReached}</p>
                            <p><strong>Total Scrap:</strong> ${totalScrap}</p>
                        `;
                    } else if (collectionName === 'modded_hq') {
                        const quotaAmount = run.quotaAmount || 'N/A';
                        const quotaFulfilled = run.quotaFulfilled || 'N/A';
                        const quotaReached = run.quotaReached || 'N/A';
                        const totalScrap = run.totalScrap || 'N/A';

                        additionalInfo = `
                            <p><strong>Quota Amount:</strong> ${quotaAmount}</p>
                            <p><strong>Quota Fulfilled:</strong> ${quotaFulfilled}</p>
                            <p><strong>Quota Reached:</strong> ${quotaReached}</p>
                            <p><strong>Total Scrap:</strong> ${totalScrap}</p>
                        `;
                    } else if (collectionName === 'modded_sdc') {
                        const equipment = Array.isArray(run.equipment) ? run.equipment.join(', ') : (typeof run.equipment === 'string' ? run.equipment : '');
                        const moon = run.moon || 'Unknown Moon';
                        const scrapType = run.scrapType || 'Unknown Scrap Type';
                        const totalScrap = run.totalScrap || 'N/A';

                        additionalInfo = `
                            <p><strong>Equipment:</strong> ${equipment}</p>
                            <p><strong>Moon:</strong> ${moon}</p>
                            <p><strong>Scrap Type:</strong> ${scrapType}</p>
                            <p><strong>Total Scrap:</strong> ${totalScrap}</p>
                        `;
                    } else if (collectionName === 'modded_smhq') {
                        const moon = run.moon || 'Unknown Moon';
                        const quotaAmount = run.quotaAmount || 'N/A';
                        const quotaFulfilled = run.quotaFulfilled || 'N/A';
                        const quotaReached = run.quotaReached || 'N/A';
                        const totalScrap = run.totalScrap || 'N/A';

                        additionalInfo = `
                            <p><strong>Moon:</strong> ${moon}</p>
                            <p><strong>Quota Amount:</strong> ${quotaAmount}</p>
                            <p><strong>Quota Fulfilled:</strong> ${quotaFulfilled}</p>
                            <p><strong>Quota Reached:</strong> ${quotaReached}</p>
                            <p><strong>Total Scrap:</strong> ${totalScrap}</p>
                        `;
                    }

                    const runItemHTML = `
                        <p><strong>Players:</strong> ${players.slice(0, 3).join(', ')}${players.length > 3 ? ' and more' : ''}</p>
                        <p><strong>Date:</strong> ${date}</p>
                        <p><strong>Version:</strong> ${version}</p>
                        <p><strong>Claimed By:</strong> ${claimedBy}</p>
                        ${additionalInfo}
                    `;
                    runItem.innerHTML = runItemHTML;

                    // If the run is not claimed, show the "Claim" button
                    if (!claimedBy || claimedBy == "Unclaimed") {
                        const claimButton = document.createElement('button');
                        claimButton.innerText = 'Claim Run';
                        claimButton.classList.add('claim-button');
                        claimButton.addEventListener('click', () => claimRun(runId, collectionName, role));
                        runItem.appendChild(claimButton);
                    }
                    
                    runListContainer.appendChild(runItem);

                    // Bind event listener to each run item
                    runItem.addEventListener('click', () => {
                        showRunDetails(runId, collectionName, run, role);
                    });
                    
                });
            })
            .catch((error) => {
                console.error(`Error fetching unverified runs from ${collectionName}:`, error);
            });
    });
}

export function showRunDetails(runId, collectionName, run, role) {
    
    const user = auth.currentUser;
    let runListContainer = null;
    let runDetailsContainer = null;

    if (role == "verifier") {
        runListContainer = document.getElementById('run-list');
        runDetailsContainer = document.getElementById('run-details-container');
    } else if (role == "moddedVerifier") {
        runListContainer = document.getElementById('modded-run-list');
        runDetailsContainer = document.getElementById('modded-run-details-container');
    }


    runListContainer.style.display = 'none'; // Hide the list of runs

    runDetailsContainer.style.display = 'block'; // Show the run details container

    const claimedBy = run.claimedBy || 'Unclaimed'; // Default to "Unclaimed" if no value is set
    
    const claimButton = document.getElementById('claim-button');

    // Check if the claim button exists before trying to use it
    if (claimButton) {
        if (claimedBy && claimedBy !== user?.username) {
            claimButton.style.display = 'none';
        }
    }

    // Extract common fields from the run object
    const players = run.players || ['Unknown Player'];
    const date = run.date ? run.date.toDate().toLocaleString() : 'Unknown Date';
    const version = run.version || 'Unknown Version';
    const unrestricted = run.unrestricted !== undefined ? run.unrestricted : false;
    const videos = run.videos || {};
    const logs = run.logs || 'Unknown Logs';
    const comments = run.comments || 'No Comments';

    let additionalInfo = '';
    let equipmentField = '';

    // Collection-specific fields
    if (collectionName === 'leaderboards_hq') {
        const quotaAmount = run.quotaAmount || 0;
        const quotaFulfilled = run.quotaFulfilled || 0;
        const quotaReached = run.quotaReached || 0;
        const totalScrap = run.totalScrap || 0;

        additionalInfo = `
            <label>Quota Amount: <input type="number" value="${quotaAmount}" disabled data-field="quotaAmount"></label><br>
            <label>Quota Fulfilled: <input type="number" value="${quotaFulfilled}" disabled data-field="quotaFulfilled"></label><br>
            <label>Quota Reached: <input type="number" value="${quotaReached}" disabled data-field="quotaReached"></label><br>
            <label>Total Scrap: <input type="number" value="${totalScrap}" disabled data-field="totalScrap"></label><br>
        `;
    } else if (collectionName === 'leaderboards_sdc') {
        const equipment = Array.isArray(run.equipment) ? run.equipment.join(', ') : (typeof run.equipment === 'string' ? run.equipment : '');
        const moon = run.moon || 'Unknown Moon';
        const scrapType = run.scrapType || 'Unknown Scrap Type';
        const totalScrap = run.totalScrap || 0;

        additionalInfo = `
            <label>Equipment: <input type="text" value="${equipment}" disabled data-field="equipment"></label><br>
            <label>Moon: <input type="text" value="${moon}" disabled data-field="moon"></label><br>
            <label>Scrap Type: <input type="text" value="${scrapType}" disabled data-field="scrapType"></label><br>
            <label>Total Scrap: <input type="number" value="${totalScrap}" disabled data-field="totalScrap"></label><br>
        `;
    } else if (collectionName === 'leaderboards_smhq') {
        const moon = run.moon || 'Unknown Moon';
        const quotaAmount = run.quotaAmount || 0;
        const quotaFulfilled = run.quotaFulfilled || 0;
        const quotaReached = run.quotaReached || 0;
        const totalScrap = run.totalScrap || 0;

        additionalInfo = `
            <label>Moon: <input type="text" value="${moon}" disabled data-field="moon"></label><br>
            <label>Quota Amount: <input type="number" value="${quotaAmount}" disabled data-field="quotaAmount"></label><br>
            <label>Quota Fulfilled: <input type="number" value="${quotaFulfilled}" disabled data-field="quotaFulfilled"></label><br>
            <label>Quota Reached: <input type="number" value="${quotaReached}" disabled data-field="quotaReached"></label><br>
            <label>Total Scrap: <input type="number" value="${totalScrap}" disabled data-field="totalScrap"></label><br>
        `;
    } else if (collectionName === 'modded_hq') {
        const quotaAmount = run.quotaAmount || 0;
        const quotaFulfilled = run.quotaFulfilled || 0;
        const quotaReached = run.quotaReached || 0;
        const totalScrap = run.totalScrap || 0;

        additionalInfo = `
            <label>Quota Amount: <input type="number" value="${quotaAmount}" disabled data-field="quotaAmount"></label><br>
            <label>Quota Fulfilled: <input type="number" value="${quotaFulfilled}" disabled data-field="quotaFulfilled"></label><br>
            <label>Quota Reached: <input type="number" value="${quotaReached}" disabled data-field="quotaReached"></label><br>
            <label>Total Scrap: <input type="number" value="${totalScrap}" disabled data-field="totalScrap"></label><br>
        `;
    } else if (collectionName === 'modded_sdc') {
        const equipment = Array.isArray(run.equipment) ? run.equipment.join(', ') : (typeof run.equipment === 'string' ? run.equipment : '');
        const moon = run.moon || 'Unknown Moon';
        const scrapType = run.scrapType || 'Unknown Scrap Type';
        const totalScrap = run.totalScrap || 0;

        additionalInfo = `
            <label>Equipment: <input type="text" value="${equipment}" disabled data-field="equipment"></label><br>
            <label>Moon: <input type="text" value="${moon}" disabled data-field="moon"></label><br>
            <label>Scrap Type: <input type="text" value="${scrapType}" disabled data-field="scrapType"></label><br>
            <label>Total Scrap: <input type="number" value="${totalScrap}" disabled data-field="totalScrap"></label><br>
        `;
    } else if (collectionName === 'modded_smhq') {
        const moon = run.moon || 'Unknown Moon';
        const quotaAmount = run.quotaAmount || 0;
        const quotaFulfilled = run.quotaFulfilled || 0;
        const quotaReached = run.quotaReached || 0;
        const totalScrap = run.totalScrap || 0;

        additionalInfo = `
            <label>Moon: <input type="text" value="${moon}" disabled data-field="moon"></label><br>
            <label>Quota Amount: <input type="number" value="${quotaAmount}" disabled data-field="quotaAmount"></label><br>
            <label>Quota Fulfilled: <input type="number" value="${quotaFulfilled}" disabled data-field="quotaFulfilled"></label><br>
            <label>Quota Reached: <input type="number" value="${quotaReached}" disabled data-field="quotaReached"></label><br>
            <label>Total Scrap: <input type="number" value="${totalScrap}" disabled data-field="totalScrap"></label><br>
        `;
    }

    let runDetails = `
        <h4>Run Details (ID: ${runId})</h4>
        <label>Players: <input type="text" value="${Array.isArray(players) ? players.join(', ') : players}" disabled data-field="players"></label><br>
        <label>Date: <input type="text" value="${date}" disabled data-field="date"></label><br>
        <label>Version: <input type="text" value="${version}" disabled data-field="version"></label><br>
        <label>Unrestricted: 
            <select disabled data-field="unrestricted">
                <option value="true" ${unrestricted ? 'selected' : ''}>Yes</option>
                <option value="false" ${!unrestricted ? 'selected' : ''}>No</option>
            </select>
        </label><br>
        <label>Claimed By: <input type="text" value="${claimedBy}" disabled data-field="claimedBy"></label><br>
        <label>Logs: <input type="text" value="${logs}" disabled data-field="logs"></label><br>
        <label>Comments: <input type="text" value="${comments}" disabled data-field="comments"></label><br>
        ${additionalInfo}
        <h5>Video Links:</h5>
    `;

    // Generate video links dynamically from the videos map
    for (const [player, urls] of Object.entries(videos)) {
        runDetails += `<label>${player}: 
            <input type="text" value="${urls.join(', ')}" disabled data-field="videos-${player}">
        </label><br>`;
    }

    runDetails += `
        <div class="button-group">
            <button class="edit-button" id="edit-button">Edit</button>
            <button class="save-button" id="save-button" style="display: none;">Save</button>
            <button class="cancel-button" id="cancel-button" style="display: none;">Cancel</button>
            <button class="verify-button" id="verify-button">Verify</button>
            <button class="reject-button" id="reject-button">Reject</button>
        </div>
        <button id="back-to-list">Back to List</button>
    `;

    console.log("Updating runDetailsContainer with:", runDetails);

    runDetailsContainer.innerHTML = runDetails;


    // Ensure the buttons are in the correct state when entering the run details interface
    resetButtonStates();

    // Handle button clicks
    runDetailsContainer.addEventListener('click', function (event) {
        const target = event.target;

        if (target.matches('#edit-button')) {
            console.log("Edit button clicked");
            const fields = runDetailsContainer.querySelectorAll('[data-field]');
            fields.forEach(field => field.disabled = false);
            resetButtonStates('edit');
        } else if (target.matches('#save-button')) {
            console.log("Save button clicked");
            const fields = runDetailsContainer.querySelectorAll('[data-field]');
            const updatedRun = {};

            fields.forEach(field => {
                const fieldName = field.getAttribute('data-field');
                if (fieldName === 'date' && field.value) {
                    updatedRun[fieldName] = Timestamp.fromDate(new Date(field.value)); // directly save as Firestore Timestamp
                } else if (fieldName.startsWith('videos-')) {
                    const player = fieldName.split('-')[1];
                    updatedRun.videos = updatedRun.videos || {};
                    updatedRun.videos[player] = field.value.split(',').map(url => url.trim());
                } else if (field.type === 'select-one') {
                    updatedRun[fieldName] = field.value === 'true';
                } else if (field.type === 'number') {
                    updatedRun[fieldName] = parseFloat(field.value);
                } else if (Array.isArray(run[fieldName])) {
                    updatedRun[fieldName] = field.value.split(',').map(item => item.trim());
                } else {
                    updatedRun[fieldName] = field.value;
                }
                field.disabled = true;
            });

            saveRunDetails(runId, collectionName, updatedRun)
                .then(() => {
                    console.log(`Run ${runId} updated successfully.`);
                    resetButtonStates('save');
                })
                .catch((error) => {
                    console.error('Error updating run:', error);
                });
        } else if (target.matches('#cancel-button')) {
            console.log("Cancel button clicked");
            const fields = runDetailsContainer.querySelectorAll('[data-field]');
            fields.forEach(field => field.disabled = true);
            resetButtonStates('cancel');
        } else if (target.matches('#verify-button')) {
            console.log("Verify button clicked");
            verifyRun(runId, collectionName, role);
        } else if (target.matches('#reject-button')) {
            console.log("Reject button clicked");
            rejectRun(runId, collectionName, role);
        } else if (target.matches('#back-to-list')) {
            console.log("🔄 Back button clicked via delegation!");
            backToList(role);
        }
    });

    // Helper function to reset button visibility states
    function resetButtonStates(buttonClicked = '') {
        const editButton = document.getElementById('edit-button');
        const saveButton = document.getElementById('save-button');
        const cancelButton = document.getElementById('cancel-button');

        // Reset all button states
        editButton.style.display = 'inline-block';
        saveButton.style.display = 'none';
        cancelButton.style.display = 'none';

        // Adjust button visibility based on the button clicked
        if (buttonClicked === 'edit') {
            editButton.style.display = 'none';
            saveButton.style.display = 'inline-block';
            cancelButton.style.display = 'inline-block';
        } else if (buttonClicked === 'save') {
            editButton.style.display = 'inline-block';
            saveButton.style.display = 'none';
            cancelButton.style.display = 'none';
        } else if (buttonClicked === 'cancel') {
            editButton.style.display = 'inline-block';
            saveButton.style.display = 'none';
            cancelButton.style.display = 'none';
        }
    }
    }

// Helper function to save run details
async function saveRunDetails(runId, collectionName, updatedRun) {
    const runRef = doc(db, collectionName, runId);
    await updateDoc(runRef, updatedRun);
}

// Back to the list of runs
export function backToList(role) {
    console.log(`📌 backToList() triggered for role: ${role}`);
    let runDetailsContainer = null;
    let runListContainer = null;


    if (role == "verifier") {
        runDetailsContainer = document.getElementById('run-details-container');
        runListContainer = document.getElementById('run-list');
    } else if (role == "moddedVerifier") {
        runDetailsContainer = document.getElementById('modded-run-details-container');
        runListContainer = document.getElementById('modded-run-list');
    }


    runDetailsContainer.style.display = 'none'; // Hide the details
    runListContainer.style.display = 'block'; // Show the list again
}
  
async function verifyRun(runId, collectionName, role) {
    const user = auth.currentUser;

    if (!user) return;

    const username = await getUsername(user.uid);
    if (!username) return;

    const confirmVerify = window.confirm(`Are you sure you want to verify this run?`);
    if (!confirmVerify) return;

    const runRef = doc(db, collectionName, runId);
    const newRunSnap = await getDoc(runRef);

    if (!newRunSnap.exists()) {
        console.error(`Run ${runId} not found in ${collectionName}.`);
        return;
    }

    const newRun = newRunSnap.data();
    const batch = writeBatch(db);

    // Build the query to find obsolete runs
    let queryConstraints = [
        where("players", "==", newRun.players),
        where("version", "==", newRun.version)
    ];

    if (newRun.hasOwnProperty("moon")) {
        queryConstraints.push(where("moon", "==", newRun.moon));
    }

    const obsoleteRunsQuery = query(collection(db, collectionName), ...queryConstraints);
    const obsoleteRunsSnap = await getDocs(obsoleteRunsQuery);

    obsoleteRunsSnap.forEach(docSnap => {
        if (docSnap.id !== runId) {
            batch.delete(doc(db, collectionName, docSnap.id));
        }
    });

    // Mark the new run as verified
    batch.update(runRef, {
        verified: true,
        verifiedBy: username,
        verifiedAt: new Date()
    });

    try {
        await batch.commit();
        console.log(`Run ${runId} from ${collectionName} verified. Deleted ${obsoleteRunsSnap.size} obsolete runs.`);
        fetchUnverifiedRuns(role);
    } catch (error) {
        console.error(`Error verifying run ${runId}:`, error);
    }
}

 
// Reject the run by deleting it from Firestore in the correct collection
export function rejectRun(runId, collectionName, role) {

    const confirmReject = window.confirm(`Are you sure you want to reject this run?`);
    if (!confirmReject) return;

    const runRef = doc(db, collectionName, runId);
    deleteDoc(runRef)
    .then(() => {
        console.log(`Run ${runId} from ${collectionName} rejected.`);
        // Call fetchUnverifiedRuns to refresh the list
        fetchUnverifiedRuns(role);
    })
    .catch((error) => {
        console.error(`Error rejecting run ${runId} from ${collectionName}:`, error);
    });
}

// Fetch the username from the 'users' collection
async function getUsername(uid) {
  const userDocRef = doc(db, 'users', uid);
  const userDoc = await getDoc(userDocRef);

  if (userDoc.exists()) {
    return userDoc.data().username; // Assuming the 'username' field exists
  } else {
    console.log('No user document found');
    return null;
  }
}

async function claimRun(runId, collectionName, role) {
    const user = auth.currentUser;

    if (user) {
        const username = await getUsername(user.uid);  // Retrieve the username

        if (username) {
            const runRef = doc(db, collectionName, runId);
            await updateDoc(runRef, {
                claimedBy: username,  // Store who claimed the run
                claimedAt: new Date()  // Timestamp when it was claimed
            })
            .then(() => {
                console.log(`Run ${runId} claimed by ${username}`);
                // Reload the list to reflect the updated state (with claimed runs hidden or disabled)
                fetchUnverifiedRuns(role);
            })
            .catch((error) => {
                console.error('Error claiming run:', error);
            });
        }
    }
}

async function displayRecentlyVerifiedRuns() {
    const collections = ['leaderboards_hq', 'leaderboards_sdc', 'leaderboards_smhq', 'modded_hq', 'modded_sdc', 'modded_smhq'];
    const tableBody = document.getElementById("recent-verified-runs").getElementsByTagName("tbody")[0];
    
    tableBody.innerHTML = ''; // Clear the table once before looping
    let allRuns = [];

    for (const collectionName of collections) { // FIXED for loop
        const runsRef = collection(db, collectionName);

        const q = query(runsRef, where("verifiedAt", ">", new Date(0)), orderBy("verifiedAt", "desc"), limit(10));

        try {
            const querySnapshot = await getDocs(q);
            
            querySnapshot.forEach((doc) => {
                allRuns.push({
                    id: doc.id,
                    verifiedBy: doc.data().verifiedBy || 'Unknown',
                    verifiedAt: doc.data().verifiedAt.seconds * 1000, // Convert to timestamp
                });
            });

        } catch (error) {
            console.error(`Error fetching recent verified runs from ${collectionName}:`, error);
        }
    }

    // Sort all results by verifiedAt in descending order
    allRuns.sort((a, b) => b.verifiedAt - a.verifiedAt);

    // Take only the top 10 most recent runs
    allRuns.slice(0, 10).forEach(run => {
        const row = tableBody.insertRow();
        row.insertCell(0).textContent = run.id;
        row.insertCell(1).textContent = run.verifiedBy;
        row.insertCell(2).textContent = new Date(run.verifiedAt).toLocaleString();
    });
}

// Function to initialize the verifier interface when the button is clicked
export function loadVerifierInterface() {
    const verifierSection = document.getElementById('verifier-interface');
    verifierSection.classList.add('show');  // Show verifier interface

    // Fetch and display unverified runs
    fetchUnverifiedRuns("verifier");
}

export function loadModdedVerifierInterface() {
    const moddedVerifierSection = document.getElementById('modded-verifier-interface');
    moddedVerifierSection.classList.add('show');  // Show verifier interface

    // Fetch and display unverified runs
    fetchUnverifiedRuns("moddedVerifier");
}


// Listen for authentication state changes
onAuthStateChanged(auth, (user) => {
    if (user) {
        loadAdminInterface(user);
    } else {
        console.log("No user authenticated");
    }
});

document.addEventListener("DOMContentLoaded", () => {
    displayRecentlyVerifiedRuns();
});

document.addEventListener('DOMContentLoaded', function() {
    loadNavbar(handleAuthButtons);
    assignRolesButton.addEventListener('click', assignRole);
    removeRoleButton.addEventListener('click', removeRole);
    banUserButton.addEventListener('click', banUser);
    unbanUserButton.addEventListener('click', unbanUser);
});