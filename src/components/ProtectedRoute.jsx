import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Navigate, useLocation, Link, Outlet } from 'react-router-dom';
import { Container, Card, Button, Badge } from 'react-bootstrap';
import { logoutUser } from '../features/auth/authSlice';

/**
 * ProtectedRoute component:
 * 1. Chặn người dùng chưa đăng nhập -> chuyển hướng về /login (lưu vị trí trước đó).
 * 2. Chặn người dùng đã đăng nhập nhưng không đúng quyền (ví dụ customer cố tình gõ /admin/* vào URL bar).
 *    -> Hiển thị màn hình 403 Access Denied, chặn tuyệt đối truy cập vào giao diện quản trị.
 *
 * @param {Array<string>} allowedRoles - Danh sách các vai trò được phép truy cập (mặc định: ['admin'])
 * @param {React.ReactNode} children - Component con được bảo vệ
 */
const ProtectedRoute = ({ allowedRoles = ['admin'], children }) => {
  const dispatch = useDispatch();
  const location = useLocation();
  const { isAuthenticated, currentUser, role } = useSelector(
    (state) => state.auth
  );

  // Trường hợp 1: Người dùng chưa đăng nhập
  if (!isAuthenticated || !currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Lấy role hiện tại và kiểm tra tính hợp lệ
  const userRole = role || currentUser.role;
  const isAuthorized = allowedRoles.includes(userRole);

  // Trường hợp 2: Đã đăng nhập nhưng không có quyền (ví dụ: customer cố tình truy cập trang admin)
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

  // Trường hợp 3: Hợp lệ -> hiển thị nội dung được bảo vệ
  return children ? children : <Outlet />;
};

/**
 * CustomerOnlyRoute:
 * Chặn tài khoản 'admin' truy cập vào các trang giỏ hàng, thanh toán.
 * Khách vãng lai (chưa đăng nhập) hoặc khách hàng (role 'customer') vẫn được phép vào.
 */
export const CustomerOnlyRoute = ({ children }) => {
  const { currentUser } = useSelector((state) => state.auth);

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

  return children ? children : <Outlet />;
};

export default ProtectedRoute;
