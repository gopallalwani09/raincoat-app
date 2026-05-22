import { useEffect, useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts } from '../store/productsSlice';
import ProductCard from '../components/ProductCard';

const subcategoriesMap = {
  Men: ['Plastic Raincoats', 'Reversible Raincoats', 'Taping Raincoats', 'Premium Raincoats'],
  Women: ['Long Raincoats', 'Skirt-Top Raincoats'],
  Kids: ['One Piece Raincoats', 'Two Piece Raincoats']
};

const Shop = () => {
  const { category } = useParams();
  const dispatch = useDispatch();
  const { items, status, totalPages, currentPage } = useSelector((state) => state.products);
  
  const [selectedSubcategory, setSelectedSubcategory] = useState('All');
  const [sortOrder, setSortOrder] = useState('asc'); // asc = low to high, desc = high to low
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      if (searchTerm !== debouncedSearch) setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm, debouncedSearch]);

  // When category changes, reset states
  useEffect(() => {
    setSelectedSubcategory('All');
    setSortOrder('asc');
    setPage(1);
    setSearchTerm('');
    setDebouncedSearch('');
  }, [category]);

  // Fetch data whenever parameters change
  useEffect(() => {
    dispatch(fetchProducts({ category, subcategory: selectedSubcategory, sort: sortOrder, page, limit: 7, search: debouncedSearch }));
  }, [dispatch, category, selectedSubcategory, sortOrder, page, debouncedSearch]);

  const handleSubcategoryChange = (sub) => {
    setSelectedSubcategory(sub);
    setPage(1);
  };

  const handleSortChange = (e) => {
    setSortOrder(e.target.value);
    setPage(1);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="py-8">
      <div className="mb-12 text-center">
        <h2 className="text-5xl font-black text-dark mb-4">{category} Collection</h2>
        <p className="text-gray-500">Explore the best raincoats for {category.toLowerCase()}.</p>
      </div>

      <div>
        <div className="mb-4 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
          {/* Subcategories Horizontal Scroller */}
          <div className="flex overflow-x-auto no-scrollbar gap-2 -mx-4 px-4 sm:mx-0 sm:px-0 py-1">
            <button
              onClick={() => handleSubcategoryChange('All')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex-shrink-0 cursor-pointer ${
                selectedSubcategory === 'All' 
                  ? 'bg-primary text-white shadow-md' 
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              All
            </button>
            {subcategoriesMap[category]?.map(sub => (
              <button
                key={sub}
                onClick={() => handleSubcategoryChange(sub)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex-shrink-0 cursor-pointer ${
                  selectedSubcategory === sub 
                    ? 'bg-primary text-white shadow-md' 
                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {sub}
              </button>
            ))}
          </div>
          
          {/* Sort Dropdown */}
          <div className="flex-shrink-0">
            <div className="flex items-center justify-between sm:justify-start gap-2 bg-white px-4 py-2.5 rounded-full border border-gray-200 shadow-sm w-full sm:w-auto">
              <span className="text-sm text-gray-500 font-medium whitespace-nowrap">Sort by:</span>
              <select 
                value={sortOrder} 
                onChange={handleSortChange}
                className="bg-transparent text-sm font-semibold text-dark outline-none cursor-pointer focus:outline-none pr-1"
              >
                <option value="asc">Price: Low to High</option>
                <option value="desc">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>

        <div className="mb-8 max-w-md relative">
          <input 
             type="text" 
             placeholder={selectedSubcategory === 'All' ? `Search all ${category} raincoats...` : `Search ${selectedSubcategory}...`} 
             value={searchTerm} 
             onChange={(e) => setSearchTerm(e.target.value)}
             className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-primary bg-white shadow-sm text-sm"
           />
           <svg className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        </div>
      </div>

      {status === 'loading' && (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      )}

      {status === 'succeeded' && items.length === 0 && (
        <div className="text-center text-gray-500 py-20 bg-white rounded-3xl border border-gray-100">
          <p className="text-xl">No products found in this section.</p>
        </div>
      )}

      {status === 'succeeded' && items.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {items.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-12">
              <button 
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-6 py-3 rounded-full bg-white border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
              >
                Previous
              </button>
              <span className="text-gray-600 font-medium">Page {currentPage} of {totalPages}</span>
              <button 
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-6 py-3 rounded-full bg-primary text-white font-semibold hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm shadow-blue-200"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Shop;
