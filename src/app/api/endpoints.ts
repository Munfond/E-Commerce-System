export const endpoints = {
  auth: {
    login: '/auth/login',
    me: '/auth/me',
  },
  seller: {
    products: '/seller/products',
    orders: '/seller/orders',
    inventory: '/seller/inventory',
    profile: '/seller/profile',
  },
} as const;

