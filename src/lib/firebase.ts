// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  "projectId": "linguawise-cj6fd",
  "appId": "1:546211878588:web:783a1f962055273d6fa2b9",
  "storageBucket": "linguawise-cj6fd.firebasestorage.app",
  "apiKey": "AIzaSyD8XvjZM3RF0BzEGYB6A9xPm3O2T_qWXy8",
  "authDomain": "linguawise-cj6fd.firebaseapp.com",
  "messagingSenderId": "546211878588"
};


// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
