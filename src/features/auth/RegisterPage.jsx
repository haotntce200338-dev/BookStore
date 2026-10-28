import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner, InputGroup } from 'react-bootstrap';
import { registerUser, clearAuthError } from './authSlice';

// Regex to block XSS and malicious script/HTML injection patterns
const MALICIOUS_REGEX = /<[^>]*>|javascript:|data:\s*text\/html|on\w+\s*=/i;
// Regex for Full Name: Unicode letters (including Vietnamese accents) and spaces only. No numbers, no symbols.
const VIETNAMESE_NAME_REGEX = /^[\p{L}\s]+$/u;
// Regex for Username: alphanumeric and underscore only
const USERNAME_REGEX = /^[a-zA-Z0-9_]+$/;

const RegisterPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, loading, error } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false,
  });

  const [validationErrors, setValidationErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    return () => {
      dispatch(clearAuthError());
    };
  }, [dispatch]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const errors = {};
    const trimmedName = formData.fullName.trim();
    const trimmedUsername = formData.username.trim();

    // 1. Full Name Validation: Strictly letters and spaces, no numbers, no special characters, no injection
    if (!trimmedName) {
      errors.fullName = 'Vui lòng nhập họ và tên.';
    } else if (MALICIOUS_REGEX.test(trimmedName)) {
      errors.fullName = 'Họ và tên chứa ký tự hoặc đoạn mã không an toàn.';
    } else if (!VIETNAMESE_NAME_REGEX.test(trimmedName)) {
      errors.fullName = 'Họ và tên chỉ được chứa chữ cái, không được chứa chữ số hoặc ký tự đặc biệt.';
    } else if (trimmedName.length < 2 || trimmedName.length > 50) {
      errors.fullName = 'Họ và tên phải có độ dài từ 2 đến 50 ký tự.';
    }

    // 2. Username Validation: Alphanumeric and underscore only, no injection
    if (!trimmedUsername) {
      errors.username = 'Vui lòng nhập tên đăng nhập.';
    } else if (MALICIOUS_REGEX.test(trimmedUsername)) {
      errors.username = 'Tên đăng nhập chứa ký tự hoặc đoạn mã không an toàn.';
    } else if (trimmedUsername.length < 3 || trimmedUsername.length > 30) {
      errors.username = 'Tên đăng nhập phải có từ 3 đến 30 ký tự.';
    } else if (!USERNAME_REGEX.test(trimmedUsername)) {
      errors.username = 'Tên đăng nhập chỉ gồm chữ cái không dấu (a-z), chữ số (0-9) và dấu gạch dưới (_).';
    }

    // 3. Password Validation: No injection strings, length 3-100
    if (!formData.password) {
      errors.password = 'Vui lòng nhập mật khẩu.';
    } else if (MALICIOUS_REGEX.test(formData.password)) {
      errors.password = 'Mật khẩu chứa ký tự hoặc đoạn mã không an toàn.';
    } else if (formData.password.length < 3 || formData.password.length > 100) {
      errors.password = 'Mật khẩu phải từ 3 đến 100 ký tự.';
    }

    // 4. Confirm Password Validation
    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Vui lòng xác nhận mật khẩu.';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Mật khẩu xác nhận không khớp.';
    }

    // 5. Terms Agreement
    if (!formData.agreeTerms) {
      errors.agreeTerms = 'Bạn cần đồng ý với điều khoản sử dụng để tiếp tục.';
    }

    return errors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    setValidationErrors({});
    dispatch(
      registerUser({
        fullName: formData.fullName.trim(),
        username: formData.username.trim(),
        password: formData.password,
      })
    );
  };

  return (
    <Container className="my-5">
      <Row className="justify-content-center">
        <Col xs={12} sm={10} md={8} lg={6}>
          <Card className="border-0 shadow-sm rounded-3">
            <Card.Body className="p-4 p-md-5">
              <div className="text-center mb-4">
                <div
                  className="d-inline-flex align-items-center justify-content-center bg-primary bg-opacity-10 text-primary rounded-circle mb-3"
                  style={{ width: '64px', height: '64px', fontSize: '28px' }}
                >
                  📝
                </div>
                <h3 className="fw-bold mb-1" style={{ color: '#212529' }}>Đăng ký tài khoản</h3>
                <p className="text-muted small">Tạo tài khoản thành viên để bắt đầu mua sắm tại BookStore</p>
              </div>

              {error && (
                <Alert variant="danger" dismissible onClose={() => dispatch(clearAuthError())} className="small">
                  {error}
                </Alert>
              )}

              <Form noValidate onSubmit={handleSubmit}>
                <Form.Group className="mb-3" controlId="registerFullName">
                  <Form.Label className="fw-semibold small">Họ và tên <span className="text-danger">*</span></Form.Label>
                  <Form.Control type="text" name="fullName" placeholder="Ví dụ: Nguyễn Văn A (chỉ gồm chữ cái)" value={formData.fullName} onChange={handleChange} isInvalid={!!validationErrors.fullName} disabled={loading} autoComplete="name" />
                  <Form.Control.Feedback type="invalid">{validationErrors.fullName}</Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-3" controlId="registerUsername">
                  <Form.Label className="fw-semibold small">Tên đăng nhập <span className="text-danger">*</span></Form.Label>
                  <Form.Control type="text" name="username" placeholder="Nhập tên đăng nhập (chữ cái, số, gạch dưới)" value={formData.username} onChange={handleChange} isInvalid={!!validationErrors.username} disabled={loading} autoComplete="username" />
                  <Form.Control.Feedback type="invalid">{validationErrors.username}</Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-3" controlId="registerPassword">
                  <Form.Label className="fw-semibold small">Mật khẩu <span className="text-danger">*</span></Form.Label>
                  <InputGroup hasValidation>
                    <Form.Control type={showPassword ? 'text' : 'password'} name="password" placeholder="Nhập mật khẩu (tối thiểu 3 ký tự)" value={formData.password} onChange={handleChange} isInvalid={!!validationErrors.password} disabled={loading} autoComplete="new-password" />
                    <Button variant="outline-secondary" type="button" onClick={() => setShowPassword((prev) => !prev)} disabled={loading} title={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}>
                      {showPassword ? '🙈' : '👁️'}
                    </Button>
                    <Form.Control.Feedback type="invalid">{validationErrors.password}</Form.Control.Feedback>
                  </InputGroup>
                </Form.Group>

                <Form.Group className="mb-3" controlId="registerConfirmPassword">
                  <Form.Label className="fw-semibold small">Xác nhận mật khẩu <span className="text-danger">*</span></Form.Label>
                  <InputGroup hasValidation>
                    <Form.Control type={showConfirmPassword ? 'text' : 'password'} name="confirmPassword" placeholder="Nhập lại mật khẩu" value={formData.confirmPassword} onChange={handleChange} isInvalid={!!validationErrors.confirmPassword} disabled={loading} autoComplete="new-password" />
                    <Button variant="outline-secondary" type="button" onClick={() => setShowConfirmPassword((prev) => !prev)} disabled={loading} title={showConfirmPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}>
                      {showConfirmPassword ? '🙈' : '👁️'}
                    </Button>
                    <Form.Control.Feedback type="invalid">{validationErrors.confirmPassword}</Form.Control.Feedback>
                  </InputGroup>
                </Form.Group>

                <Form.Group className="mb-4" controlId="registerAgreeTerms">
                  <Form.Check
                    type="checkbox"
                    name="agreeTerms"
                    label={
                      <span className="small text-muted">
                        Tôi đồng ý với các <span className="text-primary">Điều khoản dịch vụ</span> và <span className="text-primary">Chính sách bảo mật</span> của BookStore.
                      </span>
                    }
                    checked={formData.agreeTerms}
                    onChange={handleChange}
                    isInvalid={!!validationErrors.agreeTerms}
                    disabled={loading}
                  />
                  <Form.Control.Feedback type="invalid">{validationErrors.agreeTerms}</Form.Control.Feedback>
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
                      <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                      Đang đăng ký tài khoản...
                    </>
                  ) : (
                    'Đăng ký ngay'
                  )}
                </Button>
              </Form>

              <div className="text-center mt-4 pt-3 border-top">
                <p className="text-muted small mb-0">
                  Đã có tài khoản?{' '}
                  <Link to="/login" className="text-primary fw-semibold text-decoration-none">
                    Đăng nhập tại đây
                  </Link>
                </p>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default RegisterPage;
