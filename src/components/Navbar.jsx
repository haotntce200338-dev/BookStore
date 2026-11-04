import React from 'react';
import {
  Navbar as BsNavbar,
  Container,
  Nav,
  Button,
  Badge,
  NavDropdown,
} from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logoutUser } from '../features/auth/authSlice';

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Read user session from Redux auth slice
  const { currentUser, isAuthenticated } = useSelector((state) => state.auth);
  const isAdmin = currentUser?.role === 'admin';

  // Read cart quantity directly from cart slice (defaults to 0 if not mounted yet)
  const cartTotalQuantity = useSelector((state) => state.cart?.totalQuantity || 0);

  // Handle user logout
  const handleLogout = () => {
    dispatch(logoutUser());
    navigate('/');
  };

  return (
    <BsNavbar
      bg="white"
      expand="lg"
      className="border-bottom shadow-sm py-2 sticky-top"
      collapseOnSelect
    >
      <Container>
        {/* Brand logo navigates to homepage */}
        <BsNavbar.Brand
          as={Link}
          to="/"
          className="d-flex align-items-center fw-bold fs-4 text-primary text-decoration-none me-3"
        >
          <span className="me-2 fs-3" role="img" aria-label="BookStore">📚</span>
          <span>Book<span className="text-dark">Store</span></span>
        </BsNavbar.Brand>

        {/* Mobile menu toggle button */}
        <BsNavbar.Toggle aria-controls="main-navbar-nav" />

        <BsNavbar.Collapse id="main-navbar-nav">
          {/* Navigation links based on Role */}
          <Nav className="me-auto mb-2 mb-lg-0 align-items-lg-center">
            {isAdmin ? (
              <>
                <Nav.Link
                  as={Link}
                  to="/admin/dashboard"
                  className="fw-semibold px-2 text-danger"
                >
                  📊 Bảng điều khiển
                </Nav.Link>
                <Nav.Link
                  as={Link}
                  to="/admin/books"
                  className="fw-semibold px-2 text-danger"
                >
                  📚 Quản lý kho sách
                </Nav.Link>
                <Nav.Link
                  as={Link}
                  to="/admin/categories"
                  className="fw-semibold px-2 text-danger"
                >
                  🏷️ Quản lý thể loại
                </Nav.Link>
              </>
            ) : (
              <>
                <Nav.Link as={Link} to="/" className="fw-semibold px-2 text-dark">
                  Trang chủ
                </Nav.Link>
              </>
            )}
          </Nav>

          {/* Action section: Cart (Customer only) and User Authentication */}
          <Nav className="align-items-lg-center d-flex flex-row gap-2 mt-2 mt-lg-0">
            {/* Cart link button - CHỈ HIỂN THỊ CHO GUEST VÀ CUSTOMER (KHÔNG HIỂN THỊ CHO ADMIN) */}
            {!isAdmin ? (
              <Button
                as={Link}
                to="/cart"
                variant="light"
                size="sm"
                className="position-relative border d-inline-flex align-items-center px-3 py-1 me-2 shadow-sm"
                title="Xem giỏ hàng"
              >
                <span className="me-1 fs-6">🛒</span>
                <span className="d-none d-sm-inline small fw-semibold text-dark">
                  Giỏ hàng
                </span>
                {cartTotalQuantity > 0 && (
                  <Badge
                    pill
                    bg="danger"
                    className="position-absolute top-0 start-100 translate-middle shadow-sm"
                    style={{ fontSize: '0.7rem' }}
                  >
                    {cartTotalQuantity}
                  </Badge>
                )}
              </Button>
            ) : (
              <Button
                as={Link}
                to="/admin/dashboard"
                variant="outline-danger"
                size="sm"
                className="d-inline-flex align-items-center px-3 py-1 me-2 fw-semibold"
                title="Trang quản trị"
              >
                🛡️ Cổng Quản Trị
              </Button>
            )}

            {/* User session dropdown or login button */}
            {isAuthenticated && currentUser ? (
              <NavDropdown
                align="end"
                title={
                  <span className="d-inline-flex align-items-center small fw-semibold">
                    <span className="me-1">👤</span>
                    <span className="text-truncate" style={{ maxWidth: '140px' }}>
                      {currentUser.fullName || currentUser.username}
                    </span>
                    <Badge
                      bg={isAdmin ? 'danger' : 'success'}
                      className="ms-2 text-uppercase"
                      style={{ fontSize: '0.65rem' }}
                    >
                      {currentUser.role}
                    </Badge>
                  </span>
                }
                id="user-account-dropdown"
              >
                <NavDropdown.Header className="small text-muted">
                  Tài khoản: <strong>{currentUser.username}</strong> ({currentUser.role})
                </NavDropdown.Header>

                {isAdmin ? (
                  <>
                    <NavDropdown.Item as={Link} to="/admin/dashboard">
                      📊 Bảng điều khiển (Dashboard)
                    </NavDropdown.Item>
                    <NavDropdown.Item as={Link} to="/admin/books">
                      📚 Quản lý kho sách
                    </NavDropdown.Item>
                    <NavDropdown.Item as={Link} to="/admin/categories">
                      🏷️ Quản trị thể loại
                    </NavDropdown.Item>
                    <NavDropdown.Divider />
                  </>
                ) : (
                  <>
                    <NavDropdown.Item as={Link} to="/cart">
                      🛒 Giỏ hàng của tôi
                    </NavDropdown.Item>
                    <NavDropdown.Divider />
                  </>
                )}

                <NavDropdown.Item
                  onClick={handleLogout}
                  className="text-danger fw-semibold"
                >
                  🚪 Đăng xuất
                </NavDropdown.Item>
              </NavDropdown>
            ) : (
              <div className="d-flex align-items-center gap-2">
                <Button
                  as={Link}
                  to="/login"
                  variant="outline-primary"
                  size="sm"
                  className="px-3 fw-semibold"
                >
                  Đăng nhập
                </Button>
                <Button
                  as={Link}
                  to="/register"
                  variant="primary"
                  size="sm"
                  className="px-3 fw-semibold"
                >
                  Đăng ký
                </Button>
              </div>
            )}
          </Nav>
        </BsNavbar.Collapse>
      </Container>
    </BsNavbar>
  );
};

export default Navbar;
