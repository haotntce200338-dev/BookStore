import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Navigate, useLocation, Link, Outlet } from 'react-router-dom';
import { Container, Card, Button, Badge } from 'react-bootstrap';
import { logoutUser } from '../features/auth/authSlice';

/**
 * Route guard for authenticated users with role verification.
 * Redirects unauthenticated users to /login and displays a 403 page for unauthorized roles.
 *
 * @param {Array<string>} allowedRoles - Permitted roles (default: ['admin'])
 * @param {React.ReactNode} children - Protected component
 */
const ProtectedRoute = ({ allowedRoles = ['admin'], children }) => {
  const dispatch = useDispatch();
  const location = useLocation();
  const { isAuthenticated, currentUser, role } = useSelector(
    (state) => state.auth
  );

  // Case 1: Unauthenticated user
  if (!isAuthenticated || !currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Verify user role
  const userRole = role || currentUser.role;
  const isAuthorized = allowedRoles.includes(userRole);

  // Case 2: Unauthorized role -> 403 Access Denied
  if (!isAuthorized) {
    return (
      <Container className="my-5">
        <div className="row justify-content-center">
          <div className="col-12 col-md-8 col-lg-6">
            <Card className="border-danger shadow-sm text-center">
              <Card.Header className="bg-danger text-white py-3">
                <h5 className="mb-0 fw-bold">⚠️ 403 — Từ chối truy cập (Access Denied)</h5>
              </Card.Header>
              <Card.Body className="p-4">
                <div className="my-3" style={{ fontSize: '48px' }}>
                  🚫
                </div>
                <h4 className="fw-bold text-dark mb-2">
                  Bạn không có quyền truy cập trang này!
                </h4>
                <p className="text-muted mb-3">
                  Tài khoản hiện tại:{' '}
                  <strong>{currentUser.fullName || currentUser.username}</strong>{' '}
                  <Badge bg="secondary">{userRole}</Badge>
                </p>
                <p className="text-muted small mb-4">
                  Khu vực này được bảo mật và chỉ dành riêng cho tài khoản có quyền{' '}
                  <strong>{allowedRoles.join(', ')}</strong>. Vui lòng quay lại
                  trang chủ hoặc đăng nhập với tài khoản có thẩm quyền.
                </p>

                <div className="d-flex justify-content-center gap-2 flex-wrap">
                  <Button as={Link} to="/" variant="primary">
                    Về Trang Chủ
                  </Button>
                  <Button
                    variant="outline-danger"
                    onClick={() => dispatch(logoutUser())}
                  >
                    Đăng xuất tài khoản
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </div>
        </div>
      </Container>
    );
  }

  // Case 3: Authorized -> render protected content
  return children ? children : <Outlet />;
};

/**
 * Route guard for customer shopping cart & checkout.
 * 1. Blocks unauthenticated guest users -> redirects to /login (with return location).
 * 2. Blocks 'admin' accounts from shopping.
 * 3. Permits only authenticated customers.
 */
export const CustomerOnlyRoute = ({ children }) => {
  const location = useLocation();
  const { isAuthenticated, currentUser } = useSelector((state) => state.auth);

  // Case 1: Unauthenticated guest user -> Redirect to login
  if (!isAuthenticated || !currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Case 2: Admin user -> Block from shopping
  if (currentUser?.role === 'admin') {
    return (
      <Container className="my-5">
        <div className="row justify-content-center">
          <div className="col-12 col-md-8 col-lg-6">
            <Card className="border-warning shadow-sm text-center">
              <Card.Header className="bg-warning text-dark py-3">
                <h5 className="mb-0 fw-bold">🛡️ Thông báo dành cho Quản trị viên</h5>
              </Card.Header>
              <Card.Body className="p-4">
                <div className="my-3" style={{ fontSize: '48px' }}>
                  🛒❌
                </div>
                <h4 className="fw-bold text-dark mb-2">
                  Tài khoản Admin không thể đặt hàng
                </h4>
                <p className="text-muted mb-4">
                  Bạn đang đăng nhập với tư cách Quản trị viên. Chức năng giỏ hàng và đặt hàng chỉ dành cho Khách hàng. Vui lòng sử dụng Cổng Quản trị để quản lý cửa hàng.
                </p>
                <div className="d-flex justify-content-center gap-2">
                  <Button as={Link} to="/admin/dashboard" variant="danger">
                    Đến Bảng Điều Khiển
                  </Button>
                  <Button as={Link} to="/" variant="outline-secondary">
                    Về Trang Chủ
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </div>
        </div>
      </Container>
    );
  }

  // Case 3: Authenticated customer -> permit access
  return children ? children : <Outlet />;
};

export default ProtectedRoute;
