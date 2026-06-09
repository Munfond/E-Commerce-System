import React, { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { categoryApi, type CategoryDto } from '../../api/categoryApi';
import { resolveImageUrl } from '../../api/imageUrl';
import { CATEGORY_IMAGE_BASE_URL } from '../../api/config';
import { isApiError } from '../../api/errors';
import { toast } from 'sonner';

type LocalCategory = CategoryDto;

export default function AdminCategories() {
  const [cats, setCats] = useState<LocalCategory[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    void (async () => {
      setLoading(true);
      try {
        const res = await categoryApi.getCategories();
        setCats(res.data as LocalCategory[]);
      } catch (err) {
        toast.error('Không thể tải danh mục');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm('Bạn có chắc muốn xóa danh mục này?')) return;
    try {
      await categoryApi.deleteCategory(id);
      setCats((s) => s.filter((c) => c.id !== id));
      toast.success('Đã xóa danh mục');
    } catch (err) {
      const message = isApiError(err) ? err.message : 'Xóa danh mục thất bại';
      toast.error(message);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Quản lý Danh mục</h2>
        <Link to="/admin/categories/add" className="px-3 py-2 bg-blue-600 text-white rounded">Thêm danh mục</Link>
      </div>

      <div className="bg-white shadow rounded">
        <table className="w-full table-auto">
          <thead>
            <tr className="text-left">
              <th className="p-3">ID</th>
              <th className="p-3">Ảnh</th>
              <th className="p-3">Tên</th>
              <th className="p-3">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} className="p-4">Đang tải...</td></tr>
            ) : cats.length === 0 ? (
              <tr><td colSpan={4} className="p-4">Không có danh mục</td></tr>
            ) : (
              cats.map((c) => (
                <tr key={c.id}>
                  <td className="p-3">{c.id}</td>
                  <td className="p-3">
                    {c.image_url ? (
                      <img
                        src={resolveImageUrl(c.image_url, CATEGORY_IMAGE_BASE_URL)}
                        alt={c.name}
                        className="h-12 w-12 rounded-md object-cover border border-slate-200"
                      />
                    ) : (
                      <div className="h-12 w-12 rounded-md border border-dashed border-slate-300 bg-slate-50" />
                    )}
                  </td>
                  <td className="p-3">{c.name}</td>
                  <td className="p-3">
                    <Link to={`/admin/categories/${c.id}/edit`} className="mr-2 text-blue-600">Sửa</Link>
                    <button onClick={() => handleDelete(c.id)} className="text-red-600">Xóa</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
