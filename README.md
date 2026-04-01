# NAV Creations — Crochet Shop Inventory Website

A beautiful, fully featured crochet shop website for **NAV Creations** — modern crochet accessories made by hand.

---

## 🧶 Features

### Customer Side
- Browse 12 handmade crochet products (Earrings, Scrunchies, Hair Accessories, Charms & More)
- Filter by category and search by name/description
- Add products to cart with quantity controls
- Full checkout flow with delivery details form
- Order confirmation screen

### Admin Panel
- Password-protected admin login (`admin` / `crochet2024`)
- Dashboard with live stats (total products, in-stock, out-of-stock, categories)
- Add / Edit / Delete products
- Toggle product availability instantly

---

## 🚀 How to Run

**No server needed.** Just open `index.html` in your browser:

```
d:\Projects\Crochet App\index.html
```

Or right-click → **Open with** → Chrome / Edge

---

## 📁 File Structure

```
Crochet App/
├── index.html      ← Main page (shop + admin)
├── style.css       ← All styles (NAV Creations theme)
├── data.js         ← Product data + localStorage helpers
├── app.js          ← Shop logic: cart, checkout, filtering
├── admin.js        ← Admin panel: CRUD, login, stats
└── assets/         ← Product images (add your own photos here)
```

---

## 🎨 Theme

Inspired by [@navcreations2025](https://www.instagram.com/navcreations2025) on Instagram.

| Token | Value | Usage |
|---|---|---|
| Crimson Red | `#c41e3a` | Primary accent, buttons, badges |
| Forest Green | `#2d6a4f` | Secondary accent, scrunchie category |
| Warm Cream | `#fdf8f2` | Page background |
| Dark Mahogany | `#1e0a0a` | Navbar, footer |

**Fonts:** Playfair Display (headings) + Inter (body)

---

## 🔐 Admin Access

| Field | Value |
|---|---|
| Username | `admin` |
| Password | `crochet2024` |

---

## 🛒 Adding Your Own Product Photos

1. Place your images in the `assets/` folder
2. Log in as Admin → Edit any product
3. Update the image path to `assets/your-photo.jpg`

---

## 📦 Tech Stack

- Pure **HTML5** + **CSS3** + **Vanilla JavaScript**
- No frameworks, no build tools, no dependencies
- Data stored in `localStorage` (persists across sessions)

---

*Made with ❤️ — Every stitch made by hand.*
