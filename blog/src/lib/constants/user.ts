export const USER_ROLES = {
  ADMIN: 'ADMIN',
  STAFF: 'STAFF',
  CUSTOMER: 'CUSTOMER',
} as const;

export const USER_STATUSES = {
  ACTIVE: 'ACTIVE',
  DISABLED: 'DISABLED',
} as const;

export const USER_ROLE_LABELS = {
  [USER_ROLES.ADMIN]: 'Admin',
  [USER_ROLES.STAFF]: 'Staff',
  [USER_ROLES.CUSTOMER]: 'Customer',
} as const;

export const USER_STATUS_LABELS = {
  [USER_STATUSES.ACTIVE]: 'Active',
  [USER_STATUSES.DISABLED]: 'Disabled',
} as const;

export const USER_ROLE_BADGE_VARIANTS = {
  [USER_ROLES.ADMIN]: 'destructive' as const,
  [USER_ROLES.STAFF]: 'default' as const,
  [USER_ROLES.CUSTOMER]: 'secondary' as const,
} as const;

export const USER_STATUS_BADGE_VARIANTS = {
  [USER_STATUSES.ACTIVE]: 'default' as const,
  [USER_STATUSES.DISABLED]: 'secondary' as const,
} as const;

export const DEFAULT_USER_VALUES = {
  role: USER_ROLES.CUSTOMER,
  status: USER_STATUSES.ACTIVE,
} as const;

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];
export type UserStatus = typeof USER_STATUSES[keyof typeof USER_STATUSES];
