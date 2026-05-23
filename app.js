// ================= IMPORTS =================
import {
  register,
  login,
  logout,
  listenAuthState,
  getCurrentUserProfile
} from "./auth.js";

import {
  addItem,
  getAllItems,
  addInterest,
  getUserItems,
  getSellerInterests,
  getAllUsers,
  getAllInterests,
  deleteItem
} from "./firestore.js";

// ================= ELEMENTS =================
const landingPage = document.getElementById("landingPage");
const authPage = document.getElementById("authPage");
const app = document.getElementById("app");

const loginView = document.getElementById("loginView");
const registerView = document.getElementById("registerView");

const goToLoginBtn = document.getElementById("goToLoginBtn");
const heroLoginBtn = document.getElementById("heroLoginBtn");
const goToRegisterBtn = document.getElementById("goToRegisterBtn");
const heroRegisterBtn = document.getElementById("heroRegisterBtn");
const showLoginBtn = document.getElementById("showLoginBtn");
const showRegisterBtn = document.getElementById("showRegisterBtn");
const backHomeFromLogin = document.getElementById("backHomeFromLogin");
const backHomeFromRegister = document.getElementById("backHomeFromRegister");

const registerName = document.getElementById("registerName");
const registerCollege = document.getElementById("registerCollege");
const registerDepartment = document.getElementById("registerDepartment");
const registerYear = document.getElementById("registerYear");
const registerAddress = document.getElementById("registerAddress");
const registerEmail = document.getElementById("registerEmail");
const registerPassword = document.getElementById("registerPassword");
const registerRole = document.getElementById("registerRole");
const registerPurpose = document.getElementById("registerPurpose");

const loginEmail = document.getElementById("loginEmail");
const loginPassword = document.getElementById("loginPassword");

const itemTitle = document.getElementById("itemTitle");
const itemCategory = document.getElementById("itemCategory");
const itemPrice = document.getElementById("itemPrice");
const itemDescription = document.getElementById("itemDescription");

const registerBtn = document.getElementById("registerBtn");
const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const addItemBtn = document.getElementById("addItemBtn");

// ================= STATE =================
let currentUser = null;
let currentUserProfile = null;
let allItems = [];
let _authInitialized = false;
let _userInitiatedLogin = false;

// ================= TOAST =================
function showToast(message, type = "default", duration = 3500) {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = message;
  toast.className = `toast ${type}`;
  toast.classList.remove("hidden");
  clearTimeout(toast._timeout);
  toast._timeout = setTimeout(() => toast.classList.add("hidden"), duration);
}

// ================= HELPERS =================
function resetLoginBtn() {
  if (loginBtn) { loginBtn.disabled = false; loginBtn.textContent = "Sign In →"; }
}

const categoryMeta = {
  "Books":       { emoji: "📚", color: "#EBF4FF", accent: "#1D6AFF" },
  "Electronics": { emoji: "💻", color: "#E0FBF5", accent: "#00A884" },
  "Furniture":   { emoji: "🪑", color: "#FFF4E0", accent: "#CC7700" },
  "Clothing":    { emoji: "👕", color: "#FFF0F3", accent: "#E0004D" },
  "Lifestyle":   { emoji: "✨", color: "#F5F0FF", accent: "#6D28D9" },
};
function getCategoryMeta(cat) {
  return categoryMeta[cat] || { emoji: "🏷️", color: "#F3F4F6", accent: "#6B7280" };
}
function conditionBadge(item) {
  const conditions = ["Like New", "Good", "Fair"];
  const idx = (item.id?.charCodeAt(0) ?? 0) % conditions.length;
  const c = conditions[idx];
  const colors = {
    "Like New": { bg: "#E0FBF5", fg: "#00A884" },
    "Good":     { bg: "#FFF4E0", fg: "#CC7700" },
    "Fair":     { bg: "#FFF0F3", fg: "#E0004D" },
  };
  const col = colors[c];
  return `<span class="card-badge" style="background:${col.bg};color:${col.fg};">${c}</span>`;
}

// ================= NAVIGATION =================
function showLogin() {
  landingPage.classList.add("hidden");
  authPage.classList.remove("hidden");
  loginView.classList.remove("hidden");
  registerView.classList.add("hidden");
}
function showRegister() {
  landingPage.classList.add("hidden");
  authPage.classList.remove("hidden");
  registerView.classList.remove("hidden");
  loginView.classList.add("hidden");
}
function showHome() {
  landingPage.classList.remove("hidden");
  authPage.classList.add("hidden");
  app.classList.add("hidden");
}
function showApp() {
  landingPage.classList.add("hidden");
  authPage.classList.add("hidden");
  app.classList.remove("hidden");
}

// ================= BUTTON EVENTS =================
goToLoginBtn?.addEventListener("click", showLogin);
heroLoginBtn?.addEventListener("click", showLogin);
goToRegisterBtn?.addEventListener("click", showRegister);
heroRegisterBtn?.addEventListener("click", showRegister);
showLoginBtn?.addEventListener("click", showLogin);
showRegisterBtn?.addEventListener("click", showRegister);
backHomeFromLogin?.addEventListener("click", showHome);
backHomeFromRegister?.addEventListener("click", showHome);

// ================= REGISTER =================
registerBtn?.addEventListener("click", async () => {
  try {
    if (!registerName.value || !registerEmail.value || !registerPassword.value || !registerRole.value) {
      showToast("Please fill all required fields", "error"); return;
    }
    if (registerRole.value === "user" && !registerPurpose.value) {
      showToast("Please select buyer/seller purpose", "error"); return;
    }
    registerBtn.disabled = true;
    registerBtn.textContent = "Creating account…";
    await register(registerName.value, registerCollege.value, registerDepartment.value,
      registerYear.value, registerAddress.value, registerEmail.value,
      registerPassword.value, registerRole.value, registerPurpose.value);
    registerBtn.disabled = false;
    registerBtn.textContent = "Create Account →";
    showToast("Account created! Please sign in. 🎉", "success");
    showLogin();
  } catch (err) {
    registerBtn.disabled = false;
    registerBtn.textContent = "Create Account →";
    showToast(err.message, "error");
  }
});

// ================= LOGIN =================
loginBtn?.addEventListener("click", async () => {
  if (!loginEmail.value || !loginPassword.value) {
    showToast("Please enter your email and password", "error"); return;
  }
  loginBtn.disabled = true;
  loginBtn.textContent = "Signing in…";
  _userInitiatedLogin = true;
  const timeout = setTimeout(() => {
    resetLoginBtn();
    _userInitiatedLogin = false;
    showToast("Login taking too long. Check your connection.", "error");
  }, 10000);
  try {
    await login(loginEmail.value, loginPassword.value);
    window._loginTimeout = timeout;
  } catch (err) {
    clearTimeout(timeout);
    window._loginTimeout = null;
    resetLoginBtn();
    _userInitiatedLogin = false;
    showToast(err.message, "error");
  }
});

// ================= LOGOUT =================
logoutBtn?.addEventListener("click", async () => {
  await logout();
  currentUser = null;
  currentUserProfile = null;
  _authInitialized = false;
  _userInitiatedLogin = false;
  showHome();
});

// ================= AUTH STATE =================
// FIX: Don't auto-redirect on page load if user has an existing session.
// Only navigate to app if they explicitly clicked Login.
listenAuthState(async (user) => {
  if (window._loginTimeout) { clearTimeout(window._loginTimeout); window._loginTimeout = null; }

  if (!user) {
    resetLoginBtn();
    _authInitialized = true;
    if (!app.classList.contains("hidden")) showHome();
    return;
  }

  currentUser = user;
  try {
    currentUserProfile = await getCurrentUserProfile(user.uid);
  } catch (err) {
    console.error("Profile fetch failed:", err);
  }

  resetLoginBtn();

  // Only enter app if user clicked login, or was already in the app (page refresh)
  const onAuthPage = !authPage.classList.contains("hidden");
  const onApp = !app.classList.contains("hidden");

  if (_userInitiatedLogin || onAuthPage || onApp) {
    showApp();
    setupDashboard();
    loadBrowseItems();
  }
  // If user just opened the site with existing session, stay on landing page

  _authInitialized = true;
  _userInitiatedLogin = false;
});

// ================= DASHBOARD SETUP =================
function setupDashboard() {
  setupDashboardHeader();
  setupSidebarUser();
  setupRoleUI();
}

function setupDashboardHeader() {
  const browseSection = document.getElementById("browseSection");
  if (!browseSection || browseSection.querySelector(".greeting-bar")) return;
  const name = currentUserProfile?.name || "there";
  const bar = document.createElement("div");
  bar.className = "greeting-bar";
  bar.innerHTML = `
    <div>
      <p class="greeting-hello">Hey, <strong>${name}</strong> 👋</p>
      <p class="greeting-sub">${currentUserProfile?.college || "SecondSpace"} · ${currentUserProfile?.dept || currentUserProfile?.department || ""}</p>
    </div>
    <div class="greeting-stats">
      <div class="gstat"><span id="gstatItems">—</span><small>My listings</small></div>
      <div class="gstat"><span id="gstatBrowse">—</span><small>Available now</small></div>
    </div>`;
  browseSection.insertBefore(bar, browseSection.firstChild);
}

function setupSidebarUser() {
  const name = currentUserProfile?.name || "User";
  const role = currentUserProfile?.role || "member";
  const initials = name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  const avatarEl = document.getElementById("userAvatar");
  const nameEl = document.getElementById("sidebarName");
  const roleEl = document.getElementById("sidebarRole");
  if (avatarEl) avatarEl.textContent = initials;
  if (nameEl) nameEl.textContent = name;
  if (roleEl) roleEl.textContent = role;
}

function setupRoleUI() {
  const navAdminBtn = document.getElementById("navAdminBtn");
  const navSellBtn = document.getElementById("navSellBtn");
  currentUserProfile?.role === "admin"
    ? navAdminBtn?.classList.remove("hidden")
    : navAdminBtn?.classList.add("hidden");
  currentUserProfile?.purpose === "buy"
    ? navSellBtn?.classList.add("hidden")
    : navSellBtn?.classList.remove("hidden");
}

// ================= LOAD BROWSE ITEMS =================
async function loadBrowseItems() {
  const grid = document.getElementById("listingsGrid");
  if (grid) grid.innerHTML = `<div class="empty-state"><div class="empty-icon">⏳</div><p>Loading items…</p></div>`;
  const items = await getAllItems();
  allItems = items;
  const gstatBrowse = document.getElementById("gstatBrowse");
  if (gstatBrowse) gstatBrowse.textContent = items.length;
  const myCount = items.filter(i => i.sellerId === currentUser?.uid).length;
  const gstatItems = document.getElementById("gstatItems");
  if (gstatItems) gstatItems.textContent = myCount;
  renderItems(items);
}

// ================= RENDER ITEMS =================
function renderItems(items) {
  const grid = document.getElementById("listingsGrid");
  if (!grid) return;
  if (!items.length) {
    grid.innerHTML = `<div class="empty-state"><div class="empty-icon">📭</div><p>No items found</p><small>Try adjusting your filters or be the first to sell!</small></div>`;
    return;
  }
  grid.innerHTML = items.map((item, i) => {
    const meta = getCategoryMeta(item.category);
    const isOwn = item.sellerId === currentUser?.uid;
    const desc = item.description
      ? `<p class="card-desc">${item.description}</p>`
      : `<p class="card-desc card-desc-empty">No description provided.</p>`;
    const seller = item.sellerName ? `<span class="card-seller">👤 ${item.sellerName}</span>` : "";
    return `
      <div class="card" style="animation-delay:${i * 0.04}s">
        <div class="card-image-strip" style="background:${meta.color};">
          <span class="card-emoji">${meta.emoji}</span>
          <span class="card-cat-label" style="color:${meta.accent};">${item.category || "General"}</span>
          ${conditionBadge(item)}
        </div>
        <div class="card-body">
          <div class="card-top-row">
            <h3>${item.title}</h3>
            <span class="card-price">₹${item.price}</span>
          </div>
          ${desc}
          <div class="card-meta-row">${seller}${isOwn ? `<span class="card-own-badge">Your listing</span>` : ""}</div>
          ${isOwn
            ? `<button class="btn-card-disabled" disabled>Your Item</button>`
            : `<button onclick="handleInterest('${item.id}', '${item.sellerId}')">✋ I'm Interested</button>`}
        </div>
      </div>`;
  }).join("");
}

// ================= INTEREST =================
window.handleInterest = async (itemId, sellerId) => {
  try {
    await addInterest({ itemId, buyerId: currentUser.uid, buyerName: currentUserProfile?.name || "Unknown", sellerId });
    showToast("Interest sent! The seller will reach out. 🤝", "success");
  } catch (err) { showToast(err.message, "error"); }
};

// ================= ADD ITEM =================
addItemBtn?.addEventListener("click", async () => {
  try {
    if (!itemTitle.value || !itemPrice.value) { showToast("Please fill item name and price", "error"); return; }
    addItemBtn.disabled = true;
    addItemBtn.textContent = "Posting…";
    await addItem({
      title: itemTitle.value, category: itemCategory.value, price: itemPrice.value,
      description: itemDescription.value, sellerId: currentUser.uid,
      sellerName: currentUserProfile?.name, role: currentUserProfile?.role
    });
    addItemBtn.disabled = false;
    addItemBtn.textContent = "🚀 Post Listing";
    itemTitle.value = ""; itemPrice.value = ""; itemDescription.value = "";
    showToast("Item listed successfully! 🎉", "success");
    allItems = [];
  } catch (err) {
    addItemBtn.disabled = false;
    addItemBtn.textContent = "🚀 Post Listing";
    showToast(err.message, "error");
  }
});

// ================= ROLE DROPDOWN =================
registerRole?.addEventListener("change", () => {
  const purposeWrap = registerPurpose.closest(".field-group");
  if (purposeWrap) purposeWrap.style.display = registerRole.value === "admin" ? "none" : "";
});

// ================= SIDEBAR NAVIGATION =================
const browseSection = document.getElementById("browseSection");
const sellSection = document.getElementById("sellSection");
const myListingsSection = document.getElementById("myListingsSection");
const interestsSection = document.getElementById("interestsSection");
const adminSection = document.getElementById("adminSection");

const navBrowseBtn = document.getElementById("navBrowseBtn");
const navSellBtn = document.getElementById("navSellBtn");
const navListingsBtn = document.getElementById("navListingsBtn");
const navInterestsBtn = document.getElementById("navInterestsBtn");
const navAdminBtn = document.getElementById("navAdminBtn");

function hideAllSections() {
  [browseSection, sellSection, myListingsSection, interestsSection, adminSection]
    .forEach(s => s?.classList.add("hidden"));
}
function setActive(btn) {
  document.querySelectorAll(".nav-btn").forEach(b => b.classList.remove("active"));
  btn?.classList.add("active");
}

navBrowseBtn?.addEventListener("click", () => {
  hideAllSections(); browseSection?.classList.remove("hidden"); setActive(navBrowseBtn); loadBrowseItems();
});
navSellBtn?.addEventListener("click", () => {
  hideAllSections(); sellSection?.classList.remove("hidden"); setActive(navSellBtn);
});
navListingsBtn?.addEventListener("click", async () => {
  hideAllSections(); myListingsSection?.classList.remove("hidden"); setActive(navListingsBtn); await loadMyListings();
});
navInterestsBtn?.addEventListener("click", async () => {
  hideAllSections(); interestsSection?.classList.remove("hidden"); setActive(navInterestsBtn); await loadInterests();
});
navAdminBtn?.addEventListener("click", async () => {
  hideAllSections(); adminSection?.classList.remove("hidden"); setActive(navAdminBtn); await loadAdminData();
});

// ================= MY LISTINGS =================
async function loadMyListings() {
  const grid = document.getElementById("myListingsGrid");
  if (!grid) return;
  grid.innerHTML = `<div class="empty-state"><div class="empty-icon">⏳</div><p>Loading…</p></div>`;
  const items = await getUserItems(currentUser.uid);
  if (!items.length) {
    grid.innerHTML = `<div class="empty-state"><div class="empty-icon">📦</div><p>No listings yet</p><small>Head to "Sell Item" to list something!</small></div>`;
    return;
  }
  grid.innerHTML = items.map((item, i) => {
    const meta = getCategoryMeta(item.category);
    return `
      <div class="card" style="animation-delay:${i * 0.04}s">
        <div class="card-image-strip" style="background:${meta.color};">
          <span class="card-emoji">${meta.emoji}</span>
          <span class="card-cat-label" style="color:${meta.accent};">${item.category || "General"}</span>
        </div>
        <div class="card-body">
          <div class="card-top-row"><h3>${item.title}</h3><span class="card-price">₹${item.price}</span></div>
          <p class="card-desc">${item.description || "No description."}</p>
          <button onclick="handleDeleteItem('${item.id}')"
            style="background:#FFF0F3;color:#E0004D;border:1.5px solid rgba(224,0,77,0.2);box-shadow:none;margin-top:auto;">
            🗑 Remove Listing
          </button>
        </div>
      </div>`;
  }).join("");
}

window.handleDeleteItem = async (itemId) => {
  if (!confirm("Remove this listing?")) return;
  try {
    await deleteItem(itemId);
    showToast("Listing removed.", "success");
    await loadMyListings();
  } catch (err) { showToast(err.message, "error"); }
};

// ================= INTERESTS =================
async function loadInterests() {
  const tbody = document.getElementById("interestsTableBody");
  if (!tbody) return;
  const interests = await getSellerInterests(currentUser.uid);
  if (!interests.length) {
    tbody.innerHTML = `<tr><td colspan="3" style="text-align:center;padding:40px;color:#9CA3AF;">No interests received yet.</td></tr>`;
    return;
  }
  tbody.innerHTML = `
    <tr><td>Item ID</td><td>Buyer</td><td>Date</td></tr>
    ${interests.map(i => `
      <tr>
        <td>${i.itemId || "—"}</td>
        <td>${i.buyerName || i.buyerId || "Unknown"}</td>
        <td>${i.createdAt?.toDate ? i.createdAt.toDate().toLocaleDateString("en-IN") : "—"}</td>
      </tr>`).join("")}`;
}

// ================= ADMIN =================
async function loadAdminData() {
  const [users, items] = await Promise.all([getAllUsers(), getAllItems()]);
  const totalUsersEl = document.getElementById("totalUsers");
  const totalListingsEl = document.getElementById("totalListings");
  if (totalUsersEl) totalUsersEl.textContent = users.length;
  if (totalListingsEl) totalListingsEl.textContent = items.length;
  const tbody = document.getElementById("usersTableBody");
  if (!tbody) return;
  tbody.innerHTML = `
    <tr><td>Name</td><td>Email</td><td>Role</td><td>College</td></tr>
    ${users.map(u => `
      <tr>
        <td>${u.name || "—"}</td>
        <td>${u.email || "—"}</td>
        <td style="text-transform:capitalize;">${u.role || "user"}</td>
        <td>${u.college || "—"}</td>
      </tr>`).join("")}`;
}

// ================= FILTER LOGIC =================
function applyFilters() {
  const search = document.getElementById("searchInput")?.value.toLowerCase() || "";
  const category = document.getElementById("categoryFilter")?.value || "";
  const price = document.getElementById("priceFilter")?.value || "";
  let filtered = [...allItems];
  if (search) filtered = filtered.filter(i => i.title?.toLowerCase().includes(search) || i.description?.toLowerCase().includes(search));
  if (category && category !== "All") filtered = filtered.filter(i => i.category === category);
  if (price) filtered = filtered.filter(i => Number(i.price) <= Number(price));
  renderItems(filtered);
}
document.getElementById("searchInput")?.addEventListener("input", applyFilters);
document.getElementById("categoryFilter")?.addEventListener("change", applyFilters);
document.getElementById("priceFilter")?.addEventListener("input", applyFilters);
