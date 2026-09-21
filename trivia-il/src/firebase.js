import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// העתיקי לכאן את כל תוכן האובייקט בדיוק כפי שהוא מופיע אצלך בדפדפן
const firebaseConfig = {
  apiKey: "AIzaSyCCz3txqX2bKPRz8cpc_WrsIxtglzXbJr8",
  authDomain: "triviatogo-55790.firebaseapp.com",
  projectId: "triviatogo-55790",
  storageBucket: "triviatogo-55790.firebasestorage.app",
  messagingSenderId: "776226611117",
  appId: "1:776226611117:web:7c363949a3f158352e8b24",
  measurementId: "G-SB5LT4EWFM"
};

const app = initializeApp(firebaseConfig);
// ייצוא הגישה למסד הנתונים כדי שנוכל להשתמש בה במשחק
export const db = getFirestore(app);