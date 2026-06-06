import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCklz28QDpVHdagTruIxlPc5hdi-fj6QxE",
  authDomain: "highquotahq214.firebaseapp.com",
  projectId: "highquotahq214",
  storageBucket: "highquotahq214.firebasestorage.app",
  messagingSenderId: "224586017261",
  appId: "1:224586017261:web:86d75e8878e42209a4dfe4",
  measurementId: "G-CFSRWNCQDD"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
