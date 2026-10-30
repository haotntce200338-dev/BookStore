import React from "react";
import { Badge } from "react-bootstrap";
import { Link } from "react-router-dom";

const DEFAULT_COVER =
  "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=400&q=80";

const formatPrice = (price) => {
  return Number(price || 0).toLocaleString("vi-VN") + " đ";
};

const CartItemRow = ({ item }) => {
  const handleImageError = (e) => {
    e.target.onerror = null;
    e.target.src = DEFAULT_COVER;
  };

  const lineTotal = (Number(item.price) || 0) * (Number(item.quantity) || 1);

  return (
    <div className="cart-item-row p-3 border-bottom bg-white">
      <div className="row align-items-center g-3">
        {/* Book Cover Image */}
        <div className="col-3 col-sm-2 text-center">
          <Link to={`/books/${item.id}`} className="d-block position-relative">
            <img
              src={item.image || DEFAULT_COVER}
              alt={item.title}
              onError={handleImageError}
              className="rounded shadow-sm border"
              style={{
                width: "100%",
                maxWidth: "75px",
                height: "100px",
                objectFit: "cover",
              }}
            />
          </Link>
        </div>

        {/* Book Information */}
        <div className="col-9 col-sm-5">
          <Link
            to={`/books/${item.id}`}
            className="text-decoration-none text-dark fw-bold hover-primary d-block mb-1 line-clamp-2"
            title={item.title}
            style={{ fontSize: "0.95rem", lineHeight: "1.4" }}
          >
            {item.title}
          </Link>
          <div className="text-secondary small mb-1">
            {item.author ? `Tác giả: ${item.author}` : "Tác giả chưa cập nhật"}
          </div>
          <div className="d-flex align-items-baseline gap-2">
            <span className="text-danger fw-semibold">
              {formatPrice(item.price)}
            </span>
            {item.originalPrice &&
              Number(item.originalPrice) > Number(item.price) && (
                <span className="text-muted text-decoration-line-through small">
                  {formatPrice(item.originalPrice)}
                </span>
              )}
          </div>
        </div>

        {/* Quantity (Read-only View) */}
        <div className="col-6 col-sm-2 text-sm-center">
          <span className="d-sm-none text-muted small me-2">Số lượng:</span>
          <Badge
            bg="light"
            text="dark"
            className="border px-3 py-2 fs-6 fw-bold"
          >
            {item.quantity}
          </Badge>
        </div>

        {/* Line Total */}
        <div className="col-6 col-sm-3 text-end">
          <span className="d-sm-none text-muted small d-block">
            Thành tiền:
          </span>
          <span className="fs-6 fw-bold text-danger">
            {formatPrice(lineTotal)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default CartItemRow;
