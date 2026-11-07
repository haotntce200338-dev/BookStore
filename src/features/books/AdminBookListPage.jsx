import React, { useEffect, useState } from 'react';
import {
  Container, Table, Spinner, Alert, Button,
  Badge, Form, InputGroup, Modal,
} from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBooks } from './bookSlice';
import { fetchCategories } from '../categories/categorySlice';
import BookFormModal from './BookFormModal';
import axios from 'axios';

const API_URL = 'http://localhost:3001/books';
const NO_COVER = 'https://placehold.co/100x140?text=No+Cover';

const AdminBookListPage = () => {
  const dispatch = useDispatch();
  const { books, booksLoading, booksError } = useSelector((state) => state.books);
  const categories = useSelector((state) => state.categories?.categories || []);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [bookToEdit, setBookToEdit] = useState(null);
  const [bookToDelete, setBookToDelete] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [createSuccess, setCreateSuccess] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(false);

  useEffect(() => {
    dispatch(fetchBooks());
    dispatch(fetchCategories());
  }, [dispatch]);

  // Reload books and close the form after saving.
  const handleCreateSuccess = () => {
    setShowCreateModal(false);
    setCreateSuccess(true);
    dispatch(fetchBooks());
  };

  const handleEditBook = (book) => {
    setBookToEdit(book);
    setUpdateSuccess(false);
    setShowEditModal(true);
  };

  const handleUpdateSuccess = () => {
    setShowEditModal(false);
    setBookToEdit(null);
    setUpdateSuccess(true);
    dispatch(fetchBooks());
  };

  // Display only books that have not been deleted.
  const activeBooks = (books || []).filter(
    (book) => book.isDeleted !== true
  );

  // Search by title, author, or book ID.
  const filteredBooks = activeBooks.filter((book) => {
    const keyword = searchTerm.trim().toLowerCase();
    const matchesSearch = [
      book.title, book.author, book.id, book.bookCode,
    ].some((value) => String(value || '').toLowerCase().includes(keyword));

    const matchesCategory =
      !selectedCategory ||
      String(book.categoryId || book.category?.id) === selectedCategory ||
      categories.some(
        (cat) =>
          String(cat.id) === selectedCategory &&
          String(cat.name || '').trim().toLowerCase() === String(book.categoryName || '').trim().toLowerCase()
      );

    return matchesSearch && matchesCategory;
  });

  const getCategoryName = (book) => {
    const category = categories.find(
      (cat) => String(cat.id) === String(book.categoryId || book.category?.id)
    );

    return category?.name || book.category?.name ||
      book.categoryName || book.categoryId || 'Chưa phân loại';
  };

  const formatPrice = (price) => {
    if (price === null || price === undefined || price === '') return '-';
    const value = Number(price);
    return Number.isFinite(value) ? `${value.toLocaleString('vi-VN')} đ` : '-';
  };

  // Soft Delete: update isDeleted instead of removing the record.
  const handleConfirmDelete = async () => {
    if (!bookToDelete || deleting) return;

    setDeleting(true);
    setDeleteError('');

    try {
      await axios.patch(
        `${API_URL}/${encodeURIComponent(bookToDelete.id)}`,
        { isDeleted: true }
      );

      setBookToDelete(null);
      setDeleteSuccess(true);
      dispatch(fetchBooks());
    } catch (error) {
      console.error('Delete book error:', error);
      setDeleteError('Không thể xóa sách. Vui lòng thử lại!');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Container className="my-4">
      {/* Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 pb-2 border-bottom gap-2">
        <div>
          <h2 className="fw-bold text-dark mb-1">📚 Quản Lý Kho Sách (Admin)</h2>
          <p className="text-muted small mb-0">
            Xem, thêm, cập nhật và quản lý sách trong hệ thống.
          </p>
        </div>

        <div className="d-flex align-items-center gap-2">
          {!booksLoading && !booksError && (
            <Badge bg="light" text="dark" className="border p-2">
              Tổng kho: {activeBooks.length} cuốn sách
            </Badge>
          )}
          <Button
            disabled={booksLoading}
            onClick={() => {
              setCreateSuccess(false);
              setShowCreateModal(true);
            }}
          >
            + Thêm sách mới
          </Button>
        </div>
      </div>

      {/* Notifications */}
      {[
        [createSuccess, setCreateSuccess, 'Thêm sách mới thành công!'],
        [updateSuccess, setUpdateSuccess, 'Cập nhật sách thành công!'],
        [deleteSuccess, setDeleteSuccess, 'Xóa sách thành công!'],
      ].map(([show, setter, message], index) =>
        show && (
          <Alert key={index} variant="success" dismissible onClose={() => setter(false)}>
            {message}
          </Alert>
        )
      )}

      {/* Search and Category Filter */}
      <div className="bg-light p-3 rounded mb-4 border">
        <div className="row g-3">
          <div className="col-12 col-md-6">
            <InputGroup>
              <InputGroup.Text>🔍</InputGroup.Text>
              <Form.Control
                placeholder="Tìm theo tên sách, tác giả, mã sách..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </InputGroup>
          </div>

          <div className="col-12 col-md-4">
            <Form.Select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="">-- Tất cả thể loại --</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </Form.Select>
          </div>

          <div className="col-12 col-md-2">
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

      {/* Loading and Error */}
      {booksLoading && (
        <div className="text-center py-5">
          <Spinner animation="border" />
          <p className="text-muted mt-2">Đang tải danh sách sách...</p>
        </div>
      )}

      {!booksLoading && booksError && (
        <Alert variant="danger">
          {booksError}
          <Button size="sm" variant="danger" className="ms-3"
            onClick={() => dispatch(fetchBooks())}>
            Thử lại
          </Button>
        </Alert>
      )}

      {/* Empty List */}
      {!booksLoading && !booksError && filteredBooks.length === 0 && (
        <Alert variant="info" className="text-center">
          Không tìm thấy cuốn sách nào.
        </Alert>
      )}

      {/* Books Table */}
      {!booksLoading && !booksError && filteredBooks.length > 0 && (
        <div className="table-responsive border rounded shadow-sm">
          <Table striped hover className="align-middle text-center mb-0">
            <thead className="table-dark">
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
                const validStock = book.stock !== '' &&
                  book.stock !== null && book.stock !== undefined &&
                  Number.isFinite(stock);

                return (
                  <tr key={book.id}>
                    <td><code>{book.bookCode || book.id}</code></td>

                    <td>
                      {book.image ? (
                        <img
                          src={book.image}
                          alt={book.title || 'Ảnh bìa'}
                          width="45"
                          height="60"
                          className="rounded border"
                          style={{ objectFit: 'cover' }}
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = NO_COVER;
                          }}
                        />
                      ) : (
                        <span className="text-muted small">-</span>
                      )}
                    </td>

                    <td className="text-start fw-semibold">
                      {book.title || 'Chưa cập nhật'}
                    </td>

                    <td>{book.author || 'Chưa cập nhật'}</td>

                    <td>
                      <Badge bg="light" text="dark" className="border">
                        {getCategoryName(book)}
                      </Badge>
                    </td>

                    <td>{formatPrice(book.originalPrice)}</td>
                    <td className="fw-bold text-danger">{formatPrice(book.price)}</td>
                    <td>{validStock ? stock : 0}</td>

                    <td>
                      <Badge bg={
                        !validStock || stock <= 0 ? 'danger' :
                        stock <= 10 ? 'warning' : 'success'
                      }>
                        {!validStock || stock <= 0 ? 'Hết hàng' :
                          stock <= 10 ? 'Sắp hết' : 'Còn hàng'}
                      </Badge>
                    </td>

                    <td>
                      <div className="d-flex justify-content-center gap-1">
                        <Button size="sm" variant="outline-primary"
                          onClick={() => handleEditBook(book)}>
                          ✏️ Sửa
                        </Button>
                        <Button size="sm" variant="outline-danger"
                          onClick={() => {
                            setDeleteError('');
                            setBookToDelete(book);
                          }}>
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

      {/* Create and Update Forms */}
      <BookFormModal
        show={showCreateModal}
        onHide={() => setShowCreateModal(false)}
        onSuccess={handleCreateSuccess}
      />

      <BookFormModal
        show={showEditModal}
        onHide={() => {
          setShowEditModal(false);
          setBookToEdit(null);
        }}
        onSuccess={handleUpdateSuccess}
        bookToEdit={bookToEdit}
      />

      {/* Delete Confirmation */}
      <Modal
        show={!!bookToDelete}
        onHide={() => !deleting && setBookToDelete(null)}
        centered
        backdrop={deleting ? 'static' : true}
        keyboard={!deleting}
      >
        <Modal.Header closeButton={!deleting} className="bg-danger text-white">
          <Modal.Title className="h6">Xác nhận xóa sách</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <p>Bạn có chắc chắn muốn xóa sách này không?</p>
          <strong>{bookToDelete?.title}</strong>
          <p className="small text-muted mt-2">
            Sách sẽ được đánh dấu <code>isDeleted: true</code>,
            không bị xóa khỏi database.
          </p>
          {deleteError && <Alert variant="danger">{deleteError}</Alert>}
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" size="sm"
            disabled={deleting}
            onClick={() => setBookToDelete(null)}>
            Hủy
          </Button>
          <Button variant="danger" size="sm"
            disabled={deleting}
            onClick={handleConfirmDelete}>
            {deleting ? 'Đang xóa...' : 'Xác nhận xóa'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default AdminBookListPage;