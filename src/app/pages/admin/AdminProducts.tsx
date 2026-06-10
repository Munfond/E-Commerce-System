import React, { useEffect, useState } from 'react';
import { getAdminProducts, type AdminProductDto } from '../../api/productApi';
import { isApiError } from '../../api/errors';
import { toast } from 'sonner';

export default function AdminProducts() {
  const [products, setProducts] = useState<AdminProductDto[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let alive = true;

    void (async () => {
      setLoading(true);
      try {
        const res = await getAdminProducts();
        if (!alive) return;
        setProducts(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        if (!alive) return;
        toast.error(isApiError(err) ? err.message : 'Không tải được danh sách sản phẩm');
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-4 gap-3">
        <h2 className="text-xl font-semibold">Quản lý Sản phẩm</h2>
        <div className="text-sm text-slate-500">
          {products.length.toLocaleString('vi-VN')} sản phẩm
        </div>
      </div>

      <div className="bg-white shadow rounded overflow-hidden">
        <table className="w-full min-w-[760px] text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-4 py-3 text-left">ID sản phẩm</th>
              <th className="px-4 py-3 text-left">Shop ID</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td className="px-4 py-6 text-slate-500" colSpan={2}>
                  Đang tải...
                </td>
              </tr>
            ) : products.length === 0 ? (
              <tr>
                <td className="px-4 py-6 text-slate-500" colSpan={2}>
                  Không có sản phẩm.
                </td>
              </tr>
            ) : (
              products.map((product) => (
                <tr key={product.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-900">{product.id}</td>
                  <td className="px-4 py-3 text-slate-700">{product.shop_id}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}