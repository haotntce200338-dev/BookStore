import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import LoginPage from './features/auth/LoginPage';
import ProtectedRoute from './components/ProtectedRoute';
import { logoutUser } from './features/auth/authSlice';
import { Container, Card, Button, Badge } from 'react-bootstrap';
import './App.css';



// Simple placeholder page for Home (to be developed by team members)
const HomePage = () => {
  const dispatch = useDispatch();
  const { currentUser, isAuthenticated } = useSelector((state) => state.auth);

  return (
    <Container className="my-5 text-center">
      <Card className="p-4 shadow-sm mx-auto" style={{ maxWidth: '600px' }}>
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
                <Button variant="primary" size="sm" href="/admin/books">
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
            <Button variant="primary" href="/login">
              Đến trang Đăng nhập
            </Button>
          </div>
        )}
      </Card>
    </Container>
  );
};

// Simple placeholder page for Admin Books (to be developed by admin team member)
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
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />

        {/* Protected Admin Routes: Chỉ cho phép tài khoản có role 'admin' */}
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
    </BrowserRouter>
  );
}

export default App;
