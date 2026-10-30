import React from "react";
import { Card, Button, Badge } from "react-bootstrap";
import { Link } from "react-router-dom";

const formatPrice = (price) => {
  return Number(price || 0).toLocaleString("vi-VN") + " đ";
};

const CartSummary = ({ totalQuantity, totalAmount }) => {
  return (
    <div
      className="cart-summary-wrapper sticky-top"
      style={{ top: "85px", zIndex: 10 }}
    >
      <Card className="shadow-sm border">
        <Card.Header className="bg-white fw-bold py-3 fs-5 border-bottom">
          Tóm tắt đơn hàng
        </Card.Header>

        <Card.Body className="p-3">
          {/* Total Quantity */}
          <div className="d-flex justify-content-between align-items-center mb-2">
            <span className="text-secondary">Tổng số lượng:</span>
            <span className="fw-semibold">{totalQuantity} cuốn</span>
          </div>

          {/* Subtotal */}
          <div className="d-flex justify-content-between align-items-center mb-2">
            <span className="text-secondary">Tạm tính:</span>
            <span className="fw-semibold">{formatPrice(totalAmount)}</span>
          </div>

          {/* Shipping Fee */}
          <div className="d-flex justify-content-between align-items-center mb-3">
            <span className="text-secondary">Phí vận chuyển:</span>
            <span className="text-success fw-semibold">
              <Badge bg="success" className="me-1">
                FREE
              </Badge>
              Miễn phí
            </span>
          </div>

          <hr className="my-3" />

          {/* Grand Total */}
          <div className="d-flex justify-content-between align-items-baseline mb-3">
            <span className="fw-bold fs-6 text-dark">
              Tổng tiền thanh toán:
            </span>
            <span className="fw-bold fs-4 text-danger">
              {formatPrice(totalAmount)}
            </span>
          </div>

          <div className="text-muted small mb-3">
            (Đã bao gồm thuế GTGT nếu có)
          </div>

          {/* Action Button: Back to Catalog */}
          <div className="d-grid gap-2">
            <Button
              as={Link}
              to="/"
              variant="outline-primary"
              size="md"
              className="fw-semibold"
            >
              ← Tiếp tục mua sắm
            </Button>
          </div>
        </Card.Body>

        {/* Store Trust Badges */}
        <Card.Footer className="bg-light py-3 border-top small text-muted">
          <div className="d-flex align-items-center gap-2 mb-2">
            <span>🚚</span>
            <span>Giao hàng toàn quốc từ 1 - 3 ngày</span>
          </div>
          <div className="d-flex align-items-center gap-2 mb-2">
            <span>🔄</span>
            <span>Đổi trả dễ dàng trong vòng 7 ngày</span>
          </div>
          <div className="d-flex align-items-center gap-2">
            <span>🛡️</span>
            <span>Cam kết 100% sách chính hãng, chất lượng</span>
          </div>
        </Card.Footer>
      </Card>
    </div>
  );
};

export default CartSummary;
