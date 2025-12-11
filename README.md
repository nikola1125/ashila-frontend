# MediMart

[Live Demo](https://medimart-3a3dd.web.app)

MediMart is a modern, full-featured online pharmacy platform that allows users to browse, search, and purchase medicines securely. The platform supports user authentication, role-based dashboards (Admin, Seller, User), and a seamless shopping and checkout experience. Built with React, Vite, Firebase, and Tailwind CSS, MediMart is designed for performance, scalability, and ease of use.

---

## 🚀 Features

- **User Authentication**: Secure login, registration, and Google sign-in via Firebase Auth.
- **Role-Based Dashboards**: Separate dashboards for Admins, Sellers, and Users.
- **Medicine Catalog**: Browse, search, and filter medicines by category, company, and more.
- **Cart & Checkout**: Add medicines to cart, manage quantities, and checkout with Stripe integration.
- **Order Management**: View order history, download invoices, and track payment status.
- **Admin Controls**: Manage users, categories, payments, and advertisements.
- **Seller Tools**: Add/manage medicines, view sales reports, and request advertisements.
- **Responsive UI**: Beautiful, mobile-friendly design with Tailwind CSS and DaisyUI.
- **PDF Invoice Generation**: Download order invoices as PDF.
- **Notifications**: Real-time feedback with React Toastify.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS, DaisyUI
- **State Management**: React Context, React Query
- **Authentication**: Firebase Auth
- **API**: Axios (with secure/private/public API hooks)
- **PDF/Export**: @react-pdf/renderer, jsPDF, xlsx
- **UI/UX**: Headless UI, Framer Motion, Lucide React, React Icons
- **Routing**: React Router DOM
- **Testing & Linting**: ESLint

---

## 📂 Folder Structure

```
src/
  Components/      # Reusable UI components (tables, modals, loaders, etc.)
  Context/         # React Context providers (Auth, Cart)
  hooks/           # Custom React hooks (API, auth, etc.)
  Layouts/         # Layout components (Root, Dashboard, Invoice)
  Pages/           # Main pages (Home, Shop, Cart, Dashboard, etc.)
  Routes/          # Route definitions and guards (AdminRoute, PrivateRoute)
  Services/        # API and Firebase configuration
  utils/           # Utility functions (grouping, image upload, etc.)
  assets/          # Static assets (images, icons)
  index.css        # Global styles
  main.jsx         # App entry point
```

---

## 🖥️ Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- npm or yarn

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repo-url>
   cd MediMart-Client
   ```
2. **Install dependencies:**
   ```bash
   npm install
   # or
   yarn install
   ```
3. **Environment Variables:**
   - Copy `.env.example` to `.env` and fill in your Firebase and API credentials.
   - Example variables:
     ```env
     VITE_FIREBASE_APIKEY=...
     VITE_FIREBASE_AUTHDOMAIN=...
     VITE_FIREBASE_PROJECTID=...
     VITE_FIREBASE_STORAGEBUCKET=...
     VITE_FIREBASE_MESSAGINGSENDERID=...
     VITE_FIREBASE_APPID=...
     ```
4. **Start the development server:**
   ```bash
   npm run dev
   # or
   yarn dev
   ```
5. **Open in browser:**
   Visit [http://localhost:5173](http://localhost:5173) (or the port shown in your terminal).

---

## 🏗️ Build & Deployment

- **Build for production:**
  ```bash
  npm run build
  # or
  yarn build
  ```
- **Preview production build:**
  ```bash
  npm run preview
  # or
  yarn preview
  ```
- **Deploy:**
  The app is ready to deploy on Firebase Hosting, Vercel, Netlify, or any static hosting provider.

---

## 👤 User Roles

- **User:** Browse, shop, manage cart, view orders, download invoices.
- **Seller:** Manage medicines, view sales, request ads.
- **Admin:** Manage users, categories, payments, ads, and view reports.

---

## 🧪 Test Accounts

You can use the following test accounts to log in as an Admin or Seller:

| Role   | Email            | Password |
| ------ | ---------------- | -------- |
| Admin  | admin@gmail.com  | 123456   |
| Seller | seller@gmail.com | 123456   |

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/YourFeature`)
3. Commit your changes (`git commit -m 'Add some feature'`)
4. Push to the branch (`git push origin feature/YourFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

## 🙏 Acknowledgements

- [React](https://react.dev/)
- [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Firebase](https://firebase.google.com/)
- [Stripe](https://stripe.com/)
- [React Query](https://tanstack.com/query/latest)
- [DaisyUI](https://daisyui.com/)

---

> **MediMart** – Your trusted online pharmacy.
