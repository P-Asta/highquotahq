// Import the Firebase functions
import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js';

// since we arent working with sensitive info and dont store passwords its fine to have this here

const firebaseConfig = {
    apiKey: "AIzaSyCklz28QDpVHdagTruIxlPc5hdi-fj6QxE",
    authDomain: "highquotahq214.firebaseapp.com",
    projectId: "highquotahq214",
    storageBucket: "highquotahq214.firebasestorage.app",
    messagingSenderId: "224586017261",
    appId: "1:224586017261:web:86d75e8878e42209a4dfe4",
    measurementId: "G-CFSRWNCQDD"
}; 

// initialize firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export {auth, db };
