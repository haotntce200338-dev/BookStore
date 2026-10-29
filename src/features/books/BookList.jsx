import React, { useEffect, useState } from 'react';
import {
  Container,
  Row,
  Col,
  Spinner,
  Alert,
  Button,
  Toast,
  ToastContainer,
} from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBooks } from './bookSlice';
import BookCard from './BookCard';

const BookList = () => {
  const dispatch = useDispatch();

  // Read books state from Redux store
  const { books, booksLoading, booksError } = useSelector(
    (state) => state.books
  );

  // Interaction feedback toast when clicking Add to Cart
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);

  // Fetch books catalog from API upon initial component mount
  useEffect(() => {
    dispatch(fetchBooks());
  }, [dispatch]);

  // Handle Add to Cart action
  const handleAddToCart = (book) => {
    setToastMessage(`Đã thêm "${book.title}" vào giỏ hàng.`);
    setShowToast(true);
  };

  return (
    <Container className="my-4">
      {/* Toast notification container on top-right */}
      <ToastContainer position="top-end" className="p-3" style={{ zIndex: 1080 }}>
        <Toast
          onClose={() => setShowToast(false)}
          show={showToast}
          delay={2500}
          autohide
          bg="success"
        >
          <Toast.Header>
            <strong className="me-auto text-success">🛒 Giỏ hàng BookStore</strong>
            <small>Vừa xong</small>
          </Toast.Header>
          <Toast.Body className="text-white small">{toastMessage}</Toast.Body>
        </Toast>
      </ToastContainer>

      {/* Catalog Title Header */}
      <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom">
        <div>
          <h2 className="fw-bold text-dark mb-1">📚 Danh Mục Sách</h2>
          <p className="text-muted small mb-0">
            Khám phá các đầu sách mới nhất và nổi bật nhất tại BookStore
          </p>
        </div>
        {!booksLoading && !booksError && (
          <span className="badge bg-light text-dark border px-3 py-2">
            Tổng cộng: <strong>{books.length}</strong> cuốn sách
          </span>
        )}
      </div>

      {/* 1. Loading State */}
      {booksLoading && (
        <div className="text-center py-5 my-4">
          <Spinner animation="border" variant="primary" role="status" />
          <p className="mt-3 text-muted small">Đang tải danh sách sách, vui lòng chờ...</p>
        </div>
      )}

      {/* 2. Error State */}
      {!booksLoading && booksError && (
        <Alert variant="danger" className="text-center py-4 my-4 shadow-sm">
          <div className="fs-3 mb-2">⚠️</div>
          <Alert.Heading className="fs-5 fw-bold">Không thể tải dữ liệu sách</Alert.Heading>
          <p className="small mb-3">{booksError}</p>
          <Button
            variant="danger"
            size="sm"
            onClick={() => dispatch(fetchBooks())}
          >
            Thử lại ngay
          </Button>
        </Alert>
      )}

      {/* 3. Empty State */}
      {!booksLoading && !booksError && books.length === 0 && (
        <Alert variant="info" className="text-center py-5 my-4 shadow-sm">
          <div className="fs-1 mb-2">📖</div>
          <Alert.Heading className="fs-5 fw-bold">Hiện chưa có cuốn sách nào</Alert.Heading>
          <p className="text-muted small mb-0">
            Cửa hàng hiện tại chưa có sản phẩm nào được bày bán. Vui lòng quay lại sau!
          </p>
        </Alert>
      )}

      {/* 4. Display Grid State */}
      {!booksLoading && !booksError && books.length > 0 && (
        <Row className="g-4">
          {books.map((book) => (
            <Col key={book.id} xs={12} sm={6} md={4} lg={3}>
              <BookCard book={book} onAddToCart={handleAddToCart} />
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
};

export default BookList;

