import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useParams } from 'react-router-dom';
import {
  Alert,
  Badge,
  Button,
  Card,
  Col,
  Container,
  Row,
  Spinner,
} from 'react-bootstrap';

import { fetchBookById } from './bookSlice';

// Default image used when the book cover is missing or cannot load.
const NO_COVER = 'https://placehold.co/400x560?text=No+Cover';

/**
 * Format a book price using Vietnamese number formatting.
 *
 * @param {number|string} price - The price to format.
 * @returns {string} The formatted price or a fallback message.
 */
function formatPrice(price) {
  // Check whether the price is missing or invalid.
  if (
    price === null ||
    price === undefined ||
    price === '' ||
    !Number.isFinite(Number(price))
  ) {
    return 'Chưa cập nhật';
  }

  // Add thousand separators and the Vietnamese currency unit.
  return Number(price).toLocaleString('vi-VN') + ' đ';
}

/**
 * Display the details of one book selected by its route ID.
 *
 */
function BookDetail() {
  // Read the book ID from a URL such as /books/b-101.
  const { id } = useParams();

  // Get the dispatch function used to send Redux actions.
  const dispatch = useDispatch();

  // Read the current book and request status from Redux.
  const {
    currentBook,
    bookLoading,
    bookError,
    bookNotFound,
  } = useSelector((state) => state.books);

  /**
   * Request the book details whenever the route ID changes.
   * fetchBookById handles the API request in bookSlice.js.
   */
  useEffect(() => {
    dispatch(fetchBookById(id));
  }, [dispatch, id]);

  /**
   * Display a loading indicator while the book is being fetched.
   */
  if (bookLoading) {
    return (
      <Container className="my-4 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Đang tải thông tin sách...</p>
      </Container>
    );
  }

  /**
   * Display an empty state when the requested book does not exist.
   */
  if (bookNotFound) {
    return (
      <Container className="my-4">
        <Alert variant="info">
          <Alert.Heading>Không tìm thấy sách</Alert.Heading>

          <p>
            Cuốn sách này không tồn tại hoặc đã bị xóa.
          </p>

          <Button as={Link} to="/" variant="primary">
            Quay lại trang chủ
          </Button>
        </Alert>
      </Container>
    );
  }

  /**
   * Display an error message and allow the user to retry the request.
   */
  if (bookError) {
    return (
      <Container className="my-4">
        <Alert variant="danger">
          <p>{bookError}</p>

          <Button
            variant="outline-danger"
            onClick={() => dispatch(fetchBookById(id))}
          >
            Thử lại
          </Button>
        </Alert>
      </Container>
    );
  }

  /**
   * Show a loading indicator during the initial render before
   * the useEffect request has updated the Redux state.
   */
  if (!currentBook) {
    return (
      <Container className="my-4 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Đang tải thông tin sách...</p>
      </Container>
    );
  }

  // Determine the stock status from the book data.
  const inStock = Number(currentBook.stock) > 0;

  /**
   * Render the details of the book returned by the API.
   */
  return (
    <Container className="my-4">
      <Button
        as={Link}
        to="/"
        variant="outline-secondary"
        className="mb-4"
      >
        ← Quay lại
      </Button>

      <Row className="g-4">
        {/* Display the book cover on the left. */}
        <Col xs={12} md={5} lg={4}>
          <Card className="shadow-sm">
            <Card.Img
              variant="top"
              src={currentBook.image || NO_COVER}
              alt={currentBook.title || 'Bìa sách'}
              className="p-3"
              style={{
                width: '100%',
                maxHeight: '520px',
                objectFit: 'contain',
              }}
              onError={(event) => {
                // Prevent an error loop if the fallback image also fails.
                event.currentTarget.onerror = null;
                event.currentTarget.src = NO_COVER;
              }}
            />
          </Card>
        </Col>

        {/* Display the book information on the right. */}
        <Col xs={12} md={7} lg={8}>
          <p className="text-secondary mb-2">
            CHI TIẾT SÁCH
          </p>

          <h1 className="h2 fw-bold mb-3">
            {currentBook.title}
          </h1>

          <p>
            <strong>Mã sách:</strong> {currentBook.id}
          </p>

          <p>
            <strong>Tác giả:</strong>{' '}
            {currentBook.author || 'Chưa cập nhật'}
          </p>

          <p>
            <strong>Tình trạng:</strong>{' '}
            <Badge bg={inStock ? 'success' : 'danger'}>
              {inStock
                ? `Còn hàng (${currentBook.stock})`
                : 'Hết hàng'}
            </Badge>
          </p>

          <div className="d-flex align-items-center flex-wrap gap-3 my-4">
            <span className="text-danger fs-3 fw-bold">
              {formatPrice(currentBook.price)}
            </span>

            {Number(currentBook.originalPrice) >
              Number(currentBook.price) && (
              <span className="text-secondary text-decoration-line-through">
                {formatPrice(currentBook.originalPrice)}
              </span>
            )}
          </div>

          <hr />

          <h2 className="h5 fw-bold">Mô tả sách</h2>

          <p className="text-secondary">
            {currentBook.description ||
              'Chưa có mô tả cho cuốn sách này.'}
          </p>
        </Col>
      </Row>
    </Container>
  );
}

export default BookDetail;