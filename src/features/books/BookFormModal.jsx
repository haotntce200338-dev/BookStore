import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Alert, Row, Col, Spinner } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import axios from 'axios';
const API_URL = 'http://localhost:3001/books';
/**
 * Hàm tự động sinh Mã sách tiếp theo dạng "b-xxx" (ví dụ: b-101, b-102, b-103...)
 * @param {Array} bookList - Danh sách các sách hiện có
 * @param {number} defaultStart - Số bắt đầu nếu chưa có sách nào (mặc định là 101)
 * @returns {string} Mã sách mới (ví dụ: "b-102")
 */
export const generateNextBookCode = (bookList = [], defaultStart = 101) => {
  if (!Array.isArray(bookList) || bookList.length === 0) {
    return `b-${defaultStart}`;
  }
  // Tách lấy các số sau tiền tố "b-" từ bookCode hoặc id
  const existingNumbers = bookList
    .map((book) => {
      const code = book?.bookCode || book?.id;
      if (!code) return null;
      const match = String(code).match(/^b-(\d+)$/i);
      return match ? parseInt(match[1], 10) : null;
    })
    .filter((num) => num !== null && !isNaN(num));
  // Nếu trong danh sách chưa có mã nào dạng b-xxx thì bắt đầu từ defaultStart
  if (existingNumbers.length === 0) {
    return `b-${defaultStart}`;
  }
  // Lấy số lớn nhất hiện tại cộng thêm 1
  const maxNumber = Math.max(...existingNumbers);
  return `b-${maxNumber + 1}`;
};
const BookFormModal = ({ show, onHide, onSuccess }) => {
  const { books } = useSelector((state) => state.books);
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
  // Sinh mã sách kế tiếp (ví dụ: b-102)
  const nextBookCode = generateNextBookCode(books, 101);
  useEffect(() => {
    if (show) {
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
      setValidated(false);
      setErrorMessage(null);
    }
  }, [show]);
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
    // Chuẩn bị dữ liệu gửi lên API:
    // Trường bookCode sẽ lưu cố định mã dạng b-102 do frontend sinh ra
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
          📚 Thêm Sách Mới Vào Hệ Thống
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
            {/* Hiển thị Mã sách tự động tăng */}
            <Col md={6}>
              <Form.Group controlId="bookCode">
                <Form.Label className="fw-semibold">Mã sách (Tự tăng):</Form.Label>
                <Form.Control
                  type="text"
                  value={`${nextBookCode} (Tự động tạo)`}
                  disabled
                  readOnly
                  className="bg-light fw-bold text-primary"
                />
                <Form.Text className="text-muted">
                  Quy tắc sinh mã: b-101, b-102, b-103...
                </Form.Text>
              </Form.Group>
            </Col>
            {/* Danh mục */}
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
            {/* Tên sách */}
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
            {/* Tác giả */}
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
            {/* Số lượng tồn kho */}
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
            {/* Giá gốc */}
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
            {/* Giá bán */}
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
            {/* Link ảnh bìa */}
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
            {/* Mô tả */}
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
                Đang lưu...
              </>
            ) : (
              'Tạo sách mới'
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};
export default BookFormModal;