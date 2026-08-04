import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Grid, List, SlidersHorizontal } from 'lucide-react';
import api from '../api/client';
import ProductCard from '../components/product/ProductCard';
import { ProductCardSkeleton } from '../components/ui/Skeleton';
import { Select } from '../components/ui/Input';
import Button from '../components/ui/Button';

export default function Marketplace() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [view, setView] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);

  const page = searchParams.get('page') || '1';
  const category = searchParams.get('category') || '';
  const search = searchParams.get('search') || '';
  const aiQuery = searchParams.get('aiQuery') || '';
  const sort = searchParams.get('sort') || 'newest';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';

  const { data, isLoading } = useQuery({
    queryKey: ['products', page, category, search, aiQuery, sort, minPrice, maxPrice],
    queryFn: async () => {
      if (aiQuery) {
        const res = await api.get('/products/ai-search', { params: { query: aiQuery } });
        return { products: res.data.products, pagination: { page: 1, pages: 1, total: res.data.products.length } };
      }
      const res = await api.get('/products', {
        params: { page, limit: 12, category, search, sort, minPrice, maxPrice },
      });
      return res.data;
    },
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.get('/categories').then((r) => r.data.categories),
  });

  const updateParam = (key, value) => {
    const params = new URLSearchParams(searchParams);
    if (value) params.set(key, value);
    else params.delete(key);
    if (key !== 'page') params.delete('page');
    setSearchParams(params);
  };

  return (
    <div className="container-app py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Marketplace</h1>
        {(search || aiQuery) && (
          <p className="mt-1 text-sm text-gray-500">
            {aiQuery ? `AI results for "${aiQuery}"` : `Results for "${search}"`}
            {data?.pagination?.total != null && ` — ${data.pagination.total} products`}
          </p>
        )}
      </div>

      <div className="flex gap-6">
        {/* Filters sidebar */}
        <aside className={`${showFilters ? 'block' : 'hidden'} w-full shrink-0 md:block md:w-56`}>
          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <h3 className="mb-4 font-semibold text-gray-900">Filters</h3>

            <div className="mb-4">
              <label className="mb-1 block text-sm font-medium text-gray-700">Category</label>
              <select
                value={category}
                onChange={(e) => updateParam('category', e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              >
                <option value="">All Categories</option>
                {categories?.map((c) => (
                  <option key={c._id} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="mb-4 grid grid-cols-2 gap-2">
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-700">Min Price</label>
                <input
                  type="number"
                  value={minPrice}
                  onChange={(e) => updateParam('minPrice', e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-2 py-1.5 text-sm"
                  placeholder="₹0"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-700">Max Price</label>
                <input
                  type="number"
                  value={maxPrice}
                  onChange={(e) => updateParam('maxPrice', e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-2 py-1.5 text-sm"
                  placeholder="₹99999"
                />
              </div>
            </div>

            <Button variant="ghost" size="sm" className="w-full" onClick={() => setSearchParams({})}>
              Clear Filters
            </Button>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          {/* Toolbar */}
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <button
              className="flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm md:hidden"
              onClick={() => setShowFilters(!showFilters)}
            >
              <SlidersHorizontal className="h-4 w-4" /> Filters
            </button>

            <Select
              value={sort}
              onChange={(e) => updateParam('sort', e.target.value)}
              className="w-auto"
            >
              <option value="newest">Newest</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating">Top Rated</option>
              <option value="popular">Most Popular</option>
            </Select>

            <div className="flex rounded-lg border border-gray-300">
              <button
                onClick={() => setView('grid')}
                className={`p-2 ${view === 'grid' ? 'bg-brand-50 text-brand-600' : 'text-gray-500'}`}
              >
                <Grid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setView('list')}
                className={`p-2 ${view === 'list' ? 'bg-brand-50 text-brand-600' : 'text-gray-500'}`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Products grid */}
          {isLoading ? (
            <div className={`grid gap-4 ${view === 'grid' ? 'grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
              {Array.from({ length: 6 }).map((_, i) => <ProductCardSkeleton key={i} />)}
            </div>
          ) : data?.products?.length === 0 ? (
            <div className="rounded-xl border border-gray-200 bg-white py-16 text-center">
              <p className="text-gray-500">No products found. Try adjusting your filters.</p>
            </div>
          ) : (
            <div className={`grid gap-4 ${view === 'grid' ? 'grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
              {data?.products?.map((p) => <ProductCard key={p._id} product={p} />)}
            </div>
          )}

          {/* Pagination */}
          {data?.pagination?.pages > 1 && (
            <div className="mt-8 flex justify-center gap-2">
              {Array.from({ length: data.pagination.pages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => updateParam('page', String(p))}
                  className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
                    Number(page) === p ? 'bg-brand-600 text-white' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
