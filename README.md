# Astraa — Scroll Portfolio

Portfolio của **Astraa / 5erax**, phát triển từ Scroll Tear Portfolio của **Kedhareswer Naidu**. Next.js, React và Tailwind CSS; năm chương có hiệu ứng xé giấy, postcard lật, polaroid chuyển dự án và bản đồ hành trình.

[Website live](https://astraa1.vercel.app) · [Repository](https://github.com/5erax/astraa-scroll-portfolio)

Thông tin lấy từ [README GitHub của Astraa](https://github.com/5erax/5erax): fullstack developer tại Việt Nam, UI và interaction, email `lagna0175@gmail.com` và quá trình học/làm việc. Ảnh cá nhân do Astraa cung cấp; avatar anime cũ đã được thay bằng selfie gương đeo khẩu trang, kể cả tem bao thư, tem About và favicon. Các ảnh phong cảnh là minh họa SVG của template.

## Dự án

ProZ0, MediMate AI, FinGenie, GeoConnect, CVmate, Ecommerce Mobile và MLN Web dùng homepage HTTPS khi repo có bản live, nếu không thì dẫn đến repository thật. ProZ0 được ghi rõ đang phát triển; không thêm số liệu thành tích hoặc năm ra mắt chưa xác nhận. Liên kết bản live của MediMate cũng nằm ở mục Contact.

**Nét Studio** ([website](https://net-studio-nu.vercel.app/), React/GSAP/Lenis) và **Garden Dreams** ([website](https://garden-dreams-florist.vercel.app/), React/Supabase/Motion) có preview WebP chụp trực tiếp từ website. Garden Dreams đã chuyển public theo yêu cầu chủ repo.

Work tự cập nhật qua GitHub REST API ở server, cache/revalidate mỗi 3600 giây khi có truy cập, không cần deploy lại. Lấy tối đa 100 repo public của 5erax và 300 sự kiện public gần đây; push và PR do 5erax mở được tính là đóng góp, không tính star/follow. Repo ngoài tài khoản cũng được lấy khi có đóng góp public (tối đa 10 repo). Repo sở hữu không có sự kiện trong cửa sổ API dùng `pushed_at` làm mốc dự phòng; repo fork chỉ hiện khi có đóng góp. Bỏ repo hồ sơ, hai repo portfolio và repo archived/private; hiển thị tối đa 12 dự án.

Cover, “Latest contribution” trong About và mốc Now trong Journey đều dùng dự án đứng đầu. Giữ tên/preview/stack đã biên tập cho repo đã biết; dự án mới dùng tên, description, language và homepage HTTPS trên GitHub, kèm minh họa của template nếu chưa có preview thật. Khi API lỗi/rate limit, dùng catalogue đã lưu để trang vẫn hoạt động. Không cần token, không đưa bí mật ra trình duyệt. API Events có độ trễ riêng (GitHub ghi 30 giây đến 6 giờ) và chỉ giữ sự kiện 30 ngày, nên đây không phải cập nhật tức thời. Nguồn: [GitHub Events](https://docs.github.com/en/rest/activity/events), [Next.js fetch revalidation](https://nextjs.org/docs/app/api-reference/functions/fetch).

`npm run check:github` kiểm tra thứ tự, loại hoạt động không phải đóng góp, repo private/archived/fork, link an toàn, preview cũ, dự án mới, giới hạn và lỗi API bằng fetch giả lập.

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

LinkedIn tạm thời là native button `disabled`, không có `href`, không mở trang hay tab mới. URL vẫn lưu trong cấu hình; bỏ `disabled: true` khi tài khoản hoạt động trở lại.

## Deploy

Repository được liên kết với project Vercel `astraa-scroll-portfolio`. Nhánh production là `main`; các lần push tiếp theo được Vercel tự build và deploy. Bộ đếm cần Upstash Redis với `KV_REST_API_URL` và `KV_REST_API_TOKEN` chỉ dùng ở server. `.vercel/` và `.env*` không được commit.

Domain production chính thức: `astraa1.vercel.app`, được gắn cố định trong project Vercel để tự cập nhật theo mỗi deployment.

## Kiểm tra

`npm run check` kiểm tra TypeScript; `npm run build` tạo bản production. `npm run check:counter` dùng assert và fetch giả lập để kiểm tra bộ đếm; cần Node.js 24 để đọc TypeScript trực tiếp.

Sau khi chạy server, dùng `npm run check:browser -- http://localhost:3001` để kiểm tra tương tác bằng Chromium headless trong một browser riêng. Script dùng Playwright đã cài trong runtime Codex; ở máy khác có thể chỉ định đường dẫn module Playwright đã cài bằng biến `PLAYWRIGHT_MODULE`. Ảnh kiểm tra được lưu trong `outputs/` và không commit. Check không gửi email hoặc mở liên kết bên ngoài.

`npm run check:motion -- http://localhost:3001` kiểm tra riêng số lượt xem thật trước khi mở, video chạy không có nút pause, ảnh dự phòng, gallery tự chuyển mỗi 3 giây, kéo/hủy kéo/lật bằng bàn phím và touch, thẻ dự án giữ kích thước, cuộn dọc trên postcard, lối tắt Contact và tọa độ các mốc timeline ở 320–1440 px. Cả hai browser check giả lập API lượt xem để không tăng bộ đếm production.

Kiểm tra gồm năm chương, danh sách dự án động với liên kết thật, focus/inert khi lật postcard, chuyển dự án liên tiếp và bằng phím mũi tên, ánh sáng/độ nghiêng giấy theo cuộn, tuyết pause/resume khi cuộn, không tự snap khi dừng wheel, About vừa giấy không có cuộn lồng, lỗi form và clipboard, menu mobile/Escape, vuốt ngang bằng touch và cuộn dọc tự nhiên, viewport 320/390/768/1024/1440 px, giữ chương khi đổi chiều cao màn hình hoặc bật reduced motion, ảnh tải đủ và lỗi trình duyệt.

## Music stamp

Nút **Music** trong thanh điều hướng mở thẻ giấy nhỏ, phát file **Buồn vương mi — htingale** do Astraa cung cấp. File gốc được sao chép nguyên vẹn thành `public/media/buon-vuong-mi.mp3` (khoảng 1,16 MB); không tải từ dịch vụ âm nhạc bên ngoài.

Trang bắt đầu bằng một bao thư giấy với seal chữ A, tem avatar, viền airmail, dấu bưu điện và vân giấy. Caption là **Click to open the letter**; button có tên accessible **Open letter**. Trong lúc mã tương tác đang tải, nút chưa nhận click và caption là **Preparing your letter**; nút chỉ mở khi handler và nhạc đã sẵn sàng, tránh mất lần bấm đầu trên mạng chậm. Hover nghiêng thân thư trong phối cảnh, hé nắp, để lá thư lộ ra, xoay tem và quét sáng trên seal. Khi click, nắp và lá thư tiếp tục từ vị trí đang hover bằng CSS transition.

Caption phụ chỉ còn **Enter the portfolio**, không hiển thị phần trăm âm lượng. Viền thân không có cạnh trên; dải xanh/đỏ phía trên thuộc nắp chuyển động và ẩn khi nắp lật để lộ mặt trong. Nó không còn là một lớp phủ chạy ngang lá thư.

Portfolio được ẩn và `inert`, khóa cuộn cho đến khi mở. Click/tap gọi `audio.play()` trực tiếp trong chính handler, sau khi đặt volume 35%, rồi mới chạy nắp thư 3D, kéo lá thư lên và chuyển sang trang hiện tại. Không gọi play sau timeout hoặc sau animation vì sẽ mất quyền user activation. Bàn phím và reduced motion mở ngay; animation có fallback khi bị ngắt và chuyển focus về thanh điều hướng khi xong. Không có âm thanh hoặc request MP3 trước khi mở, kể cả khi browser cho phép autoplay. Pause do người xem chọn không bị tương tác sau bật lại. Xem [MDN autoplay](https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Autoplay).

HUD thu gọn còn khoảng 244×150 px, dùng system font hỗ trợ tiếng Việt cho tên bài và credit. Có Play/Pause, tua bài, Mute và chỉnh volume; nhạc tiếp tục giữa năm chương. Trạng thái phát dựa trên event của media và kết quả `play()`, có báo lỗi và thử lại khi tải thất bại. Tham khảo [HTMLMediaElement.play](https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/play).

Nếu browser không cho phép đặt volume bằng JavaScript, UI dùng thông báo điều chỉnh âm lượng trên thiết bị thay cho slider không hoạt động; kiểm tra trực tiếp khả năng của API, không đoán theo user agent. Xem [tương thích volume](https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/volume). Đĩa chỉ quay khi đang phát có âm thanh và dừng chuyển động với reduced motion. Thẻ nhạc dùng native popover, hỗ trợ focus vào Play, Escape và chạm ngoài để đóng.

Browser check chạy hai policy thật của Chromium: autoplay được phép và cần user activation. Xác nhận portfolio ẩn/inert và khóa cuộn trước khi mở, gọi play trong click còn user activation ở volume 35%, mở bằng touch/Enter/Space, reduced motion và focus, giữ lựa chọn Pause, font/HUD nhỏ, phát/tạm dừng MP3 thật, tua bằng bàn phím, volume/Mute, đổi chương, focus/Escape, mobile 320/390 px, lỗi mạng/thử lại và volume API chỉ đọc. Không thêm thư viện audio hoặc animation.

## Profile views

Biểu tượng mắt và tổng lượt xem nằm gọn dưới tên Astraa trong thanh điều hướng, kế thừa màu của từng chương. Lượt mở đầu tiên bắt đầu ở **319**, sau đó tăng dần; 318 là số nền do chủ portfolio chọn, không phải dữ liệu truy cập lịch sử đã được đo.

Mỗi lần mở phong bì ghi một lượt qua `POST /api/profile-views`. Chuyển chương, nhạc hoặc gallery không ghi thêm. Một UUID ẩn danh tồn tại trong trang dùng để chống ghi trùng request trong 24 giờ; refresh rồi mở lại được tính là lượt mới. Redis dùng Lua để khởi tạo, chống trùng và tăng số một cách nguyên tử, giữ tổng sau deploy và dùng chung cho mọi người xem. `GET /api/profile-views` chỉ đọc tổng.

Giao diện đọc tổng bằng GET ngay ở màn phong bì; POST bắt đầu khi người xem mở thư, trong lúc chạy animation mở. Không dùng 319 làm số hiển thị tạm. Khi chưa có dữ liệu, chừa chỗ trống cho số; chỉ hiện tổng thật sau phản hồi hợp lệ. Request đọc cũ không ghi đè kết quả lượt mở mới nếu hai phản hồi đến khác thứ tự.

Kết nối Marketplace **Upstash for Redis**, gói **Free**, region **sin1**, tắt **autoUpgrade**, **prodPack** và **eviction**. Chủ tài khoản cần chấp nhận điều khoản Marketplace trước khi Vercel cấp lưu trữ. Token không xuất ra client; không lưu IP, email hay tên người xem. Server từ chối lượt ghi có origin khác hoặc UUID không hợp lệ. Nếu lưu trữ thiếu cấu hình, hết hạn mức hoặc lỗi mạng, UI hiện **—** thay vì bịa tổng lượt xem. Bộ đếm đo lượt mở, có thể bao gồm lần xem lặp và bot, không đo người dùng duy nhất.

Browser check giả lập API để các lần kiểm tra không tăng số production; kiểm tra GET trước khi mở, số thật không nháy 319, chỉ POST một lần khi mở, không ghi khi đổi chương và trạng thái lưu trữ lỗi. Redis thật đã được kiểm tra bằng namespace QA riêng: năm request cùng UUID đồng thời chỉ ghi một lượt ở 319, lượt mới thành 320, đọc lại vẫn là 320. Dữ liệu QA được xóa sau kiểm tra, không tăng bộ đếm production.

## Ảnh thật

About dùng `IMG_1417.png` làm ảnh chân dung lớn. Polaroid nhỏ rộng 58% cột ảnh trên desktop (trước đây 42%) và 52% trên mobile. Ảnh team `IMG_8332.jpg` hiển thị đầu tiên; bấm để chuyển qua bốn ảnh tiếp theo: `IMG_8178.jpg`, `IMG_8118.jpg`, `IMG_7125.jpg`, `IMG_8007.jpg`, rồi quay lại ảnh team. Khung có kích thước cố định và bộ đếm 1–5; ảnh dọc dùng `object-fit: contain` để giữ nguyên toàn bộ ảnh.

Gallery dùng native button, hỗ trợ click/tap, Enter/Space, ArrowLeft/ArrowRight và thông báo ảnh hiện tại cho screen reader. Tự chuyển ảnh mỗi **3 giây** khi xem mặt trước About; dừng lúc hover/focus, tab bị ẩn hoặc chuyển chương. Thao tác tay khởi động lại nhịp 3 giây. Các lần tự đổi không đọc live announcement liên tục. Chuyển ảnh bằng chuột/touch có crossfade 200 ms; bàn phím và reduced motion đổi ngay. State nằm trong gallery nên đổi ảnh không render lại toàn bộ portfolio.

Ảnh được resize/nén bằng Sharp đã có sẵn trong Next.js, không thêm dependency và không sửa nội dung bằng AI. Ảnh team được crop bớt không gian trống, vẫn giữ đủ bốn người và toàn thân. Bản xuất bỏ metadata của máy ảnh. `IMG_8595.jpg` được lấy vùng phía trên để làm avatar vuông 384×384; tên file `avatar-personal.png` tránh dùng lại URL avatar cũ. File gốc trong Downloads được giữ nguyên.

About dùng ảnh cá nhân do Astraa cung cấp. Các dự án hiện tại đều có preview WebP của giao diện thật. Ảnh đầu tiên chụp ngày 08/10/2026, bốn ảnh bổ sung ngày 09/10/2026:

| File trong `public/media/` | Nguồn | Nội dung |
| --- | --- | --- |
| `proz0-preview.webp` | [ProZ0](https://proz0-colony.vercel.app) | Trang bắt đầu game |
| `medimate-preview.webp` | [MediMate AI](https://sep-490-fe-medical-ai-assistant.vercel.app) | Trang giới thiệu |
| `geoconnect-preview.webp` | [GeoConnect](https://geoconnect-nu.vercel.app) | Chế độ Terrain có sẵn, giữ credit OpenStreetMap/OpenTopoMap |
| `cvmate-preview.webp` | [CVmate](https://c-vmate-hu48.vercel.app) | Trang giới thiệu |
| `mln-preview.webp` | [MLN Web](https://mln-web-bay.vercel.app) | Trang học tập |
| `net-studio-preview.webp` | [Nét Studio](https://net-studio-nu.vercel.app/) | Website studio |
| `garden-dreams-preview.webp` | [Garden Dreams](https://garden-dreams-florist.vercel.app/) | Website bán hoa |
| `fingenie-interface.webp` | [FinGenie](https://github.com/5erax/FinGenie) | Landing page chạy local từ mã nguồn, Firebase dùng cấu hình demo để render giao diện công khai |
| `ecommerce-interface.webp` | [Ecommerce Mobile](https://github.com/5erax/ecomerce-mobile) | Màn hình cửa hàng Expo Web chạy local, catalogue public Fake Store API của ứng dụng |
| `medimate-mobile-interface.webp` | [MediMate Mobile](https://github.com/5erax/SEP490_MB_MedicalAIAssistant) | Màn hình đăng nhập Expo Web chạy local, không đăng nhập hoặc đọc hồ sơ bệnh nhân |
| `mln-ai-interface.webp` | [MLN AI](https://mln-ai.vercel.app/) | Màn hình đăng nhập website public |

Không dùng mockup hoặc AI để giả làm giao diện đã hoàn thành. Ảnh chụp bản local thể hiện giao diện từ mã nguồn, không khẳng định đã kiểm tra backend hay triển khai app mobile. MLN122 chưa có commit (`size: 0`) nên không đưa vào danh sách dự án; khi repo có nội dung, feed có thể lấy lại. Dự án mới ngoài catalogue ảnh vẫn dùng minh họa template cho đến khi có preview thật. Các minh họa núi/tuyết/trang giấy trang trí vẫn giữ nguyên.

## Motion & UX

Giấy nghiêng trong phối cảnh và thay đổi ánh sáng theo độ mở của vết xé. Vòng animation cache các layer và kích thước, bỏ qua attribute/style không đổi, dừng khi đã bắt kịp vị trí cuộn. Chương dùng CSS containment; các lớp giấy/nội dung/ánh sáng chuyển động được chuẩn bị bằng `will-change`. Ba nền SVG được memo để không render lại theo state âm nhạc hoặc chương.

Hiệu ứng của chương ẩn được pause. Khi cuộn, tuyết, sao, cánh chim và các chuyển động nền tạm dừng để ưu tiên giấy; chúng tiếp tục khi easing đã bắt kịp vị trí cuộn. `scrollend` kết hợp debounce dự phòng đảm bảo resume trên browser cũ. Parallax chỉ chạy với chuột và reset khi rời trang.

Note, bao thư nhỏ, ảnh About, chồng polaroid và logo có hover nhẹ bằng `translate`/`rotate`, tránh ghi đè transform inline của template. Chỉ chạy với pointer fine có hover và không yêu cầu reduced motion; không thêm vòng mouse tracking hoặc thư viện mới.

Trang Astraa đặt `snap: false`: wheel và touch giữ nguyên vị trí người xem dừng, nút chapter vẫn chuyển mượt tới chương tương ứng. Thanh cuộn hệ thống được ẩn bằng CSS, cuộn native và bàn phím vẫn hoạt động. About được biên tập cho vừa giấy, không có vùng cuộn lồng giữ con lăn.

Mobile có chapter index bằng native popover, hỗ trợ Escape và chạm ngoài để đóng. Gallery hỗ trợ vuốt ngang, phím mũi tên và nút lớn hơn. Reduced motion hoặc viewport thấp dùng cuộn thường để vẫn đọc được nội dung; đổi chế độ giữ nguyên chương đang xem.

Form báo lỗi trống và lỗi copy email qua live status, dùng kiểm tra email native, giới hạn message 3.000 ký tự và font input tối thiểu 16 px. Việc gửi thư vẫn thực hiện trong ứng dụng email của người dùng.

Đo bằng Chromium headless, desktop 1440×900, CPU throttle 4× và 24 lượt wheel từ Cover đến Contact: tổng RasterTask trong trace giảm từ khoảng 3,67 s xuống 1,35 s. Style/SVG vẫn tốn thời gian khi chuyển chương; P95 frame của lần đo mới là khoảng 183 ms trong điều kiện throttle và tracing, nên không dùng kết quả này để cam kết 60 fps trên mọi thiết bị.

## Postcard, timeline và nền video

About lật trong phối cảnh 3D khi bấm ảnh lớn, chữ hoặc phần giấy trống; caption đổi thành **Click for more**. Kéo ngang giữ tấm giấy dưới con trỏ, thả qua 22% chiều rộng để lật sang mặt còn lại; kéo ngắn hoặc bị hủy trả giấy về mặt hiện tại. Gallery nhỏ vẫn chuyển ảnh, email vẫn mở bản nháp. Cuộn dọc và pinch zoom dùng hành vi native. Mặt ẩn là `inert`; focus chuyển về nút lật của mặt đang xem. Bàn phím và reduced motion chuyển mặt ngay.

Bao thư nhỏ ở About là nút **Write Astraa a letter**, chuyển tới Contact và focus vào ô nội dung; không tự gửi thư. Timeline ghi đầy đủ **2020–2024**, **2024–present**, giữ nhãn trên một dòng và tâm vòng tròn nằm đúng trên đường đi. Thẻ thông tin đặt bên dưới bản đồ để không che mốc khác ở desktop hoặc mobile.

Màn mở đầu dùng video **heart-lake-side-wuthering-waves-moewalls-com.mp4** do Astraa cung cấp, chuyển từ 4K/60 fps, khoảng 101,7 MB, thành H.264 1280×720/30 fps khoảng **3,63 MB**, có fast start và không có audio. Poster WebP khoảng 102 KB lấy từ video. Video loop không tiếng, không có nút pause/resume. Theo yêu cầu của Astraa, nền video vẫn chạy với reduced motion; các hiệu ứng giấy vẫn giảm chuyển động. Tab bị ẩn tạm dừng decode, trở lại thì tiếp tục; gesture đầu tiên thử lại nếu browser chặn autoplay. Nó được gỡ khỏi trang khi phong bì mở xong; lỗi video dùng poster. Tem và footer dùng năm **2026**. Nhạc giữ cơ chế bắt đầu ở 35% sau thao tác mở thư.

Work kéo tấm ảnh theo con trỏ ở cả hai chiều, không chờ đến lúc thả mới phản ứng. Thả qua ngưỡng 22% chiều rộng (tối thiểu 40 px) để chuyển dự án; kéo ngắn hoặc hủy trả ảnh về chồng. Vuốt dọc trên touch vẫn cuộn trang. Kéo, nút và bàn phím dùng cùng state/transition, không còn keyframe xung đột khi đổi liên tiếp. Chín nội dung mô tả nằm cùng một ô CSS Grid; các thẻ ẩn giữ chiều cao tự nhiên của nội dung dài nhất nhưng `inert` và không đọc được. Khung ngoài và hàng điều hướng giữ cùng kích thước/vị trí khi chọn dự án khác, tự tính lại theo viewport.

Dòng kẻ ở phần facts trên mặt sau About thuộc chính `<dd>` viết tay, dùng cùng font-size và line-height 1.5em với chữ. Nhãn không có nền dòng kẻ; bỏ border đáy trùng lặp. Khi giá trị xuống dòng, chữ và giấy cùng nhịp, thay vì nền theo font 16px của ô cha.

## Nguồn

- [Trang template trên 21st.dev](https://21st.dev/@kedhareswer/templates/scroll-tear-portfolio-website-template)
- [Mã nguồn gốc, ghim tại commit đã cài](https://github.com/Kedhareswer/21stdev-my-components/blob/cd727b25f393ff5ba80fa1fa14a4887f09feb425/components/torn-postcard-portfolio/torn-postcard-portfolio.tsx)
- [README của tác giả về quyền sao chép và chỉnh sửa](upstream/AUTHOR-README.md)

Ngày cài: 08/10/2026. Registry trong ảnh trả về `Component not found`, nên bản này được lấy trực tiếp từ GitHub của tác giả. Commit đầu tiên giữ nguyên component gốc; các commit sau thêm nội dung Astraa và đổi nhãn liên kết/form để diễn đạt đúng hành vi. Chi tiết nguồn lưu trong `upstream/source.json`.
