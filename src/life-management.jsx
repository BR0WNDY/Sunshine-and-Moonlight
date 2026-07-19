import React, { useState, useEffect, useMemo, StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import {
  ResponsiveContainer, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip,
  PieChart, Pie, Cell,
} from 'recharts';
import {
  LayoutDashboard, Wallet, HandCoins, BookOpen, Briefcase, Flame,
  Star, Plus, Trash2, Check, TriangleAlert, TrendingUp, Languages,
} from 'lucide-react';

/* ---------------- theme (Ravenclaw palette, matches the main site) ---------------- */
const T = {
  bg: '#070d1f',
  panel: '#0c1730',
  panel2: '#101f42',
  border: 'rgba(200,163,58,.18)',
  bronze: '#c8a23a',
  bronzeSoft: '#dcc06a',
  blue: '#2a4a86',
  blueSoft: '#4f79c9',
  ink: '#eef2fb',
  sub: '#c3cee0',
  faint: '#8fa1c4',
  green: '#57b47e',
  red: '#e07a6b',
  amber: '#d9a441',
  violet: '#8a7fd6',
};
const DISPLAY_FONT = "'Cormorant Garamond','IBM Plex Sans Thai',Georgia,serif";
const BODY_FONT = "'Inter','IBM Plex Sans Thai',system-ui,-apple-system,'Segoe UI',sans-serif";

/* ---------------- i18n ---------------- */
const MESSAGES = {
  th: {
    subtitle: 'ศูนย์จัดการชีวิต — เงิน · หนี้ · เรียน · งาน',
    tabDash: 'ภาพรวม', tabMoney: 'รายรับ-จ่าย', tabDebt: 'หนี้ & ยืม',
    tabHw: 'การบ้าน', tabSales: 'งานขาย', tabHabit: 'นิสัย',
    netBalance: 'ยอดคงเหลือสุทธิ',
    totals: (inc, exp) => `รับรวม ${inc} · จ่ายรวม ${exp}`,
    thisMonth: (m) => `เดือนนี้ (${m})`,
    debtOutstanding: 'หนี้ค้างจ่าย',
    owedToUs: (v) => `คนอื่นค้างเรา ${v}`,
    noDebtors: 'ไม่มีลูกหนี้',
    hwDueSoon: 'การบ้านใกล้ครบ',
    hwCount: (n) => `${n} งาน`,
    within7: 'ภายใน 7 วัน',
    salesClosed: 'ยอดขายปิดแล้ว',
    inPipeline: (v) => `ในไปป์ไลน์ ${v}`,
    incVsExp: 'รับ vs จ่าย · 6 เดือนล่าสุด',
    noChartData: 'ยังไม่มีข้อมูล — เริ่มบันทึกที่แท็บ รายรับ-จ่าย',
    income: 'รายรับ', expense: 'รายจ่าย',
    amountBaht: 'จำนวน (บาท)', category: 'หมวด', date: 'วันที่', note: 'โน้ต',
    notePh: 'รายละเอียด',
    addEntry: 'เพิ่มรายการ',
    expenseByCategory: 'รายจ่ายเดือนนี้ตามหมวด',
    recentHistory: 'ประวัติล่าสุด',
    noTx: 'ยังไม่มีรายการ — บันทึกรายรับหรือรายจ่ายแรกด้านบน',
    oweTab: 'หนี้ที่ต้องจ่าย', lentTab: 'เงินให้ยืม',
    creditor: 'เจ้าหนี้ / รายการ', debtor: 'ลูกหนี้',
    creditorPh: 'เช่น ผ่อน SPay', debtorPh: 'เช่น เพื่อน A',
    totalAmount: 'ยอดรวม', dueOptional: 'กำหนด (ถ้ามี)', add: 'เพิ่ม',
    oweTitle: 'หนี้ที่ต้องจ่าย', lentTitle: 'เงินให้คนอื่นยืม',
    noItems: 'ยังไม่มีรายการ',
    overdueDays: (n) => `เลย ${n} วัน`, dueToday: 'ครบวันนี้',
    daysLeft: (n) => `อีก ${n} วัน`, settled: 'ครบแล้ว', settleAll: 'ปิดยอด',
    subject: 'วิชา', subjectPh: 'เช่น Java',
    task: 'งาน', taskPh: 'เช่น Quiz array',
    dueDate: 'กำหนดส่ง', priority: 'ความสำคัญ',
    prioHigh: 'สูง', prioMed: 'กลาง', prioLow: 'ต่ำ',
    addHw: 'เพิ่มการบ้าน',
    noHw: 'ว่างเปล่า — เพิ่มการบ้านชิ้นแรกไว้กันลืม',
    hwDone: 'เสร็จแล้ว', hwOverdue: (n) => `เลยกำหนด ${n} วัน`,
    hwDueToday: 'ครบวันนี้!', generalSubject: 'ทั่วไป',
    closedRevenue: 'รายได้ปิดงาน', jobs: (n) => `${n} งาน`,
    pipeline: 'ไปป์ไลน์', notClosed: 'ยังไม่ปิด',
    client: 'ลูกค้า', clientPh: 'ชื่อ / โปรเจกต์',
    tier: 'แพ็กเกจ', price: 'ราคา', status: 'สถานะ',
    stLead: 'ติดต่อ', stProgress: 'กำลังทำ', stDone: 'ปิดงาน',
    addJob: 'เพิ่มงาน', allJobs: 'งานทั้งหมด',
    noSales: 'ยังไม่มีงาน — บันทึกออเดอร์ Fastwork แรกไว้ติดตามยอด',
    habitLabel: 'นิสัยที่อยากทำทุกวัน (สาย CS: โค้ด · อ่าน · ออกกำลัง · นอนตรงเวลา)',
    habitPh: 'เช่น เขียนโค้ด 30 นาที',
    streak: (n) => `${n} วันติด`,
    noHabits: 'ยังไม่มีนิสัยที่ติดตาม — เพิ่มอันแรกแล้วเริ่มสร้างสตรีค',
    chartIncome: 'รับ', chartExpense: 'จ่าย',
    locale: 'th-TH',
  },
  en: {
    subtitle: 'Life management hub — money · debts · study · work',
    tabDash: 'Overview', tabMoney: 'Money', tabDebt: 'Debts & Loans',
    tabHw: 'Homework', tabSales: 'Sales', tabHabit: 'Habits',
    netBalance: 'Net balance',
    totals: (inc, exp) => `Income ${inc} · Spent ${exp}`,
    thisMonth: (m) => `This month (${m})`,
    debtOutstanding: 'Debt outstanding',
    owedToUs: (v) => `Others owe us ${v}`,
    noDebtors: 'No debtors',
    hwDueSoon: 'Homework due soon',
    hwCount: (n) => `${n} task${n === 1 ? '' : 's'}`,
    within7: 'within 7 days',
    salesClosed: 'Sales closed',
    inPipeline: (v) => `In pipeline ${v}`,
    incVsExp: 'Income vs expenses · last 6 months',
    noChartData: 'No data yet — start recording in the Money tab',
    income: 'Income', expense: 'Expense',
    amountBaht: 'Amount (THB)', category: 'Category', date: 'Date', note: 'Note',
    notePh: 'Details',
    addEntry: 'Add entry',
    expenseByCategory: "This month's spending by category",
    recentHistory: 'Recent history',
    noTx: 'No entries yet — record your first income or expense above',
    oweTab: 'Debts I owe', lentTab: 'Money lent out',
    creditor: 'Creditor / item', debtor: 'Debtor',
    creditorPh: 'e.g. SPay installment', debtorPh: 'e.g. Friend A',
    totalAmount: 'Total', dueOptional: 'Due date (optional)', add: 'Add',
    oweTitle: 'Debts I owe', lentTitle: 'Money lent to others',
    noItems: 'No items yet',
    overdueDays: (n) => `${n} day${n === 1 ? '' : 's'} overdue`, dueToday: 'Due today',
    daysLeft: (n) => `${n} day${n === 1 ? '' : 's'} left`, settled: 'Settled', settleAll: 'Settle',
    subject: 'Subject', subjectPh: 'e.g. Java',
    task: 'Task', taskPh: 'e.g. Quiz array',
    dueDate: 'Due date', priority: 'Priority',
    prioHigh: 'High', prioMed: 'Medium', prioLow: 'Low',
    addHw: 'Add homework',
    noHw: 'All clear — add your first assignment so you never forget',
    hwDone: 'Done', hwOverdue: (n) => `${n} day${n === 1 ? '' : 's'} overdue`,
    hwDueToday: 'Due today!', generalSubject: 'General',
    closedRevenue: 'Closed revenue', jobs: (n) => `${n} job${n === 1 ? '' : 's'}`,
    pipeline: 'Pipeline', notClosed: 'not closed yet',
    client: 'Client', clientPh: 'Name / project',
    tier: 'Package', price: 'Price', status: 'Status',
    stLead: 'Lead', stProgress: 'In progress', stDone: 'Closed',
    addJob: 'Add job', allJobs: 'All jobs',
    noSales: 'No jobs yet — log your first Fastwork order to track revenue',
    habitLabel: 'Daily habits (CS life: code · read · exercise · sleep on time)',
    habitPh: 'e.g. Code 30 minutes',
    streak: (n) => `${n}-day streak`,
    noHabits: 'No habits tracked yet — add one and start a streak',
    chartIncome: 'Income', chartExpense: 'Expense',
    locale: 'en-GB',
  },
};

// Category values are persisted in localStorage in Thai (canonical) — translate at display time only.
const EXPENSE_CATS = ['อาหาร', 'เดินทาง', 'ของใช้', 'บันเทิง', 'การศึกษา', 'สุขภาพ', 'หนี้/ผ่อน', 'อื่นๆ'];
const INCOME_CATS = ['Fastwork', 'เงินเดือน', 'ของขวัญ', 'ขายของ', 'อื่นๆ'];
const CAT_EN = {
  'อาหาร': 'Food', 'เดินทาง': 'Transport', 'ของใช้': 'Supplies', 'บันเทิง': 'Entertainment',
  'การศึกษา': 'Education', 'สุขภาพ': 'Health', 'หนี้/ผ่อน': 'Debt/Installment', 'อื่นๆ': 'Other',
  'เงินเดือน': 'Salary', 'ของขวัญ': 'Gift', 'ขายของ': 'Selling',
};
const PIE_COLORS = [T.bronze, T.blueSoft, T.violet, T.green, T.amber, T.red, T.bronzeSoft, T.faint];

/* ---------------- helpers ---------------- */
function useLocalStorage(key, initial) {
  const [value, setValue] = useState(() => {
    try {
      const raw = typeof window !== 'undefined' ? window.localStorage.getItem(key) : null;
      return raw ? JSON.parse(raw) : initial;
    } catch { return initial; }
  });
  useEffect(() => {
    try { window.localStorage.setItem(key, JSON.stringify(value)); } catch {}
  }, [key, value]);
  return [value, setValue];
}

const uid = () => Math.random().toString(36).slice(2, 10);
const baht = (v) => '฿' + (Number(v) || 0).toLocaleString('th-TH', { maximumFractionDigits: 0 });
const todayISO = () => new Date().toISOString().slice(0, 10);
const daysUntil = (d) => Math.ceil((new Date(d + 'T00:00:00') - new Date(new Date().toDateString())) / 864e5);
const monthOf = (d) => (d || '').slice(0, 7);
const currentMonth = () => todayISO().slice(0, 7);

/* ---------------- primitives ---------------- */
const Card = ({ children, style, ...rest }) => (
  <div {...rest} style={{ background: T.panel, border: `1px solid ${T.border}`, borderRadius: 14, ...style }}>
    {children}
  </div>
);

const inputStyle = {
  background: T.panel2, border: `1px solid ${T.border}`, color: T.ink,
  borderRadius: 9, padding: '9px 11px', fontSize: 14, outline: 'none', width: '100%',
  fontFamily: BODY_FONT,
};
const Input = (props) => <input {...props} style={{ ...inputStyle, ...(props.style || {}) }} />;
const Select = ({ children, ...rest }) => (
  <select {...rest} style={{ ...inputStyle, appearance: 'none', ...(rest.style || {}) }}>{children}</select>
);

const Button = ({ children, tone = 'bronze', style, ...rest }) => {
  const bg = tone === 'bronze' ? T.bronze : tone === 'ghost' ? 'transparent' : T.blueSoft;
  const fg = tone === 'bronze' ? '#1a1206' : tone === 'ghost' ? T.sub : '#fff';
  return (
    <button {...rest} style={{
      background: bg, color: fg, border: tone === 'ghost' ? `1px solid ${T.border}` : 'none',
      borderRadius: 9, padding: '9px 14px', fontSize: 14, fontWeight: 600, cursor: 'pointer',
      display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: BODY_FONT, ...style,
    }}>
      {children}
    </button>
  );
};

const FieldLabel = ({ children }) => (
  <div style={{ fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: T.faint, marginBottom: 5 }}>
    {children}
  </div>
);

const Empty = ({ icon: Icon, text }) => (
  <div style={{ textAlign: 'center', padding: '34px 12px', color: T.faint }}>
    <Icon size={26} style={{ opacity: 0.5, marginBottom: 8 }} />
    <div style={{ fontSize: 14 }}>{text}</div>
  </div>
);

const IconBtn = ({ children, ...rest }) => (
  <button {...rest} style={{ background: 'transparent', border: 'none', color: T.faint, cursor: 'pointer', padding: 4, display: 'inline-flex' }}>
    {children}
  </button>
);

/* ---------------- header starfield ---------------- */
function Starfield() {
  const stars = useMemo(() => Array.from({ length: 34 }, () => ({
    x: Math.random() * 100, y: Math.random() * 100,
    s: Math.random() * 1.6 + 0.5, o: Math.random() * 0.6 + 0.15,
  })), []);
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      {stars.map((st, i) => (
        <div key={i} style={{
          position: 'absolute', left: `${st.x}%`, top: `${st.y}%`,
          width: st.s, height: st.s, borderRadius: '50%',
          background: T.bronzeSoft, opacity: st.o,
        }} />
      ))}
    </div>
  );
}

/* ---------------- dashboard tab ---------------- */
function DashboardTab({ t, tx, debts, hw, sales, setTab }) {
  const income = tx.filter((x) => x.type === 'income').reduce((s, x) => s + x.amount, 0);
  const expense = tx.filter((x) => x.type === 'expense').reduce((s, x) => s + x.amount, 0);
  const net = income - expense;
  const month = currentMonth();
  const mIncome = tx.filter((x) => x.type === 'income' && monthOf(x.date) === month).reduce((s, x) => s + x.amount, 0);
  const mExpense = tx.filter((x) => x.type === 'expense' && monthOf(x.date) === month).reduce((s, x) => s + x.amount, 0);
  const oweLeft = debts.filter((d) => d.kind === 'owe').reduce((s, d) => s + (d.total - d.paid), 0);
  const lentLeft = debts.filter((d) => d.kind === 'lent').reduce((s, d) => s + (d.total - d.paid), 0);
  const hwSoon = hw.filter((h) => !h.done && daysUntil(h.due) <= 7).length;
  const salesDone = sales.filter((s) => s.status === 'done').reduce((a, s) => a + s.amount, 0);
  const salesOpen = sales.filter((s) => s.status !== 'done').reduce((a, s) => a + s.amount, 0);

  const chartData = useMemo(() => {
    const now = new Date();
    return Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      const key = d.toISOString().slice(0, 7);
      return {
        name: d.toLocaleDateString(t.locale, { month: 'short' }),
        [t.chartIncome]: tx.filter((x) => x.type === 'income' && monthOf(x.date) === key).reduce((s, x) => s + x.amount, 0),
        [t.chartExpense]: tx.filter((x) => x.type === 'expense' && monthOf(x.date) === key).reduce((s, x) => s + x.amount, 0),
      };
    });
  }, [tx, t]);

  const stats = [
    { label: t.netBalance, value: baht(net), color: net >= 0 ? T.green : T.red, sub: t.totals(baht(income), baht(expense)) },
    { label: t.thisMonth(month), value: baht(mIncome - mExpense), color: T.bronzeSoft, sub: `+${baht(mIncome)} / -${baht(mExpense)}` },
    { label: t.debtOutstanding, value: baht(oweLeft), color: oweLeft > 0 ? T.amber : T.green, sub: lentLeft > 0 ? t.owedToUs(baht(lentLeft)) : t.noDebtors, tab: 'debt' },
    { label: t.hwDueSoon, value: t.hwCount(hwSoon), color: hwSoon > 0 ? T.red : T.green, sub: t.within7, tab: 'hw' },
    { label: t.salesClosed, value: baht(salesDone), color: T.violet, sub: t.inPipeline(baht(salesOpen)), tab: 'sales' },
  ];

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 12 }}>
        {stats.map((s, i) => (
          <Card key={i} onClick={() => s.tab && setTab(s.tab)} style={{ padding: 16, cursor: s.tab ? 'pointer' : 'default' }}>
            <FieldLabel>{s.label}</FieldLabel>
            <div style={{ fontFamily: DISPLAY_FONT, fontSize: 25, fontWeight: 600, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 11.5, color: T.faint, marginTop: 4 }}>{s.sub}</div>
          </Card>
        ))}
      </div>

      <Card style={{ padding: 18, marginTop: 14 }}>
        <div style={{ fontFamily: DISPLAY_FONT, fontSize: 17, marginBottom: 12 }}>{t.incVsExp}</div>
        {income + expense === 0 ? (
          <Empty icon={TrendingUp} text={t.noChartData} />
        ) : (
          <ResponsiveContainer width="100%" height={230}>
            <BarChart data={chartData} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke={T.border} vertical={false} />
              <XAxis dataKey="name" tick={{ fill: T.sub, fontSize: 12 }} axisLine={{ stroke: T.border }} tickLine={false} />
              <YAxis tick={{ fill: T.sub, fontSize: 11 }} axisLine={false} tickLine={false} width={44} />
              <Tooltip contentStyle={{ background: T.panel2, border: `1px solid ${T.border}`, borderRadius: 8, color: T.ink }} cursor={{ fill: '#ffffff08' }} />
              <Bar dataKey={t.chartIncome} fill={T.green} radius={[4, 4, 0, 0]} />
              <Bar dataKey={t.chartExpense} fill={T.red} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </Card>
    </div>
  );
}

/* ---------------- money tab ---------------- */
function MoneyTab({ t, lang, tx, setTx }) {
  const [type, setType] = useState('expense');
  const [amount, setAmount] = useState('');
  const [cat, setCat] = useState(EXPENSE_CATS[0]);
  const [note, setNote] = useState('');
  const [date, setDate] = useState(todayISO());
  const cats = type === 'expense' ? EXPENSE_CATS : INCOME_CATS;
  const catLabel = (c) => (lang === 'en' ? (CAT_EN[c] || c) : c);

  const addTx = () => {
    const a = parseFloat(amount);
    if (!a || a <= 0) return;
    setTx([{ id: uid(), type, amount: a, category: cats.includes(cat) ? cat : cats[0], note, date }, ...tx]);
    setAmount(''); setNote('');
  };
  const removeTx = (id) => setTx(tx.filter((x) => x.id !== id));

  const month = currentMonth();
  const byCat = useMemo(() => {
    const m = {};
    tx.filter((x) => x.type === 'expense' && monthOf(x.date) === month).forEach((x) => {
      m[x.category] = (m[x.category] || 0) + x.amount;
    });
    return Object.entries(m).map(([name, value]) => ({ name, value }));
  }, [tx]);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 14 }}>
      <Card style={{ padding: 16 }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          {['expense', 'income'].map((m) => (
            <button key={m} onClick={() => { setType(m); setCat((m === 'expense' ? EXPENSE_CATS : INCOME_CATS)[0]); }}
              style={{
                flex: 1, padding: '10px', borderRadius: 9, cursor: 'pointer', fontWeight: 600, fontSize: 14,
                fontFamily: BODY_FONT,
                border: `1px solid ${type === m ? (m === 'expense' ? T.red : T.green) : T.border}`,
                background: type === m ? (m === 'expense' ? '#e07a6b22' : '#57b47e22') : 'transparent',
                color: type === m ? (m === 'expense' ? T.red : T.green) : T.sub,
              }}>
              {m === 'expense' ? t.expense : t.income}
            </button>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(130px,1fr))', gap: 10 }}>
          <div>
            <FieldLabel>{t.amountBaht}</FieldLabel>
            <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0" />
          </div>
          <div>
            <FieldLabel>{t.category}</FieldLabel>
            <Select value={cat} onChange={(e) => setCat(e.target.value)}>
              {cats.map((c) => <option key={c} value={c}>{catLabel(c)}</option>)}
            </Select>
          </div>
          <div>
            <FieldLabel>{t.date}</FieldLabel>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div>
            <FieldLabel>{t.note}</FieldLabel>
            <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder={t.notePh} />
          </div>
        </div>
        <Button onClick={addTx} style={{ marginTop: 12 }}><Plus size={16} />{t.addEntry}</Button>
      </Card>

      {byCat.length > 0 && (
        <Card style={{ padding: 16 }}>
          <div style={{ fontFamily: DISPLAY_FONT, fontSize: 17, marginBottom: 6 }}>{t.expenseByCategory}</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 12 }}>
            <ResponsiveContainer width={190} height={190}>
              <PieChart>
                <Pie data={byCat} dataKey="value" nameKey="name" innerRadius={45} outerRadius={80} paddingAngle={2}>
                  {byCat.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} stroke="none" />)}
                </Pie>
                <Tooltip contentStyle={{ background: T.panel2, border: `1px solid ${T.border}`, borderRadius: 8, color: T.ink }} formatter={(v) => baht(v)} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5, flex: 1, minWidth: 150 }}>
              {[...byCat].sort((a, b) => b.value - a.value).map((c, i) => (
                <div key={c.name} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                  <span style={{ width: 10, height: 10, borderRadius: 3, background: PIE_COLORS[i % PIE_COLORS.length] }} />
                  <span style={{ color: T.sub }}>{catLabel(c.name)}</span>
                  <span style={{ marginLeft: 'auto', color: T.ink, fontWeight: 600 }}>{baht(c.value)}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      <Card style={{ padding: 16 }}>
        <div style={{ fontFamily: DISPLAY_FONT, fontSize: 17, marginBottom: 10 }}>{t.recentHistory}</div>
        {tx.length === 0 ? (
          <Empty icon={Wallet} text={t.noTx} />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {tx.slice(0, 40).map((x) => (
              <div key={x.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderTop: `1px solid ${T.border}` }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: x.type === 'income' ? T.green : T.red }} />
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 14 }}>
                    {catLabel(x.category)}
                    {x.note ? <span style={{ color: T.faint }}> · {x.note}</span> : ''}
                  </div>
                  <div style={{ fontSize: 11.5, color: T.faint }}>{x.date}</div>
                </div>
                <div style={{ marginLeft: 'auto', fontWeight: 700, color: x.type === 'income' ? T.green : T.red }}>
                  {x.type === 'income' ? '+' : '−'}{baht(x.amount)}
                </div>
                <IconBtn onClick={() => removeTx(x.id)}><Trash2 size={15} /></IconBtn>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

/* ---------------- debts tab ---------------- */
function DebtTab({ t, debts, setDebts }) {
  const [kind, setKind] = useState('owe');
  const [name, setName] = useState('');
  const [total, setTotal] = useState('');
  const [due, setDue] = useState('');

  const addDebt = () => {
    const v = parseFloat(total);
    if (!name.trim() || !v || v <= 0) return;
    setDebts([{ id: uid(), kind, name: name.trim(), total: v, paid: 0, due }, ...debts]);
    setName(''); setTotal(''); setDue('');
  };
  const pay = (id, amt) => setDebts(debts.map((d) => (d.id === id ? { ...d, paid: Math.min(d.total, d.paid + amt) } : d)));
  const remove = (id) => setDebts(debts.filter((d) => d.id !== id));

  const owe = debts.filter((d) => d.kind === 'owe');
  const lent = debts.filter((d) => d.kind === 'lent');

  const DebtList = ({ title, list, tone }) => (
    <Card style={{ padding: 16 }}>
      <div style={{ fontFamily: DISPLAY_FONT, fontSize: 17, marginBottom: 10 }}>{title}</div>
      {list.length === 0 ? <Empty icon={HandCoins} text={t.noItems} /> : list.map((d) => {
        const left = d.total - d.paid;
        const pct = Math.round((d.paid / d.total) * 100);
        const settled = left <= 0;
        const days = d.due ? daysUntil(d.due) : null;
        return (
          <div key={d.id} style={{ padding: '11px 0', borderTop: `1px solid ${T.border}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ fontWeight: 600, fontSize: 14.5 }}>{d.name}</div>
              {d.due && !settled && (
                <span style={{ fontSize: 11, color: days < 0 ? T.red : days <= 5 ? T.amber : T.faint }}>
                  {days < 0 ? t.overdueDays(-days) : days === 0 ? t.dueToday : t.daysLeft(days)}
                </span>
              )}
              {settled && (
                <span style={{ fontSize: 11, color: T.green, display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                  <Check size={13} />{t.settled}
                </span>
              )}
              <div style={{ marginLeft: 'auto', fontWeight: 700, color: settled ? T.green : tone }}>
                {baht(left)}
                <span style={{ color: T.faint, fontWeight: 400, fontSize: 12 }}> / {baht(d.total)}</span>
              </div>
            </div>
            <div style={{ height: 6, background: T.panel2, borderRadius: 4, marginTop: 8, overflow: 'hidden' }}>
              <div style={{ width: `${pct}%`, height: '100%', background: settled ? T.green : tone }} />
            </div>
            <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
              {!settled && [100, 500, 1000].map((p) => (
                <Button key={p} tone="ghost" onClick={() => pay(d.id, p)} style={{ padding: '5px 10px', fontSize: 12 }}>+{p}</Button>
              ))}
              {!settled && (
                <Button tone="ghost" onClick={() => pay(d.id, left)} style={{ padding: '5px 10px', fontSize: 12 }}>{t.settleAll}</Button>
              )}
              <IconBtn onClick={() => remove(d.id)} style={{ marginLeft: 'auto' }}><Trash2 size={15} /></IconBtn>
            </div>
          </div>
        );
      })}
    </Card>
  );

  return (
    <div style={{ display: 'grid', gap: 14 }}>
      <Card style={{ padding: 16 }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          {[['owe', t.oweTab, T.amber], ['lent', t.lentTab, T.blueSoft]].map(([k, label, tone]) => (
            <button key={k} onClick={() => setKind(k)} style={{
              flex: 1, padding: 10, borderRadius: 9, cursor: 'pointer', fontWeight: 600, fontSize: 14,
              fontFamily: BODY_FONT,
              border: `1px solid ${kind === k ? tone : T.border}`,
              background: kind === k ? tone + '22' : 'transparent',
              color: kind === k ? tone : T.sub,
            }}>{label}</button>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: 10 }}>
          <div>
            <FieldLabel>{kind === 'owe' ? t.creditor : t.debtor}</FieldLabel>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder={kind === 'owe' ? t.creditorPh : t.debtorPh} />
          </div>
          <div>
            <FieldLabel>{t.totalAmount}</FieldLabel>
            <Input type="number" value={total} onChange={(e) => setTotal(e.target.value)} placeholder="0" />
          </div>
          <div>
            <FieldLabel>{t.dueOptional}</FieldLabel>
            <Input type="date" value={due} onChange={(e) => setDue(e.target.value)} />
          </div>
        </div>
        <Button onClick={addDebt} style={{ marginTop: 12 }}><Plus size={16} />{t.add}</Button>
      </Card>
      <DebtList title={t.oweTitle} list={owe} tone={T.amber} />
      <DebtList title={t.lentTitle} list={lent} tone={T.blueSoft} />
    </div>
  );
}

/* ---------------- homework tab ---------------- */
function HomeworkTab({ t, hw, setHw }) {
  const [subject, setSubject] = useState('');
  const [title, setTitle] = useState('');
  const [due, setDue] = useState('');
  const [prio, setPrio] = useState('med');
  const prios = { high: [t.prioHigh, T.red], med: [t.prioMed, T.amber], low: [t.prioLow, T.faint] };

  const addHw = () => {
    if (!title.trim() || !due) return;
    setHw([...hw, { id: uid(), subject: subject.trim() || t.generalSubject, title: title.trim(), due, prio, done: false }]);
    setSubject(''); setTitle(''); setDue('');
  };
  const toggle = (id) => setHw(hw.map((h) => (h.id === id ? { ...h, done: !h.done } : h)));
  const remove = (id) => setHw(hw.filter((h) => h.id !== id));
  const sorted = [...hw].sort((a, b) => a.done - b.done || (a.due < b.due ? -1 : 1));

  return (
    <div style={{ display: 'grid', gap: 14 }}>
      <Card style={{ padding: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: 10 }}>
          <div>
            <FieldLabel>{t.subject}</FieldLabel>
            <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder={t.subjectPh} />
          </div>
          <div>
            <FieldLabel>{t.task}</FieldLabel>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t.taskPh} />
          </div>
          <div>
            <FieldLabel>{t.dueDate}</FieldLabel>
            <Input type="date" value={due} onChange={(e) => setDue(e.target.value)} />
          </div>
          <div>
            <FieldLabel>{t.priority}</FieldLabel>
            <Select value={prio} onChange={(e) => setPrio(e.target.value)}>
              {Object.entries(prios).map(([k, v]) => <option key={k} value={k}>{v[0]}</option>)}
            </Select>
          </div>
        </div>
        <Button onClick={addHw} style={{ marginTop: 12 }}><Plus size={16} />{t.addHw}</Button>
      </Card>

      <Card style={{ padding: 16 }}>
        {hw.length === 0 ? (
          <Empty icon={BookOpen} text={t.noHw} />
        ) : sorted.map((h) => {
          const days = daysUntil(h.due);
          const urgent = !h.done && days <= 2;
          return (
            <div key={h.id} style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '11px 0', borderTop: `1px solid ${T.border}`, opacity: h.done ? 0.5 : 1 }}>
              <button onClick={() => toggle(h.id)} style={{
                width: 22, height: 22, borderRadius: 6, cursor: 'pointer', flexShrink: 0,
                border: `1.5px solid ${h.done ? T.green : T.border}`,
                background: h.done ? T.green : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {h.done && <Check size={14} color="#fff" />}
              </button>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 14.5, textDecoration: h.done ? 'line-through' : 'none' }}>
                  <span style={{ color: T.bronzeSoft, fontSize: 12, marginRight: 6 }}>{h.subject}</span>
                  {h.title}
                </div>
                <div style={{ fontSize: 12, color: urgent ? T.red : T.faint, marginTop: 2, display: 'flex', alignItems: 'center', gap: 5 }}>
                  {urgent && <TriangleAlert size={12} />}
                  {h.done ? t.hwDone : days < 0 ? t.hwOverdue(-days) : days === 0 ? t.hwDueToday : t.daysLeft(days)} · {h.due}
                </div>
              </div>
              <span style={{ marginLeft: 'auto', fontSize: 11, color: prios[h.prio][1], fontWeight: 600 }}>{prios[h.prio][0]}</span>
              <IconBtn onClick={() => remove(h.id)}><Trash2 size={15} /></IconBtn>
            </div>
          );
        })}
      </Card>
    </div>
  );
}

/* ---------------- sales tab ---------------- */
function SalesTab({ t, sales, setSales }) {
  const TIER_COLORS = { Basic: T.blueSoft, Standard: T.bronze, Premium: T.violet };
  const statuses = { lead: [t.stLead, T.faint], progress: [t.stProgress, T.amber], done: [t.stDone, T.green] };
  const [client, setClient] = useState('');
  const [tier, setTier] = useState('Standard');
  const [amount, setAmount] = useState('');
  const [status, setStatus] = useState('lead');
  const [date, setDate] = useState(todayISO());

  const addSale = () => {
    const a = parseFloat(amount);
    if (!client.trim() || !a) return;
    setSales([{ id: uid(), client: client.trim(), tier, amount: a, status, date }, ...sales]);
    setClient(''); setAmount('');
  };
  const setSaleStatus = (id, st) => setSales(sales.map((s) => (s.id === id ? { ...s, status: st } : s)));
  const remove = (id) => setSales(sales.filter((s) => s.id !== id));

  const closed = sales.filter((s) => s.status === 'done').reduce((a, s) => a + s.amount, 0);
  const open = sales.filter((s) => s.status !== 'done').reduce((a, s) => a + s.amount, 0);
  const closedCount = sales.filter((s) => s.status === 'done').length;

  return (
    <div style={{ display: 'grid', gap: 14 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: 12 }}>
        <Card style={{ padding: 16 }}>
          <FieldLabel>{t.closedRevenue}</FieldLabel>
          <div style={{ fontFamily: DISPLAY_FONT, fontSize: 24, color: T.green }}>{baht(closed)}</div>
          <div style={{ fontSize: 11.5, color: T.faint }}>{t.jobs(closedCount)}</div>
        </Card>
        <Card style={{ padding: 16 }}>
          <FieldLabel>{t.pipeline}</FieldLabel>
          <div style={{ fontFamily: DISPLAY_FONT, fontSize: 24, color: T.amber }}>{baht(open)}</div>
          <div style={{ fontSize: 11.5, color: T.faint }}>{t.notClosed}</div>
        </Card>
      </div>

      <Card style={{ padding: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(130px,1fr))', gap: 10 }}>
          <div>
            <FieldLabel>{t.client}</FieldLabel>
            <Input value={client} onChange={(e) => setClient(e.target.value)} placeholder={t.clientPh} />
          </div>
          <div>
            <FieldLabel>{t.tier}</FieldLabel>
            <Select value={tier} onChange={(e) => setTier(e.target.value)}>
              {Object.keys(TIER_COLORS).map((k) => <option key={k}>{k}</option>)}
            </Select>
          </div>
          <div>
            <FieldLabel>{t.price}</FieldLabel>
            <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0" />
          </div>
          <div>
            <FieldLabel>{t.status}</FieldLabel>
            <Select value={status} onChange={(e) => setStatus(e.target.value)}>
              {Object.entries(statuses).map(([k, v]) => <option key={k} value={k}>{v[0]}</option>)}
            </Select>
          </div>
          <div>
            <FieldLabel>{t.date}</FieldLabel>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
        </div>
        <Button onClick={addSale} style={{ marginTop: 12 }}><Plus size={16} />{t.addJob}</Button>
      </Card>

      <Card style={{ padding: 16 }}>
        <div style={{ fontFamily: DISPLAY_FONT, fontSize: 17, marginBottom: 10 }}>{t.allJobs}</div>
        {sales.length === 0 ? (
          <Empty icon={Briefcase} text={t.noSales} />
        ) : sales.map((s) => (
          <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 0', borderTop: `1px solid ${T.border}` }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: TIER_COLORS[s.tier], border: `1px solid ${TIER_COLORS[s.tier]}55`, borderRadius: 6, padding: '2px 7px' }}>{s.tier}</span>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 14.5 }}>{s.client}</div>
              <div style={{ fontSize: 11.5, color: T.faint }}>{s.date}</div>
            </div>
            <div style={{ marginLeft: 'auto', fontWeight: 700 }}>{baht(s.amount)}</div>
            <Select value={s.status} onChange={(e) => setSaleStatus(s.id, e.target.value)}
              style={{ width: 'auto', padding: '5px 8px', fontSize: 12, color: statuses[s.status][1] }}>
              {Object.entries(statuses).map(([k, v]) => <option key={k} value={k}>{v[0]}</option>)}
            </Select>
            <IconBtn onClick={() => remove(s.id)}><Trash2 size={15} /></IconBtn>
          </div>
        ))}
      </Card>
    </div>
  );
}

/* ---------------- habits tab ---------------- */
function HabitTab({ t, habits, setHabits }) {
  const [name, setName] = useState('');

  const addHabit = () => {
    if (!name.trim()) return;
    setHabits([...habits, { id: uid(), name: name.trim(), dates: [] }]);
    setName('');
  };
  const remove = (id) => setHabits(habits.filter((h) => h.id !== id));
  const toggleDay = (id, key) => setHabits(habits.map((h) => (
    h.id === id ? { ...h, dates: h.dates.includes(key) ? h.dates.filter((d) => d !== key) : [...h.dates, key] } : h
  )));

  const week = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return { key: d.toISOString().slice(0, 10), lbl: d.toLocaleDateString(t.locale, { weekday: 'narrow' }) };
  });

  const streak = (dates) => {
    let n = 0;
    const d = new Date();
    while (dates.includes(d.toISOString().slice(0, 10))) { n++; d.setDate(d.getDate() - 1); }
    return n;
  };

  return (
    <div style={{ display: 'grid', gap: 14 }}>
      <Card style={{ padding: 16 }}>
        <FieldLabel>{t.habitLabel}</FieldLabel>
        <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder={t.habitPh}
            onKeyDown={(e) => e.key === 'Enter' && addHabit()} />
          <Button onClick={addHabit}><Plus size={16} />{t.add}</Button>
        </div>
      </Card>

      {habits.length === 0 ? (
        <Card style={{ padding: 16 }}>
          <Empty icon={Flame} text={t.noHabits} />
        </Card>
      ) : habits.map((h) => {
        const s = streak(h.dates);
        return (
          <Card key={h.id} style={{ padding: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <div style={{ fontSize: 15, fontWeight: 600 }}>{h.name}</div>
              <span style={{ fontSize: 12, color: s > 0 ? T.amber : T.faint, display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                <Flame size={14} />{t.streak(s)}
              </span>
              <IconBtn onClick={() => remove(h.id)} style={{ marginLeft: 'auto' }}><Trash2 size={15} /></IconBtn>
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'space-between' }}>
              {week.map((day) => {
                const on = h.dates.includes(day.key);
                return (
                  <button key={day.key} onClick={() => toggleDay(h.id, day.key)}
                    style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, cursor: 'pointer', background: 'none', border: 'none' }}>
                    <span style={{ fontSize: 11, color: T.faint }}>{day.lbl}</span>
                    <span style={{
                      width: 30, height: 30, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: on ? T.bronze : T.panel2, border: `1px solid ${on ? T.bronze : T.border}`,
                    }}>
                      {on && <Check size={16} color="#1a1206" />}
                    </span>
                  </button>
                );
              })}
            </div>
          </Card>
        );
      })}
    </div>
  );
}

/* ---------------- app shell ---------------- */
function App() {
  const [lang, setLang] = useLocalStorage('lm:lang', 'th');
  const t = MESSAGES[lang] || MESSAGES.th;
  const [tab, setTab] = useState('dash');
  const [tx, setTx] = useLocalStorage('lm:transactions', []);
  const [debts, setDebts] = useLocalStorage('lm:debts', []);
  const [hw, setHw] = useLocalStorage('lm:assignments', []);
  const [sales, setSales] = useLocalStorage('lm:sales', []);
  const [habits, setHabits] = useLocalStorage('lm:habits', []);

  const tabs = [
    { id: 'dash', label: t.tabDash, icon: LayoutDashboard },
    { id: 'money', label: t.tabMoney, icon: Wallet },
    { id: 'debt', label: t.tabDebt, icon: HandCoins },
    { id: 'hw', label: t.tabHw, icon: BookOpen },
    { id: 'sales', label: t.tabSales, icon: Briefcase },
    { id: 'habit', label: t.tabHabit, icon: Flame },
  ];

  return (
    <div style={{ background: T.bg, minHeight: '100vh', color: T.ink, fontFamily: BODY_FONT }}>
      <div style={{ position: 'relative', overflow: 'hidden', borderBottom: `1px solid ${T.border}`, background: `linear-gradient(180deg,#0c1730 0%,${T.bg} 100%)` }}>
        <Starfield />
        <div style={{ maxWidth: 1080, margin: '0 auto', padding: '22px 20px 18px', position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Star size={20} color={T.bronze} fill={T.bronze} />
            <div>
              <div style={{ fontFamily: DISPLAY_FONT, fontSize: 26, fontWeight: 600, letterSpacing: 0.3 }}>Starlit Ledger</div>
              <div style={{ fontSize: 12, color: T.sub, marginTop: 1 }}>{t.subtitle}</div>
            </div>
            <button onClick={() => setLang(lang === 'th' ? 'en' : 'th')} style={{
              marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 6,
              background: 'transparent', border: `1px solid ${T.border}`, color: T.bronzeSoft,
              borderRadius: 999, padding: '7px 13px', fontSize: 12, letterSpacing: 1,
              cursor: 'pointer', fontFamily: BODY_FONT,
            }}>
              <Languages size={14} />
              {lang === 'th' ? 'EN ◇ TH' : 'TH ◇ EN'}
            </button>
          </div>
          <div style={{ width: 46, height: 2, background: T.bronze, borderRadius: 2, marginTop: 12 }} />
        </div>
      </div>

      <div style={{ borderBottom: `1px solid ${T.border}`, background: T.panel2 }}>
        <div style={{ maxWidth: 1080, margin: '0 auto', padding: '0 12px', display: 'flex', gap: 2, overflowX: 'auto' }}>
          {tabs.map((tb) => {
            const active = tab === tb.id;
            return (
              <button key={tb.id} onClick={() => setTab(tb.id)} style={{
                background: 'transparent', border: 'none', cursor: 'pointer', whiteSpace: 'nowrap',
                color: active ? T.bronzeSoft : T.sub, padding: '13px 14px', fontSize: 13.5,
                fontWeight: active ? 700 : 500, fontFamily: BODY_FONT,
                borderBottom: `2px solid ${active ? T.bronze : 'transparent'}`,
                display: 'inline-flex', alignItems: 'center', gap: 7,
              }}>
                <tb.icon size={16} />{tb.label}
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ maxWidth: 1080, margin: '0 auto', padding: '22px 16px 60px' }}>
        {tab === 'dash' && <DashboardTab t={t} tx={tx} debts={debts} hw={hw} sales={sales} setTab={setTab} />}
        {tab === 'money' && <MoneyTab t={t} lang={lang} tx={tx} setTx={setTx} />}
        {tab === 'debt' && <DebtTab t={t} debts={debts} setDebts={setDebts} />}
        {tab === 'hw' && <HomeworkTab t={t} hw={hw} setHw={setHw} />}
        {tab === 'sales' && <SalesTab t={t} sales={sales} setSales={setSales} />}
        {tab === 'habit' && <HabitTab t={t} habits={habits} setHabits={setHabits} />}
      </div>
    </div>
  );
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
