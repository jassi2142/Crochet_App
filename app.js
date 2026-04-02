'use strict';

/* ── App State ───────────────────────────────────────────────
   Manages: product rendering, filtering, cart, modals, checkout
   ─────────────────────────────────────────────────────────── */

let activeCategory = 'All';
let searchQuery    = '';
let toastTimer     = null;

// ── Initialization ─────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initProducts();
  renderProducts();
  updateCartUI();
  renderAdminButton();
  bindEvents();
  // Show admin dashboard if already logged in
  if (isAdminLoggedIn()) showAdminDashboard();
});

// ── Event Bindings ─────────────────────────────────────────
function bindEvents() {
  // Navbar
  document.getElementById('cartBtn').addEventListener('click', openCart);
  document.getElementById('adminBtn').addEventListener('click', handleAdminButtonClick);

  // Filter bar
  document.getElementById('searchInput').addEventListener('input', e => {
    searchQuery = e.target.value.toLowerCase();
    renderProducts();
  });

  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeCategory = btn.dataset.category;
      renderProducts();
    });
  });

  // Hero CTA
  document.getElementById('heroCta').addEventListener('click', () => {
    document.getElementById('productsSection').scrollIntoView({ behavior: 'smooth' });
  });

  // Cart sidebar
  document.getElementById('closeCartBtn').addEventListener('click', closeCart);
  document.getElementById('cartOverlay').addEventListener('click', closeCart);
  document.getElementById('checkoutBtn').addEventListener('click', openCheckout);

  // Admin login form
  document.getElementById('adminLoginForm').addEventListener('submit', handleAdminLogin);

  // Product form (admin)
  document.getElementById('productForm').addEventListener('submit', submitProductForm);
  document.getElementById('productFormImage').addEventListener('input', e => {
    updateImagePreview(e.target.value);
  });
  document.querySelectorAll('.form-group input, .form-group select, .form-group textarea').forEach(el => {
    el.addEventListener('input', () => {
      el.closest('.form-group')?.classList.remove('error');
    });
  });

  // Checkout form
  document.getElementById('checkoutForm').addEventListener('submit', handleCheckoutSubmit);

  // Admin close / add product
  document.getElementById('adminLogoutBtn')?.addEventListener('click', adminLogout);
  document.getElementById('addProductBtn')?.addEventListener('click', openAddProduct);

  // Overlay / modal close buttons wired via onclick attributes in HTML
  // Keyboard escape
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeAllModals();
  });
}

// ── Products Rendering ─────────────────────────────────────
function renderProducts() {
  const grid = document.getElementById('productsGrid');
  let products = getProducts();

  // Filter by category
  if (activeCategory !== 'All') {
    products = products.filter(p => p.category === activeCategory);
  }

  // Filter by search
  if (searchQuery) {
    products = products.filter(p =>
      p.name.toLowerCase().includes(searchQuery) ||
      p.description.toLowerCase().includes(searchQuery) ||
      p.category.toLowerCase().includes(searchQuery)
    );
  }

  // Update count
  document.getElementById('productCount').textContent =
    `${products.length} item${products.length !== 1 ? 's' : ''}`;

  grid.innerHTML = '';

  if (products.length === 0) {
    grid.innerHTML = `
      <div class="no-results">
        <div class="no-results-icon">🧶</div>
        <h3>No products found</h3>
        <p>Try a different search or category filter.</p>
      </div>`;
    return;
  }

  const cart = getCart();

  products.forEach((p, idx) => {
    const catCfg    = CATEGORY_CONFIG[p.category] || CATEGORY_CONFIG['Plushies'];
    const inCart    = cart.some(c => c.productId === p.id);
    const canBuy    = p.available && p.stock > 0;
    const card      = document.createElement('div');
    card.className  = 'product-card';
    card.style.animationDelay = `${idx * 0.05}s`;
    card.dataset.productId = p.id;

    card.innerHTML = `
      <div class="card-image" style="background:${catCfg.gradient}">
        ${p.image
          ? `<img src="${p.image}" alt="${p.name}" class="card-product-img"
                  onerror="this.style.display='none';this.nextElementSibling.style.display='flex'" />
             <span class="card-image-emoji" style="display:none">${catCfg.emoji}</span>`
          : `<span class="card-image-emoji">${catCfg.emoji}</span>`
        }
        <span class="card-badge ${canBuy ? 'badge-in-stock' : 'badge-out-stock'}">
          ${canBuy ? '✓ In Stock' : '✗ Unavailable'}
        </span>
        ${p.featured ? '<span class="card-featured">⭐ Featured</span>' : ''}
      </div>
      <div class="card-body">
        <span class="card-category" style="color:${catCfg.accentColor}">${p.category}</span>
        <div class="card-name">${p.name}</div>
        <div class="card-desc">${p.description}</div>
        <div class="card-footer">
          <div>
            <div class="card-price">${formatPrice(p.price)}</div>
            ${canBuy
              ? `<div class="card-stock-info">${p.stock} left in stock</div>`
              : `<div class="card-stock-info" style="color:#a04040">Currently unavailable</div>`}
          </div>
          <button class="btn-add-cart"
                  id="cart-btn-${p.id}"
                  onclick="addToCart('${p.id}')"
                  ${!canBuy ? 'disabled' : ''}>
            ${inCart ? '✓ Added' : '+ Cart'}
          </button>
        </div>
      </div>`;
    grid.appendChild(card);
  });
}

// ── Cart Operations ────────────────────────────────────────
function addToCart(productId) {
  const products = getProducts();
  const product  = products.find(p => p.id === productId);
  if (!product || !product.available || product.stock <= 0) return;

  const cart = getCart();
  const idx  = cart.findIndex(c => c.productId === productId);

  if (idx !== -1) {
    if (cart[idx].qty < product.stock) cart[idx].qty++;
    else { showToast('Maximum available stock reached', 'error'); return; }
  } else {
    cart.push({ productId, qty: 1 });
  }

  saveCart(cart);
  updateCartUI();
  renderProducts();

  // Bounce animation on cart button
  const cartBtn = document.getElementById('cartBtn');
  cartBtn.classList.add('bounce');
  cartBtn.addEventListener('animationend', () => cartBtn.classList.remove('bounce'), { once: true });

  showToast(`"${product.name}" added to cart 🛍️`, 'success');
}

function removeFromCart(productId) {
  const cart = getCart().filter(c => c.productId !== productId);
  saveCart(cart);
  updateCartUI();
  renderProducts();
}

function changeQty(productId, delta) {
  const products = getProducts();
  const product  = products.find(p => p.id === productId);
  const cart     = getCart();
  const idx      = cart.findIndex(c => c.productId === productId);
  if (idx === -1) return;

  const newQty = cart[idx].qty + delta;
  if (newQty < 1) {
    removeFromCart(productId);
    return;
  }
  if (product && newQty > product.stock) {
    showToast('Not enough stock', 'error');
    return;
  }
  cart[idx].qty = newQty;
  saveCart(cart);
  updateCartUI();
}

function updateCartUI() {
  const cart     = getCart();
  const products = getProducts();
  const totalQty = cart.reduce((s, c) => s + c.qty, 0);
  const totalAmt = cart.reduce((s, c) => {
    const p = products.find(pr => pr.id === c.productId);
    return s + (p ? p.price * c.qty : 0);
  }, 0);

  // Badge
  const badge = document.getElementById('cartCount');
  badge.textContent = totalQty;
  badge.style.display = totalQty === 0 ? 'none' : 'flex';

  // Cart items
  const cartItemsEl = document.getElementById('cartItems');
  cartItemsEl.innerHTML = '';

  if (cart.length === 0) {
    cartItemsEl.innerHTML = `
      <div class="cart-empty">
        <div class="cart-empty-icon">🛍️</div>
        <p>Your cart is empty</p>
        <p style="font-size:0.8rem;color:var(--text-light)">Add some handmade treasures!</p>
      </div>`;
  } else {
    cart.forEach(item => {
      const p = products.find(pr => pr.id === item.productId);
      if (!p) return;
      const catCfg = CATEGORY_CONFIG[p.category] || CATEGORY_CONFIG['Plushies'];
      const el = document.createElement('div');
      el.className = 'cart-item';
      el.innerHTML = `
        <div class="cart-item-emoji" style="background:${catCfg.gradient}">
          ${catCfg.emoji}
        </div>
        <div class="cart-item-info">
          <div class="cart-item-name">${p.name}</div>
          <div class="cart-item-price">${formatPrice(p.price * item.qty)}</div>
        </div>
        <div class="cart-item-qty">
          <button class="btn-qty" onclick="changeQty('${p.id}', -1)">−</button>
          <span class="qty-num">${item.qty}</span>
          <button class="btn-qty" onclick="changeQty('${p.id}', 1)">+</button>
        </div>
        <button class="btn-remove-item" onclick="removeFromCart('${p.id}')" title="Remove">✕</button>`;
      cartItemsEl.appendChild(el);
    });
  }

  // Totals
  document.getElementById('cartTotal').textContent = formatPrice(totalAmt).replace('₹', '');
  document.getElementById('cartTotalDisplay').textContent = formatPrice(totalAmt);

  // Checkout button
  document.getElementById('checkoutBtn').disabled = cart.length === 0;
}

// ── Cart Sidebar ───────────────────────────────────────────
function openCart() {
  document.getElementById('cartSidebar').classList.add('open');
  document.getElementById('cartOverlay').classList.remove('hidden');
  requestAnimationFrame(() =>
    document.getElementById('cartOverlay').classList.add('visible')
  );
}

function closeCart() {
  document.getElementById('cartSidebar').classList.remove('open');
  const overlay = document.getElementById('cartOverlay');
  overlay.classList.remove('visible');
  overlay.addEventListener('transitionend', () => overlay.classList.add('hidden'), { once: true });
}

// ── Modals ─────────────────────────────────────────────────
function showModal(id) {
  const overlay = document.getElementById(id);
  overlay.classList.remove('hidden');
  requestAnimationFrame(() => overlay.classList.add('visible'));
  document.body.style.overflow = 'hidden';
}

function closeModal(id) {
  const overlay = document.getElementById(id);
  overlay.classList.remove('visible');
  overlay.addEventListener('transitionend', () => {
    overlay.classList.add('hidden');
    document.body.style.overflow = '';
  }, { once: true });
}

function closeAllModals() {
  ['adminLoginModal', 'checkoutModal', 'orderConfirmedModal', 'productFormModal']
    .forEach(id => {
      const el = document.getElementById(id);
      if (el && !el.classList.contains('hidden') && el.classList.contains('visible')) {
        closeModal(id);
      }
    });
}

// ── Admin Button ───────────────────────────────────────────
function renderAdminButton() {
  const btn = document.getElementById('adminBtn');
  if (isAdminLoggedIn()) {
    btn.textContent = '⚙️ Admin Panel';
    btn.classList.add('logged-in');
  } else {
    btn.textContent = '🔐 Admin';
    btn.classList.remove('logged-in');
  }
}

function handleAdminButtonClick() {
  if (isAdminLoggedIn()) {
    if (!document.getElementById('adminDashboard').classList.contains('hidden')) {
      hideAdminDashboard();
      renderAdminButton();
    } else {
      showAdminDashboard();
    }
  } else {
    showModal('adminLoginModal');
  }
}

// ── Admin Login ────────────────────────────────────────────
function handleAdminLogin(e) {
  e.preventDefault();
  const user = document.getElementById('adminUser').value.trim();
  const pass = document.getElementById('adminPass').value;
  const errEl = document.getElementById('loginError');

  if (adminLogin(user, pass)) {
    setAdminSession(true);
    closeModal('adminLoginModal');
    renderAdminButton();
    showAdminDashboard();
    showToast('Welcome back, Admin! 👋', 'success');
    document.getElementById('adminLoginForm').reset();
    errEl.classList.remove('visible');
  } else {
    errEl.textContent = 'Incorrect username or password.';
    errEl.classList.add('visible');
    document.getElementById('adminPass').value = '';
    document.getElementById('adminPass').focus();
  }
}

// ── Checkout ───────────────────────────────────────────────
function openCheckout() {
  const cart = getCart();
  if (cart.length === 0) return;
  closeCart();
  populateOrderSummary();
  showModal('checkoutModal');
}

function populateOrderSummary() {
  const cart     = getCart();
  const products = getProducts();
  const listEl   = document.getElementById('orderSummaryItems');
  listEl.innerHTML = '';
  let total = 0;

  cart.forEach(item => {
    const p = products.find(pr => pr.id === item.productId);
    if (!p) return;
    const subtotal = p.price * item.qty;
    total += subtotal;
    const row = document.createElement('div');
    row.className = 'order-summary-item';
    row.innerHTML = `
      <span class="order-summary-item-name">${p.name}</span>
      <span class="order-summary-item-qty">×${item.qty}</span>
      <span class="order-summary-item-price">${formatPrice(subtotal)}</span>`;
    listEl.appendChild(row);
  });

  document.getElementById('orderTotal').textContent = formatPrice(total);
}

function handleCheckoutSubmit(e) {
  e.preventDefault();
  const form = e.target;

  // Basic validation
  const fields = ['checkoutName', 'checkoutPhone', 'checkoutEmail', 'checkoutAddress'];
  let valid = true;

  fields.forEach(fid => {
    const el  = document.getElementById(fid);
    const grp = el.closest('.form-group');
    if (!el.value.trim()) {
      grp.classList.add('error');
      const errEl = grp.querySelector('.form-error');
      if (errEl) errEl.textContent = 'This field is required.';
      valid = false;
    }
  });

  // Email check
  const emailEl  = document.getElementById('checkoutEmail');
  const emailGrp = emailEl.closest('.form-group');
  if (emailEl.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailEl.value)) {
    emailGrp.classList.add('error');
    const errEl = emailGrp.querySelector('.form-error');
    if (errEl) errEl.textContent = 'Enter a valid email address.';
    valid = false;
  }

  // Phone check
  const phoneEl  = document.getElementById('checkoutPhone');
  const phoneGrp = phoneEl.closest('.form-group');
  if (phoneEl.value && !/^\d{10}$/.test(phoneEl.value.trim())) {
    phoneGrp.classList.add('error');
    const errEl = phoneGrp.querySelector('.form-error');
    if (errEl) errEl.textContent = 'Enter a valid 10-digit phone number.';
    valid = false;
  }

  if (!valid) return;

  // Generate order id and confirm
  const orderId = 'CS-' + Date.now().toString(36).toUpperCase();
  document.getElementById('confirmedOrderId').textContent = orderId;
  document.getElementById('confirmedName').textContent    = document.getElementById('checkoutName').value.trim().split(' ')[0];

  // Clear cart
  saveCart([]);
  updateCartUI();
  renderProducts();

  closeModal('checkoutModal');
  setTimeout(() => showModal('orderConfirmedModal'), 350);

  form.reset();
}

// ── Toast ──────────────────────────────────────────────────
function showToast(msg, type = 'info') {
  const toast = document.getElementById('toast');
  if (toastTimer) clearTimeout(toastTimer);
  toast.textContent = msg;
  toast.className   = `show ${type}`;
  toastTimer = setTimeout(() => { toast.classList.remove('show'); }, 3000);
}
