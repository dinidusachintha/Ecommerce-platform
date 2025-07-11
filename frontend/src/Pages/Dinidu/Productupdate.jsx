// src/components/ProductUpdate.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';

const ProductUpdate = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    productname: '',
    description: '',
    price: '',
    category: 'women',
    stock: '',
    images: [],
  });
  const [newImages, setNewImages] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/products/get/${id}`);
        setFormData(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load product');
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    setNewImages(Array.from(e.target.files));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = new FormData();
    form.append('productname', formData.productname);
    form.append('description', formData.description);
    form.append('price', formData.price);
    form.append('category', formData.category);
    form.append('stock', formData.stock);

    // Append new images if any
    newImages.forEach((file) => {
      form.append('newImages', file);
    });

    try {
      await axios.put(`http://localhost:5000/api/products/update/${id}`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setSuccess('Product updated successfully!');
      setError('');
      setTimeout(() => navigate('/products/list'), 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update product');
      setSuccess('');
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
        <h1 className="mb-8 text-3xl font-bold text-center">Update Product</h1>

        {error && (
          <div className="px-4 py-3 mb-4 text-red-700 bg-red-100 border border-red-400 rounded">
            {error}
          </div>
        )}
        {success && (
          <div className="px-4 py-3 mb-4 text-green-700 bg-green-100 border border-green-400 rounded">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="max-w-2xl p-8 mx-auto bg-white shadow-md rounded-xl" encType="multipart/form-data">
          <div className="mb-4">
            <label className="block mb-2 font-medium text-gray-700">Product Name</label>
            <input
              type="text"
              name="productname"
              value={formData.productname}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-600"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block mb-2 font-medium text-gray-700">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-600"
              rows="4"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block mb-2 font-medium text-gray-700">Price</label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-600"
              required
              min="0"
              step="0.01"
            />
          </div>

          <div className="mb-4">
            <label className="block mb-2 font-medium text-gray-700">Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-600"
              required
            >
              <option value="women">Women's Collection</option>
              <option value="men">Men's Collection</option>
              <option value="kids">Kids Collection</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="block mb-2 font-medium text-gray-700">Existing Images</label>
            <div className="flex flex-wrap gap-2">
              {formData.images.map((image, index) => (
                <img
                  key={index}
                  src={`http://localhost:5000/api/products/images/${image}`}
                  alt={`Product ${index}`}
                  className="object-cover w-24 h-24 rounded"
                />
              ))}
            </div>
          </div>

          <div className="mb-4">
            <label className="block mb-2 font-medium text-gray-700">Upload New Images</label>
            <input
              type="file"
              name="newImages"
              multiple
              onChange={handleFileChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-600"
            />
          </div>

          <div className="mb-4">
            <label className="block mb-2 font-medium text-gray-700">Stock</label>
            <input
              type="number"
              name="stock"
              value={formData.stock}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-600"
              required
              min="0"
            />
          </div>

          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => navigate('/products/list')}
              className="px-6 py-2 text-gray-600 bg-gray-200 rounded-lg hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 text-white bg-pink-600 rounded-lg hover:bg-pink-700"
            >
              Update Product
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
};

export default ProductUpdate;
