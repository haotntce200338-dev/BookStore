import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import LoginPage from './features/auth/LoginPage';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import BookDetail from './features/books/BookDetail';
import { logoutUser } from './features/auth/authSlice';
import { Container, Card, Button, Badge } from 'react-bootstrap';
import './App.css';

// Temporary placeholder for Home page
const HomePage = () => {
  const dispatch = useDispatch();
  const { currentUser, isAuthenticated } = useSelector((state) => state.auth);

  return (
    <Container className="my-5 text-center">
      <Card className="p-4 shadow-sm mx-auto mb-4" style={{ maxWidth: '600px' }}>
        <h2 className="mb-3">📚 BookStore - Trang Chủ</h2>
        {isAuthenticated ? (
          <div>
            <p className="mb-2">
              Xin chào, <strong>{currentUser?.fullName || currentUser?.username}</strong>!
            </p>
            <p className="mb-3">
              Vai trò hiện tại:{' '}
              <Badge bg={currentUser?.role === 'admin' ? 'danger' : 'success'}>
                {currentUser?.role}
              </Badge>
            </p>
            <div className="d-flex justify-content-center gap-2 flex-wrap">
              {currentUser?.role === 'admin' ? (
                <Button variant="primary" size="sm" as={Link} to="/admin/books">
                  Đến Trang Quản Trị (Admin)
                </Button>
              ) : (
                <span className="text-muted small d-block w-100 mb-2">
                  (Thử gõ <code>/admin/books</code> trên thanh địa chỉ trình duyệt để kiểm tra tính năng chặn phân quyền)
                </span>
              )}
              <Button
                variant="outline-danger"
                size="sm"
                onClick={() => dispatch(logoutUser())}
              >
                Đăng xuất
              </Button>
            </div>
          </div>
        ) : (
          <div>
            <p className="text-muted mb-3">Bạn chưa đăng nhập vào hệ thống.</p>
            <Button variant="primary" as={Link} to="/login">
              Đến trang Đăng nhập
            </Button>
          </div>
        )}
      </Card>

    </Container>
  );
};

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
          <Button variant="outline-secondary" as={Link} to="/">
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
            <Route path="/" element={<HomePage />} />
            <Route path="/books/:id" element={<BookDetail />} />
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
