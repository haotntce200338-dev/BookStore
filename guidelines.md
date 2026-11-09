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
  * `src/components/Navbar.jsx`: Thanh điều hướng toàn hệ thống (phân quyền hiển thị theo Role).
  * `src/components/Footer.jsx`: Chân trang thông tin chung.
  * `src/components/ProtectedRoute.jsx`: Chứa `ProtectedRoute` (chặn Customer vào trang Admin) và `CustomerOnlyRoute` (chặn Admin vào Giỏ hàng/Thanh toán).

---

## 3. Quy chuẩn Phân định 2 Phân hệ độc lập (Storefront vs Admin Portal)

> [!IMPORTANT]
> **Quy tắc bất khả xâm phạm:** Hệ thống chia làm 2 không gian hoàn toàn riêng biệt. Tuyệt đối không để Admin dùng chung các tính năng mua sắm của Khách hàng và ngược lại.

### 3.1 Phân hệ Cửa hàng (Customer Storefront)
* **Dành cho:** Khách vãng lai (Guest) và Khách hàng đã đăng nhập (`role === 'customer'`).
* **Phạm vi trang:** Trang chủ (`/`), Chi tiết sách (`/books/:id`), Giỏ hàng (`/cart`), Thanh toán (`/checkout`), Lịch sử đơn hàng cá nhân (`/orders`).
* **Quy tắc với Admin:** 
  * Khi tài khoản có quyền Admin đăng nhập, trên thanh Navbar **phải ẩn nút Giỏ hàng 🛒**, thay bằng nút `[🛡️ Cổng Quản Trị]`.
  * Trên thẻ sách (`BookCard`) và trang chi tiết (`BookDetail`), tài khoản Admin **không nhìn thấy nút "Thêm vào giỏ" hay "Mua ngay"**, mà hiển thị nút liên kết đến trang quản trị kho sách.
  * Các route `/cart` và `/checkout` được bọc bởi `CustomerOnlyRoute`: nếu Admin cố tình gõ link trên trình duyệt, hệ thống sẽ chặn đứng và yêu cầu quay lại Cổng Quản trị.

### 3.2 Phân hệ Quản trị (Admin Portal)
* **Dành cho:** Duy nhất tài khoản Quản trị viên (`role === 'admin'`).
* **Phạm vi trang:** `/admin/dashboard`, `/admin/orders/:orderId`, `/admin/books`, `/admin/categories`.
* **Quy tắc giao diện:** Tuyệt đối không chứa nút Giỏ hàng, không có các thao tác mua sắm. Toàn bộ các trang con đều được bọc bởi `ProtectedRoute allowedRoles={['admin']}`.
* **Tách bạch Component:** Không được viết gộp 1 component vừa render cho Khách vừa render bảng cho Admin bằng biến `mode="admin"`. Phải tách thành các component riêng biệt (ví dụ: `BookList.jsx` cho Khách và `AdminBookListPage.jsx` cho Admin).

---

## 4. Hệ thống Design Tokens (Màu sắc, Typography & Spacing)

### 4.1 Bảng màu quy chuẩn (Color Palette)

| Vai trò | Mã màu | Cách sử dụng trên giao diện |
| :--- | :---: | :---: |
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

### 4.2 Typography & Quy chuẩn hiển thị giá
* **Font chữ:** `'Segoe UI', Roboto, Helvetica, Arial, sans-serif`.
* **Quy chuẩn hiển thị giá tiền:** Bắt buộc định dạng có dấu chấm phân cách hàng nghìn và kèm chữ `đ` hoặc `VNĐ`. Dùng hàm: `Number(price).toLocaleString('vi-VN') + ' đ'`.

### 4.3 Bố cục lưới & Khoảng cách
* Tất cả các trang đều bọc trong `<Container className="my-4">` của React-Bootstrap.
* Lưới sản phẩm (Grid Card) chuẩn: Mobile (`xs={12} sm={6}`), Tablet (`md={4}`), Desktop (`lg={3}`).

---

## 5. Quy chuẩn Xóa mềm (Soft Delete) & Toàn vẹn CSDL

> [!WARNING]
> **Tuyệt đối không sử dụng Xóa cứng (Hard Delete / HTTP DELETE) đối với Sách và Danh mục.**

1. **Cơ chế Xóa mềm:**
   * Mọi đối tượng sách (`books`) và thể loại (`categories`) trong file `db.json` đều có trường `"isDeleted": false`.
   * Khi người dùng bấm "Xóa" một cuốn sách hoặc thể loại, gửi request `PATCH` cập nhật `"isDeleted": true`.
2. **Quy tắc hiển thị (Filtering):**
   * Phía Khách hàng (Trang chủ, Chi tiết, Gợi ý): **Bắt buộc lọc bỏ** những cuốn sách đã bị xóa mềm (`books.filter(b => !b.isDeleted)`).
   * Phía Admin: Bảng quản trị mặc định ẩn sách xóa mềm, đảm bảo giao diện gọn gàng.
3. **Bảo toàn dữ liệu đơn hàng:**
   * Khi sách bị xóa mềm, các đơn hàng cũ trong bảng `orders` vẫn giữ nguyên được tên sách và giá tiền mà không bị lỗi mồ côi dữ liệu.

---

## 6. Quy chuẩn Form, Validation & Modal

### 6.1 Biểu mẫu & Kiểm tra hợp lệ (Form Validation)
* **Chặn popup mặc định của trình duyệt:** Luôn thêm thuộc tính `noValidate` vào thẻ `<Form>`.
* **Nghiêm cấm dùng `window.alert()` để báo lỗi:** Sử dụng `<Form.Control.Feedback type="invalid">` của Bootstrap để hiển thị thông báo lỗi màu đỏ ngay dưới từng ô nhập liệu.
* **Bảo vệ dữ liệu người dùng:** Khi submit thất bại, giữ nguyên toàn bộ dữ liệu người dùng đã gõ trong form, không reset form.
* **Trạng thái Submitting:** Trong khi đang gọi API gửi dữ liệu, nút Submit phải bị `disabled` và hiển thị `<Spinner size="sm" />` để tránh người dùng click đúp gửi trùng dữ liệu.

### 6.2 Hộp thoại (Modal) & Xác nhận thao tác nguy hiểm
* Khi thực hiện hành động nguy hiểm (như Xóa sách, Xóa thể loại, Hủy đơn hàng), **bắt buộc mở Modal xác nhận (Confirm Dialog)** với nút "Hủy" và nút "Xác nhận xóa" (màu đỏ).
* Modal phải tự động đóng khi người dùng click vào vùng mờ (backdrop) hoặc nhấn phím `Esc`.

---

## 7. Quy chuẩn 4 trạng thái dữ liệu (UI States)

Mọi trang hoặc component có lấy dữ liệu từ `json-server` **bắt buộc** phải xử lý đầy đủ 4 trạng thái:

1. **Loading State:** Hiển thị Spinner căn giữa màn hình hoặc khung xương Placeholder khi đang fetch dữ liệu.
2. **Empty State:** Khi dữ liệu rỗng (không tìm thấy sách, giỏ hàng trống), phải hiển thị thông báo thân thiện (ví dụ: `<Alert variant="info">...`) kèm nút điều hướng.
3. **Error State:** Khi API bị lỗi hoặc server chưa bật, hiển thị Alert màu đỏ thông báo lỗi dễ hiểu và có nút **"Thử lại"**.
4. **Image Fallback:** Tất cả các thẻ ảnh bìa sách `<Card.Img>` hoặc `<img>` bắt buộc có sự kiện `onError` để nạp ảnh placeholder mặc định nếu link ảnh bị chết.

---

## 8. Cấu trúc mã nguồn & Quy ước tổ chức thư mục

```text
src/
├── app/
│   └── store.js                   <-- Cấu hình Redux Store chung
├── components/                    <-- Các component dùng chung toàn app
│   ├── Navbar.jsx                 <-- Thanh điều hướng (phân quyền hiển thị theo Role)
│   ├── Footer.jsx                 <-- Chân trang thông tin
│   └── ProtectedRoute.jsx         <-- ProtectedRoute & CustomerOnlyRoute
├── features/                      <-- Chia theo từng phân hệ nghiệp vụ
│   ├── admin/                     <-- Cổng Quản trị viên
│   │   ├── AdminDashboardPage.jsx <-- Bảng điều khiển KPI doanh thu & đơn hàng
│   │   └── AdminOrderDetailPage.jsx <-- Chi tiết đơn hàng, duyệt & từ chối đơn
│   ├── auth/                      <-- Đăng nhập, đăng ký, phiên làm việc
│   │   ├── authSlice.js
│   │   ├── LoginPage.jsx
│   │   └── RegisterPage.jsx
│   ├── books/                     <-- Phân hệ Sách
│   │   ├── bookSlice.js           <-- AsyncThunks & Redux slice sách
│   │   ├── BookList.jsx           <-- Lưới danh mục sách cho Khách hàng
│   │   ├── BookCard.jsx           <-- Thẻ sách (phân biệt nút mua cho Khách vs Admin)
│   │   ├── BookDetail.jsx         <-- Chi tiết sách (chặn Admin mua hàng)
│   │   ├── RelatedBooks.jsx       <-- Sách gợi ý cùng thể loại
│   │   ├── AdminBookListPage.jsx  <-- Bảng quản lý kho sách của Admin
│   │   └── BookFormModal.jsx      <-- Modal Thêm/Sửa sách của Admin (tự sinh mã)
│   ├── cart/                      <-- Giỏ hàng & Thanh toán (Khách hàng)
│   │   ├── cartSlice.js
│   │   ├── CartPage.jsx
│   │   ├── CartItemRow.jsx
│   │   ├── CartSummary.jsx
│   │   ├── CheckoutPage.jsx
│   │   └── OrderSuccessView.jsx
│   ├── categories/                <-- Quản lý Thể loại sách
│   │   ├── categorySlice.js
│   │   ├── CategoryListPage.jsx
│   │   └── CategoryFormModal.jsx
│   └── orders/                    <-- Đơn hàng Khách hàng
│       ├── orderSlice.js
│       └── OrderHistoryPage.jsx
├── App.css                        <-- CSS tùy chỉnh toàn hệ thống
├── App.js                         <-- Khai báo Routes chính
└── index.js
```

---

## 9. Quy trình phối hợp làm việc trên Git

1. **Quy tắc nhánh chính:** Nhánh `main` là nhánh ổn định dùng để nộp bài và demo, tuyệt đối không commit trực tiếp code dang dở lên `main`.
2. **Quy ước đặt tên nhánh:** `feature/<ten-tinh-nang>` (Ví dụ: `feature/admin-dashboard`, `feature/cart-checkout`).
3. **Quy ước Commit Message:**
   * `feat: add admin dashboard with kpi metrics` (Thêm chức năng mới)
   * `fix: prevent admin from adding books to cart` (Sửa lỗi logic/bảo mật)
   * `style: align search bar and category filter` (Sửa giao diện/CSS)
   * `refactor: separate admin book table into standalone page` (Tối ưu cấu trúc)
4. **Kiểm tra trước khi Push/Merge:** Bắt buộc chạy thử lệnh `npm run build` trên máy cá nhân để chắc chắn không có lỗi biên dịch hay cảnh báo (Warning) nào trước khi tạo Pull Request.

---

## 10. NHỮNG ĐIỀU NGHIÊM CẤM TRONG DỰ ÁN

> [!CAUTION]
> Các lỗi dưới đây sẽ gây sập hệ thống hoặc làm mất điểm đồ án rất nặng, nghiêm cấm các thành viên vi phạm:

1. **KHÔNG tự ý `import` hoặc cài đặt thêm thư viện ngoài:** Dự án đã thống nhất bộ thư viện trong `package.json` (React, Redux Toolkit, React-Bootstrap, Axios). Tuyệt đối không tự ý cài thêm Ant Design, Tailwind, MUI, hay thư viện lạ làm sập quá trình build của cả nhóm.
2. **KHÔNG tự ý vẽ thêm các tính năng "ảo" không có trong CSDL:** Mọi tính năng đều phải gắn liền với các bảng thực tế trong `db.json` (`books`, `categories`, `orders`, `users`).
3. **KHÔNG gộp giao diện Khách hàng và Admin vào chung một Component:** Phải tách bạch riêng biệt giữa component hiển thị cho Khách và component bảng quản trị của Admin.
4. **KHÔNG cho phép Admin thực hiện luồng mua sắm:** Admin không được thêm giỏ hàng, không được checkout.
5. **KHÔNG xóa cứng (Hard Delete) dữ liệu:** Phải dùng cờ `isDeleted: true` để bảo vệ toàn vẹn lịch sử đơn hàng.
6. **KHÔNG viết component quá dài:** Nếu component dài quá 250 dòng code, bắt buộc phải tách nhỏ thành các sub-components.

---

## 11. Bảng phân công trách nhiệm chi tiết (Nhóm 5 thành viên)

*(Khớp chính xác 100% với Backlog đồ án Google Sheets)*

| Thành viên | MSSV | Vai trò | Files & Thư mục phụ trách chính | Module nghiệp vụ |
| :--- | :---: | :---: | :--- | :--- |
| **Trần Nguyễn Thanh Hào** | **CE200338** | **Leader** | `src/components/Navbar.jsx`, `Footer.jsx`, `src/features/books/BookList.jsx`, `src/features/admin/AdminDashboardPage.jsx`, `AdminOrderDetailPage.jsx` | Khung layout cửa hàng, Khám phá sách, Tìm kiếm & lọc thể loại, Dashboard KPI doanh thu, Duyệt/Từ chối đơn hàng, Cập nhật & xóa mềm thể loại. |
| **Trương Anh Tuấn** | **CE200779** | Member | `src/features/books/BookDetail.jsx`, `RelatedBooks.jsx`, `src/features/orders/OrderHistoryPage.jsx`, `orderSlice.js` | Chi tiết sản phẩm, Tồn kho, Sách gợi ý cùng thể loại, Lịch sử đơn hàng khách hàng & Chức năng hủy đơn hàng đã đặt. |
| **Trương Anh Tuấn** | **CE201233** | Member | `src/features/cart/` (`CartPage.jsx`, `CartItemRow.jsx`, `CartSummary.jsx`, `CheckoutPage.jsx`, `cartSlice.js`) | Toàn bộ luồng Giỏ hàng, Tính tiền realtime, Đồng bộ `localStorage`, Xác nhận & Đặt hàng (`orders`), Trừ tồn kho tự động. |
| **Lương Trung Hiếu** | **CE201492** | Member | `src/features/books/AdminBookListPage.jsx`, `BookFormModal.jsx` | Phân hệ Quản trị Kho sách Admin (Full CRUD: Xem bảng, Thêm mới, Sửa, Sinh mã `b-101`, Xóa mềm `isDeleted`). |
| **Đỗ Trần Thiên Phúc** | **CE201183** | Member | `src/features/auth/` (`LoginPage.jsx`, `RegisterPage.jsx`, `authSlice.js`), `src/components/ProtectedRoute.jsx`, `src/features/categories/` (`CategoryListPage.jsx`, `CategoryFormModal.jsx`, `categorySlice.js`) | Hệ thống Xác thực (Đăng nhập, Đăng ký mật khẩu mạnh), Phân quyền bảo vệ 2 chiều (`ProtectedRoute`), Xem danh sách & Tạo mới thể loại sách. |
