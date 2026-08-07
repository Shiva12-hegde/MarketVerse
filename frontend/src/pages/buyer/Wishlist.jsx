import { useQuery } from '@tanstack/react-query';
import api from '../../api/client';
import ProductCard from '../../components/product/ProductCard';

export default function Wishlist() {
  const { data, isLoading } = useQuery({
    queryKey: ['wishlist'],
    queryFn: async () => {
      try {
        const r = await api.get('/wishlist');
        return r.data.wishlist;
      } catch {
        const savedIds = JSON.parse(localStorage.getItem('wishlist') || '[]');
        const { mockProducts } = await import('../../api/mockData');
        const products = mockProducts.filter((p) => savedIds.includes(p._id));
        return { products };
      }
    },
  });

  return (
    <div className="container-app py-8">
      <h1 className="mb-6 text-2xl font-bold">My Wishlist</h1>
      {isLoading ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-64 animate-pulse rounded-xl bg-gray-200" />)}
        </div>
      ) : !data?.products?.length ? (
        <div className="rounded-xl border border-gray-200 bg-white py-12 text-center text-gray-500">
          Your wishlist is empty
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {data.products.map((p) => <ProductCard key={p._id} product={p} />)}
        </div>
      )}
    </div>
  );
}
