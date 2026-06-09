import { api } from './client';
import { endpoints } from './endpoints';

export type CategoryDto = {
  id: number;
  name: string;
  slug: string;
  parent_id?: number | null;
  image_url?: string | null;
};

export type CategoryUpsertDto = {
  name: string;
  parent_id?: number | null;
  image: File;
};

export type CategoryResponseDto = {
  success: true;
  message: string;
  data: {
    id: number;
    parent_id: number | null;
    name: string;
    image_url: string;
    slug: string;
  };
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
  getCategory: (id: string | number) => api.get<CategoryDto>(`${endpoints.categories.root}/${id}`, { auth: false }),
  createCategory: (payload: CategoryUpsertDto) => {
    const body = new FormData();
    body.append('name', payload.name);
    body.append('image', payload.image);

    if (payload.parent_id != null) {
      body.append('parent_id', String(payload.parent_id));
    }

    return api.post<CategoryResponseDto>(endpoints.categories.root, body, { auth: true });
  },
  updateCategory: (id: string | number, payload: Partial<CategoryUpsertDto>) => {
    const body = new FormData();

    if (payload.name != null) body.append('name', payload.name);
    if (payload.image) body.append('image', payload.image);
    if (payload.parent_id != null) body.append('parent_id', String(payload.parent_id));

    return api.put<CategoryResponseDto>(`${endpoints.categories.root}/${id}`, body, { auth: true });
  },
  deleteCategory: (id: string | number) => api.del(`${endpoints.categories.root}/${id}`, { auth: true }),
};