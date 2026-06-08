import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Link, useParams } from 'react-router';
import { ChevronLeft, Loader2, Plus, Upload, X, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '../api/client';
import { IMAGE_BASE_URL } from '../api/config';
import { createSellerShopProductVariants, deleteSellerShopProductVariant, updateSellerShopProduct } from '../api/seller/sellerApi';

interface ProductVariant {
  id: string;
  sku: string;
  name: string;
  stock: number;
  file_path: string;
  product_id: string;
  sale_price: number;
  input_price: number;
}

interface ProductImage {
  id: string;
  file_path: string;
  product_id: string;
  display_order: number;
}

interface ProductDetailData {
  id: string;
  shop_id: string;
  category_id: number;
  name: string;
  description: string;
  brand: string;
  sold_count: number;
  slug: string;
  created_at: string;
  updated_at: string;
  status: string;
  product_variants: ProductVariant[];
  product_images: ProductImage[];
}

interface ApiResponse {
  success: boolean;
  data: ProductDetailData;
}

const constructImageUrl = (filePath: string): string => {
  if (!filePath) return '';
  if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
    return filePath;
  }
  return `${IMAGE_BASE_URL}${filePath}`;
};

export default function SellerProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState<ProductDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeImage, setActiveImage] = useState<string>('');
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [variantRows, setVariantRows] = useState(
    [{ name: '', input_price: 0, sale_price: 0, stock: 0, file: null as File | null }]
  );
  const [variantLoading, setVariantLoading] = useState(false);
  const [variantError, setVariantError] = useState<string | null>(null);
  const [deletingVariantId, setDeletingVariantId] = useState<string | null>(null);

  const loadProduct = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);

    try {
      const res = await api.get<ApiResponse>(`https://e-commerce-system-aq0y.onrender.com/api/v2/products/${id}`);
      if (!res.data?.success || !res.data.data) {
        throw new Error('Không lấy được dữ liệu sản phẩm.');
      }

      const productData = res.data.data;
      setProduct(productData);
      setEditName(productData.name ?? '');
      setEditDescription(productData.description ?? '');

      const defaultImage =
        productData.product_variants.find((v) => Boolean(v.file_path))?.file_path ||
        productData.product_images?.[0]?.file_path ||
        '';

      setActiveImage(defaultImage ? constructImageUrl(defaultImage) : '');
    } catch (err) {
      console.error('Seller product detail error:', err);
      setError('Không thể tải thông tin sản phẩm.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProduct();
  }, [id]);

  const handleUpdateProduct = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!id) return;

    setEditLoading(true);
    setEditError(null);

    try {
      await updateSellerShopProduct(id, {
        name: editName.trim(),
        description: editDescription.trim(),
      });
      toast.success('Cập nhật sản phẩm thành công');
      await loadProduct();
    } catch (err) {
      console.error('Update product error:', err);
      setEditError('Cập nhật sản phẩm thất bại. Vui lòng kiểm tra lại.');
    } finally {
      setEditLoading(false);
    }
  };

  const handleAddVariantRow = () => {
    setVariantRows((prev) => [...prev, { name: '', input_price: 0, sale_price: 0, stock: 0, file: null }]);
  };

  const handleRemoveVariantRow = (index: number) => {
    setVariantRows((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleVariantRowChange = (index: number, field: keyof typeof variantRows[number], value: string | number | File | null) => {
    setVariantRows((prev) =>
      prev.map((row, idx) =>
        idx !== index
          ? row
          : {
              ...row,
              [field]: field === 'file' ? value as File | null : value,
            }
      )
    );
  };

  const handleCreateVariants = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!id) return;

    setVariantLoading(true);
    setVariantError(null);

    const variantsPayload = variantRows.map((row) => ({
      name: row.name,
      input_price: row.input_price,
      sale_price: row.sale_price,
      stock: row.stock,
    }));

    const variantFiles = variantRows.map((row) => row.file).filter(Boolean) as File[];

    try {
      await createSellerShopProductVariants(id, {
        variants: variantsPayload,
        ...(variantFiles.length > 0 ? { variant_files: variantFiles } : {}),
      });
      toast.success('Thêm variant thành công');
      setVariantRows([{ name: '', input_price: 0, sale_price: 0, stock: 0, file: null }]);
      await loadProduct();
    } catch (err) {
      console.error('Create variants error:', err);
      setVariantError('Thêm variant thất bại. Vui lòng thử lại.');
    } finally {
      setVariantLoading(false);
    }
  };

  const handleDeleteVariant = async (variantId: string) => {
    if (!id) return;
    if (!window.confirm('Bạn có chắc muốn xóa biến thể này không?')) return;

    setDeletingVariantId(variantId);
    try {
      await deleteSellerShopProductVariant(variantId);
      toast.success('Đã xóa biến thể thành công');
      await loadProduct();
    } catch (err) {
      console.error('Delete variant error:', err);
      toast.error('Xóa biến thể thất bại.');
    } finally {
      setDeletingVariantId(null);
    }
  };

  const galleryImages = useMemo(() => {
    if (!product) return [];
    const images = new Set<string>();
    product.product_images?.forEach((img) => {
      if (img.file_path) images.add(constructImageUrl(img.file_path));
    });
    product.product_variants?.forEach((variant) => {
      if (variant.file_path) images.add(constructImageUrl(variant.file_path));
    });
    return Array.from(images);
  }, [product]);

  if (loading) {
    return (
      <div className="rounded-xl bg-white border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center gap-3 text-slate-700">
          <Loader2 className="animate-spin" />
          <span>Đang tải chi tiết sản phẩm...</span>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="rounded-xl bg-white border border-slate-200 p-6 shadow-sm">
        <div className="text-rose-700 font-semibold mb-3">{error ?? 'Sản phẩm không tồn tại.'}</div>
        <Link to="/seller/products" className="inline-flex items-center gap-2 rounded-lg bg-orange-600 px-4 py-2 text-white hover:bg-orange-700">
          <ChevronLeft className="size-4" /> Trở về danh sách
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-sm uppercase tracking-[0.2em] text-slate-500">Chi tiết sản phẩm</div>
          <h1 className="text-2xl font-semibold text-slate-900">{product.name}</h1>
          <div className="mt-2 text-sm text-slate-600">Mã sản phẩm: {product.id}</div>
        </div>
        <Link to="/seller/products" className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
          <ChevronLeft className="size-4" /> Quay lại sản phẩm
        </Link>
      </div>

      <div className="grid gap-4 lg:grid-cols-[360px_minmax(0,1fr)]">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="aspect-square overflow-hidden rounded-xl bg-slate-100">
            {activeImage ? (
              <img src={activeImage} alt={product.name} className="h-full w-full object-contain" />
            ) : (
              <div className="flex h-full items-center justify-center text-slate-500">Không có ảnh</div>
            )}
          </div>

          {galleryImages.length > 0 && (
            <div className="mt-4 grid grid-cols-4 gap-2">
              {galleryImages.map((imgUrl) => (
                <button
                  key={imgUrl}
                  type="button"
                  onClick={() => setActiveImage(imgUrl)}
                  className="overflow-hidden rounded-lg border border-slate-200"
                >
                  <img src={imgUrl} alt="Ảnh sản phẩm" className="h-20 w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="grid grid-cols-2 gap-4 text-sm text-slate-600">
              <div>
                <div className="font-semibold text-slate-900">Shop ID</div>
                <div>{product.shop_id}</div>
              </div>
              <div>
                <div className="font-semibold text-slate-900">Danh mục</div>
                <div>{product.category_id}</div>
              </div>
              <div>
                <div className="font-semibold text-slate-900">Thương hiệu</div>
                <div>{product.brand}</div>
              </div>
              <div>
                <div className="font-semibold text-slate-900">Trạng thái</div>
                <div>{product.status}</div>
              </div>
              <div>
                <div className="font-semibold text-slate-900">Đã bán</div>
                <div>{product.sold_count.toLocaleString('vi-VN')}</div>
              </div>
              <div>
                <div className="font-semibold text-slate-900">Cập nhật</div>
                <div>{new Date(product.updated_at).toLocaleString('vi-VN')}</div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="text-lg font-semibold text-slate-900 mb-3">Mô tả</div>
            {product.description ? (
              <div className="prose prose-slate max-w-none" dangerouslySetInnerHTML={{ __html: product.description }} />
            ) : (
              <div className="text-sm text-slate-500">Chưa có mô tả sản phẩm.</div>
            )}
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-4">
              <div>
                <div className="text-lg font-semibold text-slate-900">Cập nhật sản phẩm</div>
                <div className="text-sm text-slate-500">Chỉnh sửa tên và mô tả sản phẩm.</div>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">ID: {product.id}</span>
            </div>

            <form onSubmit={handleUpdateProduct} className="space-y-4">
              {editError && <div className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{editError}</div>}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Tên sản phẩm</label>
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                  placeholder="Nhập tên sản phẩm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Mô tả</label>
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  rows={4}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 resize-none"
                  placeholder="Nhập mô tả sản phẩm"
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={editLoading}
                  className="inline-flex items-center gap-2 rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {editLoading ? 'Đang lưu...' : 'Lưu cập nhật'}
                </button>
              </div>
            </form>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-4">
              <div>
                <div className="text-lg font-semibold text-slate-900">Thêm variant mới</div>
                <div className="text-sm text-slate-500">Tạo variant mới cho sản phẩm này.</div>
              </div>
              <button
                type="button"
                onClick={handleAddVariantRow}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                <Plus className="size-4" /> Thêm dòng variant
              </button>
            </div>

            <form onSubmit={handleCreateVariants} className="space-y-4">
              {variantError && <div className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{variantError}</div>}
              <div className="space-y-4">
                {variantRows.map((row, index) => (
                  <div key={`variant-${index}`} className="rounded-xl border border-slate-200 p-4">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                      <div className="flex-1 space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">Tên variant</label>
                          <input
                            value={row.name}
                            onChange={(e) => handleVariantRowChange(index, 'name', e.target.value)}
                            className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                            placeholder="Tên variant"
                          />
                        </div>
                        <div className="grid gap-4 sm:grid-cols-3">
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Giá nhập</label>
                            <input
                              type="number"
                              value={row.input_price}
                              onChange={(e) => handleVariantRowChange(index, 'input_price', Number(e.target.value))}
                              className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Giá bán</label>
                            <input
                              type="number"
                              value={row.sale_price}
                              onChange={(e) => handleVariantRowChange(index, 'sale_price', Number(e.target.value))}
                              className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Tồn kho</label>
                            <input
                              type="number"
                              value={row.stock}
                              onChange={(e) => handleVariantRowChange(index, 'stock', Number(e.target.value))}
                              className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="sm:w-60">
                        <label className="block text-sm font-medium text-slate-700 mb-2">Ảnh variant</label>
                        <label className="flex h-14 items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 text-slate-500 hover:border-slate-400 hover:bg-slate-100 cursor-pointer">
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0] ?? null;
                              handleVariantRowChange(index, 'file', file);
                            }}
                          />
                          <span>{row.file ? row.file.name : 'Chọn ảnh'}</span>
                        </label>
                        {row.file && (
                          <div className="mt-3 flex items-center justify-between gap-2 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600">
                            <span className="truncate">{row.file.name}</span>
                            <button
                              type="button"
                              onClick={() => handleVariantRowChange(index, 'file', null)}
                              className="text-slate-500 hover:text-slate-700"
                            >
                              <X className="size-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex justify-end">
                      {variantRows.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveVariantRow(index)}
                          className="rounded-lg bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700 hover:bg-rose-100"
                        >
                          Xóa dòng
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={variantLoading}
                  className="inline-flex items-center gap-2 rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {variantLoading ? 'Đang thêm...' : 'Lưu variant'}
                </button>
              </div>
            </form>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="text-lg font-semibold text-slate-900 mb-3">Variants</div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm text-slate-700">
                <thead className="bg-slate-50 text-slate-600 text-xs uppercase tracking-[0.15em]">
                  <tr>
                    <th className="px-3 py-3">Ảnh</th>
                    <th className="px-3 py-3">Tên</th>
                    <th className="px-3 py-3">SKU</th>
                    <th className="px-3 py-3">Tồn kho</th>
                    <th className="px-3 py-3">Giá bán</th>
                    <th className="px-3 py-3">Giá nhập</th>
                    <th className="px-3 py-3">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {product.product_variants.map((variant) => {
                    const variantImage = variant.file_path ? constructImageUrl(variant.file_path) : '';
                    return (
                      <tr key={variant.id}>
                        <td className="px-3 py-3">
                          <div className="h-16 w-16 overflow-hidden rounded-lg bg-slate-100">
                            {variantImage ? (
                              <img src={variantImage} alt={variant.name} className="h-full w-full object-cover" />
                            ) : (
                              <div className="flex h-full items-center justify-center text-[11px] uppercase tracking-[0.15em] text-slate-400">
                                Không có ảnh
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-3 py-3">{variant.name}</td>
                        <td className="px-3 py-3">{variant.sku}</td>
                        <td className="px-3 py-3">{variant.stock}</td>
                        <td className="px-3 py-3">₫{variant.sale_price.toLocaleString('vi-VN')}</td>
                        <td className="px-3 py-3">₫{variant.input_price.toLocaleString('vi-VN')}</td>
                        <td className="px-3 py-3">
                          <button
                            type="button"
                            onClick={() => handleDeleteVariant(variant.id)}
                            disabled={deletingVariantId === variant.id}
                            className="inline-flex items-center gap-2 rounded-lg bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <Trash2 className="size-3" />
                            {deletingVariantId === variant.id ? 'Đang xóa...' : 'Xóa'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
