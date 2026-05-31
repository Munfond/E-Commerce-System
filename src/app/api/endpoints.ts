export const endpoints = {
  auth: {
    login: 'auth/sessions',
    logout: 'auth/sessions',
    register: 'auth/accounts',
    verify: 'auth/verifications',
    me: 'auth/me',
    refresh: 'auth/sessions/refresh',
    passwordReset: {
      request: 'auth/password-reset/request',
      verify: 'auth/password-reset/verify',
      reset: 'auth/password-reset/reset',
    },
  },
  customer: {
    cart: 'customer/cart',
  },
  seller: {
    products: 'seller/products',
    orders: 'seller/orders',
    inventory: 'seller/inventory',
    profile: 'seller/profile',
  },
} as const;

