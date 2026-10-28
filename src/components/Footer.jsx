import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-white border-top mt-auto py-5 text-secondary">
      <Container>
        <Row className="gy-4">
          <Col xs={12} md={5}>
            <div className="d-flex align-items-center mb-3">
              <span className="fs-3 me-2" role="img" aria-label="BookStore">📚</span>
              <h5 className="mb-0 fw-bold text-dark">BookStore</h5>
            </div>
            <p className="text-muted small pe-md-4 mb-3" style={{ lineHeight: '1.6' }}>
              Nền tảng mua sắm sách trực tuyến hiện đại với trải nghiệm mượt mà,
              cung cấp hàng ngàn đầu sách thuộc nhiều thể loại từ công nghệ,
              kinh tế đến văn học kinh điển.
            </p>
            <div className="badge bg-light text-dark border px-2 py-1 small">
              Phiên bản ReactJS 19 • Redux Toolkit
            </div>
          </Col>

          <Col xs={6} md={3}>
            <h6 className="fw-bold text-dark mb-3">Khám phá</h6>
            <ul className="list-unstyled small mb-0 d-flex flex-column gap-2">
              <li>
                <Link to="/" className="text-decoration-none text-muted hover-primary">
                  Trang chủ
                </Link>
              </li>
              <li>
                <Link to="/#catalog" className="text-decoration-none text-muted hover-primary">
                  Danh mục sách
                </Link>
              </li>
              <li>
                <Link to="/cart" className="text-decoration-none text-muted hover-primary">
                  Giỏ hàng của bạn
                </Link>
              </li>
              <li>
                <Link to="/login" className="text-decoration-none text-muted hover-primary">
                  Tài khoản & Đăng nhập
                </Link>
              </li>
            </ul>
          </Col>

          <Col xs={6} md={4}>
            <h6 className="fw-bold text-dark mb-3">Thông tin học thuật</h6>
            <ul className="list-unstyled small text-muted mb-0 d-flex flex-column gap-2">
              <li>
                <strong>Học phần:</strong> FER202 — Front-End Web Development with ReactJS
              </li>
              <li>
                <strong>Tổ chức:</strong> Đại học FPT — Phân hiệu Cần Thơ
              </li>
              <li>
                <strong>Học kỳ:</strong> Fall 2026 • Lớp SE18
              </li>
              <li>
                <strong>Nhóm phát triển:</strong> Nhóm 5 thành viên (Leader: HaoTNT)
              </li>
            </ul>
          </Col>
        </Row>

        <hr className="my-4 text-muted opacity-25" />

        <div className="d-flex flex-column flex-sm-row justify-content-between align-items-center small text-muted">
          <span>
            © {new Date().getFullYear()} BookStore Web Application. All rights reserved.
          </span>
          <span className="mt-2 mt-sm-0">
            FER202 Group Project — Built with React & React-Bootstrap
          </span>
        </div>
      </Container>
    </footer>
  );
};

export default Footer;
