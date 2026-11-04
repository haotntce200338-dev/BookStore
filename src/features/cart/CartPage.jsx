import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, Badge, Modal, Toast, ToastContainer } from 'react-bootstrap';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { updateQuantity, removeFromCart } from './cartSlice';
import CartItemRow from './CartItemRow';
import CartSummary from './CartSummary';

const CartPage = () => {
  const dispatch = useDispatch();

  // Read auth and shopping cart data from Redux state
  const { currentUser } = useSelector((state) => state.auth);
  const { items, totalQuantity, totalAmount } = useSelector((state) => state.cart);

  // Modal confirmation state for removing an item
  const [deleteModal, setDeleteModal] = useState({
    show: false,
    item: null,
  });

  // Toast feedback state
  const [toastConfig, setToastConfig] = useState({
    show: false,
    message: '',
  });

  // If logged-in user is an admin, shopping cart is not applicable
  if (currentUser?.role === 'admin') {
    return (
      <Container className="my-5 text-center">
        <Card className="p-4 p-md-5 shadow-sm border-0 mx-auto" style={{ maxWidth: '600px' }}>
          <div className="fs-1 mb-3">🛡️</div>
          <h4 className="fw-bold text-dark mb-2">Tài khoản Quản trị viên (Admin)</h4>
          <p className="text-muted mb-4">
            Tài khoản Admin dành riêng cho quản trị hệ thống và không sử dụng tính năng giỏ hàng / mua sắm.
          </p>
          <div className="d-flex justify-content-center gap-2 flex-wrap">
            <Button as={Link} to="/admin/books" variant="danger">
              📚 Đến Trang Quản Trị Sách
            </Button>
            <Button as={Link} to="/" variant="outline-secondary">
              Về Trang Chủ
            </Button>
          </div>
        </Card>
      </Container>
    );
  }

  // Handle quantity changes (minimum 1, maximum item stock)
  const handleQuantityChange = (bookId, newQuantity) => {
    const item = items.find((i) => String(i.id) === String(bookId));
    if (!item) return;

    // Constrain quantity within [1, item.stock]
    const safeQty = Math.max(1, Math.min(newQuantity, item.stock));
    dispatch(updateQuantity({ bookId, quantity: safeQty }));
  };

  // Open modal to confirm removal
  const handleOpenRemoveModal = (item) => {
    setDeleteModal({
      show: true,
      item,
    });
  };

  // Close confirmation modal
  const handleCloseRemoveModal = () => {
    setDeleteModal({
      show: false,
      item: null,
    });
  };

  // Execute removal after user confirmation
  const handleConfirmRemove = () => {
    if (deleteModal.item) {
      const removedTitle = deleteModal.item.title;
      dispatch(removeFromCart(deleteModal.item.id));
      setToastConfig({
        show: true,
        message: `Đã xóa cuốn "${removedTitle}" khỏi giỏ hàng.`,
      });
    }
    handleCloseRemoveModal();
  };

  return (
    <Container className="my-4">
      {/* Toast Notification */}
      <ToastContainer position="top-end" className="p-3" style={{ zIndex: 1080 }}>
        <Toast
          show={toastConfig.show}
          onClose={() => setToastConfig((prev) => ({ ...prev, show: false }))}
          delay={2500}
          autohide
          bg="success"
        >
          <Toast.Header>
            <strong className="me-auto text-primary">🛒 Giỏ hàng BookStore</strong>
            <small>Vừa xong</small>
          </Toast.Header>
          <Toast.Body className="text-white small fw-medium">
            {toastConfig.message}
          </Toast.Body>
        </Toast>
      </ToastContainer>

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
        /* Cart Content Grid */
        <Row className="g-4">
          {/* Cart Items List */}
          <Col xs={12} lg={8}>
            <Card className="shadow-sm border">
              <Card.Header className="bg-light fw-bold py-3 d-none d-md-block">
                <div className="row text-secondary small text-uppercase">
                  <div className="col-md-7">Sản phẩm</div>
                  <div className="col-md-2 text-center">Số lượng</div>
                  <div className="col-md-3 text-end">Số tiền & Thao tác</div>
                </div>
              </Card.Header>
              <div className="cart-items-container">
                {items.map((item) => (
                  <CartItemRow
                    key={item.id}
                    item={item}
                    onQuantityChange={handleQuantityChange}
                    onRemoveRequest={handleOpenRemoveModal}
                  />
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

      {/* Remove Confirmation Modal (guidelines.md Section 4.3) */}
      <Modal
        show={deleteModal.show}
        onHide={handleCloseRemoveModal}
        centered
        backdrop="static"
        keyboard={true}
      >
        <Modal.Header closeButton>
          <Modal.Title className="fs-5 fw-bold text-danger d-flex align-items-center gap-2">
            <span>⚠️</span>
            <span>Xác nhận xóa sản phẩm</span>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="mb-0">
            Bạn có chắc chắn muốn xóa cuốn sách{' '}
            <strong>"{deleteModal.item?.title}"</strong> khỏi giỏ hàng không?
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={handleCloseRemoveModal}>
            Hủy
          </Button>
          <Button variant="danger" onClick={handleConfirmRemove}>
            Xác nhận xóa
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default CartPage;
