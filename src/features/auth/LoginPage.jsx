import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Alert,
  Spinner,
  Badge,
} from 'react-bootstrap';
import { loginUser, clearAuthError } from './authSlice';

const LoginPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { isAuthenticated, role, loading, error } = useSelector(
    (state) => state.auth
  );

  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });

  const [validationErrors, setValidationErrors] = useState({
    username: '',
    password: '',
  });

  // Redirect safely according to user role
  useEffect(() => {
    if (isAuthenticated) {
      let redirectPath = '/';
      const fromPath = location.state?.from?.pathname;

      if (role === 'admin') {
        redirectPath = fromPath && fromPath.startsWith('/admin') ? fromPath : '/admin/books';
      } else {
        // Customers are strictly kept to customer/public pages
        redirectPath = fromPath && !fromPath.startsWith('/admin') ? fromPath : '/';
      }

      navigate(redirectPath, { replace: true });
    }
  }, [isAuthenticated, role, navigate, location]);

  // Clean up any remaining auth error on unmount
  useEffect(() => {
    return () => {
      dispatch(clearAuthError());
    };
  }, [dispatch]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear specific field validation error when user starts typing
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.username.trim()) {
      errors.username = 'Vui lòng nhập tên đăng nhập.';
    }
    if (!formData.password) {
      errors.password = 'Vui lòng nhập mật khẩu.';
    }
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    setValidationErrors({ username: '', password: '' });
    dispatch(
      loginUser({
        username: formData.username,
        password: formData.password,
      })
    );
  };

  const handleQuickFill = (username, password) => {
    setFormData({ username, password });
    setValidationErrors({ username: '', password: '' });
    dispatch(clearAuthError());
  };

  return (
    <Container className="my-5">
      <Row className="justify-content-center">
        <Col xs={12} sm={10} md={8} lg={5}>
          <Card className="border-0 shadow-sm rounded-3">
            <Card.Body className="p-4 p-md-5">
              <div className="text-center mb-4">
                <div
                  className="d-inline-flex align-items-center justify-content-center bg-primary bg-opacity-10 text-primary rounded-circle mb-3"
                  style={{ width: '64px', height: '64px', fontSize: '28px' }}
                >
                  📚
                </div>
                <h3 className="fw-bold mb-1" style={{ color: '#212529' }}>
                  Đăng nhập
                </h3>
                <p className="text-muted small">
                  Chào mừng bạn quay trở lại với BookStore
                </p>
              </div>

              {error && (
                <Alert
                  variant="danger"
                  dismissible
                  onClose={() => dispatch(clearAuthError())}
                  className="small"
                >
                  {error}
                </Alert>
              )}

              <Form noValidate onSubmit={handleSubmit}>
                <Form.Group className="mb-3" controlId="loginUsername">
                  <Form.Label className="fw-semibold small">
                    Tên đăng nhập <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="username"
                    placeholder="Nhập tên đăng nhập"
                    value={formData.username}
                    onChange={handleChange}
                    isInvalid={!!validationErrors.username}
                    disabled={loading}
                    autoComplete="username"
                  />
                  <Form.Control.Feedback type="invalid">
                    {validationErrors.username}
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-4" controlId="loginPassword">
                  <Form.Label className="fw-semibold small">
                    Mật khẩu <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    placeholder="Nhập mật khẩu"
                    value={formData.password}
                    onChange={handleChange}
                    isInvalid={!!validationErrors.password}
                    disabled={loading}
                    autoComplete="current-password"
                  />
                  <Form.Control.Feedback type="invalid">
                    {validationErrors.password}
                  </Form.Control.Feedback>
                </Form.Group>

                <Button
                  variant="primary"
                  type="submit"
                  className="w-100 py-2 fw-semibold"
                  style={{ backgroundColor: '#0D6EFD', borderColor: '#0D6EFD' }}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Spinner
                        as="span"
                        animation="border"
                        size="sm"
                        role="status"
                        aria-hidden="true"
                        className="me-2"
                      />
                      Đang đăng nhập...
                    </>
                  ) : (
                    'Đăng nhập'
                  )}
                </Button>
              </Form>

              <div className="mt-4 pt-3 border-top">
                <p className="text-muted small fw-semibold mb-2">
                  Tài khoản thử nghiệm (Demo):
                </p>
                <div className="d-flex flex-wrap gap-2">
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    className="small"
                    onClick={() => handleQuickFill('admin', '123')}
                    disabled={loading}
                  >
                    <Badge bg="danger" className="me-1">
                      Admin
                    </Badge>
                    admin / 123
                  </Button>
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    className="small"
                    onClick={() => handleQuickFill('customer', '123')}
                    disabled={loading}
                  >
                    <Badge bg="success" className="me-1">
                      Customer
                    </Badge>
                    customer / 123
                  </Button>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default LoginPage;
