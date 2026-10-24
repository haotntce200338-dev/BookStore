# BookStore Frontend — UI & Coding Consistency Guidelines

Tài liệu này là bộ quy chuẩn giao diện và quy ước lập trình chính thức của dự án **BookStore (FER202)**. Tất cả thành viên trong nhóm bắt buộc phải đọc kỹ và tuân thủ các quy tắc dưới đây trước khi viết mã nguồn hoặc thiết kế giao diện cho bất kỳ màn hình nào, nhằm đảm bảo sản phẩm đồng nhất như do một người viết và đạt kết quả cao nhất khi bảo vệ đồ án.

---

## 1. Mục tiêu thiết kế & Định hướng phong cách

BookStore là website thương mại điện tử chuyên về sách dành cho **Khách vãng lai (Guest)**, **Khách hàng (Customer)** và **Quản trị viên (Admin)**. Giao diện được định hướng theo phong cách **Modern Editorial / Clean Minimalist**: tri thức, sáng sủa, thanh lịch, ấm cúng và tôn vinh tối đa hình ảnh bìa sách.

### Nguyên tắc cốt lõi:
* **Light-first & Tối giản:** Sử dụng nền sáng sạch sẽ, ưu tiên khoảng trắng (white-space) hợp lý để mắt người dùng không bị mỏi khi lướt tìm sách.
* **Tôn vinh bìa sách:** Ảnh bìa sách phải được hiển thị rõ ràng, giữ đúng tỷ lệ khung hình chuẩn, không bị méo hình hoặc bể ảnh.
* **Tính nhất quán tuyệt đối:** Mọi màn hình phải sử dụng chung hệ thống nút bấm, thanh điều hướng (Navbar), chân trang (Footer), bảng dữ liệu, form nhập liệu và thông báo lỗi.
* **Giao diện đa thiết bị (Responsive):** Hoạt động ổn định trên các kích thước: **375px** (Mobile), **768px** (Tablet), **1024px** (Laptop) và **1440px** (Desktop).
* **Ngôn ngữ hiển thị:** Sử dụng tiếng Việt rõ ràng, chuẩn mực cho nội dung giao diện người dùng. Tên biến, hàm, component, state và ghi chú trong mã nguồn dùng 100% tiếng Anh.

---

## 2. Nguồn tham chiếu bắt buộc & Công nghệ sử dụng

Trước khi bắt tay vào tạo trang hoặc component mới, mỗi thành viên phải nắm rõ các tài nguyên nền tảng:

* **Thư viện giao diện chính:** `react-bootstrap` kết hợp `bootstrap` 5.x.
* **Quản lý trạng thái:** Redux Toolkit (`@reduxjs/toolkit`, `react-redux`) đặt tại `src/app/store.js` và các slice trong `src/features/`.
* **Điều hướng:** `react-router-dom` v6.
* **Mock CSDL:** `json-server` chạy trên file `db.json` tại cổng `3001`.
* **Component dùng chung:**
  * `src/components/Navbar.jsx`: Thanh điều hướng toàn hệ thống (hiển thị logo, search, danh mục, giỏ hàng, menu đăng nhập/admin).
  * `src/components/Footer.jsx`: Chân trang thông tin chung.
  * `src/components/ProtectedRoute.jsx`: Bảo vệ các route quản trị (`/admin/*`).

> **Lưu ý:** Không tự ý tạo lại một phiên bản Navbar hoặc Footer riêng lẻ trong từng trang.

---

## 3. Hệ thống Design Tokens (Màu sắc, Typography & Spacing)

### 3.1 Bảng màu quy chuẩn (Color Palette)

Nhóm thống nhất sử dụng các mã màu chuẩn sau trong toàn bộ ứng dụng:

| Vai trò | Mã màu | Cách sử dụng trên giao diện |
| :--- | :---: | :--- |
| **Brand Primary (Xanh tri thức)** | `#0D6EFD` | Nút hành động chính (CTA: Mua ngay, Thêm vào giỏ, Lưu sách), active link |
| **Brand Primary Hover** | `#0B5ED7` | Trạng thái rê chuột (hover/focus) của nút chính |
| **Accent Warm (Vàng cam ấm)** | `#D97706` | Điểm nhấn giá bán, sao đánh giá, badge giảm giá, thông báo chú ý |
| **Page Background** | `#F8F9FA` | Nền sáng sạch của toàn trang web |
| **Surface (Nền thẻ & hộp)** | `#FFFFFF` | Nền của Card sách, Modal, Navbar, Form nhập liệu |
| **Text Primary** | `#212529` | Màu chữ đen xám đậm cho tiêu đề sách, đề mục lớn |
| **Text Secondary** | `#6C757D` | Màu chữ phụ cho tác giả, danh mục, mô tả ngắn |
| **Text Price (Giá bán)** | `#DC3545` | Màu đỏ nổi bật bắt buộc cho giá bán sản phẩm |
| **Text Original Price** | `#ADB5BD` | Màu xám gạch ngang cho giá gốc ban đầu |
| **Border Color** | `#DEE2E6` | Viền ngăn cách card, divider, đường kẻ bảng |
| **Success Color** | `#198754` | Trạng thái đặt hàng thành công, badge "Còn hàng" |
| **Danger / Error** | `#DC3545` | Báo lỗi validation, nút Xóa, badge "Hết hàng" |

### 3.2 Typography (Kiểu chữ)
* **Font chữ:** Sử dụng font không chân hiện đại: `'Segoe UI', Roboto, Helvetica, Arial, sans-serif`.
* **Quy chuẩn hiển thị giá:** Mọi số tiền hiển thị trên giao diện phải được định dạng có dấu chấm phân cách hàng nghìn và kèm chữ `đ` hoặc `VNĐ` (Ví dụ: `150.000 đ`). Dùng hàm `price.toLocaleString('vi-VN') + ' đ'`.

### 3.3 Khoảng cách & Bố cục lưới
* Mọi trang nội dung (ngoại trừ Navbar và Footer) đều phải được bọc trong thẻ `<Container className="my-4">` của React-Bootstrap để đảm bảo không bị dính sát mép màn hình.
* Lưới sản phẩm (Grid Card) chuẩn:
  * Mobile (< 768px): 1 đến 2 cột (`xs={12} sm={6}`).
  * Tablet (768px - 991px): 3 cột (`md={4}`).
  * Desktop ($\ge$ 992px): 4 cột (`lg={3}`).

---

## 4. Quy chuẩn Component (Component Specifications)

### 4.1 Thẻ sách (Book Card)
Thẻ sách xuất hiện ở Trang chủ, Danh mục và Sách gợi ý, bắt buộc tuân theo:
1. **Ảnh bìa:** Tỷ lệ khung hình cố định (khuyên dùng chiều cao `260px`), sử dụng thuộc tính `object-fit: cover` để ảnh không bị méo.
2. **Tiêu đề sách:** Giới hạn hiển thị tối đa 2 dòng (dùng CSS `line-clamp: 2`), tránh việc sách có tên dài làm lệch chiều cao hàng card.
3. **Giá bán:** Hiển thị rõ giá bán hiện tại (đỏ, đậm) và giá gốc (nếu có, xám gạch ngang).
4. **Nút tương tác:** Gồm nút *"Xem chi tiết"* (chuyển trang) và nút *"Thêm giỏ hàng"* (kèm icon giỏ hàng).

### 4.2 Biểu mẫu & Kiểm tra hợp lệ (Form & Validation Rules)
Đây là tiêu chí giảng viên chấm điểm rất kỹ:
* **Tuyệt đối không dùng thông báo popup mặc định của trình duyệt:** Thêm thuộc tính `noValidate` vào thẻ `<Form>`.
* **Không dùng `window.alert()` để báo lỗi:** Sử dụng thẻ `<Form.Control.Feedback type="invalid">` của Bootstrap để hiển thị lỗi màu đỏ ngay dưới ô nhập liệu tương ứng.
* **Giữ nguyên dữ liệu người dùng:** Khi submit thất bại hoặc gặp lỗi, không được reset form làm mất dữ liệu người dùng đã gõ.
* **Trạng thái xử lý (Submitting):** Trong lúc gọi API, nút bấm Submit phải chuyển sang trạng thái `disabled` và hiển thị Spinner con bên trong để tránh người dùng nhấn liên tục tạo trùng dữ liệu.

### 4.3 Hộp thoại (Modal)
* Sử dụng component `<Modal>` của React-Bootstrap cho chức năng Thêm/Sửa sách và Thêm/Sửa thể loại.
* **Đóng khi bấm ra ngoài:** Cho phép người dùng click vào vùng mờ (backdrop) hoặc nhấn phím `Escape` (`Esc`) để thoát modal.
* **Xác nhận hành động nguy hiểm:** Khi người dùng nhấn nút "Xóa" một cuốn sách hoặc thể loại, bắt buộc mở một Modal xác nhận nhỏ (Confirm Dialog) hỏi: *"Bạn có chắc chắn muốn xóa [Tên] không?"* với nút "Hủy" và nút "Xác nhận xóa" (màu đỏ).

---

## 5. Quy chuẩn 4 trạng thái dữ liệu (UI States)

Mọi trang hoặc component có lấy dữ liệu từ `json-server` **bắt buộc** phải xử lý đầy đủ 4 trạng thái sau:

1. **Loading State (Đang tải):**
   * Hiển thị `<Spinner animation="border" variant="primary" />` căn giữa màn hình hoặc hiển thị khung xương (Placeholder) trong lúc `loading === true`.
2. **Empty State (Dữ liệu rỗng):**
   * Khi mảng dữ liệu rỗng (ví dụ: không tìm thấy sách, giỏ hàng trống), không được để màn hình trắng trơn.
   * Phải hiển thị thông báo thân thiện (ví dụ: `<Alert variant="info">Không tìm thấy cuốn sách nào phù hợp.</Alert>`) kèm nút điều hướng quay lại mua sắm.
3. **Error State (Tải thất bại):**
   * Khi server `json-server` chưa bật hoặc API trả về lỗi, hiển thị `<Alert variant="danger">Đã có lỗi xảy ra khi tải dữ liệu. Vui lòng thử lại sau.</Alert>` kèm nút *"Thử lại"*.
4. **Image Fallback (Ảnh bìa lỗi):**
   * Nếu đường link ảnh của sách bị hỏng hoặc null, bắt buộc xử lý sự kiện `onError` trên thẻ ảnh để thay thế bằng ảnh placeholder mặc định, tránh xuất hiện icon ảnh vỡ trên giao diện.

---

## 6. Quy chuẩn Quản lý State với Redux Toolkit

Để dự án mạch lạc và dễ dàng phân công công việc:
* Mỗi mảng tính năng quản lý một Slice riêng:
  * `bookSlice.js`: Chứa danh sách sách, chi tiết cuốn sách đang chọn, trạng thái `loading`, `error`.
  * `cartSlice.js`: Chứa mảng các món trong giỏ (`items`), tự động tính `totalQuantity` và `totalAmount`.
  * `categorySlice.js`: Chứa danh sách thể loại.
  * `authSlice.js`: Chứa thông tin tài khoản đăng nhập (`currentUser`), trạng thái đăng nhập và quyền hạn (`role: 'admin' | 'customer'`).
* Mọi thao tác gọi API phải dùng `createAsyncThunk` và xử lý đầy đủ 3 trường hợp trong `extraReducers`: `pending`, `fulfilled`, `rejected`.
* Tránh lưu trữ dữ liệu trùng lặp giữa local state (`useState`) và Redux store.

---

## 7. Cấu trúc mã nguồn & Quy ước đặt tên (Coding Conventions)

### 7.1 Cấu trúc thư mục
```text
src/
├── app/
│   └── store.js                   <-- Cấu hình Redux Store chung
├── components/                    <-- Các component dùng chung toàn app
│   ├── Navbar.jsx
│   ├── Footer.jsx
│   └── ProtectedRoute.jsx
├── features/                      <-- Chia theo từng phân hệ nghiệp vụ
│   ├── auth/                      <-- Đăng nhập, phân quyền (authSlice.js, LoginPage.jsx)
│   ├── books/                     <-- Quản lý sách (bookSlice.js, BookList.jsx, BookDetail.jsx...)
│   ├── cart/                      <-- Giỏ hàng & Checkout (cartSlice.js, CartPage.jsx, CheckoutPage.jsx)
│   └── categories/                <-- Thể loại (categorySlice.js, CategoryListPage.jsx...)
├── index.js
└── App.js
```

### 7.2 Quy ước đặt tên
* **Component & Tên file JSX:** Dùng `PascalCase` (Ví dụ: `BookDetail.jsx`, `BookFormModal.jsx`, `CartPage.jsx`).
* **Hàm & Biến:** Dùng `camelCase` (Ví dụ: `handleAddToCart`, `calculateTotal`, `bookPrice`).
* **Slice & Thunk:** Dùng `camelCase` có ý nghĩa rõ ràng (Ví dụ: `fetchBooks`, `addNewBook`, `deleteCategoryById`).
* **Độ dài Component:** Không viết một component dài quá 250 dòng code. Nếu quá dài, hãy chủ động tách nhỏ thành các sub-components (ví dụ tách `RelatedBooks.jsx`, `CartItemRow.jsx`).

---

## 8. Quy trình phối hợp làm việc trên Git

Để tránh xung đột mã nguồn (conflict code) trong nhóm 5 người:
1. **Quy tắc nhánh chính:** Nhánh `main` là nhánh ổn định, tuyệt đối không commit trực tiếp mã nguồn chưa hoàn thiện lên `main`.
2. **Đặt tên nhánh chức năng (Feature Branch):**
   * `feature/book-browsing` (Thanh Hào)
   * `feature/book-detail` (Anh Tuấn 779)
   * `feature/cart-checkout` (Anh Tuấn 233)
   * `feature/admin-books` (Trung Hiếu)
   * `feature/admin-categories-auth` (Thiên Phúc)
3. **Quy ước Commit Message:**
   * `feat: add book search and category filter` (Thêm tính năng mới)
   * `fix: prevent quantity from exceeding stock in cart` (Sửa lỗi logic)
   * `style: improve responsive layout on book card` (Chỉnh sửa UI/CSS)
   * `refactor: extract related books component` (Tối ưu lại code)
4. **Trước khi tạo Pull Request / Merge:** Bắt buộc chạy thử ứng dụng cục bộ (`npm start`), mở F12 kiểm tra không còn bất kỳ dòng thông báo lỗi (Warning/Error màu đỏ) nào trên Console.

---

## 9. Tiêu chuẩn hoàn thành một màn hình (Definition of Done)

Một màn hình hoặc tính năng chỉ được xem là hoàn thành và sẵn sàng demo khi thỏa mãn:
- [ ] Giao diện hiển thị đúng mã màu, font chữ và sử dụng chuẩn components của React-Bootstrap.
- [ ] Responsive hiển thị tốt trên cả điện thoại (Mobile) và máy tính (Desktop), không bị thanh cuộn ngang toàn trang.
- [ ] Có đầy đủ 4 trạng thái: Loading (Spinner), Dữ liệu hiển thị, Empty state và Error state.
- [ ] Mọi form nhập liệu đều có validation báo lỗi đỏ bên dưới field và chặn bấm nút khi dữ liệu chưa hợp lệ.
- [ ] Các logic nghiệp vụ con hoạt động chính xác (ví dụ: nút tăng số lượng bị khóa khi chạm trần tồn kho `stock`, tổng tiền nhảy realtime).
- [ ] Dữ liệu được đồng bộ chính xác với file `db.json` qua `json-server`.
- [ ] Không có lỗi runtime hoặc warning React trên Console của trình duyệt.

---

## 10. Những điều nghiêm cấm trong dự án

* **Không tự ý cài đặt thêm thư viện UI khác:** Nhóm đã thống nhất dùng **React-Bootstrap**. Tuyệt đối không cài thêm Ant Design, MUI, Tailwind CSS hay thư viện ngoài gây xung đột CSS và nặng dự án.
* **Không hard-code (viết cứng) dữ liệu trong JSX:** Mọi thông tin sách, thể loại, đơn hàng đều phải được lấy động từ Redux Store hoặc API `db.json`.
* **Không dùng inline style tràn lan:** Trừ những trường hợp đặc biệt cần tính toán style động (như phần trăm width), còn lại phải dùng class tiện ích của Bootstrap (`className="d-flex justify-content-between p-3"`...).
* **Không xóa hoặc sửa đổi cấu trúc Slice của thành viên khác** mà chưa có sự đồng ý của bạn phụ trách module đó.

---

## 11. Bảng phân công nhanh theo thư mục chịu trách nhiệm

| Thành viên | MSSV | Thư mục & Files phụ trách chính | Module nghiệp vụ |
| :--- | :---: | :--- | :--- |
| **Trần Nguyễn Thanh Hào** *(Leader)* | CE200338 | `src/features/books/BookList.jsx`, `src/components/Navbar.jsx`, `Footer.jsx` | Xem sách, Tìm kiếm, Lọc danh mục, Layout |
| **Trương Anh Tuấn** | CE200779 | `src/features/books/BookDetail.jsx`, `RelatedBooks.jsx` | Chi tiết sách, Chọn số lượng mua, Sách liên quan |
| **Trương Anh Tuấn** | CE201233 | `src/features/cart/` (`CartPage.jsx`, `CheckoutPage.jsx`, `cartSlice.js`) | Toàn bộ luồng Giỏ hàng, Tính tiền & Đặt hàng |
| **Lương Trung Hiếu** | CE201492 | `src/features/books/BookFormModal.jsx`, `AdminBookList.jsx` | Bảng quản lý sách Admin, Thêm/Sửa/Xóa sách |
| **Đỗ Trần Thiên Phúc** | CE201183 | `src/features/categories/`, `src/features/auth/`, `ProtectedRoute.jsx` | Quản trị thể loại, Đăng nhập & Phân quyền Admin |
