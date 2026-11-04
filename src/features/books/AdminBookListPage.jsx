import React, { useEffect, useState } from 'react';
import {
  Container, Table, Spinner, Alert,
  Button, Badge, Form, InputGroup, Modal
} from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBooks } from './bookSlice';
import BookFormModal from './BookFormModal';
import axios from 'axios';

const AdminBookListPage = () => {
  const dispatch = useDispatch();
  const { books, booksLoading, booksError } = useSelector((state) => state.books);
  const { categories } = useSelector((state) => state.categories);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createSuccess, setCreateSuccess] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  // Delete modal state
  const [bookToDelete, setBookToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  // Edit modal state (Update Book Details - Admin)
  const [bookToEdit, setBookToEdit] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);

  useEffect(() => {
    dispatch(fetchBooks());
  }, [dispatch]);

  const handleCreateSuccess = () => {
    setCreateSuccess(true);
    dispatch(fetchBooks());
  };

  // Handlers for Update Book Details
  const handleEditBook = (book) => {
    setBookToEdit(book);
    setUpdateSuccess(false);
    setShowEditModal(true);
  };

  const handleUpdateSuccess = (updatedBook) => {
    setUpdateSuccess(true);
    setShowEditModal(false);
    setBookToEdit(null);
    dispatch(fetchBooks());
  };

  const activeBooks = (books || []).filter((book) => !book.isDeleted);

  // Filter books based on search term and selected category
  const filteredBooks = activeBooks.filter((book) => {
    const matchesSearch =
      searchTerm === '' ||
      book.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.author?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.id?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      selectedCategory === '' ||
      book.categoryId === selectedCategory ||
      book.categoryName === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const formatPrice = (price) => {
    if (price === null || price === undefined || price === '') {
      return 'Chưa cập nhật';
    }
    const value = Number(price);
    return Number.isFinite(value)
      ? value.toLocaleString('vi-VN') + ' đ'
      : 'Chưa cập nhật';
  };

  const getCategoryName = (book) => {
    if (book.category?.name) return book.category.name;
    if (book.categoryName) return book.categoryName;
    const found = categories?.find((c) => c.id === book.categoryId);
    return found ? found.name : book.categoryId || 'Chưa phân loại';
  };

  // Handle Soft Delete
  const handleConfirmDelete = async () => {
    if (!bookToDelete) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await axios.patch(`http://localhost:3001/books/${bookToDelete.id}`, {
        isDeleted: true,
      });
      setDeleting(false);
      setBookToDelete(null);
      dispatch(fetchBooks());
    } catch (err) {
      setDeleting(false);
      setDeleteError('Có lỗi xảy ra khi xóa sách. Vui lòng thử lại.');
    }
  };

  return (
    <Container className="my-4">
      {/* Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 pb-2 border-bottom gap-2">
        <div>
          <h2 className="fw-bold text-dark mb-1">📚 Quản Lý Kho Sách (Admin)</h2>
          <p className="text-muted small mb-0">
            Xem, thêm mới, cập nhật giá tồn kho và quản trị toàn bộ sách trong hệ thống.
          </p>
        </div>

        <div className="d-flex align-items-center gap-2">
          {!booksLoading && !booksError && (
            <span className="badge bg-light text-dark border px-3 py-2">
              Tổng kho: <strong>{activeBooks.length}</strong> cuốn sách
            </span>
          )}
          <Button
            variant="primary"
            onClick={() => {
              setCreateSuccess(false);
              setShowCreateModal(true);
            }}
          >
            + Thêm sách mới
          </Button>
        </div>
      </div>

      {createSuccess && (
        <Alert variant="success" dismissible onClose={() => setCreateSuccess(false)}>
          Thêm sách mới vào kho thành công!
        </Alert>
      )}

      {/* Update Success Alert */}
      {updateSuccess && (
        <Alert variant="success" dismissible onClose={() => setUpdateSuccess(false)}>
          Cập nhật thông tin sách thành công!
        </Alert>
      )}

      {/* Filter & Search Bar */}
      <div className="bg-light p-3 rounded mb-4 border">
        <div className="row g-3">
          <div className="col-12 col-md-6 col-lg-5">
            <InputGroup>
              <InputGroup.Text>🔍</InputGroup.Text>
              <Form.Control
                type="text"
                placeholder="Tìm kiếm theo tên sách, tác giả, mã sách..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </InputGroup>
          </div>
          <div className="col-12 col-md-4 col-lg-4">
            <Form.Select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="">-- Tất cả thể loại --</option>
              {categories?.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </Form.Select>
          </div>
          <div className="col-12 col-md-2 col-lg-3 text-md-end">
            {(searchTerm || selectedCategory) && (
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('');
                }}
              >
                Xóa bộ lọc
              </Button>
            )}
          </div>
        </div>
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
          <Alert.Heading className="fs-5 fw-bold">
            Không tìm thấy cuốn sách nào
          </Alert.Heading>
          <p className="text-muted small mb-0">
            {searchTerm || selectedCategory
              ? 'Không có sách nào khớp với từ khóa hoặc thể loại bạn chọn.'
              : 'Hiện tại hệ thống chưa có cuốn sách nào trong kho.'}
          </p>
        </Alert>
      )}

      {/* Admin Books Table */}
      {!booksLoading && !booksError && filteredBooks.length > 0 && (
        <div className="table-responsive shadow-sm border rounded">
          <Table striped hover className="align-middle text-center mb-0">
            <thead className="table-dark text-nowrap">
              <tr>
                <th>Mã sách</th>
                <th>Hình ảnh</th>
                <th className="text-start">Tên sách</th>
                <th>Tác giả</th>
                <th>Thể loại</th>
                <th>Giá gốc</th>
                <th>Giá bán</th>
                <th>Tồn kho</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredBooks.map((book) => {
                const stock = Number(book.stock);
                const validStock =
                  book.stock !== null &&
                  book.stock !== undefined &&
                  book.stock !== '' &&
                  Number.isFinite(stock);

                return (
                  <tr key={book.id}>
                    <td><code>{book.bookCode || book.id}</code></td>
                    <td>
                      {book.image ? (
                        <img
                          src={book.image}
                          alt={book.title}
                          width="45"
                          height="60"
                          className="rounded border"
                          style={{ objectFit: 'cover' }}
                        />
                      ) : (
                        <span className="text-muted small">Không có</span>
                      )}
                    </td>
                    <td className="fw-semibold text-start" style={{ maxWidth: '240px' }}>
                      <span className="text-truncate d-block" title={book.title}>
                        {book.title || 'Chưa cập nhật'}
                      </span>
                    </td>
                    <td className="small text-muted">{book.author || 'Chưa cập nhật'}</td>
                    <td>
                      <Badge bg="light" text="dark" className="border">
                        {getCategoryName(book)}
                      </Badge>
                    </td>
                    <td className="text-muted small">
                      {book.originalPrice ? formatPrice(book.originalPrice) : '-'}
                    </td>
                    <td className="fw-bold text-danger">{formatPrice(book.price)}</td>
                    <td>
                      <strong>{validStock ? stock : 0}</strong>
                    </td>
                    <td>
                      <Badge bg={!validStock || stock <= 0 ? 'danger' : stock <= 10 ? 'warning' : 'success'}>
                        {!validStock || stock <= 0 ? 'Hết hàng' : stock <= 10 ? 'Sắp hết' : 'Còn hàng'}
                      </Badge>
                    </td>
                    <td>
                      <div className="d-flex justify-content-center gap-1">
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={() => handleEditBook(book)}
                          title="Chỉnh sửa thông tin sách"
                        >
                          ✏️ Sửa
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => setBookToDelete(book)}
                          title="Xóa mềm sách"
                        >
                          🗑️
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </div>
      )}

      {/* Create New Book Modal */}
      <BookFormModal
        show={showCreateModal}
        onHide={() => setShowCreateModal(false)}
        onSuccess={handleCreateSuccess}
      />

      {/* Update Book Details Modal */}
      <BookFormModal
        show={showEditModal}
        onHide={() => {
          setShowEditModal(false);
          setBookToEdit(null);
        }}
        onSuccess={handleUpdateSuccess}
        bookToEdit={bookToEdit}
      />

      {/* Delete Confirmation Modal */}
      <Modal show={!!bookToDelete} onHide={() => setBookToDelete(null)} centered>
        <Modal.Header closeButton className="bg-danger text-white">
          <Modal.Title className="h6 mb-0">⚠️ Xác nhận xóa sách</Modal.Title>
        </Modal.Header>
        <Modal.Body className="py-4">
          <p className="mb-2">
            Bạn có chắc chắn muốn xóa cuốn sách sau khỏi kho sách hiển thị không?
          </p>
          <div className="p-3 bg-light rounded border">
            <h6 className="fw-bold text-dark mb-1">{bookToDelete?.title}</h6>
            <div className="text-muted small">Mã: {bookToDelete?.id} | Tác giả: {bookToDelete?.author}</div>
          </div>
          <small className="text-muted d-block mt-2">
            * Thao tác này sẽ xóa mềm sách (đánh dấu <code>isDeleted: true</code>) để bảo toàn lịch sử đơn hàng cũ.
          </small>
          {deleteError && <Alert variant="danger" className="mt-3 mb-0 small">{deleteError}</Alert>}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" size="sm" onClick={() => setBookToDelete(null)} disabled={deleting}>
            Hủy bỏ
          </Button>
          <Button variant="danger" size="sm" onClick={handleConfirmDelete} disabled={deleting}>
            {deleting ? 'Đang xóa...' : 'Xác nhận xóa'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default AdminBookListPage;
