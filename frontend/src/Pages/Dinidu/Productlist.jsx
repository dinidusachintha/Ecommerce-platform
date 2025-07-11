import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Trash2, Edit } from 'lucide-react';

const ProductList = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/products');
        if (response.data && Array.isArray(response.data.products)) {
          setProducts(response.data.products);
        } else if (Array.isArray(response.data)) {
          // fallback if API sends plain array
          setProducts(response.data);
        } else {
          setProducts([]);
        }
      } catch (err) {
        console.error(err);
        setError('Failed to load products');
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await axios.delete(`http://localhost:5000/api/products/delete/${id}`);
        setProducts(products.filter((p) => p._id !== id));
      } catch (err) {
        console.error(err);
        setError('Failed to delete product');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen pt-24">
        <div className="w-8 h-8 border-4 border-pink-500 rounded-full border-t-transparent animate-spin"></div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen pt-24 pb-12 bg-gray-50"
    >
      <div className="container px-4 mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Product List</h1>
          <button
            onClick={() => navigate('/add-product')}
            className="px-6 py-2 text-white bg-pink-600 rounded-lg hover:bg-pink-700"
          >
            Add New Product
          </button>
        </div>

        {error && (
          <div className="px-4 py-3 mb-4 text-red-700 bg-red-100 border border-red-400 rounded">
            {error}
          </div>
        )}

        <div className="overflow-x-auto bg-white shadow-md rounded-xl">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-6 py-4 text-left">Image</th>
                <th className="px-6 py-4 text-left">Name</th>
                <th className="px-6 py-4 text-left">Category</th>
                <th className="px-6 py-4 text-left">Price</th>
                <th className="px-6 py-4 text-left">Stock</th>
                <th className="px-6 py-4 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(products) && products.length > 0 ? (
                products.map((product) => (
                  <tr key={product._id} className="border-t hover:bg-gray-50">
                    <td className="px-6 py-4">
                      {product.images && product.images.length > 0 ? (
                        <img
                          src={`http://localhost:5000/api/products/images/${product.images[0]}`}
                          alt={product.productname}
                          className="object-cover w-16 h-16 rounded"
                        />
                      ) : (
                        <span className="text-gray-400">No Image</span>
                      )}
                    </td>
                    <td className="px-6 py-4">{product.productname}</td>
                    <td className="px-6 py-4 capitalize">{product.category}</td>
                    <td className="px-6 py-4">${Number(product.price).toFixed(2)}</td>
                    <td className="px-6 py-4">{product.stock}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => navigate(`/products/edit/${product._id}`)}
                          className="p-2 text-blue-600 hover:text-blue-800"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(product._id)}
                          className="p-2 text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="py-6 text-center text-gray-600">
                    No products found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductList;
