import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAZNzUBKVC1FWF7CCUDW756SvFhp2tE1nE",
  authDomain: "bhumingo-81c1b.firebaseapp.com",
  projectId: "bhumingo-81c1b",
  storageBucket: "bhumingo-81c1b.firebasestorage.app",
  messagingSenderId: "727568121384",
  appId: "1:727568121384:web:048d069a1238a85e2cbf1d",
  measurementId: "G-5CVKP8CC02"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const googleAuthProvider = new GoogleAuthProvider();

export { app, auth, db, storage, googleAuthProvider };
