import { doc, getDoc, setDoc } from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js';
import { onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js';
import { auth, db } from './firebase.js';

function handleAuthButtons() {
    const loginButton = document.getElementById('login-button');
    const logoutButton = document.getElementById('logout-button');
  
    if (!loginButton || !logoutButton) {
      console.error('Login or Logout button not found!');
      return;
    }
  
    // Redirect to login page when login button is clicked
    loginButton.addEventListener('click', () => {
      window.location.href = '/pages/login.html';
    });
  
    // Listen for auth state changes
    onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is logged in
        loginButton.style.display = 'none';
        logoutButton.style.display = 'block';
      } else {
        // User is logged out
        loginButton.style.display = 'block';
        logoutButton.style.display = 'none';
      }
    });
  
    // Logout functionality
    logoutButton.addEventListener('click', () => {
      signOut(auth)
        .then(() => {
          console.log('User logged out');
          window.location.href = '/'; // Redirect to home page after logout
        })
        .catch((error) => {
          console.error('Error logging out:', error);
        });
    });
  }
  
  export { handleAuthButtons };