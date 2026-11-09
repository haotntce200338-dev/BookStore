import React, { useEffect, useState } from 'react';
import {
  Container, Table, Spinner, Alert, Button, Badge,
  Toast, ToastContainer, Modal
} from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchCategories, deleteCategory } from './categorySlice';
import CategoryFormModal from './CategoryFormModal';

const CategoryListPage = () => {
  const dispatch = useDispatch();
  const {
    categories, loading, error, deleteLoading, deleteError
  } = useSelector((state) => state.categories);

  const [showModal, setShowModal] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState(null);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  const activeCategories = (categories || []).filter((cat) => !cat.isDeleted);

  const handleOpenCreateModal = () => {
    setCategoryToEdit(null);
    setShowModal(true);
  };

  const handleEditClick = (cat) => {
    setCategoryToEdit(cat);
    setShowModal(true);
  };

  const handleModalSuccess = (savedCategory, mode) => {
    if (mode === 'update') {
      setToastMessage(`Đã cập nhật thể loại "${savedCategory?.name || 'mới'}" thành công!`);
    } else {
      setToastMessage(`Đã thêm thể loại "${savedCategory?.name || 'mới'}" thành công!`);
    }
    setShowToast(true);
    setCategoryToEdit(null);
    dispatch(fetchCategories());
  };

  const handleConfirmDelete = async () => {
    if (!categoryToDelete) return;
    const resultAction = await dispatch(deleteCategory(categoryToDelete.id));
    if (deleteCategory.fulfilled.match(resultAction)) {
      setToastMessage(`Đã xóa thể loại "${categoryToDelete.name}" thành công!`);
      setShowToast(true);
      setCategoryToDelete(null);
    }
  };

  return (
    <Container className="my-4">
      {/* Toast Notification */}
      <ToastContainer position="top-end" className="p-3" style={{ zIndex: 1080 }}>
        <Toast
          onClose={() => setShowToast(false)}
          show={showToast}
          delay={3000}
          autohide
          bg="success"
        >
          <Toast.Header>
            <strong className="me-auto text-success">🏷️ Quản Lý Thể Loại</strong>
            <small>Vừa xong</small>
          </Toast.Header>
          <Toast.Body className="text-white small fw-semibold">
            {toastMessage}
          </Toast.Body>
        </Toast>
      </ToastContainer>

      {/* Page Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 pb-2 border-bottom gap-2">
        <div>
          <h2 className="fw-bold text-dark mb-1">🏷️ Quản Lý Thể Loại Sách</h2>
          <p className="text-muted small mb-0">
            Xem và quản lý danh sách các danh mục, thể loại sách trong hệ thống BookStore.
          </p>
        </div>

        <div className="d-flex align-items-center gap-2">
          {!loading && !error && (
            <span className="badge bg-light text-dark border px-3 py-2">
              Tổng cộng: <strong>{activeCategories.length}</strong> thể loại
            </span>
          )}
          <Button as={Link} to="/admin/books" variant="outline-primary" size="sm">
            📚 Sang Quản lý Sách
          </Button>
          <Button
            variant="primary"
            size="sm"
            className="fw-semibold"
            style={{ backgroundColor: '#0D6EFD', borderColor: '#0D6EFD' }}
            onClick={handleOpenCreateModal}
          >
            + Thêm thể loại mới
          </Button>
        </div>
      </div>

      {/* 1. Loading State */}
      {loading && (
        <div className="text-center py-5 my-4">
          <Spinner animation="border" variant="primary" role="status" />
          <p className="mt-3 text-muted small">Đang tải danh sách thể loại, vui lòng chờ...</p>
        </div>
      )}

      {/* 2. Error State */}
      {!loading && error && (
        <Alert variant="danger" className="text-center py-4 my-4 shadow-sm">
          <div className="fs-3 mb-2">⚠️</div>
          <Alert.Heading className="fs-5 fw-bold">Không thể tải dữ liệu thể loại</Alert.Heading>
          <p className="small mb-3">{error}</p>
          <Button variant="danger" size="sm" onClick={() => dispatch(fetchCategories())}>
            Thử lại ngay
          </Button>
        </Alert>
      )}

      {/* 3. Empty State */}
      {!loading && !error && activeCategories.length === 0 && (
        <Alert variant="info" className="text-center py-5 my-4 shadow-sm">
          <div className="fs-1 mb-2">🏷️</div>
          <Alert.Heading className="fs-5 fw-bold">Hiện chưa có thể loại sách nào</Alert.Heading>
          <p className="text-muted small mb-3">
            Hệ thống hiện tại chưa có dữ liệu thể loại sách để hiển thị. Hãy bắt đầu bằng việc tạo thể loại mới!
          </p>
          <Button variant="primary" size="sm" onClick={handleOpenCreateModal}>
            + Thêm thể loại đầu tiên
          </Button>
        </Alert>
      )}

      {/* 4. Display State: Categories Table */}
      {!loading && !error && activeCategories.length > 0 && (
        <Table striped bordered hover responsive className="align-middle text-center shadow-sm bg-white">
          <thead className="table-dark">
            <tr>
              <th style={{ width: '60px' }}>STT</th>
              <th style={{ width: '130px' }}>Mã thể loại</th>
              <th style={{ minWidth: '200px' }} className="text-start">Tên thể loại</th>
              <th style={{ minWidth: '320px' }} className="text-start">Mô tả</th>
              <th style={{ width: '140px' }}>Trạng thái</th>
              <th style={{ width: '150px' }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {activeCategories.map((cat, index) => (
              <tr key={cat.id || index}>
                <td className="text-muted fw-semibold">{index + 1}</td>
                <td>
                  <Badge bg="light" text="dark" className="border font-monospace px-2 py-1">
                    {cat.id}
                  </Badge>
                </td>
                <td className="fw-semibold text-start text-dark">
                  {cat.name || 'Chưa cập nhật'}
                </td>
                <td className="text-start text-secondary small">
                  {cat.description || 'Chưa có mô tả'}
                </td>
                <td>
                  <Badge bg="success" className="fw-normal">
                    Đang hoạt động
                  </Badge>
                </td>
                <td>
                  <div className="d-flex justify-content-center gap-1">
                    <Button
                      variant="outline-primary"
                      size="sm"
                      className="d-inline-flex align-items-center gap-1 px-2 py-1 fw-semibold"
                      onClick={() => handleEditClick(cat)}
                      title="Chỉnh sửa thông tin thể loại"
                    >
                      <span>✏️</span>
                      <span>Sửa</span>
                    </Button>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      className="d-inline-flex align-items-center gap-1 px-2 py-1"
                      onClick={() => setCategoryToDelete(cat)}
                      title="Xóa mềm thể loại này"
                    >
                      <span>🗑️</span>
                      <span>Xóa</span>
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      {/* Create / Edit Category Modal */}
      <CategoryFormModal
        show={showModal}
        onHide={() => {
          setShowModal(false);
          setCategoryToEdit(null);
        }}
        onSuccess={handleModalSuccess}
        categoryToEdit={categoryToEdit}
      />

      {/* Delete Confirmation Modal (Soft Delete according to guidelines.md) */}
      <Modal
        show={Boolean(categoryToDelete)}
        onHide={() => !deleteLoading && setCategoryToDelete(null)}
        centered
        backdrop="static"
        keyboard={true}
      >
        <Modal.Header closeButton className="bg-danger text-white">
          <Modal.Title className="h6 mb-0 fw-bold">
            ⚠️ Xác nhận xóa thể loại sách
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="py-4">
          <p className="mb-2">
            Bạn có chắc chắn muốn xóa thể loại sau khỏi hệ thống quản trị không?
          </p>
          <div className="p-3 bg-light rounded border mb-3">
            <h6 className="fw-bold text-dark mb-1">{categoryToDelete?.name}</h6>
            <div className="text-muted small">
              Mã thể loại: <span className="font-monospace text-primary fw-semibold">{categoryToDelete?.id}</span>
            </div>
            {categoryToDelete?.description && (
              <div className="text-muted small text-truncate mt-1">
                Mô tả: {categoryToDelete.description}
              </div>
            )}
          </div>
          <small className="text-muted d-block">
            * Thao tác này sẽ thực hiện <strong>Xóa mềm (Soft Delete)</strong> bằng cách đánh dấu <code>isDeleted: true</code> để bảo toàn tính toàn vẹn dữ liệu cho các cuốn sách và đơn hàng liên quan.
          </small>
          {deleteError && (
            <Alert variant="danger" className="mt-3 mb-0 small">
              {deleteError}
            </Alert>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setCategoryToDelete(null)}
            disabled={deleteLoading}
          >
            Hủy bỏ
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={handleConfirmDelete}
            disabled={deleteLoading}
            className="d-inline-flex align-items-center gap-1"
          >
            {deleteLoading ? (
              <>
                <Spinner as="span" animation="border" size="sm" role="status" className="me-1" />
                Đang xóa...
              </>
            ) : (
              'Xác nhận xóa'
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default CategoryListPage;
