import { useState } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { createSellerVoucher } from '../api/seller/sellerApi';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';

type VoucherType = 'FIXED' | 'PERCENTAGE';

type FormState = {
  code: string;
  description: string;
  type: VoucherType;
  discount_value: string;
  min_order_value: string;
  usage_limit: string;
  per_user_limit: string;
  start_date: string;
  end_date: string;
};

function toIsoStringLocal(value: string) {
  return new Date(value).toISOString();
}

export default function SellerVoucherCreate() {
  const navigate = useNavigate();
  const [form, setForm] = useState<FormState>({
    code: '',
    description: '',
    type: 'FIXED',
    discount_value: '',
    min_order_value: '',
    usage_limit: '',
    per_user_limit: '1',
    start_date: '',
    end_date: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = (key: keyof FormState, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (
      !form.code.trim() ||
      !form.description.trim() ||
      !form.discount_value.trim() ||
      !form.min_order_value.trim() ||
      !form.usage_limit.trim() ||
      !form.per_user_limit.trim() ||
      !form.start_date ||
      !form.end_date
    ) {
      setError('Vui lòng điền đầy đủ thông tin voucher.');
      return;
    }

    const start = new Date(form.start_date);
    const end = new Date(form.end_date);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <= start) {
      setError('Thời gian kết thúc phải lớn hơn thời gian bắt đầu.');
      return;
    }

    setLoading(true);
    try {
      await createSellerVoucher({
        code: form.code.trim().toUpperCase(),
        description: form.description.trim(),
        type: form.type,
        discount_value: Number(form.discount_value),
        min_order_value: Number(form.min_order_value),
        usage_limit: Number(form.usage_limit),
        per_user_limit: Number(form.per_user_limit),
        start_date: start.toISOString(),
        end_date: end.toISOString(),
      });

      toast.success('Tạo voucher thành công');
      navigate('/seller');
    } catch (err) {
      setError('Không tạo được voucher. Vui lòng kiểm tra lại dữ liệu và thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3 pb-6">
      <div className="text-xs text-slate-500 mb-3">
        Trang chủ <span className="mx-2">›</span>
        <span className="text-slate-700">Khuyến mãi</span> <span className="mx-2">›</span>
        <span className="text-slate-700">Tạo voucher</span>
      </div>

      <div className="max-w-4xl">
        <form onSubmit={handleSubmit} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
          <div>
            <h1 className="mt-2 text-3xl font-semibold text-slate-900">Tạo voucher giảm giá</h1>
            <p className="mt-3 text-sm text-slate-600">
              Form này gửi đúng request body cho API tạo voucher của seller.
            </p>
          </div>

          {error && <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-1">
              <label className="mb-2 block text-sm font-medium text-slate-700">Mã voucher</label>
              <input
                value={form.code}
                onChange={(e) => update('code', e.target.value.toUpperCase())}
                placeholder="SAMSUNG100K"
                className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                required
              />
            </div>

            <div className="sm:col-span-1">
              <label className="mb-2 block text-sm font-medium text-slate-700">Loại voucher</label>
              <Select value={form.type} onValueChange={(value) => update('type', value as VoucherType)}>
                <SelectTrigger className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2">
                  <SelectValue placeholder="Chọn loại voucher" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FIXED">FIXED - giảm số tiền cố định</SelectItem>
                  <SelectItem value="PERCENTAGE">PERCENTAGE - giảm theo phần trăm</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="sm:col-span-2">
              <label className="mb-2 block text-sm font-medium text-slate-700">Mô tả</label>
              <textarea
                value={form.description}
                onChange={(e) => update('description', e.target.value)}
                placeholder="Mã giảm giá tri ân khách hàng mua điện thoại"
                rows={4}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Giá trị giảm</label>
              <input
                type="number"
                min="0"
                value={form.discount_value}
                onChange={(e) => update('discount_value', e.target.value)}
                placeholder="100000"
                className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Đơn tối thiểu</label>
              <input
                type="number"
                min="0"
                value={form.min_order_value}
                onChange={(e) => update('min_order_value', e.target.value)}
                placeholder="2000000"
                className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Giới hạn sử dụng</label>
              <input
                type="number"
                min="1"
                value={form.usage_limit}
                onChange={(e) => update('usage_limit', e.target.value)}
                placeholder="50"
                className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Giới hạn mỗi user</label>
              <input
                type="number"
                min="1"
                value={form.per_user_limit}
                onChange={(e) => update('per_user_limit', e.target.value)}
                placeholder="1"
                className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Ngày bắt đầu</label>
              <input
                type="datetime-local"
                value={form.start_date}
                onChange={(e) => update('start_date', e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Ngày kết thúc</label>
              <input
                type="datetime-local"
                value={form.end_date}
                onChange={(e) => update('end_date', e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                required
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate('/seller')}
              className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-700 disabled:opacity-50"
            >
              {loading ? 'Đang tạo...' : 'Tạo voucher'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}