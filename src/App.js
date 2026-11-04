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
            {/* ===================== PHÂN HỆ KHÁCH HÀNG (STOREFRONT) ===================== */}
            {/* Public books catalog homepage (HaoTNT) */}
            <Route path="/" element={<BookList />} />

            {/* Route for viewing book details with lazy loading (TuanTA 779) */}
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

            {/* Customer-only routes: CHẶN ADMIN KHÔNG ĐƯỢC MUA HÀNG (TuanTA 233) */}
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

            {/* ===================== PHÂN HỆ QUẢN TRỊ VIÊN (ADMIN PORTAL) ===================== */}
            {/* Route tổng quan & thống kê doanh thu Admin Dashboard */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboardPage />
                </ProtectedRoute>
              }
            />

            {/* Quản trị kho sách Admin (Full CRUD - HieuLT) */}
            <Route
              path="/admin/books"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminBookListPage />
                </ProtectedRoute>
              }
            />

            {/* Quản lý danh mục thể loại Admin (Full CRUD - PhucDTT) */}
            <Route
              path="/admin/categories"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <CategoryListPage />
                </ProtectedRoute>
              }
            />

            {/* Điều hướng mặc định cho /admin về /admin/dashboard */}
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
