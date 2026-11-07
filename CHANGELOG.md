# Changelog

All notable changes to the **Sunshine and Moonlight** portfolio website are documented in this file.

---

## [2.0.0] — 2026-11-07

### 🇬🇧 English

#### ✨ UI / UX & Interactive Improvements
- **Hero Terminal Quick-Cast Chips:** Enabled quick-action chips (`help`, `spells`, `✦ random spell`, `lumos`) across both desktop and mobile viewports for one-click spell casting.
- **One-Click Theme Reset (`finite`):** Added the `finite` command (`Finite Incantatem!`) and a dynamic `↺ reset theme` chip that appears whenever a custom spell aura or petrification effect is active.
- **Full-Card Click Area:** Expanded the clickable area on project cards in `index.html` and `work.html` so clicking anywhere on a card (thumbnail, title, or body) opens the project/demo.
- **Context-Aware Demo Navigation:** Updated the top bar in `demos/shop.html`, `demos/clinic.html`, and `demos/cafe.html` to return visitors to their actual origin page (`index.html#projects`, `packages.html`, or `/work`).
- **Mobile Navigation Polish:** Updated the mobile hamburger toggle to switch between `☰` and `✕`, manage `aria-expanded`, and close automatically on outside click or pressing `Escape`.
- **WCAG AA Contrast Upgrade:** Brightened the `--muted` text token from `#8fa1c4` to `#9db0d4` across the homepage and sub-pages for clearer readability on dark midnight surfaces.

#### 🌐 Bilingual (EN / TH) Completeness
- **Placeholder Translation:** Extended `assets/site.js` to automatically swap `data-en-placeholder` / `data-th-placeholder` attributes and emit a `site:langchange` event.
- **Sorting Hat Localization:** Added Thai translations for the engine selector buttons and runtime loading messages in `sortinghats.html`.

#### ⚡ Performance, Stability & Cleanup
- **Removed `/planner/` & Unused Assets:** Removed the private `/planner/` app, unused `videos/Easter1.mp4`, and Python bytecode caches (`__pycache__/`) to keep the repository lightweight and focused.
- **On-Demand PyScript Loading:** Changed PyScript (`core.js` + Pyodide runtime) in `sortinghats.html` to lazy-load only when the user switches to the `Python · PyScript` engine, making initial page load instant.
- **Defensive Storage & Timer Handling:** Added `try / catch` and array validation around `localStorage` in `paotang.html`, and prevented duplicate countdown timers on language switch.
- **Config Alignment:** Synced `vercel.json`, `robots.txt`, `sitemap.xml`, `server.py`, `README.md`, and `docs/DESIGN.md`.

---

### 🇹🇭 ภาษาไทย

#### ✨ ปรับปรุง UI / UX และฟีเจอร์โต้ตอบ
- **ปุ่มลัด Quick-Cast ใน Hero Terminal:** เปิดให้แสดงปุ่มชิป (`help`, `spells`, `✦ สุ่มคาถา`, `lumos`) ทั้งบนคอมพิวเตอร์และมือถือ เพื่อให้คลิกรันคำสั่งหรือร่ายคาถาได้ทันทีโดยไม่ต้องพิมพ์เอง
- **ปุ่มรีเซ็ตธีมในคลิกเดียว (`finite`):** เพิ่มคำสั่ง `finite` (`Finite Incantatem!`) และปุ่ม `↺ คืนค่าธีมเดิม` ที่จะแสดงขึ้นมาอัตโนมัติเมื่อหน้าเว็บติดเอฟเฟกต์เปลี่ยนสีหรือแช่แข็งจากคาถา
- **การ์ดผลงานคลิกได้ทั้งใบ:** ขยายพื้นที่คลิกของการ์ดในหน้า `index.html` และ `work.html` ให้สามารถคลิกที่รูปภาพ ชื่อโปรเจกต์ หรือตัวการ์ดเพื่อเปิดหน้าเดโมได้ทันที
- **ลิงก์ย้อนกลับตามหน้าต้นทางในหน้า Demo:** ปรับปรุงแถบด้านบนของ `demos/shop.html`, `demos/clinic.html` และ `demos/cafe.html` ให้พากลับไปยังหน้าที่กดเข้ามาอย่างถูกต้อง (`index.html#projects`, `packages.html` หรือ `/work`)
- **ปรับปรุงเมนูบนมือถือ (Hamburger Menu):** เปลี่ยนไอคอนระหว่าง `☰` และ `✕` พร้อมอัปเดตสถานะ `aria-expanded` และรองรับการคลิกพื้นที่ว่างด้านนอกหรือกดปุ่ม `Escape` เพื่อปิดเมนู
- **เพิ่มความคมชัดของตัวอักษร (WCAG AA):** ปรับสีข้อความรอง (`--muted`) จาก `#8fa1c4` เป็น `#9db0d4` เพื่อให้อ่านง่ายขึ้นบนพื้นหลังสีกรมท่าเข้ม

#### 🌐 ความสมบูรณ์ของระบบสองภาษา (TH / EN)
- **แปลข้อความ Placeholder อัตโนมัติ:** อัปเดต `assets/site.js` ให้สลับค่า `data-en-placeholder` / `data-th-placeholder` ในช่องกรอกข้อมูลและส่งอีเวนต์ `site:langchange`
- **เพิ่มภาษาไทยในหน้าหมวกคัดสรร:** เพิ่มคำแปลภาษาไทยให้ปุ่มเลือกเอนจิน (`JavaScript (พร้อมเล่นทันที)`) และข้อความสถานะขณะโหลด Python ใน `sortinghats.html`

#### ⚡ ประสิทธิภาพ ความเสถียร และการจัดระเบียบโค้ด
- **ลบ `/planner/` และไฟล์ที่ไม่ได้ใช้:** ลบโฟลเดอร์ `/planner/`, ไฟล์วิดีโอ `videos/Easter1.mp4` ที่ไม่ได้ใช้งาน และแคช `__pycache__/` ออกทั้งหมดเพื่อให้โปรเจกต์คลีนและเบาที่สุด
- **โหลด PyScript เฉพาะเมื่อเรียกใช้ (Lazy-load):** เปลี่ยนการโหลด PyScript (Pyodide WASM ~10MB) ในหน้า `sortinghats.html` ให้โหลดเฉพาะเมื่อผู้ใช้กดสลับไปโหมด `Python · PyScript` ช่วยให้เปิดหน้าเว็บในโหมดเริ่มต้นได้เร็วขึ้นทันที
- **เพิ่มความเสถียรของข้อมูลและ Timer:** ป้องกัน Error จากการอ่าน/เขียน `localStorage` และป้องกันการสร้างตัวจับเวลาซ้อนกันในหน้า `paotang.html`
- **อัปเดตไฟล์ตั้งค่าและเอกสาร:** ปรับ `vercel.json`, `robots.txt`, `sitemap.xml`, `server.py`, `README.md` และ `docs/DESIGN.md` ให้ตรงกับโครงสร้างล่าสุดทั้งหมด
