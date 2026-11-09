
import React, { useEffect, useState } from 'react';
import { Modal, Button, Form, Alert, Row, Col, Spinner } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import axios from 'axios';

const API_URL = 'http://localhost:3001/books';
const EMPTY_FORM = { title: '', author: '', categoryName: '', originalPrice: '', price: '', stock: '10', image: '', description: '' };

// Generate the next sequential code, including soft-deleted books.
export const generateNextBookCode = (bookList = [], defaultStart = 101) => {
  if (!Array.isArray(bookList)) return `b-${defaultStart}`;
  const numbers = bookList.flatMap((book) => [book?.id, book?.bookCode])
    .map((code) => {
      const match = String(code || '').match(/^b-(\d+)$/i);
      return match ? Number(match[1]) : null;
    })
    .filter(Number.isSafeInteger);
  return `b-${Math.max(defaultStart - 1, ...numbers) + 1}`;
};

// Get a book's category name from its category ID or saved category fields.
const getBookCategoryName = (book, categories = []) => {
  if (!book) return '';
  const categoryId = book.categoryId || book.category?.id;
  return String(categories.find((category) => String(category.id) === String(categoryId))?.name ||
    book.category?.name || book.categoryName || book.categoryId || '');
};

const BookFormModal = ({ show, onHide, onSuccess, bookToEdit = null }) => {
  const { books = [], booksLoading = false } = useSelector((state) => state.books || {});
  const categories = useSelector((state) => state.categories?.categories || []);
  const isEditMode = Boolean(bookToEdit);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [validated, setValidated] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [categoryTouched, setCategoryTouched] = useState(false);

  const nextBookCode = generateNextBookCode(books, 101);
  const currentBookCode = isEditMode ? bookToEdit?.bookCode || bookToEdit?.id || '' : nextBookCode;

  // Initialize the form whenever the modal opens or the selected book changes.
  useEffect(() => {
    if (!show) return;
    setFormData(bookToEdit ? {
      title: String(bookToEdit.title || ''),
      author: String(bookToEdit.author || ''),
      categoryName: getBookCategoryName(bookToEdit, categories),
      originalPrice: String(bookToEdit.originalPrice ?? ''),
      price: String(bookToEdit.price ?? ''),
      stock: String(bookToEdit.stock ?? '10'),
      image: String(bookToEdit.image || ''),
      description: String(bookToEdit.description || '')
    } : { ...EMPTY_FORM });
    setValidated(false);
    setSubmitting(false);
    setErrorMessage(null);
    setCategoryTouched(false);
  }, [show, bookToEdit, categories]);

  // Resolve the category name when categories load after the modal opens.
  useEffect(() => {
    if (!show || !bookToEdit || categoryTouched) return;
    const categoryId = bookToEdit.categoryId || bookToEdit.category?.id;
    const matchedCategory = categories.find((category) => String(category.id) === String(categoryId));
    if (matchedCategory) setFormData((previous) => ({ ...previous, categoryName: matchedCategory.name }));
  }, [show, bookToEdit, categories, categoryTouched]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((previous) => ({ ...previous, [name]: value }));
    if (name === 'categoryName') setCategoryTouched(true);
  };

  // Match the entered category name, preserving the original ID if unchanged.
  const findCategoryId = (categoryName) => {
    const normalizedName = String(categoryName || '').trim().toLowerCase();
    const matchedCategory = categories.find((category) =>
      String(category.name || '').trim().toLowerCase() === normalizedName
    );
    if (matchedCategory) return matchedCategory.id;
    if (isEditMode) {
      const originalCategoryId = bookToEdit?.categoryId || bookToEdit?.category?.id;
      const originalCategoryName = String(getBookCategoryName(bookToEdit, categories)).trim().toLowerCase();
      if (originalCategoryId && (normalizedName === originalCategoryName || normalizedName === String(originalCategoryId).toLowerCase())) {
        return originalCategoryId;
      }
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    if (!form.checkValidity()) {
      e.stopPropagation();
      setValidated(true);
      return;
    }

    if (!formData.title.trim() || !formData.author.trim()) {
      setValidated(true);
      setErrorMessage('Tên sách và tác giả không được để trống hoặc chỉ chứa khoảng trắng.');
      return;
    }

    const price = Number(formData.price);
    const originalPrice = formData.originalPrice === '' ? 0 : Number(formData.originalPrice);
    const stock = formData.stock === '' ? 0 : Number(formData.stock);
    if (![price, originalPrice, stock].every(Number.isFinite) || price < 0 || originalPrice < 0 || stock < 0) {
      setValidated(true);
      setErrorMessage('Giá bán, giá gốc và số lượng tồn kho phải là số hợp lệ và không được nhỏ hơn 0.');
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);

    try {
      const enteredCategoryName = formData.categoryName.trim();
      const categoryId = findCategoryId(enteredCategoryName);
      const matchedCategory = categories.find((category) => String(category.id) === String(categoryId));

      if (isEditMode) {
        const originalCategoryName = String(getBookCategoryName(bookToEdit, categories));
        const updatedBook = {
          ...bookToEdit,
          id: bookToEdit.id,
          bookCode: bookToEdit.bookCode || bookToEdit.id,
          title: formData.title.trim(),
          author: formData.author.trim(),
          categoryName: matchedCategory?.name || enteredCategoryName || originalCategoryName || 'Chưa phân loại',
          originalPrice,
          price,
          stock,
          image: formData.image.trim(),
          description: formData.description.trim(),
          isDeleted: bookToEdit.isDeleted ?? false,
          createdAt: bookToEdit.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        if (categoryId) updatedBook.categoryId = categoryId;
        else if (enteredCategoryName && enteredCategoryName.toLowerCase() !== originalCategoryName.toLowerCase()) delete updatedBook.categoryId;

        await axios.put(`${API_URL}/${encodeURIComponent(String(bookToEdit.id))}`, updatedBook);
        onSuccess?.(updatedBook);
        return;
      }

      // Read the latest records before generating a new ID.
      const response = await axios.get(API_URL);
      const latestBooks = Array.isArray(response.data) ? response.data : [];
      const newBookCode = generateNextBookCode(latestBooks, 101);
      const codeExists = latestBooks.some((book) => String(book.id) === newBookCode || String(book.bookCode) === newBookCode);
      if (codeExists) throw new Error('Mã sách đã tồn tại. Vui lòng thử tạo lại.');

      const newBook = {
        id: newBookCode,
        bookCode: newBookCode,
        title: formData.title.trim(),
        author: formData.author.trim(),
        categoryName: matchedCategory?.name || enteredCategoryName || 'Chưa phân loại',
        ...(categoryId ? { categoryId } : {}),
        originalPrice,
        price,
        stock,
        image: formData.image.trim(),
        description: formData.description.trim(),
        isDeleted: false,
        createdAt: new Date().toISOString()
      };

      await axios.post(API_URL, newBook);
      onSuccess?.(newBook);
    } catch (error) {
      console.error(isEditMode ? 'Lỗi khi cập nhật thông tin sách:' : 'Lỗi khi thêm sách mới:', error);
      setErrorMessage(error.response?.data?.message || error.message ||
        (isEditMode ? 'Có lỗi xảy ra khi cập nhật thông tin sách. Vui lòng thử lại!' : 'Có lỗi xảy ra khi tạo sách mới. Vui lòng thử lại!'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleModalHide = () => {
    if (!submitting) onHide?.();
  };

  return (
    <Modal show={show} onHide={handleModalHide} backdrop="static" centered size="lg">
      <Modal.Header closeButton={!submitting}>
        <Modal.Title className="fw-bold">{isEditMode ? '✏️ Cập Nhật Thông Tin Sách' : '📚 Thêm Sách Mới Vào Hệ Thống'}</Modal.Title>
      </Modal.Header>
      <Form noValidate validated={validated} onSubmit={handleSubmit}>
        <Modal.Body>
          {errorMessage && <Alert variant="danger" dismissible onClose={() => setErrorMessage(null)}>{errorMessage}</Alert>}
          <Row className="g-3">
            <Col md={6}>
              <Form.Group controlId="bookCode">
                <Form.Label className="fw-semibold">Mã sách:</Form.Label>
                <Form.Control type="text" value={isEditMode ? `${currentBookCode} (Mã cố định)` : booksLoading ? 'Đang tải danh sách sách...' : `${nextBookCode} (Tự động tạo)`} disabled readOnly className="bg-light fw-bold text-primary" />
                <Form.Text className="text-muted">{isEditMode ? 'Mã sách không thể thay đổi.' : 'Quy tắc sinh mã: b-101, b-102, b-103...'}</Form.Text>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="bookCategory">
                <Form.Label className="fw-semibold">Danh mục / Thể loại:</Form.Label>
                <Form.Control
                  type="text"
                  name="categoryName"
                  list="categoryOptions"
                  value={formData.categoryName}
                  onChange={handleChange}
                  placeholder="Chọn hoặc nhập thể loại..."
                  disabled={submitting}
                />
                <datalist id="categoryOptions">
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.name} />
                  ))}
                </datalist>
              </Form.Group>
            </Col>
            <Col md={12}>
              <Form.Group controlId="bookTitle">
                <Form.Label className="fw-semibold">Tên sách <span className="text-danger">*</span>:</Form.Label>
                <Form.Control type="text" name="title" value={formData.title} onChange={handleChange} placeholder="Nhập tên sách..." required disabled={submitting} />
                <Form.Control.Feedback type="invalid">Vui lòng nhập tên cuốn sách.</Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="bookAuthor">
                <Form.Label className="fw-semibold">Tác giả <span className="text-danger">*</span>:</Form.Label>
                <Form.Control type="text" name="author" value={formData.author} onChange={handleChange} placeholder="Nhập tên tác giả..." required disabled={submitting} />
                <Form.Control.Feedback type="invalid">Vui lòng nhập tên tác giả.</Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="bookStock">
                <Form.Label className="fw-semibold">Số lượng tồn kho:</Form.Label>
                <Form.Control type="number" min="0" name="stock" value={formData.stock} onChange={handleChange} placeholder="Mặc định: 10" disabled={submitting} />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="bookOriginalPrice">
                <Form.Label className="fw-semibold">Giá gốc (VNĐ):</Form.Label>
                <Form.Control type="number" min="0" name="originalPrice" value={formData.originalPrice} onChange={handleChange} placeholder="Ví dụ: 120000" disabled={submitting} />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="bookPrice">
                <Form.Label className="fw-semibold">Giá bán (VNĐ) <span className="text-danger">*</span>:</Form.Label>
                <Form.Control type="number" min="0" name="price" value={formData.price} onChange={handleChange} placeholder="Ví dụ: 99000" required disabled={submitting} />
                <Form.Control.Feedback type="invalid">Vui lòng nhập giá bán hợp lệ.</Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={12}>
              <Form.Group controlId="bookImage">
                <Form.Label className="fw-semibold">Link ảnh bìa (URL):</Form.Label>
                <Form.Control type="url" name="image" value={formData.image} onChange={handleChange} placeholder="https://example.com/hinh-anh-bia-sach.jpg" disabled={submitting} />
              </Form.Group>
            </Col>
            <Col md={12}>
              <Form.Group controlId="bookDescription">
                <Form.Label className="fw-semibold">Mô tả ngắn gọn:</Form.Label>
                <Form.Control as="textarea" rows={3} name="description" value={formData.description} onChange={handleChange} placeholder="Nhập tóm tắt nội dung sách..." disabled={submitting} />
              </Form.Group>
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleModalHide} disabled={submitting}>Hủy</Button>
          <Button variant="primary" type="submit" disabled={submitting || (!isEditMode && booksLoading)}>
            {submitting ? <><Spinner as="span" animation="border" size="sm" role="status" className="me-2" />{isEditMode ? 'Đang cập nhật...' : 'Đang lưu...'}</> : isEditMode ? 'Lưu thay đổi' : 'Tạo sách mới'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default BookFormModal;
