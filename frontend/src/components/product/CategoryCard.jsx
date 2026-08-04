import { Link } from 'react-router-dom';

export default function CategoryCard({ category }) {
  return (
    <Link
      to={`/marketplace?category=${encodeURIComponent(category.name)}`}
      className="flex flex-col items-center rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-md"
    >
      <span className="mb-3 text-4xl">{category.icon || '📦'}</span>
      <h3 className="text-sm font-semibold text-gray-900">{category.name}</h3>
      <p className="mt-1 text-xs text-gray-500">{category.productCount || 0} products</p>
    </Link>
  );
}
