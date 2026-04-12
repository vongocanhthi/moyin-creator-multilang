# Hướng dẫn đầy đủ trước cài đặt (tiếng Trung)
https://kvodb27hf3.feishu.cn/wiki/JjSmwf173iN3fqkjXakcGbvTnEf?from=from_copylink

Ngôn ngữ: **[简体中文](./WORKFLOW_GUIDE.md)** · **[English](./WORKFLOW_GUIDE_EN.md)**

# 🎬 Moyin Creator — Hướng dẫn quy trình làm việc cơ bản

> Từ kịch bản đến video hoàn chỉnh

Moyin Creator có nhiều quy trình; các panel có thể kết hợp hoặc dùng độc lập tùy nhu cầu. **Tài liệu này mô tả quy trình nền phổ biến nhất** — phù hợp người mới bắt đầu.

---

## 📋 Tổng quan

```
⚙️ Chuẩn bị → 📝 Kịch bản → 🔧 Hiệu chỉnh AI → 🌄 Cảnh / 🎭 Nhân vật (tùy chọn) → 🎬 Đạo diễn / ⭐ Hạng S → 🎥 Sinh video
```

---

## Chuẩn bị: cấu hình môi trường

Trước khi tạo nội dung, hãy hoàn tất các bước sau:

### 1. Thêm nhà cung cấp API

Vào **Cài đặt → API → Thêm nhà cung cấp** và cấu hình tài khoản AI.

- Nên thêm **càng nhiều API key càng tốt** — ứng dụng luân phiên key để cân tải
- Nhiều key thường cho phép **tăng số luồng đồng thời**, tạo hàng loạt nhanh hơn
- Hỗ trợ ví dụ memefast, RunningHub, v.v.

### 2. Ánh xạ dịch vụ

Vào **Cài đặt → Ánh xạ dịch vụ** và gán mô hình cho từng chức năng:

- Chọn mô hình cho sinh ảnh từ chữ, ảnh→video, chữ→video, v.v.
- Chọn theo nhà cung cấp và mục tiêu sáng tạo

> 💡 **Gợi ý khi thử nghiệm:**
> - **Sinh ảnh:** `gemini-3-pro-image-preview`
> - **Sinh video:** `doubao-seedance-1-5-pro-251215`

### 3. Máy chủ ảnh (image host)

Vào **Cài đặt → Máy chủ ảnh** và cấu hình dịch vụ lưu ảnh tải lên:

- Cần một image host (ảnh tham chiếu, khung đầu, v.v.)
- Nên cấu hình **nhiều key** nếu được để tăng tốc upload đồng thời

> ✅ Sau các bước trên, bạn có thể bắt đầu sáng tạo.

---

## Bước 1: Panel kịch bản

Mở panel **Kịch bản**. Có hai cách:

- **A. Nhập kịch bản** — dán hoặc nhập kịch bản đầy đủ vào vùng soạn thảo
- **B. Sáng tác với AI** — nhờ AI viết kịch bản từ đầu

> 📄 **Định dạng kịch bản:** xem [Ví dụ định dạng nhập kịch bản](./SCRIPT_FORMAT_EXAMPLE_VI.md) về tiêu đề cảnh, thoại, chỉ dẫn sân khấu, v.v.

Ứng dụng phân tích cấu trúc kịch bản thành cảnh, phân cảnh, nhân vật và lời thoại.

---

## Bước 2: Hiệu chỉnh AI lần hai

Sau khi phân tích tự động xong, lần lượt bấm ba nút hiệu chỉnh để **làm sâu thêm**:

1. **Hiệu chỉnh cảnh AI** — tinh chỉnh môi trường, không khí, ánh sáng từng cảnh  
2. **Hiệu chỉnh phân cảnh (API)** — căn chỉnh ngôn ngữ ống kính, cảnh quay, bố cục từng shot  
3. **Hiệu chỉnh nhân vật AI** — làm rõ ngoại hình, biểu cảm, động tác để đồng nhất  

> Sau hiệu chỉnh, prompt cho bước sinh ảnh/video tốt hơn rõ rệt.

---

## Bước 3: Sinh tài nguyên (tùy chọn)

Sau hiệu chỉnh, bạn có thể sinh trước tài nguyên:

- **A. Sinh cảnh** — ảnh tham chiếu cảnh theo mô tả đã hiệu chỉnh  
- **B. Sinh nhân vật** — ảnh tham chiếu nhân vật theo mô tả đã hiệu chỉnh  

> Bước này không bắt buộc. Vào Đạo diễn / Hạng S mà không sinh trước vẫn có thể tự gọi tài nguyên liên quan.

---

## Bước 4: Panel Đạo diễn / Hạng S

Chuyển sang **Đạo diễn** hoặc **⭐ Hạng S**:

1. Bấm **«Tải phân cảnh từ kịch bản»** ở thanh bên phải để đưa toàn bộ phân cảnh vào panel  
2. **Thanh bên trái** tự điền prompt cho từng shot:  
   - Prompt khung đầu  
   - Prompt khung cuối  
   - Prompt video  
3. Có thể chỉnh mọi tham số theo ý (chuyển động camera, độ dài, phong cách, v.v.)

---

## Bước 5: Ảnh và video

Trong **chỉnh sửa phân cảnh** (thanh bên trái) trên Đạo diễn / Hạng S:

### Sinh ảnh (chọn một)

- **A. Từng shot** — sinh ảnh lần lượt  
- **B. Gộp batch (khuyến nghị)** — sinh nhiều shot trong một lần chạy  

> 💡 Nên dùng **gộp batch**; ảnh sinh ra được gán lại đúng từng shot.

### Sinh video

Sau khi đã gán ảnh, bấm **«Sinh video»** để tạo video theo lô cho các phân cảnh.

---

## Bước 6: Hạng S — Seedance 2.0

Hạng S hỗ trợ **Seedance 2.0** — gộp nhiều shot kể chuyện liền mạch:

1. Sau khi nhập kịch bản, chọn **cách nhóm shot**:  
   - Một shot → clip ~15 giây  
   - Nhiều shot gộp → đoạn tường thuật ~15 giây  
   - Linh hoạt theo nhu cầu  
2. Hệ thống thu thập tham chiếu @Image / @Video / @Audio  
3. Bấm **«Sinh video»**

> Hạng S xử lý ghép khung đầu, prompt nhiều lớp (hành động + ống kính + đồng bộ môi), và kiểm tra tham số.

---

## 💡 Mẹo

- **Hiệu chỉnh trước, sinh sau** — bước hiệu chỉnh lần hai cải thiện chất lượng rõ rệt  
- **Ưu tiên gộp batch** — nhanh và đồng nhất hơn so với từng shot  
- **Mọi thứ đều chỉnh tay được** — prompt và khung đầu/cuối có thể sửa  
- **Hạng S phù hợp** — câu chuyện nhiều shot liền (phim ngắn, trailer phong cách anime, v.v.)  
- **Đạo diễn phù hợp** — kiểm soát từng shot chi tiết  

---

> Thắc mắc? Xem [README](../README.md)
