import React, { useEffect, useState } from 'react';
import {
  Container, Row, Col, Spinner, Alert,
  Toast, ToastContainer, Form, InputGroup, Button
} from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBooks } from './bookSlice';
import { fetchCategories } from '../categories/categorySlice';
import BookCard from './BookCard';
import { addToCart } from '../cart/cartSlice';

const BookList = () => {
  const dispatch = useDispatch();
  const { books, booksLoading, booksError } = useSelector((state) => state.books);
  const { categories } = useSelector((state) => state.categories);

  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  useEffect(() => {
    dispatch(fetchBooks());
    dispatch(fetchCategories());
  }, [dispatch]);

  const handleAddToCart = (book) => {
    dispatch(addToCart({ book, quantity: 1 }));
    setToastMessage(`Đã thêm "${book.title}" vào giỏ hàng.`);
    setShowToast(true);
  };

  // Only display books that are not soft-deleted
  const activeBooks = (books || []).filter((book) => !book.isDeleted);

  // Search & Filter logic
  const filteredBooks = activeBooks.filter((book) => {
    const matchesSearch =
      searchTerm === '' ||
      book.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.author?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      selectedCategory === '' ||
      book.categoryId === selectedCategory ||
      book.categoryName === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <Container className="my-4">
      {/* Toast Notification when adding to cart */}
      <ToastContainer position="top-end" className="p-3" style={{ zIndex: 1080 }}>
        <Toast
          onClose={() => setShowToast(false)}
          show={showToast}
          delay={2500}
          autohide
          bg="success"
        >
          <Toast.Header>
            <strong className="me-auto text-success">🛒 Giỏ hàng BookStore</strong>
            <small>Vừa xong</small>
          </Toast.Header>
          <Toast.Body className="text-white small">{toastMessage}</Toast.Body>
        </Toast>
      </ToastContainer>

      {/* Hero / Header Section */}
      <div className="mb-4 pb-2 border-bottom">
        <h2 className="fw-bold text-dark mb-1">📚 Danh Mục Sách</h2>
        <p className="text-muted small mb-0">
          Khám phá các đầu sách mới nhất và nổi bật nhất tại BookStore
        </p>
      </div>

      {/* Search and Category Filter Toolbar */}
      <div className="bg-white p-3 p-md-4 rounded-3 mb-4 shadow-sm border">
        <Row className="g-3 align-items-center">
          {/* Search Box */}
          <Col xs={12} md={7} lg={8}>
            <InputGroup className="search-input-group">
              <InputGroup.Text className="bg-white border-end-0 text-muted ps-3">
                🔍
              </InputGroup.Text>
              <Form.Control
                type="text"
                className="border-start-0 border-end-0 ps-1 py-2 shadow-none"
                placeholder="Tìm kiếm theo tên sách hoặc tác giả..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm ? (
                <Button
                  variant="outline-secondary"
                  className="bg-white border-start-0 text-muted px-3"
                  onClick={() => setSearchTerm('')}
                  title="Xóa từ khóa tìm kiếm"
                  style={{ borderColor: '#dee2e6' }}
                >
                  ✕
                </Button>
              ) : (
                <InputGroup.Text className="bg-white border-start-0 pe-3"></InputGroup.Text>
              )}
            </InputGroup>
          </Col>

          {/* Category Filter & Reset */}
          <Col xs={12} md={5} lg={4}>
            <div className="d-flex gap-2">
              <Form.Select
                className="py-2 shadow-none border flex-grow-1"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="">📚 Tất cả thể loại</option>
                {categories?.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </Form.Select>

              {(searchTerm || selectedCategory) && (
                <Button
                  variant="outline-danger"
                  className="text-nowrap px-3 d-flex align-items-center gap-1 shadow-sm"
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('');
                  }}
                  title="Xóa tất cả bộ lọc"
                >
                  <span>✕</span>
                  <span className="d-none d-sm-inline">Xóa lọc</span>
                </Button>
              )}
            </div>
          </Col>
        </Row>
      </div>

      {/* Loading State */}
      {booksLoading && (
        <div className="text-center py-5 my-4">
          <Spinner animation="border" variant="primary" role="status" />
          <p className="mt-3 text-muted small">Đang tải danh sách sách, vui lòng chờ...</p>
        </div>
      )}

      {/* Error State */}
      {!booksLoading && booksError && (
        <Alert variant="danger" className="text-center py-4 my-4 shadow-sm">
          <div className="fs-3 mb-2">⚠️</div>
          <Alert.Heading className="fs-5 fw-bold">Không thể tải dữ liệu sách</Alert.Heading>
          <p className="small mb-3">{booksError}</p>
          <Button variant="danger" size="sm" onClick={() => dispatch(fetchBooks())}>
            Thử lại ngay
          </Button>
        </Alert>
      )}

      {/* Empty State */}
      {!booksLoading && !booksError && filteredBooks.length === 0 && (
        <Alert variant="info" className="text-center py-5 my-4 shadow-sm">
          <div className="fs-1 mb-2">📖</div>
          <Alert.Heading className="fs-5 fw-bold">Hiện chưa có cuốn sách nào</Alert.Heading>
          <p className="text-muted small mb-0">
            {searchTerm || selectedCategory
              ? 'Không tìm thấy cuốn sách nào phù hợp với bộ lọc của bạn.'
              : 'Cửa hàng hiện tại chưa có sản phẩm nào được bày bán. Vui lòng quay lại sau!'}
          </p>
        </Alert>
      )}

      {/* Display Grid State - Customer Public Catalog */}
      {!booksLoading && !booksError && filteredBooks.length > 0 && (
        <Row className="g-4">
          {filteredBooks.map((book) => (
            <Col key={book.id} xs={12} sm={6} md={4} lg={3}>
              <BookCard book={book} onAddToCart={handleAddToCart} />
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
};

export default BookList;
