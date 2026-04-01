'use strict';

/* ── Admin Module ────────────────────────────────────────────
   Handles: login, logout, CRUD for products, stats rendering
   ─────────────────────────────────────────────────────────── */

let adminEditingId = null; // null = add mode, string = edit mode

// ── Login / Logout ────────────────────────────────────────
function adminLogin(username, password) {
  return username === ADMIN_CREDENTIALS.username &&
         password === ADMIN_CREDENTIALS.password;
}

function adminLogout() {
  setAdminSession(false);
  hideAdminDashboard();
  renderAdminButton();
  showToast('Logged out of admin panel', 'info');
}

// ── Dashboard Stats ───────────────────────────────────────
function renderAdminStats() {
  const products = getProducts();
  const total       = products.length;
  const inStock     = products.filter(p => p.available && p.stock > 0).length;
  const outOfStock  = products.filter(p => !p.available || p.stock === 0).length;
  const categories  = new Set(products.map(p => p.category)).size;

  document.getElementById('statTotal').textContent      = total;
  document.getElementById('statInStock').textContent    = inStock;
  document.getElementById('statOutStock').textContent   = outOfStock;
  document.getElementById('statCategories').textContent = categories;
}

// ── Product Table ─────────────────────────────────────────
function renderAdminTable() {
  const products = getProducts();
  const tbody    = document.getElementById('adminTableBody');
  tbody.innerHTML = '';

  if (products.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:2.5rem;color:var(--text-muted)">
      No products yet. Click "Add Product" to get started.
    </td></tr>`;
    return;
  }

  products.forEach((p, idx) => {
    const catCfg  = CATEGORY_CONFIG[p.category] || CATEGORY_CONFIG['Plushies'];
    const delay   = idx * 0.03;
    const row = document.createElement('tr');
    row.style.animationDelay = `${delay}s`;
    row.innerHTML = `
      <td>
        <div class="tbl-emoji" style="background:${catCfg.gradient}">
          ${catCfg.emoji}
        </div>
      </td>
      <td>
        <div class="tbl-product-name">${escHtml(p.name)}</div>
        <div class="tbl-product-category">${escHtml(p.category)}</div>
      </td>
      <td style="font-weight:700;color:var(--mahogany)">${formatPrice(p.price)}</td>
      <td>
        <span style="font-weight:600;color:${p.stock > 0 ? 'var(--sage-dark)' : '#a04040'}">${p.stock}</span>
        <span style="font-size:0.75rem;color:var(--text-muted)"> units</span>
      </td>
      <td>
        <label class="toggle" title="Toggle availability">
          <input type="checkbox" ${p.available ? 'checked' : ''}
                 onchange="toggleAvailability('${p.id}')" id="toggle-${p.id}">
          <span class="toggle-slider"></span>
        </label>
      </td>
      <td>
        <div class="tbl-actions">
          <button class="btn-tbl-edit" onclick="openEditProduct('${p.id}')"
                  title="Edit product" id="edit-${p.id}">✏️</button>
          <button class="btn-tbl-delete" onclick="deleteProduct('${p.id}')"
                  title="Delete product" id="delete-${p.id}">🗑️</button>
        </div>
      </td>`;
    tbody.appendChild(row);
  });
}

function refreshAdminView() {
  renderAdminStats();
  renderAdminTable();
}

// ── Toggle Availability ───────────────────────────────────
function toggleAvailability(id) {
  const products = getProducts();
  const idx = products.findIndex(p => p.id === id);
  if (idx === -1) return;
  products[idx].available = !products[idx].available;
  saveProducts(products);
  refreshAdminView();
  renderProducts(); // refresh shop view
  const status = products[idx].available ? 'available' : 'unavailable';
  showToast(`"${products[idx].name}" marked as ${status}`, 'info');
}

// ── Delete Product ────────────────────────────────────────
function deleteProduct(id) {
  const products = getProducts();
  const product  = products.find(p => p.id === id);
  if (!product) return;

  if (!confirm(`Delete "${product.name}"? This cannot be undone.`)) return;

  const updated = products.filter(p => p.id !== id);
  saveProducts(updated);

  // Remove from cart if present
  const cart = getCart().filter(item => item.productId !== id);
  saveCart(cart);

  refreshAdminView();
  renderProducts();
  updateCartUI();
  showToast(`"${product.name}" deleted`, 'error');
}

// ── Add / Edit Product Modal ──────────────────────────────
function openAddProduct() {
  adminEditingId = null;
  document.getElementById('productFormTitle').textContent = 'Add New Product';
  document.getElementById('productForm').reset();
  clearFormErrors('productForm');
  document.getElementById('productFormStock').value = 10;
  document.getElementById('productFormAvailable').checked = true;
  showModal('productFormModal');
}

function openEditProduct(id) {
  const products = getProducts();
  const product  = products.find(p => p.id === id);
  if (!product) return;

  adminEditingId = id;
  document.getElementById('productFormTitle').textContent = 'Edit Product';

  document.getElementById('productFormName').value        = product.name;
  document.getElementById('productFormDesc').value        = product.description;
  document.getElementById('productFormPrice').value       = product.price;
  document.getElementById('productFormCategory').value    = product.category;
  document.getElementById('productFormStock').value       = product.stock;
  document.getElementById('productFormAvailable').checked = product.available;

  clearFormErrors('productForm');
  showModal('productFormModal');
}

function submitProductForm(e) {
  e.preventDefault();

  const name     = document.getElementById('productFormName').value.trim();
  const desc     = document.getElementById('productFormDesc').value.trim();
  const price    = parseFloat(document.getElementById('productFormPrice').value);
  const category = document.getElementById('productFormCategory').value;
  const stock    = parseInt(document.getElementById('productFormStock').value, 10);
  const avail    = document.getElementById('productFormAvailable').checked;

  // Validate
  let valid = true;
  if (!name)           { setFieldError('productFormName', 'Product name is required'); valid = false; }
  if (!desc)           { setFieldError('productFormDesc', 'Description is required');  valid = false; }
  if (!price || price <= 0) { setFieldError('productFormPrice', 'Enter a valid price'); valid = false; }
  if (!category)       { setFieldError('productFormCategory', 'Select a category');     valid = false; }
  if (isNaN(stock))    { setFieldError('productFormStock', 'Enter a valid stock count'); valid = false; }
  if (!valid) return;

  const products = getProducts();

  if (adminEditingId) {
    const idx = products.findIndex(p => p.id === adminEditingId);
    if (idx !== -1) {
      products[idx] = { ...products[idx], name, description: desc, price, category, stock, available: avail };
      showToast(`"${name}" updated ✓`, 'success');
    }
  } else {
    const newProduct = {
      id: generateId(),
      name,
      description: desc,
      price,
      category,
      stock,
      available: avail,
      featured: false,
    };
    products.unshift(newProduct);
    showToast(`"${name}" added to inventory ✓`, 'success');
  }

  saveProducts(products);
  closeModal('productFormModal');
  refreshAdminView();
  renderProducts();
}

// ── Form Helpers ──────────────────────────────────────────
function setFieldError(id, msg) {
  const el = document.getElementById(id);
  if (!el) return;
  const group = el.closest('.form-group');
  if (group) {
    group.classList.add('error');
    const errEl = group.querySelector('.form-error');
    if (errEl) errEl.textContent = msg;
  }
}

function clearFormErrors(formId) {
  document.querySelectorAll(`#${formId} .form-group`).forEach(g => {
    g.classList.remove('error');
  });
}

function escHtml(str) {
  const d = document.createElement('div');
  d.appendChild(document.createTextNode(str));
  return d.innerHTML;
}

// ── Show/Hide Admin Dashboard ─────────────────────────────
function showAdminDashboard() {
  document.getElementById('shopView').classList.add('hidden');
  document.getElementById('adminDashboard').classList.remove('hidden');
  window.scrollTo({ top: 0, behavior: 'smooth' });
  refreshAdminView();
}

function hideAdminDashboard() {
  document.getElementById('adminDashboard').classList.add('hidden');
  document.getElementById('shopView').classList.remove('hidden');
}
