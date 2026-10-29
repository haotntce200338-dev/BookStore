import React from 'react';
import { Card, Button, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';

// High-resolution fallback cover when the image fails to load
const DEFAULT_BOOK_COVER =
  'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=400&q=80';

const BookCard = ({ book, onAddToCart }) => {
  const isOutOfStock = Number(book.stock) <= 0;

  // Handle broken image links gracefully
  const handleImageError = (e) => {
    e.target.onerror = null;
    e.target.src = DEFAULT_BOOK_COVER;
  };

  return (
    <Card className="book-card h-100 shadow-sm border d-flex flex-column">
      {/* Book cover image area */}
      <div className="position-relative overflow-hidden">
        <Link to={`/books/${book.id}`}>
          <Card.Img
            variant="top"
            src={book.image || DEFAULT_BOOK_COVER}
            alt={book.title}
            className="book-card-img"
            onError={handleImageError}
            loading="lazy"
          />
        </Link>
      </div>

      {/* Book information content */}
      <Card.Body className="p-3 d-flex flex-column">
        {/* Author */}
        <div className="text-muted small text-truncate mb-1">
          {book.author || 'Tác giả chưa cập nhật'}
        </div>

        {/* Clamped book title (max 2 lines) */}
        <Link
          to={`/books/${book.id}`}
          className="text-decoration-none text-dark hover-primary mb-2"
          title={book.title}
        >
          <h6 className="book-title-clamp mb-0">{book.title}</h6>
        </Link>

        {/* Real-time stock status badge */}
        <div className="mb-2">
          {isOutOfStock ? (
            <Badge bg="danger" className="fw-normal small">
              Hết hàng
            </Badge>
          ) : (
            <Badge bg="success" className="fw-normal small">
              Còn hàng ({book.stock})
            </Badge>
          )}
        </div>

        {/* Pricing section: current selling price & original price */}
        <div className="mt-auto pt-2 border-top">
          <div className="d-flex align-items-baseline gap-2 mb-3">
            <span className="book-price-current">
              {Number(book.price).toLocaleString('vi-VN')} đ
            </span>
            {book.originalPrice && Number(book.originalPrice) > Number(book.price) && (
              <span className="book-price-original">
                {Number(book.originalPrice).toLocaleString('vi-VN')} đ
              </span>
            )}
          </div>

          {/* Action buttons */}
          <div className="d-grid gap-2">
            <Button
              as={Link}
              to={`/books/${book.id}`}
              variant="outline-primary"
              size="sm"
              className="fw-semibold"
            >
              Xem chi tiết
            </Button>
            <Button
              variant="primary"
              size="sm"
              className="fw-semibold d-flex align-items-center justify-content-center gap-1"
              disabled={isOutOfStock}
              onClick={() => onAddToCart && onAddToCart(book)}
            >
              <span>🛒</span>
              <span>{isOutOfStock ? 'Tạm hết hàng' : 'Thêm giỏ hàng'}</span>
            </Button>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};

export default BookCard;

