import React, { useState } from 'react';
import {
  Navbar as BsNavbar,
  Container,
  Nav,
  Form,
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

  // Read cart quantity directly from cart slice (defaults to 0 if not mounted yet)
  const cartTotalQuantity = useSelector((state) => state.cart?.totalQuantity || 0);

  const [keyword, setKeyword] = useState('');

  // Handle book search submission from the navbar
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const trimmed = keyword.trim();
    if (trimmed) {
      navigate(`/?search=${encodeURIComponent(trimmed)}`);
    } else {
      navigate('/');
    }
  };

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
          {/* Admin link displayed only for admin accounts */}
          <Nav className="me-auto mb-2 mb-lg-0 align-items-lg-center">
            {currentUser?.role === 'admin' && (
              <Nav.Link
                as={Link}
                to="/admin/books"
                className="fw-semibold px-2 text-danger"
              >
                🛡️ Quản trị (Admin)
              </Nav.Link>
            )}
          </Nav>

          {/* Quick search form */}
          <Form
            onSubmit={handleSearchSubmit}
            className="d-flex me-lg-3 my-2 my-lg-0"
            style={{ maxWidth: '320px', width: '100%' }}
          >
            <Form.Control
              type="search"
              placeholder="Tìm kiếm sách theo tên..."
              className="me-2"
              size="sm"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              aria-label="Tìm kiếm sách"
            />
            <Button variant="outline-primary" size="sm" type="submit">
              Tìm
            </Button>
          </Form>

          {/* Cart and user authentication section */}
          <Nav className="align-items-lg-center d-flex flex-row gap-2 mt-2 mt-lg-0">
            {/* Cart link button with count badge */}
            <Button
              as={Link}
              to="/cart"
              variant="light"
              size="sm"
              className="position-relative border d-inline-flex align-items-center px-3 py-1 me-2"
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
                      bg={currentUser.role === 'admin' ? 'danger' : 'success'}
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
                  Tài khoản: <strong>{currentUser.username}</strong>
                </NavDropdown.Header>

                {currentUser.role === 'admin' && (
                  <>
                    <NavDropdown.Item as={Link} to="/admin/books">
                      🛡️ Quản trị sách
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
              <Button
                as={Link}
                to="/login"
                variant="primary"
                size="sm"
                className="px-3 fw-semibold"
              >
                Đăng nhập
              </Button>
            )}
          </Nav>
        </BsNavbar.Collapse>
      </Container>
    </BsNavbar>
  );
};

export default Navbar;
