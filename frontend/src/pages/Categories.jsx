import { useQuery } from '@tanstack/react-query';
import api from '../api/client';
import CategoryCard from '../components/product/CategoryCard';

export default function Categories() {
  const { data: categories, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      try {
        const r = await api.get('/categories');
        return r.data.categories;
      } catch {
        const { mockCategories } = await import('../api/mockData');
        return mockCategories;
      }
    },
  });

  return (
    <div className="container-app py-8">
      <h1 className="mb-2 text-2xl font-bold text-gray-900">All Categories</h1>
      <p className="mb-8 text-gray-500">Browse products across all marketplace categories</p>
      {isLoading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="h-32 animate-pulse rounded-xl bg-gray-200" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {categories?.map((cat) => <CategoryCard key={cat._id} category={cat} />)}
        </div>
      )}
    </div>
  );
}
