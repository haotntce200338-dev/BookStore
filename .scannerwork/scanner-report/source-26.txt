import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  Alert,
  Badge,
  Button,
  Card,
  Col,
  Row,
  Spinner,
} from 'react-bootstrap';

import { fetchRelatedBooks } from './bookSlice';

const NO_COVER = 'https://placehold.co/400x560?text=No+Cover';

// Displays related books from the same category.
function RelatedBooks({ categoryId, currentBookId }) {
  const dispatch = useDispatch();

  const { relatedBooks, relatedLoading, relatedError } = useSelector(
    (state) => state.books
  );

  // Fetches related books when the category or current book changes.
  useEffect(() => {
    if (!categoryId || !currentBookId) return;

    dispatch(fetchRelatedBooks({ categoryId, currentBookId }));
  }, [dispatch, categoryId, currentBookId]);

  // Handles broken book cover images.
  const handleImageError = (event) => {
    event.target.onerror = null;
    event.target.src = NO_COVER;
  };

  if (relatedLoading) {
    return (
      <div className="text-center my-4">
        <Spinner animation="border" variant="primary" />
        <p className="text-muted mt-2">Đang tải sách liên quan...</p>
      </div>
    );
  }

  if (relatedError) {
    return (
      <Alert variant="danger" className="mt-4">
        {relatedError}
      </Alert>
    );
  }

  return (
    <div className="mt-5">
      <h2 className="h4 fw-bold mb-4">Sách liên quan</h2>

      {relatedBooks.length === 0 ? (
        <p className="text-muted">
          Hiện chưa có sách nào khác cùng danh mục.
        </p>
      ) : (
        <Row className="g-3">
          {relatedBooks.map((book) => {
            const isOutOfStock = Number(book.stock) <= 0;

            return (
              <Col xs={12} sm={6} md={4} lg={3} key={book.id}>
                <Card className="book-card h-100 shadow-sm border d-flex flex-column">
                  <Link to={`/books/${book.id}`}>
                    <Card.Img
                      variant="top"
                      src={book.image || NO_COVER}
                      alt={book.title}
                      className="book-card-img"
                      onError={handleImageError}
                      loading="lazy"
                    />
                  </Link>

                  <Card.Body className="p-3 d-flex flex-column">
                    <div className="text-muted small mb-1">
                      {book.author || 'Tác giả chưa cập nhật'}
                    </div>

                    <Link
                      to={`/books/${book.id}`}
                      className="text-decoration-none text-dark mb-2"
                    >
                      <h6 className="fw-bold">{book.title}</h6>
                    </Link>

                    <div className="mb-2">
                      <Badge bg={isOutOfStock ? 'danger' : 'success'}>
                        {isOutOfStock
                          ? 'Hết hàng'
                          : `Còn hàng (${book.stock})`}
                      </Badge>
                    </div>

                    <div className="mt-auto pt-2 border-top">
                      <div className="mb-3">
                        <span className="text-danger fw-bold">
                          {Number(book.price).toLocaleString('vi-VN')} đ
                        </span>
                      </div>

                      <Button
                        as={Link}
                        to={`/books/${book.id}`}
                        variant="outline-primary"
                        size="sm"
                        className="w-100 fw-semibold"
                      >
                        Xem chi tiết
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            );
          })}
        </Row>
      )}
    </div>
  );
}

export default RelatedBooks;
