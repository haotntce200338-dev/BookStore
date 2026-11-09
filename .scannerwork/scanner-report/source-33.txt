import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Alert, Spinner } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { createCategory, updateCategory, clearCategoryError } from './categorySlice';

// Regex to block XSS and malicious injection patterns (tags, protocols, events, js functions)
const MALICIOUS_REGEX = /<[^>]*>|javascript:|data:\s*text\/html|vbscript:|on\w+\s*=|alert\(|eval\(|document\./i;

// Regex for safe Category Name: Letters (with Vietnamese unicode accents), numbers, spaces, and safe characters (- & , . / ( ))
const CATEGORY_NAME_SAFE_REGEX = /^[\p{L}\d\s\-&,./()]+$/u;

/**
 * Generate next Category ID formatted as "cat-x" (e.g. cat-1, cat-2, cat-3...)
 *
 * @param {Array} categoryList - List of existing categories
 * @param {number} defaultStart - Default starting counter (default: 1)
 * @returns {string} Next category code (e.g. "cat-4")
 */
export const generateNextCategoryCode = (categoryList = [], defaultStart = 1) => {
  if (!Array.isArray(categoryList) || categoryList.length === 0) {
    return `cat-${defaultStart}`;
  }

  const existingNumbers = categoryList
    .map((cat) => {
      const code = cat?.id;
      if (!code) return null;
      const match = String(code).match(/^cat-(\d+)$/i);
      return match ? parseInt(match[1], 10) : null;
    })
    .filter((num) => num !== null && !isNaN(num));

  if (existingNumbers.length === 0) {
    return `cat-${defaultStart}`;
  }

  const maxNumber = Math.max(...existingNumbers);
  return `cat-${maxNumber + 1}`;
};

const CategoryFormModal = ({ show, onHide, onSuccess, categoryToEdit = null }) => {
  const dispatch = useDispatch();
  const { categories, createLoading, createError, updateLoading, updateError } = useSelector(
    (state) => state.categories
  );

  const isEditMode = Boolean(categoryToEdit);
  const isSubmitting = isEditMode ? updateLoading : createLoading;
  const submitError = isEditMode ? updateError : createError;

  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  const [validationErrors, setValidationErrors] = useState({});

  // Compute next category code automatically for create mode
  const nextCategoryCode = generateNextCategoryCode(categories, 1);
  const currentCategoryCode = isEditMode
    ? (categoryToEdit?.id || '')
    : nextCategoryCode;

  // Reset or prefill form when modal opens or closes
  useEffect(() => {
    if (show) {
      if (categoryToEdit) {
        setFormData({
          name: categoryToEdit.name || '',
          description: categoryToEdit.description || '',
        });
      } else {
        setFormData({
          name: '',
          description: '',
        });
      }
      setValidationErrors({});
      dispatch(clearCategoryError());
    }
  }, [show, categoryToEdit, dispatch]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (validationErrors[name]) {
      setValidationErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const validateForm = () => {
    const errors = {};
    const trimmedName = formData.name.trim();
    const trimmedDesc = formData.description.trim();

    // 1. Name validation (XSS and characters check)
    if (!trimmedName) {
      errors.name = 'Vui lòng nhập tên thể loại.';
    } else if (MALICIOUS_REGEX.test(trimmedName) || !CATEGORY_NAME_SAFE_REGEX.test(trimmedName)) {
      errors.name = 'Tên thể loại chứa ký tự đặc biệt hoặc đoạn mã không an toàn (XSS).';
    } else if (trimmedName.length < 2 || trimmedName.length > 50) {
      errors.name = 'Tên thể loại phải có độ dài từ 2 đến 50 ký tự.';
    } else {
      // Check for duplicated category name (case-insensitive) excluding the category currently being edited
      const isDuplicate = (categories || []).some(
        (cat) =>
          !cat.isDeleted &&
          (!isEditMode || String(cat.id) !== String(categoryToEdit.id)) &&
          cat.name?.trim().toLowerCase() === trimmedName.toLowerCase()
      );
      if (isDuplicate) {
        errors.name = 'Tên thể loại này đã tồn tại trong hệ thống.';
      }
    }

    // 2. Description validation (optional, anti-XSS check)
    if (trimmedDesc) {
      if (MALICIOUS_REGEX.test(trimmedDesc) || /<[^>]*>|[<>]/.test(trimmedDesc)) {
        errors.description = 'Mô tả chứa ký tự hoặc đoạn mã HTML/Script không an toàn.';
      } else if (trimmedDesc.length > 250) {
        errors.description = 'Mô tả không được vượt quá 250 ký tự.';
      }
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    setValidationErrors({});

    if (isEditMode) {
      const updatedCategory = {
        id: categoryToEdit.id,
        name: formData.name.trim(),
        description: formData.description.trim() || 'Chưa có mô tả',
      };

      const resultAction = await dispatch(updateCategory(updatedCategory));

      if (updateCategory.fulfilled.match(resultAction)) {
        if (onSuccess) {
          onSuccess(resultAction.payload, 'update');
        }
        if (onHide) {
          onHide();
        }
      }
    } else {
      const newCategory = {
        id: nextCategoryCode,
        name: formData.name.trim(),
        description: formData.description.trim() || 'Chưa có mô tả',
        isDeleted: false,
        createdAt: new Date().toISOString(),
      };

      const resultAction = await dispatch(createCategory(newCategory));

      if (createCategory.fulfilled.match(resultAction)) {
        if (onSuccess) {
          onSuccess(resultAction.payload, 'create');
        }
        if (onHide) {
          onHide();
        }
      }
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered backdrop="static" keyboard={true}>
      <Modal.Header closeButton>
        <Modal.Title className="fw-bold fs-5 text-dark">
          {isEditMode ? '✏️ Cập Nhật Thông Tin Thể Loại' : '🏷️ Thêm Thể Loại Sách Mới'}
        </Modal.Title>
      </Modal.Header>

      <Form noValidate onSubmit={handleSubmit}>
        <Modal.Body className="p-4">
          {submitError && (
            <Alert variant="danger" dismissible onClose={() => dispatch(clearCategoryError())} className="small">
              {submitError}
            </Alert>
          )}

          {/* Category Code Field */}
          <Form.Group className="mb-3" controlId="categoryCode">
            <Form.Label className="fw-semibold small">
              {isEditMode ? 'Mã thể loại (Cố định):' : 'Mã thể loại (Tự động tạo):'}
            </Form.Label>
            <Form.Control
              type="text"
              value={
                isEditMode
                  ? `${currentCategoryCode} (Mã định danh)`
                  : `${nextCategoryCode} (Hệ thống tự cấp)`
              }
              disabled
              readOnly
              className="bg-light fw-bold text-primary font-monospace"
            />
            <Form.Text className="text-muted small">
              {isEditMode
                ? 'Mã thể loại không thể thay đổi sau khi tạo.'
                : 'Quy tắc mã thể loại: cat-1, cat-2, cat-3...'}
            </Form.Text>
          </Form.Group>

          {/* Category Name */}
          <Form.Group className="mb-3" controlId="categoryName">
            <Form.Label className="fw-semibold small">
              Tên thể loại <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              type="text"
              name="name"
              placeholder="Ví dụ: Khoa học công nghệ, Kỹ năng sống..."
              value={formData.name}
              onChange={handleChange}
              isInvalid={!!validationErrors.name}
              disabled={isSubmitting}
              autoFocus
            />
            <Form.Control.Feedback type="invalid">
              {validationErrors.name}
            </Form.Control.Feedback>
          </Form.Group>

          {/* Category Description */}
          <Form.Group className="mb-3" controlId="categoryDescription">
            <Form.Label className="fw-semibold small">
              Mô tả ngắn gọn:
            </Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="description"
              placeholder="Nhập giới thiệu tóm tắt về thể loại sách này..."
              value={formData.description}
              onChange={handleChange}
              isInvalid={!!validationErrors.description}
              disabled={isSubmitting}
            />
            <Form.Control.Feedback type="invalid">
              {validationErrors.description}
            </Form.Control.Feedback>
            <Form.Text className="text-muted small">
              Tối đa 250 ký tự.
            </Form.Text>
          </Form.Group>
        </Modal.Body>

        <Modal.Footer className="bg-light">
          <Button variant="secondary" onClick={onHide} disabled={isSubmitting}>
            Hủy
          </Button>
          <Button
            variant="primary"
            type="submit"
            disabled={isSubmitting}
            style={{ backgroundColor: '#0D6EFD', borderColor: '#0D6EFD' }}
          >
            {isSubmitting ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                  className="me-2"
                />
                {isEditMode ? 'Đang cập nhật...' : 'Đang tạo...'}
              </>
            ) : (
              isEditMode ? 'Lưu thay đổi' : 'Thêm thể loại'
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default CategoryFormModal;
