# 📄 Tài Liệu Phân Tích Nghiệp Vụ (Business Analysis)
## Hệ Thống Quản Lý Tài Liệu – Phạm Vi FPT University

> **Phiên bản:** 1.0  
> **Trạng thái:** Draft  
> **Người soạn:** BA Team  
> **Ngày cập nhật:** 2026-06-11

---

## 1. Tổng Quan Hệ Thống

### 1.1 Mô Tả

Hệ thống Quản lý Tài liệu học thuật dành cho sinh viên, giảng viên và quản trị viên tại FPT University. Nền tảng hỗ trợ upload, lưu trữ đám mây, chia sẻ tài liệu theo môn học, và tích hợp AI Chatbot để hỗ trợ học tập.

### 1.2 Các Nhóm Người Dùng (Roles)

| Role | Mô tả | Đặc quyền chính |
|---|---|---|
| **Student** | Sinh viên đã đăng ký tài khoản | Upload, xem, tìm kiếm tài liệu |
| **Moderator** | Kiểm duyệt viên do Admin chỉ định | Duyệt/từ chối tài liệu công khai |
| **Admin** | Quản trị hệ thống | Toàn quyền: cấu hình, quản lý user, môn học |
| **Guest** | Người dùng chưa đăng nhập | Chỉ xem title + thumbnail |

### 1.3 Kiến Trúc Module

```
┌─────────────────────────────────────────────────────┐
│                  FPT Doc Platform                   │
├──────────────┬──────────────┬───────────┬───────────┤
│ Authentication│  Document    │   Cloud   │ AI Chatbot│
│   Module     │  Management  │  Storage  │  Module   │
└──────────────┴──────────────┴───────────┴───────────┘
```

---

## 2. Module: Authentication (Xác Thực Người Dùng)

### 2.1 Phân Quyền RBAC

#### Ma trận quyền hạn

| Chức năng | Guest | Student | Moderator | Admin |
|---|:---:|:---:|:---:|:---:|
| Xem title + thumbnail | ✅ | ✅ | ✅ | ✅ |
| Xem nội dung tài liệu | ❌ | ✅ | ✅ | ✅ |
| Upload tài liệu | ❌ | ✅ | ✅ | ✅ |
| Duyệt tài liệu công khai | ❌ | ❌ | ✅ | ✅ |
| Xóa tài liệu của người khác | ❌ | ❌ | ✅ | ✅ |
| Quản lý môn học (tag) | ❌ | ❌ | ❌ | ✅ |
| Cấu hình giới hạn upload | ❌ | ❌ | ❌ | ✅ |
| Quản lý user | ❌ | ❌ | ❌ | ✅ |
| Xem báo cáo/thống kê | ❌ | ❌ | ✅ | ✅ |

### 2.2 Phương Thức Đăng Ký & Đăng Nhập

#### Đăng ký tài khoản
- **Bắt buộc xác thực Email OTP** sau khi đăng ký để kích hoạt tài khoản.
- Tránh tài khoản rác/spam phá hoại hệ thống.
- OTP có hiệu lực trong **10 phút**, giới hạn **3 lần gửi lại/ngày**.

#### Đăng nhập
- **Phương thức 1:** Email + Password (form đăng nhập truyền thống).
- **Phương thức 2:** Google SSO (OAuth 2.0) – ưu tiên tích hợp vì đây là môi trường học thuật FPT.

> **Quyết định thiết kế:** Google SSO là phương thức đăng nhập **ưu tiên** vì sinh viên FPT đều có tài khoản Google do trường cấp (`@fpt.edu.vn`). Có thể tận dụng luôn để xác thực "đây có phải sinh viên FPT không".

#### Luồng đăng nhập (Happy Path)

```
[User] --> Chọn "Đăng nhập Google"
       --> Google OAuth Redirect
       --> Callback với token
       --> Backend xác thực domain @fpt.edu.vn
       --> Tạo/cập nhật session
       --> Redirect về Dashboard
```

### 2.3 Trạng Thái Guest (Chưa Đăng Nhập)

| Hành động | Guest được phép? | Ghi chú |
|---|:---:|---|
| Tìm kiếm tài liệu | ✅ | Trả về title + thumbnail |
| Lọc theo môn học | ✅ | Chỉ thấy metadata |
| Xem nội dung file | ❌ | Redirect đến trang Login |
| Download file | ❌ | Yêu cầu đăng nhập |
| Preview nội dung | ❌ | Chỉ xem bìa/trang đầu (thumbnail) |

> **UX Note:** Khi Guest click vào tài liệu → Hiển thị modal "Đăng nhập để đọc tài liệu đầy đủ" thay vì chuyển thẳng sang trang login để tránh mất ngữ cảnh.

---

## 3. Module: Document Management (Quản Lý Tài Liệu)

### 3.1 Cơ Chế Sở Hữu (Ownership)

Tài liệu có **2 trạng thái hiển thị:**

| Trạng thái | Ai thấy? | Quy trình duyệt |
|---|---|---|
| **Private** (Cá nhân) | Chỉ người upload | Không cần duyệt |
| **Public** (Công khai) | Toàn bộ user đã login | Cần Moderator duyệt |

#### Quy trình chuyển từ Private → Public

```
[Student Upload] --> Chọn "Công khai"
                --> Trạng thái: "Chờ duyệt (Pending)"
                --> Moderator nhận thông báo
                --> Moderator review
                    ├── Duyệt → Trạng thái: "Public" (hiển thị)
                    └── Từ chối → Trạng thái: "Rejected" + gửi lý do về Student
```

### 3.2 Quy Trình Phê Duyệt (Approval Workflow)

#### Vai trò Moderator
- Xem danh sách tài liệu đang chờ duyệt (Pending Queue).
- Xem preview nội dung tài liệu trước khi duyệt.
- Hành động: **Approve** / **Reject** (kèm lý do từ chối).
- Không có quyền chỉnh sửa nội dung tài liệu.

#### Tiêu chí từ chối (gợi ý)
- Nội dung không liên quan đến học thuật.
- Vi phạm bản quyền rõ ràng.
- File bị hỏng hoặc không đọc được.
- Nội dung không phù hợp (spam, quảng cáo...).

### 3.3 Xử Lý Dữ Liệu Trùng Lặp (Data Deduplication)

> **⚠️ Mở (Open Question) – Cần quyết định kỹ thuật:**

**Phương án A – Lưu 2 file riêng (Đơn giản):**
- Mỗi upload là 1 bản ghi độc lập.
- Ưu điểm: Dễ implement, mỗi file có metadata riêng (owner, ngày upload, môn học...).
- Nhược điểm: Tốn storage khi có nhiều bản sao.

**Phương án B – Content Deduplication (Phức tạp hơn):**
- Tính hash (SHA-256) của file khi upload.
- Nếu hash trùng → lưu 1 file vật lý duy nhất, tạo nhiều bản ghi metadata khác nhau (reference đến cùng 1 file trên Cloud).
- Ưu điểm: Tiết kiệm storage đáng kể.
- Nhược điểm: Phức tạp khi xử lý xóa (cần đếm reference count).

> **Khuyến nghị:** Bắt đầu với Phương án A để MVP nhanh. Migrate sang B khi dung lượng trở thành vấn đề thực tế.

### 3.4 Metadata Môn Học

- Danh sách môn học là **danh sách tĩnh (Static)** do **Admin quản lý**.
- Student **không được tự tạo** tag môn học mới.
- Student chỉ **chọn từ danh sách** có sẵn khi upload.
- Student có thể **đề xuất** môn học mới → Admin duyệt.

#### Cấu trúc metadata tài liệu

```json
{
  "id": "uuid",
  "title": "Tên tài liệu",
  "description": "Mô tả ngắn",
  "subject": "Lập trình Web",
  "subject_code": "WEB401",
  "semester": "Summer 2025",
  "owner_id": "student_uuid",
  "visibility": "public | private",
  "status": "pending | approved | rejected",
  "file_url": "gs://bucket/path/to/file",
  "thumbnail_url": "gs://bucket/path/thumbnail.jpg",
  "created_at": "ISO8601",
  "approved_at": "ISO8601",
  "approved_by": "moderator_uuid"
}
```

---

## 4. Module: Cloud Storage (Lưu Trữ Đám Mây)

### 4.1 Giới Hạn File (Validation)

#### Định dạng được phép upload

| Loại | Extension | MIME Type |
|---|---|---|
| Tài liệu | `.pdf` | `application/pdf` |
| Word | `.docx`, `.doc` | `application/vnd.openxmlformats...` |
| Text | `.txt` | `text/plain` |
| Hình ảnh | `.png`, `.jpg`, `.jpeg` | `image/png`, `image/jpeg` |

> **Lưu ý:** Admin có thể **cấu hình bật/tắt** từng loại định dạng và **giới hạn dung lượng tối đa** (ví dụ: mặc định 50MB/file) thông qua trang Admin Settings mà không cần deploy lại code.

#### Validation rules (Backend)
- Kiểm tra MIME type thực sự của file (không chỉ dựa vào extension).
- Quét virus cơ bản trước khi lưu (nếu tích hợp được).
- Giới hạn số file upload/ngày theo cấu hình Admin.

### 4.2 Cơ Chế Preview

#### Ưu tiên: PDF.js (Self-hosted)
- Render PDF trực tiếp trên trình duyệt, không gửi file ra bên ngoài.
- Bảo vệ tốt hơn về quyền riêng tư dữ liệu.
- Có thể cấu hình disable right-click, disable copy text, disable print.

#### Chính sách Preview theo Role

| Hành động trong Preview | Guest | Student | Moderator | Admin |
|---|:---:|:---:|:---:|:---:|
| Xem thumbnail/trang bìa | ✅ | ✅ | ✅ | ✅ |
| Đọc toàn bộ nội dung | ❌ | ✅ | ✅ | ✅ |
| Copy text | ❌ | ⚙️ (cấu hình) | ✅ | ✅ |
| Download file gốc | ❌ | ✅ | ✅ | ✅ |
| In tài liệu | ❌ | ⚙️ (cấu hình) | ✅ | ✅ |

> **Lưu ý kỹ thuật:** PDF.js chỉ áp dụng cho file PDF. Với file `.docx`, cần convert sang PDF trên server trước khi render preview, hoặc dùng Google Docs Viewer làm fallback.

### 4.3 Vòng Đời File (Lifecycle)

#### Soft Delete (Xóa mềm – Khuyến nghị)

```
[Student/Admin xóa file]
        │
        ▼
  Trạng thái: "DELETED"
  Ẩn khỏi giao diện người dùng
        │
        ▼ (trong 30 ngày)
  File vẫn tồn tại trên Cloud Storage
  Admin/Owner có thể Restore
        │
        ▼ (sau 30 ngày)
  Cron Job tự động Hard Delete
  Xóa hoàn toàn khỏi Cloud Storage
```

#### Lý do chọn Soft Delete
- Tránh mất dữ liệu do xóa nhầm.
- Tài liệu công khai có thể đang được nhiều người học → không nên xóa ngay.
- Cho phép Admin audit log và restore khi cần.

#### API Design gợi ý
```
DELETE /api/documents/{id}        → Soft delete (student tự xóa)
POST   /api/documents/{id}/restore → Restore (trong 30 ngày)
DELETE /api/admin/documents/{id}/hard → Hard delete (Admin only)
```

---

## 5. Module: AI Chatbot

### 5.1 Phạm Vi Dữ Liệu (Scope of Knowledge)

**Khuyến nghị thiết kế theo 3 cấp độ:**

| Cấp | Phạm vi | Mô tả |
|---|---|---|
| **Cấp 1** | File đang mở | AI chỉ trả lời trong ngữ cảnh tài liệu user đang xem |
| **Cấp 2** | Môn học | AI tổng hợp từ tất cả tài liệu công khai của môn học đó |
| **Cấp 3** | Toàn kho | AI tìm kiếm toàn bộ hệ thống (tốn token nhất) |

> **Khuyến nghị cho MVP:** Bắt đầu với **Cấp 1** (document-scoped RAG). Đơn giản nhất, kiểm soát được chi phí, và câu trả lời chính xác nhất.

#### Kiến trúc RAG (Retrieval-Augmented Generation)

```
[User hỏi] --> Embedding câu hỏi
           --> Vector Search trong file đang mở
           --> Truy xuất các đoạn văn liên quan (top-k chunks)
           --> Gửi context + câu hỏi lên LLM API
           --> Nhận câu trả lời + citation
           --> Hiển thị cho user
```

### 5.2 Khả Năng Đọc Hiểu (Parsing & OCR)

| Loại file | Xử lý |
|---|---|
| PDF có text (searchable) | Extract text trực tiếp, không cần OCR |
| PDF scan (image-based) | **Cần OCR** trước khi index vào vector store |
| DOCX | Extract text qua thư viện (python-docx...) |
| File ảnh PNG/JPG | **Cần VLM/OCR** nếu muốn AI đọc được |

> **Quyết định thiết kế:** Với MVP, chỉ hỗ trợ PDF có text và DOCX. File scan và ảnh hiển thị cảnh báo "AI chưa hỗ trợ loại file này."

### 5.3 Kiểm Soát Chi Phí (Rate Limiting)

#### Phân hạng tài khoản (đề xuất)

| Hạng | Lượt chat AI/ngày | Mô tả |
|---|---|---|
| **Free** | 10 lượt/ngày | Mặc định cho tất cả Student |
| **Premium** | 50 lượt/ngày | Tài khoản trả phí hoặc được Admin cấp |
| **Moderator** | Không giới hạn | Cần dùng để kiểm tra tài liệu |
| **Admin** | Không giới hạn | Toàn quyền |

> **Lưu ý:** Giới hạn này có thể được Admin cấu hình động, không hardcode trong code.

#### Chiến lược tiết kiệm chi phí
- Cache câu trả lời cho câu hỏi giống nhau trong cùng tài liệu.
- Giới hạn độ dài context gửi lên LLM (chunking hợp lý).
- Dùng model nhỏ hơn (ví dụ Claude Haiku) cho câu hỏi đơn giản.

### 5.4 Độ Chính Xác & Nguồn Dẫn (Citation)

**AI bắt buộc phải trả kèm citation** mỗi câu trả lời.

#### Format citation

```
Câu trả lời: [Nội dung trả lời của AI]

---
📚 Nguồn tham khảo:
• [Tên tài liệu] – Trang 12, Đoạn 3
• [Tên tài liệu] – Trang 45, Đoạn 1
```

#### UI hiển thị citation
- Click vào citation → Scroll/highlight đoạn tương ứng trong PDF Viewer.
- Giúp user kiểm chứng độ chính xác của AI.
- Tuân thủ nguyên tắc "AI là trợ lý, không phải nguồn truth duy nhất".

---

## 6. Tóm Tắt Các Quyết Định Thiết Kế Chính

| # | Quyết định | Lựa chọn | Lý do |
|---|---|---|---|
| 1 | Xác thực tài khoản | Email OTP + Google SSO | Phù hợp môi trường FPT (email @fpt.edu.vn) |
| 2 | Guest access | Title + thumbnail only | Khuyến khích đăng ký, bảo vệ nội dung |
| 3 | Ownership tài liệu | Dual (Private/Public) | Linh hoạt cho cá nhân lẫn cộng đồng |
| 4 | Approval workflow | Có role Moderator | Kiểm soát chất lượng nội dung |
| 5 | Tag môn học | Admin-managed static list | Tránh tag rác, đảm bảo nhất quán |
| 6 | File limits | Admin-configurable | Linh hoạt, không cần redeploy |
| 7 | Preview engine | PDF.js (self-hosted) | Bảo mật, kiểm soát tốt hơn |
| 8 | Xóa file | Soft delete + 30 ngày | Tránh mất dữ liệu, hỗ trợ restore |
| 9 | AI scope | Document-scoped RAG | Chi phí kiểm soát được, accuracy cao |
| 10 | AI citation | Bắt buộc | Tính minh bạch, kiểm chứng được |

---

## 7. Các Vấn Đề Mở (Open Questions)

Những điểm này cần thảo luận thêm với team trước khi bước vào thiết kế kỹ thuật chi tiết:

- [ ] **Deduplication:** Chọn Phương án A (simple) hay B (hash-based) cho lưu trữ file?
- [ ] **AI Scope MVP:** Chỉ Cấp 1 (file đang mở) hay cũng hỗ trợ Cấp 2 (môn học)?
- [ ] **OCR:** Có hỗ trợ PDF scan ngay từ đầu hay để backlog?
- [ ] **Premium tier:** Ai được nâng lên Premium? Trả phí hay Admin cấp thủ công?
- [ ] **Moderator assignment:** Admin tự chỉ định Moderator hay có quy trình apply?
- [ ] **Notification:** Kênh thông báo (email / in-app) khi tài liệu được duyệt/từ chối?

---

*Tài liệu này được tạo để phục vụ mục đích phân tích nghiệp vụ (Business Analysis) trong phạm vi học thuật tại FPT University. Mọi quyết định kỹ thuật cần được xác nhận thêm trong giai đoạn System Design.*
