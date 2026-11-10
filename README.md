# 📦 EstoqueHub — Inventory Management System

A demo web application for product registration, stock quantity tracking, incoming and outgoing inventory transactions, and inventory dashboard metrics.

> **Project context:** This repository documents an independent implementation inspired by the public interface of the [reference system](https://bejewelled-snickerdoodle-eb976a.netlify.app/). It is not an extraction of the original source code. You can integrate these files into your existing project.

## ✨ Implemented Features

- **Dashboard:** Total products, units in stock, low-stock items, and estimated total inventory value.
- **Product Management:** Add, edit, delete, and search products by name or code; manage categories, prices, and quantities.
- **Inventory Transactions:** Record stock entries and withdrawals with transaction history, dates, and notes; prevent withdrawals that exceed available stock.
- **Settings:** Set the minimum quantity used to trigger low-stock alerts.
- **Local Data Persistence:** Store application data in the browser's `localStorage`.
- **Backup and Restore:** Export and import data in JSON format.
- **Responsive Design:** Navigation and layout adapt to smaller screens.

## 🛠️ Technologies

HTML5, CSS3, and vanilla JavaScript (no external libraries or build step required).

## 📁 Project Structure

```text
controle-estoque/
├── index.html
├── assets/
│   ├── style.css
│   └── app.js
├── netlify.toml
├── .gitignore
├── LICENSE
└── README.md
```

## ▶️ Running Locally

Open `index.html` in a modern web browser. Alternatively, start a local HTTP server from the project directory:

```bash
python -m http.server 8000
```

Then visit `http://localhost:8000`.

## 🚀 Deployment

### GitHub

```bash
git init
git add .
git commit -m "docs: add inventory management prototype"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPOSITORY.git
git push -u origin main
```

Replace `YOUR-USERNAME` and `YOUR-REPOSITORY` with your GitHub username and repository name. If your project is already under version control, **do not run `git init` or overwrite existing files without reviewing the changes first**.

### GitHub Pages

1. Push the project files to the repository root (or your chosen publishing directory).
2. Go to **Settings → Pages** and select **Deploy from a branch**.
3. Select the `main` branch and the `/ (root)` folder, then save.
4. Once deployment is complete, open the URL provided by GitHub.

### Netlify

Import the GitHub repository into Netlify or manually deploy the project folder. Since this is a static website, no build command is required. Set the publish directory to the project root (`.`).

## 💾 Data Storage and Limitations

All data is stored **only in the browser on the device being used**. This version does not include a database, user authentication, cross-device synchronization, or an API. Clearing browser data may permanently remove stored records. Use the JSON export feature to keep backups.

**Important:** This project is intended as a demonstration and portfolio prototype, not a production-ready inventory system. For real-world use, consider adding authentication, a database, access control, server-side validation, and automated backups.

## 🧭 Planned Improvements

- Batch registration and expiration-date tracking for perishable products.
- Promotions and separate wholesale and retail pricing.
- Barcode integration with an external product catalog.
- PDF reports with customizable company letterhead.
- Free-tier database integration (e.g., Supabase) and authentication.

These improvements **are not implemented in the current version**.

## 📄 License

This implementation is distributed under the MIT License. See [`LICENSE`](LICENSE) for details.
