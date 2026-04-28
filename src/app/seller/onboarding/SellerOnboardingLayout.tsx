import { Outlet, useLocation, Link } from 'react-router';
import { motion } from 'motion/react';
import Header from '../../components/Header';

type Step = { id: string; label: string; path: string };

const steps: Step[] = [
  { id: 'shop', label: 'Thông tin Shop', path: '/seller/register/shop' },
  { id: 'shipping', label: 'Cài đặt vận chuyển', path: '/seller/register/shipping' },
  { id: 'identity', label: 'Thông tin định danh', path: '/seller/register/identity' },
  { id: 'tax', label: 'Thông tin thuế', path: '/seller/register/tax' },
  { id: 'done', label: 'Hoàn tất', path: '/seller/register/done' },
];

function stepState(stepIdx: number, activeIdx: number) {
  if (stepIdx < activeIdx) return 'done';
  if (stepIdx === activeIdx) return 'active';
  return 'todo';
}

export default function SellerOnboardingLayout() {
  const location = useLocation();
  const activeIdx = Math.max(
    0,
    steps.findIndex((s) => location.pathname.startsWith(s.path))
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm">
          <div className="px-6 py-5 border-b border-slate-100">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-lg font-semibold text-slate-900">Đăng ký trở thành Người bán</div>
                <div className="text-sm text-slate-600 mt-1">Hoàn thiện thông tin để bắt đầu bán hàng</div>
              </div>
            </div>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute left-0 right-0 top-4 h-px bg-slate-200" />
                <div className="relative grid grid-cols-5 gap-2">
                  {steps.map((s, idx) => {
                    const state = stepState(idx, activeIdx);
                    const isClickable = idx <= activeIdx;
                    return (
                      <div key={s.id} className="flex flex-col items-center text-center">
                        <div className="z-10">
                          {isClickable ? (
                            <Link
                              to={s.path}
                              className="inline-flex items-center justify-center"
                              aria-current={state === 'active' ? 'step' : undefined}
                            >
                              <motion.div
                                whileHover={{ scale: 1.03 }}
                                className={[
                                  'size-8 rounded-full flex items-center justify-center text-xs font-semibold border',
                                  state === 'done'
                                    ? 'bg-orange-600 text-white border-orange-600'
                                    : state === 'active'
                                      ? 'bg-white text-orange-600 border-orange-600'
                                      : 'bg-white text-slate-500 border-slate-300',
                                ].join(' ')}
                              >
                                {idx + 1}
                              </motion.div>
                            </Link>
                          ) : (
                            <div
                              className={[
                                'size-8 rounded-full flex items-center justify-center text-xs font-semibold border',
                                'bg-white text-slate-400 border-slate-200',
                              ].join(' ')}
                            >
                              {idx + 1}
                            </div>
                          )}
                        </div>
                        <div
                          className={[
                            'mt-3 text-xs md:text-sm leading-snug',
                            state === 'active' ? 'text-slate-900 font-semibold' : 'text-slate-600',
                          ].join(' ')}
                        >
                          {s.label}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          <div className="p-6">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}

