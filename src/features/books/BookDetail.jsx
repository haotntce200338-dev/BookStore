import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
  Alert,
  Badge,
  Button,
  Card,
  Col,
  Container,
  Form,
  InputGroup,
  Row,
  Spinner,
  Toast,
  ToastContainer,
} from 'react-bootstrap';

import { fetchBookById } from './bookSlice';
import { addToCart } from '../cart/cartSlice';

const NO_COVER = 'https://placehold.co/400x560?text=No+Cover';

// Formats the book price into Vietnamese currency.
// Returns a default message when the price is invalid.
function formatPrice(price) {
  if (price === null || price === undefined || !Number.isFinite(Number(price))) {
    return 'Chưa cập nhật';
  }
  return Number(price).toLocaleString('vi-VN') + ' đ';
}

// Displays book details and handles loading, error, and not-found states.
function BookDetail() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { currentBook, bookLoading, bookError, bookNotFound } = useSelector(
    (state) => state.books
  );

  const [quantity, setQuantity] = useState(1);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Fetches the book details when the page opens or the book ID changes.
  // Resets the quantity when displaying a different book.
  useEffect(() => {
    setQuantity(1);
    dispatch(fetchBookById(id));
  }, [dispatch, id]);

  const maxStock = Number(currentBook?.stock) || 0;
  const isOutOfStock = maxStock <= 0;

  const handleDecrease = () => setQuantity((prev) => Math.max(1, prev - 1));
  const handleIncrease = () => setQuantity((prev) => Math.min(maxStock, prev + 1));

  const handleQuantityChange = (e) => {
    const val = parseInt(e.target.value, 10);
    if (isNaN(val)) setQuantity(1);
    else setQuantity(Math.max(1, Math.min(val, maxStock)));
  };

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    dispatch(addToCart({ book: currentBook, quantity }));
    setToastMessage(`Đã thêm ${quantity} cuốn "${currentBook.title}" vào giỏ hàng!`);
    setShowToast(true);
  };

  const handleBuyNow = () => {
    if (isOutOfStock) return;
    dispatch(addToCart({ book: currentBook, quantity }));
    navigate('/cart');
  };

  if (bookLoading) {
    return (
      <Container className="my-4 text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3 text-muted">Đang tải thông tin sách...</p>
      </Container>
    );
  }

  if (bookNotFound) {
    return (
      <Container className="my-4">
        <Alert variant="info" className="text-center p-4">
          <Alert.Heading>Không tìm thấy sách</Alert.Heading>
          <p className="mb-3">Cuốn sách này không tồn tại hoặc đã bị xóa.</p>
          <Button as={Link} to="/" variant="primary">
            Quay lại trang chủ
          </Button>
        </Alert>
      </Container>
    );
  }

  if (bookError) {
    return (
      <Container className="my-4">
        <Alert variant="danger" className="text-center p-4">
          <p>{bookError}</p>
          <Button variant="outline-danger" onClick={() => dispatch(fetchBookById(id))}>
            Thử lại
          </Button>
        </Alert>
      </Container>
    );
  }

  if (!currentBook) return null;

  return (
    <Container className="my-4">
      {/* Toast Notification when added to cart */}
      <ToastContainer position="top-end" className="p-3" style={{ zIndex: 1055 }}>
        <Toast show={showToast} onClose={() => setShowToast(false)} delay={3000} autohide bg="success">
          <Toast.Header>
            <strong className="me-auto text-success">🛒 Giỏ hàng BookStore</strong>
            <small>Vừa xong</small>
          </Toast.Header>
          <Toast.Body className="text-white">
            <p className="mb-2">{toastMessage}</p>
            <Button as={Link} to="/cart" size="sm" variant="light" className="text-success fw-bold">
              Xem giỏ hàng →
            </Button>
          </Toast.Body>
        </Toast>
      </ToastContainer>

      <Button as={Link} to="/" variant="outline-secondary" className="mb-4">
        ← Quay lại
      </Button>

      <Row className="g-4">
        {/* Left Column: Cover image */}
        <Col xs={12} md={5} lg={4}>
          <Card className="shadow-sm border-0">
            <Card.Img
              variant="top"
              src={currentBook.image || NO_COVER}
              alt={currentBook.title || 'Bìa sách'}
              className="p-3"
              style={{ width: '100%', maxHeight: '520px', objectFit: 'contain' }}
              onError={(event) => {
                event.currentTarget.onerror = null;
                event.currentTarget.src = NO_COVER;
              }}
            />
          </Card>
        </Col>

        {/* Right Column: Book details & purchase controls */}
        <Col xs={12} md={7} lg={8}>
          <p className="text-secondary mb-2">CHI TIẾT SÁCH</p>
          <h1 className="h2 fw-bold mb-3">{currentBook.title}</h1>

          <p className="mb-2"><strong>Mã sách:</strong> {currentBook.id}</p>
          <p className="mb-2"><strong>Tác giả:</strong> {currentBook.author || 'Chưa cập nhật'}</p>

          <p className="mb-3">
            <strong>Tình trạng:</strong>{' '}
            <Badge bg={isOutOfStock ? 'danger' : maxStock <= 10 ? 'warning' : 'success'}>
              {isOutOfStock ? 'Hết hàng' : `Còn hàng (${maxStock})`}
            </Badge>
          </p>

          <div className="d-flex align-items-center flex-wrap gap-3 my-4">
            <span className="text-danger fs-3 fw-bold">{formatPrice(currentBook.price)}</span>
            {Number(currentBook.originalPrice) > Number(currentBook.price) && (
              <span className="text-secondary text-decoration-line-through">
                {formatPrice(currentBook.originalPrice)}
              </span>
            )}
          </div>

          {/* Quantity Selector with inventory limits */}
          <div className="mb-4">
            <Form.Label className="fw-semibold small d-block mb-2">Chọn số lượng mua:</Form.Label>
            <div className="d-flex align-items-center gap-3">
              <InputGroup style={{ maxWidth: '140px' }}>
                <Button
                  variant="outline-secondary"
                  disabled={quantity <= 1 || isOutOfStock}
                  onClick={handleDecrease}
                >
                  -
                </Button>
                <Form.Control
                  type="number"
                  min="1"
                  max={maxStock}
                  value={quantity}
                  onChange={handleQuantityChange}
                  disabled={isOutOfStock}
                  className="text-center fw-bold"
                />
                <Button
                  variant="outline-secondary"
                  disabled={quantity >= maxStock || isOutOfStock}
                  onClick={handleIncrease}
                >
                  +
                </Button>
              </InputGroup>
              <small className="text-muted">
                {isOutOfStock ? 'Sản phẩm tạm thời hết hàng' : `(Tối đa ${maxStock} cuốn)`}
              </small>
            </div>
          </div>

          {/* Add to Cart & Buy Now Buttons */}
          <div className="d-flex flex-wrap gap-2 mb-4">
            <Button
              variant="primary"
              size="lg"
              disabled={isOutOfStock}
              onClick={handleAddToCart}
              className="px-4 fw-semibold d-inline-flex align-items-center gap-2"
              style={{ backgroundColor: '#0D6EFD', borderColor: '#0D6EFD' }}
            >
              <span>🛒</span>
              <span>Thêm vào giỏ hàng</span>
            </Button>
            <Button
              variant="outline-primary"
              size="lg"
              disabled={isOutOfStock}
              onClick={handleBuyNow}
              className="px-4 fw-semibold"
            >
              Mua ngay
            </Button>
          </div>

          <hr />

          <h2 className="h5 fw-bold">Mô tả sách</h2>
          <p className="text-secondary" style={{ lineHeight: '1.7' }}>
            {currentBook.description || 'Chưa có mô tả cho cuốn sách này.'}
          </p>
        </Col>
      </Row>
    </Container>
  );
}

export default BookDetail;