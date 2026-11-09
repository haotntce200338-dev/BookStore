import React from "react";
import { Button, InputGroup, Form } from "react-bootstrap";
import { Link } from "react-router-dom";

const DEFAULT_COVER =
  "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=400&q=80";

const formatPrice = (price) => {
  return Number(price || 0).toLocaleString("vi-VN") + " đ";
};

const CartItemRow = ({ item, onQuantityChange, onRemoveRequest }) => {
  const isMaxStock = item.quantity >= item.stock;

  const handleImageError = (e) => {
    e.target.onerror = null;
    e.target.src = DEFAULT_COVER;
  };

  const handleInputChange = (e) => {
    const val = parseInt(e.target.value, 10);
    if (!isNaN(val)) {
      onQuantityChange(item.id, val);
    }
  };

  const handleInputBlur = (e) => {
    const val = parseInt(e.target.value, 10);
    if (isNaN(val) || val < 1) {
      onQuantityChange(item.id, 1);
    } else if (val > item.stock) {
      onQuantityChange(item.id, item.stock);
    }
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
        <div className="col-9 col-sm-4 col-md-5">
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

        {/* Quantity Controller */}
        <div className="col-6 col-sm-3 col-md-2">
          <div className="d-flex flex-column align-items-start align-items-sm-center">
            <InputGroup size="sm" style={{ maxWidth: "115px" }}>
              <Button
                variant="outline-secondary"
                disabled={item.quantity <= 1}
                onClick={() => onQuantityChange(item.id, item.quantity - 1)}
                aria-label="Giảm số lượng"
                className="px-2 fw-bold"
              >
                -
              </Button>
              <Form.Control
                type="number"
                min="1"
                max={item.stock}
                value={item.quantity}
                onChange={handleInputChange}
                onBlur={handleInputBlur}
                className="text-center fw-semibold px-1"
                aria-label={`Số lượng cho ${item.title}`}
              />
              <Button
                variant="outline-secondary"
                disabled={isMaxStock}
                onClick={() => onQuantityChange(item.id, item.quantity + 1)}
                aria-label="Tăng số lượng"
                className="px-2 fw-bold"
              >
                +
              </Button>
            </InputGroup>
            {isMaxStock && (
              <small
                className="text-danger mt-1 text-center"
                style={{ fontSize: "0.72rem" }}
              >
                Tối đa trong kho ({item.stock})
              </small>
            )}
          </div>
        </div>

        {/* Line Total & Remove Action */}
        <div className="col-6 col-sm-3 col-md-3 text-end">
          <div className="mb-1">
            <span className="d-sm-none text-muted small d-block">
              Thành tiền:
            </span>
            <span className="fs-6 fw-bold text-danger">
              {formatPrice(lineTotal)}
            </span>
          </div>
          <Button
            variant="outline-danger"
            size="sm"
            onClick={() => onRemoveRequest(item)}
            className="d-inline-flex align-items-center gap-1 border-0 text-danger px-2 py-1"
            title="Xóa cuốn sách này khỏi giỏ hàng"
            aria-label={`Xóa cuốn sách ${item.title}`}
          >
            <span>🗑️</span>
            <span className="small">Xóa</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CartItemRow;
