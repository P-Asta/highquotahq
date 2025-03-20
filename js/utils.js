import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";
import { doc, getDoc, updateDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";
import { db, auth } from "./firebase.js";

export function loadNavbar(onLoadedCallback) {
  const navbarPlaceholder = document.getElementById('navbar-placeholder');
  if (navbarPlaceholder) {
    fetch('../partials/navbar.html')
      .then(response => response.text())
      .then(async (data) => {
        navbarPlaceholder.innerHTML = data;

        const homeButton = document.getElementById('home-button');
        const aboutButton = document.getElementById('about-button');
        const profileButton = document.getElementById('profile-button');
        const adminButton = document.getElementById('admin-button');
        const loginButton = document.getElementById('login-button');
        const logoutButton = document.getElementById('logout-button');
        

        if (homeButton) homeButton.addEventListener('click', () => window.location.href = '/');
        if (aboutButton) aboutButton.addEventListener('click', () => window.location.href = '/pages/about.html');

        const dropdown = document.querySelector('.dropdown');
        if (dropdown) {
          const dropdownButton = dropdown.querySelector('.dropdown-button');
          const dropdownMenu = dropdown.querySelector('.dropdown-menu');

          dropdownButton.addEventListener('click', () => {
            dropdown.classList.toggle('active');
          });

          dropdownMenu.addEventListener('click', (event) => {
            const selectedItem = event.target.closest('li');

            if (selectedItem) {
              if (selectedItem.getAttribute('data-home')) {
                window.location.href = '/index.html';
                return;
              }

              const newLogo = selectedItem.getAttribute('data-logo') || 'path/to/missing-logo.png';
              dropdownButton.querySelector('.logo').src = newLogo;

              const gameRoute = selectedItem.getAttribute('data-game');
              if (gameRoute) {
                window.location.href = `/${gameRoute}/index.html`;
              }

              dropdown.classList.remove('active');
            }
          });
        }

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

                if (roles.includes("admin") || roles.includes("verifier") || roles.includes("modded-verifier") || roles.includes("site-developer")) {
                  if (adminButton) {
                    adminButton.style.display = 'block';
                    adminButton.addEventListener('click', () => window.location.href = '/pages/admin.html');
                  }
                }

              } else {
                console.log("No user data found for current user.");
              }
            } catch (error) {
              console.error("Error fetching user roles:", error);
            }

            if (loginButton) loginButton.setAttribute('hidden', true);
            if (logoutButton) {
              logoutButton.removeAttribute('hidden');
              logoutButton.addEventListener('click', () => {
                auth.signOut().then(() => window.location.reload());
              });
            }
          } else {
            if (loginButton) loginButton.removeAttribute('hidden');
            if (logoutButton) logoutButton.setAttribute('hidden', true);

            if (adminButton) adminButton.setAttribute('hidden', true);
          }
        });

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