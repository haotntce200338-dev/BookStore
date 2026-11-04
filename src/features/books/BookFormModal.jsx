import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Alert, Row, Col, Spinner } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import axios from 'axios';
const API_URL = 'http://localhost:3001/books';

/**
 * Auto-generates the next sequential book code (e.g., "b-101", "b-102").
 * @param {Array} bookList - Existing books
 * @param {number} defaultStart - Starting index if empty (default: 101)
 * @returns {string} Next code (e.g., "b-102")
 */
export const generateNextBookCode = (bookList = [], defaultStart = 101) => {
  if (!Array.isArray(bookList) || bookList.length === 0) {
    return `b-${defaultStart}`;
  }
  // Extract numeric suffixes after prefix "b-"
  const existingNumbers = bookList
    .map((book) => {
      const code = book?.bookCode || book?.id;
      if (!code) return null;
      const match = String(code).match(/^b-(\d+)$/i);
      return match ? parseInt(match[1], 10) : null;
    })
    .filter((num) => num !== null && !isNaN(num));
  // Fallback to default start if no valid codes exist
  if (existingNumbers.length === 0) {
    return `b-${defaultStart}`;
  }
  // Increment highest existing code
  const maxNumber = Math.max(...existingNumbers);
  return `b-${maxNumber + 1}`;
};

const BookFormModal = ({ show, onHide, onSuccess, bookToEdit = null, ...props }) => {
  const { books } = useSelector((state) => state.books);
  const categories = useSelector((state) => state.categories?.categories || []);

  const isEditMode = Boolean(bookToEdit);

  const [formData, setFormData] = useState({
    title: '',
    author: '',
    categoryName: '',
    originalPrice: '',
    price: '',
    stock: '',
    image: '',
    description: '',
  });
  const [validated, setValidated] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  // Generate next book code for create mode
  const nextBookCode = generateNextBookCode(books, 101);
  const currentBookCode = isEditMode
    ? (bookToEdit?.bookCode || bookToEdit?.id || '')
    : nextBookCode;

  useEffect(() => {
    if (show) {
      if (bookToEdit) {
        setFormData({
          title: bookToEdit.title || '',
          author: bookToEdit.author || '',
          categoryName:
            bookToEdit.category?.name ||
            bookToEdit.categoryName ||
            bookToEdit.categoryId ||
            '',
          originalPrice:
            bookToEdit.originalPrice !== undefined &&
            bookToEdit.originalPrice !== null
              ? String(bookToEdit.originalPrice)
              : '',
          price:
            bookToEdit.price !== undefined && bookToEdit.price !== null
              ? String(bookToEdit.price)
              : '',
          stock:
            bookToEdit.stock !== undefined && bookToEdit.stock !== null
              ? String(bookToEdit.stock)
              : '10',
          image: bookToEdit.image || '',
          description: bookToEdit.description || '',
        });
      } else {
        setFormData({
          title: '',
          author: '',
          categoryName: '',
          originalPrice: '',
          price: '',
          stock: '10',
          image: '',
          description: '',
        });
      }
      setValidated(false);
      setErrorMessage(null);
    }
  }, [show, bookToEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    if (form.checkValidity() === false) {
      e.stopPropagation();
      setValidated(true);
      return;
    }
    setSubmitting(true);
    setErrorMessage(null);

    // Chế độ Cập Nhật Thông Tin Sách (Update Book Details - Admin)
    if (isEditMode) {
      const matchedCategory = (categories || []).find(
        (c) =>
          c.name?.trim().toLowerCase() ===
          formData.categoryName.trim().toLowerCase()
      );
      const categoryId = matchedCategory
        ? matchedCategory.id
        : bookToEdit?.categoryId;

      const updatedBook = {
        ...bookToEdit,
        id: bookToEdit.id,
        bookCode: bookToEdit.bookCode || bookToEdit.id,
        title: formData.title.trim(),
        author: formData.author.trim(),
        categoryName:
          formData.categoryName.trim() ||
          bookToEdit.categoryName ||
          'Chưa phân loại',
        ...(categoryId ? { categoryId } : {}),
        originalPrice:
          formData.originalPrice !== ''
            ? Number(formData.originalPrice)
            : 0,
        price: Number(formData.price) || 0,
        stock: formData.stock !== '' ? Number(formData.stock) : 0,
        image: formData.image.trim(),
        description: formData.description.trim(),
        isDeleted: bookToEdit.isDeleted ?? false,
        createdAt: bookToEdit.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      try {
        await axios.put(`${API_URL}/${bookToEdit.id}`, updatedBook);
        setSubmitting(false);
        if (onSuccess) {
          onSuccess(updatedBook);
        }
        if (onHide) {
          onHide();
        }
      } catch (error) {
        console.error('Lỗi khi cập nhật thông tin sách:', error);
        setSubmitting(false);
        setErrorMessage(
          error.response?.data?.message ||
            'Có lỗi xảy ra khi cập nhật thông tin sách. Vui lòng thử lại!'
        );
      }
      return;
    }

    // Chế độ Thêm Mới Sách (Create New Book)
    // Prepare payload with generated book code
    const newBook = {
      bookCode: nextBookCode,
      title: formData.title.trim(),
      author: formData.author.trim(),
      categoryName: formData.categoryName.trim() || 'Chưa phân loại',
      originalPrice: formData.originalPrice ? Number(formData.originalPrice) : 0,
      price: Number(formData.price) || 0,
      stock: formData.stock !== '' ? Number(formData.stock) : 0,
      image: formData.image.trim(),
      description: formData.description.trim(),
      isDeleted: false,
      createdAt: new Date().toISOString(),
    };
    try {
      await axios.post(API_URL, newBook);
      setSubmitting(false);
      if (onSuccess) {
        onSuccess();
      }
      if (onHide) {
        onHide();
      }
    } catch (error) {
      console.error('Lỗi khi thêm sách mới:', error);
      setSubmitting(false);
      setErrorMessage(
        error.response?.data?.message || 'Có lỗi xảy ra khi tạo sách mới. Vui lòng thử lại!'
      );
    }
  };

  return (
    <Modal show={show} onHide={onHide} backdrop="static" centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title className="fw-bold">
          {isEditMode ? '✏️ Cập Nhật Thông Tin Sách' : '📚 Thêm Sách Mới Vào Hệ Thống'}
        </Modal.Title>
      </Modal.Header>
      <Form noValidate validated={validated} onSubmit={handleSubmit}>
        <Modal.Body>
          {errorMessage && (
            <Alert variant="danger" dismissible onClose={() => setErrorMessage(null)}>
              {errorMessage}
            </Alert>
          )}
          <Row className="g-3">
            {/* Auto-generated / Fixed Book Code */}
            <Col md={6}>
              <Form.Group controlId="bookCode">
                <Form.Label className="fw-semibold">Mã sách:</Form.Label>
                <Form.Control
                  type="text"
                  value={
                    isEditMode
                      ? `${currentBookCode} (Mã cố định)`
                      : `${nextBookCode} (Tự động tạo)`
                  }
                  disabled
                  readOnly
                  className="bg-light fw-bold text-primary"
                />
                <Form.Text className="text-muted">
                  {isEditMode
                    ? 'Mã sách không thể thay đổi.'
                    : 'Quy tắc sinh mã: b-101, b-102, b-103...'}
                </Form.Text>
              </Form.Group>
            </Col>
            {/* Category */}
            <Col md={6}>
              <Form.Group controlId="bookCategory">
                <Form.Label className="fw-semibold">Danh mục / Thể loại:</Form.Label>
                <Form.Control
                  type="text"
                  name="categoryName"
                  value={formData.categoryName}
                  onChange={handleChange}
                  placeholder="Ví dụ: Công nghệ, Tiểu thuyết, Kinh tế..."
                />
              </Form.Group>
            </Col>
            {/* Book Title */}
            <Col md={12}>
              <Form.Group controlId="bookTitle">
                <Form.Label className="fw-semibold">
                  Tên sách <span className="text-danger">*</span>:
                </Form.Label>
                <Form.Control
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Nhập tên sách..."
                  required
                />
                <Form.Control.Feedback type="invalid">
                  Vui lòng nhập tên cuốn sách.
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            {/* Author */}
            <Col md={6}>
              <Form.Group controlId="bookAuthor">
                <Form.Label className="fw-semibold">
                  Tác giả <span className="text-danger">*</span>:
                </Form.Label>
                <Form.Control
                  type="text"
                  name="author"
                  value={formData.author}
                  onChange={handleChange}
                  placeholder="Nhập tên tác giả..."
                  required
                />
                <Form.Control.Feedback type="invalid">
                  Vui lòng nhập tên tác giả.
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            {/* Stock Quantity */}
            <Col md={6}>
              <Form.Group controlId="bookStock">
                <Form.Label className="fw-semibold">Số lượng tồn kho:</Form.Label>
                <Form.Control
                  type="number"
                  min="0"
                  name="stock"
                  value={formData.stock}
                  onChange={handleChange}
                  placeholder="Mặc định: 10"
                />
              </Form.Group>
            </Col>
            {/* Original Price */}
            <Col md={6}>
              <Form.Group controlId="bookOriginalPrice">
                <Form.Label className="fw-semibold">Giá gốc (VNĐ):</Form.Label>
                <Form.Control
                  type="number"
                  min="0"
                  name="originalPrice"
                  value={formData.originalPrice}
                  onChange={handleChange}
                  placeholder="Ví dụ: 120000"
                />
              </Form.Group>
            </Col>
            {/* Selling Price */}
            <Col md={6}>
              <Form.Group controlId="bookPrice">
                <Form.Label className="fw-semibold">
                  Giá bán (VNĐ) <span className="text-danger">*</span>:
                </Form.Label>
                <Form.Control
                  type="number"
                  min="0"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="Ví dụ: 99000"
                  required
                />
                <Form.Control.Feedback type="invalid">
                  Vui lòng nhập giá bán hợp lệ.
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            {/* Cover Image URL */}
            <Col md={12}>
              <Form.Group controlId="bookImage">
                <Form.Label className="fw-semibold">Link ảnh bìa (URL):</Form.Label>
                <Form.Control
                  type="url"
                  name="image"
                  value={formData.image}
                  onChange={handleChange}
                  placeholder="https://example.com/hinh-anh-bia-sach.jpg"
                />
              </Form.Group>
            </Col>
            {/* Description */}
            <Col md={12}>
              <Form.Group controlId="bookDescription">
                <Form.Label className="fw-semibold">Mô tả ngắn gọn:</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Nhập tóm tắt nội dung sách..."
                />
              </Form.Group>
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide} disabled={submitting}>
            Hủy
          </Button>
          <Button variant="primary" type="submit" disabled={submitting}>
            {submitting ? (
              <>
                <Spinner as="span" animation="border" size="sm" role="status" className="me-2" />
                {isEditMode ? 'Đang cập nhật...' : 'Đang lưu...'}
              </>
            ) : (
              isEditMode ? 'Lưu thay đổi' : 'Tạo sách mới'
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default BookFormModal;