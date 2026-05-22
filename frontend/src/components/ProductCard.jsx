import { useState } from 'react';
import { API_BASE_URL } from '../config';

const ProductCard = ({ product, isAdminMode, onEdit, onDelete }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // Handle both old schema (imageUrl) and new schema (imageUrls)
  const images = product.imageUrls && product.imageUrls.length > 0 
    ? product.imageUrls 
    : (product.imageUrl ? [product.imageUrl] : []);
    
  const getImageUrl = (url) => {
    if (!url) return '';
    return url.startsWith('http') ? url : `${API_BASE_URL}${url}`;
  };
  const currentImage = images.length > 0 ? getImageUrl(images[currentImageIndex]) : '';

  const handleNextImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handlePrevImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };
  return (
    <div className="bg-white rounded-3xl overflow-hidden hover-lift flex flex-col group shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
      <div className="h-60 sm:h-72 overflow-hidden relative bg-gray-50 flex items-center justify-center p-4">
        {currentImage ? (
          <img 
            src={currentImage} 
            alt={product.title} 
            className="max-h-full w-auto object-contain transition-transform duration-500 group-hover:scale-110 drop-shadow-md"
          />
        ) : (
          <div className="text-gray-400">No Image</div>
        )}
        
        {images.length > 1 && (
          <>
            <button 
              onClick={handlePrevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-1 rounded-full shadow-md transition-colors z-10"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </button>
            <button 
              onClick={handleNextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-1 rounded-full shadow-md transition-colors z-10"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </button>
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-10">
              {images.map((_, idx) => (
                <div key={idx} className={`w-1.5 h-1.5 rounded-full ${idx === currentImageIndex ? 'bg-primary' : 'bg-gray-300'}`} />
              ))}
            </div>
          </>
        )}

        <div className="absolute top-4 right-4 flex flex-col gap-2 items-end">
          <div className="bg-white/90 backdrop-blur px-3 py-1 text-xs font-bold rounded-full text-gray-700 shadow-sm border border-gray-100">
            {product.subcategory || product.category}
          </div>
        </div>
      </div>
      <div className="p-4 sm:p-6 flex-grow flex flex-col">
        <h3 className="text-base sm:text-lg font-bold mb-2 text-dark">{product.title}</h3>
        <p className="text-gray-500 text-sm mb-6 flex-grow line-clamp-2 leading-relaxed">{product.description}</p>
        <div className="mt-auto pt-4 border-t border-gray-50 flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <span className="text-xl sm:text-2xl font-black text-primary">Rs. {product.price}</span>
          </div>
          {isAdminMode && (
            <div className="flex gap-2">
              <button 
                onClick={(e) => { e.stopPropagation(); onEdit(product); }}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 rounded-xl text-sm font-bold transition-colors"
              >
                Edit
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); onDelete(product._id); }}
                className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 py-2 rounded-xl text-sm font-bold transition-colors"
              >
                Delete
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
