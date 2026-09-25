import { Users, ShieldCheck, UtensilsCrossed } from 'lucide-react';

// Keys MUST match backend core.db.models.UserRole values exactly.
export const ROLES = {
  CUSTOMER: 'customer',
  REGULATOR: 'regulator', // Admin / Regulator / Inspector combined bucket
  OWNER: 'owner',          // Hotel / Restaurant / Cloud Kitchen Owner
};

export const ROLE_OPTIONS = [
  {
    key: ROLES.CUSTOMER,
    label: 'Customer',
    description: 'Check hygiene scores before you order or dine out.',
    icon: Users,
  },
  {
    key: ROLES.REGULATOR,
    label: 'Admin / Regulator / Inspector',
    description: 'Official FDA / municipal accounts running the enforcement dashboard.',
    icon: ShieldCheck,
  },
  {
    key: ROLES.OWNER,
    label: 'Hotel / Restaurant / Cloud Kitchen Owner',
    description: 'Manage your outlet\u2019s compliance status and inspection history.',
    icon: UtensilsCrossed,
  },
];

// Where each role lands after a successful login/signup.
export const ROLE_HOME_ROUTE = {
  [ROLES.CUSTOMER]: '/dashboard/customer',
  [ROLES.REGULATOR]: '/dashboard/regulator',
  [ROLES.OWNER]: '/dashboard/owner',
};
