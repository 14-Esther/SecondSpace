import { db } from "./firebase-config.js";
import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  deleteDoc,
  updateDoc,
  query,
  where,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

function sortByCreatedAtDesc(data) {
  return data.sort((a, b) => {
    const aTime = a.createdAt?.seconds || 0;
    const bTime = b.createdAt?.seconds || 0;
    return bTime - aTime;
  });
}

// ════════════════════════════════════════════
// ITEMS
// ════════════════════════════════════════════

// Add a new item listing
export async function addItem(itemData) {
  const ref = await addDoc(collection(db, "items"), {
    ...itemData,
    createdAt: serverTimestamp()
  });
  return ref.id;
}

// Get all items (optionally filter by category)
export async function getAllItems(category = "all") {
  let q;

  if (category && category !== "all") {
    q = query(
      collection(db, "items"),
      where("category", "==", category)
    );
  } else {
    q = query(collection(db, "items"));
  }

  const snap = await getDocs(q);
  const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  return sortByCreatedAtDesc(items);
}

// Get items posted by a specific user
export async function getUserItems(uid) {
  const q = query(
    collection(db, "items"),
    where("sellerId", "==", uid)
  );

  const snap = await getDocs(q);
  const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  return sortByCreatedAtDesc(items);
}

// Get a single item by ID
export async function getItem(itemId) {
  const snap = await getDoc(doc(db, "items", itemId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

// Update an item
export async function updateItem(itemId, updates) {
  await updateDoc(doc(db, "items", itemId), updates);
}

// Delete an item
export async function deleteItem(itemId) {
  await deleteDoc(doc(db, "items", itemId));
}

// ════════════════════════════════════════════
// INTERESTS
// ════════════════════════════════════════════

// Show interest in an item
export async function addInterest(interestData) {
  const existing = await getDocs(query(
    collection(db, "interests"),
    where("itemId", "==", interestData.itemId),
    where("buyerId", "==", interestData.buyerId)
  ));

  if (!existing.empty) {
    throw new Error("You've already shown interest in this item.");
  }

  const ref = await addDoc(collection(db, "interests"), {
    ...interestData,
    createdAt: serverTimestamp()
  });

  return ref.id;
}

// Get interests for all items owned by a seller
export async function getSellerInterests(sellerId) {
  const q = query(
    collection(db, "interests"),
    where("sellerId", "==", sellerId)
  );

  const snap = await getDocs(q);
  const interests = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  return sortByCreatedAtDesc(interests);
}

// ════════════════════════════════════════════
// ADMIN
// ════════════════════════════════════════════

// Get all users (admin only)
export async function getAllUsers() {
  const snap = await getDocs(collection(db, "users"));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

// Get all interests (admin only)
export async function getAllInterests() {
  const snap = await getDocs(collection(db, "interests"));
  const interests = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  return sortByCreatedAtDesc(interests);
}
