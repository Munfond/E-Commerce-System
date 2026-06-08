import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { categoryApi } from '../../api/categoryApi';
import { toast } from 'sonner';

type FormState = {
  name: string;
  description?: string;
  parent_id?: number | null;
};

export default function AdminCategoryForm() {
  const navigate = useNavigate();
  const params = useParams();
  const isEdit = Boolean(params.id);

  const [form, setForm] = useState<FormState>({ name: '', description: '', parent_id: null });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isEdit && params.id) {
      void (async () => {
        try {
          const res = await categoryApi.getCategory(params.id);
          setForm({ name: res.data.name, description: (res.data as any).description ?? '', parent_id: (res.data as any).parent_id ?? null });
        } catch (err) {
          // ignore
        }
      })();
    }
  }, [isEdit, params.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isEdit && params.id) {
        await categoryApi.updateCategory(params.id, form);
        toast.success('Cập nhật danh mục thành công');
      } else {
        await categoryApi.createCategory(form);
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
          <label className="block text-sm">Mô tả</label>
          <textarea className="w-full border p-2" value={form.description} onChange={(e) => setForm((s) => ({ ...s, description: e.target.value }))} />
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
