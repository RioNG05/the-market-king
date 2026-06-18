import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

// Điền thông tin Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyA2q3vBUI056R-4X7uliY4xYMNx5_VcHDQ",
  authDomain: "market-king-demo.firebaseapp.com",
  databaseURL: "https://market-king-demo-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "market-king-demo",
  storageBucket: "market-king-demo.firebasestorage.app",
  messagingSenderId: "167738927827",
  appId: "1:167738927827:web:4da7693805ed07012bc226",
  measurementId: "G-PWGKT6HKRP"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

export { database };
