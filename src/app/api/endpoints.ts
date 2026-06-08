export const endpoints = {
  auth: {
    login: 'auth/sessions',
    logout: 'auth/sessions',
    register: 'auth/accounts',
    verify: 'auth/verifications',
    me: 'accounts/me',
    refresh: 'auth/sessions/refresh',
    passwordReset: {
      request: 'auth/password-reset/request',
      verify: 'auth/password-reset/verify',
      reset: 'auth/password-reset/reset',
    },
    password: 'accounts/password',
  },
  customer: {
    cart: 'customer/cart',
    orders: 'orders/customer/orders',
    order: (orderId: string) => `orders/customer/orders/${orderId}`,
  },
  categories: {
    root: 'categories',
    products: (categoryId: string) => `categories/${categoryId}/products`,
  },
  products: {
    customerSearch: 'products/customer/products',
    keywordSearch: 'products/keyword',
  },
  seller: {
    products: 'seller/products',
    orders: 'seller/orders',
    inventory: 'seller/inventory',
    profile: 'seller/profile',
    shops: 'sellers/shops',
  },
} as const;

