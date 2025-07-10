import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Heart, RefreshCw, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Home = () => {
  const [activeCategory, setActiveCategory] = useState("women");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const navigate = useNavigate();

  const categories = [
    { id: "women", name: "Women's Collection" },
    { id: "men", name: "Men's Collection" },
    { id: "kids", name: "Kids Collection" },
    { id: "general", name: "General" },
  ];

  // Banner carousel images
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

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/products', {
        params: { category: activeCategory },
      });
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

  // Auto-rotate banner images
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
  };

  const handleAddToWishlist = (product, e) => {
    e.stopPropagation();
    console.log('Added to wishlist:', product.productname);
  };

  const seedSampleData = async () => {
    try {
      setLoading(true);
      await axios.post('http://localhost:5000/api/products/seed');
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
    <div className="min-h-screen bg-gray-50">
      {/* Banner Carousel */}
      <div className="relative overflow-hidden h-96">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentBannerIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0"
          >
            <img
              src={bannerImages[currentBannerIndex].url}
              alt="Banner"
              className="object-cover w-full h-full"
            />
            <div className="absolute inset-0 bg-black bg-opacity-30"></div>
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
            className="flex overflow-hidden bg-white rounded-lg shadow-md"
          >
            {categories.map((category) => (
              <motion.button
                key={category.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveCategory(category.id)}
                className={`px-6 py-3 font-medium transition-all ${
                  activeCategory === category.id
                    ? 'bg-pink-600 text-white'
                    : 'text-gray-600 hover:bg-pink-50'
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
            className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          >
            <AnimatePresence>
              {products.length > 0 ? (
                products.map((product) => (
                  <motion.div
                    key={product._id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    whileHover={{ y: -5 }}
                    className="overflow-hidden transition bg-white border border-gray-100 rounded-md cursor-pointer hover:shadow-md"
                    onClick={() => handleProductClick(product._id)}
                  >
                    <div className="relative overflow-hidden h-72 group">
                      <motion.img
                        src={`http://localhost:5000${product.images[0]}`}
                        alt={product.productname}
                        className="object-cover w-full h-full transition duration-300 group-hover:scale-105"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/400x400?text=No+Image';
                        }}
                      />
                      <div className="absolute top-2 right-2">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => handleAddToWishlist(product, e)}
                          className="p-2 bg-white rounded-full shadow hover:bg-pink-50"
                        >
                          <Heart className="w-4 h-4 text-gray-700" />
                        </motion.button>
                      </div>
                      {product.discount && (
                        <div className="absolute px-2 py-1 text-xs font-bold text-white bg-red-500 rounded-full top-2 left-2">
                          -{product.discount}%
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-medium text-gray-800 text-md line-clamp-1">{product.productname}</h3>
                      <div className="mt-2">
                        <span className="text-lg font-bold text-gray-900">
                          LKR {product.price.toFixed(2)}
                        </span>
                        {product.discount && (
                          <span className="ml-2 text-sm text-gray-400 line-through">
                            LKR {(product.price / (1 - product.discount/100)).toFixed(2)}
                          </span>
                        )}
                      </div>
                      <div className="mt-1 text-sm text-gray-600">
                        or 3 installments of LKR {(product.price / 3).toFixed(2)} with
                      </div>
                      <div className="flex items-center justify-between mt-3">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={(e) => handleAddToCart(product, e)}
                          className="flex items-center gap-1 px-4 py-2 text-sm text-white bg-pink-600 rounded-md hover:bg-pink-700"
                        >
                          <ShoppingCart className="w-4 h-4" />
                          Add to Cart
                        </motion.button>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <span
                              key={i}
                              className={`text-xs ${
                                i < Math.floor(product.rating || 0)
                                  ? 'text-yellow-400'
                                  : 'text-gray-300'
                              }`}
                            >
                              ★
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="py-12 text-center col-span-full"
                >
                  <h3 className="mb-4 text-xl font-medium text-gray-700">No products found</h3>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={seedSampleData}
                    className="px-6 py-3 text-white bg-pink-600 rounded-lg hover:bg-pink-700"
                  >
                    Load Sample Data
                  </motion.button>
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