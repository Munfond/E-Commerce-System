import { api } from './client';
import { endpoints } from './endpoints';

export type CategoryDto = {
  id: number;
  name: string;
  slug: string;
};

export type ProductVariant = {
  sale_price: number;
};

export type ProductImage = {
  file_path: string;
};

export type CategoryProductDto = {
  id: string;
  name: string;
  product_variants: ProductVariant[];
  product_images: ProductImage[];
};

type PaginatedCategoryProducts = {
  data: CategoryProductDto[];
  pagination: {
    page: number;
    limit: number;
    total: number | null;
    pages: number;
  };
};

export const categoryApi = {
  getCategories: () => api.get<CategoryDto[]>(endpoints.categories.root, { auth: false }),
  getCategoryProducts: (categoryId: string) =>
    api.get<PaginatedCategoryProducts>(`https://e-commerce-system-aq0y.onrender.com/api/v1/products/category?category=${categoryId}`, { auth: false }),
};