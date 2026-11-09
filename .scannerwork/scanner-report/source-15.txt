import React, { useEffect, useState } from 'react';
import {
  Container, Row, Col, Card, Table, Badge, Button, Spinner, Alert
} from 'react-bootstrap';
import { Link } from 'react-router-dom';
import axios from 'axios';

const AdminDashboardPage = () => {
  const [orders, setOrders] = useState([]);
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [ordersRes, booksRes, catRes] = await Promise.all([
        axios.get('http://localhost:3001/orders'),
        axios.get('http://localhost:3001/books'),
        axios.get('http://localhost:3001/categories'),
      ]);
      setOrders(ordersRes.data || []);
      setBooks(booksRes.data || []);
      setCategories(catRes.data || []);
      setLoading(false);
    } catch (err) {
      setError('Không thể kết nối đến máy chủ API JSON Server (cổng 3001).');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Compute metrics
  const activeBooks = books.filter((b) => !b.isDeleted);
  const outOfStockBooks = activeBooks.filter((b) => Number(b.stock) <= 0);
  const pendingOrders = orders.filter((o) => o.status === 'Pending');
  const deliveredOrders = orders.filter((o) => o.status === 'Delivered');
  const cancelledOrders = orders.filter(
    (o) => o.status === 'Cancelled' || o.status === 'Canceled'
  );

  // Filter orders by active status tab
  const filteredOrders = orders.filter((o) => {
    if (selectedStatus === 'ALL') return true;
    if (selectedStatus === 'Cancelled') {
      return o.status === 'Cancelled' || o.status === 'Canceled';
    }
    return o.status === selectedStatus;
  });

  // Total revenue is calculated only from delivered/completed orders
  const totalRevenue = deliveredOrders.reduce(
    (sum, o) => sum + (Number(o.totalAmount) || 0),
    0
  );

  const formatPrice = (price) => {
    return Number(price || 0).toLocaleString('vi-VN') + ' đ';
  };

  return (
    <Container className="my-4">
      {/* Page Title & Subtitle */}
      <div className="mb-4 pb-2 border-bottom">
        <h2 className="fw-bold text-dark mb-1">📊 Bảng Điều Khiển Quản Trị (Admin Dashboard)</h2>
        <p className="text-muted small mb-0">
          Tổng quan hiệu suất bán hàng, trạng thái kho sách và quản lý vận hành BookStore.
        </p>
      </div>

      {loading && (
        <div className="text-center py-5 my-4">
          <Spinner animation="border" variant="primary" role="status" />
          <p className="mt-3 text-muted small">Đang tổng hợp dữ liệu báo cáo...</p>
        </div>
      )}

      {error && (
        <Alert variant="danger" className="text-center py-4 my-4 shadow-sm">
          <div className="fs-3 mb-2">⚠️</div>
          <Alert.Heading className="fs-5 fw-bold">Lỗi tải dữ liệu Dashboard</Alert.Heading>
          <p className="small mb-3">{error}</p>
          <Button variant="danger" size="sm" onClick={fetchData}>
            Thử lại ngay
          </Button>
        </Alert>
      )}

      {!loading && !error && (
        <>
          {/* 4 Metric / KPI Cards */}
          <Row className="g-3 mb-4">
            {/* Metric 1: Revenue */}
            <Col xs={12} sm={6} lg={3}>
              <Card className="shadow-sm border-0 bg-primary text-white h-100">
                <Card.Body className="p-3">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="small text-uppercase fw-semibold text-white-50">Tổng doanh thu</span>
                    <span className="fs-4">💰</span>
                  </div>
                  <h3 className="fw-bold mb-1">{formatPrice(totalRevenue)}</h3>
                  <small className="text-white-50">
                    Từ <strong>{deliveredOrders.length}</strong> đơn hoàn thành
                  </small>
                </Card.Body>
              </Card>
            </Col>

            {/* Metric 2: Orders */}
            <Col xs={12} sm={6} lg={3}>
              <Card
                className="shadow-sm border-0 bg-warning text-dark h-100"
                style={{ cursor: 'pointer' }}
                onClick={() => setSelectedStatus('Pending')}
                title="Bấm để lọc nhanh các đơn chờ duyệt"
              >
                <Card.Body className="p-3">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="small text-uppercase fw-semibold text-dark-50">Tổng đơn hàng</span>
                    <span className="fs-4">📦</span>
                  </div>
                  <h3 className="fw-bold mb-1">{orders.length}</h3>
                  <div className="d-flex gap-1 align-items-center">
                    <Badge bg="danger" className="text-white">
                      {pendingOrders.length} đơn chờ duyệt
                    </Badge>
                  </div>
                </Card.Body>
              </Card>
            </Col>

            {/* Metric 3: Books */}
            <Col xs={12} sm={6} lg={3}>
              <Card className="shadow-sm border-0 bg-success text-white h-100">
                <Card.Body className="p-3">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="small text-uppercase fw-semibold text-white-50">Sách trong kho</span>
                    <span className="fs-4">📚</span>
                  </div>
                  <h3 className="fw-bold mb-1">{activeBooks.length}</h3>
                  <small className="text-white-50">
                    {outOfStockBooks.length > 0 ? (
                      <Badge bg="light" text="danger">
                        {outOfStockBooks.length} cuốn hết hàng
                      </Badge>
                    ) : (
                      'Tất cả sách còn hàng'
                    )}
                  </small>
                </Card.Body>
              </Card>
            </Col>

            {/* Metric 4: Categories */}
            <Col xs={12} sm={6} lg={3}>
              <Card className="shadow-sm border-0 bg-dark text-white h-100">
                <Card.Body className="p-3">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="small text-uppercase fw-semibold text-white-50">Danh mục thể loại</span>
                    <span className="fs-4">🏷️</span>
                  </div>
                  <h3 className="fw-bold mb-1">{categories.filter((c) => !c.isDeleted).length}</h3>
                  <small className="text-white-50">Phân loại sách kinh doanh</small>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Recent Orders Section */}
          <Card className="shadow-sm border">
            <Card.Header className="bg-white py-3">
              <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-2">
                <h5 className="mb-0 fw-bold text-dark d-flex align-items-center gap-2">
                  <span>📋</span>
                  <span>Danh Sách Đơn Hàng Gần Đây</span>
                </h5>
                <Badge bg="secondary" className="px-2 py-1">
                  Hiển thị: {filteredOrders.length} / {orders.length} đơn
                </Badge>
              </div>

              {/* Order Status Filter Tabs */}
              <div className="d-flex flex-wrap gap-2 pt-2 border-top">
                <Button
                  variant={selectedStatus === 'ALL' ? 'primary' : 'outline-secondary'}
                  size="sm"
                  className="rounded-pill px-3 fw-semibold"
                  onClick={() => setSelectedStatus('ALL')}
                >
                  Tất cả ({orders.length})
                </Button>
                <Button
                  variant={selectedStatus === 'Pending' ? 'warning' : 'outline-warning'}
                  size="sm"
                  className={`rounded-pill px-3 fw-semibold ${selectedStatus === 'Pending' ? 'text-dark' : ''}`}
                  onClick={() => setSelectedStatus('Pending')}
                >
                  ⏳ Chờ duyệt ({pendingOrders.length})
                </Button>
                <Button
                  variant={selectedStatus === 'Delivered' ? 'success' : 'outline-success'}
                  size="sm"
                  className="rounded-pill px-3 fw-semibold"
                  onClick={() => setSelectedStatus('Delivered')}
                >
                  ✅ Đã giao ({deliveredOrders.length})
                </Button>
                <Button
                  variant={selectedStatus === 'Cancelled' ? 'danger' : 'outline-danger'}
                  size="sm"
                  className="rounded-pill px-3 fw-semibold"
                  onClick={() => setSelectedStatus('Cancelled')}
                >
                  ❌ Đã hủy ({cancelledOrders.length})
                </Button>
              </div>
            </Card.Header>

            <div className="table-responsive">
              <Table hover className="align-middle text-center mb-0">
                <thead className="table-light text-nowrap small text-uppercase">
                  <tr>
                    <th>Mã Đơn</th>
                    <th className="text-start">Khách Hàng</th>
                    <th>Số Điện Thoại</th>
                    <th>Ngày Đặt</th>
                    <th>Số Món</th>
                    <th>Tổng Tiền</th>
                    <th>Trạng Thái</th>
                    <th>Thao Tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="py-5 text-muted text-center">
                        <div className="fs-3 mb-2">📭</div>
                        <div className="fw-semibold">Không có đơn hàng nào ở trạng thái này.</div>
                        <small className="text-secondary">
                          {selectedStatus === 'ALL'
                            ? 'Hệ thống chưa có đơn hàng nào.'
                            : 'Thử chuyển sang tab trạng thái khác.'}
                        </small>
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map((order) => {
                      const isPending = order.status === 'Pending';
                      const isDelivered = order.status === 'Delivered';
                      const isCancelled = order.status === 'Cancelled';

                      return (
                        <tr key={order.id}>
                          <td><code>{order.id}</code></td>
                          <td className="text-start fw-semibold">{order.customerName || 'Khách vãng lai'}</td>
                          <td className="small text-muted">{order.phone || 'Chưa có'}</td>
                          <td className="small text-muted">
                            {order.orderDate
                              ? new Date(order.orderDate).toLocaleDateString('vi-VN')
                              : 'Chưa cập nhật'}
                          </td>
                          <td>
                            <Badge bg="light" text="dark" className="border">
                              {order.items?.length || 0} món
                            </Badge>
                          </td>
                          <td className="fw-bold text-danger">{formatPrice(order.totalAmount)}</td>
                          <td>
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
                              className={isPending ? 'text-dark' : 'text-white'}
                            >
                              {order.status}
                            </Badge>
                          </td>
                          <td>
                            <Link
                              to={`/admin/orders/${order.id}`}
                              className="btn btn-outline-primary btn-sm fw-semibold d-inline-flex align-items-center gap-1"
                              title="Xem chi tiết đơn hàng"
                            >
                              <span>👁️</span>
                              <span>Chi tiết</span>
                            </Link>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </Table>
            </div>
          </Card>
        </>
      )}
    </Container>
  );
};

export default AdminDashboardPage;

