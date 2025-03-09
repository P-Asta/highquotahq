import { loadNavbar } from './utils.js';
import { handleAuthButtons } from './auth.js';
import { getDocs, collection } from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js';
import { db } from './firebase.js';


const teamSection = document.getElementById('team-section');

// Backup profile picture URL in case the user doesn't have one
const backupProfilePic = "path/to/backup-image.jpg"; // Replace with your backup image path

const fetchTeamMembers = async () => {
  try {
    // Fetching all users from the Firestore 'users' collection
    const usersSnapshot = await getDocs(collection(db, 'users'));
    
    const admins = [];
    const verifiers = [];
    const moddedVerifiers = [];
    const siteDevelopers = [];

    usersSnapshot.forEach(doc => {
      const userData = doc.data();
      const { username, roles, profilePicture } = userData;

      // Ensure the roles field exists and is an array
      if (Array.isArray(roles)) {
        // Check if the user has specific roles
        if (roles.includes('admin')) {
          admins.push({ username, profilePicture });
        }
        if (roles.includes('verifier')) {
          verifiers.push({ username, profilePicture });
        }
        if (roles.includes('modded-verifier')) {
          moddedVerifiers.push({ username, profilePicture });
        }
        if (roles.includes('site-developer')) {
          siteDevelopers.push({ username, profilePicture });
        }
      }
    });

    // Display team members with links and profile pictures
    displayTeamMembers(admins, verifiers, moddedVerifiers, siteDevelopers);

  } catch (error) {
    console.error("Error fetching team members:", error);
  }
};

const displayTeamMembers = (admins, verifiers, moddedVerifiers, siteDevelopers) => {
  // Function to create an anchor tag for each username linking to their profile
  const createProfileLink = (username, profilePicURL) => {
    const link = document.createElement('a');
    link.href = `/pages/profile.html?username=${username}`;  // Assuming profile URL is like /profile/username
    link.target = "_blank"; // Open in a new tab

    // Create the image element for the profile picture
    const profilePic = document.createElement('img');
    profilePic.src = profilePicURL || backupProfilePic;  // Use backup image if no profile picture
    profilePic.alt = `${username}'s Profile Picture`;
    profilePic.classList.add('team-member-profile-pic'); // Add a class for styling

    // Create a span for the username
    const memberName = document.createElement('span');
    memberName.textContent = username;

    // Append the profile picture and name to the anchor tag
    link.appendChild(profilePic);
    link.appendChild(memberName);

    return link;
  };

  // Admins
  const adminList = document.getElementById('admin-list');
  admins.forEach(admin => {
    const listItem = document.createElement('li');
    const profileLink = createProfileLink(admin.username, admin.profilePicture);
    listItem.appendChild(profileLink);
    adminList.appendChild(listItem);
  });

  // Verifiers
  const verifierList = document.getElementById('verifier-list');
  verifiers.forEach(verifier => {
    const listItem = document.createElement('li');
    const profileLink = createProfileLink(verifier.username, verifier.profilePicture);
    listItem.appendChild(profileLink);
    verifierList.appendChild(listItem);
  });

  // Modded Verifiers
  const moddedVerifierList = document.getElementById('modded-verifier-list');
  moddedVerifiers.forEach(moddedVerifier => {
    const listItem = document.createElement('li');
    const profileLink = createProfileLink(moddedVerifier.username, moddedVerifier.profilePicture);
    listItem.appendChild(profileLink);
    moddedVerifierList.appendChild(listItem);
  });

  // Site Developers
  const siteDeveloperList = document.getElementById('site-developer-list');
  siteDevelopers.forEach(siteDeveloper => {
    const listItem = document.createElement('li');
    const profileLink = createProfileLink(siteDeveloper.username, siteDeveloper.profilePicture);
    listItem.appendChild(profileLink);
    siteDeveloperList.appendChild(listItem);
  });
};

// Fetch and display the team members on page load
window.onload = fetchTeamMembers;


document.addEventListener('DOMContentLoaded', function() {
    loadNavbar(handleAuthButtons);
});