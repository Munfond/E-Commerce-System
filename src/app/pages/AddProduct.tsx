import React, { useState } from 'react';
import { useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Check, ChevronDown, Upload, X } from 'lucide-react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { categoryApi, type CategoryDto } from '../api/categoryApi';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';

export default function AddProduct() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    price: '',
    stock: '',
    description: '',
    categoryId: '',
    brand: '',
  });
  const [images, setImages] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setImages(prev => [...prev, ...files].slice(0, 8)); // Max 8 images
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));

    setIsLoading(false);
    toast.success('Sản phẩm đã được thêm thành công!');
    // Navigate back to products list
    navigate('/seller/products');
  };

  return (
    <div className="space-y-3">
      <div className="text-xs text-slate-500 mb-3">
        Trang chủ <span className="mx-2">›</span>
        <span className="text-slate-700">Sản phẩm</span> <span className="mx-2">›</span>
        <span className="text-slate-700">Thêm sản phẩm mới</span>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-3">
          <button
            onClick={() => navigate('/seller/products')}
            className="size-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-600"
          >
            <ArrowLeft className="size-4" />
          </button>
          <div className="text-lg font-semibold text-slate-900">Thêm sản phẩm mới</div>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-6">
          {/* Product Images */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-3">
              Hình ảnh sản phẩm <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-4 gap-3">
              {images.map((image, index) => (
                <div key={index} className="relative aspect-square bg-slate-50 border border-slate-200 rounded-lg overflow-hidden">
                  <img
                    src={URL.createObjectURL(image)}
                    alt={`Product ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 size-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                  >
                    <X className="size-3" />
                  </button>
                </div>
              ))}
              {images.length < 8 && (
                <label className="aspect-square bg-slate-50 border-2 border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-slate-400 transition-colors">
                  <Upload className="size-6 text-slate-400 mb-2" />
                  <span className="text-xs text-slate-500">Thêm ảnh</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-2">Tối đa 8 ảnh. Ảnh đầu tiên sẽ là ảnh đại diện.</p>
          </div>

          {/* Product Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-2">
              Tên sản phẩm <span className="text-red-500">*</span>
            </label>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Nhập tên sản phẩm"
              required
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
            />
          </div>

          {/* SKU */}
          <div>
            <label htmlFor="sku" className="block text-sm font-medium text-slate-700 mb-2">
              Mã SKU <span className="text-red-500">*</span>
            </label>
            <input
              id="sku"
              name="sku"
              type="text"
              value={formData.sku}
              onChange={handleInputChange}
              placeholder="Nhập mã SKU"
              required
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
            />
          </div>

          {/* Price and Stock */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-slate-700 mb-2">
                Giá bán (VNĐ) <span className="text-red-500">*</span>
              </label>
              <input
                id="price"
                name="price"
                type="number"
                value={formData.price}
                onChange={handleInputChange}
                placeholder="0"
                min="0"
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label htmlFor="stock" className="block text-sm font-medium text-slate-700 mb-2">
                Tồn kho <span className="text-red-500">*</span>
              </label>
              <input
                id="stock"
                name="stock"
                type="number"
                value={formData.stock}
                onChange={handleInputChange}
                placeholder="0"
                min="0"
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
              />
            </div>
          </div>

          {/* Category and Brand */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="categoryId" className="block text-sm font-medium text-slate-700 mb-2">
                Danh mục sản phẩm <span className="text-red-500">*</span>
              </label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none bg-white flex items-center justify-between gap-3"
                    aria-haspopup="listbox"
                    aria-label="Chọn danh mục sản phẩm"
                  >
                    <span className={formData.categoryId ? 'text-slate-900' : 'text-slate-400'}>
                      {categoriesLoading
                        ? 'Đang tải danh mục...'
                        : formData.categoryId
                          ? categories.find((category) => String(category.id) === formData.categoryId)?.name ?? 'Chọn 1 danh mục'
                          : 'Chọn 1 danh mục'}
                    </span>
                    <ChevronDown className="size-4 text-slate-500" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width] max-h-72 overflow-y-auto p-1 rounded-lg border border-slate-200 shadow-lg">
                  <DropdownMenuRadioGroup
                    value={formData.categoryId}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, categoryId: value }))}
                  >
                    {categories.length === 0 ? (
                      <div className="px-3 py-2 text-sm text-slate-500">Không có danh mục nào</div>
                    ) : (
                      categories.map((category) => (
                        <DropdownMenuRadioItem
                          key={category.id}
                          value={String(category.id)}
                          className="flex items-center justify-between gap-2 rounded-md px-3 py-2 text-sm"
                        >
                          <span>{category.name}</span>
                          {formData.categoryId === String(category.id) ? <Check className="size-4 text-orange-600" /> : null}
                        </DropdownMenuRadioItem>
                      ))
                    )}
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
              <p className="mt-2 text-xs text-slate-500">
                Seller chỉ được chọn 1 danh mục có sẵn trên web, không nhập thủ công.
              </p>
            </div>
            <div>
              <label htmlFor="brand" className="block text-sm font-medium text-slate-700 mb-2">
                Thương hiệu
              </label>
              <input
                id="brand"
                name="brand"
                type="text"
                value={formData.brand}
                onChange={handleInputChange}
                placeholder="Nhập thương hiệu"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-2">
              Mô tả sản phẩm
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Nhập mô tả chi tiết về sản phẩm"
              rows={4}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none resize-none"
            />
          </div>

          {/* Submit Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => navigate('/seller/products')}
              className="px-4 py-2 text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Đang lưu...' : 'Lưu sản phẩm'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}