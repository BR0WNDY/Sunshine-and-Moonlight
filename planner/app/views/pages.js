/* The page register: what exists, what it is called, and where it sits in the
   sidebar. The router, the sidebar and the document title all read from here.

   Merging the two apps took the nav from seven entries to eleven, which is too
   many for one flat list, so they are grouped. The groups are about what the
   user is doing, not which app a page came from. */

export const GROUPS = [
  {
    id: 'make',
    label: { th: 'สร้าง', en: 'Make' },
    pages: [
      { id: 'dashboard', key: 'pgDashboard', icon: 'dashboard' },
      { id: 'contents', key: 'pgContents', icon: 'list' },
      { id: 'planner', key: 'pgPlanner', icon: 'heart' },
      { id: 'calendar', key: 'pgCalendar', icon: 'calendar' },
    ],
  },
  {
    id: 'money',
    label: { th: 'เงิน', en: 'Money' },
    pages: [
      { id: 'money', key: 'pgMoney', icon: 'wallet' },
      { id: 'finance', key: 'pgFinance', icon: 'card', badge: 'bills' },
      { id: 'debts', key: 'pgDebts', icon: 'handcoins' },
    ],
  },
  {
    id: 'work',
    label: { th: 'เรียน & งาน', en: 'Study & work' },
    pages: [
      { id: 'homework', key: 'pgHomework', icon: 'graduation', badge: 'homework' },
      { id: 'sales', key: 'pgSales', icon: 'briefcase' },
    ],
  },
  {
    id: 'keep',
    label: { th: 'เก็บไว้', en: 'Keep' },
    pages: [
      { id: 'knowledge', key: 'pgKnowledge', icon: 'book' },
      { id: 'reminders', key: 'pgReminders', icon: 'bell' },
    ],
  },
];

/** Flat list, in sidebar order. */
export const PAGES = GROUPS.flatMap((group) => group.pages);

export const PAGE_IDS = PAGES.map((p) => p.id);

export const findPage = (id) => PAGES.find((p) => p.id === id);

export const DEFAULT_PAGE = 'dashboard';

export const isPage = (id) => PAGE_IDS.includes(id);
