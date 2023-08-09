import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDZyF-fooa4HM2UhuwRbPLYpqAd3HuNN1I",
  authDomain: "habit-tracker-77805.firebaseapp.com",
  projectId: "habit-tracker-77805",
  storageBucket: "habit-tracker-77805.appspot.com",
  messagingSenderId: "522209828231",
  appId: "1:522209828231:web:b9c21f56d7d8074b760722"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);




