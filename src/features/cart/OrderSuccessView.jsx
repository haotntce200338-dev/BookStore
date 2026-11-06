import React from "react";
import { Container, Card, Button, Badge } from "react-bootstrap";
import { Link } from "react-router-dom";

const formatPrice = (price) => {
  return Number(price || 0).toLocaleString("vi-VN") + " đ";
};

const OrderSuccessView = ({ order, isAuthenticated }) => {
  return (
    <Container className="my-5">
      <Card
        className="p-4 p-md-5 shadow-sm border-0 mx-auto text-center"
        style={{ maxWidth: "650px" }}
      >
        <div className="fs-1 mb-3 text-success">🎉</div>
        <h3 className="fw-bold text-success mb-2">Đặt Hàng Thành Công!</h3>
        <p className="text-muted mb-4">
          Cảm ơn bạn đã tin tưởng mua sắm tại <strong>BookStore</strong>.
        </p>

        <div className="bg-light p-3 rounded text-start mb-4 border small">
          <div className="d-flex justify-content-between mb-2">
            <span className="text-muted">Mã đơn hàng:</span>
            <Badge bg="primary" className="fs-6">
              {order.id}
            </Badge>
          </div>
          <div className="d-flex justify-content-between mb-2">
            <span className="text-muted">Người nhận:</span>
            <strong>{order.customerName}</strong>
          </div>
          <div className="d-flex justify-content-between mb-2">
            <span className="text-muted">Số điện thoại:</span>
            <strong>{order.phone}</strong>
          </div>
          <div className="d-flex justify-content-between mb-2">
            <span className="text-muted">Địa chỉ nhận:</span>
            <span className="text-end" style={{ maxWidth: "65%" }}>
              {order.address}
            </span>
          </div>
          <div className="d-flex justify-content-between mb-2">
            <span className="text-muted">Phương thức:</span>
            <span>
              {order.paymentMethod === "cod"
                ? "Thanh toán khi nhận hàng (COD)"
                : "Chuyển khoản ngân hàng"}
            </span>
          </div>
          <hr className="my-2" />
          <div className="d-flex justify-content-between align-items-baseline">
            <span className="fw-bold text-dark">Tổng tiền thanh toán:</span>
            <span className="text-danger fw-bold fs-5">
              {formatPrice(order.totalAmount)}
            </span>
          </div>
        </div>

        <div className="d-flex justify-content-center gap-2 flex-wrap">
          {isAuthenticated && (
            <Button
              as={Link}
              to="/orders"
              variant="outline-primary"
              className="fw-semibold"
            >
              📦 Xem lịch sử đơn hàng
            </Button>
          )}
          <Button as={Link} to="/" variant="primary" className="fw-semibold">
            📚 Tiếp tục mua sách
          </Button>
        </div>
      </Card>
    </Container>
  );
};

export default OrderSuccessView;
