import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { createProduct, fetchProducts, deleteProduct, updateProduct } from '../store/productsSlice';
import ProductCard from '../components/ProductCard';
import { API_BASE_URL } from '../config';

const subcategoriesMap = {
  Men: ['Plastic Raincoats', 'Reversible Raincoats', 'Taping Raincoats', 'Premium Raincoats'],
  Women: ['Long Raincoats', 'Skirt-Top Raincoats'],
  Kids: ['One Piece Raincoats', 'Two Piece Raincoats']
};

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const fileInputRef = useRef();

  const { adminInfo } = useSelector((state) => state.auth);
  const { items, totalPages, currentPage } = useSelector((state) => state.products);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: 'Men',
    subcategory: subcategoriesMap['Men'][0]
  });
  
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [successMsg, setSuccessMsg] = useState('');
  
  const [editingId, setEditingId] = useState(null);
  const [existingImages, setExistingImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      if (searchTerm !== debouncedSearch) setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm, debouncedSearch]);

  useEffect(() => {
    if (!adminInfo) {
      navigate('/admin/login');
    } else {
      dispatch(fetchProducts({ category: 'All', page, limit: 7, search: debouncedSearch }));
    }
  }, [adminInfo, navigate, dispatch, page, debouncedSearch]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'category') {
      setFormData({ 
        ...formData, 
        [name]: value,
        subcategory: subcategoriesMap[value][0] 
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setImages(files);
      const newPreviews = files.map(file => URL.createObjectURL(file));
      setPreviews(newPreviews);
    }
  };

  const resetForm = () => {
    setFormData({ title: '', description: '', price: '', category: 'Men', subcategory: subcategoriesMap['Men'][0] });
    setImages([]);
    setPreviews([]);
    setEditingId(null);
    setExistingImages([]);
    if(fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!editingId && images.length === 0) return alert('Please select at least one image');
    
    const data = new FormData();
    data.append('title', formData.title);
    data.append('description', formData.description);
    data.append('price', formData.price);
    data.append('category', formData.category);
    data.append('subcategory', formData.subcategory);
    
    images.forEach(img => {
      data.append('images', img);
    });

    setLoading(true);
    if (editingId) {
      existingImages.forEach(img => {
        data.append('existingImages', img);
      });
      
      dispatch(updateProduct({ id: editingId, formData: data })).then((action) => {
        setLoading(false);
        if(action.meta.requestStatus === 'fulfilled') {
            setSuccessMsg('Product updated successfully!');
            resetForm();
            setTimeout(() => setSuccessMsg(''), 3000);
        }
      });
    } else {
      dispatch(createProduct(data)).then((action) => {
          setLoading(false);
          if(action.meta.requestStatus === 'fulfilled') {
              setSuccessMsg('Product added successfully!');
              resetForm();
              setTimeout(() => setSuccessMsg(''), 3000);
          }
      });
    }
  };

  const handleEdit = (product) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setEditingId(product._id);
    setFormData({
      title: product.title,
      description: product.description,
      price: product.price,
      category: product.category,
      subcategory: product.subcategory || subcategoriesMap[product.category][0]
    });
    
    const prodImages = product.imageUrls && product.imageUrls.length > 0 
      ? product.imageUrls 
      : (product.imageUrl ? [product.imageUrl] : []);
      
    setExistingImages(prodImages);
    setPreviews(prodImages.map(img => img.startsWith('http') ? img : `${API_BASE_URL}${img}`));
    setImages([]);
    if(fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      dispatch(deleteProduct(id));
    }
  };

  const removeExistingImage = (indexToRemove) => {
    const updatedExisting = existingImages.filter((_, idx) => idx !== indexToRemove);
    setExistingImages(updatedExisting);
    
    // Also update previews if they are currently showing existing images
    if (images.length === 0) {
      setPreviews(updatedExisting.map(img => img.startsWith('http') ? img : `${API_BASE_URL}${img}`));
    }
  };

  if (!adminInfo) return null;

  const safeItems = Array.isArray(items) ? items : [];

  return (
    <div className="max-w-6xl mx-auto py-6 sm:py-8 px-4">
      <div className="mb-6 sm:mb-8 border-b pb-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-dark">Admin Dashboard</h2>
          <p className="text-gray-500 mt-1 text-sm sm:text-base">Manage store inventory</p>
        </div>
      </div>

      <div className="bg-white p-4 sm:p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-8 md:gap-12 mb-12">
        <div className="flex-1">
          <h3 className="text-xl font-bold mb-6">{editingId ? 'Edit Product' : 'Add New Product'}</h3>
          {successMsg && <div className="bg-green-50 text-green-600 p-4 rounded-xl mb-6 font-medium">{successMsg}</div>}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Product Title</label>
              <input type="text" name="title" value={formData.title} onChange={handleChange} required className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary" placeholder="e.g. Classic Yellow Raincoat" />
            </div>
            
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Price (Rs)</label>
                <input type="number" name="price" value={formData.price} onChange={handleChange} required min="0" step="1" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary" placeholder="0.00" />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                <select name="category" value={formData.category} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary">
                  <option value="Men">Men</option>
                  <option value="Women">Women</option>
                  <option value="Kids">Kids</option>
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Subcategory</label>
                <select name="subcategory" value={formData.subcategory} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary">
                  {subcategoriesMap[formData.category]?.map(sub => (
                    <option key={sub} value={sub}>{sub}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
              <textarea name="description" value={formData.description} onChange={handleChange} required rows="4" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary resize-none" placeholder="Describe the material, fit, and features..."></textarea>
            </div>

            <div className="flex gap-4">
              <button 
                type="submit" 
                disabled={loading} 
                className="flex-1 bg-primary text-white font-bold py-4 rounded-xl hover:bg-blue-600 transition-colors shadow-lg shadow-blue-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (editingId ? 'Updating...' : 'Uploading...') : (editingId ? 'Update Product' : 'Upload Product')}
              </button>
              {editingId && (
                <button type="button" onClick={resetForm} disabled={loading} className="flex-1 bg-gray-100 text-gray-700 font-bold py-4 rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
        
        <div className="flex-1">
           <label className="block text-sm font-semibold text-gray-700 mb-2">Product Images (up to 5)</label>
           <div className="border-2 border-dashed border-gray-200 rounded-2xl h-56 sm:h-72 md:h-80 flex flex-col items-center justify-center relative overflow-hidden bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer group mb-4">
              <input 
                type="file" 
                accept="image/*" 
                multiple
                onChange={handleImageChange} 
                required={!editingId}
                ref={fileInputRef}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
              />
              <div className="text-center p-6 pointer-events-none">
                 <svg className="mx-auto h-12 w-12 text-gray-400 mb-3 group-hover:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                 <p className="text-sm text-gray-500 font-medium">Click or drag images here</p>
                 <p className="text-xs text-gray-400 mt-2">Uploading new images will replace existing previews below</p>
              </div>
           </div>
           
           {previews.length > 0 && (
             <div className="grid grid-cols-4 gap-2">
               {previews.map((preview, idx) => (
                 <div key={idx} className="relative aspect-square border border-gray-200 rounded-lg overflow-hidden">
                   <img src={preview} alt={`preview ${idx}`} className="w-full h-full object-cover" />
                   {editingId && images.length === 0 && (
                     <button 
                       onClick={() => removeExistingImage(idx)}
                       className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                     >
                       ×
                     </button>
                   )}
                 </div>
               ))}
             </div>
           )}
        </div>
      </div>

      <div>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h3 className="text-2xl font-bold">Manage Products</h3>
          <div className="w-full sm:w-64 relative">
            <input 
               type="text" 
               placeholder="Search inventory..." 
               value={searchTerm} 
               onChange={(e) => setSearchTerm(e.target.value)}
               className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-primary bg-gray-50 text-sm"
             />
             <svg className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </div>
        </div>
        {safeItems.length === 0 ? (
          <p className="text-gray-500">No products found.</p>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {safeItems.map(product => (
                <ProductCard 
                  key={product._id} 
                  product={product} 
                  isAdminMode={true} 
                  onEdit={handleEdit} 
                  onDelete={handleDelete} 
                />
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
    </div>
  );
};

export default AdminDashboard;
