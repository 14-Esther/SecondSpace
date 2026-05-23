import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyD_kFcczGmoQesn0edKKmc_huiX1XjUAMo",
  authDomain: "secondspace-94569.firebaseapp.com",
  projectId: "secondspace-94569",
  storageBucket: "secondspace-94569.firebasestorage.app",
  messagingSenderId: "975217974436",
  appId: "1:975217974436:web:cbb589b713ed11aa931a31",
  measurementId: "G-D23BRQBTXF"
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
