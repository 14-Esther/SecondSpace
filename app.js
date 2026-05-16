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
  getUserItems,
  addInterest,
  getSellerInterests,
  getAllUsers,
  getAllInterests
} from "./firestore.js";

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

const registerBtn = document.getElementById("registerBtn");
const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");

const registerName = document.getElementById("registerName");
const registerCollege = document.getElementById("registerCollege");
const registerDepartment = document.getElementById("registerDepartment");
const registerYear = document.getElementById("registerYear");
const registerAddress = document.getElementById("registerAddress");
const registerEmail = document.getElementById("registerEmail");
const registerPassword = document.getElementById("registerPassword");

const loginEmail = document.getElementById("loginEmail");
const loginPassword = document.getElementById("loginPassword");

const navBrowseBtn = document.getElementById("navBrowseBtn");
const navSellBtn = document.getElementById("navSellBtn");
const navListingsBtn = document.getElementById("navListingsBtn");
const navInterestsBtn = document.getElementById("navInterestsBtn");
const navAdminBtn = document.getElementById("navAdminBtn");

const browseSection = document.getElementById("browseSection");
const sellSection = document.getElementById("sellSection");
const myListingsSection = document.getElementById("myListingsSection");
const interestsSection = document.getElementById("interestsSection");
const adminSection = document.getElementById("adminSection");

const listingsGrid = document.getElementById("listingsGrid");
const emptyState = document.getElementById("emptyState");

const myListingsGrid = document.getElementById("myListingsGrid");
const myListingsEmptyState = document.getElementById("myListingsEmptyState");

const interestsTableBody = document.getElementById("interestsTableBody");

const usersTableBody = document.getElementById("usersTableBody");
const totalUsers = document.getElementById("totalUsers");
const totalListings = document.getElementById("totalListings");
const totalInterests = document.getElementById("totalInterests");

const addItemBtn = document.getElementById("addItemBtn");
const itemTitle = document.getElementById("itemTitle");
const itemCategory = document.getElementById("itemCategory");
const itemPrice = document.getElementById("itemPrice");
const itemCondition = document.getElementById("itemCondition");
const itemDescription = document.getElementById("itemDescription");
const itemPhone = document.getElementById("itemPhone");
const itemEmail = document.getElementById("itemEmail");

let currentUser = null;
let currentUserProfile = null;

function showLogin() {
  landingPage.classList.add("hidden");
  authPage.classList.remove("hidden");
  app.classList.add("hidden");
  loginView.classList.remove("hidden");
  registerView.classList.add("hidden");
}

function showRegister() {
  landingPage.classList.add("hidden");
  authPage.classList.remove("hidden");
  app.classList.add("hidden");
  registerView.classList.remove("hidden");
  loginView.classList.add("hidden");
}

function showHome() {
  landingPage.classList.remove("hidden");
  authPage.classList.add("hidden");
  app.classList.add("hidden");
}

function hideAllSections() {
  browseSection.classList.add("hidden");
  sellSection.classList.add("hidden");
  myListingsSection.classList.add("hidden");
  interestsSection.classList.add("hidden");
  adminSection.classList.add("hidden");
}

function clearActiveNav() {
  document.querySelectorAll(".nav-item").forEach(btn => btn.classList.remove("active"));
}

function showSection(section, activeBtn) {
  hideAllSections();
  clearActiveNav();
  section.classList.remove("hidden");
  activeBtn.classList.add("active");
}

function escapeHTML(value) {
  if (value === null || value === undefined) return "";
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function createRoleBadge(role) {
  const normalizedRole = role === "admin" ? "admin" : "user";
  const roleText = normalizedRole === "admin" ? "Admin" : "Student";

  return `<span class="role-badge ${normalizedRole}">${roleText}</span>`;
}

function createBrowseCard(item) {
  const isOwner = currentUser && item.sellerId === currentUser.uid;

  return `
    <div class="listing-card">
      <h3>${escapeHTML(item.title || "Untitled Item")}</h3>
      <p><strong>Category:</strong> ${escapeHTML(item.category || "Not specified")}</p>
      <p><strong>Price:</strong> ${escapeHTML(item.price || "Not specified")}</p>
      <p><strong>Condition:</strong> ${escapeHTML(item.condition || "Not specified")}</p>
      <p><strong>Description:</strong> ${escapeHTML(item.description || "No description")}</p>
      <p><strong>Phone:</strong> ${escapeHTML(item.phone || "Not provided")}</p>
      <p><strong>Email:</strong> ${escapeHTML(item.email || item.sellerEmail || "Not provided")}</p>
      <p>
        <strong>Seller:</strong> ${escapeHTML(item.sellerName || "Unknown")}
        ${createRoleBadge(item.role)}
      </p>
      <p><strong>College:</strong> ${escapeHTML(item.college || "Not specified")}</p>
      ${
        !isOwner
          ? `<button
                class="interest-btn"
                data-id="${item.id}"
                data-title="${escapeHTML(item.title || "Item")}"
                data-seller-id="${escapeHTML(item.sellerId || "")}"
                data-seller-name="${escapeHTML(item.sellerName || "")}"
                data-seller-email="${escapeHTML(item.sellerEmail || "")}">
                I'm Interested
             </button>`
          : `<button class="interest-btn owner-btn" disabled>Your Item</button>`
      }
    </div>
  `;
}

function createMyListingCard(item) {
  return `
    <div class="listing-card">
      <h3>${escapeHTML(item.title || "Untitled Item")}</h3>
      <p><strong>Category:</strong> ${escapeHTML(item.category || "Not specified")}</p>
      <p><strong>Price:</strong> ${escapeHTML(item.price || "Not specified")}</p>
      <p><strong>Condition:</strong> ${escapeHTML(item.condition || "Not specified")}</p>
      <p><strong>Description:</strong> ${escapeHTML(item.description || "No description")}</p>
      <p><strong>Phone:</strong> ${escapeHTML(item.phone || "Not provided")}</p>
      <p><strong>Email:</strong> ${escapeHTML(item.email || item.sellerEmail || "Not provided")}</p>
      <p>
        <strong>Seller:</strong> ${escapeHTML(item.sellerName || "Unknown")}
        ${createRoleBadge(item.role)}
      </p>
      <p><strong>Status:</strong> Active</p>
    </div>
  `;
}

async function loadBrowseItems() {
  try {
    const items = await getAllItems();

    if (!items || items.length === 0) {
      listingsGrid.innerHTML = "";
      emptyState.classList.remove("hidden");
      return;
    }

    emptyState.classList.add("hidden");
    listingsGrid.innerHTML = items.map(createBrowseCard).join("");

    document.querySelectorAll(".interest-btn[data-id]").forEach(btn => {
      btn.addEventListener("click", async () => {
        try {
          const itemId = btn.dataset.id;
          const itemTitle = btn.dataset.title;

          await addInterest({
            itemId,
            itemTitle,
            buyerId: currentUser.uid,
            buyerName: currentUserProfile?.name || "User",
            buyerEmail: currentUser.email,
            sellerId: btn.dataset.sellerId || "",
            sellerName: btn.dataset.sellerName || "",
            sellerEmail: btn.dataset.sellerEmail || "",
            message: "I am interested in this item."
          });

          alert("Interest sent successfully.");
        } catch (error) {
          console.error(error);
          alert(error.message);
        }
      });
    });
  } catch (error) {
    console.error("Error loading browse items:", error);
    listingsGrid.innerHTML = "";
    emptyState.classList.remove("hidden");
    emptyState.innerHTML = `
      <div class="empty-icon">⚠️</div>
      <p>Unable to load items</p>
    `;
  }
}

async function loadMyListings() {
  try {
    const items = await getUserItems(currentUser.uid);

    if (!items || items.length === 0) {
      myListingsGrid.innerHTML = "";
      myListingsEmptyState.classList.remove("hidden");
      return;
    }

    myListingsEmptyState.classList.add("hidden");
    myListingsGrid.innerHTML = items.map(createMyListingCard).join("");
  } catch (error) {
    console.error("Error loading my listings:", error);
    myListingsGrid.innerHTML = "";
    myListingsEmptyState.classList.remove("hidden");
  }
}

async function loadInterests() {
  try {
    const interests = await getSellerInterests(currentUser.uid);

    if (!interests || interests.length === 0) {
      interestsTableBody.innerHTML = `
        <tr>
          <td colspan="4">No interests yet</td>
        </tr>
      `;
      return;
    }

    interestsTableBody.innerHTML = interests.map(interest => `
      <tr>
        <td>${escapeHTML(interest.buyerName || "-")}</td>
        <td>${escapeHTML(interest.buyerEmail || "-")}</td>
        <td>${escapeHTML(interest.itemTitle || "-")}</td>
        <td>${escapeHTML(interest.message || "-")}</td>
      </tr>
    `).join("");
  } catch (error) {
    console.error("Error loading interests:", error);
    interestsTableBody.innerHTML = `
      <tr>
        <td colspan="4">Unable to load interests</td>
      </tr>
    `;
  }
}

async function loadAdminData() {
  try {
    const users = await getAllUsers();
    const items = await getAllItems();
    const interests = await getAllInterests();

    totalUsers.textContent = users.length;
    totalListings.textContent = items.length;
    totalInterests.textContent = interests.length;

    usersTableBody.innerHTML = users.map(user => `
      <tr>
        <td>${escapeHTML(user.name || "-")}</td>
        <td>${escapeHTML(user.email || "-")}</td>
        <td>${escapeHTML(user.college || "-")}</td>
        <td>${escapeHTML(user.dept || "-")}</td>
        <td>${escapeHTML(user.year || "-")}</td>
        <td>${escapeHTML(user.role || "user")}</td>
      </tr>
    `).join("");
  } catch (error) {
    console.error("Error loading admin data:", error);
  }
}

goToLoginBtn.onclick = showLogin;
heroLoginBtn.onclick = showLogin;
goToRegisterBtn.onclick = showRegister;
heroRegisterBtn.onclick = showRegister;
showLoginBtn.onclick = showLogin;
showRegisterBtn.onclick = showRegister;
backHomeFromLogin.onclick = showHome;
backHomeFromRegister.onclick = showHome;

navBrowseBtn.onclick = async () => {
  showSection(browseSection, navBrowseBtn);
  await loadBrowseItems();
};

navSellBtn.onclick = () => {
  showSection(sellSection, navSellBtn);
};

navListingsBtn.onclick = async () => {
  showSection(myListingsSection, navListingsBtn);
  await loadMyListings();
};

navInterestsBtn.onclick = async () => {
  showSection(interestsSection, navInterestsBtn);
  await loadInterests();
};

navAdminBtn.onclick = async () => {
  showSection(adminSection, navAdminBtn);
  await loadAdminData();
};

registerBtn.onclick = async () => {
  try {
    if (
      !registerName.value.trim() ||
      !registerCollege.value.trim() ||
      !registerDepartment.value.trim() ||
      !registerYear.value.trim() ||
      !registerAddress.value.trim() ||
      !registerEmail.value.trim() ||
      !registerPassword.value.trim()
    ) {
      alert("Please fill all fields.");
      return;
    }

    await register(
      registerName.value.trim(),
      registerCollege.value.trim(),
      registerDepartment.value.trim(),
      registerYear.value.trim(),
      registerAddress.value.trim(),
      registerEmail.value.trim(),
      registerPassword.value.trim()
    );

    alert("Registration successful.");

    registerName.value = "";
    registerCollege.value = "";
    registerDepartment.value = "";
    registerYear.value = "";
    registerAddress.value = "";
    registerEmail.value = "";
    registerPassword.value = "";
  } catch (error) {
    console.error("Registration error:", error);
    alert(error.message);
  }
};

loginBtn.onclick = async () => {
  try {
    if (!loginEmail.value.trim() || !loginPassword.value.trim()) {
      alert("Please enter email and password.");
      return;
    }

    await login(loginEmail.value.trim(), loginPassword.value.trim());
    alert("Login successful.");
  } catch (error) {
    console.error("Login error:", error);
    alert(error.message);
  }
};

logoutBtn.onclick = async () => {
  try {
    await logout();
    currentUser = null;
    currentUserProfile = null;
    showHome();
  } catch (error) {
    console.error("Logout error:", error);
    alert(error.message);
  }
};

addItemBtn.onclick = async () => {
  try {
    if (
      !itemTitle.value.trim() ||
      !itemCategory.value.trim() ||
      !itemPrice.value.trim() ||
      !itemCondition.value.trim() ||
      !itemDescription.value.trim() ||
      !itemPhone.value.trim() ||
      !itemEmail.value.trim()
    ) {
      alert("Please fill all fields.");
      return;
    }

    await addItem({
      title: itemTitle.value.trim(),
      category: itemCategory.value.trim(),
      price: itemPrice.value.trim(),
      condition: itemCondition.value.trim(),
      description: itemDescription.value.trim(),
      phone: itemPhone.value.trim(),
      email: itemEmail.value.trim(),
      sellerId: currentUser.uid,
      sellerName: currentUserProfile?.name || "User",
      sellerEmail: currentUser.email,
      role: currentUserProfile?.role || "user",
      college: currentUserProfile?.college || ""
    });

    alert("Item added successfully.");

    itemTitle.value = "";
    itemCategory.value = "";
    itemPrice.value = "";
    itemCondition.value = "";
    itemDescription.value = "";
    itemPhone.value = "";
    itemEmail.value = "";

    showSection(myListingsSection, navListingsBtn);
    await loadMyListings();
  } catch (error) {
    console.error("Add item error:", error);
    alert(error.message);
  }
};

listenAuthState(async user => {
  if (user) {
    currentUser = user;
    currentUserProfile = await getCurrentUserProfile(user.uid);

    landingPage.classList.add("hidden");
    authPage.classList.add("hidden");
    app.classList.remove("hidden");

    if (currentUserProfile?.role === "admin") {
      navAdminBtn.classList.remove("hidden");
    } else {
      navAdminBtn.classList.add("hidden");
    }

    showSection(browseSection, navBrowseBtn);
    await loadBrowseItems();
  } else {
    currentUser = null;
    currentUserProfile = null;

    app.classList.add("hidden");
    authPage.classList.add("hidden");
    landingPage.classList.remove("hidden");
  }
});