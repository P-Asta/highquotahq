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
  
    loginButton.addEventListener('click', () => {
      window.location.href = '/pages/login.html';
    });
  
    onAuthStateChanged(auth, (user) => {
      if (user) {
        loginButton.style.display = 'none';
        logoutButton.style.display = 'block';
      } else {
        loginButton.style.display = 'block';
        logoutButton.style.display = 'none';
      }
    });
  
    logoutButton.addEventListener('click', () => {
      signOut(auth)
        .then(() => {
          console.log('User logged out');
          window.location.href = '/';
        })
        .catch((error) => {
          console.error('Error logging out:', error);
        });
    });
  }
  
  export { handleAuthButtons };