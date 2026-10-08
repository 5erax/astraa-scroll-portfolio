# Scroll Tear Portfolio — bản cài trên máy

Template gốc của **Kedhareswer Naidu**, cài riêng với Next.js, React và Tailwind CSS. Component được giữ nguyên từng byte; nội dung hiện tại là dữ liệu demo của tác giả.

## Chạy

Mở `START.cmd` trong thư mục này, rồi truy cập **http://localhost:3001**. Giữ cửa sổ terminal mở khi sử dụng; nhấn `Ctrl+C` để dừng.

Hoặc mở terminal tại thư mục này:

```powershell
npm run dev
```

Dependencies đã được cài. Nếu chuyển sang máy khác, chạy `npm ci` trước. Để chạy bản production: `npm run build`, sau đó `npm start`. Chỉ chạy một server ở cổng 3001 tại một thời điểm.

## Cá nhân hóa

Sửa `src/app/page.tsx` và truyền props cho `TornPostcardPortfolio`: `name`, `email`, `about`, `projects`, `route`, `palette`… API và hướng dẫn đầy đủ nằm trong [README gốc](upstream/README.md).

Form liên hệ của template mở ứng dụng email bằng `mailto:`. Cần thay email demo trước khi sử dụng cho portfolio của bạn.

## Nguồn

- [Trang template trên 21st.dev](https://21st.dev/@kedhareswer/templates/scroll-tear-portfolio-website-template)
- [Mã nguồn gốc, ghim tại commit đã cài](https://github.com/Kedhareswer/21stdev-my-components/blob/cd727b25f393ff5ba80fa1fa14a4887f09feb425/components/torn-postcard-portfolio/torn-postcard-portfolio.tsx)
- [README của tác giả về quyền sao chép và chỉnh sửa](upstream/AUTHOR-README.md)

Ngày cài: 08/10/2026. Registry trong ảnh trả về `Component not found`, nên bản này được lấy trực tiếp từ GitHub của tác giả. Chi tiết nguồn lưu trong `upstream/source.json`.
