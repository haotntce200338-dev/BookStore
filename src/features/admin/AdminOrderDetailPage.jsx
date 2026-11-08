import React, { useEffect, useState } from 'react';
import {
  Container, Row, Col, Card, Table, Badge, Button, Spinner, Alert
} from 'react-bootstrap';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

/**
 * AdminOrderDetailPage
 * Dedicated page for admin to view full details of a specific customer order.
 */
const AdminOrderDetailPage = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
    </Container>
  );
};

export default AdminOrderDetailPage;

