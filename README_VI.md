<p align="center">
  <img src="build/icon.png" width="120" alt="Logo Moyin Creator" />
</p>

<h1 align="center">Moyin Creator 魔因漫创</h1>

<p align="center">
  <strong>🎬 Công cụ sản xuất phim & anime bằng AI · Seedance 2.0 · Quy trình kịch bản → video hàng loạt</strong>
</p>

<p align="center">
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-AGPL--3.0-blue.svg" alt="License" /></a>
  <a href="https://github.com/vongocanhthi/moyin-creator-multilang/releases"><img src="https://img.shields.io/github/v/release/vongocanhthi/moyin-creator-multilang" alt="Release" /></a>
  <a href="https://github.com/vongocanhthi/moyin-creator-multilang/stargazers"><img src="https://img.shields.io/github/stars/vongocanhthi/moyin-creator-multilang" alt="Stars" /></a>
</p>

<p align="center">
  <a href="README.md">🇬🇧 English</a> | <a href="README_ZH.md">🇨🇳 中文</a> | <strong>🇻🇳 Tiếng Việt</strong>
</p>

<p align="center">
  <a href="docs/WORKFLOW_GUIDE_VI.md"><strong>📖 Hướng dẫn quy trình</strong></a> •
  <a href="#features">Tính năng</a> •
  <a href="#quick-start">Bắt đầu nhanh</a> •
  <a href="#architecture">Kiến trúc</a> •
  <a href="#license">Giấy phép</a> •
  <a href="#contributing">Đóng góp</a>
</p>

---
## Tổng quan

**Moyin Creator** là công cụ cấp sản xuất dành cho người làm phim và anime bằng AI. Năm module móc nối với nhau, phủ toàn bộ quy trình từ kịch bản đến video hoàn chỉnh:

> **📝 Kịch bản → 🎭 Nhân vật → 🌄 Cảnh → 🎬 Đạo diễn → ⭐ Hạng S (Seedance 2.0)**

Đầu ra của mỗi bước tự chảy sang bước sau — không cần nối tay. Hỗ trợ nhiều mô hình AI phổ biến, phù hợp sản xuất hàng loạt phim ngắn, series anime, trailer, v.v.

<h2 id="features">Tính năng</h2>

### ⭐ Module Hạng S — Sáng tạo đa phương thức Seedance 2.0
- **Sinh video tường thuật gộp nhiều shot**: nhóm các phân cảnh storyboard thành video kể chuyện liền mạch
- Tham chiếu đa phương thức @Image / @Video / @Audio (ảnh nhân vật, ảnh cảnh, tự thu thập khung đầu)
- Ghép prompt thông minh: tự động ba lớp (hành động + ngôn ngữ điện ảnh + đồng bộ môi thoại)
- Ghép lưới khung đầu (chiến lược N×N)
- Tự kiểm tra ràng buộc Seedance 2.0 (≤9 ảnh + ≤3 video + ≤3 audio, prompt ≤5000 ký tự)

<img width="578" height="801" alt="Module Hạng S 1" src="https://github.com/user-attachments/assets/34b623a3-9be9-4eb5-ae52-a6a9553598ea" />
<img width="584" height="802" alt="Module Hạng S 2" src="https://github.com/user-attachments/assets/54c6036b-c545-45c0-a32b-de71b8138484" />
<img width="1602" height="835" alt="Module Hạng S 3" src="https://github.com/user-attachments/assets/2b5af973-98c9-4708-bf53-02d11321d86d" />

### 🎬 Engine phân tích kịch bản
- Tách kịch bản thành cảnh, phân cảnh, thoại
- Tự nhận diện nhân vật, địa điểm, cảm xúc, ngôn ngữ điện ảnh
- Hỗ trợ cấu trúc nhiều tập / nhiều màn

<img width="1384" height="835" alt="Phân tích kịch bản" src="https://github.com/user-attachments/assets/e42266c2-aaeb-4cc3-a734-65516774d495" />

### 🎭 Hệ thống nhất quán nhân vật
- **Neo nhận điện 6 lớp**: giữ ngoại hình nhân vật đồng nhất giữa các shot
- Quản lý Character Bible
- Gắn ảnh tham chiếu nhân vật

<img width="1384" height="835" alt="Hệ nhân vật" src="https://github.com/user-attachments/assets/763e6ced-43e2-4c7b-a5ea-b13535af5b2e" />

### 🖼️ Sinh cảnh
- Sinh ảnh nhiều góc nhìn kết hợp
- Tự chuyển mô tả cảnh sang prompt hình ảnh

<img width="1384" height="835" alt="Sinh cảnh" src="https://github.com/user-attachments/assets/f301d91e-c826-499f-b3dd-79e69613a5e8" />

### 🎞️ Hệ storyboard chuyên nghiệp
- Tham số máy quay điện ảnh (cảnh quay, góc, chuyển động)
- Tự bố cục và xuất
- Đổi phong cách thị giác một chạm (2D / 3D / hiện thực / stop-motion, v.v.)

<img width="1602" height="835" alt="Storyboard" src="https://github.com/user-attachments/assets/94562cee-3827-4645-82fe-2123fdd86897" />

### 🚀 Quy trình sản xuất hàng loạt
- **Một pipeline đầy đủ**: phân tích kịch bản → sinh nhân vật/cảnh → tách storyboard → sinh ảnh hàng loạt → sinh video hàng loạt
- Hàng đợi đa tác vụ song song, tự thử lại khi lỗi
- Thiết kế cho sản xuất hàng loạt phim ngắn / anime series

### 🤖 Điều phối AI đa nhà cung cấp
- Hỗ trợ nhiều nhà cung cấp sinh ảnh/video
- Luân phiên API key cân tải
- Quản lý hàng đợi tác vụ, tự thử lại

<h2 id="quick-start">Bắt đầu nhanh</h2>

### Yêu cầu

- **Node.js** >= 18
- **npm** >= 9

### Cài đặt & chạy

```bash
git clone https://github.com/vongocanhthi/moyin-creator-multilang.git
cd moyin-creator-multilang

npm install

npm run dev
```

### Cấu hình API Key

Sau khi mở app, vào **Cài đặt → Cấu hình API** và nhập API key nhà cung cấp AI.

### Build

```bash
npm run build

npx electron-vite build
```

<h2 id="architecture">Kiến trúc</h2>

| Layer | Công nghệ |
|-------|-----------|
| Desktop | Electron 30 |
| Frontend | React 18 + TypeScript |
| Build | electron-vite (Vite 5) |
| State | Zustand 5 |
| UI | Radix UI + Tailwind CSS 4 |
| AI Core | `@opencut/ai-core` (biên dịch prompt, character bible, polling tác vụ) |

### Cấu trúc thư mục

```
moyin-creator-multilang/
├── electron/
│   ├── main.ts
│   └── preload.ts
├── src/
│   ├── components/
│   │   ├── panels/
│   │   └── ui/
│   ├── stores/
│   ├── lib/
│   ├── packages/
│   │   └── ai-core/
│   └── types/
├── build/
└── scripts/
```

<h2 id="license">Giấy phép</h2>

Dự án dùng mô hình **song song hai giấy phép**:

### Mã nguồn mở — AGPL-3.0

Phát hành theo [GNU AGPL-3.0](LICENSE). Bạn được dùng, sửa và phân phối; mã sửa đổi phải công khai theo cùng giấy phép.

### Thương mại

Nếu cần dùng đóng mã hoặc tích hợp sản phẩm thương mại, liên hệ để có [Commercial License](COMMERCIAL_LICENSE.md).

<h2 id="contributing">Đóng góp</h2>

Mọi đóng góp đều được chào đón. Xem [Contributing Guide](CONTRIBUTING.md).

## Liên hệ

- 🐙 GitHub: [https://github.com/vongocanhthi/moyin-creator-multilang](https://github.com/vongocanhthi/moyin-creator-multilang)

---

<p align="center">Made with ❤️ by <a href="https://github.com/MemeCalculate">MemeCalculate</a></p>
