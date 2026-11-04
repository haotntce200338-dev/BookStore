import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './features/auth/LoginPage';
import RegisterPage from './features/auth/RegisterPage';
import ProtectedRoute, { CustomerOnlyRoute } from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import BookList from './features/books/BookList';
import AdminBookListPage from './features/books/AdminBookListPage';
import AdminDashboardPage from './features/admin/AdminDashboardPage';
import CartPage from './features/cart/CartPage';
import CheckoutPage from './features/cart/CheckoutPage';
import CategoryListPage from './features/categories/CategoryListPage';
import './App.css';

const BookDetail = React.lazy(() => import('./features/books/BookDetail'));

function App() {
  return (
    <BrowserRouter>
      {/* Root layout wrapper with flexbox */}
      <div className="app-container">
        {/* Global sticky navigation bar */}
        <Navbar />

        {/* Main content expands to fill available vertical space */}
        <main className="main-content">
          <Routes>
            {/* ===================== CUSTOMER STOREFRONT ===================== */}
            {/* Public books catalog homepage */}
            <Route path="/" element={<BookList />} />

            {/* Book details page with lazy loading */}
            <Route
              path="/books/:id"
              element={
                <Suspense
                  fallback={
                    <div className="text-center my-5 py-5">
                      <div className="spinner-border text-primary" role="status"></div>
                      <p className="mt-3 text-muted">Đang tải chi tiết sách...</p>
                    </div>
                  }
                >
                  <BookDetail />
                </Suspense>
              }
            />

            {/* Authentication routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Customer-only routes: Block admin from shopping */}
            <Route
              path="/cart"
              element={
                <CustomerOnlyRoute>
                  <CartPage />
                </CustomerOnlyRoute>
              }
            />
            <Route
              path="/checkout"
              element={
                <CustomerOnlyRoute>
                  <CheckoutPage />
                </CustomerOnlyRoute>
              }
            />

            {/* ===================== ADMIN PORTAL ===================== */}
            {/* Admin dashboard overview */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboardPage />
                </ProtectedRoute>
              }
            />

            {/* Admin book management (CRUD) */}
            <Route
              path="/admin/books"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminBookListPage />
                </ProtectedRoute>
              }
            />

            {/* Admin category management (CRUD) */}
            <Route
              path="/admin/categories"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <CategoryListPage />
                </ProtectedRoute>
              }
            />

            {/* Redirect /admin root to dashboard */}
            <Route
              path="/admin"
              element={<Navigate to="/admin/dashboard" replace />}
            />

            {/* Fallback route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        {/* Global sticky footer */}
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
