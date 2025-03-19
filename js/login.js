import { doc, getDoc, setDoc, collection, query, getDocs, where } from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js';
import { onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail } from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js';
import { auth, db } from './firebase.js';
import { loadNavbar } from './utils.js';
import { handleAuthButtons } from './auth.js';

const authForm = document.getElementById('auth-form');
const submitButton = document.getElementById('submit-button');
const toggleLink = document.getElementById('toggle-login');
const authTitle = document.getElementById('auth-title'); // For the title of the form
const toggleText = document.getElementById('toggle-text'); // For the static text part
const emailField = document.getElementById('email');
const forgotPasswordLink = document.getElementById('forgot-password');

let isLogin = true; // Track whether the user is in login or register mode

// Toggle between Login and Register
toggleLink.addEventListener('click', () => {
  isLogin = !isLogin;
  updateForm();
});

function updateForm() {
  if (isLogin) {
    authTitle.textContent = 'Login';
    submitButton.textContent = 'Login';
    toggleText.textContent = "Don't have an account?";
    toggleLink.textContent = 'Register here';
    emailField.style.display = 'none'; // Hide email input on login
    emailField.removeAttribute('required'); // Make sure email is not required on login
    forgotPasswordLink.style.display = 'block'; // Show forgot password link
  } else {
    authTitle.textContent = 'Register';
    submitButton.textContent = 'Register';
    toggleText.textContent = 'Already have an account?';
    toggleLink.textContent = 'Login here';
    emailField.style.display = 'block'; // Show email input on register
    emailField.setAttribute('required', 'true'); // Ensure email is required on register
    forgotPasswordLink.style.display = 'none'; // Hide forgot password link
  }
}

// Initial update when the page loads
updateForm();

// Handle form submission for login or register
authForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const email = document.getElementById('email').value;
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  if (isLogin) {
    login(username, password);
  } else {
    register(email, username, password);
  }
});

async function register(email, username, password) {
  const usernameLower = username.trim().toLowerCase(); // Normalize case

  // Check if the username already exists in Firestore
  const usersRef = collection(db, 'users');
  const q = query(usersRef, where('username', '==', usernameLower));

  try {
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
          alert('This username is already taken. Please choose another one.');
          return;
      }

      // Create user with actual email
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const currentDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format

      // Store username in Firestore
      await setDoc(doc(db, 'users', user.uid), {
          email: email, // Store email for reference
          username: usernameLower,
          createdAt: currentDate,
      });

      console.log('User registered successfully');
      window.location.href = '/'; // Redirect to homepage

  } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
          alert('This email is already in use. Try logging in or use another email.');
      } else {
          console.error('Error during registration:', error);
          alert('An error occurred. Please try again.');
      }
  }
}

async function login(identifier, password) {
  let email = identifier; // Assume it's an email

  // Check if identifier is a username (does not contain "@")
  if (!identifier.includes("@")) {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('username', '==', identifier.toLowerCase()));

      try {
          const querySnapshot = await getDocs(q);

          if (querySnapshot.empty) {
              alert("Username not found.");
              return;
          }

          // Get the associated email from Firestore
          email = querySnapshot.docs[0].data().email;
      } catch (error) {
          console.error("Error fetching email:", error);
          alert("Error finding account. Please try again.");
          return;
      }
  }

  // Now login with email
  signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
          console.log('User logged in successfully');
          window.location.href = '/';
      })
      .catch((error) => {
          console.error('Error logging in:', error);
          alert('Invalid email/username or password.');
      });
}

// Handle forgot password click
forgotPasswordLink.addEventListener('click', () => {
  const email = prompt('Enter your email to reset password:');
  if (email) {
    resetPassword(email);
  }
});

function resetPassword(email) {
  if (!email || typeof email !== 'string' || !email.includes('@')) {
    alert('Please enter a valid email address.');
    return;
  }

  sendPasswordResetEmail(auth, email.trim()) // Trim to remove accidental spaces
    .then(() => {
      alert('Password reset email sent! Check your inbox.');
    })
    .catch((error) => {
      console.error('Error sending reset email:', error);
      alert('Error: ' + error.message);
    });
}

// Ensure the navbar is loaded after the document is fully loaded
document.addEventListener('DOMContentLoaded', function() {
    loadNavbar(handleAuthButtons);
});