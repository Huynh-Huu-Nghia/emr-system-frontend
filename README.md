# EMR System — Frontend

Ứng dụng web nội bộ (Next.js App Router) cho quản lý phòng khám: tiếp nhận, lịch hẹn, khám bệnh, EMR (tích hợp backend Spring Boot / Supabase sau).

## Yêu cầu

- Node.js 20+ (khuyến nghị)
- npm

## Cài đặt và chạy local

```bash
npm install
npm run dev
```

Mở [http://localhost:3000](http://localhost:3000).

### Biến môi trường (tùy chọn)

Sao chép `.env.example` thành `.env.local` khi đã có API backend:

```bash
cp .env.example .env.local
```

- `NEXT_PUBLIC_API_BASE_URL` — URL gốc API (không có dấu `/` cuối). Để trống khi chỉ dùng mock trong code.

### Build production

```bash
npm run build
npm start
```

Font không còn tải từ Google Fonts lúc build (tránh lỗi khi máy/offline CI không có mạng).

## Luồng test nhanh

1. **Đăng nhập:** `/login` — mock chấp nhận mọi username/password không rỗng (xem `core/api/authService.ts`).
2. Sau đăng nhập, app chuyển tới **`/reception/patients`** (Quản lý bệnh nhân — mock CRUD).
3. Dùng sidebar để mở các trang stub (Lịch hẹn, Bác sĩ, Admin…).

Token mock được lưu `localStorage` key `auth_token`.

## Scripts

| Lệnh          | Mô tả              |
| ------------- | ------------------ |
| `npm run dev` | Dev server         |
| `npm run build` | Build production |
| `npm start`   | Chạy build         |
| `npm run lint`| ESLint             |

## Cấu trúc gợi ý

- `app/` — routes App Router
- `components/` — UI layout & feature
- `modules/` — hooks/feature theo domain (vd. `patient`)
- `shared/` — query client, helpers, component dùng chung
- `core/api/` — service layer (mock → API thật sau)

---

Bootstrapped with [create-next-app](https://nextjs.org/docs/app/api-reference/cli/create-next-app).
