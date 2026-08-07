import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Heart, ShoppingCart, Minus, Plus, Sparkles, Truck, Shield } from 'lucide-react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { formatPrice, discountedPrice } from '../utils/format';
import { getProductImage, handleImageError } from '../utils/imageFallback';
import StarRating from '../components/ui/StarRating';
import ProductCard from '../components/product/ProductCard';
import Button from '../components/ui/Button';
import { Skeleton } from '../components/ui/Skeleton';

export default function ProductDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { isAuthenticated, isBuyer } = useAuth();
  const { addToCart } = useCart();
  const { showToast } = useToast();
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(() => {
    const saved = JSON.parse(localStorage.getItem('wishlist') || '[]');
    return saved.includes(id);
  });
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      try {
        const r = await api.get(`/products/${id}`);
        return r.data;
      } catch {
        const { mockProducts } = await import('../api/mockData');
        const found = mockProducts.find((p) => p._id === id) || mockProducts[0];
        return { product: found };
      }
    },
  });

  const { data: reviews } = useQuery({
    queryKey: ['reviews', id],
    queryFn: () => api.get(`/reviews/product/${id}`).then((r) => r.data.reviews).catch(() => []),
  });

  const { data: recommendations } = useQuery({
    queryKey: ['recommendations', id],
    queryFn: () => api.get(`/ai/recommendations/${id}`).then((r) => r.data).catch(() => ({ similar: [] })),
  });

  const wishlistMutation = useMutation({
    mutationFn: () => api.post('/wishlist/toggle', { productId: id }),
    onSuccess: (res) => showToast(res.data.added ? 'Added to wishlist' : 'Removed from wishlist'),
    onError: () => showToast('Please login to use wishlist', 'error'),
  });

  const product = data?.product;
  if (isLoading) {
    return (
      <div className="container-app py-8">
        <div className="grid gap-8 lg:grid-cols-2">
          <Skeleton className="aspect-square rounded-xl" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-24 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) return <div className="container-app py-16 text-center">Product not found</div>;

  const price = discountedPrice(product.price, product.discount);

  const handleWishlistToggle = async () => {
    if (!isAuthenticated) {
      showToast('Please register or login to save items to your wishlist', 'info');
      navigate('/register?redirect=/wishlist');
      return;
    }
    try {
      await wishlistMutation.mutateAsync();
      const saved = JSON.parse(localStorage.getItem('wishlist') || '[]');
      let updated;
      if (saved.includes(id)) {
        updated = saved.filter((item) => item !== id);
        setIsWishlisted(false);
      } else {
        updated = [...saved, id];
        setIsWishlisted(true);
      }
      localStorage.setItem('wishlist', JSON.stringify(updated));
    } catch {
      // Toggle local state fallback
      const saved = JSON.parse(localStorage.getItem('wishlist') || '[]');
      const nextState = !isWishlisted;
      setIsWishlisted(nextState);
      const updated = nextState ? [...saved, id] : saved.filter((item) => item !== id);
      localStorage.setItem('wishlist', JSON.stringify(updated));
      showToast(nextState ? 'Added to wishlist!' : 'Removed from wishlist');
    }
  };

  const handleAddToCart = async () => {
    try {
      await addToCart(product._id, quantity);
      showToast('Added to cart!');
    } catch {
      showToast('Failed to add to cart', 'error');
    }
  };

  const handleBuyNow = async () => {
    await handleAddToCart();
    if (!isAuthenticated) {
      showToast('Please register or login to complete your order', 'info');
      navigate('/register?redirect=/checkout');
      return;
    }
    navigate('/checkout');
  };

  return (
    <div className="container-app py-8">
      <nav className="mb-6 text-sm text-gray-500">
        <Link to="/" className="hover:text-brand-600">Home</Link>
        <span className="mx-2">/</span>
        <Link to="/marketplace" className="hover:text-brand-600">Marketplace</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900">{product.name}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Images */}
        <div>
          <div className="mb-4 overflow-hidden rounded-xl border border-gray-200 bg-white">
            <img
              src={product.images?.[activeImage] ? product.images[activeImage] : getProductImage(product)}
              onError={(e) => handleImageError(e, product.category)}
              alt={product.name}
              className="aspect-square w-full object-cover"
            />
          </div>
          {product.images?.length > 1 && (
            <div className="flex gap-2">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={`h-16 w-16 overflow-hidden rounded-lg border-2 ${activeImage === i ? 'border-brand-600' : 'border-gray-200'}`}
                >
                  <img
                    src={img}
                    onError={(e) => handleImageError(e, product.category)}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div>
          <p className="mb-1 text-sm text-brand-600">{product.category} {product.subcategory && `› ${product.subcategory}`}</p>
          <h1 className="mb-2 text-2xl font-bold text-gray-900 md:text-3xl">{product.name}</h1>
          {product.brand && <p className="mb-2 text-sm text-gray-500">Brand: {product.brand}</p>}

          <div className="mb-4 flex items-center gap-3">
            <StarRating rating={product.rating} size="md" />
            <span className="text-sm text-gray-500">({product.reviewCount} reviews)</span>
          </div>

          <div className="mb-6 flex items-baseline gap-3">
            <span className="text-3xl font-bold text-gray-900">{formatPrice(price)}</span>
            {product.discount > 0 && (
              <>
                <span className="text-lg text-gray-400 line-through">{formatPrice(product.price)}</span>
                <span className="rounded-md bg-red-100 px-2 py-0.5 text-sm font-semibold text-red-700">
                  {product.discount}% OFF
                </span>
              </>
            )}
          </div>

          <p className="mb-6 text-gray-600 leading-relaxed">{product.description}</p>

          {product.highlights?.length > 0 && (
            <ul className="mb-6 space-y-1">
              {product.highlights.map((h, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-gray-700">
                  <Sparkles className="h-3.5 w-3.5 text-brand-500" /> {h}
                </li>
              ))}
            </ul>
          )}

          <div className="mb-6 flex items-center gap-4 text-sm">
            <span className={product.stock > 0 ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
              {product.stock > 0 ? `In Stock (${product.stock} available)` : 'Out of Stock'}
            </span>
          </div>

          {product.stock > 0 && (
            <div className="mb-6 flex items-center gap-4">
              <div className="flex items-center rounded-lg border border-gray-300">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-2 hover:bg-gray-50">
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-10 text-center text-sm font-medium">{quantity}</span>
                <button onClick={() => setQuantity(Math.min(product.stock, quantity + 1))} className="p-2 hover:bg-gray-50">
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          <div className="mb-8 flex flex-wrap gap-3">
            {product.stock > 0 && (
              <>
                <Button onClick={handleAddToCart} size="lg">
                  <ShoppingCart className="h-4 w-4" /> Add to Cart
                </Button>
                <Button variant="accent" size="lg" onClick={handleBuyNow}>
                  Buy Now
                </Button>
              </>
            )}
            <Button
              variant="secondary"
              size="lg"
              onClick={handleWishlistToggle}
              className={isWishlisted ? 'border-red-200 bg-red-50 text-red-600' : ''}
            >
              <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`} /> Wishlist
            </Button>
          </div>

          <div className="mb-6 flex gap-6 text-sm text-gray-600">
            <div className="flex items-center gap-2"><Truck className="h-4 w-4" /> Free shipping over ₹500</div>
            <div className="flex items-center gap-2"><Shield className="h-4 w-4" /> Verified supplier</div>
          </div>

          {/* Supplier info */}
          {product.supplier && (
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
              <p className="mb-2 text-sm font-semibold text-gray-900">Sold by</p>
              <div className="flex items-center gap-3">
                {product.supplier.companyLogo && (
                  <img src={product.supplier.companyLogo} alt="" className="h-10 w-10 rounded-lg object-cover" />
                )}
                <div>
                  <Link to={`/suppliers/${product.supplier._id}`} className="font-medium text-brand-600 hover:underline">
                    {product.supplier.businessName}
                  </Link>
                  <StarRating rating={product.supplier.rating} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Specifications */}
      {product.specifications && Object.keys(product.specifications).length > 0 && (
        <section className="mt-12">
          <h2 className="mb-4 text-xl font-bold">Specifications</h2>
          <div className="overflow-hidden rounded-xl border border-gray-200">
            {Object.entries(product.specifications).map(([key, val], i) => (
              <div key={key} className={`flex ${i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>
                <span className="w-1/3 px-4 py-3 text-sm font-medium text-gray-700">{key}</span>
                <span className="w-2/3 px-4 py-3 text-sm text-gray-600">{val}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Reviews */}
      <section className="mt-12">
        <h2 className="mb-4 text-xl font-bold">Customer Reviews ({reviews?.length || 0})</h2>
        {reviews?.length === 0 ? (
          <p className="text-gray-500">No reviews yet.</p>
        ) : (
          <div className="space-y-4">
            {reviews?.map((r) => (
              <div key={r._id} className="rounded-xl border border-gray-200 bg-white p-4">
                <div className="mb-2 flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700">
                    {r.user?.name?.[0]}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{r.user?.name}</p>
                    <StarRating rating={r.rating} showValue={false} />
                  </div>
                </div>
                <p className="text-sm text-gray-700">{r.comment}</p>
                {r.supplierReply && (
                  <div className="mt-3 rounded-lg bg-gray-50 p-3 text-sm">
                    <p className="font-medium text-gray-900">Supplier Reply:</p>
                    <p className="text-gray-600">{r.supplierReply}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Recommendations */}
      {recommendations?.similar?.length > 0 && (
        <section className="mt-12">
          <h2 className="mb-4 text-xl font-bold">Similar Products</h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {recommendations.similar.map((p) => <ProductCard key={p._id} product={p} />)}
          </div>
        </section>
      )}
    </div>
  );
}
