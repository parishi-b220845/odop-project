# 🏺 ODOP Marketplace

**One District One Product** — A full-stack e-commerce platform connecting Indian artisans directly with buyers. Built to promote authentic handicrafts, handlooms, and traditional products from 700+ districts across India.

![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-4169E1?logo=postgresql)
![TailwindCSS](https://img.shields.io/badge/Tailwind-3-06B6D4?logo=tailwindcss)

---

## Features

**For Buyers**
- Browse 80+ ODOP product categories across 27 states
- Full-text search with filters (category, state, GI tag, price range)
- Interactive India map explorer with district-level product discovery
- Cultural hub with articles on Indian craft heritage
- Shopping cart, checkout with Razorpay integration
- Order tracking, reviews, wishlists, support tickets

**For Sellers**
- Dashboard with revenue analytics and order trends
- Product management with ODOP dataset validation
- GI (Geographical Indication) tag certification badges
- Order management with status workflow (pending → confirmed → processing → shipped → delivered)
- Image uploads with server-side processing

**For Admins**
- Platform-wide analytics (revenue, orders, users, categories)
- User management with block/unblock
- Seller verification workflow (approve/reject)
- Revenue charts and category distribution

**Technical**
- JWT authentication with refresh tokens
- Role-based access control (buyer / seller / admin)
- PostgreSQL with full-text search (pg_trgm)
- Rate limiting, Helmet security headers, CORS
- Multer + Sharp image processing
- Responsive design (mobile / tablet / desktop)
- Docker deployment with Nginx reverse proxy

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite 5, Tailwind CSS 3, React Router 6 |
| UI | Lucide Icons, Recharts, React Hot Toast, Leaflet maps |
| Backend | Node.js 18, Express 4 |
| Database | PostgreSQL 15 with pg_trgm extension |
| Auth | JWT (access + refresh tokens) |
| Payments | Razorpay (with dev simulation mode) |
| File Upload | Multer + Sharp |
| Deployment | Docker, Docker Compose, Nginx |

---

## Quick Start (Development)

### Prerequisites

- Node.js 18+
- PostgreSQL 14+ (running locally or via Docker)
- npm or yarn

### 1. Clone and install

```bash
git clone https://github.com/your-username/odop-marketplace.git
cd odop-marketplace
npm run setup    # installs root + backend + frontend deps
```

### 2. Configure environment

```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env` with your PostgreSQL credentials:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=odop_marketplace
DB_USER=your_pg_user
DB_PASS=your_pg_password
JWT_SECRET=any-random-64-character-string-here
```

### 3. Setup database

```bash
# Create the database
createdb odop_marketplace

# Run migrations (creates all tables, indexes, triggers)
cd backend && npm run migrate

# Seed with 80+ ODOP products, 65 districts, demo users
npm run seed
```

### 4. Start development servers

```bash
cd ..       # back to root
npm run dev # starts backend (port 5000) + frontend (port 5173) concurrently
```

Open **http://localhost:5173** in your browser.

### Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@odopmarket.in | Admin@123 |
| Seller | rajesh.weaver@test.com | Seller@123 |
| Seller | meena.pottery@test.com | Seller@123 |
| Buyer | anita.buyer@test.com | Buyer@123 |
| Buyer | vikram.buyer@test.com | Buyer@123 |

---

## Quick Start (Docker)

The fastest way to get everything running:

```bash
# Copy env file
cp .env.example .env

# Build and start (app + PostgreSQL)
docker compose up -d

# Run migrations and seed inside the container
docker compose exec app node backend/migrations/run.js
docker compose exec app node backend/seeds/run.js
```

Open **http://localhost:5000**

To include Nginx reverse proxy:

```bash
docker compose --profile with-nginx up -d
# App available on port 80
```

---

## Project Structure

```
odop-marketplace/
├── backend/
│   ├── config/
│   │   └── database.js           # PostgreSQL connection pool
│   ├── controllers/
│   │   ├── authController.js     # Register, login, profile
│   │   ├── productController.js  # CRUD, search, filters
│   │   ├── orderController.js    # Create, track, cancel
│   │   ├── cartController.js     # Add, update, remove
│   │   ├── paymentController.js  # Razorpay integration
│   │   ├── dashboardController.js# Seller/admin analytics
│   │   ├── supportController.js  # Ticket system
│   │   └── mapController.js      # Districts, ODOP data, articles
│   ├── middleware/
│   │   ├── auth.js               # JWT verify, role check
│   │   ├── errorHandler.js       # Global error handler
│   │   ├── rateLimiter.js        # API rate limiting
│   │   ├── upload.js             # Multer file upload
│   │   └── validation.js         # Input validation
│   ├── migrations/
│   │   ├── 001_initial_schema.js # Full DB schema (20+ tables)
│   │   ├── run.js                # Migration runner
│   │   └── reset.js              # Drop and recreate
│   ├── seeds/
│   │   ├── 001_seed_data.js      # 80+ products, 65 districts
│   │   └── run.js                # Seed runner
│   ├── routes/                   # Express route definitions
│   ├── utils/helpers.js          # Order numbers, slugify, etc.
│   ├── server.js                 # Express app entry point
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/common/    # Navbar, Footer, ProductCard
│   │   ├── context/              # AuthContext, CartContext
│   │   ├── pages/
│   │   │   ├── auth/             # Login, Register, Profile
│   │   │   ├── buyer/            # Home, Products, Cart, Orders...
│   │   │   ├── seller/           # Dashboard, Products, Orders
│   │   │   └── admin/            # AdminDashboard
│   │   ├── services/api.js       # Axios API client
│   │   ├── styles/index.css      # Tailwind + custom utilities
│   │   ├── App.jsx               # Routes + ProtectedRoute
│   │   └── main.jsx              # React entry
│   ├── tailwind.config.js        # Indian heritage color palette
│   ├── vite.config.js            # Dev proxy config
│   └── package.json
├── Dockerfile                    # Multi-stage production build
├── docker-compose.yml            # App + PostgreSQL + Nginx
├── nginx.conf                    # Reverse proxy config
├── .env.example                  # Environment template
└── package.json                  # Root monorepo scripts
```

---

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register (buyer or seller) |
| POST | `/api/auth/login` | Login, returns JWT |
| GET | `/api/auth/profile` | Get current user |
| PUT | `/api/auth/profile` | Update profile |
| PUT | `/api/auth/seller-profile` | Update seller details |
| POST | `/api/auth/change-password` | Change password |
| POST | `/api/auth/addresses` | Add shipping address |
| DELETE | `/api/auth/addresses/:id` | Remove address |

### Products
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | List with filters & pagination |
| GET | `/api/products/featured` | Featured products |
| GET | `/api/products/categories` | All categories |
| GET | `/api/products/states` | All states |
| GET | `/api/products/:slug` | Product detail |
| GET | `/api/products/seller` | Seller's products (auth) |
| POST | `/api/products` | Create product (seller) |
| PUT | `/api/products/:id` | Update product (seller) |
| DELETE | `/api/products/:id` | Delete product (seller) |

### Orders
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/orders` | Place order |
| GET | `/api/orders` | Buyer's orders |
| GET | `/api/orders/:id` | Order detail |
| POST | `/api/orders/:id/cancel` | Cancel order |
| GET | `/api/orders/seller` | Seller's orders |
| PUT | `/api/orders/:id/status` | Update order status (seller) |

### Cart & Payments
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/cart` | Get cart |
| POST | `/api/cart` | Add to cart |
| PUT | `/api/cart/:id` | Update quantity |
| DELETE | `/api/cart/:id` | Remove item |
| POST | `/api/payments/create-order` | Create Razorpay order |
| POST | `/api/payments/verify` | Verify payment |

### Dashboard & Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard/seller` | Seller analytics |
| GET | `/api/dashboard/admin` | Admin platform stats |
| GET | `/api/dashboard/admin/users` | List all users |
| PUT | `/api/dashboard/admin/users/:id/toggle` | Block/unblock user |
| PUT | `/api/dashboard/admin/sellers/:id/verify` | Verify seller |

### Map & Cultural
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/map/districts` | All districts with coords |
| GET | `/api/map/districts/:name` | District detail + products |
| GET | `/api/map/odop/states` | ODOP products by state |
| GET | `/api/map/articles` | Cultural articles |
| GET | `/api/map/articles/:slug` | Article detail |

---

## Database Schema

Key tables (PostgreSQL):

- `users` — Buyers, sellers, admins with role-based access
- `seller_profiles` — Business name, district, craft, verification status
- `buyer_addresses` — Multiple shipping addresses per buyer
- `products` — Full catalog with ODOP validation, GI tags, images
- `odop_dataset` — Official 80+ ODOP products (reference data)
- `cart_items` — Per-user shopping cart
- `orders` + `order_items` — Multi-seller order splitting
- `payments` — Razorpay payment tracking
- `reviews` — Verified purchase badges
- `wishlist` — Saved products
- `support_tickets` + `ticket_messages` — Customer support
- `districts` — 65+ districts with lat/lng for map
- `cultural_articles` — Heritage content for Cultural Hub

Full-text search powered by `pg_trgm` extension with GIN indexes.

---

## Production Deployment

### Option A: Docker (recommended)

```bash
# 1. Configure
cp .env.example .env
nano .env   # set strong JWT_SECRET, Razorpay keys, etc.

# 2. Deploy
docker compose up -d --build

# 3. Initialize database
docker compose exec app node backend/migrations/run.js
docker compose exec app node backend/seeds/run.js

# 4. With Nginx + SSL
docker compose --profile with-nginx up -d
```

### Option B: Manual (VPS / bare metal)

```bash
# 1. Install Node 18, PostgreSQL 15
# 2. Clone repo
git clone <repo> && cd odop-marketplace

# 3. Install deps
npm run setup

# 4. Configure
cp backend/.env.example backend/.env
nano backend/.env

# 5. Database
createdb odop_marketplace
cd backend
npm run migrate
npm run seed

# 6. Build frontend
cd ../frontend
npm run build

# 7. Start (with PM2)
npm install -g pm2
cd ../backend
pm2 start server.js --name odop-api
pm2 save
pm2 startup
```

### Option C: Cloud platforms

**Railway / Render:** Connect GitHub repo, set environment variables, deploy. Both auto-detect Node.js and can provision PostgreSQL.

**Vercel + Supabase:** Deploy frontend to Vercel, backend as serverless functions or separate service, PostgreSQL on Supabase.

---

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DB_HOST` | Yes | localhost | PostgreSQL host |
| `DB_PORT` | No | 5432 | PostgreSQL port |
| `DB_NAME` | Yes | odop_marketplace | Database name |
| `DB_USER` | Yes | — | Database user |
| `DB_PASS` | Yes | — | Database password |
| `JWT_SECRET` | Yes | — | 64+ char random string |
| `JWT_EXPIRES_IN` | No | 7d | Access token expiry |
| `JWT_REFRESH_EXPIRES_IN` | No | 30d | Refresh token expiry |
| `PORT` | No | 5000 | Server port |
| `CLIENT_URL` | No | http://localhost:5173 | Frontend URL (CORS) |
| `RAZORPAY_KEY_ID` | No | — | Razorpay API key |
| `RAZORPAY_KEY_SECRET` | No | — | Razorpay secret |
| `SMTP_HOST` | No | — | Email server |
| `SMTP_PORT` | No | 587 | Email port |
| `SMTP_USER` | No | — | Email username |
| `SMTP_PASS` | No | — | Email password |

---

## Design System

The UI uses a custom **Indian Heritage** theme:

| Token | Hex | Usage |
|-------|-----|-------|
| Terracotta | `#C35831` | Primary buttons, accents, links |
| Saffron | `#F59E0B` | Ratings, GI tag badges, highlights |
| Forest Green | `#15803D` | Success states, verified badges |
| Cream | `#FEF7ED` | Page background, cards |
| Charcoal | `#292524` | Body text |
| Indigo | `#6366F1` | Secondary actions |

**Typography:** Playfair Display (headings) + Outfit (body)

---

## Scripts

```bash
# Root
npm run setup     # Install all dependencies
npm run dev       # Start backend + frontend concurrently
npm run build     # Build frontend for production
npm start         # Start production server

# Backend
npm run migrate   # Run database migrations
npm run seed      # Seed demo data
npm run reset-db  # Drop and recreate all tables
```

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License

This project is licensed under the MIT License.

---

Built with ❤️ for Indian artisans and the ODOP initiative.
