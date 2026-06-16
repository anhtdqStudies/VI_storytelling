# ATS VI Executive Storytelling

Standalone storytelling site for the ATS VI / Volt Intelligent company introduction.

## Narrative flow (3 scenes)

1. **Vòng đời** — 6 bước dự án ATS trên một flow ngang; chưa nhắc ATS VI.
2. **Áp lực** — meter overload + 3 pain cards khi scale nhiều dự án.
3. **VI** — Director mode **6 beat**:
   - Beat 0–4: giới thiệu ATS VI + 3 lớn năng lực + transition
   - Beat 5 (6/6): sợi chỉ full — **bấm bước 03 hoặc 05** để xem detail (không cần Space)

## Presenter controls

- Top-right pills: `Vòng đời` | `Áp lực` | `VI` | `Auto`
- Keyboard:
  - `←` / `→` — chuyển scene
  - `Space` / `↓` — beat tiếp (trong scene VI)
  - `↑` — beat trước (trong scene VI)
  - Beat 5 (6/6): **click** nút bước 03 hoặc 05 — Space không làm gì ở beat này
- Footer hiện `VI · n / 6` khi đang ở scene VI
- Full-screen: F11 trong trình duyệt
- Auto tour: chỉ chuyển 3 scene; beat VI điều khiển thủ công

## Run locally

```bash
npm install
npm run dev
```

Local URL: `http://127.0.0.1:4173`

## Build for deployment

```bash
npm run build
```

Deploy the generated `dist/` folder to any static hosting target (USB offline, internal static server, or screen-share full-screen browser).

## Stack

- Vite
- Vanilla JavaScript + GSAP
- Canvas starfield, CSS 3D tilt, scene transitions
- Static HTML/CSS content driven by `src/data.js`
- Scene modules: `pressure-stage.js`, `vi-stage.js`

This project is intentionally separate from `frontend/` so it can be deployed independently for executive presentations.
