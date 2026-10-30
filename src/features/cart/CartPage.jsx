import React from 'react';
import { Container, Row, Col, Card, Button, Badge } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import CartItemRow from './CartItemRow';
import CartSummary from './CartSummary';

const CartPage = () => {
  // Read shopping cart data strictly from Redux state
  const { items, totalQuantity, totalAmount } = useSelector((state) => state.cart);

  return (
    <Container className="my-4">
      {/* Breadcrumb & Heading */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 pb-2 border-bottom">
        <div>
          <div className="text-muted small mb-1">
            <Link to="/" className="text-decoration-none text-secondary">Trang chủ</Link>
            <span className="mx-2">/</span>
            <span className="text-dark fw-semibold">Giỏ hàng</span>
          </div>
          <h2 className="fw-bold mb-0 text-dark d-flex align-items-center gap-2">
            <span>🛒</span>
            <span>Giỏ hàng của bạn</span>
            {totalQuantity > 0 && (
              <Badge bg="primary" pill className="fs-6 fw-normal">
                {totalQuantity} cuốn
              </Badge>
            )}
          </h2>
        </div>

        {items.length > 0 && (
          <Button as={Link} to="/" variant="outline-primary" size="sm" className="mt-2 mt-sm-0">
            ← Tiếp tục chọn sách
          </Button>
        )}
      </div>

      {/* Empty State */}
      {items.length === 0 ? (
        <Card className="text-center py-5 shadow-sm border-0 bg-white my-4">
          <Card.Body className="py-4">
            <div className="mb-3" style={{ fontSize: '4.5rem' }}>🛒</div>
            <h4 className="fw-bold text-dark mb-2">Giỏ hàng của bạn đang trống</h4>
            <p className="text-secondary mb-4 mx-auto" style={{ maxWidth: '480px' }}>
              Chưa có cuốn sách nào được chọn trong giỏ hàng. Hãy dạo quanh BookStore để tìm kiếm
              những cuốn sách yêu thích nhé!
            </p>
            <Button
              as={Link}
              to="/"
              variant="primary"
              size="lg"
              className="px-4 fw-semibold shadow-sm"
              style={{ backgroundColor: '#0D6EFD', borderColor: '#0D6EFD' }}
            >
              📚 Khám phá sách ngay
            </Button>
          </Card.Body>
        </Card>
      ) : (
        /* Cart Content Grid (View Only) */
        <Row className="g-4">
          {/* Cart Items List */}
          <Col xs={12} lg={8}>
            <Card className="shadow-sm border">
              <Card.Header className="bg-light fw-bold py-3 d-none d-md-block">
                <div className="row text-secondary small text-uppercase">
                  <div className="col-md-7">Sản phẩm</div>
                  <div className="col-md-2 text-center">Số lượng</div>
                  <div className="col-md-3 text-end">Số tiền</div>
                </div>
              </Card.Header>
              <div className="cart-items-container">
                {items.map((item) => (
                  <CartItemRow key={item.id} item={item} />
                ))}
              </div>
            </Card>
          </Col>

          {/* Cart Summary */}
          <Col xs={12} lg={4}>
            <CartSummary
              totalQuantity={totalQuantity}
              totalAmount={totalAmount}
            />
          </Col>
        </Row>
      )}
    </Container>
  );
};

export default CartPage;
