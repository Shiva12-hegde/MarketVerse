# 🛒 MarketVerse AI

An AI-powered B2B/B2C marketplace inspired by Amazon, IndiaMART, and Alibaba. MarketVerse AI enables buyers and suppliers to discover, manage, and sell products through an intelligent marketplace powered by AI-driven search, recommendations, and product assistance.

---

## 🚀 Features

### 👤 Authentication
- JWT-based Authentication
- Buyer & Supplier Roles
- Secure Login & Registration
- Password Encryption using bcrypt

### 🛍️ Marketplace
- Browse Products
- Category Filtering
- Product Search
- Product Details
- Wishlist
- Shopping Cart
- Checkout
- Order Management

### 🤖 AI Features
- AI Product Search
- Semantic Product Matching
- AI Product Categorization
- AI Product Description Generation
- AI Product Recommendations
- AI Chat Assistant

### 👨‍💼 Supplier Dashboard
- Dashboard Analytics
- Product Management (CRUD)
- Inventory Management
- Order Management
- Supplier Profile

### 🛡️ Admin Dashboard
- Platform Analytics
- User Management
- Supplier Management
- Product Moderation
- Order Monitoring

### ⭐ Buyer Features
- Dashboard
- Wishlist
- Order History
- Address Management
- Profile Management

---

# 🏗️ Tech Stack

## Frontend
- React
- Vite
- Tailwind CSS v4
- Framer Motion
- TanStack Query
- React Router
- Axios

## Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication
- Zod Validation
- bcryptjs

## AI
- NLP-based Search
- Product Categorization
- Product Description Generation
- Recommendation Engine
- AI Chat Assistant

---

# 📁 Project Structure

```
MarketVerse/
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── app.js
│   │   └── server.js
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── utils/
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
│
└── README.md
```

---

# ⚙️ Installation

## Clone Repository

```bash
git clone https://github.com/Shiva12-hegde/MarketVerse.git

cd MarketVerse
```

---

## Backend Setup

```bash
cd backend

npm install
```

Create a `.env` file:

```env
PORT=5000

MONGODB_URI=mongodb://localhost:27017/marketverse

JWT_SECRET=your-secret-key

JWT_EXPIRES_IN=7d

CLIENT_URL=http://localhost:5173
```

Run backend

```bash
npm run dev
```

---

## Frontend Setup

```bash
cd frontend

npm install

npm run dev
```

Application will run at

```
http://localhost:5173
```

Backend

```
http://localhost:5000
```

---

# 🧠 AI Capabilities

- Intelligent Product Search
- Natural Language Query Processing
- Product Recommendations
- AI Product Description Generator
- Product Categorization
- AI Shopping Assistant

---

# 🔒 Security

- JWT Authentication
- Password Hashing
- Rate Limiting
- Helmet
- CORS
- Input Validation (Zod)

---

# 📸 Screenshots

> Add application screenshots here.

---

# 📌 Future Improvements

- Payment Gateway Integration
- Cloudinary Image Uploads
- Email Notifications
- Order Tracking
- Product Comparison
- Coupons & Offers
- Real-time Chat
- AI Voice Shopping Assistant

---

# 👨‍💻 Author

**M G Shivaprasad**

- GitHub: https://github.com/Shiva12-hegde
- LinkedIn: https://www.linkedin.com/in/m-g-shivaprasad-6b9640337/

---

## ⭐ If you found this project useful, consider giving it a star.
