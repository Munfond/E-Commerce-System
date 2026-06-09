import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { Plus } from 'lucide-react';
import { Link, useNavigate } from 'react-router';
import { categoryApi, type CategoryDto } from '../api/categoryApi';
import { IMAGE_BASE_URL } from '../api/config';
import { createSellerShopProduct, listSellerProducts, listSellerShopProducts } from '../api/seller/sellerApi';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import type { SellerShopProduct } from '../types/models/seller';

const tabs = [
  { id: 'all', label: 'Tất cả' },
] as const;

type TabId = (typeof tabs)[number]['id'];

function constructImageUrl(filePath?: string) {
  if (!filePath) return 'https://via.placeholder.com/80?text=Sản+phẩm';
  if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
    return filePath;
  }
  return `${IMAGE_BASE_URL}${filePath}`;
}

export default function SellerDashboard() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<TabId>('all');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [items, setItems] = useState<SellerShopProduct[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [createOpen, setCreateOpen] = useState(false);
  const [createName, setCreateName] = useState('');
  const [createDescription, setCreateDescription] = useState('');
  const [createBrand, setCreateBrand] = useState('');
  const [createCategoryId, setCreateCategoryId] = useState('');
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [createVariants, setCreateVariants] = useState([
    { name: 'Default', input_price: 0, sale_price: 0, stock: 0 },
  ]);
  const [createVariantFiles, setCreateVariantFiles] = useState<File[][]>([[]]);
  const [createVariantImagePreviews, setCreateVariantImagePreviews] = useState<string[][]>([[]]);
  const [createProductImages, setCreateProductImages] = useState<File[]>([]);
  const [createImagePreviews, setCreateImagePreviews] = useState<string[]>([]);
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    setPage(1);
  }, [tab]);

  useEffect(() => {
    const previews = createProductImages.map((file) => URL.createObjectURL(file));
    setCreateImagePreviews(previews);

    return () => {
      previews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [createProductImages]);

  useEffect(() => {
    const nextPreviews = createVariantFiles.map((files) => files.map((file) => URL.createObjectURL(file)));
    setCreateVariantImagePreviews(nextPreviews);

    return () => {
      nextPreviews.flat().forEach((url) => URL.revokeObjectURL(url));
    };
  }, [createVariantFiles]);

  useEffect(() => {
    let alive = true;
    setCategoriesLoading(true);

    categoryApi
      .getCategories()
      .then((response) => {
        if (!alive) return;
        setCategories(Array.isArray(response.data) ? response.data : []);
      })
      .catch(() => {
        if (!alive) return;
        setCategories([]);
      })
      .finally(() => {
        if (!alive) return;
        setCategoriesLoading(false);
      });

    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError(null);
    (async () => {
      try {
        const res = await listSellerShopProducts({
          status: tab,
          page,
          pageSize,
        });
        if (!alive) return;
        setItems(
          res.data.products.map((product) => ({
            id: product.id,
            name: product.name,
            description: product.description ?? '',
            brand: product.brand ?? 'Không xác định',
            soldCount: product.sold_count ?? 0,
            categoryId: product.category_id,
            imageUrl: constructImageUrl(product.product_images?.[0]?.file_path),
          }))
        );
        setTotal(res.data.total);
      } catch {
        if (!alive) return;
        setError('Không tải được danh sách sản phẩm.');
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [tab, page, pageSize, refreshKey]);


  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / pageSize)), [total, pageSize]);

  return (
    <div className="space-y-3">
      <div className="text-xs text-slate-500 mb-3">
        <Link to="/" className="hover:text-orange-600">Trang chủ</Link>
        <span className="mx-2">›</span>
        <span className="text-slate-700">Sản phẩm</span>
        <div className="px-5 pt-4">
          <div className="flex flex-wrap items-center gap-3 border-b border-slate-100">
            {tabs.map((t) => {
              const active = tab === t.id;
              const badge = total;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTab(t.id)}
                  className={[
                    'relative -mb-px px-1 py-3 text-sm font-medium transition-colors',
                    active ? 'text-orange-700' : 'text-slate-600 hover:text-slate-900',
                  ].join(' ')}
                >
                  <span className="inline-flex items-center gap-2">
                    {t.label}
                    <span
                      className={[
                        'text-xs px-2 h-5 rounded-full inline-flex items-center justify-center border',
                        active ? 'bg-orange-50 text-orange-700 border-orange-200' : 'bg-slate-50 text-slate-600 border-slate-200',
                      ].join(' ')}
                    >
                      {total.toLocaleString('vi-VN')}
                    </span>
                  </span>
                  {active && <div className="absolute left-0 right-0 bottom-0 h-0.5 bg-orange-600" />}
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 py-4">
            <div className="lg:col-span-10" />
            <div className="lg:col-span-2 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setCreateOpen(true)}
                className="inline-flex h-10 items-center gap-2 rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-700"
              >
                <Plus className="h-4 w-4" />
                Tạo sản phẩm mới
              </button>
            </div>
          </div>
        </div>

        <div className="px-5 pb-4">
          {error && (
            <div className="mb-3 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          )}
          <div className="flex items-center justify-between gap-3 py-2">
            <div className="text-sm text-slate-700">
              <span className="font-semibold">{total.toLocaleString('vi-VN')}</span> Sản phẩm
            </div>
            <div className="text-xs text-orange-700 bg-orange-50 border border-orange-200 rounded-full px-3 py-1">
              Hạn mức đăng bán: 100
            </div>
          </div>

          <div className="overflow-auto border border-slate-200 rounded-xl">
            <table className="min-w-[860px] w-full text-sm">
              <thead className="bg-slate-50">
                <tr className="text-left text-slate-600">
                  <th className="w-10 px-4 py-3">
                    <input type="checkbox" className="size-4" />
                  </th>
                  <th className="px-4 py-3">Sản phẩm</th>
                  <th className="px-4 py-3 w-32">Danh mục</th>
                  <th className="px-4 py-3 w-32">Thương hiệu</th>
                  <th className="px-4 py-3 w-28">Doanh số</th>
                  <th className="px-4 py-3 w-32">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td className="px-4 py-6 text-slate-500" colSpan={6}>
                      Đang tải...
                    </td>
                  </tr>
                ) : items.length === 0 ? (
                  <tr>
                    <td className="px-4 py-6 text-slate-500" colSpan={6}>
                      Không có sản phẩm.
                    </td>
                  </tr>
                ) : (
                  items.map((p) => (
                    <tr key={p.id ?? p.name} className="hover:bg-slate-50">
                      <td className="px-4 py-4">
                        <input type="checkbox" className="size-4" />
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-start gap-3">
                          <img
                            src={constructImageUrl(p.imageUrl)}
                            alt={p.name}
                            className="h-14 w-14 rounded-lg object-cover"
                          />
                          <div className="min-w-0">
                            <div className="font-semibold text-slate-900 truncate">{p.name}</div>
                            <div className="text-xs text-slate-500 mt-1">ID: {p.id ?? 'N/A'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-slate-800">{p.categoryId ?? 'N/A'}</td>
                      <td className="px-4 py-4 text-slate-800">{p.brand}</td>
                      <td className="px-4 py-4 text-slate-800">{p.soldCount.toLocaleString('vi-VN')}</td>
                      <td className="px-4 py-4">
                        <div className="flex flex-col gap-2 text-xs">
                          <button
                            type="button"
                            onClick={() => {
                              const id = p.id ? String(p.id) : '';
                              if (!id) return;
                              navigate(`/seller/products/${id}`);
                            }}
                            className="text-slate-600 hover:text-slate-800 font-semibold text-left"
                          >
                            Chi tiết
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="text-xs text-slate-500 mt-3">
            Đây là UI demo theo format bạn gửi. Khi nối API, mình sẽ map dữ liệu thật vào bảng và bộ lọc.
          </div>



          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogContent className="max-w-lg p-6">
              <DialogHeader>
                <DialogTitle>Tạo sản phẩm mới</DialogTitle>
              </DialogHeader>

              <div className="mt-4 space-y-3">
                {createError && <div className="text-rose-700">{createError}</div>}
                <div>
                  <label className="text-sm text-slate-700">Tên sản phẩm</label>
                  <input
                    value={createName}
                    onChange={(e) => setCreateName(e.target.value)}
                    className="w-full mt-1 p-2 border rounded-lg"
                    placeholder="Tên sản phẩm"
                  />
                </div>
                <div>
                  <label className="text-sm text-slate-700">Mô tả</label>
                  <textarea
                    value={createDescription}
                    onChange={(e) => setCreateDescription(e.target.value)}
                    className="w-full mt-1 p-2 border rounded-lg"
                    placeholder="Mô tả sản phẩm"
                    rows={4}
                  />
                </div>
                <div>
                  <label className="text-sm text-slate-700">Thương hiệu</label>
                  <input
                    value={createBrand}
                    onChange={(e) => setCreateBrand(e.target.value)}
                    className="w-full mt-1 p-2 border rounded-lg"
                    placeholder="Ví dụ: Macbook"
                  />
                </div>
                <div>
                  <label className="text-sm text-slate-700">Danh mục</label>
                  <Select value={createCategoryId} onValueChange={setCreateCategoryId}>
                    <SelectTrigger className="w-full mt-1 p-2 border rounded-lg bg-white">
                      <SelectValue placeholder={categoriesLoading ? 'Đang tải danh mục...' : 'Chọn 1 danh mục'} />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.length === 0 ? (
                        <div className="px-2 py-2 text-sm text-slate-500">Không có danh mục nào</div>
                      ) : (
                        categories.map((category) => (
                          <SelectItem key={category.id} value={String(category.id)}>
                            {category.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <p className="mt-2 text-xs text-slate-500">Seller chỉ được chọn 1 danh mục có sẵn trên web.</p>
                </div>
                <div className="rounded-lg border border-slate-200 p-3">
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-sm font-semibold text-slate-800">Thông tin variants</div>
                    <button
                      type="button"
                      onClick={() => {
                        setCreateVariants((prev) => [...prev, { name: 'Variant mới', input_price: 0, sale_price: 0, stock: 0 }]);
                        setCreateVariantFiles((prev) => [...prev, []]);
                      }}
                      className="rounded-full border border-slate-300 bg-white px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      Thêm variant
                    </button>
                  </div>
                  <div className="space-y-3">
                    {createVariants.map((variant, index) => (
                      <div key={index} className="grid gap-3 sm:grid-cols-5 items-end">
                        <div className="sm:col-span-2">
                          <label className="text-sm text-slate-700">Tên variant</label>
                          <input
                            value={variant.name}
                            onChange={(e) =>
                              setCreateVariants((prev) =>
                                prev.map((item, itemIndex) =>
                                  itemIndex === index ? { ...item, name: e.target.value } : item
                                )
                              )
                            }
                            className="w-full mt-1 p-2 border rounded-lg"
                            placeholder="Silver"
                          />
                        </div>
                        <div>
                          <label className="text-sm text-slate-700">Giá nhập</label>
                          <input
                            type="number"
                            value={variant.input_price}
                            onChange={(e) =>
                              setCreateVariants((prev) =>
                                prev.map((item, itemIndex) =>
                                  itemIndex === index
                                    ? { ...item, input_price: Number(e.target.value) }
                                    : item
                                )
                              )
                            }
                            className="w-full mt-1 p-2 border rounded-lg"
                            placeholder="24890000"
                          />
                        </div>
                        <div>
                          <label className="text-sm text-slate-700">Giá bán</label>
                          <input
                            type="number"
                            value={variant.sale_price}
                            onChange={(e) =>
                              setCreateVariants((prev) =>
                                prev.map((item, itemIndex) =>
                                  itemIndex === index
                                    ? { ...item, sale_price: Number(e.target.value) }
                                    : item
                                )
                              )
                            }
                            className="w-full mt-1 p-2 border rounded-lg"
                            placeholder="24990000"
                          />
                        </div>
                        <div>
                          <label className="text-sm text-slate-700">Số lượng</label>
                          <input
                            type="number"
                            value={variant.stock}
                            onChange={(e) =>
                              setCreateVariants((prev) =>
                                prev.map((item, itemIndex) =>
                                  itemIndex === index
                                    ? { ...item, stock: Number(e.target.value) }
                                    : item
                                )
                              )
                            }
                            className="w-full mt-1 p-2 border rounded-lg"
                            placeholder="50"
                          />
                        </div>
                        <div className="sm:col-span-5 rounded-lg border border-slate-200 bg-slate-50 p-3">
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <label className="text-sm font-medium text-slate-700">Ảnh variant</label>
                              <p className="text-xs text-slate-500">Có thể chọn nhiều ảnh cho variant này</p>
                            </div>
                            <input
                              type="file"
                              accept="image/*"
                              multiple
                              onChange={(e) => {
                                const files = Array.from(e.target.files ?? []).slice(0, 5);
                                setCreateVariantFiles((prev) =>
                                  prev.map((item, itemIndex) => (itemIndex === index ? files : item))
                                );
                              }}
                              className="w-full max-w-xs text-sm text-slate-700"
                            />
                          </div>
                          {createVariantImagePreviews[index]?.length > 0 && (
                            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                              {createVariantImagePreviews[index].map((preview, previewIndex) => (
                                <div key={`${preview}-${previewIndex}`} className="rounded-lg border border-slate-200 overflow-hidden bg-white">
                                  <img src={preview} alt={`Variant ${index + 1} preview ${previewIndex + 1}`} className="h-24 w-full object-cover" />
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            {
                              setCreateVariants((prev) => prev.filter((_, itemIndex) => itemIndex !== index));
                              setCreateVariantFiles((prev) => prev.filter((_, itemIndex) => itemIndex !== index));
                            }
                          }
                          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                        >
                          Xóa
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="rounded-lg border border-slate-200 p-3">
                  <div className="text-sm font-semibold text-slate-800 mb-2">Ảnh sản phẩm</div>
                  <label className="block text-sm text-slate-600 mb-2">Upload tối đa 5 ảnh</label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => {
                      const files = Array.from(e.target.files ?? []).slice(0, 5);
                      setCreateProductImages(files);
                    }}
                    className="w-full text-sm text-slate-700"
                  />
                  {createImagePreviews.length > 0 && (
                    <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                      {createImagePreviews.map((preview, index) => (
                        <div key={preview} className="rounded-lg border border-slate-200 overflow-hidden">
                          <img src={preview} alt={`Preview ${index + 1}`} className="h-24 w-full object-cover" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <DialogFooter>
                <DialogClose asChild>
                  <button className="rounded-lg bg-slate-200 px-4 py-2 text-sm font-semibold">Hủy</button>
                </DialogClose>
                <button
                  type="button"
                  disabled={createLoading}
                  onClick={async () => {
                    if (!createName.trim() || !createDescription.trim() || !createBrand.trim() || !createCategoryId.trim()) {
                      setCreateError('Vui lòng điền đủ tên, mô tả, thương hiệu và chọn danh mục.');
                      return;
                    }
                    if (createVariants.some((variant) => !variant.name.trim())) {
                      setCreateError('Tên variant không được để trống.');
                      return;
                    }
                    if (createVariants.some((variant) => variant.input_price <= 0 || variant.sale_price <= 0 || variant.stock < 0)) {
                      setCreateError('Vui lòng nhập thông tin variant hợp lệ.');
                      return;
                    }
                    setCreateLoading(true);
                    setCreateError(null);
                    try {
                      await createSellerShopProduct({
                        productData: {
                          name: createName,
                          description: createDescription,
                          category_id: Number(createCategoryId),
                          brand: createBrand,
                        },
                        variants: createVariants,
                        variant_files: createVariantFiles,
                        product_images: createProductImages.length > 0 ? createProductImages : undefined,
                      });
                      setCreateOpen(false);
                      setCreateName('');
                      setCreateDescription('');
                      setCreateBrand('');
                      setCreateCategoryId('');
                      setCreateVariants([{ name: 'Default', input_price: 0, sale_price: 0, stock: 0 }]);
                      setCreateVariantFiles([[]]);
                      setCreateProductImages([]);
                      setCreateImagePreviews([]);
                      setCreateVariantImagePreviews([[]]);
                      setRefreshKey((current) => current + 1);
                      setPage(1);
                    } catch (e: any) {
                      const msg = e?.message ?? (e?.toString && e.toString()) ?? 'Tạo sản phẩm thất bại';
                      setCreateError(String(msg));
                    } finally {
                      setCreateLoading(false);
                    }
                  }}
                  className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-700 disabled:opacity-50"
                >
                  {createLoading ? 'Đang tạo...' : 'Tạo sản phẩm'}
                </button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <div className="mt-3 flex items-center justify-between text-sm text-slate-600">
            <div className="hidden md:block">
              Trang <span className="font-semibold text-slate-900">{page}</span>/{totalPages}
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="h-9 px-3 rounded-lg border border-slate-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
              >
                Trước
              </button>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="h-9 px-3 rounded-lg border border-slate-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
              >
                Sau
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
