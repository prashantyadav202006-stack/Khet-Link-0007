import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

export const firebaseConfig = {
  apiKey: "AIzaSyC1cZwvYJ3Sa5Uf1HaFTwqv0w8mxBJwm70",
  authDomain: "khet-link-7154f.firebaseapp.com",
  projectId: "khet-link-7154f",
  storageBucket: "khet-link-7154f.firebasestorage.app",
  messagingSenderId: "1028253067855",
  appId: "1:1028253067855:web:b5236b3bfddb0c036ad83a",
  measurementId: "G-NB5SEM3Q24"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
