import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
    apiKey: "AIzaSyDNsEzCIFfxsqrS74qoaN9lrgpFeKjNNr0",
    authDomain: "yadika1jakarta-26c8a.firebaseapp.com",
    projectId: "yadika1jakarta-26c8a",
    storageBucket: "yadika1jakarta-26c8a.firebasestorage.app",
    messagingSenderId: "75917415383",
    appId: "1:75917415383:web:c7fc76ab8912ad50ebf192"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);