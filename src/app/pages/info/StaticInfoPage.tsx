import { Link } from 'react-router';

export type StaticInfoPageProps = {
  title: string;
  subtitle: string;
  sections: Array<{
    heading: string;
    body: string[];
  }>;
};

export default function StaticInfoPage({ title, subtitle, sections }: StaticInfoPageProps) {
  return (
    <div className="min-h-screen bg-slate-50">
      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <Link to="/" className="inline-flex items-center text-sm font-medium text-orange-600 hover:text-orange-700">
          ← Quay về trang chủ
        </Link>

        <section className="mt-6 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:p-8">
          <p className="text-sm uppercase tracking-[0.22em] text-slate-500">ShopViet</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900 sm:text-4xl">{title}</h1>
          <p className="mt-4 text-base leading-7 text-slate-600">{subtitle}</p>

          <div className="mt-8 space-y-6">
            {sections.map((section) => (
              <article key={section.heading} className="rounded-2xl bg-slate-50 p-5 ring-1 ring-slate-200">
                <h2 className="text-lg font-semibold text-slate-900">{section.heading}</h2>
                <div className="mt-3 space-y-3 text-sm leading-7 text-slate-600">
                  {section.body.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
