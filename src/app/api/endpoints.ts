export const endpoints = {
  auth: {
    login: 'auth/sessions',
    logout: 'auth/sessions',
    register: 'auth/accounts',
    verify: 'auth/verifications',
    google: 'auth/google',
    googleCallback: 'auth/google/callback',
    me: 'accounts/me',
    meAddresses: 'accounts/me/addresses',
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
    adminProducts: 'products/admin/products',
    adminProduct: (id: string) => `products/admin/products/${id}`,
  },
  orders: {
    customer: 'orders/customer/orders',
    customerOrder: (id: string) => `orders/customer/orders/${id}`,
    seller: 'orders/seller/orders',
    admin: 'orders/admin/orders',
  },
  admin: {
    users: 'admin/users',
  },
  seller: {
    products: 'seller/products',
    orders: 'orders/seller/orders',
    shopProduct: (id: string) => `../v2/products/me/${id}`,
    shopProductVariants: (id: string) => `../v2/products/me/${id}/variants`,
    shopProductVariant: (variantId: string) => `../v2/products/me/variants/${variantId}`,
    orderStatus: (id: string) => `orders/seller/orders/${id}/status`,
    inventory: 'seller/inventory',
    profile: 'seller/profile',
    shops: 'sellers/shops',
    shopMe: 'sellers/shops/me',
    shopProductsMe: '../v2/products/me',
    shopAddress: 'sellers/shops/address',
  },
} as const;

