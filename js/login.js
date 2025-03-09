import { doc, getDoc, setDoc, collection, query, getDocs, where } from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js';
import { onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js';
import { auth, db } from './firebase.js';
import { loadNavbar } from './utils.js';
import { handleAuthButtons } from './auth.js';

const authForm = document.getElementById('auth-form');
const submitButton = document.getElementById('submit-button');
const toggleLink = document.getElementById('toggle-login');
const authTitle = document.getElementById('auth-title'); // For the title of the form
const toggleText = document.getElementById('toggle-text'); // For the static text part

let isLogin = true; // Track whether the user is in login or register mode

// Toggle between Login and Register
toggleLink.addEventListener('click', () => {
  isLogin = !isLogin;
  updateForm();
});

function updateForm() {
  const buttonText = isLogin ? 'Login' : 'Register';
  const linkText = isLogin ? 'Register here' : 'Login here';
  const text = isLogin 
    ? "Don't have an account?" 
    : "Already have an account?";

  submitButton.textContent = buttonText;
  toggleLink.textContent = linkText;
  toggleText.textContent = text;
  
  // Update the title text
  authTitle.textContent = isLogin ? 'Login' : 'Register';
}

// Initial update when the page loads
updateForm();

// Handle form submission for login or register
authForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  if (isLogin) {
    login(username, password);
  } else {
    register(username, password);
  }
});

async function register(username, password) {
  const usernameLower = username.trim().toLowerCase(); // Normalize case

  // Check if the username already exists in Firestore
  const usersRef = collection(db, 'users');
  const q = query(usersRef, where('username', '==', usernameLower));

  try {
      const querySnapshot = await getDocs(q);

      // Check if username already exists in Firestore
      if (!querySnapshot.empty) {
          console.error('Username is already taken');
          alert('This username is already taken. Please choose another one.');
          return; // Exit the function to prevent creating the user
      }

      // Proceed with Firebase Authentication registration
      const userCredential = await createUserWithEmailAndPassword(auth, usernameLower + '@example.com', password); // Use dummy email for username
      const user = userCredential.user;

      // Get current date for account creation
      const currentDate = new Date();
      const formattedDate = `${(currentDate.getMonth() + 1).toString().padStart(2, '0')}/${currentDate.getDate().toString().padStart(2, '0')}/${currentDate.getFullYear()}`;

      // Store the username in Firestore
      await setDoc(doc(db, 'users', user.uid), {
          username: usernameLower, // Store username in lowercase
          createdAt: formattedDate,
      });

      console.log('User registered successfully');
      window.location.href = '/'; // Redirect to homepage after registration

  } catch (error) {
      // Handle different types of errors based on error code or message
      if (error.code === 'auth/email-already-in-use') {
          // Only show this alert if the issue is with Firebase Authentication
          alert('This username is already in use. Please try logging in or use a different username.');
      } else if (error.message.includes('Firestore')) {
          // If it's related to Firestore (e.g., username query)
          alert('There was an issue checking the username availability. Please try again later.');
      } else {
          // Generic error message for anything else
          console.error('Error during registration:', error);
          alert('An error occurred during registration. Please try again later.');
      }
  }
}

function login(username, password) {
  // Log the user in using Firebase Authentication
  signInWithEmailAndPassword(auth, username + '@example.com', password) // Use the same dummy email
    .then((userCredential) => {
      const user = userCredential.user;
      console.log('User logged in successfully');
      window.location.href = '/'; // Redirect to homepage after successful login
    })
    .catch((error) => {
      console.error('Error logging in:', error);
    });
}

// Ensure the navbar is loaded after the document is fully loaded
document.addEventListener('DOMContentLoaded', function() {
    loadNavbar(handleAuthButtons);
});