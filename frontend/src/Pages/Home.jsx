import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Heart, RefreshCw, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Home = () => {
  const [activeCategory, setActiveCategory] = useState("women");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const categories = [
    { id: "women", name: "Women's Collection" },
    { id: "men", name: "Men's Collection" },
    { id: "kids", name: "Kids Collection" },
    { id: "general", name: "General" },
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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen pt-24">
        <div className="w-12 h-12 mb-4 border-4 border-pink-500 rounded-full border-t-transparent animate-spin"></div>
        <p className="text-gray-600">Loading products...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-4 pt-24">
        <AlertCircle className="w-16 h-16 text-red-500" />
        <h3 className="mt-4 mb-2 text-xl font-semibold text-gray-800">Error</h3>
        <p className="mb-4 text-gray-600">{error}</p>
        <button
          onClick={fetchProducts}
          className="flex items-center gap-2 px-6 py-3 text-white bg-pink-600 rounded-lg hover:bg-pink-700"
        >
          <RefreshCw className="w-4 h-4" /> Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 bg-gray-50">
      {/* Categories */}
      <div className="flex justify-center mb-8">
        <div className="flex bg-white rounded-lg shadow-md">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                activeCategory === category.id
                  ? 'bg-pink-600 text-white'
                  : 'text-gray-600 hover:bg-pink-50'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
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
        className="grid grid-cols-1 gap-8 px-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      >
        <AnimatePresence>
          {products.length > 0 ? (
            products.map((product) => (
              <motion.div
                key={product._id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="overflow-hidden transition bg-white shadow cursor-pointer rounded-xl hover:shadow-lg"
                onClick={() => handleProductClick(product._id)}
              >
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={`http://localhost:5000${product.images[0]}`}
                    alt={product.productname}
                    className="object-cover w-full h-full"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/400x400?text=No+Image';
                    }}
                  />
                  <div className="absolute flex flex-col gap-2 top-2 right-2">
                    <button
                      onClick={(e) => handleAddToWishlist(product, e)}
                      className="p-2 bg-white rounded-full shadow hover:bg-pink-50"
                    >
                      <Heart className="w-4 h-4 text-gray-700" />
                    </button>
                    <button
                      onClick={(e) => handleAddToCart(product, e)}
                      className="p-2 bg-white rounded-full shadow hover:bg-pink-50"
                    >
                      <ShoppingCart className="w-4 h-4 text-gray-700" />
                    </button>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-800">{product.productname}</h3>
                  <p className="mt-1 text-sm text-gray-600">{product.description}</p>
                  <div className="flex items-center justify-between mt-3">
                    <span className="font-bold text-pink-600">${product.price.toFixed(2)}</span>
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
                      <span className="text-xs text-gray-500">({product.ratingCount})</span>
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
              <button
                onClick={seedSampleData}
                className="px-6 py-3 text-white bg-pink-600 rounded-lg hover:bg-pink-700"
              >
                Load Sample Data
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default Home;
