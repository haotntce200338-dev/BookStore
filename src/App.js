import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import LoginPage from './features/auth/LoginPage';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import BookList from './features/books/BookList';
import { logoutUser } from './features/auth/authSlice';
import { Container, Card, Button } from 'react-bootstrap';
import './App.css';

// Temporary placeholder for Admin Books management
const AdminBooksPlaceholder = () => {
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state) => state.auth);

  return (
    <Container className="my-5 text-center">
      <Card className="p-4 shadow-sm mx-auto border-danger" style={{ maxWidth: '600px' }}>
        <h2 className="mb-3 text-danger">🛡️ Khu vực Quản trị Sách (Admin)</h2>
        <p className="mb-2">
          Xin chào Quản trị viên: <strong>{currentUser?.fullName}</strong> ({currentUser?.role})
        </p>
        <p className="text-muted small mb-4">
          Đây là khu vực bảo mật chỉ dành riêng cho tài khoản có quyền Admin.
        </p>
        <div className="d-flex justify-content-center gap-2">
          <Button variant="outline-secondary" href="/">
            Về Trang Chủ
          </Button>
          <Button variant="outline-danger" onClick={() => dispatch(logoutUser())}>
            Đăng xuất
          </Button>
        </div>
      </Card>
    </Container>
  );
};

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
            {/* Public books catalog homepage (HaoTNT) */}
            <Route path="/" element={<BookList />} />

            {/* Authentication route */}
            <Route path="/login" element={<LoginPage />} />

            {/* Protected Admin routes: Restricted to 'admin' role */}
            <Route
              path="/admin/books"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminBooksPlaceholder />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={<Navigate to="/admin/books" replace />}
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
