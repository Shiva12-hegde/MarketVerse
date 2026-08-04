import { Link } from 'react-router-dom';
import { formatPrice, discountedPrice } from '../../utils/format';
import StarRating from '../ui/StarRating';

export default function ProductCard({ product }) {
  const price = discountedPrice(product.price, product.discount);

  return (
    <Link
      to={`/products/${product._id}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        <img
          src={product.images?.[0] || 'https://via.placeholder.com/400'}
          alt={product.name}
          className="h-full w-full object-cover transition group-hover:scale-105"
          loading="lazy"
        />
        {product.discount > 0 && (
          <span className="absolute left-2 top-2 rounded-md bg-red-500 px-2 py-0.5 text-xs font-semibold text-white">
            -{product.discount}%
          </span>
        )}
        {product.isFeatured && (
          <span className="absolute right-2 top-2 rounded-md bg-brand-600 px-2 py-0.5 text-xs font-semibold text-white">
            Featured
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <p className="mb-1 text-xs text-gray-500">{product.category}</p>
        <h3 className="mb-2 line-clamp-2 text-sm font-semibold text-gray-900 group-hover:text-brand-600">
          {product.name}
        </h3>
        {product.supplier && (
          <p className="mb-2 text-xs text-gray-500">by {product.supplier.businessName}</p>
        )}
        <div className="mb-2">
          <StarRating rating={product.rating} />
        </div>
        <div className="mt-auto flex items-baseline gap-2">
          <span className="text-lg font-bold text-gray-900">{formatPrice(price)}</span>
          {product.discount > 0 && (
            <span className="text-sm text-gray-400 line-through">{formatPrice(product.price)}</span>
          )}
        </div>
        {product.stock <= 10 && product.stock > 0 && (
          <p className="mt-1 text-xs text-orange-600">Only {product.stock} left</p>
        )}
      </div>
    </Link>
  );
}
