# Astraa — Scroll Portfolio

Portfolio của **Astraa / 5erax**, phát triển từ Scroll Tear Portfolio của **Kedhareswer Naidu**. Next.js, React và Tailwind CSS; năm chương có hiệu ứng xé giấy, postcard lật, polaroid chuyển dự án và bản đồ hành trình.

[Website live](https://astraa1.vercel.app) · [Repository](https://github.com/5erax/astraa-scroll-portfolio)

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

## Deploy

Repository được liên kết với project Vercel `astraa-scroll-portfolio`. Nhánh production là `main`; các lần push tiếp theo được Vercel tự build và deploy. Không cần cấu hình backend hoặc secret cho website này. `.vercel/` và `.env*` không được commit.

Domain production chính thức: `astraa1.vercel.app`, được gắn cố định trong project Vercel để tự cập nhật theo mỗi deployment.

## Kiểm tra

`npm run check` kiểm tra TypeScript; `npm run build` tạo bản production.

Sau khi chạy server, dùng `npm run check:browser -- http://localhost:3001` để kiểm tra tương tác bằng Chromium headless trong một browser riêng. Script dùng Playwright đã cài trong runtime Codex; ở máy khác có thể chỉ định đường dẫn module Playwright đã cài bằng biến `PLAYWRIGHT_MODULE`. Ảnh kiểm tra được lưu trong `outputs/` và không commit. Check không gửi email hoặc mở liên kết bên ngoài.

Kiểm tra gồm năm chương, bảy repository thật, focus/inert khi lật postcard, chuyển dự án liên tiếp và bằng phím mũi tên, ánh sáng/độ nghiêng giấy theo cuộn, lỗi form và clipboard, menu mobile/Escape, vuốt ngang bằng touch và cuộn dọc tự nhiên, viewport 320/390/768/1024/1440 px, giữ chương khi đổi chiều cao màn hình hoặc bật reduced motion, ảnh tải đủ và lỗi trình duyệt.

## Music stamp

Nút **Music** trong thanh điều hướng mở thẻ giấy nhỏ, phát file **Buồn vương mi — htingale** do Astraa cung cấp. File gốc được sao chép nguyên vẹn thành `public/media/buon-vuong-mi.mp3` (khoảng 1,16 MB); không tải từ dịch vụ âm nhạc bên ngoài.

Player dùng `<audio>` native, `preload="none"`, bắt đầu bằng Play và lặp lại bài. Có Pause, tua bài, Mute và chỉnh volume; âm lượng khởi đầu 35% khi browser hỗ trợ. Nhạc tiếp tục giữa năm chương; refresh không tự phát lại. Trạng thái phát dựa trên event của media và kết quả `play()`, có báo lỗi và thử lại khi tải thất bại hoặc browser chặn phát. Tham khảo [HTMLMediaElement.play](https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/play).

Nếu browser không cho phép đặt volume bằng JavaScript, UI dùng thông báo điều chỉnh âm lượng trên thiết bị thay cho slider không hoạt động; kiểm tra trực tiếp khả năng của API, không đoán theo user agent. Xem [tương thích volume](https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/volume). Đĩa chỉ quay khi đang phát có âm thanh và dừng chuyển động với reduced motion. Thẻ nhạc dùng native popover, hỗ trợ focus vào Play, Escape và chạm ngoài để đóng.

Browser check xác nhận file không tải trước Play trong Chromium, phát/tạm dừng MP3 thật, tua bằng bàn phím, volume/Mute, giữ playback khi đổi chương, focus/Escape, layout mobile 320/390 px, lỗi mạng/thử lại, playback bị chặn và volume API chỉ đọc. Không thêm thư viện audio hoặc visualization.

## Motion & UX

Giấy nghiêng trong phối cảnh và thay đổi ánh sáng theo độ mở của vết xé. Vòng animation cache các layer và kích thước, bỏ qua attribute/style không đổi, dừng khi đã bắt kịp vị trí cuộn. Hiệu ứng của chương ẩn được pause; parallax chỉ chạy với chuột và reset khi rời trang.

Snap chờ `scrollend` và một khoảng nghỉ ngắn, hủy khi có input mới; browser cũ dùng debounce. Mobile có chapter index bằng native popover, hỗ trợ Escape và chạm ngoài để đóng. Gallery hỗ trợ vuốt ngang, phím mũi tên và nút lớn hơn. Reduced motion hoặc viewport thấp dùng cuộn thường để vẫn đọc được nội dung; đổi chế độ giữ nguyên chương đang xem.

Form báo lỗi trống và lỗi copy email qua live status, dùng kiểm tra email native, giới hạn message 3.000 ký tự và font input tối thiểu 16 px. Việc gửi thư vẫn thực hiện trong ứng dụng email của người dùng.

Đo bằng Chromium headless, desktop 1440×900 và CPU throttle 4× với cùng 24 lượt wheel: thời gian JavaScript giảm từ khoảng 0,39 s xuống 0,29 s; style recalculation giảm từ khoảng 1,63 s xuống 1,21 s. P95 frame vẫn khoảng 83 ms ở điều kiện này, nên đây là giảm chi phí xử lý, chưa phải đảm bảo 60 fps trên máy yếu. SVG raster/paint vẫn là phần tốn thời gian trong trace.

## Nguồn

- [Trang template trên 21st.dev](https://21st.dev/@kedhareswer/templates/scroll-tear-portfolio-website-template)
- [Mã nguồn gốc, ghim tại commit đã cài](https://github.com/Kedhareswer/21stdev-my-components/blob/cd727b25f393ff5ba80fa1fa14a4887f09feb425/components/torn-postcard-portfolio/torn-postcard-portfolio.tsx)
- [README của tác giả về quyền sao chép và chỉnh sửa](upstream/AUTHOR-README.md)

Ngày cài: 08/10/2026. Registry trong ảnh trả về `Component not found`, nên bản này được lấy trực tiếp từ GitHub của tác giả. Commit đầu tiên giữ nguyên component gốc; các commit sau thêm nội dung Astraa và đổi nhãn liên kết/form để diễn đạt đúng hành vi. Chi tiết nguồn lưu trong `upstream/source.json`.
