import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";
import { doc, getDoc, updateDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";
import { db, auth } from "./firebase.js"; // Ensure this points to your Firebase setup

export function loadNavbar(onLoadedCallback) {
  const navbarPlaceholder = document.getElementById('navbar-placeholder');

  fetch('/partials/footer.html')
  .then(res => res.text())
  .then(data => {
    document.getElementById('footer-placeholder').innerHTML = data;
  })
  .catch(err => console.error('Failed to load footer:', err));

  if (navbarPlaceholder) {
    fetch('/lethal-company/partials/navbar.html')
      .then(response => response.text())
      .then(async (data) => {
        navbarPlaceholder.innerHTML = data;

        // Add event listeners for navigation
        const homeButton = document.getElementById('home-button');
        const leaderboardsButton = document.getElementById('leaderboards-button');
        const submissionsButton = document.getElementById('submissions-button');
        const guidesButton = document.getElementById('guides-button');
        const adminButton = document.getElementById('admin-button');
        const loginButton = document.getElementById('login-button');
        const logoutButton = document.getElementById('logout-button');
        const profileButton = document.getElementById('profile-button');

        // Navigation button event listeners
        if (homeButton) homeButton.addEventListener('click', () => window.location.href = '/lethal-company/index.html');
        if (leaderboardsButton) leaderboardsButton.addEventListener('click', () => window.location.href = '/lethal-company/pages/leaderboards.html');
        if (submissionsButton) submissionsButton.addEventListener('click', () => window.location.href = '/lethal-company/pages/submissions.html');
        if (guidesButton) guidesButton.addEventListener('click', () => window.location.href = '/lethal-company/pages/guides.html');

        // Dropdown handling
        const dropdown = document.querySelector('.dropdown');
        if (dropdown) {
          const dropdownButton = dropdown.querySelector('.dropdown-button');
          const dropdownMenu = dropdown.querySelector('.dropdown-menu');

          // Toggle dropdown on click
          dropdownButton.addEventListener('click', () => {
            dropdown.classList.toggle('active');
          });

          // Handle dropdown item selection
          dropdownMenu.addEventListener('click', (event) => {
            const selectedItem = event.target.closest('li');

            if (selectedItem) {
              // Check if the selected item is the Home button
              if (selectedItem.getAttribute('data-home')) {
                window.location.href = '/index.html'; // Navigate to homepage
                return;
              }

              // Handle game-specific selections
              const newLogo = selectedItem.getAttribute('data-logo') || 'path/to/missing-logo.png';
              dropdownButton.querySelector('.logo').src = newLogo;

              const gameRoute = selectedItem.getAttribute('data-game');
              if (gameRoute) {
                window.location.href = `/${gameRoute}/index.html`; // Adjust paths as needed
              }

              // Collapse the dropdown
              dropdown.classList.remove('active');
            }
          });
        }

        // Monitor auth state
        onAuthStateChanged(auth, async (user) => {
          if (user) {
            const userId = user.uid;

            if (profileButton) {
              profileButton.style.display = 'block';
              profileButton.addEventListener('click', () => window.location.href = '/pages/profile.html?username=' + {userId});
            }

            try {
              const userDocRef = doc(db, "users", userId);
              const userDoc = await getDoc(userDocRef);

              if (userDoc.exists()) {
                const userData = userDoc.data();
                const username = userData.username;
                const roles = userData.roles || [];

                if (profileButton) {
                  profileButton.style.display = 'block';
                  profileButton.addEventListener('click', () => {window.location.href = '/pages/profile.html?username=' + encodeURIComponent(username);});
                }

                // Show admin button if the user is an admin
                if (roles.includes("admin")) {
                  if (adminButton) {
                    adminButton.style.display = 'block';
                    adminButton.addEventListener('click', () => window.location.href = '/pages/admin.html');
                  }
                }

                // Additional role-based UI logic can go here if needed
              } else {
                console.log("No user data found for current user.");
              }
            } catch (error) {
              console.error("Error fetching user roles:", error);
            }

            // Show logout button and hide login button
            if (loginButton) loginButton.setAttribute('hidden', true); // Hide login button
            if (logoutButton) {
              logoutButton.removeAttribute('hidden'); // Show logout button
              logoutButton.addEventListener('click', () => {
                auth.signOut().then(() => window.location.reload());
              });
            }
          } else {
            // User is not logged in; show login button and hide logout button
            if (loginButton) loginButton.removeAttribute('hidden'); // Show login button
            if (logoutButton) logoutButton.setAttribute('hidden', true); // Hide logout button

            if (adminButton) adminButton.setAttribute('hidden', true); // Hide admin button for unauthenticated users
          }
        });

        // Callback function after loading the navbar (if provided)
        if (onLoadedCallback) {
          onLoadedCallback();
        }
      })
      .catch(error => console.error('Error loading navbar:', error));
  }
}

export const countryFlags = {
  "Afghanistan": "🇦🇫",
  "Albania": "🇦🇱",
  "Algeria": "🇩🇿",
  "Andorra": "🇦🇩",
  "Angola": "🇦🇴",
  "Antigua and Barbuda": "🇦🇬",
  "Argentina": "🇦🇷",
  "Armenia": "🇦🇲",
  "Australia": "🇦🇺",
  "Austria": "🇦🇹",
  "Azerbaijan": "🇦🇿",
  "Bahamas": "🇧🇸",
  "Bahrain": "🇧🇭",
  "Bangladesh": "🇧🇩",
  "Barbados": "🇧🇧",
  "Belarus": "🇧🇾",
  "Belgium": "🇧🇪",
  "Belize": "🇧🇿",
  "Benin": "🇧🇯",
  "Bhutan": "🇧🇹",
  "Bolivia": "🇧🇴",
  "Bosnia and Herzegovina": "🇧🇦",
  "Botswana": "🇧🇼",
  "Brazil": "🇧🇷",
  "Brunei": "🇧🇳",
  "Bulgaria": "🇧🇬",
  "Burkina Faso": "🇧🇫",
  "Burundi": "🇧🇮",
  "Cabo Verde": "🇨🇻",
  "Cambodia": "🇰🇭",
  "Cameroon": "🇨🇲",
  "Canada": "🇨🇦",
  "Central African Republic": "🇨🇫",
  "Chad": "🇹🇩",
  "Chile": "🇨🇱",
  "China": "🇨🇳",
  "Colombia": "🇨🇴",
  "Comoros": "🇰🇲",
  "Congo (Congo-Brazzaville)": "🇨🇬",
  "Congo (Democratic Republic of the Congo)": "🇨🇩",
  "Costa Rica": "🇨🇷",
  "Croatia": "🇭🇷",
  "Cuba": "🇨🇺",
  "Cyprus": "🇨🇾",
  "Czech Republic (Czechia)": "🇨🇿",
  "Denmark": "🇩🇰",
  "Djibouti": "🇩🇯",
  "Dominica": "🇩🇲",
  "Dominican Republic": "🇩🇴",
  "Ecuador": "🇪🇨",
  "Egypt": "🇪🇬",
  "El Salvador": "🇸🇻",
  "Equatorial Guinea": "🇬🇶",
  "Eritrea": "🇪🇷",
  "Estonia": "🇪🇪",
  "Eswatini (fmr. \"Swaziland\")": "🇸🇿",
  "Ethiopia": "🇪🇹",
  "Fiji": "🇫🇯",
  "Finland": "🇫🇮",
  "France": "🇫🇷",
  "Gabon": "🇬🇦",
  "Gambia": "🇬🇲",
  "Georgia": "🇬🇪",
  "Germany": "🇩🇪",
  "Ghana": "🇬🇭",
  "Greece": "🇬🇷",
  "Grenada": "🇬🇩",
  "Guatemala": "🇬🇹",
  "Guinea": "🇬🇳",
  "Guinea-Bissau": "🇬🇼",
  "Guyana": "🇬🇾",
  "Haiti": "🇭🇹",
  "Honduras": "🇭🇳",
  "Hungary": "🇭🇺",
  "Iceland": "🇮🇸",
  "India": "🇮🇳",
  "Indonesia": "🇮🇩",
  "Iran": "🇮🇷",
  "Iraq": "🇮🇶",
  "Ireland": "🇮🇪",
  "Israel": "🇮🇱",
  "Italy": "🇮🇹",
  "Jamaica": "🇯🇲",
  "Japan": "🇯🇵",
  "Jordan": "🇯🇴",
  "Kazakhstan": "🇰🇿",
  "Kenya": "🇰🇪",
  "Kiribati": "🇰🇮",
  "Korea (North)": "🇰🇵",
  "Korea (South)": "🇰🇷",
  "Kuwait": "🇰🇼",
  "Kyrgyzstan": "🇰🇬",
  "Laos": "🇱🇦",
  "Latvia": "🇱🇻",
  "Lebanon": "🇱🇧",
  "Lesotho": "🇱🇸",
  "Liberia": "🇱🇷",
  "Libya": "🇱🇾",
  "Liechtenstein": "🇱🇮",
  "Lithuania": "🇱🇹",
  "Luxembourg": "🇱🇺",
  "Madagascar": "🇲🇬",
  "Malawi": "🇲🇼",
  "Malaysia": "🇲🇾",
  "Maldives": "🇲🇻",
  "Mali": "🇲🇱",
  "Malta": "🇲🇹",
  "Marshall Islands": "🇲🇭",
  "Mauritania": "🇲🇷",
  "Mauritius": "🇲🇺",
  "Mexico": "🇲🇽",
  "Micronesia": "🇫🇲",
  "Moldova": "🇲🇩",
  "Monaco": "🇲🇨",
  "Mongolia": "🇲🇳",
  "Montenegro": "🇲🇪",
  "Morocco": "🇲🇦",
  "Mozambique": "🇲🇿",
  "Myanmar (formerly Burma)": "🇲🇲",
  "Namibia": "🇳🇦",
  "Nauru": "🇳🇷",
  "Nepal": "🇳🇵",
  "Netherlands": "🇳🇱",
  "New Zealand": "🇳🇿",
  "Nicaragua": "🇳🇮",
  "Niger": "🇳🇪",
  "Nigeria": "🇳🇬",
  "North Macedonia": "🇲🇰",
  "Norway": "🇳🇴",
  "Oman": "🇴🇲",
  "Pakistan": "🇵🇰",
  "Palau": "🇵🇼",
  "Panama": "🇵🇦",
  "Papua New Guinea": "🇵🇬",
  "Paraguay": "🇵🇾",
  "Peru": "🇵🇪",
  "Philippines": "🇵🇭",
  "Poland": "🇵🇱",
  "Portugal": "🇵🇹",
  "Qatar": "🇶🇦",
  "Romania": "🇷🇴",
  "Russia": "🇷🇺",
  "Rwanda": "🇷🇼",
  "Saint Kitts and Nevis": "🇰🇳",
  "Saint Lucia": "🇱🇨",
  "Saint Vincent and the Grenadines": "🇻🇨",
  "Samoa": "🇼🇸",
  "San Marino": "🇸🇲",
  "Saudi Arabia": "🇸🇦",
  "Senegal": "🇸🇳",
  "Serbia": "🇷🇸",
  "Seychelles": "🇸🇨",
  "Sierra Leone": "🇸🇱",
  "Singapore": "🇸🇬",
  "Slovakia": "🇸🇰",
  "Slovenia": "🇸🇮",
  "Solomon Islands": "🇸🇧",
  "Somalia": "🇸🇴",
  "South Africa": "🇿🇦",
  "South Korea": "🇰🇷",
  "Spain": "🇪🇸",
  "Sri Lanka": "🇱🇰",
  "Sudan": "🇸🇩",
  "Suriname": "🇸🇷",
  "Sweden": "🇸🇪",
  "Switzerland": "🇨🇭",
  "Syria": "🇸🇾",
  "Taiwan": "🇹🇼",
  "Tanzania": "🇹🇿",
  "Thailand": "🇹🇭",
  "Togo": "🇹🇬",
  "Tunisia": "🇹🇳",
  "Turkey": "🇹🇷",
  "Ukraine": "🇺🇦",
  "United Kingdom": "🇬🇧",
  "United States": "🇺🇸",
  "Venezuela": "🇻🇪",
  "Vietnam": "🇻🇳",
  "Yemen": "🇾🇪",
  "Zambia": "🇿🇲",
  "Zimbabwe": "🇿🇼",
  "United States of America": "🇺🇸",
  "Uzbekistan": "🇺🇿",
  "Vatican City (Holy See)": "🇻🇦",
  "Timor-Leste": "🇹🇱",
  "Tajikistan": "🇹🇯",
  "Turkmenistan": "🇹🇲",
  "Sao Tome and Principe": "🇸🇹",
  "Tonga": "🇹🇴",
  "Trinidad and Tobago": "🇹🇹",
  "Tuvalu": "🇹🇻",
  "Uganda": "🇺🇬",
  "United Arab Emirates": "🇦🇪",
  "Uruguay": "🇺🇾",
  "Vanuatu": "🇻🇺",
  "South Sudan": "🇸🇸",
};