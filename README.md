

# 💎 LUXORA — Designer Discovery Shop

**A premium multi-vendor marketplace to discover, shop and sell independent designer fashion.**

[![Live Demo](https://img.shields.io/badge/Live-Demo-black?style=for-the-badge&logo=vercel)](https://designer-discovery-shop.lovable.app)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Supabase](https://img.shields.io/badge/Supabase-Backend-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com)

[**🌐 Live Demo**](https://designer-discovery-shop.lovable.app) · [**🗺️ Roadmap**](./roadmap.md) · [**🐞 Report a Bug**](../../issues)

</div>

---

## ✨ About the Project

**LUXORA** connects independent fashion designers with customers who love unique, high-quality pieces. Shoppers can browse curated collections, explore designer profiles and check out smoothly, while designers get their own dashboard to run their shop, manage stock and track orders. An admin command center keeps the whole marketplace under control.

> Built with a modern full-stack TypeScript setup for speed, type-safety and a polished, responsive user experience.

---

## 🚀 Features

### 🛍️ Storefront
- Elegant home page with curated designer collections
- Shop page with powerful **search & filters**
- Detailed product pages
- Dedicated **designer profiles**
- **Wishlist** and **shopping bag**
- Secure **sign-in / authentication**
- Checkout flow and **order history**

### 🧵 Seller Dashboard
- Shop setup and branding
- Product management (add / edit / remove)
- Stock tracking
- Incoming orders management
- Vendor payouts & commissions

### 🛡️ Admin Command Center
- Marketplace overview
- Designer & commission management
- Payout management
- Order monitoring
- Product moderation

---

## 🧰 Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | [TanStack Start](https://tanstack.com/start) + [TanStack Router](https://tanstack.com/router) |
| **UI Library** | React 19 + TypeScript |
| **Styling** | Tailwind CSS 4, [shadcn/ui](https://ui.shadcn.com) (Radix UI), Lucide Icons |
| **Data Fetching** | TanStack Query |
| **Forms & Validation** | React Hook Form + Zod |
| **Backend / Auth** | Supabase |
| **Database ORM** | Drizzle ORM |
| **Build Tool** | Vite |
| **Testing** | Vitest + Testing Library |
| **Code Quality** | ESLint + Prettier |
| **Runtime / Package Manager** | Bun / npm |

---

## 📁 Project Structure

```
designer-discovery-shop/
├── src/            # Application source (routes, components, hooks, utils)
├── public/         # Static assets
├── drizzle/        # Database migrations & schema
├── supabase/       # Supabase configuration
├── roadmap.md      # Product roadmap
├── vite.config.ts  # Vite configuration
└── package.json
```

---

## ⚡ Getting Started

### Prerequisites
- [Node.js](https://nodejs.org) 18+ (or [Bun](https://bun.sh))
- A [Supabase](https://supabase.com) project

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/tariqkhan197/designer-discovery-shop.git

# 2. Go into the project folder
cd designer-discovery-shop

# 3. Install dependencies
npm install      # or: bun install

# 4. Set up environment variables (see below)
cp .env.example .env

# 5. Start the development server
npm run dev
```

The app will be available at `http://localhost:3000` (or the port shown in your terminal).

### 🔐 Environment Variables

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
DATABASE_URL=your_database_connection_string
```

> ⚠️ Never commit real secrets. Keep `.env` out of version control.

---

## 📜 Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the development server |
| `npm run build` | Create a production build |
| `npm run preview` | Preview the production build |
| `npm run lint` | Run ESLint |
| `npm run format` | Format code with Prettier |
| `npm run test` | Run tests once |
| `npm run test:watch` | Run tests in watch mode |

---

## 🗺️ Roadmap

- [x] **Phase 1** — Storefront (home, shop + filters, product, designers, sign-in, bag, wishlist, checkout, orders)
- [ ] **Phase 2a** — Seller dashboard (shop setup, products, stock, incoming orders)
- [ ] **Phase 2b** — Vendor payouts & commissions
- [ ] **Phase 3** — Admin command center
- [ ] Real card payments (currently placeholder checkout)
- [ ] Customer reviews
- [ ] Coupons, flash sales, loyalty program, product comparison & notifications

See [roadmap.md](./roadmap.md) for details.

---

## 🤝 Contributing

Contributions, issues and feature requests are welcome!

1. Fork the project
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m "Add amazing feature"`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 👤 Author

**Tariq Khan**
- GitHub: [@tariqkhan197](https://github.com/tariqkhan197)

---

## 🙏 Acknowledgements

- [Lovable](https://lovable.dev) — AI-assisted app building
- [shadcn/ui](https://ui.shadcn.com) — beautiful, accessible components
- [Supabase](https://supabase.com) — open-source Firebase alternative

---

<div align="center">

⭐ If you like this project, please give it a star!

</div>
