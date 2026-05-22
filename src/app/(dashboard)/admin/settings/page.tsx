import { prisma } from "@/lib/prisma";

export default async function AdminSettingsPage() {
  const [companies, categories] = await Promise.all([
    prisma.company.findMany({ include: { branches: true }, orderBy: { name: "asc" } }),
    prisma.category.findMany({ include: { subcategories: true }, orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 text-sm mt-1">Manage companies, branches, and categories</p>
      </div>

      {/* Companies */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Companies & Branches</h2>
          <span className="text-xs text-gray-400">{companies.length} companies</span>
        </div>
        <div className="divide-y divide-gray-100">
          {companies.map(c => (
            <div key={c.id} className="p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="font-medium text-sm text-gray-900">{c.name}</p>
                <span className={`text-xs px-2 py-0.5 rounded-full ${c.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                  {c.isActive ? "Active" : "Inactive"}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {c.branches.map(b => (
                  <span key={b.id} className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">{b.name}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Categories */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Service Categories</h2>
          <span className="text-xs text-gray-400">{categories.length} categories</span>
        </div>
        <div className="divide-y divide-gray-100">
          {categories.map(c => (
            <div key={c.id} className="p-4">
              <p className="font-medium text-sm text-gray-900 mb-2">{c.name}</p>
              <div className="flex flex-wrap gap-2">
                {c.subcategories.map(s => (
                  <span key={s.id} className="text-xs bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full">{s.name}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
