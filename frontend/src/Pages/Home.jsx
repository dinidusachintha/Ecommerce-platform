import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Heart, RefreshCw, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Home = () => {
  const [activeCategory, setActiveCategory] = useState("women");
  const [isHovering, setIsHovering] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const navigate = useNavigate();

  // Categories Data
  const categories = [
    {
      id: "women",
      name: "Women's Collection",
      banner: "https://images.unsplash.com/photo-1483985988355-763728e1935b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1800&q=80"
    },
    {
      id: "men",
      name: "Men's Collection",
      banner: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1800&q=80"
    },
    {
      id: "kids",
      name: "Kids Collection",
      banner: "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1800&q=80"
    }
  ];

  // Fetch products from backend
  const fetchProducts = async (showLoader = true) => {
    try {
      if (showLoader) setLoading(true);
      setError(null);
      
      const response = await axios.get('http://localhost:5000/api/products', {
        params: {
          category: activeCategory
        }
      });
      
      setProducts(response.data.data);
      setRetryCount(0);
    } catch (err) {
      console.error('Error fetching products:', err);
      
      let errorMessage = 'Failed to load products. ';
      
      if (err.code === 'ECONNREFUSED' || err.code === 'ERR_NETWORK') {
        errorMessage += 'Please make sure the backend server is running on port 5000.';
      } else if (err.response) {
        errorMessage += `Server error: ${err.response.status} ${err.response.statusText}`;
      } else {
        errorMessage += err.message;
      }
      
      setError(errorMessage);
      setRetryCount(prev => prev + 1);
    } finally {
      if (showLoader) setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchProducts();
  }, []);

  // Fetch when category changes
  useEffect(() => {
    fetchProducts(false);
  }, [activeCategory]);

  // Handle product click
  const handleProductClick = (productId) => {
    navigate(`/products/${productId}`);
  };

  // Handle retry
  const handleRetry = () => {
    fetchProducts();
  };

  // Handle seed data
  const seedSampleData = async () => {
    try {
      setLoading(true);
      await axios.post('http://localhost:5000/api/seed');
      await fetchProducts(false);
    } catch (err) {
      console.error('Error seeding data:', err);
      setError('Failed to seed sample data. Please check the server.');
    } finally {
      setLoading(false);
    }
  };

  // Handle add to cart
  const handleAddToCart = (product, e) => {
    e.stopPropagation();
    console.log('Added to cart:', product.name);
    // Add your cart logic here
  };

  // Handle add to wishlist
  const handleAddToWishlist = (product, e) => {
    e.stopPropagation();
    console.log('Added to wishlist:', product.name);
    // Add your wishlist logic here
  };

  // Animation Variants
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  const hoverScale = {
    scale: 1.03,
    transition: { type: "spring", stiffness: 300 }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen pt-24">
        <div className="w-12 h-12 mb-4 border-4 border-pink-500 rounded-full border-t-transparent animate-spin"></div>
        <p className="text-gray-600">Loading products...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-4 pt-24">
        <div className="max-w-md text-center">
          <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
          <h3 className="mb-2 text-xl font-semibold text-gray-800">Oops! Something went wrong</h3>
          <p className="mb-6 text-gray-600">{error}</p>
          
          <div className="flex justify-center gap-4">
            <button 
              onClick={handleRetry}
              className="flex items-center gap-2 px-6 py-3 text-white transition-colors bg-pink-600 rounded-lg hover:bg-pink-700"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </button>
            
            {retryCount > 0 && (
              <button 
                onClick={seedSampleData}
                className="px-6 py-3 text-white transition-colors bg-gray-600 rounded-lg hover:bg-gray-700"
              >
                Load Sample Data
              </button>
            )}
          </div>
          
          <p className="mt-4 text-sm text-gray-500">
            Make sure your backend server is running on localhost:5000
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 bg-gray-50">
      {/* Full-width Hero Banner */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="relative h-[60vh] w-full overflow-hidden"
      >
        <img
          src={categories.find(cat => cat.id === activeCategory)?.banner}
          alt="Banner"
          className="object-cover w-full h-full"
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="px-4 text-center text-white"
          >
            <h1 className="mb-4 text-4xl font-bold md:text-5xl">
              {categories.find(cat => cat.id === activeCategory)?.name}
            </h1>
            <p className="max-w-2xl mx-auto mb-6 text-lg md:text-xl">
              Discover our curated collection of premium fashion
            </p>
          </motion.div>
        </div>
      </motion.section>

      {/* Category Navigation Tabs */}
      <motion.div
        variants={fadeIn}
        initial="hidden"
        animate="visible"
        className="container px-4 py-12 mx-auto"
      >
        <div className="flex justify-center mb-12">
          <div className="flex p-1 bg-white rounded-lg shadow-lg">
            {categories.map((category) => (
              <motion.button
                key={category.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveCategory(category.id)}
                className={`px-6 py-3 rounded-lg font-medium transition-all ${
                  activeCategory === category.id
                    ? 'bg-pink-600 text-white shadow-md'
                    : 'text-gray-600 hover:bg-pink-50'
                }`}
              >
                {category.name}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        >
          <AnimatePresence mode="wait">
            {products?.map((product) => (
              <motion.div
                key={product._id}
                variants={itemVariants}
                layout
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0, scale: 0.9 }}
                whileHover={hoverScale}
                className="relative overflow-hidden transition-shadow duration-300 bg-white shadow-lg cursor-pointer rounded-xl group hover:shadow-xl"
                onMouseEnter={() => setIsHovering(product._id)}
                onMouseLeave={() => setIsHovering(null)}
                onClick={() => handleProductClick(product._id)}
              >
                {/* Product Image */}
                <div className="relative overflow-hidden h-80">
                  <img
                    src={`http://localhost:5000${product.images[0]}`}
                    alt={product.name}
                    className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/400x400?text=No+Image';
                    }}
                  />
                  
                  {/* Discount Badge */}
                  {product.originalPrice && product.originalPrice > product.price && (
                    <div className="absolute px-2 py-1 text-sm font-medium text-white bg-red-500 rounded-md top-4 left-4">
                      {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                    </div>
                  )}
                  
                  {/* Quick Actions */}
                  <AnimatePresence>
                    {isHovering === product._id && (
                      <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="absolute flex flex-col gap-2 top-4 right-4"
                      >
                        <button 
                          className="p-2 transition-colors bg-white rounded-full shadow-md hover:bg-pink-50"
                          onClick={(e) => handleAddToWishlist(product, e)}
                        >
                          <Heart className="w-5 h-5 text-gray-700" />
                        </button>
                        <button 
                          className="p-2 transition-colors bg-white rounded-full shadow-md hover:bg-pink-50"
                          onClick={(e) => handleAddToCart(product, e)}
                        >
                          <ShoppingCart className="w-5 h-5 text-gray-700" />
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Product Info */}
                <div className="p-5">
                  <h3 className="mb-2 text-lg font-semibold text-gray-800 line-clamp-1">
                    {product.name}
                  </h3>
                  <p className="mb-3 text-sm text-gray-600 line-clamp-2">
                    {product.description}
                  </p>
                  
                  {/* Price and Rating */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-pink-600">
                        ${product.price.toFixed(2)}
                      </span>
                      {product.originalPrice && product.originalPrice > product.price && (
                        <span className="text-sm text-gray-400 line-through">
                          ${product.originalPrice.toFixed(2)}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <div className="flex">
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
                      <span className="text-xs text-gray-500">
                        ({product.reviews || 0})
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Empty State */}
        {products?.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-12"
          >
            <div className="text-center">
              <h3 className="mb-4 text-xl font-medium text-gray-700">
                No products found
              </h3>
              <p className="mb-6 text-gray-500">
                We couldn't find any products in the {activeCategory} category
              </p>
              <button
                onClick={seedSampleData}
                className="px-6 py-3 text-white transition-colors bg-pink-600 rounded-lg hover:bg-pink-700"
              >
                Load Sample Data
              </button>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default Home;