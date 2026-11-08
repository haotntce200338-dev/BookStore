import React, { useState, useEffect } from "react";
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
} from "react-bootstrap";
import { useSelector, useDispatch } from "react-redux";
import { Link, Navigate, useLocation } from "react-router-dom";
import axios from "axios";
import { clearCart } from "./cartSlice";
import OrderSuccessView from "./OrderSuccessView";

const API_BASE_URL = "http://localhost:3001";

const formatPrice = (price) => {
  return Number(price || 0).toLocaleString("vi-VN") + " đ";
};

// Chuẩn hoá số điện thoại về dạng 10 số (hỗ trợ nhập +84 hoặc 84)
const normalizePhoneNumber = (rawPhone) => {
  let cleaned = String(rawPhone || "").trim().replace(/[\s.-]/g, "");
  if (cleaned.startsWith("+84")) {
    cleaned = "0" + cleaned.slice(3);
  } else if (cleaned.startsWith("84") && cleaned.length === 11) {
    cleaned = "0" + cleaned.slice(2);
  }
  return cleaned;
};

// Định dạng số điện thoại di động Việt Nam: gồm 10 chữ số, bắt đầu bằng số 0 (các đầu số 03, 05, 07, 08, 09)
const VIETNAMESE_PHONE_REGEX = /^0[35789][0-9]{8}$/;

const CheckoutPage = () => {
  const dispatch = useDispatch();
  const location = useLocation();

  const { items, totalQuantity, totalAmount } = useSelector(
    (state) => state.cart,
  );
  const { currentUser, isAuthenticated } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    customerName: "",
    phone: "",
    address: "",
    note: "",
    paymentMethod: "cod",
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [placedOrder, setPlacedOrder] = useState(null);
  const [apiError, setApiError] = useState("");

  // Prefill customer name if logged in
  useEffect(() => {
    if (currentUser) {
      setFormData((prev) => ({
        ...prev,
        customerName: currentUser.fullName || currentUser.username || "",
      }));
    }
  }, [currentUser]);

  // Early return guards - MUST be after all React hooks
  if (!isAuthenticated || !currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const validate = () => {
    const newErrors = {};
    const name = formData.customerName.trim();
    const rawPhone = formData.phone.trim();
    const normalizedPhone = normalizePhoneNumber(rawPhone);
    const address = formData.address.trim();

    if (!name) {
      newErrors.customerName = "Vui lòng nhập họ và tên người nhận.";
    } else if (name.length < 2) {
      newErrors.customerName = "Họ và tên phải có ít nhất 2 ký tự.";
    }

    if (!rawPhone) {
      newErrors.phone = "Vui lòng nhập số điện thoại giao hàng.";
    } else if (!/^\+?\d+$/.test(rawPhone.replace(/[\s.-]/g, ""))) {
      newErrors.phone = "Số điện thoại chỉ được chứa các chữ số.";
    } else if (
      !rawPhone.startsWith("0") &&
      !rawPhone.startsWith("+84") &&
      !rawPhone.startsWith("84")
    ) {
      newErrors.phone =
        "Số điện thoại phải bắt đầu bằng số 0 (ví dụ: 0912345678).";
    } else if (normalizedPhone.length !== 10) {
      newErrors.phone = `Số điện thoại phải gồm đúng 10 chữ số (hiện có ${normalizedPhone.length} số).`;
    } else if (!VIETNAMESE_PHONE_REGEX.test(normalizedPhone)) {
      newErrors.phone =
        "Số điện thoại không hợp lệ (phải bắt đầu bằng đầu số 03, 05, 07, 08 hoặc 09).";
    }

    if (!address) {
      newErrors.address = "Vui lòng nhập địa chỉ nhận hàng chi tiết.";
    } else if (address.length < 6) {
      newErrors.address =
        "Địa chỉ giao hàng cần chi tiết hơn (tối thiểu 6 ký tự).";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    if (items.length === 0) {
      setApiError("Giỏ hàng đang trống, vui lòng chọn sách trước khi đặt hàng.");
      return;
    }

    setSubmitting(true);
    setApiError("");

    try {
      // 1. Fetch current orders to generate sequential ID (e.g. ord-1003)
      let nextId = `ord-${Date.now()}`;
      try {
        const ordersRes = await axios.get(`${API_BASE_URL}/orders`);
        const numList = ordersRes.data
          .map((o) => {
            const m = String(o?.id || "").match(/^ord-(\d+)$/i);
            return m ? parseInt(m[1], 10) : null;
          })
          .filter((n) => n !== null && !isNaN(n));
        if (numList.length > 0) {
          nextId = `ord-${Math.max(...numList) + 1}`;
        }
      } catch (idErr) {
        console.warn(
          "Could not query orders count, using timestamp fallback:",
          idErr,
        );
      }

      // 2. Prepare new order payload
      const newOrder = {
        id: nextId,
        userId: currentUser?.id || "guest",
        customerName: formData.customerName.trim(),
        phone: normalizePhoneNumber(formData.phone),
        address: formData.address.trim(),
        note: formData.note.trim(),
        paymentMethod: formData.paymentMethod,
        items: items.map((item) => ({
          bookId: item.id,
          title: item.title,
          price: Number(item.price) || 0,
          quantity: Number(item.quantity) || 1,
        })),
        totalAmount,
        status: "Pending",
        orderDate: new Date().toISOString(),
      };

      // 3. Post order to json-server
      const createRes = await axios.post(`${API_BASE_URL}/orders`, newOrder);

      // 4. Update book stocks in background
      items.forEach(async (cartItem) => {
        try {
          const bookRes = await axios.get(
            `${API_BASE_URL}/books/${cartItem.id}`,
          );
          const currentStock = Number(bookRes.data.stock) || 0;
          const updatedStock = Math.max(0, currentStock - cartItem.quantity);
          await axios.patch(`${API_BASE_URL}/books/${cartItem.id}`, {
            stock: updatedStock,
          });
        } catch (stockErr) {
          console.warn(
            `Could not update stock for book ${cartItem.id}:`,
            stockErr,
          );
        }
      });

      // 5. Clear cart and set success state
      dispatch(clearCart());
      setPlacedOrder(createRes.data || newOrder);
    } catch (err) {
      console.error("Order placement failed:", err);
      setApiError(
        err.response?.data?.message ||
          "Có lỗi xảy ra khi tạo đơn hàng. Vui lòng thử lại!",
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Order Placement Success Screen
  if (placedOrder) {
    return (
      <OrderSuccessView
        order={placedOrder}
        isAuthenticated={isAuthenticated}
      />
    );
  }

  // Empty Cart State
  if (items.length === 0) {
    return (
      <Container className="my-5 text-center">
        <Card
          className="p-5 shadow-sm border-0 mx-auto"
          style={{ maxWidth: "600px" }}
        >
          <div className="fs-1 mb-3">🛒</div>
          <h4 className="fw-bold text-dark mb-2">
            Chưa có sản phẩm để thanh toán
          </h4>
          <p className="text-muted mb-4">
            Giỏ hàng của bạn đang trống. Vui lòng chọn sách trước khi đặt hàng.
          </p>
          <Button
            as={Link}
            to="/"
            variant="primary"
            className="fw-semibold px-4"
          >
            📚 Quay lại chọn sách
          </Button>
        </Card>
      </Container>
    );
  }

  return (
    <Container className="my-4">
      {/* Breadcrumb Navigation */}
      <div className="text-muted small mb-3">
        <Link to="/" className="text-decoration-none text-secondary">
          Trang chủ
        </Link>
        <span className="mx-2">/</span>
        <Link to="/cart" className="text-decoration-none text-secondary">
          Giỏ hàng
        </Link>
        <span className="mx-2">/</span>
        <span className="text-dark fw-semibold">Thanh toán</span>
      </div>

      <h2 className="fw-bold mb-4 text-dark d-flex align-items-center gap-2">
        <span>📦</span>
        <span>Thông Tin Giao Hàng & Đặt Hàng</span>
      </h2>

      {apiError && (
        <Alert variant="danger" dismissible onClose={() => setApiError("")}>
          {apiError}
        </Alert>
      )}

      <Form noValidate onSubmit={handleSubmit}>
        <Row className="g-4">
          {/* Left Column: Customer Shipping Form */}
          <Col xs={12} lg={7}>
            <Card className="shadow-sm border mb-4">
              <Card.Header className="bg-white fw-bold py-3 fs-5 border-bottom">
                Thông tin người nhận
              </Card.Header>
              <Card.Body className="p-4">
                <Form.Group className="mb-3" controlId="checkoutName">
                  <Form.Label className="fw-semibold small">
                    Họ và tên người nhận <span className="text-danger">*</span>:
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="customerName"
                    value={formData.customerName}
                    onChange={handleChange}
                    isInvalid={!!errors.customerName}
                    placeholder="Ví dụ: Nguyễn Văn A"
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.customerName}
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-3" controlId="checkoutPhone">
                  <Form.Label className="fw-semibold small">
                    Số điện thoại liên hệ <span className="text-danger">*</span>:
                  </Form.Label>
                  <Form.Control
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    isInvalid={!!errors.phone}
                    placeholder="Ví dụ: 0912345678"
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.phone}
                  </Form.Control.Feedback>
                  {!errors.phone && (
                    <Form.Text
                      className="text-muted"
                      style={{ fontSize: "0.8rem" }}
                    >
                      Gồm 10 chữ số, bắt đầu bằng số 0 (ví dụ: 0912345678).
                    </Form.Text>
                  )}
                </Form.Group>

                <Form.Group className="mb-3" controlId="checkoutAddress">
                  <Form.Label className="fw-semibold small">
                    Địa chỉ nhận hàng chi tiết{" "}
                    <span className="text-danger">*</span>:
                  </Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    isInvalid={!!errors.address}
                    placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố..."
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.address}
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-3" controlId="checkoutNote">
                  <Form.Label className="fw-semibold small">
                    Ghi chú giao hàng (tuỳ chọn):
                  </Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    name="note"
                    value={formData.note}
                    onChange={handleChange}
                    placeholder="Ví dụ: Giao giờ hành chính, gọi trước khi giao..."
                  />
                </Form.Group>

                <Form.Group className="mb-0">
                  <Form.Label className="fw-semibold small">
                    Phương thức thanh toán:
                  </Form.Label>
                  <div className="border rounded p-3 bg-light">
                    <Form.Check
                      type="radio"
                      id="payment-cod"
                      name="paymentMethod"
                      value="cod"
                      label="💵 Thanh toán tiền mặt khi nhận hàng (COD)"
                      checked={formData.paymentMethod === "cod"}
                      onChange={handleChange}
                      className="mb-2 fw-medium"
                    />
                    <Form.Check
                      type="radio"
                      id="payment-banking"
                      name="paymentMethod"
                      value="banking"
                      label="🏦 Chuyển khoản ngân hàng (QR Code / Internet Banking)"
                      checked={formData.paymentMethod === "banking"}
                      onChange={handleChange}
                      className="fw-medium"
                    />
                  </div>
                </Form.Group>
              </Card.Body>
            </Card>
          </Col>

          {/* Right Column: Order Review Summary & Confirm Button */}
          <Col xs={12} lg={5}>
            <Card
              className="shadow-sm border sticky-top"
              style={{ top: "85px", zIndex: 10 }}
            >
              <Card.Header className="bg-white fw-bold py-3 fs-5 border-bottom">
                Đơn hàng ({totalQuantity} cuốn)
              </Card.Header>
              <Card.Body className="p-3">
                <div
                  className="mb-3 border-bottom pb-2"
                  style={{ maxHeight: "250px", overflowY: "auto" }}
                >
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="d-flex justify-content-between align-items-center py-2 border-bottom small"
                    >
                      <div className="me-2" style={{ maxWidth: "70%" }}>
                        <div className="fw-semibold text-truncate">
                          {item.title}
                        </div>
                        <div className="text-muted">
                          SL: {item.quantity} × {formatPrice(item.price)}
                        </div>
                      </div>
                      <div className="fw-bold text-danger text-nowrap">
                        {formatPrice(
                          (Number(item.price) || 0) *
                            (Number(item.quantity) || 1),
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="d-flex justify-content-between mb-2">
                  <span className="text-secondary">Tạm tính:</span>
                  <span className="fw-semibold">
                    {formatPrice(totalAmount)}
                  </span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-secondary">Phí vận chuyển:</span>
                  <span className="text-success fw-semibold">
                    <Badge bg="success" className="me-1">
                      FREE
                    </Badge>
                    Miễn phí
                  </span>
                </div>
                <hr className="my-2" />
                <div className="d-flex justify-content-between align-items-baseline mb-4">
                  <span className="fw-bold fs-6">Tổng thanh toán:</span>
                  <span className="fw-bold fs-4 text-danger">
                    {formatPrice(totalAmount)}
                  </span>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-100 fw-bold d-flex align-items-center justify-content-center gap-2 shadow-sm"
                  disabled={submitting}
                  style={{ backgroundColor: "#0D6EFD", borderColor: "#0D6EFD" }}
                >
                  {submitting ? (
                    <>
                      <Spinner
                        as="span"
                        animation="border"
                        size="sm"
                        role="status"
                        className="me-2"
                      />
                      <span>Đang xử lý đặt hàng...</span>
                    </>
                  ) : (
                    <>
                      <span>✅</span>
                      <span>Xác nhận đặt hàng</span>
                    </>
                  )}
                </Button>

                <Button
                  as={Link}
                  to="/cart"
                  variant="outline-secondary"
                  size="sm"
                  className="w-100 mt-2 fw-semibold"
                >
                  ← Quay lại giỏ hàng
                </Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Form>
    </Container>
  );
};

export default CheckoutPage;
