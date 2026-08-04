import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Plus, Search, Edit2, Trash2, Copy, Package, AlertTriangle, Eye, EyeOff
} from 'lucide-react';
import api from '../../api/client';
import { useToast } from '../../context/ToastContext';

const stockColor = (stock) => {
  if (stock === 0) return 'text-danger-600 font-bold';
  if (stock <= 10) return 'text-warning-500 font-semibold';
  return 'text-success-600';
};

const stockBadge = (stock) => {
  if (stock === 0) return 'badge-red';
  if (stock <= 10) return 'badge-yellow';
  return 'badge-green';
};

function DeleteModal({ product, onConfirm, onCancel, isLoading }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl animate-scale-in">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-danger-50">
          <Trash2 className="h-6 w-6 text-danger-600" />
        </div>
        <h3 className="text-center text-lg font-semibold text-gray-900">Delete Product?</h3>
        <p className="mt-2 text-center text-sm text-gray-500">
          "<strong>{product.name}</strong>" will be hidden from the marketplace. This cannot be undone.
        </p>
        <div className="mt-6 flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 rounded-lg border border-gray-300 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 rounded-lg bg-danger-600 py-2.5 text-sm font-semibold text-white hover:bg-danger-700 transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SupplierProducts() {
  const toast = useToast();
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['supplier-products'],
    queryFn: () => api.get('/products/supplier/mine').then((r) => r.data.products),
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.get('/categories').then((r) => r.data.categories),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/products/${id}`),
    onSuccess: () => {
      toast.success('Product removed from marketplace');
      qc.invalidateQueries({ queryKey: ['supplier-products'] });
      setDeleteTarget(null);
    },
    onError: () => toast.error('Failed to delete product'),
  });

  const duplicateMutation = useMutation({
    mutationFn: (id) => api.post(`/products/${id}/duplicate`),
    onSuccess: () => {
      toast.success('Product duplicated successfully');
      qc.invalidateQueries({ queryKey: ['supplier-products'] });
    },
    onError: () => toast.error('Failed to duplicate product'),
  });

  const filtered = useMemo(() => {
    let list = products;
    if (categoryFilter) list = list.filter((p) => p.category === categoryFilter);
    if (search) list = list.filter((p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.brand?.toLowerCase().includes(search.toLowerCase())
    );
    return list;
  }, [products, search, categoryFilter]);

  return (
    <div className="animate-fade-in space-y-5">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Products</h1>
          <p className="text-sm text-gray-500 mt-0.5">{products.length} total products</p>
        </div>
        <Link
          to="/supplier/products/new"
          className="flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 transition-colors shadow-sm"
        >
          <Plus className="h-4 w-4" /> Add Product
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products…"
            className="form-input pl-9"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="form-select w-auto min-w-36"
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c._id} value={c.name}>{c.name}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="space-y-3">
          {[1,2,3,4,5].map((i) => <div key={i} className="skeleton h-16 w-full rounded-xl" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <Package className="h-12 w-12 text-gray-300 mb-3" />
          <h3 className="font-semibold text-gray-700">No products found</h3>
          <p className="text-sm text-gray-500 mt-1">
            {search ? 'Try a different search term.' : 'Add your first product to start selling.'}
          </p>
          {!search && (
            <Link to="/supplier/products/new" className="mt-4 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 transition-colors">
              Add First Product
            </Link>
          )}
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="table-container hidden md:block">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="table-th w-12"></th>
                  <th className="table-th">Product</th>
                  <th className="table-th">Category</th>
                  <th className="table-th">Price</th>
                  <th className="table-th">Stock</th>
                  <th className="table-th">Status</th>
                  <th className="table-th text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p._id} className="table-row">
                    <td className="table-td">
                      {p.images?.[0] ? (
                        <img src={p.images[0]} alt={p.name} className="h-10 w-10 rounded-lg object-cover" />
                      ) : (
                        <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center">
                          <Package className="h-5 w-5 text-gray-400" />
                        </div>
                      )}
                    </td>
                    <td className="table-td">
                      <p className="font-medium text-gray-900 line-clamp-1">{p.name}</p>
                      {p.brand && <p className="text-xs text-gray-400">{p.brand}</p>}
                    </td>
                    <td className="table-td">
                      <span className="badge-gray">{p.category}</span>
                    </td>
                    <td className="table-td">
                      <p className="font-semibold text-gray-900">₹{p.price?.toLocaleString('en-IN')}</p>
                      {p.discount > 0 && (
                        <p className="text-xs text-success-600">-{p.discount}% off</p>
                      )}
                    </td>
                    <td className="table-td">
                      <span className={`badge ${stockBadge(p.stock)}`}>{p.stock} units</span>
                    </td>
                    <td className="table-td">
                      <span className={p.isActive ? 'badge-green' : 'badge-red'}>
                        {p.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="table-td">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          to={`/products/${p._id}`}
                          target="_blank"
                          className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
                          title="View"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        <Link
                          to={`/supplier/products/${p._id}/edit`}
                          className="rounded-lg p-2 text-gray-400 hover:bg-brand-50 hover:text-brand-600 transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => duplicateMutation.mutate(p._id)}
                          className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
                          title="Duplicate"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(p)}
                          className="rounded-lg p-2 text-gray-400 hover:bg-danger-50 hover:text-danger-600 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {filtered.map((p) => (
              <div key={p._id} className="card p-4">
                <div className="flex gap-3">
                  {p.images?.[0] ? (
                    <img src={p.images[0]} alt={p.name} className="h-14 w-14 rounded-lg object-cover shrink-0" />
                  ) : (
                    <div className="h-14 w-14 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                      <Package className="h-6 w-6 text-gray-400" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-gray-900 line-clamp-1">{p.name}</p>
                    <p className="text-sm text-gray-500">{p.category}</p>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="font-bold text-gray-900">₹{p.price?.toLocaleString('en-IN')}</span>
                      <span className={`badge ${stockBadge(p.stock)}`}>{p.stock} left</span>
                    </div>
                  </div>
                </div>
                <div className="mt-3 flex gap-2 border-t border-gray-100 pt-3">
                  <Link to={`/supplier/products/${p._id}/edit`} className="flex-1 rounded-lg border border-gray-300 py-1.5 text-center text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                    Edit
                  </Link>
                  <button onClick={() => setDeleteTarget(p)} className="flex-1 rounded-lg border border-danger-200 py-1.5 text-sm font-medium text-danger-600 hover:bg-danger-50 transition-colors">
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Delete modal */}
      {deleteTarget && (
        <DeleteModal
          product={deleteTarget}
          onConfirm={() => deleteMutation.mutate(deleteTarget._id)}
          onCancel={() => setDeleteTarget(null)}
          isLoading={deleteMutation.isPending}
        />
      )}
    </div>
  );
}
