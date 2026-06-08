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
  orders: {
    customer: 'orders/customer/orders',
    customerOrder: (orderId: string) => `orders/customer/orders/${orderId}`,
    seller: 'orders/seller/orders',
  },
  seller: {
    products: 'seller/products',
    orders: 'orders/seller/orders',
    orderStatus: (orderId: string) => `orders/seller/orders/${orderId}/status`,
    inventory: 'seller/inventory',
    profile: 'seller/profile',
    shops: 'sellers/shops',
    shopMe: 'sellers/shops/me',
    shopProductsMe: '../v2/products/me',
    shopAddress: 'sellers/shops/address',
  },
} as const;

