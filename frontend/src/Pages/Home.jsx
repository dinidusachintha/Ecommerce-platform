import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Heart, RefreshCw, AlertCircle, ChevronLeft, ChevronRight, Star, Eye, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000';
const PLACEHOLDER_IMAGE = 'https://via.placeholder.com/400x400/f3f4f6/9ca3af?text=No+Image';

const ProductImage = ({ src, alt, className }) => {
  const [imgSrc, setImgSrc] = useState(PLACEHOLDER_IMAGE);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  
  useEffect(() => {
    setIsLoading(true);
    setHasError(false);
    
    if (!src) {
      setImgSrc(PLACEHOLDER_IMAGE);
      setIsLoading(false);
      return;
    }

    // Create a new image to test if it loads
    const img = new Image();
    
    img.onload = () => {
      setImgSrc(src);
      setIsLoading(false);
      setHasError(false);
    };
    
    img.onerror = () => {
      console.warn(`Failed to load image: ${src}`);
      setImgSrc(PLACEHOLDER_IMAGE);
      setIsLoading(false);
      setHasError(true);
    };
    
    img.src = src;
  }, [src]);

  return (
    <div className={`relative ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="w-8 h-8 border-4 border-pink-500 rounded-full animate-spin border-t-transparent"></div>
        </div>
      )}
      <img
        src={imgSrc}
        alt={alt}
        className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        style={{ display: isLoading ? 'none' : 'block' }}
      />
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="text-center text-gray-500">
            <AlertCircle className="w-8 h-8 mx-auto mb-2" />
            <p className="text-sm">Image not found</p>
          </div>
        </div>
      )}
    </div>
  );
};

const Home = () => {
  const [activeCategory, setActiveCategory] = useState("women");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const [hoveredProduct, setHoveredProduct] = useState(null);
  const navigate = useNavigate();

  const categories = [
    { id: "women", name: "Women's Collection" },
    { id: "men", name: "Men's Collection" },
    { id: "kids", name: "Kids Collection" },
    { id: "general", name: "General" },
  ];

  const bannerImages = [
    {
      url: "https://images.unsplash.com/photo-1483985988355-763728e1935b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
      title: "Summer Collection 2023",
      subtitle: "Discover the latest trends",
      cta: "Shop Now"
    },
    {
      url: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
      title: "New Arrivals",
      subtitle: "Fresh styles for every occasion",
      cta: "Explore"
    },
    {
      url: "https://images.unsplash.com/photo-1551232864-3f0890e580d9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1887&q=80",
      title: "Limited Time Offer",
      subtitle: "Up to 50% off selected items",
      cta: "Get Deal"
    }
  ];

  // Helper function to construct image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    
    // If it's already a full URL, return as is
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    
    // Remove leading slash if present to avoid double slashes
    const cleanPath = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath;
    
    // Construct the full URL
    return `${API_BASE_URL}/${cleanPath}`;
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/products`, {
        params: { category: activeCategory },
      });
      
      console.log('Fetched products:', response.data); // Debug log
      setProducts(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to load products. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [activeCategory]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBannerIndex((prev) => (prev + 1) % bannerImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleProductClick = (productId) => {
    navigate(`/products/${productId}`);
  };

  const handleAddToCart = (product, e) => {
    e.stopPropagation();
    console.log('Added to cart:', product.productname);
    // Add your cart logic here
  };

  const handleAddToWishlist = (product, e) => {
    e.stopPropagation();
    console.log('Added to wishlist:', product.productname);
    // Add your wishlist logic here
  };

  const seedSampleData = async () => {
    try {
      setLoading(true);
      await axios.post(`${API_BASE_URL}/api/products/seed`);
      await fetchProducts();
    } catch (err) {
      console.error('Error seeding data:', err);
      setError('Failed to seed sample data.');
    } finally {
      setLoading(false);
    }
  };

  const nextBanner = () => {
    setCurrentBannerIndex((prev) => (prev + 1) % bannerImages.length);
  };

  const prevBanner = () => {
    setCurrentBannerIndex((prev) => (prev - 1 + bannerImages.length) % bannerImages.length);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen pt-24">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 mb-4 border-4 border-pink-500 rounded-full border-t-transparent"
        ></motion.div>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ repeat: Infinity, repeatType: "reverse", duration: 1 }}
          className="text-gray-600"
        >
          Loading products...
        </motion.p>
      </div>
    );
  }

  if (error) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center min-h-screen px-4 pt-24"
      >
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
        >
          <AlertCircle className="w-16 h-16 text-red-500" />
        </motion.div>
        <h3 className="mt-4 mb-2 text-xl font-semibold text-gray-800">Error</h3>
        <p className="mb-4 text-gray-600">{error}</p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={fetchProducts}
          className="flex items-center gap-2 px-6 py-3 text-white bg-pink-600 rounded-lg hover:bg-pink-700"
        >
          <RefreshCw className="w-4 h-4" /> Try Again
        </motion.button>
      </motion.div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Banner Carousel */}
      <div className="relative overflow-hidden h-96 md:h-[500px] lg:h-[600px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentBannerIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <ProductImage
              src={bannerImages[currentBannerIndex].url}
              alt="Banner"
              className="object-cover w-full h-full"
            />
            <div className="absolute inset-0 bg-black bg-opacity-20"></div>
            <div className="absolute inset-0 flex items-center justify-center text-center">
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="max-w-2xl p-6 text-white"
              >
                <h1 className="mb-4 text-4xl font-bold md:text-5xl">
                  {bannerImages[currentBannerIndex].title}
                </h1>
                <p className="mb-6 text-xl">
                  {bannerImages[currentBannerIndex].subtitle}
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-3 font-medium text-pink-600 bg-white rounded-full"
                >
                  {bannerImages[currentBannerIndex].cta}
                </motion.button>
              </motion.div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Carousel Controls */}
        <button
          onClick={prevBanner}
          className="absolute p-2 text-white -translate-y-1/2 bg-black rounded-full left-4 top-1/2 bg-opacity-30 hover:bg-opacity-50"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button
          onClick={nextBanner}
          className="absolute p-2 text-white -translate-y-1/2 bg-black rounded-full right-4 top-1/2 bg-opacity-30 hover:bg-opacity-50"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* Indicators */}
        <div className="absolute left-0 right-0 flex justify-center gap-2 bottom-4">
          {bannerImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentBannerIndex(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                index === currentBannerIndex
                  ? 'w-6 bg-white'
                  : 'bg-white bg-opacity-50'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="pt-12 pb-20">
        {/* Categories */}
        <div className="flex justify-center mb-8">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex p-2 overflow-hidden bg-white shadow-lg rounded-2xl backdrop-blur-sm"
          >
            {categories.map((category) => (
              <motion.button
                key={category.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveCategory(category.id)}
                className={`px-6 py-3 font-medium transition-all rounded-xl ${
                  activeCategory === category.id
                    ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-lg'
                    : 'text-gray-600 hover:bg-gradient-to-r hover:from-pink-50 hover:to-purple-50'
                }`}
              >
                {category.name}
              </motion.button>
            ))}
          </motion.div>
        </div>

        {/* Products Grid */}
        <div className="px-4">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: { staggerChildren: 0.1 },
              },
            }}
            className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          >
            <AnimatePresence>
              {products.length > 0 ? (
                products.map((product) => {
                  // Get the product image URL
                  const productImageUrl = product.images && product.images.length > 0 
                    ? getImageUrl(product.images[0])
                    : null;
                  
                  console.log('Product image URL:', productImageUrl, 'Original:', product.images?.[0]); // Debug log
                  
                  return (
                    <motion.div
                      key={product._id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      whileHover={{ y: -10 }}
                      className="relative overflow-hidden transition-all duration-300 bg-white shadow-lg cursor-pointer group rounded-3xl hover:shadow-2xl"
                      onClick={() => handleProductClick(product._id)}
                      onMouseEnter={() => setHoveredProduct(product._id)}
                      onMouseLeave={() => setHoveredProduct(null)}
                    >
                      {/* Product Image Container */}
                      <div className="relative overflow-hidden h-80 rounded-t-3xl">
                        <ProductImage
                          src={productImageUrl}
                          alt={product.productname}
                          className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
                        />
                        
                        {/* Gradient overlay */}
                        <div className="absolute inset-0 transition-opacity duration-300 opacity-0 bg-gradient-to-t from-black/20 via-transparent to-transparent group-hover:opacity-100" />
                        
                        {/* Action buttons */}
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ 
                            opacity: hoveredProduct === product._id ? 1 : 0,
                            scale: hoveredProduct === product._id ? 1 : 0.8
                          }}
                          transition={{ duration: 0.2 }}
                          className="absolute flex flex-col gap-2 top-4 right-4"
                        >
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={(e) => handleAddToWishlist(product, e)}
                            className="p-3 transition-all duration-200 rounded-full shadow-lg bg-white/90 backdrop-blur-sm hover:bg-white"
                          >
                            <Heart className="w-5 h-5 text-red-500" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={(e) => e.stopPropagation()}
                            className="p-3 transition-all duration-200 rounded-full shadow-lg bg-white/90 backdrop-blur-sm hover:bg-white"
                          >
                            <Eye className="w-5 h-5 text-gray-600" />
                          </motion.button>
                        </motion.div>

                        {/* Discount badge */}
                        {product.discount && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute px-3 py-1 text-sm font-bold text-white rounded-full shadow-lg top-4 left-4 bg-gradient-to-r from-red-500 to-pink-500"
                          >
                            -{product.discount}% OFF
                          </motion.div>
                        )}

                        {/* Quick add to cart button */}
                        <motion.button
                          initial={{ y: 100, opacity: 0 }}
                          animate={{ 
                            y: hoveredProduct === product._id ? 0 : 100,
                            opacity: hoveredProduct === product._id ? 1 : 0
                          }}
                          transition={{ duration: 0.3 }}
                          onClick={(e) => handleAddToCart(product, e)}
                          className="absolute flex items-center justify-center gap-2 py-3 font-medium text-white transition-all duration-200 shadow-lg bottom-4 left-4 right-4 bg-gradient-to-r from-pink-600 to-purple-600 rounded-2xl hover:shadow-xl"
                        >
                          <Plus className="w-5 h-5" />
                          Quick Add
                        </motion.button>
                      </div>

                      {/* Product Info */}
                      <div className="p-6">
                        <h3 className="mb-2 text-lg font-semibold text-gray-800 transition-colors line-clamp-1 group-hover:text-pink-600">
                          {product.productname}
                        </h3>
                        
                        {/* Rating */}
                        <div className="flex items-center gap-1 mb-3">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < Math.floor(product.rating || 4)
                                  ? 'text-yellow-400 fill-current'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                          <span className="ml-2 text-sm text-gray-500">
                            ({product.rating || 4.0})
                          </span>
                        </div>
                        
                        {/* Price */}
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-2xl font-bold text-gray-900">
                            LKR {product.price.toFixed(2)}
                          </span>
                          {product.discount && (
                            <span className="text-lg text-gray-400 line-through">
                              LKR {(product.price / (1 - product.discount/100)).toFixed(2)}
                            </span>
                          )}
                        </div>
                        
                        {/* Installment info */}
                        <div className="mb-4 text-sm text-gray-600">
                          or 3 payments of <span className="font-semibold">LKR {(product.price / 3).toFixed(2)}</span>
                        </div>
                        
                        {/* Add to cart button */}
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={(e) => handleAddToCart(product, e)}
                          className="flex items-center justify-center w-full gap-2 py-3 font-medium text-white transition-all duration-200 shadow-lg bg-gradient-to-r from-pink-600 to-purple-600 rounded-2xl hover:shadow-xl"
                        >
                          <ShoppingCart className="w-5 h-5" />
                          Add to Cart
                        </motion.button>
                      </div>
                    </motion.div>
                  );
                })
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="py-12 text-center col-span-full"
                >
                  <div className="max-w-md p-8 mx-auto bg-white shadow-lg rounded-3xl">
                    <h3 className="mb-4 text-xl font-medium text-gray-700">No products found</h3>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={seedSampleData}
                      className="px-6 py-3 text-white transition-all duration-200 bg-gradient-to-r from-pink-600 to-purple-600 rounded-2xl hover:shadow-lg"
                    >
                      Load Sample Data
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Home;