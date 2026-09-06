# Hướng dẫn Kiểm tra & Deploy Firestore Rules

Tệp quy tắc bảo mật Firestore (`firestore.rules`) đã được kiểm tra và đồng bộ 100% với các trường dữ liệu và collection của ứng dụng (bao gồm `users`, `todos`, `portfolio`, `plans`, `notes`, cùng các collection legacy `weeklyProjects`, `weeklyArchives`).

---

## Cách 1: Triển khai tự động bằng Firebase CLI (Khuyên dùng)

### Bước 1: Đăng nhập Firebase (nếu chưa đăng nhập)
```bash
npx firebase-tools login
```

### Bước 2: Chọn project Firebase của bạn
```bash
npx firebase-tools use <project-id-cua-ban>
```
*(Hoặc gõ `npx firebase-tools projects:list` để xem danh sách project)*

### Bước 3: Deploy Security Rules
Chạy lệnh đã được tích hợp sẵn trong `package.json`:
```bash
npm run deploy:rules
```
hoặc:
```bash
npx firebase-tools deploy --only firestore:rules
```

---

## Cách 2: Triển khai thủ công qua Firebase Console

Nếu bạn không cài Firebase CLI trên máy:

1. Mở trình duyệt và truy cập [Firebase Console](https://console.firebase.google.com/).
2. Chọn project của bạn -> vào mục **Build** (Xây dựng) -> chọn **Firestore Database**.
3. Chuyển sang tab **Rules** (Quy tắc) ở thanh menu trên cùng.
4. Mở tệp [`firestore.rules`](../firestore.rules) trong thư mục dự án, copy toàn bộ nội dung.
5. Dán đè vào trình soạn thảo quy tắc trong Firebase Console.
6. Nhấn nút **Publish** (Xuất bản) màu xanh ở góc trên bên phải.

---

## Kiểm tra sau khi triển khai
- Thử tạo mới, sửa hoặc xóa 1 task trên ứng dụng web khi đã đăng nhập Firebase.
- Dữ liệu được ghi thành công và chỉ user sở hữu (`request.auth.uid == userId`) mới có quyền đọc/ghi.
- Người dùng chưa đăng nhập hoặc user khác sẽ bị chặn hoàn toàn theo nguyên tắc bảo mật Zero Trust.
