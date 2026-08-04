import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Search, Mic } from 'lucide-react';
import api from '../../api/client';

export default function AISearchBar({ large = false, onResults }) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState('ai');
  const navigate = useNavigate();

  const handleSearch = async (e) => {
    e?.preventDefault();
    if (!query.trim()) return;

    if (onResults) {
      setLoading(true);
      try {
        const endpoint = mode === 'ai' ? '/products/ai-search' : '/products';
        const { data } = await api.get(endpoint, {
          params: mode === 'ai' ? { query } : { search: query },
        });
        onResults(data.products, query, mode);
      } finally {
        setLoading(false);
      }
      return;
    }

    navigate(`/marketplace?${mode === 'ai' ? 'aiQuery' : 'search'}=${encodeURIComponent(query)}`);
  };

  return (
    <form onSubmit={handleSearch} className={`w-full touch-manipulation ${large ? 'max-w-3xl' : 'max-w-xl'}`}>
      <div className="mb-2 flex gap-2" role="group" aria-label="Search mode">
        <button
          type="button"
          onClick={() => setMode('ai')}
          className={`flex min-h-8 items-center gap-1 rounded-full px-3 py-1 text-xs font-medium transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${
            mode === 'ai' ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <Sparkles className="h-3 w-3" /> AI Search
        </button>
        <button
          type="button"
          onClick={() => setMode('keyword')}
          className={`flex min-h-8 items-center gap-1 rounded-full px-3 py-1 text-xs font-medium transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${
            mode === 'keyword' ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <Search className="h-3 w-3" /> Keyword
        </button>
      </div>
      <div className="relative flex items-center">
        <div className="pointer-events-none absolute left-4">
          {mode === 'ai' ? (
            <Sparkles className={`${large ? 'h-5 w-5' : 'h-4 w-4'} text-brand-500`} />
          ) : (
            <Search className={`${large ? 'h-5 w-5' : 'h-4 w-4'} text-gray-400`} />
          )}
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={
            mode === 'ai'
              ? 'Try: organic cotton fabric under ₹500 per metre'
              : 'Search products, brands, categories...'
          }
          className={`w-full rounded-xl border border-gray-300 bg-white pl-12 pr-28 shadow-sm transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 ${
            large ? 'py-4 text-base' : 'min-h-11 py-2.5 text-sm'
          }`}
        />
        <div className="absolute right-2 flex items-center gap-1">
          <button type="button" className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600" title="Voice search" aria-label="Voice search">
            <Mic className="h-4 w-4" />
          </button>
          <button
            type="submit"
            disabled={loading}
            className={`rounded-lg bg-brand-600 font-medium text-white hover:bg-brand-700 disabled:opacity-50 ${
              large ? 'px-5 py-2 text-sm' : 'min-h-9 px-4 py-1.5 text-sm'
            }`}
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </div>
    </form>
  );
}
