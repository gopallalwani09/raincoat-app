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
  const { items, status } = useSelector((state) => state.products);
  
  const [selectedSubcategory, setSelectedSubcategory] = useState('All');
  const [sortOrder, setSortOrder] = useState('asc'); // asc = low to high, desc = high to low

  useEffect(() => {
    dispatch(fetchProducts(category));
    setSelectedSubcategory('All');
    setSortOrder('asc');
  }, [dispatch, category]);

  const filteredAndSortedItems = useMemo(() => {
    let result = [...items];
    
    if (selectedSubcategory !== 'All') {
      result = result.filter(item => item.subcategory === selectedSubcategory);
    }
    
    result.sort((a, b) => {
      if (sortOrder === 'asc') {
        return a.price - b.price;
      } else {
        return b.price - a.price;
      }
    });
    
    return result;
  }, [items, selectedSubcategory, sortOrder]);

  return (
    <div className="py-8">
      <div className="mb-12 text-center">
        <h2 className="text-5xl font-black text-dark mb-4">{category} Collection</h2>
        <p className="text-gray-500">Explore the best raincoats for {category.toLowerCase()}.</p>
      </div>

      {status === 'succeeded' && (
        <div className="mb-8 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
          {/* Subcategories Horizontal Scroller */}
          <div className="flex overflow-x-auto no-scrollbar gap-2 -mx-4 px-4 sm:mx-0 sm:px-0 py-1">
            <button
              onClick={() => setSelectedSubcategory('All')}
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
                onClick={() => setSelectedSubcategory(sub)}
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
                onChange={(e) => setSortOrder(e.target.value)}
                className="bg-transparent text-sm font-semibold text-dark outline-none cursor-pointer focus:outline-none pr-1"
              >
                <option value="asc">Price: Low to High</option>
                <option value="desc">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {status === 'loading' && (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      )}

      {status === 'succeeded' && filteredAndSortedItems.length === 0 && (
        <div className="text-center text-gray-500 py-20 bg-white rounded-3xl border border-gray-100">
          <p className="text-xl">No products found in this section.</p>
        </div>
      )}

      {status === 'succeeded' && filteredAndSortedItems.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredAndSortedItems.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Shop;
