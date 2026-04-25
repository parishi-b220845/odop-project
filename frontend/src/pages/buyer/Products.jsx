import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, X, Search, ChevronDown } from 'lucide-react';
import { productAPI } from '../../services/api';
import ProductCard from '../../components/common/ProductCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Top Rated' },
  { value: 'popular', label: 'Most Popular' },
];

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [categories, setCategories] = useState([]);
  const [states, setStates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const filters = {
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    state: searchParams.get('state') || '',
    sort: searchParams.get('sort') || 'newest',
    page: parseInt(searchParams.get('page')) || 1,
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    odopVerified: searchParams.get('odopVerified') || '',
    giTagged: searchParams.get('giTagged') || '',
    featured: searchParams.get('featured') || '',
  };

  const setFilter = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) newParams.set(key, value);
    else newParams.delete(key);
    if (key !== 'page') newParams.set('page', '1');
    setSearchParams(newParams);
  };

  const clearFilters = () => setSearchParams({});

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [prodRes, catRes, stateRes] = await Promise.all([
          productAPI.getAll(Object.fromEntries([...searchParams.entries()])),
          productAPI.getCategories(),
          productAPI.getStates(),
        ]);
        setProducts(prodRes.data.products);
        setPagination(prodRes.data.pagination);
        setCategories(catRes.data.categories);
        setStates(stateRes.data.states);
      } catch (e) { console.error(e); }
      setLoading(false);
    };
    loadData();
  }, [searchParams]);

  const activeFilterCount = [filters.category, filters.state, filters.minPrice, filters.maxPrice, filters.odopVerified, filters.giTagged].filter(Boolean).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="section-heading text-2xl">
            {filters.search ? `Results for "${filters.search}"` : filters.category || 'All Products'}
          </h1>
          {pagination && <p className="text-sm text-gray-500 mt-1">{pagination.total} products found</p>}
        </div>

        <div className="flex items-center gap-3">
          <button onClick={() => setFiltersOpen(!filtersOpen)} className="btn-ghost text-sm flex items-center gap-2 border border-cream-200">
            <Filter className="w-4 h-4" />Filters
            {activeFilterCount > 0 && <span className="min-w-[1.25rem] h-5 px-1 bg-terracotta-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">{activeFilterCount > 9 ? '9+' : activeFilterCount}</span>}
          </button>

          <select value={filters.sort} onChange={(e) => setFilter('sort', e.target.value)} className="input-field !py-2 !text-sm !w-auto">
            {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Sidebar Filters */}
        <aside className={`${filtersOpen ? 'block' : 'hidden'} lg:block w-full lg:w-64 flex-shrink-0`}>
          <div className="bg-white rounded-xl border border-cream-200 p-5 sticky top-24">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-body font-semibold text-gray-900">Filters</h3>
              {activeFilterCount > 0 && (
                <button onClick={clearFilters} className="text-xs text-terracotta-500 hover:text-terracotta-700">Clear All</button>
              )}
            </div>

            {/* Category */}
            <div className="mb-5">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Category</h4>
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {categories.map(cat => (
                  <button key={cat.category} onClick={() => setFilter('category', filters.category === cat.category ? '' : cat.category)}
                    className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${filters.category === cat.category ? 'bg-terracotta-50 text-terracotta-700 font-medium' : 'text-gray-600 hover:bg-cream-50'}`}>
                    {cat.category} <span className="text-gray-400">({cat.count})</span>
                  </button>
                ))}
              </div>
            </div>

            {/* State */}
            <div className="mb-5">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">State</h4>
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {states.map(s => (
                  <button key={s.state} onClick={() => setFilter('state', filters.state === s.state ? '' : s.state)}
                    className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${filters.state === s.state ? 'bg-terracotta-50 text-terracotta-700 font-medium' : 'text-gray-600 hover:bg-cream-50'}`}>
                    {s.state} <span className="text-gray-400">({s.product_count})</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div className="mb-5">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Price Range</h4>
              <div className="flex gap-2">
                <input type="number" placeholder="Min" value={filters.minPrice} onChange={(e) => setFilter('minPrice', e.target.value)} className="input-field !py-2 !text-sm" />
                <input type="number" placeholder="Max" value={filters.maxPrice} onChange={(e) => setFilter('maxPrice', e.target.value)} className="input-field !py-2 !text-sm" />
              </div>
            </div>

            {/* ODOP & GI */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={filters.odopVerified === 'true'} onChange={(e) => setFilter('odopVerified', e.target.checked ? 'true' : '')} className="w-4 h-4 rounded border-cream-300 text-terracotta-500 focus:ring-terracotta-300" />
                <span className="text-sm text-gray-700">ODOP Verified Only</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={filters.giTagged === 'true'} onChange={(e) => setFilter('giTagged', e.target.checked ? 'true' : '')} className="w-4 h-4 rounded border-cream-300 text-terracotta-500 focus:ring-terracotta-300" />
                <span className="text-sm text-gray-700">GI Tagged Only</span>
              </label>
            </div>
          </div>
        </aside>

        {/* Products Grid */}
        <div className="flex-1">
          {loading ? <LoadingSpinner /> : products.length === 0 ? (
            <div className="text-center py-20">
              <span className="text-5xl block mb-4">🔍</span>
              <h3 className="font-display text-xl text-gray-900">No products found</h3>
              <p className="text-gray-500 mt-2">Try adjusting your filters or search query</p>
              <button onClick={clearFilters} className="btn-primary mt-4">Clear Filters</button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                {products.map(product => <ProductCard key={product.id} product={product} />)}
              </div>

              {/* Pagination */}
              {pagination && pagination.totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-10">
                  {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).slice(
                    Math.max(0, pagination.page - 3), Math.min(pagination.totalPages, pagination.page + 2)
                  ).map(p => (
                    <button key={p} onClick={() => setFilter('page', p.toString())}
                      className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${p === pagination.page ? 'bg-terracotta-500 text-white' : 'bg-white border border-cream-200 text-gray-600 hover:bg-cream-50'}`}>
                      {p}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
