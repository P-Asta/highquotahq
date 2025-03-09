import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js';
import { setDoc, doc, getDoc } from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js';
import { auth, db } from './firebase.js';
import { loadNavbar } from './utils.js';
import { handleAuthButtons } from './auth.js';


document.addEventListener('DOMContentLoaded', function() {
    loadNavbar(handleAuthButtons);
});