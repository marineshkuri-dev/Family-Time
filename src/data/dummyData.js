export const currentUser = {
  id: 1,
  name: 'ישראל ישראלי',
  email: 'israel@family.com',
  avatar: null,
  role: 'admin',
};

export const familyMembers = [
  { id: 1, name: 'ישראל ישראלי', role: 'אב', avatar: null, color: '#4a90d9' },
  { id: 2, name: 'שרה ישראלי',   role: 'אם', avatar: null, color: '#f4a07a' },
  { id: 3, name: 'יוסי ישראלי',  role: 'ילד', avatar: null, color: '#5cb85c' },
  { id: 4, name: 'רחל ישראלי',   role: 'ילדה', avatar: null, color: '#9b59b6' },
];

export const events = [
  {
    id: 1,
    title: 'ארוחת ערב משפחתית',
    date: '2026-06-20',
    time: '19:00',
    category: 'משפחה',
    memberId: 1,
    color: '#4a90d9',
  },
  {
    id: 2,
    title: 'פגישת הורים בבית הספר',
    date: '2026-06-22',
    time: '10:00',
    category: 'חינוך',
    memberId: 2,
    color: '#f4a07a',
  },
  {
    id: 3,
    title: 'אימון כדורגל',
    date: '2026-06-23',
    time: '17:00',
    category: 'ספורט',
    memberId: 3,
    color: '#5cb85c',
  },
  {
    id: 4,
    title: 'טיול סוף שבוע',
    date: '2026-06-27',
    time: '09:00',
    category: 'פנאי',
    memberId: 1,
    color: '#9b59b6',
  },
];

export const tasks = [
  { id: 1, title: 'קניות לסופרמרקט', done: false, assignedTo: 2, priority: 'גבוה', dueDate: '2026-06-19' },
  { id: 2, title: 'תשלום חשמל', done: true,  assignedTo: 1, priority: 'גבוה', dueDate: '2026-06-18' },
  { id: 3, title: 'הבאת ילדים מבית הספר', done: false, assignedTo: 2, priority: 'בינוני', dueDate: '2026-06-19' },
  { id: 4, title: 'ניקיון הבית', done: false, assignedTo: 3, priority: 'נמוך', dueDate: '2026-06-21' },
  { id: 5, title: 'תרגיל מתמטיקה', done: true,  assignedTo: 3, priority: 'גבוה', dueDate: '2026-06-18' },
];

export const categories = ['משפחה', 'חינוך', 'ספורט', 'פנאי', 'עבודה', 'בריאות', 'אחר'];
