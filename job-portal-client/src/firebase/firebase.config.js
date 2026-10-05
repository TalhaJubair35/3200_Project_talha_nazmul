// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyAegQCOZd6XJmdLj-H0T7bHgTOERPrzILs",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "job-portal-2de9b.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "job-portal-2de9b",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "job-portal-2de9b.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "370385557182",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:370385557182:web:9fd7b08a35f8f3bb24b0ef",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-DZ3GCF90EE"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export default app;