# API Linked Status

Tài liệu này ghi lại trạng thái link API của FE hiện tại sau khi nối lại theo
`docs/backend/api_endpoints.md`.

## Authentication & Users

| API | FE đang dùng ở đâu | Trạng thái |
| --- | --- | --- |
| `POST /api/auth/register` | `/signup` | Đã link |
| `POST /api/auth/verify-otp` | `/verify-otp` | Đã link |
| `POST /api/auth/login` | `/login` | Đã link |
| `POST /api/auth/google` | `src/features/auth/api/auth-api.ts` | Có hàm API, chưa có OAuth token flow trên UI |
| `GET /api/users` | `/admin/users`, `/admin/users/[id]` | Đã link |
| `PUT /api/users/[id]` | `/admin/users`, `/admin/users/[id]` | Đã link |

## Documents

| API/request | FE đang dùng ở đâu | Trạng thái |
| --- | --- | --- |
| `POST /api/documents/upload-url` | `/user/upload` | Đã link |
| `PUT <presigned-upload-url>` | `/user/upload` | Đã link |
| `POST /api/documents` | `/user/upload` | Đã link |
| `GET /api/documents` | `/user/library`, `/admin/documents` | Đã link |
| `GET /api/documents/[id]` | `/admin/documents/[id]` | Đã link |
| `POST /api/documents/[id]/moderate` | `/admin/documents`, `/admin/documents/[id]` | Đã link |
| `DELETE /api/documents/[id]` | `/admin/documents/[id]` | Đã link |
| `POST /api/documents/[id]/restore` | `/admin/documents/[id]` | Đã link |
| `DELETE /api/admin/documents/[id]/hard` | `/admin/documents/[id]` | Đã link |
| `GET /api/documents/[id]/audit` | `/admin/documents/[id]` | Đã link |

## Subjects

| API | FE đang dùng ở đâu | Trạng thái |
| --- | --- | --- |
| `GET /api/subjects` | `/user/upload`, `/admin/subjects`, `/admin/subjects/[id]` | Đã link |
| `POST /api/subjects` | `/admin/subjects/new` | Đã link |
| `PUT /api/subjects/[id]` | `/admin/subjects/[id]` | Đã link |
| `DELETE /api/subjects/[id]` | `/admin/subjects`, `/admin/subjects/[id]` | Đã link |
| `POST /api/subjects/suggest` | `/user/upload` | Đã link |
| `GET /api/subjects/suggest` | `/admin/subjects` | Đã link |
| `POST /api/subjects/suggest/[id]/moderate` | `/admin/subjects` | Đã link |

## AI

| API | FE đang dùng ở đâu | Trạng thái |
| --- | --- | --- |
| `POST /api/ai/chat` | `/user/ai-workspace` | Đã link dạng JSON response |
| `GET /api/ai/limit` | `/user/ai-workspace` | Đã link |
| `GET /api/ai/sessions` | `/user/ai-workspace` | Đã link |
| `GET /api/ai/sessions/[sessionId]/messages` | `src/features/ai/api/ai-api.ts` | Có hàm API, UI chưa có danh sách chọn session |

## Payments

| API | FE đang dùng ở đâu | Trạng thái |
| --- | --- | --- |
| `POST /api/payments/checkout` | `/user/payment/checkout` | Đã link |
| `POST /api/payments/webhook` | Không gọi từ FE | Không link, đúng vì endpoint dành cho service/system |
| `GET /api/payments/receipts` | `/user/payment` | Đã link |

## Cấu hình gọi API

- API client: `src/lib/api/client.ts`
- Nếu có `NEXT_PUBLIC_API_URL`, FE gọi trực tiếp base URL đó.
- Nếu không có `NEXT_PUBLIC_API_URL`, FE gọi relative `/api/...`.
- `next.config.ts` có rewrite `/api/:path*` sang `BACKEND_URL/api/:path*` khi khai báo `BACKEND_URL`.
