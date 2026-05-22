import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logoutAdmin } from '../store/authSlice';

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { adminInfo } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logoutAdmin());
  };

  return (
    <nav className="bg-white/80 backdrop-blur-lg shadow-sm sticky top-0 z-50 border-b border-gray-100">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="text-base sm:text-2xl font-black text-primary tracking-tight flex items-center gap-2 sm:gap-3 flex-shrink-0">
          <img src="/logo.png" alt="Jai Maa Ambe V.B. Logo" className="w-8 h-8 sm:w-10 sm:h-10 object-contain rounded-full shadow-sm" />
          <span>Jai Maa Ambe<span className="hidden sm:inline"> V.B.</span></span>
        </Link>
        
        {/* Links */}
        <div className="flex space-x-3 sm:space-x-6 items-center font-bold text-gray-700 text-sm sm:text-base flex-shrink-0">
          <Link to="/shop/Men" className="hover:text-primary transition-colors">Men</Link>
          <Link to="/shop/Women" className="hover:text-primary transition-colors">Women</Link>
          <Link to="/shop/Kids" className="hover:text-primary transition-colors">Kids</Link>
          {adminInfo ? (
            <div className="flex items-center space-x-2 border-l pl-2 border-gray-200">
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
