# Project Report – ReactJS Group Project

## Project Information

* **Project Title:** BookStore Web Application – Modern Online Bookstore & Inventory Management Platform
* **Team Name:** Group 1 – Class SE18 / SE2002 (FER202)
* **Group Members:**

| Name | Student ID | Contribution (%) | Main Tasks |
| :--- | :---: | :---: | :--- |
| **Tran Nguyen Thanh Hao** | **CE200338** | 20% | **Team Leader:** Global layout (`Navbar`, `Footer`), Public Book Catalog & Real-time Search/Category Filtering (`BookList`, `BookCard`), Admin KPI & Revenue Dashboard (`AdminDashboardPage`), Order Delivery Management (`AdminOrderDetailPage`), Category Update & Soft Delete (`CategoryListPage`). |
| **Truong Anh Tuan** | **CE200779** | 20% | Book Details Page (`BookDetail`), Stock-guarded quantity selector, Related books recommendation (`RelatedBooks`), Customer Order History Page & Order Cancellation (`OrderHistoryPage`, `orderSlice`). |
| **Truong Anh Tuan** | **CE201233** | 20% | Full Shopping Cart module (`CartPage`, `CartItemRow`, `CartSummary`, `cartSlice`), `localStorage` persistence, Checkout & Order Placement (`CheckoutPage`), Shipping form validation, Automatic inventory deduction. |
| **Luong Trung Hieu** | **CE201492** | 20% | Admin Book Management (`AdminBookListPage`), Book Create/Update Modal with inline validation (`BookFormModal`), Book Soft Delete implementation (`isDeleted: true`). |
| **Do Tran Thien Phuc** | **CE201183** | 20% | User Authentication: Login, Logout, Register with password complexity validation (`LoginPage`, `RegisterPage`, `authSlice`), Route Guard protection (`ProtectedRoute`), Category List View & Category Creation (`CategoryListPage`, `CategoryFormModal`, `categorySlice`). |

---

## Project Overview

### 1. Problem Statement & Proposed Solution

* **Problem Statement (Problem Definition):**
  Traditional brick-and-mortar bookstores and outdated web systems face major operational hurdles: readers experience friction in finding books, lack real-time stock visibility, and endure slow, unvalidated checkout processes. From a store management perspective, manual inventory tracking often leads to overselling (stockouts after payment), orphaned order records caused by hard-deleting discontinued books, and a lack of centralized real-time revenue analytics.

* **Proposed Solution:**
  The **BookStore Web Application** provides an end-to-end, single-page e-commerce and administrative ecosystem:
  1. *For Consumers:* A responsive, light-first editorial browsing experience featuring real-time multi-criteria filtering, stock-bounded quantity selection, persistent local cart management, and seamless order placement.
  2. *For Administrators:* A fully isolated administrative portal with live KPI analytics, non-destructive inventory lifecycle management via **Soft Deletion (`isDeleted: true`)**, and dedicated single-click order approval/rejection workflows.

### 2. Software Development Methodology & Rationale

* **Adopted Methodology:** **Iterative & Incremental Development (Agile / Scrum framework)**.
* **Implementation within the Project:**
  Development was executed across two distinct iterations as reflected in our project backlog:
  * **Iteration 1 (Core Architecture & Fundamental Features):** Repository setup, global layout (`Navbar`, `Footer`), public book catalog (`BookList`), single product details (`BookDetail`), user authentication (`authSlice`, `LoginPage`), and administrative book listing.
  * **Iteration 2 (Business Logic & Advanced Management):** Real-time search and category filtering, shopping cart persistence, multi-field validated checkout, customer order cancellation, admin revenue KPI dashboard, order delivery processing, and category management.
* **Rationale (Why this model?):**
  1. *Early Value Delivery:* Enables working software increments to be tested early at the end of Iteration 1 rather than deferring integration to the deadline.
  2. *Adaptive Risk Mitigation:* Breaking the workload into feature-focused iterations allowed the team to discover edge cases early (e.g., preventing hard deletes, implementing role-based route guards).
  3. *Clear Task Accountability:* Aligns directly with our 5-member team structure, enabling parallel feature development without merge conflicts.

### 3. Key Features
* **Role-Based Access Control (RBAC) & Route Guards:**
  * Two distinct user roles: `admin` and `customer`, with persistent session management via `localStorage`.
  * `ProtectedRoute`: Restricts unauthorized access to administrative paths (`/admin/*`), rendering an intuitive 403 Access Denied interface.
  * `CustomerOnlyRoute`: Blocks administrative accounts from accessing customer-specific shopping routes (`/cart`, `/checkout`).
* **Catalog Discovery, Search & Filtering:**
  * Responsive book grid with fixed cover aspect ratios (`260px`, `object-fit: cover`) and fallback placeholder handling for broken image URLs.
  * Instant real-time filtering by book title or author keyword, combined with category selection via a dropdown menu.
* **Product Details & Stock Control:**
  * Comprehensive book metadata display including stock availability badges, selling prices, and original prices.
  * Stock-constrained quantity selector bounded strictly within `[1, stock]`, automatically disabling increment/decrement controls at boundary values.
  * Dynamic related-product recommendations (`RelatedBooks`) filtered by matching `categoryId`.
* **Shopping Cart Management:**
  * Add-to-cart capability with automatic quantity accumulation, constrained by available stock.
  * Inline quantity adjustment, item removal with confirmation modals, and automatic computation of total quantity and order total.
  * Full synchronization with browser `localStorage`.
* **Checkout & Order Processing:**
  * Comprehensive delivery form with client-side validation for recipient name, contact phone number, delivery address, and payment method selection.
  * Automatic inventory deduction in `db.json` upon successful order creation.
* **Customer Order History & Cancellation:**
  * Dedicated customer order tracking page displaying chronological purchases with color-coded status badges.
  * Customer-initiated order cancellation for orders still in `Pending` status, complete with mandatory cancellation reason submission.
* **Admin Inventory & Category Management (CRUD):**
  * Centralized tabular views for book and category catalogs with shared creation/edit modals and robust inline validation.
  * **Soft Delete Mechanism:** Books and categories utilize an `isDeleted: true` flag rather than permanent deletion, preserving historical data integrity across existing customer orders.
* **Admin Sales Dashboard & Order Delivery:**
  * Four KPI metric cards: Total Revenue (calculated exclusively from `Delivered` orders), Total Orders (highlighting pending approvals), Inventory Status (monitoring out-of-stock items), and Total Active Categories.
  * Tab-filtered order management (`ALL`, `Pending`, `Delivered`, `Cancelled`).
  * Dedicated Order Detail page (`AdminOrderDetailPage`) supporting instant approval (`Delivered`) or order rejection with a mandatory reason.

### 4. Technology Stack
* **Frontend:** ReactJS 19 (`react`, `react-dom`), React Router DOM v6 (`react-router-dom`).
* **State Management:** Redux Toolkit (`@reduxjs/toolkit`) + `createAsyncThunk`, `react-redux`.
* **UI Framework:** React-Bootstrap (v2.10.9), Bootstrap (v5.3.3), Custom CSS (`App.css`).
* **Backend:** Mock REST API powered by `json-server` (running on port `3001` with `db.json`).
* **Others:** `axios` (HTTP requests), `localStorage` API (session and cart persistence).

---

## Application Architecture

### Folder Structure
```text
src/
├── app/
│   └── store.js                      # Centralized Redux Toolkit Store configuration
├── components/                       # Shared global components
│   ├── Navbar.jsx                    # Navigation header with role-based action controls
│   ├── Footer.jsx                    # Global footer with site and academic metadata
│   └── ProtectedRoute.jsx            # Route Guards: ProtectedRoute & CustomerOnlyRoute
├── features/                         # Feature-driven module architecture
│   ├── admin/                        # Administrative portal module
│   │   ├── AdminDashboardPage.jsx    # KPI metrics dashboard & recent order management
│   │   └── AdminOrderDetailPage.jsx  # Order details view, approval and rejection actions
│   ├── auth/                         # User authentication module
│   │   ├── authSlice.js              # Redux slice for user session and role management
│   │   ├── LoginPage.jsx             # User login interface
│   │   └── RegisterPage.jsx          # Customer registration interface with password security
│   ├── books/                        # Book management module
│   │   ├── bookSlice.js              # AsyncThunks for catalog, details, and related books
│   │   ├── BookList.jsx              # Public book catalog with search and category filters
│   │   ├── BookCard.jsx              # Book card component with stock badges and CTA buttons
│   │   ├── BookDetail.jsx            # Book details page with stock-bounded quantity selector
│   │   ├── RelatedBooks.jsx          # Related books recommendation component
│   │   ├── AdminBookListPage.jsx     # Admin book inventory management table
│   │   └── BookFormModal.jsx         # Shared modal form for creating and editing books
│   ├── cart/                         # Shopping cart & checkout module
│   │   ├── cartSlice.js              # Cart state management, auto totals, and localStorage sync
│   │   ├── CartPage.jsx              # Shopping cart view with item adjustment controls
│   │   ├── CartItemRow.jsx           # Individual cart row item component
│   │   ├── CartSummary.jsx           # Order summary with subtotal and checkout button
│   │   ├── CheckoutPage.jsx          # Shipping details form and order submission
│   │   └── OrderSuccessView.jsx      # Order confirmation and success view
│   ├── categories/                   # Category management module
│   │   ├── categorySlice.js          # AsyncThunks for category CRUD operations
│   │   ├── CategoryListPage.jsx      # Admin category list table view
│   │   └── CategoryFormModal.jsx     # Shared modal form for creating and editing categories
│   └── orders/                       # Customer order tracking module
│       ├── orderSlice.js             # AsyncThunks for order history and order cancellation
│       └── OrderHistoryPage.jsx      # Customer order history view and cancellation dialog
├── App.css                           # Global design system tokens and styling overrides
├── App.js                            # Central routing configuration (React Router DOM)
└── index.js                          # Application entry point with Redux Provider and CSS
```

### Redux Data Flow Diagram

*(Insert diagram image generated from the provided Mermaid flowchart)*

### Explanation of Flow:
1. **Component triggers an action:** When a component mounts or a user initiates an interaction (e.g., browsing the catalog, viewing book details, or adding an item to the cart), the component invokes `dispatch(fetchBooks())` or `dispatch(addToCart({ book, quantity }))`.
2. **Action is handled by an Async Thunk:** The `createAsyncThunk` function manages the asynchronous call lifecycle and executes an HTTP request via Axios to the JSON Server endpoint (e.g., `GET http://localhost:3001/books`).
3. **API Response is returned:** The JSON Server returns the requested payload (or an HTTP error status code) back to the pending thunk promise.
4. **Redux Store is updated via extraReducers:** The corresponding slice's `extraReducers` captures the `.pending`, `.fulfilled`, or `.rejected` lifecycle states and updates the slice state immutably.
5. **Components reflect new data via useSelector():** Any component subscribed to relevant state slices via `useSelector` automatically re-renders with the updated data.

---

## Functionality & Screenshots

| Feature | Description | Screenshot Placeholder |
| :--- | :--- | :---: |
| **List View (Public Catalog)** | Responsive book grid; real-time search by title/author and category dropdown filtering; automatically hides soft-deleted books. | `[Screenshot: BookList with Search & Category Filter]` |
| **Detail View (Book Details)** | Detailed view of book information; quantity selector bounded strictly by real-time inventory (`stock`); dynamic related books recommendation. | `[Screenshot: BookDetail with Stock Guard & RelatedBooks]` |
| **Cart Management** | Shopping cart table supporting inline quantity updates, inventory limits, instant total calculation, and persistent storage in `localStorage`. | `[Screenshot: CartPage with Summary & Quantity Controller]` |
| **Checkout & Order Placement** | Shipping details form; automatic order persistence, background inventory deduction in `db.json`, and redirect to the confirmation screen. | `[Screenshot: CheckoutPage & OrderSuccessView]` |
| **Customer Order History** | Personal purchase order tracking with status indicators; allows customers to cancel `Pending` orders with a mandatory reason. | `[Screenshot: OrderHistoryPage with Cancellation Modal]` |
| **Admin Sales Dashboard** | Executive management dashboard featuring 4 KPI metric cards, inventory health tracking, and tab-based order filtering. | `[Screenshot: AdminDashboardPage with KPI metrics]` |
| **Admin Order Detail & Processing** | Comprehensive view of customer shipping and ordered items; includes single-click approval (`Delivered`) and rejection workflows. | `[Screenshot: AdminOrderDetailPage]` |
| **Admin Book Management (CRUD)** | Tabular book inventory view; modal form for creating and updating books with field validation and soft delete enforcement. | `[Screenshot: AdminBookListPage & BookFormModal]` |
| **Admin Category Management (CRUD)** | Category management table; create/edit modal with duplicate-name prevention and soft deletion safeguards. | `[Screenshot: CategoryListPage & CategoryFormModal]` |
| **Route Guard & Authorization** | Two-tier authentication system; access restriction using `ProtectedRoute` (403 view) and `CustomerOnlyRoute`. | `[Screenshot: LoginPage & 403 Access Denied View]` |

---

## Task Allocation & Contribution

*(Directly mapped from the official team Backlog)*

| Task | Assigned To | Completion Rate | Notes |
| :--- | :---: | :---: | :--- |
| **View Main Navigation Layout** | Tran Nguyen Thanh Hao (CE200338) | **100% (Done)** | Global layout implementation: responsive `Navbar` with role-based navigation links and `Footer` (Iteration 1). |
| **View Public Books Catalog** | Tran Nguyen Thanh Hao (CE200338) | **100% (Done)** | Public book catalog view (`BookList`) and responsive book card presentation (`BookCard`) (Iteration 1). |
| **Search & Filter Books** | Tran Nguyen Thanh Hao (CE200338) | **100% (Done)** | Real-time title/author search toolbar combined with dynamic category dropdown filtering (Iteration 2). |
| **Admin Overview & Revenue Dashboard** | Tran Nguyen Thanh Hao (CE200338) | **100% (Done)** | Executive `AdminDashboardPage` with 4 KPI metrics, revenue aggregation from delivered orders, and status tabs (Iteration 2). |
| **Update & Delete A Category** | Tran Nguyen Thanh Hao (CE200338) | **100% (Done)** | Category update modal form and category soft-delete action on `CategoryListPage` (Iteration 2). |
| **Manage Order Delivery (View, Approve, Reject)** | Tran Nguyen Thanh Hao (CE200338) | **100% (Done)** | Dedicated `AdminOrderDetailPage` with order approval (`Delivered`) and rejection modal with mandatory reason (Iteration 2). |
| **View Book Details & Related Books** | Truong Anh Tuan (CE200779) | **100% (Done)** | Detailed `BookDetail` view, stock-constrained quantity selector, and dynamic `RelatedBooks` component (Iteration 1). |
| **View Customer Order History & Cancel Placed Order** | Truong Anh Tuan (CE200779) | **100% (Done)** | Chronological `OrderHistoryPage`, `orderSlice` state management, and cancellation modal dialog (Iteration 2). |
| **Add Book to Cart & View Shopping Cart** | Truong Anh Tuan (CE201233) | **100% (Done)** | Core cart state architecture (`cartSlice`), `CartPage` view, quantity accumulation, and `localStorage` synchronization (Iteration 1). |
| **Update Cart Item Quantity & Remove Item** | Truong Anh Tuan (CE201233) | **100% (Done)** | Inline quantity adjustments in `CartItemRow`, item removal confirmation modal, and sticky `CartSummary` (Iteration 2). |
| **Place Order (Checkout)** | Truong Anh Tuan (CE201233) | **100% (Done)** | Shipping form on `CheckoutPage`, client-side input validation, order submission, and automated stock deduction (Iteration 2). |
| **View Admin Books List & Create New Book** | Luong Trung Hieu (CE201492) | **100% (Done)** | Admin inventory table (`AdminBookListPage`) and shared creation modal dialog (`BookFormModal`) (Iteration 1). |
| **Update Book Details & Delete Book (Soft Delete)** | Luong Trung Hieu (CE201492) | **100% (Done)** | Book updating workflow and non-destructive soft-delete implementation (`isDeleted: true`) (Iteration 2). |
| **User Authentication (Login, Logout, Register)** | Do Tran Thien Phuc (CE201183) | **100% (Done)** | User authentication pages (`LoginPage`, `RegisterPage`) and centralized session management (`authSlice`) (Iteration 1). |
| **Protect Admin Routes** | Do Tran Thien Phuc (CE201183) | **100% (Done)** | Route guard component `ProtectedRoute.jsx` preventing unauthorized administrative access with a 403 screen (Iteration 1). |
| **View Categories List & Create A Category** | Do Tran Thien Phuc (CE201183) | **100% (Done)** | Admin category table (`CategoryListPage`) and category creation modal form (`CategoryFormModal`) (Iteration 2). |
| **Final Report & Presentation** | All Members | **100% (Done)** | Technical report compilation, end-to-end integration testing across modules, and presentation slide deck preparation. |

---

## Bug Report & Known Issues

| Bug/Issue | Status | Notes |
| :--- | :---: | :--- |
| **Hard Deletion Breaking Historical Order Records** | **Resolved** | Replaced permanent HTTP `DELETE` calls with a non-destructive Soft Delete mechanism (`PATCH { isDeleted: true }`) for books and categories, preserving historical titles and pricing across existing customer orders. |
| **Admin Accounts Inadvertently Accessing Shopping Cart** | **Resolved** | Introduced a bidirectional `CustomerOnlyRoute` guard and dynamically hid the Cart icon on the `Navbar` for `admin` accounts, preventing administrators from entering consumer shopping flows. |
| **Cart Quantity Exceeding Warehouse Inventory** | **Resolved** | Enforced strict boundary clamping `[1, stock]` on both the product detail page and cart table, automatically disabling increment buttons when the maximum available stock is reached. |
| **Broken Image Links for External Book Covers** | **Resolved** | Attached an `onError` event handler to all book cover images to seamlessly load a high-resolution fallback placeholder when remote image URLs fail. |
| **Double Submission During API Request Latency** | **Resolved** | Implemented a `submitting` state across all modals and checkout forms, disabling submit buttons and displaying inline `<Spinner size="sm" />` elements during active network requests. |
| **Cancellation Reason Schema Inconsistency** | **Resolved** | Synchronized both `cancelReason` and `cancellationReason` fields across `orderSlice.js` and `AdminOrderDetailPage.jsx` to ensure consistent data display between consumer order cancellation and administrator rejection. |
| **Page Flickering on Route Transitions** | **Resolved** | Wrapped code-split route components (`BookDetail`) in `React.lazy()` with a branded `<Suspense>` loading fallback, providing a smooth visual transition. |

### Key Lessons Learned:
1. **Data Integrity over Hard Deletion:** Soft deleting records (`isDeleted: true`) is crucial in commercial applications to preserve foreign key consistency and historical transaction records.
2. **Defensive UI & Asynchronous State:** Always enforce boundary validation on the client side (e.g., constraining purchase quantity by real-time inventory limits) and handle loading/submitting states to prevent double submission during network latency.
3. **Strict Route Segregation (RBAC):** Separating customer storefront operations from administrative portal routes using dedicated route guards (`CustomerOnlyRoute` and `ProtectedRoute`) prevents privilege escalation and business logic conflicts.
4. **Data Schema Consistency Across Modules:** In team projects where different developers build buyer and seller features, early alignment on JSON schema naming (e.g., `cancelReason` vs `cancellationReason`) is essential to prevent subtle bugs.

---

## Setup Instructions

### Requirements
* **Node.js:** Version 18.x or higher (includes `npm`).
* **JSON Server:** Can be run directly via `npx json-server` without global installation.

### How to Run

**Step 1: Install Dependencies**
```bash
npm install
```

**Step 2: Start the Mock REST API Server (Terminal 1)**
> Launch `json-server` on port `3001` watching `db.json`:
```bash
npx json-server --watch db.json --port 3001
```
*API Base URL:* `http://localhost:3001`

**Step 3: Start the React Development Server (Terminal 2)**
> Open a second terminal window and run:
```bash
npm start
```
*The client application will automatically open at:* `http://localhost:3000`

**Step 4: Pre-configured Demo Accounts (`db.json`)**
* **Administrator:** Username: `admin` | Password: `123` *(Grants full access to all `/admin/*` routes)*
* **Customer:** Username: `customer` | Password: `123` *(Grants access to catalog, cart, checkout, and order history)*
