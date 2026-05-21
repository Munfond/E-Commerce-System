export const endpoints = {
  auth: {
    login: 'auth/sessions',
    register: 'auth/accounts',
    verify: 'auth/verifications',
    me: 'auth/me',
  },
  seller: {
    products: 'seller/products',
    orders: 'seller/orders',
    inventory: 'seller/inventory',
    profile: 'seller/profile',
  },
} as const;

