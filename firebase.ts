import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBlKDgNYNIv3NAfT6XFDQUDsjjpgpkrsSg",
  authDomain: "medistockpro-20e6e.firebaseapp.com",
  projectId: "medistockpro-20e6e",
  storageBucket: "medistockpro-20e6e.firebasestorage.app",
  messagingSenderId: "370150135000",
  appId: "1:370150135000:web:15edba7f74fa9317a0b3ad",
  measurementId: "G-KDXSFSR676"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const db = getFirestore(app);