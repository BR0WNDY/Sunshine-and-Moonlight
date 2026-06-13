import re

with open('paotang.html', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Navbar
content = content.replace(
    '<ul class="menu">\n            <li class="menu-item"><a href="index.html">Home</a></li>\n            <li class="menu-item"><a href="soon2.html">Coming Soon</a></li>\n            <li class="menu-item"><a href="projects.html">Projects</a></li>\n            <li class="menu-item"><a href="blog.html">Blog</a></li>\n            <li class="menu-item"><a href="about.html">About</a></li>\n        </ul>',
    '''<ul class="menu">
            <li class="menu-item"><a href="index.html" data-i18n="nav-home">Home</a></li>
            <li class="menu-item"><a href="soon2.html" data-i18n="nav-soon">Coming Soon</a></li>
            <li class="menu-item"><a href="projects.html" data-i18n="nav-projects">Projects</a></li>
            <li class="menu-item"><a href="blog.html" data-i18n="nav-blog">Blog</a></li>
            <li class="menu-item"><a href="about.html" data-i18n="nav-about">About</a></li>
            <li class="menu-item lang-switch">
                <button id="lang-toggle" onclick="toggleLanguage()" style="background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); color: white; padding: 5px 12px; border-radius: 20px; cursor: pointer; font-family: inherit; font-size: 0.9rem; margin-left: 10px; transition: all 0.2s;">🇹🇭 TH</button>
            </li>
        </ul>'''
)

# 2. Text elements
content = content.replace(
    '<span>ไทยช่วยไทย <span class="highlight-green">พลัส</span></span>',
    '<span data-i18n="title-main">ไทยช่วยไทย <span class="highlight-green">พลัส</span></span>'
)
content = content.replace(
    '<span class="badge badge-red">1,000 บ./เดือน</span>',
    '<span class="badge badge-red" data-i18n="badge-red">1,000 บ./เดือน</span>'
)
content = content.replace(
    '<p>สิทธิรัฐเดือนนี้คงเหลือ</p>',
    '<p data-i18n="text-remaining">สิทธิรัฐเดือนนี้คงเหลือ</p>'
)
content = content.replace(
    '<p class="wallet-subtext" style="text-align: left; margin: 0;">จากวงเงินสูงสุด 4,000 บาท</p>',
    '<p class="wallet-subtext" style="text-align: left; margin: 0;" data-i18n="text-max-limit">จากวงเงินสูงสุด 4,000 บาท</p>'
)
content = content.replace(
    '<label>รายการที่ซื้อ (เช่น ค่าอาหาร, ของใช้)</label>',
    '<label data-i18n="text-item-label">รายการที่ซื้อ (เช่น ค่าอาหาร, ของใช้)</label>'
)
content = content.replace(
    '<input type="text" id="item-name" placeholder="ระบุรายการ..." style="text-align: left; font-size: 1.2rem;">',
    '<input type="text" id="item-name" placeholder="ระบุรายการ..." style="text-align: left; font-size: 1.2rem;" data-i18n-placeholder="item-placeholder">'
)
content = content.replace(
    '<label>มูลค่าสินค้าหรือบริการ (บาท)</label>',
    '<label data-i18n="text-amount-label">มูลค่าสินค้าหรือบริการ (บาท)</label>'
)
content = content.replace(
    '<span class="currency-label">บาท</span>',
    '<span class="currency-label" data-i18n="text-currency">บาท</span>'
)
content = content.replace(
    '<p class="split-label">รัฐช่วย (60%)</p>',
    '<p class="split-label" data-i18n="text-gov-split">รัฐช่วย (60%)</p>'
)
content = content.replace(
    '<p class="split-label">จ่ายเอง (40%)</p>',
    '<p class="split-label" data-i18n="text-user-split">จ่ายเอง (40%)</p>'
)
content = content.replace(
    '<p class="final-label">ยอดเงินที่ต้องกดจ่ายผ่านแอปฯ</p>',
    '<p class="final-label" data-i18n="text-final-label">ยอดเงินที่ต้องกดจ่ายผ่านแอปฯ</p>'
)
content = content.replace(
    '<span>💸</span> บันทึกรายการ',
    '<span>💸</span> <span data-i18n="text-save-btn">บันทึกรายการ</span>'
)
content = content.replace(
    '<h2 style="font-size: 1.5rem; color: #93c5fd; font-weight: 700; margin: 0;">ประวัติการใช้จ่าย</h2>',
    '<h2 style="font-size: 1.5rem; color: #93c5fd; font-weight: 700; margin: 0;" data-i18n="text-history-title">ประวัติการใช้จ่าย</h2>'
)
content = content.replace(
    '🗑️ ล้างประวัติทั้งหมด',
    '🗑️ <span data-i18n="text-clear-btn">ล้างประวัติทั้งหมด</span>'
)
content = content.replace(
    'ยังไม่มีประวัติการใช้จ่าย',
    '<span data-i18n="text-no-history">ยังไม่มีประวัติการใช้จ่าย</span>'
)


# Inject JS logic
js_logic = """
        // --- Language Switch Logic ---
        const translations = {
            en: {
                'nav-home': 'Home',
                'nav-soon': 'Coming Soon',
                'nav-projects': 'Projects',
                'nav-blog': 'Blog',
                'nav-about': 'About',
                'title-main': 'Thai Chuai Thai <span class="highlight-green">Plus</span>',
                'badge-red': '1,000 THB/Month',
                'text-remaining': 'Remaining Gov Subsidy This Month',
                'text-max-limit': 'From maximum limit of 4,000 THB',
                'text-item-label': 'Item (e.g., Food, Groceries)',
                'item-placeholder': 'Enter item...',
                'text-amount-label': 'Amount (THB)',
                'text-currency': 'THB',
                'text-gov-split': 'Gov Pays (60%)',
                'text-user-split': 'You Pay (40%)',
                'text-final-label': 'Amount to pay via app',
                'text-save-btn': 'Save Transaction',
                'text-history-title': 'Transaction History',
                'text-clear-btn': 'Clear All History',
                'text-no-history': 'No transaction history',
                'js-alert-invalid-amount': 'Please enter a valid amount',
                'js-confirm-delete': 'Are you sure you want to delete this transaction?',
                'js-alert-no-export': 'No data to export',
                'js-alert-invalid-file': 'Invalid file format (must match exported file)',
                'js-alert-import-success': 'Successfully imported {n} items',
                'js-confirm-clear': 'Are you sure you want to clear all history?',
                'js-unspecified-item': 'Unspecified Item',
                'js-label-total': 'Total:',
                'js-label-gov': 'Gov:',
                'js-label-user': 'You:',
                'js-reset-done': '✨ Quota reset! (Please refresh)',
                'js-reset-in': '⏳ Next reset in: ',
                'js-days': ' days ',
                'js-hrs': ' hrs ',
                'js-mins': ' mins'
            },
            th: {
                'nav-home': 'หน้าแรก',
                'nav-soon': 'เร็วๆ นี้',
                'nav-projects': 'โปรเจกต์',
                'nav-blog': 'บล็อก',
                'nav-about': 'เกี่ยวกับเรา',
                'title-main': 'ไทยช่วยไทย <span class="highlight-green">พลัส</span>',
                'badge-red': '1,000 บ./เดือน',
                'text-remaining': 'สิทธิรัฐเดือนนี้คงเหลือ',
                'text-max-limit': 'จากวงเงินสูงสุด 4,000 บาท',
                'text-item-label': 'รายการที่ซื้อ (เช่น ค่าอาหาร, ของใช้)',
                'item-placeholder': 'ระบุรายการ...',
                'text-amount-label': 'มูลค่าสินค้าหรือบริการ (บาท)',
                'text-currency': 'บาท',
                'text-gov-split': 'รัฐช่วย (60%)',
                'text-user-split': 'จ่ายเอง (40%)',
                'text-final-label': 'ยอดเงินที่ต้องกดจ่ายผ่านแอปฯ',
                'text-save-btn': 'บันทึกรายการ',
                'text-history-title': 'ประวัติการใช้จ่าย',
                'text-clear-btn': 'ล้างประวัติทั้งหมด',
                'text-no-history': 'ยังไม่มีประวัติการใช้จ่าย',
                'js-alert-invalid-amount': 'กรุณาระบุจำนวนเงินที่ถูกต้อง',
                'js-confirm-delete': 'คุณต้องการลบรายการนี้ใช่หรือไม่?',
                'js-alert-no-export': 'ไม่มีข้อมูลสำหรับ Export',
                'js-alert-invalid-file': 'รูปแบบไฟล์ไม่ถูกต้อง (ต้องตรงกับไฟล์ที่ Export ออกไป)',
                'js-alert-import-success': 'Import สำเร็จ {n} รายการ',
                'js-confirm-clear': 'คุณต้องการล้างประวัติการใช้จ่ายทั้งหมดใช่หรือไม่?',
                'js-unspecified-item': 'ไม่ระบุรายการ',
                'js-label-total': 'รวม:',
                'js-label-gov': 'รัฐ:',
                'js-label-user': 'คุณ:',
                'js-reset-done': '✨ รีเซ็ตโควตาแล้ว! (กรุณารีเฟรช)',
                'js-reset-in': '⏳ รีเซ็ตรอบใหม่ใน: ',
                'js-days': ' วัน ',
                'js-hrs': ' ชม. ',
                'js-mins': ' นาที'
            }
        };

        let currentLang = localStorage.getItem('paotangLang') || 'th';

        function toggleLanguage() {
            currentLang = currentLang === 'th' ? 'en' : 'th';
            localStorage.setItem('paotangLang', currentLang);
            applyLanguage();
        }

        function getTranslation(key) {
            return translations[currentLang][key] || key;
        }

        function applyLanguage() {
            // Update toggle button text
            const toggleBtn = document.getElementById('lang-toggle');
            if(toggleBtn) {
                toggleBtn.innerHTML = currentLang === 'th' ? '🇹🇭 TH' : '🇬🇧 EN';
            }

            // Update HTML elements with data-i18n
            document.querySelectorAll('[data-i18n]').forEach(el => {
                const key = el.getAttribute('data-i18n');
                if (translations[currentLang][key]) {
                    el.innerHTML = translations[currentLang][key];
                }
            });

            // Update placeholders
            document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
                const key = el.getAttribute('data-i18n-placeholder');
                if (translations[currentLang][key]) {
                    el.placeholder = translations[currentLang][key];
                }
            });

            // Re-render JS dynamic content
            renderHistory();
            startCountdown(); // update countdown text immediately
        }

        // Apply language immediately on load (will be called before renderHistory since we insert it before)
"""

# Replace JS strings that need translation
content = content.replace(
    "historyList.innerHTML = '<p style=\"text-align: center; color: #64748b; font-size: 0.9rem; padding: 20px;\">ยังไม่มีประวัติการใช้จ่าย</p>';",
    "historyList.innerHTML = `<p style=\"text-align: center; color: #64748b; font-size: 0.9rem; padding: 20px;\" data-i18n=\"text-no-history\">${getTranslation('text-no-history')}</p>`;"
)

content = content.replace(
    "${tx.itemName || 'ไม่ระบุรายการ'}",
    "${tx.itemName || getTranslation('js-unspecified-item')}"
)

content = content.replace(
    '<span class="label">รวม:</span>',
    '<span class="label">${getTranslation("js-label-total")}</span>'
)
content = content.replace(
    '<span class="label">รัฐ:</span>',
    '<span class="label">${getTranslation("js-label-gov")}</span>'
)
content = content.replace(
    '<span class="label">คุณ:</span>',
    '<span class="label">${getTranslation("js-label-user")}</span>'
)

content = content.replace(
    "if(confirm('คุณต้องการลบรายการนี้ใช่หรือไม่?')) {",
    "if(confirm(getTranslation('js-confirm-delete'))) {"
)

content = content.replace(
    "el.innerText = '✨ รีเซ็ตโควตาแล้ว! (กรุณารีเฟรช)';",
    "el.innerText = getTranslation('js-reset-done');"
)

content = content.replace(
    "let text = '⏳ รีเซ็ตรอบใหม่ใน: ';\n                if (days > 0) text += `${days} วัน `;\n                if (hours > 0) text += `${hours} ชม. `;\n                text += `${minutes} นาที`;",
    """let text = getTranslation('js-reset-in');
                if (days > 0) text += `${days}${getTranslation('js-days')}`;
                if (hours > 0) text += `${hours}${getTranslation('js-hrs')}`;
                text += `${minutes}${getTranslation('js-mins')}`;"""
)

content = content.replace(
    "alert('กรุณาระบุจำนวนเงินที่ถูกต้อง');",
    "alert(getTranslation('js-alert-invalid-amount'));"
)

content = content.replace(
    "alert('ไม่มีข้อมูลสำหรับ Export');",
    "alert(getTranslation('js-alert-no-export'));"
)

content = content.replace(
    'alert("รูปแบบไฟล์ไม่ถูกต้อง (ต้องตรงกับไฟล์ที่ Export ออกไป)");',
    'alert(getTranslation("js-alert-invalid-file"));'
)

content = content.replace(
    "alert(`Import สำเร็จ ${newTransactions.length} รายการ`);",
    "alert(getTranslation('js-alert-import-success').replace('{n}', newTransactions.length));"
)

content = content.replace(
    "if (confirm('คุณต้องการล้างประวัติการใช้จ่ายทั้งหมดใช่หรือไม่?')) {",
    "if (confirm(getTranslation('js-confirm-clear'))) {"
)

# Insert JS logic at the beginning of the script tag
content = content.replace('<script>', '<script>\n' + js_logic)

# Replace the run on load block
content = content.replace(
    '// Run on load\n        calculateInitialQuota();\n        renderHistory();\n        startCountdown();',
    '// Run on load\n        applyLanguage();\n        calculateInitialQuota();\n        // renderHistory is called inside applyLanguage()\n        // startCountdown is called inside applyLanguage()'
)

with open('paotang.html', 'w', encoding='utf-8') as f:
    f.write(content)
