import { Link } from 'react-router-dom';
import { Headphones, Watch, Mouse, Laptop, Tv, ShoppingBag, Package } from 'lucide-react';

const categoryIconMap = {
  Headphones: Headphones,
  Watch: Watch,
  Mouse: Mouse,
  Laptop: Laptop,
  Tv: Tv,
  ShoppingBag: ShoppingBag,
};

export default function CategoryCard({ category }) {
  const IconComponent = categoryIconMap[category.icon] || Package;
  const count = category.productCount || 15;

  return (
    <Link
      to={`/marketplace?category=${encodeURIComponent(category.name)}`}
      className="flex flex-col items-center rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-md"
    >
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
        {typeof category.icon === 'string' && category.icon.length <= 2 ? (
          <span className="text-2xl">{category.icon}</span>
        ) : (
          <IconComponent className="h-6 w-6" />
        )}
      </div>
      <h3 className="text-sm font-semibold text-gray-900">{category.name}</h3>
      <p className="mt-1 text-xs text-gray-500">{count} products</p>
    </Link>
  );
}
