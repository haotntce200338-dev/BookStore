import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Alert,
  Badge,
  Button,
  Card,
  Container,
  Form,
  Modal,
  Spinner,
} from 'react-bootstrap';

import {
  fetchCustomerOrders,
  cancelCustomerOrder,
} from './orderSlice';

// Format price into Vietnamese currency.
function formatPrice(price) {
  return Number(price || 0).toLocaleString('vi-VN') + ' đ';
}

// Format order date.
function formatDate(date) {
  const orderDate = new Date(date);

  if (Number.isNaN(orderDate.getTime())) {
    return 'Không xác định';
  }

  return orderDate.toLocaleString('vi-VN');
}

// Get badge color based on order status.
function getStatusVariant(status) {
  switch (status) {
    case 'Pending':
      return 'warning';
    case 'Processing':
      return 'primary';
    case 'Shipped':
      return 'info';
    case 'Delivered':
      return 'success';
    case 'Cancelled':
    case 'Canceled':
      return 'danger';
    default:
      return 'secondary';
  }
}

function OrderHistoryPage() {
  const dispatch = useDispatch();

  const { currentUser } = useSelector((state) => state.auth);

  const {
    orders,
    loading,
    error,
    cancelLoading,
  } = useSelector((state) => state.orders);

  // Modal states.
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelFormError, setCancelFormError] = useState('');

  // Fetch customer orders when the page opens.
  useEffect(() => {
    if (currentUser?.id) {
      dispatch(fetchCustomerOrders(currentUser.id));
    }
  }, [dispatch, currentUser?.id]);

  // Open cancellation modal.
  const handleOpenCancelModal = (order) => {
    setSelectedOrder(order);
    setCancelReason('');
    setCancelFormError('');
    setShowCancelModal(true);
  };

  // Close cancellation modal.
  const handleCloseCancelModal = () => {
    if (cancelLoading) return;

    setShowCancelModal(false);
    setSelectedOrder(null);
    setCancelReason('');
    setCancelFormError('');
  };

  // Confirm order cancellation.
  const handleConfirmCancel = async (e) => {
    e.preventDefault();

    const reason = cancelReason.trim();

    if (!reason) {
      setCancelFormError('Vui lòng nhập lý do hủy đơn hàng.');
      return;
    }

    if (!selectedOrder) return;

    try {
      await dispatch(
        cancelCustomerOrder({
          orderId: selectedOrder.id,
          reason: reason,
        })
      ).unwrap();

      handleCloseCancelModal();
    } catch (err) {
      setCancelFormError(
        typeof err === 'string'
          ? err
          : 'Không thể hủy đơn hàng. Vui lòng thử lại.'
      );
    }
  };

  // Retry fetching customer orders.
  const handleRetry = () => {
    if (currentUser?.id) {
      dispatch(fetchCustomerOrders(currentUser.id));
    }
  };

  return (
    <Container className="my-4">
      <div className="mb-4">
        <h2 className="fw-bold">Lịch sử đơn hàng</h2>
        <p className="text-muted mb-0">
          Xin chào, {currentUser?.fullName || currentUser?.username}.
          Đây là danh sách đơn hàng của bạn.
        </p>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="text-muted mt-3">
            Đang tải lịch sử đơn hàng...
          </p>
        </div>
      )}

      {/* Error state */}
      {!loading && error && (
        <Alert variant="danger" className="text-center">
          <p className="mb-3">{error}</p>
          <Button variant="outline-danger" onClick={handleRetry}>
            Thử lại
          </Button>
        </Alert>
      )}

      {/* Empty state */}
      {!loading && !error && orders.length === 0 && (
        <Alert variant="info" className="text-center py-4">
          <h5 className="fw-bold">Bạn chưa có đơn hàng nào.</h5>
          <p className="mb-0">
            Các đơn hàng đã đặt sẽ được hiển thị tại đây.
          </p>
        </Alert>
      )}

      {/* Order list */}
      {!loading && !error && orders.length > 0 && (
        <>
          <div className="d-flex justify-content-between mb-3">
            <strong>Tổng số đơn hàng: {orders.length}</strong>
          </div>

          {orders.map((order) => (
            <Card key={order.id} className="shadow-sm mb-3">
              <Card.Header className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                <div>
                  <strong>Mã đơn hàng: {order.id}</strong>
                  <div className="small text-muted mt-1">
                    Ngày đặt: {formatDate(order.orderDate)}
                  </div>
                </div>

                <div className="d-flex align-items-center gap-2">
                  <Badge bg={getStatusVariant(order.status)}>
                    {order.status || 'Không xác định'}
                  </Badge>

                  {/* Only pending orders can be cancelled */}
                  {order.status === 'Pending' && (
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => handleOpenCancelModal(order)}
                    >
                      Hủy đơn hàng
                    </Button>
                  )}
                </div>
              </Card.Header>

              <Card.Body>
                <h6 className="fw-bold mb-3">Sản phẩm đã đặt</h6>

                {Array.isArray(order.items) && order.items.length > 0 ? (
                  order.items.map((item, index) => (
                    <div
                      key={`${order.id}-${item.bookId || index}`}
                      className="d-flex justify-content-between align-items-center border-bottom py-2 gap-3"
                    >
                      <div>
                        <div className="fw-semibold">
                          {item.title}
                        </div>
                        <small className="text-muted">
                          Số lượng: {item.quantity}
                        </small>
                      </div>

                      <span className="text-nowrap">
                        {formatPrice(
                          Number(item.price) * Number(item.quantity)
                        )}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-muted">
                    Không có thông tin sản phẩm.
                  </p>
                )}

                <div className="text-end mt-3">
                  <span className="text-muted me-2">
                    Tổng tiền:
                  </span>
                  <strong className="text-danger fs-5">
                    {formatPrice(order.totalAmount)}
                  </strong>
                </div>

                {/* Display cancellation reason (supports both customer cancel and admin reject) */}
                {order.status === 'Cancelled' && (order.cancelReason || order.cancellationReason) && (
                  <Alert variant="light" className="mt-3 mb-0 border">
                    <strong className="text-danger">
                      Lý do hủy đơn:
                    </strong>
                    <p className="mb-0 mt-1">
                      {order.cancelReason || order.cancellationReason}
                    </p>
                  </Alert>
                )}
              </Card.Body>
            </Card>
          ))}
        </>
      )}

      {/* Cancel Order Confirmation Modal */}
      <Modal
        show={showCancelModal}
        onHide={handleCloseCancelModal}
        centered
        backdrop={cancelLoading ? 'static' : true}
        keyboard={!cancelLoading}
      >
        <Form id="cancel-order-form" onSubmit={handleConfirmCancel}>
          <Modal.Header
            closeButton={!cancelLoading}
            closeVariant="white"
            className="bg-danger text-white"
          >
            <Modal.Title className="fw-bold">
              Xác nhận hủy đơn hàng
            </Modal.Title>
          </Modal.Header>

          <Modal.Body className="p-4">
            <p>Bạn có chắc chắn muốn hủy đơn hàng này không?</p>

            {selectedOrder && (
              <div className="mb-3">
                <strong>Mã đơn hàng:</strong>
                <span className="ms-2 text-danger fw-bold">
                  {selectedOrder.id}
                </span>
              </div>
            )}

            <Form.Group controlId="cancelReason">
              <Form.Label className="fw-semibold">
                Lý do hủy đơn hàng <span className="text-danger">*</span>
              </Form.Label>

              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Nhập lý do bạn muốn hủy đơn hàng..."
                value={cancelReason}
                onChange={(e) => {
                  setCancelReason(e.target.value);
                  setCancelFormError('');
                }}
                maxLength={500}
                disabled={cancelLoading}
              />

              <Form.Text className="text-muted">
                Tối đa 500 ký tự.
              </Form.Text>
            </Form.Group>

            {cancelFormError && (
              <Alert variant="danger" className="mt-3 mb-0 py-2">
                {cancelFormError}
              </Alert>
            )}

            <p className="text-muted small mt-3 mb-0">
              Sau khi xác nhận, đơn hàng sẽ được chuyển sang trạng thái
              đã hủy.
            </p>
          </Modal.Body>

          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={handleCloseCancelModal}
              disabled={cancelLoading}
            >
              Hủy
            </Button>

            <Button
              type="submit"
              variant="danger"
              disabled={cancelLoading || !cancelReason.trim()}
            >
              {cancelLoading ? (
                <>
                  <Spinner
                    animation="border"
                    size="sm"
                    className="me-2"
                  />
                  Đang xử lý...
                </>
              ) : (
                'Xác nhận hủy'
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
}

export default OrderHistoryPage;