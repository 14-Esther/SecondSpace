import { auth, db } from "./firebase-config.js";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

import {
  doc,
  setDoc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// ================= AUTH LISTENER =================
export function listenAuthState(cb) {
  return onAuthStateChanged(auth, cb);
}

// ================= REGISTER =================
export async function register(
  name,
  college,
  dept,
  year,
  address,
  email,
  password,
  role,
  purpose
) {
  try {
    const cred = await createUserWithEmailAndPassword(auth, email, password);

    await setDoc(doc(db, "users", cred.user.uid), {
      name,
      college,
      dept,
      year,
      address,
      email,
      role: role || "user",          // user/admin from UI
      purpose: role === "admin" ? "admin" : (purpose || "buy"), // purpose for users
      createdAt: new Date()
    });

    return cred.user;

  } catch (error) {
    if (error.code === "auth/email-already-in-use") {
      throw new Error("This email is already registered.");
    } else if (error.code === "auth/invalid-email") {
      throw new Error("Invalid email address.");
    } else if (error.code === "auth/weak-password") {
      throw new Error("Password should be at least 6 characters.");
    }
    throw new Error(error.message);
  }
}

// ================= HARDCODED ADMIN CREDENTIALS =================
// Change these to your desired admin email/password
const ADMIN_EMAIL    = "admin@secondspace.com";
const ADMIN_PASSWORD = "Admin@123";
const ADMIN_UID      = "hardcoded-admin-001";

export function getHardcodedAdminUID() { return ADMIN_UID; }

// ================= LOGIN =================
export async function login(email, password) {
  // Hardcoded admin bypass — no Firebase Auth required
  if (email.trim().toLowerCase() === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    return {
      uid: ADMIN_UID,
      name: "Admin",
      email: ADMIN_EMAIL,
      role: "admin",
      purpose: "admin",
      college: "SecondSpace HQ",
      dept: "Administration",
      year: ""
    };
  }

  try {
    const cred = await signInWithEmailAndPassword(auth, email, password);

    const userRef = doc(db, "users", cred.user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      throw new Error("User profile not found.");
    }

    return {
      uid: cred.user.uid,
      ...userSnap.data()
    };

  } catch (error) {
    if (error.code === "auth/user-not-found") {
      throw new Error("No account found with this email.");
    } else if (error.code === "auth/wrong-password") {
      throw new Error("Incorrect password.");
    } else if (error.code === "auth/invalid-credential") {
      throw new Error("Invalid email or password.");
    } else if (error.code === "auth/invalid-email") {
      throw new Error("Invalid email address.");
    }
    throw new Error(error.message);
  }
}

// ================= LOGOUT =================
export async function logout() {
  await signOut(auth);
}

// ================= GET USER =================
export async function getCurrentUserProfile(uid) {
  const snap = await getDoc(doc(db, "users", uid));
  if (!snap.exists()) return null;
  return snap.data();
}
