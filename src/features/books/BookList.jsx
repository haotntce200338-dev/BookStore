
import React, { useEffect, useState } from 'react';
import {
  Container,
  Row,
  Col,
  Table,
  Spinner,
  Alert,
  Button,
  Badge,
  Toast,
  ToastContainer,
} from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBooks } from './bookSlice';
import BookCard from './BookCard';

const BookList = ({ mode = 'catalog' }) => {
  const dispatch = useDispatch();

  // Read books state from the existing Redux store.
  const { books, booksLoading, booksError } = useSelector(
    (state) => state.books
  );

  // Determine which interface should be displayed.
  const isAdmin = mode === 'admin';

  // Interaction feedback toast when clicking Add to Cart.
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);

  // Fetch books from API when the component is mounted.
  useEffect(() => {
    dispatch(fetchBooks());
  }, [dispatch]);

  // Handle Add to Cart action.
  const handleAddToCart = (book) => {
    setToastMessage(`Đã thêm "${book.title}" vào giỏ hàng.`);
    setShowToast(true);
  };

  // Exclude books marked as deleted.
  const activeBooks = (books || []).filter(
    (book) => !book.isDeleted
  );

  // Format price in Vietnamese currency.
  const formatPrice = (price) => {
    const value = Number(price);

    if (!Number.isFinite(value)) {
      return 'Chưa cập nhật';
    }

    return value.toLocaleString('vi-VN') + ' VNĐ';
  };

  // Display category information.
  const getCategory = (book) => {
    return (
      book.category?.name ||
      book.categoryName ||
      book.categoryId ||
      'Chưa phân loại'
    );
  };

  return (
    <Container className="my-4">

      {/* Customer: Add to Cart notification */}
      {!isAdmin && (
        <ToastContainer
          position="top-end"
          className="p-3"
          style={{ zIndex: 1080 }}
        >
          <Toast
            onClose={() => setShowToast(false)}
            show={showToast}
            delay={2500}
            autohide
            bg="success"
          >
            <Toast.Header>
              <strong className="me-auto text-success">
                🛒 Giỏ hàng BookStore
              </strong>
              <small>Vừa xong</small>
            </Toast.Header>

            <Toast.Body className="text-white small">
              {toastMessage}
            </Toast.Body>
          </Toast>
        </ToastContainer>
      )}

      {/* Page Header */}
      <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom">
        <div>
          {isAdmin ? (
            <>
              <h2 className="fw-bold text-dark mb-1">
                📚 Quản Lý Danh Sách Sách
              </h2>

              <p className="text-muted small mb-0">
                Xem thông tin và số lượng sách hiện có trong cửa hàng.
              </p>
            </>
          ) : (
            <>
              <h2 className="fw-bold text-dark mb-1">
                📚 Danh Mục Sách
              </h2>

              <p className="text-muted small mb-0">
                Khám phá các đầu sách mới nhất và nổi bật nhất tại BookStore
              </p>
            </>
          )}
        </div>

        {!booksLoading && !booksError && (
          <span className="badge bg-light text-dark border px-3 py-2">
            Tổng cộng: <strong>{isAdmin ? activeBooks.length : books.length}</strong> cuốn sách
          </span>
        )}
      </div>

      {/* 1. Loading State */}
      {booksLoading && (
        <div className="text-center py-5 my-4">
          <Spinner
            animation="border"
            variant="primary"
            role="status"
          />

          <p className="mt-3 text-muted small">
            Đang tải danh sách sách, vui lòng chờ...
          </p>
        </div>
      )}

      {/* 2. Error State */}
      {!booksLoading && booksError && (
        <Alert
          variant="danger"
          className="text-center py-4 my-4 shadow-sm"
        >
          <div className="fs-3 mb-2">⚠️</div>

          <Alert.Heading className="fs-5 fw-bold">
            Không thể tải dữ liệu sách
          </Alert.Heading>

          <p className="small mb-3">{booksError}</p>

          <Button
            variant="danger"
            size="sm"
            onClick={() => dispatch(fetchBooks())}
          >
            Thử lại ngay
          </Button>
        </Alert>
      )}

      {/* 3. Empty State */}
      {!booksLoading &&
        !booksError &&
        (isAdmin ? activeBooks.length === 0 : books.length === 0) && (
          <Alert
            variant="info"
            className="text-center py-5 my-4 shadow-sm"
          >
            <div className="fs-1 mb-2">📖</div>

            <Alert.Heading className="fs-5 fw-bold">
              {isAdmin
                ? 'Không có sách trong danh sách quản lý'
                : 'Hiện chưa có cuốn sách nào'}
            </Alert.Heading>

            <p className="text-muted small mb-0">
              {isAdmin
                ? 'Hiện tại hệ thống chưa có dữ liệu sách để hiển thị.'
                : 'Cửa hàng hiện tại chưa có sản phẩm nào được bày bán. Vui lòng quay lại sau!'}
            </p>
          </Alert>
        )}

      {/* 4. Admin: Display Books Table */}
      {!booksLoading &&
        !booksError &&
        isAdmin &&
        activeBooks.length > 0 && (
          <Table
            striped
            bordered
            hover
            responsive
            className="align-middle text-center"
          >
            <thead className="table-dark">
              <tr>
                <th>Mã sách</th>
                <th>Hình ảnh</th>
                <th>Tên sách</th>
                <th>Tác giả</th>
                <th>Danh mục</th>
                <th>Giá bán</th>
                <th>Số lượng tồn kho</th>
                <th>Trạng thái</th>
              </tr>
            </thead>

            <tbody>
              {activeBooks.map((book) => {
                const stock = Number(book.stock);

                return (
                  <tr key={book.id}>

                    {/* Book ID */}
                    <td>{book.id}</td>

                    {/* Book Image */}
                    <td>
                      {book.image ? (
                        <img
                          src={book.image}
                          alt={book.title}
                          width="50"
                          height="65"
                          style={{ objectFit: 'cover' }}
                        />
                      ) : (
                        <span className="text-muted">
                          Không có ảnh
                        </span>
                      )}
                    </td>

                    {/* Book Name */}
                    <td className="fw-semibold text-start">
                      {book.title || 'Chưa cập nhật'}
                    </td>

                    {/* Author */}
                    <td>{book.author || 'Chưa cập nhật'}</td>

                    {/* Category */}
                    <td>{getCategory(book)}</td>

                    {/* Price */}
                    <td>{formatPrice(book.price)}</td>

                    {/* Stock Quantity */}
                    <td>
                      {Number.isFinite(stock)
                        ? stock
                        : 'Chưa cập nhật'}
                    </td>

                    {/* Stock Status */}
                    <td>
                      <Badge
                        bg={
                          !Number.isFinite(stock)
                            ? 'secondary'
                            : stock > 0
                              ? 'success'
                              : 'danger'
                        }
                      >
                        {!Number.isFinite(stock)
                          ? 'Chưa cập nhật'
                          : stock > 0
                            ? 'Còn hàng'
                            : 'Hết hàng'}
                      </Badge>
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </Table>
        )}

      {/* 5. Customer: Keep the existing Books Catalog */}
      {!booksLoading && !booksError && !isAdmin && books.length > 0 && (
          <Row className="g-4">
            {books.map((book) => (
              <Col key={book.id} xs={12} sm={6}md={4}lg={3}>
                <BookCard
                  book={book}  onAddToCart={handleAddToCart} />
              </Col>
            ))}
          </Row>
        )}

    </Container>
  );
};

export default BookList;
