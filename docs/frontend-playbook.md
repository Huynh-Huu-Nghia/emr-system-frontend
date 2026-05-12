# Frontend playbook (EMR — baseline)

Tài liệu ngắn để **Người B / C** làm đồng bộ với nền do Người A đặt. Cập nhật khi team thống nhất thay đổi.

## Chạy & nhánh

- `npm install` → `npm run dev` → http://localhost:3000  
- Làm việc trên nhánh feature riêng, PR nhỏ, có mô tả rõ module (vd. `feat/reception-appointments`).

## Đăng nhập mock & RBAC

- Form login gọi **`useAuth().login`** (không gọi `authService` trực tiếp trong page).
- **Vai trò theo username** (dev, không có BE):
  - Username bắt đầu bằng `reception` hoặc `letan` → **RECEPTIONIST** → vào khu Lễ tân.
  - Username bắt đầu bằng `doctor` hoặc `bacsi` → **DOCTOR**.
  - Còn lại → **ADMIN**.
- Sau đăng nhập redirect theo role (`getPostLoginPathForRole` trong `constants/routes.ts`).
- **Dashboard** bọc **`ProtectedRoute`**: quyền theo URL (`shared/lib/rbac/allowed-roles-for-path.ts`). ADMIN được vào `/reception/*` và `/doctor/*` để demo; thu hẹp khi production.

## Định tuyến & menu

- **Không** hardcode path chuỗi rải rác — dùng `ROUTES` / `SIDEBAR_MENU` trong `constants/`.

## Dữ liệu server & cache

- Dữ liệu từ API/mock: **TanStack Query** (`useQuery` / `useMutation`).
- **Query keys** tập trung: `shared/query/query-keys.ts` — invalidate qua key này.
- **Không** nhét logic fetch dài trong `page.tsx` — tách `modules/<feature>/hooks/` và component con.

## Service / HTTP (chuẩn chờ Người C)

- Khi có **axios/fetch** thật: bọc trong một lớp (vd. `core/api/*` hoặc `modules/*/api.ts`). **Page không import axios trực tiếp** (theo phân công).
- Base URL: `NEXT_PUBLIC_API_BASE_URL` (xem `.env.example`).

## UI thống nhất

- **Bảng / nút / dialog**: `components/ui/*`, `MasterTable`, `ConfirmDialog` (không `window.confirm`).
- **Trạng thái**: `LoadingBlock`, `EmptyState`, `ErrorState` trong `shared/components/states/`.
- **Badge giới tính**: `GenderBadge` (`shared/components/feedback/gender-badge.tsx`).

## Module mẫu: Bệnh nhân (`modules/patient/`)

- **Types** một cửa: `modules/patient/types.ts` (re-export từ `core/api` tới khi có contract BE).
- **Form schema**: `modules/patient/schemas/patient-form-schema.ts`.
- **Lọc danh sách**: `modules/patient/lib/filter-patients.ts`.
- **CRUD mutations**: `modules/patient/hooks/use-*-patient-mutation.ts` (toast + invalidate).

## Realtime / Queue (stub — chờ Người B)

- **`pushToQueue`**, **`useListenQueue`**: `shared/queue/queue-stub.ts` (localStorage + `storage` event + `CustomEvent`).
- Trang demo: `/reception/checkin` (đẩy queue), `/doctor/patients` (đọc queue). Người B thay bằng Supabase.

## PR checklist (tối thiểu)

- [ ] Có loading / empty / error (hoặc lý do không cần).
- [ ] Không `window.confirm`; route từ `ROUTES`.
- [ ] Không logic nặng trong `page.tsx` (ưu tiên tách hook/component).
- [ ] `npm run lint` sạch.
