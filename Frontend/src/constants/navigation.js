export const NAV_SECTIONS = [
  {
    label: 'Dashboard',
    items: [
      { key: 'dl-eff', label: 'DL Efficiency', icon: 'activity' },
    ],
  },
  {
    label: 'Data Management',
    items: [
      { key: 'pd-input', label: 'Data Records', icon: 'database' },
    ],
  },
  {
    label: 'Administration',
    adminOnly: true,
    items: [
      { key: 'user-management', label: 'User Management', icon: 'users', adminOnly: true },
    ],
  },
];
