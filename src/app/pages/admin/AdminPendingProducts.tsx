import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router';
import { getAdminProducts, type AdminProductDto } from '../../api/productApi';
import { isApiError } from '../../api/errors';
import { toast } from 'sonner';

export default function AdminPendingProducts() {
  const { id } = useParams();
  const [products, setProducts] = useState<AdminProductDto[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let alive = true;

    void (async () => {
      setLoading(true);
      try {
        const res = await getAdminProducts(id);
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
  }, [id]);

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Sản phẩm chờ</h2>
      <div className="bg-white shadow rounded overflow-hidden">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-4 py-3 text-left">Product ID</th>
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
                  <td className="px-4 py-3 font-medium text-slate-900">
                    <Link to={`/admin/products/${product.id}`} className="text-blue-600 hover:underline">
                      {product.id}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    <Link to={`/shops/${product.shop_id}`} className="text-slate-700 hover:text-slate-900 hover:underline">
                      {product.shop_id}
                    </Link>
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
