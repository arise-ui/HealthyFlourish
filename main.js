/* ============================================================
   HealthyFlourish — main.js (v3 Enhanced)
   Handles: Cart, Quick View, Payment Modal (M-Pesa/WhatsApp only),
            Mobile Drawer, Toast notifications
   ============================================================ */

/* ── STATE ─────────────────────────────────────────────────── */
let cart = JSON.parse(localStorage.getItem("cart")) || [];
let qtyValue = 1;
let currentQuickViewProduct = null;

const WA_NUMBER = "254743649936";

/* ── HELPERS ─────────────────────────────────────────────────*/
function showToast(msg) {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), 2800);
}

function formatPrice(n) {
  return "KSh " + Number(n).toLocaleString();
}

function saveCart() {
  localStorage.setItem("cart", JSON.stringify(cart));
}

function getProductData(card) {
  return {
    id: card.dataset.id,
    name: card.dataset.name,
    price: parseInt(card.dataset.price),
    brand: card.dataset.brand || "",
    img: card.dataset.img || card.querySelector(".card-img")?.src || "",
  };
}

/* ── CART ────────────────────────────────────────────────────*/
function addToCart(product) {
  const existing = cart.find((i) => i.id === product.id);

  if (existing) {
    existing.qty++;
  } else {
    cart.push({ ...product, qty: 1 });
  }

  saveCart();
  renderCart();
  updateCartCount();

  showToast(`✓ ${product.name} added to cart`);
}

function removeFromCart(id) {
  cart = cart.filter((i) => i.id !== id);
  saveCart();
  renderCart();
  updateCartCount();
}

function updateCartCount() {
  const total = cart.reduce((s, i) => s + i.qty, 0);
  document.getElementById("cart-count").textContent = total;
}

function renderCart() {
  const list = document.getElementById("cart-items-list");
  const empty = document.getElementById("cart-empty");
  const footer = document.getElementById("cart-footer");
  const countEl = document.getElementById("cart-item-count");

  countEl.textContent = cart.reduce((s, i) => s + i.qty, 0);

  if (cart.length === 0) {
    empty.style.display = "flex";
    footer.style.display = "none";
    Array.from(list.querySelectorAll(".cart-item")).forEach((el) =>
      el.remove(),
    );
    return;
  }

  empty.style.display = "none";
  footer.style.display = "flex";

  Array.from(list.querySelectorAll(".cart-item")).forEach((el) => el.remove());

  cart.forEach((item) => {
    const div = document.createElement("div");
    div.className = "cart-item";
    div.innerHTML = `
      <img src="${item.img}" alt="${item.name}" />
      <div class="cart-item-info">
        <p class="cart-item-name">${item.name}</p>
        <p class="cart-item-price">${formatPrice(item.price)} × ${item.qty}</p>
        <button class="cart-item-remove" data-id="${item.id}">Remove</button>
      </div>
    `;
    div.querySelector(".cart-item-remove").addEventListener("click", () => {
      removeFromCart(item.id);
    });
    list.insertBefore(div, empty);
  });

  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  document.getElementById("cart-total").textContent = formatPrice(total);
}

/* ── CART SIDEBAR OPEN / CLOSE ──────────────────────────────*/
function openCart() {
  document.getElementById("cart-sidebar").classList.add("open");
  document.getElementById("cart-overlay").classList.add("visible");
  document.body.style.overflow = "hidden";
}

function closeCart() {
  document.getElementById("cart-sidebar").classList.remove("open");
  document.getElementById("cart-overlay").classList.remove("visible");
  document.body.style.overflow = "";
}

document.getElementById("cart-icon-btn").addEventListener("click", openCart);
document
  .getElementById("cart-sidebar-close")
  .addEventListener("click", closeCart);
document.getElementById("cart-overlay").addEventListener("click", closeCart);

/* ── ADD TO CART BUTTONS ────────────────────────────────────*/
document.querySelectorAll(".add-to-cart").forEach((btn) => {
  btn.addEventListener("click", function () {
    const card = this.closest(".product-card");
    const product = getProductData(card);
    addToCart(product);

    const orig = this.textContent;
    this.textContent = "Added ✓";
    this.classList.add("added");
    setTimeout(() => {
      this.textContent = orig;
      this.classList.remove("added");
    }, 1500);
  });
});

/* ── QUICK VIEW ─────────────────────────────────────────────*/
function openQuickView(card) {
  const p = getProductData(card);
  currentQuickViewProduct = p;
  qtyValue = 1;
  document.getElementById("qty-val").textContent = 1;

  document.getElementById("qv-img").src = p.img;
  document.getElementById("qv-img").alt = p.name;
  document.getElementById("qv-brand").textContent = p.brand;
  document.getElementById("qv-title").textContent = p.name;
  document.getElementById("qv-price").textContent = formatPrice(p.price);

  document.getElementById("quickview-overlay").classList.add("open");
  document.body.style.overflow = "hidden";
}

function closeQuickView() {
  document.getElementById("quickview-overlay").classList.remove("open");
  document.body.style.overflow = "";
}

document.querySelectorAll(".quickview-btn").forEach((btn) => {
  btn.addEventListener("click", function () {
    openQuickView(this.closest(".product-card"));
  });
});

document.getElementById("qv-close").addEventListener("click", closeQuickView);
document
  .getElementById("quickview-overlay")
  .addEventListener("click", function (e) {
    if (e.target === this) closeQuickView();
  });

// QV qty controls
document.getElementById("qty-minus").addEventListener("click", () => {
  if (qtyValue > 1) {
    qtyValue--;
    document.getElementById("qty-val").textContent = qtyValue;
  }
});

document.getElementById("qty-plus").addEventListener("click", () => {
  qtyValue++;
  document.getElementById("qty-val").textContent = qtyValue;
});

// QV Add to Cart
document.getElementById("qv-add-btn").addEventListener("click", () => {
  if (!currentQuickViewProduct) return;
  for (let i = 0; i < qtyValue; i++) addToCart(currentQuickViewProduct);
  closeQuickView();
  openCart();
});

// QV WhatsApp
document.getElementById("qv-wa-btn").addEventListener("click", () => {
  if (!currentQuickViewProduct) return;
  const p = currentQuickViewProduct;
  const msg = encodeURIComponent(
    `Hi HealthyFlourish! I'd like to order:\n\n*${p.name}* × ${qtyValue}\nPrice: ${formatPrice(p.price * qtyValue)}\n\nPlease confirm availability & provide payment details.`,
  );
  window.open(`https://wa.me/${WA_NUMBER}?text=${msg}`, "_blank");
});

/* ── WHATSAPP — CARD BUTTON ─────────────────────────────────*/
document.querySelectorAll(".whatsapp-card-btn").forEach((btn) => {
  btn.addEventListener("click", function () {
    const card = this.closest(".product-card");
    const p = getProductData(card);
    const msg = encodeURIComponent(
      `Hi HealthyFlourish! I'd like to order:\n\n*${p.name}*\nPrice: ${formatPrice(p.price)}\n\nPlease confirm availability.`,
    );
    window.open(`https://wa.me/${WA_NUMBER}?text=${msg}`, "_blank");
  });
});

/* ── PAYMENT MODAL ──────────────────────────────────────────*/
function openPaymentModal() {
  document.getElementById("quickview-overlay").classList.remove("open");
  document.getElementById("payment-overlay").classList.add("open");
  document.body.style.overflow = "hidden";
}

function closePaymentModal() {
  document.getElementById("payment-overlay").classList.remove("open");
  document.body.style.overflow = "";
}

// All triggers that open payment modal
document.querySelectorAll(".open-payment-modal").forEach((el) => {
  el.addEventListener("click", (e) => {
    e.preventDefault();
    openPaymentModal();
  });
});

document
  .getElementById("payment-close")
  .addEventListener("click", closePaymentModal);

document
  .getElementById("payment-overlay")
  .addEventListener("click", function (e) {
    if (e.target === this) closePaymentModal();
  });

// Payment tabs
document.querySelectorAll(".pay-tab").forEach((tab) => {
  tab.addEventListener("click", function () {
    document
      .querySelectorAll(".pay-tab")
      .forEach((t) => t.classList.remove("active"));
    document
      .querySelectorAll(".pay-tab-content")
      .forEach((c) => c.classList.remove("active"));
    this.classList.add("active");
    document.getElementById(`tab-${this.dataset.tab}`).classList.add("active");
  });
});

/* ── MOBILE MENU ─────────────────────────────────────────────*/
document.getElementById("menu-toggle").addEventListener("click", () => {
  document.getElementById("mobile-drawer").classList.add("open");
  document.getElementById("drawer-overlay").classList.add("visible");
  document.body.style.overflow = "hidden";
});

["drawer-close", "drawer-overlay"].forEach((id) => {
  document.getElementById(id).addEventListener("click", () => {
    document.getElementById("mobile-drawer").classList.remove("open");
    document.getElementById("drawer-overlay").classList.remove("visible");
    document.body.style.overflow = "";
  });
});

/* ── SIDEBAR FILTER PANEL ────────────────────────────────────*/
document.getElementById("filter-toggle").addEventListener("click", () => {
  const sidebar = document.getElementById("filter-sidebar");
  const isMobile = window.innerWidth <= 900;
  if (isMobile) {
    sidebar.classList.toggle("mobile-open");
    document.getElementById("drawer-overlay").classList.toggle("visible");
    if (sidebar.classList.contains("mobile-open")) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  } else {
    sidebar.classList.toggle("hidden");
    const grid = document.getElementById("product-grid");
    if (sidebar.classList.contains("hidden")) {
      grid.closest(".layout-with-sidebar").style.gridTemplateColumns = "1fr";
    } else {
      grid.closest(".layout-with-sidebar").style.gridTemplateColumns =
        "220px 1fr";
    }
  }
});

document.getElementById("drawer-overlay").addEventListener("click", () => {
  const sidebar = document.getElementById("filter-sidebar");
  if (sidebar.classList.contains("mobile-open")) {
    sidebar.classList.remove("mobile-open");
    document.body.style.overflow = "";
  }
});

/* ── PRICE RANGE SLIDER ──────────────────────────────────────*/
document.getElementById("price-range").addEventListener("input", function () {
  document.getElementById("price-range-val").textContent =
    "KSh " + parseInt(this.value).toLocaleString();
});

/* ── TRENDING PILLS ──────────────────────────────────────────*/
document.querySelectorAll(".pill").forEach((pill) => {
  pill.addEventListener("click", () => {
    document
      .querySelectorAll(".pill")
      .forEach((p) => p.classList.remove("active"));
    pill.classList.add("active");
  });
});

/* ── FILTER TAG REMOVE ───────────────────────────────────────*/
document.querySelectorAll(".filter-tag button").forEach((btn) => {
  btn.addEventListener("click", function () {
    this.closest(".filter-tag").remove();
  });
});

/* ── SMOOTH SCROLL FOR HERO BUTTON ──────────────────────────*/
document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener("click", function (e) {
    const href = this.getAttribute("href");
    if (href === "#") return;

    e.preventDefault();
    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    }
  });
});

/* ── STAGGERED CARD ANIMATION ────────────────────────────────*/
document.querySelectorAll(".product-card").forEach((card, i) => {
  card.style.animationDelay = `${i * 0.07}s`;
});

/* ── LIVE SEARCH ─────────────────────────────────────────────*/
const searchInput = document.querySelector(".header-left .search-input");
const mobileSearchInput = document.getElementById("mobile-search-input");
const allCards = document.querySelectorAll(".product-card");

// Create a "no results" message element
const noResults = document.createElement("div");
noResults.id = "no-results-msg";
noResults.style.cssText = `
  grid-column: 1 / -1;
  text-align: center;
  padding: 60px 20px;
  display: none;
`;
noResults.innerHTML = `
  <div style="font-size:2.5rem; margin-bottom:14px;">🔍</div>
  <p style="font-size:1.05rem; font-weight:600; color:#3a1f3a; margin-bottom:8px;">No products found</p>
  <p style="font-size:.88rem; color:#7a6c72;">Try a different name or brand — e.g. "Cantu", "shampoo", "oil"</p>
`;
document.getElementById("product-grid").appendChild(noResults);

const countDisplay = document.querySelector(".collection-count");
const totalProducts = allCards.length;

function runSearch(query) {
  const q = query.trim().toLowerCase();
  let visibleCount = 0;

  allCards.forEach((card) => {
    const name = (card.dataset.name || "").toLowerCase();
    const brand = (card.dataset.brand || "").toLowerCase();
    const matches = !q || name.includes(q) || brand.includes(q);
    card.style.display = matches ? "" : "none";
    if (matches) visibleCount++;
  });

  noResults.style.display = visibleCount === 0 ? "block" : "none";

  if (q) {
    countDisplay.textContent = `${visibleCount} result${visibleCount !== 1 ? "s" : ""} for "${query.trim()}"`;
  } else {
    countDisplay.textContent = `${totalProducts} products`;
  }

  if (q.length === 1) {
    document
      .getElementById("collection")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

searchInput.addEventListener("input", function () {
  runSearch(this.value);
});

mobileSearchInput.addEventListener("input", function () {
  searchInput.value = this.value;
  runSearch(this.value);
});

// Escape clears search
[searchInput, mobileSearchInput].forEach((inp) => {
  inp.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      searchInput.value = "";
      mobileSearchInput.value = "";
      runSearch("");
      this.blur();
    }
  });
});

/* ── INIT ────────────────────────────────────────────────────*/
renderCart();
updateCartCount();
