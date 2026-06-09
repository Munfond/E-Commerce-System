import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { categoryApi } from '../../api/categoryApi';
import { resolveImageUrl } from '../../api/imageUrl';
import { CATEGORY_IMAGE_BASE_URL } from '../../api/config';
import { toast } from 'sonner';

type FormState = {
  name: string;
  parent_id?: number | null;
  image: File | null;
};

export default function AdminCategoryForm() {
  const navigate = useNavigate();
  const params = useParams();
  const isEdit = Boolean(params.id);

  const [form, setForm] = useState<FormState>({ name: '', parent_id: null, image: null });
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (form.image) {
      const nextPreview = URL.createObjectURL(form.image);
      setPreviewUrl(nextPreview);

      return () => URL.revokeObjectURL(nextPreview);
    }

    setPreviewUrl(null);
    return undefined;
  }, [form.image]);

  useEffect(() => {
    if (isEdit && params.id) {
      void (async () => {
        try {
          const res = await categoryApi.getCategory(params.id);
          setForm({
            name: res.data.name,
            parent_id: res.data.parent_id ?? null,
            image: null,
          });
          setCurrentImageUrl(resolveImageUrl(res.data.image_url ?? null, CATEGORY_IMAGE_BASE_URL));
        } catch (err) {
          // ignore
        }
      })();
    }
  }, [isEdit, params.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEdit && !form.image) {
      toast.error('Vui lòng chọn ảnh danh mục');
      return;
    }

    setLoading(true);
    try {
      if (isEdit && params.id) {
        await categoryApi.updateCategory(params.id, {
          name: form.name,
          parent_id: form.parent_id,
          image: form.image ?? undefined,
        });
        toast.success('Cập nhật danh mục thành công');
      } else {
        await categoryApi.createCategory({
          name: form.name,
          parent_id: form.parent_id,
          image: form.image as File,
        });
        toast.success('Thêm danh mục thành công');
      }
      navigate('/admin/categories');
    } catch (err) {
      toast.error('Lỗi khi lưu danh mục');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">{isEdit ? 'Sửa danh mục' : 'Thêm danh mục'}</h2>
      <form onSubmit={handleSubmit} className="bg-white p-4 rounded shadow">
        <div className="mb-3">
          <label className="block text-sm">Tên danh mục</label>
          <input className="w-full border p-2" value={form.name} onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))} required />
        </div>
        <div className="mb-3">
          <label className="block text-sm">Ảnh danh mục</label>
          <input
            type="file"
            accept="image/*"
            className="w-full border p-2"
            onChange={(e) => setForm((s) => ({ ...s, image: e.target.files?.[0] ?? null }))}
            required={!isEdit}
          />
          {(previewUrl || currentImageUrl) ? (
            <div className="mt-2">
              <img
                src={previewUrl ?? currentImageUrl ?? ''}
                alt={form.name || 'Ảnh danh mục'}
                className="h-28 w-28 rounded-lg object-cover border"
              />
            </div>
          ) : null}
        </div>
        <div className="mb-3">
          <label className="block text-sm">Parent ID (tuỳ chọn)</label>
          <input type="number" className="w-full border p-2" value={form.parent_id ?? ''} onChange={(e) => setForm((s) => ({ ...s, parent_id: e.target.value ? Number(e.target.value) : null }))} />
        </div>
        <div className="flex gap-2">
          <button className="px-3 py-2 bg-blue-600 text-white rounded" disabled={loading}>{loading ? 'Đang lưu...' : 'Lưu'}</button>
          <button type="button" onClick={() => navigate('/admin/categories')} className="px-3 py-2 border rounded">Hủy</button>
        </div>
      </form>
    </div>
  );
}
