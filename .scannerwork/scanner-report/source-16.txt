import React, { useEffect, useState } from 'react';
import {
  Container, Row, Col, Card, Table, Badge, Button, Spinner, Alert, Toast, ToastContainer, Modal, Form
} from 'react-bootstrap';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

/**
 * AdminOrderDetailPage
 * Dedicated page for admin to view full details of a specific customer order, approve or reject pending orders.
 */
const AdminOrderDetailPage = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Approve action state
  const [approving, setApproving] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastVariant, setToastVariant] = useState('success');
  const [showToast, setShowToast] = useState(false);

  // Reject action state
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejectError, setRejectError] = useState('');
  const [rejecting, setRejecting] = useState(false);

  useEffect(() => {
    const fetchOrderDetail = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get(`http://localhost:3001/orders/${orderId}`);
        setOrder(res.data);
      } catch (err) {
        setError('Không tìm thấy thông tin đơn hàng hoặc lỗi kết nối máy chủ API.');
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchOrderDetail();
    }
  }, [orderId]);

  // Handle Approve Order: Pending -> Delivered
  const handleApproveOrder = async () => {
    try {
      setApproving(true);
      const approvedAt = new Date().toISOString();
      await axios.patch(`http://localhost:3001/orders/${order.id}`, {
        status: 'Delivered',
        approvedAt: approvedAt,
      });

      // Update order state locally
      setOrder((prev) => ({
        ...prev,
        status: 'Delivered',
        approvedAt: approvedAt,
      }));

      setToastVariant('success');
      setToastMessage(`✓ Đã duyệt giao đơn hàng #${order.id} thành công!`);
      setShowToast(true);
    } catch (err) {
      setToastVariant('danger');
      setToastMessage('Không thể duyệt đơn hàng. Vui lòng thử lại!');
      setShowToast(true);
    } finally {
      setApproving(false);
    }
  };

  // Handle Reject Order: Pending -> Cancelled with mandatory reason
  const handleConfirmReject = async (e) => {
    e.preventDefault();
    const cleanReason = rejectionReason.trim();

    if (!cleanReason) {
      setRejectError('Vui lòng nhập lý do từ chối/hủy đơn hàng.');
      return;
    }

    if (cleanReason.length < 5) {
      setRejectError('Lý do hủy đơn cần chi tiết hơn (tối thiểu 5 ký tự).');
      return;
    }

    // Anti-XSS validation check
    if (/[<>{}]/.test(cleanReason)) {
      setRejectError('Lý do không được chứa ký tự đặc biệt nguy hiểm (<, >, {, }).');
      return;
    }

    try {
      setRejecting(true);
      setRejectError('');
      const cancelledAt = new Date().toISOString();
      await axios.patch(`http://localhost:3001/orders/${order.id}`, {
        status: 'Cancelled',
        cancellationReason: cleanReason,
        cancelledAt: cancelledAt,
      });

      // Update order state locally
      setOrder((prev) => ({
        ...prev,
        status: 'Cancelled',
        cancellationReason: cleanReason,
        cancelledAt: cancelledAt,
      }));

      setShowRejectModal(false);
      setRejectionReason('');
      setToastVariant('danger');
      setToastMessage(`❌ Đã từ chối đơn hàng #${order.id}!`);
      setShowToast(true);
    } catch (err) {
      setRejectError('Có lỗi xảy ra khi cập nhật từ chối đơn. Vui lòng thử lại!');
    } finally {
      setRejecting(false);
    }
  };

  const formatPrice = (price) => {
    return Number(price || 0).toLocaleString('vi-VN') + ' đ';
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Chưa cập nhật';
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? dateStr : d.toLocaleString('vi-VN');
  };

  if (loading) {
    return (
      <Container className="my-5 py-5 text-center">
        <Spinner animation="border" variant="primary" role="status" />
        <p className="mt-3 text-muted">Đang tải thông tin chi tiết đơn hàng #{orderId}...</p>
      </Container>
    );
  }

  if (error || !order) {
    return (
      <Container className="my-5">
        <Alert variant="danger" className="text-center py-4 shadow-sm">
          <div className="fs-3 mb-2">⚠️</div>
          <Alert.Heading className="fs-5 fw-bold">Không tìm thấy đơn hàng</Alert.Heading>
          <p className="small mb-3">{error || 'Đơn hàng không tồn tại trong hệ thống.'}</p>
          <Button as={Link} to="/admin/dashboard" variant="outline-danger" size="sm">
            ⬅️ Quay lại Bảng điều khiển
          </Button>
        </Alert>
      </Container>
    );
  }

  const isPending = order.status === 'Pending';
  const isDelivered = order.status === 'Delivered';
  const isCancelled = order.status === 'Cancelled' || order.status === 'Canceled';

  return (
    <Container className="my-4">
      {/* Top navigation & Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 pb-2 border-bottom gap-2">
        <div>
          <div className="mb-2">
            <Button
              as={Link}
              to="/admin/dashboard"
              variant="outline-secondary"
              size="sm"
              className="fw-semibold"
            >
              ⬅️ Quay lại Bảng điều khiển
            </Button>
          </div>
          <h2 className="fw-bold text-dark mb-1 d-flex flex-wrap align-items-center gap-2">
            <span>📦 Chi Tiết Đơn Hàng</span>
            <code>#{order.id}</code>
            <Badge
              bg={
                isDelivered
                  ? 'success'
                  : isPending
                  ? 'warning'
                  : isCancelled
                  ? 'danger'
                  : 'secondary'
              }
              className={isPending ? 'text-dark ms-2' : 'text-white ms-2'}
            >
              {order.status}
            </Badge>
          </h2>
          <p className="text-muted small mb-0">
            Xem toàn bộ thông tin người nhận, địa chỉ giao hàng và danh sách sách đã mua.
          </p>
        </div>

        {/* Actions: Từ chối & Duyệt giao hàng (Only shown when order is Pending) */}
        {isPending && (
          <div className="d-flex align-items-center gap-2">
            <Button
              variant="outline-danger"
              className="fw-semibold px-3 py-2 shadow-sm d-flex align-items-center gap-2"
              onClick={() => {
                setRejectError('');
                setRejectionReason('');
                setShowRejectModal(true);
              }}
              disabled={approving || rejecting}
              title="Từ chối đơn hàng kèm lý do"
            >
              <span>✕</span>
              <span>Từ chối đơn</span>
            </Button>
            <Button
              variant="success"
              className="fw-semibold px-3 py-2 shadow-sm d-flex align-items-center gap-2"
              onClick={handleApproveOrder}
              disabled={approving || rejecting}
              title="Duyệt đơn hàng và chuyển sang trạng thái Đã giao (Delivered)"
            >
              {approving ? (
                <>
                  <Spinner as="span" animation="border" size="sm" role="status" />
                  <span>Đang xử lý duyệt...</span>
                </>
              ) : (
                <>
                  <span>✓</span>
                  <span>Duyệt giao hàng</span>
                </>
              )}
            </Button>
          </div>
        )}
      </div>

      {/* 2 Information Cards: Customer & Payment */}
      <Row className="g-3 mb-4">
        {/* Customer Information */}
        <Col md={6}>
          <Card className="shadow-sm border h-100">
            <Card.Header className="bg-light fw-bold py-2 d-flex align-items-center gap-2">
              <span>👤</span>
              <span>Thông Tin Người Nhận</span>
            </Card.Header>
            <Card.Body className="small">
              <div className="mb-2">
                <span className="text-muted">Họ và tên:</span>{' '}
                <strong className="fs-6 text-dark">{order.customerName || 'Khách vãng lai'}</strong>
              </div>
              <div className="mb-2">
                <span className="text-muted">Số điện thoại:</span>{' '}
                <strong>{order.phone || 'Chưa cung cấp'}</strong>
              </div>
              <div className="mb-2">
                <span className="text-muted">Địa chỉ nhận hàng:</span>{' '}
                <span>{order.address || 'Chưa cung cấp'}</span>
              </div>
              {order.note && (
                <div className="mt-2 pt-2 border-top text-muted fst-italic">
                  <span>Ghi chú từ khách:</span> "{order.note}"
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* Order & Payment Information */}
        <Col md={6}>
          <Card className="shadow-sm border h-100">
            <Card.Header className="bg-light fw-bold py-2 d-flex align-items-center gap-2">
              <span>💳</span>
              <span>Thanh Toán & Vận Chuyển</span>
            </Card.Header>
            <Card.Body className="small">
              <div className="mb-2">
                <span className="text-muted">Mã đơn hàng:</span>{' '}
                <code>{order.id}</code>
              </div>
              <div className="mb-2">
                <span className="text-muted">Thời gian đặt hàng:</span>{' '}
                <strong>{formatDate(order.orderDate)}</strong>
              </div>
              <div className="mb-2">
                <span className="text-muted">Phương thức thanh toán:</span>{' '}
                <Badge bg="info" className="text-dark">
                  {order.paymentMethod === 'banking'
                    ? 'Chuyển khoản ngân hàng'
                    : 'Thanh toán khi nhận hàng (COD)'}
                </Badge>
              </div>

              {isDelivered && order.approvedAt && (
                <div className="mt-2 pt-2 border-top text-success">
                  ✓ Thời gian duyệt giao: <strong>{formatDate(order.approvedAt)}</strong>
                </div>
              )}

              {isCancelled && order.cancellationReason && (
                <div className="mt-2 p-2 bg-danger-subtle text-danger rounded border border-danger-subtle">
                  <strong>Lý do hủy đơn:</strong> {order.cancellationReason}
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Ordered Books Table Card */}
      <Card className="shadow-sm border mb-4">
        <Card.Header className="bg-light fw-bold py-3 d-flex justify-content-between align-items-center">
          <span className="d-flex align-items-center gap-2">
            <span>📚</span>
            <span>Danh Sách Sách Đặt Mua</span>
          </span>
          <Badge bg="primary">
            {order.items?.length || 0} sản phẩm
          </Badge>
        </Card.Header>

        <div className="table-responsive">
          <Table hover className="align-middle text-center mb-0">
            <thead className="table-light text-nowrap small text-uppercase">
              <tr>
                <th className="text-start">Tên Sách</th>
                <th>Đơn Giá</th>
                <th>Số Lượng</th>
                <th className="text-end">Thành Tiền</th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(order.items) && order.items.length > 0 ? (
                order.items.map((item, index) => {
                  const itemPrice = Number(item.price) || 0;
                  const itemQty = Number(item.quantity) || 1;
                  return (
                    <tr key={item.bookId || index}>
                      <td className="text-start fw-semibold">{item.title}</td>
                      <td>{formatPrice(itemPrice)}</td>
                      <td>
                        <Badge bg="light" text="dark" className="border px-2">
                          {itemQty}
                        </Badge>
                      </td>
                      <td className="text-end fw-bold">{formatPrice(itemPrice * itemQty)}</td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="4" className="text-muted py-4">
                    Không có thông tin chi tiết các món trong đơn hàng.
                  </td>
                </tr>
              )}
            </tbody>
            <tfoot className="table-light">
              <tr>
                <td colSpan="3" className="text-end fw-bold fs-6">
                  Tổng Cộng Thanh Toán:
                </td>
                <td className="text-end fw-bold text-danger fs-5">
                  {formatPrice(order.totalAmount)}
                </td>
              </tr>
            </tfoot>
          </Table>
        </div>
      </Card>

      {/* Reject Order Confirmation Modal */}
      <Modal
        show={showRejectModal}
        onHide={() => {
          if (!rejecting) {
            setShowRejectModal(false);
            setRejectError('');
            setRejectionReason('');
          }
        }}
        centered
        backdrop="static"
      >
        <Modal.Header closeButton={!rejecting} className="bg-light">
          <Modal.Title className="fs-5 text-danger fw-bold d-flex align-items-center gap-2">
            <span>❌</span>
            <span>Từ Chối Đơn Hàng #{order.id}</span>
          </Modal.Title>
        </Modal.Header>

        <Form onSubmit={handleConfirmReject}>
          <Modal.Body>
            <div className="mb-3 small text-muted">
              Khách hàng: <strong>{order.customerName || 'Khách vãng lai'}</strong>
              <br />
              Lý do này sẽ được lưu trữ và hiển thị cho khách hàng xem trong lịch sử đơn hàng.
            </div>

            {rejectError && (
              <Alert variant="danger" className="py-2 small">
                {rejectError}
              </Alert>
            )}

            <Form.Group className="mb-2">
              <Form.Label className="fw-semibold small">
                Lý do từ chối đơn hàng <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Ví dụ: Tạm thời hết sách trong kho; Không liên hệ được số điện thoại nhận hàng..."
                value={rejectionReason}
                onChange={(e) => {
                  setRejectionReason(e.target.value);
                  if (rejectError) setRejectError('');
                }}
                disabled={rejecting}
                autoFocus
              />
              <Form.Text className="text-muted small">
                Tối thiểu 5 ký tự. Vui lòng nêu rõ lý do để thông báo cho khách.
              </Form.Text>
            </Form.Group>
          </Modal.Body>

          <Modal.Footer className="bg-light">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setShowRejectModal(false);
                setRejectError('');
                setRejectionReason('');
              }}
              disabled={rejecting}
            >
              Hủy bỏ
            </Button>
            <Button
              variant="danger"
              size="sm"
              type="submit"
              disabled={rejecting}
              className="fw-semibold"
            >
              {rejecting ? (
                <>
                  <Spinner as="span" animation="border" size="sm" role="status" className="me-1" />
                  Đang xử lý...
                </>
              ) : (
                'Xác nhận từ chối'
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Toast Feedback Notification */}
      <ToastContainer position="top-end" className="p-3" style={{ zIndex: 1080 }}>
        <Toast
          onClose={() => setShowToast(false)}
          show={showToast}
          delay={3500}
          autohide
          bg={toastVariant === 'danger' ? 'danger' : 'success'}
        >
          <Toast.Header>
            <strong className="me-auto text-dark">📦 Quản Trị Đơn Hàng</strong>
            <small className="text-muted">Vừa xong</small>
          </Toast.Header>
          <Toast.Body className="text-white small fw-semibold">
            {toastMessage}
          </Toast.Body>
        </Toast>
      </ToastContainer>
    </Container>
  );
};

export default AdminOrderDetailPage;

