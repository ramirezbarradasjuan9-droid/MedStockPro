import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Configuración usando tus credenciales existentes
const firebaseConfig = {
  apiKey: "AIzaSyBlKDgNYNIv3NAfT6XFDQUDsjjpgpkrsSg",
  authDomain: "medistockpro-20e6e.firebaseapp.com",
  projectId: "medistockpro-20e6e",
  storageBucket: "medistockpro-20e6e.firebasestorage.app",
  messagingSenderId: "370150135000",
  appId: "1:370150135000:web:15edba7f74fa9317a0b3ad",
  measurementId: "G-KDXSFSR676"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);