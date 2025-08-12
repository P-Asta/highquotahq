// Import the Firebase functions
import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js';
import { 
    initializeFirestore,
    persistentLocalCache 
} from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js';

const firebaseConfig = {
    apiKey: "AIzaSyCklz28QDpVHdagTruIxlPc5hdi-fj6QxE",
    authDomain: "highquotahq214.firebaseapp.com",
    projectId: "highquotahq214",
    storageBucket: "highquotahq214.firebasestorage.app",
    messagingSenderId: "224586017261",
    appId: "1:224586017261:web:86d75e8878e42209a4dfe4",
    measurementId: "G-CFSRWNCQDD"
}; 

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Enable local persistent caching for Firestore
const db = initializeFirestore(app, {
    localCache: persistentLocalCache()
});

export { auth, db };
