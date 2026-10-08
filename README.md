# Astraa — Scroll Portfolio

Portfolio của **Astraa / 5erax**, phát triển từ Scroll Tear Portfolio của **Kedhareswer Naidu**. Next.js, React và Tailwind CSS; năm chương có hiệu ứng xé giấy, postcard lật, polaroid chuyển dự án và bản đồ hành trình.

Thông tin lấy từ [README GitHub của Astraa](https://github.com/5erax/5erax): fullstack developer tại Việt Nam, UI và interaction, email `lagna0175@gmail.com`, LinkedIn và quá trình học/làm việc. Avatar lấy từ GitHub; artwork ProZ0 và MediMate AI từ portfolio hiện có. Các ảnh phong cảnh khác là minh họa tạo bằng SVG của template.

## Dự án

ProZ0, MediMate AI, FinGenie, GeoConnect, CVmate, Ecommerce Mobile và MLN Web đều dẫn đến repository thật. ProZ0 được ghi rõ đang phát triển; không thêm số liệu thành tích hoặc năm ra mắt chưa xác nhận. Liên kết bản live của MediMate nằm ở mục Contact.

## Chạy

Mở `START.cmd` trong thư mục này, rồi truy cập **http://localhost:3001**. Giữ cửa sổ terminal mở khi sử dụng; nhấn `Ctrl+C` để dừng.

Hoặc mở terminal tại thư mục này:

```powershell
npm run dev
```

Dependencies đã được cài. Nếu chuyển sang máy khác, chạy `npm ci` trước. Để chạy bản production: `npm run build`, sau đó `npm start`. Chỉ chạy một server ở cổng 3001 tại một thời điểm.

## Cá nhân hóa

Toàn bộ nội dung cá nhân nằm trong `src/app/page.tsx`: `name`, `email`, `about`, `projects`, `route`, `links`… Metadata nằm trong `src/app/layout.tsx`. API đầy đủ nằm trong [README gốc](upstream/README.md).

Nút `Open email draft` mở ứng dụng email bằng `mailto:` tới `lagna0175@gmail.com`. Người gửi cần bấm gửi trong ứng dụng email; website không có backend gửi thư và không khẳng định thư đã được gửi.

## Kiểm tra

`npm run check` kiểm tra TypeScript; `npm run build` tạo bản production. Trình duyệt đã được kiểm tra với năm chương, bảy liên kết dự án, postcard lật, hành trình, form trống, ảnh trên mobile và reduced motion.

## Nguồn

- [Trang template trên 21st.dev](https://21st.dev/@kedhareswer/templates/scroll-tear-portfolio-website-template)
- [Mã nguồn gốc, ghim tại commit đã cài](https://github.com/Kedhareswer/21stdev-my-components/blob/cd727b25f393ff5ba80fa1fa14a4887f09feb425/components/torn-postcard-portfolio/torn-postcard-portfolio.tsx)
- [README của tác giả về quyền sao chép và chỉnh sửa](upstream/AUTHOR-README.md)

Ngày cài: 08/10/2026. Registry trong ảnh trả về `Component not found`, nên bản này được lấy trực tiếp từ GitHub của tác giả. Commit đầu tiên giữ nguyên component gốc; các commit sau thêm nội dung Astraa và đổi nhãn liên kết/form để diễn đạt đúng hành vi. Chi tiết nguồn lưu trong `upstream/source.json`.
