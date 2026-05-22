import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logoutAdmin } from '../store/authSlice';
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config';

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { adminInfo } = useSelector((state) => state.auth);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (searchTerm.trim().length < 2) {
        setSuggestions([]);
        return;
      }
      try {
        const res = await axios.get(`${API_BASE_URL}/api/products?search=${searchTerm}&limit=5`);
        if (res.data && Array.isArray(res.data.products)) {
          setSuggestions(res.data.products);
        }
      } catch (err) {
        console.error(err);
      }
    };
    const debounceTimer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchTerm]);

  const handleLogout = () => {
    dispatch(logoutAdmin());
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
      setShowSuggestions(false);
      setSearchTerm('');
    }
  };

  const handleSuggestionClick = (keyword) => {
    navigate(`/search?q=${encodeURIComponent(keyword)}`);
    setShowSuggestions(false);
    setSearchTerm('');
  };

  return (
    <nav className="bg-white/80 backdrop-blur-lg shadow-sm sticky top-0 z-50 border-b border-gray-100">
      <div className="container mx-auto px-4 py-3 flex flex-wrap justify-between items-center gap-4">
        {/* Logo */}
        <Link to="/" className="text-base sm:text-2xl font-black text-primary tracking-tight flex items-center gap-2 sm:gap-3 flex-shrink-0">
          <img src="/logo.png" alt="Jai Maa Ambe V.B. Logo" className="w-8 h-8 sm:w-10 sm:h-10 object-contain rounded-full shadow-sm" />
          <span>Jai Maa Ambe<span className="hidden sm:inline"> V.B.</span></span>
        </Link>
        
        {/* Search Bar */}
        <div className="flex-grow max-w-md mx-2 order-3 sm:order-2 w-full sm:w-auto relative" ref={dropdownRef}>
          <form onSubmit={handleSearchSubmit} className="relative">
            <input 
              type="text" 
              placeholder="Search raincoats..." 
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-primary bg-gray-50 text-sm"
            />
            <svg className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </form>
          
          {/* Autocomplete Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50">
              {suggestions.map((product) => (
                <div 
                  key={product._id} 
                  onClick={() => handleSuggestionClick(product.title)}
                  className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-50 last:border-0 flex items-center gap-3 transition-colors"
                >
                  {product.imageUrls?.[0] || product.imageUrl ? (
                    <img src={product.imageUrls?.[0] || product.imageUrl} alt={product.title} className="w-10 h-10 rounded-md object-cover" />
                  ) : (
                    <div className="w-10 h-10 rounded-md bg-gray-100 flex items-center justify-center">
                      <span className="text-gray-400 text-xs">No img</span>
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-semibold text-dark line-clamp-1">{product.title}</p>
                    <p className="text-xs text-gray-500">Rs. {product.price}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Links */}
        <div className="flex space-x-3 sm:space-x-6 items-center font-bold text-gray-700 text-sm sm:text-base order-2 sm:order-3 flex-shrink-0">
          <Link to="/shop/Men" className="hover:text-primary transition-colors hidden md:inline">Men</Link>
          <Link to="/shop/Women" className="hover:text-primary transition-colors hidden md:inline">Women</Link>
          <Link to="/shop/Kids" className="hover:text-primary transition-colors hidden md:inline">Kids</Link>
          {adminInfo ? (
            <div className="flex items-center space-x-2 border-l md:pl-2 border-gray-200">
              <Link to="/admin/dashboard" className="text-secondary hover:text-emerald-700 text-xs sm:text-sm">Dash</Link>
              <button onClick={handleLogout} className="text-[10px] sm:text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 sm:px-3 sm:py-2 rounded-full transition-colors font-bold cursor-pointer">Logout</button>
            </div>
          ) : (
            <Link to="/admin/login" className="text-xs text-gray-400 hover:text-gray-600 font-medium ml-1 sm:ml-2">Admin</Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
