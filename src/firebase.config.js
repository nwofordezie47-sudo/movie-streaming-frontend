import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, OAuthProvider } from "firebase/auth";

// TODO: Replace with your actual Firebase config from the Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSyD6NOJ4j9xgSRKvzsHVjh0ffDCoIWLyCuo",
  authDomain: "fir-auth-83a6d.firebaseapp.com",
  projectId: "fir-auth-83a6d",
  storageBucket: "fir-auth-83a6d.firebasestorage.app",
  messagingSenderId: "790460170928",
  appId: "1:790460170928:web:16861d9908e22788477175"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const appleProvider = new OAuthProvider('apple.com');
