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

// ================= HARDCODED ADMIN =================
const ADMIN_EMAIL    = "admin@secondspace.com";
const ADMIN_PASSWORD = "Admin@123";
export const ADMIN_UID = "hardcoded-admin-001";

// ================= AUTH LISTENER =================
export function listenAuthState(cb) {
  return onAuthStateChanged(auth, cb);
}

// ================= REGISTER =================
export async function register(
  name, college, dept, year, address, email, password, role, purpose
) {
  try {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await setDoc(doc(db, "users", cred.user.uid), {
      name, college, dept, year, address, email,
      role: role || "user",
      purpose: role === "admin" ? "admin" : (purpose || "buy"),
      createdAt: new Date()
    });
    return cred.user;
  } catch (error) {
    if (error.code === "auth/email-already-in-use") throw new Error("This email is already registered.");
    if (error.code === "auth/invalid-email")        throw new Error("Invalid email address.");
    if (error.code === "auth/weak-password")        throw new Error("Password should be at least 6 characters.");
    throw new Error(error.message);
  }
}

// ================= LOGIN =================
export async function login(email, password) {
  // Hardcoded admin — no Firebase needed
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
    const snap = await getDoc(doc(db, "users", cred.user.uid));
    if (!snap.exists()) throw new Error("User profile not found.");
    return { uid: cred.user.uid, ...snap.data() };
  } catch (error) {
    if (error.code === "auth/user-not-found")    throw new Error("No account found with this email.");
    if (error.code === "auth/wrong-password")    throw new Error("Incorrect password.");
    if (error.code === "auth/invalid-credential") throw new Error("Invalid email or password.");
    if (error.code === "auth/invalid-email")     throw new Error("Invalid email address.");
    throw new Error(error.message);
  }
}

// ================= LOGOUT =================
export async function logout() {
  await signOut(auth);
}

// ================= GET USER =================
export async function getCurrentUserProfile(uid) {
  if (uid === ADMIN_UID) return null; // hardcoded admin has no Firestore doc
  const snap = await getDoc(doc(db, "users", uid));
  if (!snap.exists()) return null;
  return snap.data();
}
