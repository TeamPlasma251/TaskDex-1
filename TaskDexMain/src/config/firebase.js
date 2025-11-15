import { initializeApp } from "firebase/app";
import { 
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  sendEmailVerification
} from "firebase/auth";
import { 
  getFirestore, 
  doc, 
  setDoc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot
} from "firebase/firestore";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDRuMa8OEfaQUkKKNeiOSujWs0L2O-xjeA",
  authDomain: "taskdexplasma.firebaseapp.com",
  projectId: "taskdexplasma",
  storageBucket: "taskdexplasma.firebasestorage.app",
  messagingSenderId: "327071823280",
  appId: "1:327071823280:web:03d1161d0cb92990a81275",
  measurementId: "G-73D5ENPXYK"
};


// Initialize Firebase (optional - only if you want cloud sync)
let app = null;
let db = null;

try {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  console.log("Firebase initialized successfully");
} catch (error) {
  console.warn("Firebase initialization failed (using local storage):", error);
}

export { app, db };

