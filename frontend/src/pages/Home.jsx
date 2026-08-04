import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { ArrowRight, Shield, Truck, Sparkles, Users } from 'lucide-react';
import api from '../api/client';
import AISearchBar from '../components/search/AISearchBar';
import ProductCard from '../components/product/ProductCard';
import CategoryCard from '../components/product/CategoryCard';
import { ProductCardSkeleton } from '../components/ui/Skeleton';
import Button from '../components/ui/Button';

export default function Home() {
  const { data: featured, isLoading: featuredLoading } = useQuery({
    queryKey: ['featured'],
    queryFn: () => api.get('/products/featured').then((r) => r.data),
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.get('/categories').then((r) => r.data.categories),
  });

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-900 via-brand-800 to-brand-700 text-white">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggIGQ9Ik0zNiAzNGg0djJoLTR6bTAtNmg0djJoLTR6bTAtNmg0djJoLTR6bTAtNmg0djJoLTR6bTAtNmg0djJoLTR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />
        <div className="container-app relative py-16 md:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm backdrop-blur">
              <Sparkles className="h-4 w-4 text-yellow-300" />
              AI-Powered B2B/B2C Marketplace
            </div>
            <h1 className="mb-4 text-4xl font-extrabold tracking-tight md:text-5xl lg:text-6xl">
              Discover. Connect. <span className="text-yellow-300">Trade Smarter.</span>
            </h1>
            <p className="mb-8 text-lg text-brand-100 md:text-xl">
              Source products from verified suppliers, compare options, and place orders with confidence.
            </p>
            <div className="mx-auto flex justify-center">
              <AISearchBar large />
            </div>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link to="/marketplace"><Button variant="accent" size="lg">Browse Marketplace</Button></Link>
              <Link to="/register?role=supplier"><Button variant="secondary" size="lg">Become a Supplier</Button></Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trust badges */}
      <section className="border-b border-gray-200 bg-white py-8">
        <div className="container-app grid grid-cols-2 gap-6 md:grid-cols-4">
          {[
            { icon: Shield, label: 'Verified Suppliers', desc: 'Trusted B2B partners' },
            { icon: Sparkles, label: 'AI Search', desc: 'Smart product discovery' },
            { icon: Truck, label: 'Fast Delivery', desc: 'Pan-India shipping' },
            { icon: Users, label: '10K+ Products', desc: 'Growing catalog' },
          ].map(({ icon: Icon, label, desc }) => (
            <div key={label} className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50">
                <Icon className="h-5 w-5 text-brand-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">{label}</p>
                <p className="text-xs text-gray-500">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="py-12">
        <div className="container-app">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Shop by Category</h2>
            <Link to="/categories" className="flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700">
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
            {categories?.slice(0, 10).map((cat) => (
              <CategoryCard key={cat._id} category={cat} />
            ))}
          </div>
        </div>
      </section>

      {/* Featured */}
      <section className="bg-white py-12">
        <div className="container-app">
          <h2 className="mb-8 text-2xl font-bold text-gray-900">Featured Products</h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {featuredLoading
              ? Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)
              : featured?.featured?.map((p) => <ProductCard key={p._id} product={p} />)}
          </div>
        </div>
      </section>

      {/* Trending */}
      <section className="py-12">
        <div className="container-app">
          <h2 className="mb-8 text-2xl font-bold text-gray-900">Trending Now</h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {featured?.trending?.map((p) => <ProductCard key={p._id} product={p} />)}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-brand-600 py-16 text-white">
        <div className="container-app text-center">
          <h2 className="mb-4 text-3xl font-bold">Ready to grow your business?</h2>
          <p className="mb-8 text-brand-100">Join thousands of suppliers on MarketVerse AI</p>
          <Link to="/register?role=supplier">
            <Button variant="accent" size="lg">Start Selling Today</Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
