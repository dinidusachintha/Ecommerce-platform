import React, { useState, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// Set your API base URL here or in environment variables
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const ProductAdd = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    originalPrice: '',
    category: 'women',
    stock: ''
  });

  // Status messages
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('price', formData.price);
      formDataToSend.append('originalPrice', formData.originalPrice || formData.price);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('stock', formData.stock);

      // Append all selected files
      const files = fileInputRef.current.files;
      if (!files || files.length === 0) {
        throw new Error('Please upload at least one image');
      }

      for (let i = 0; i < files.length; i++) {
        formDataToSend.append('images', files[i]);
      }

      const config = {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        withCredentials: true // Include if you need to send cookies
      };

      const response = await axios.post(
        `${API_BASE_URL}/api/products`, 
        formDataToSend, 
        config
      );

      setSuccess('Product added successfully!');
      setTimeout(() => navigate('/'), 2000);
    } catch (error) {
      console.error('Error adding product:', error);
      let errorMessage = 'Failed to add product';
      
      if (error.response) {
        // Server responded with a status code that falls out of 2xx
        if (error.response.status === 404) {
          errorMessage = 'API endpoint not found. Check the server URL.';
        } else if (error.response.data?.message) {
          errorMessage = error.response.data.message;
        } else {
          errorMessage = error.response.statusText;
        }
      } else if (error.request) {
        // Request was made but no response received
        errorMessage = 'No response from server. Is it running?';
      } else {
        // Something happened in setting up the request
        errorMessage = error.message;
      }
      
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container max-w-4xl px-4 py-8 mx-auto">
      <h1 className="mb-6 text-2xl font-bold">Add New Product</h1>
      
      {/* Status Messages */}
      {error && (
        <div className="p-3 mb-4 text-red-700 bg-red-100 border border-red-400 rounded">
          <strong>Error:</strong> {error}
          {error.includes('API endpoint') && (
            <div className="mt-2 text-sm">
              Current API URL: <code>{API_BASE_URL}/api/products</code>
            </div>
          )}
        </div>
      )}
      {success && (
        <div className="p-3 mb-4 text-green-700 bg-green-100 border border-green-400 rounded">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="p-6 bg-white rounded-lg shadow-md">
        {/* Product Name */}
        <div className="mb-4">
          <label className="block mb-2 font-medium text-gray-700">
            Product Name *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {/* Description */}
        <div className="mb-4">
          <label className="block mb-2 font-medium text-gray-700">
            Description *
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows="4"
            required
          />
        </div>

        {/* Price Fields */}
        <div className="grid grid-cols-1 gap-4 mb-4 md:grid-cols-2">
          <div>
            <label className="block mb-2 font-medium text-gray-700">
              Price *
            </label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="0"
              step="0.01"
              required
            />
          </div>
          <div>
            <label className="block mb-2 font-medium text-gray-700">
              Original Price
            </label>
            <input
              type="number"
              name="originalPrice"
              value={formData.originalPrice}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="0"
              step="0.01"
            />
          </div>
        </div>

        {/* Category and Stock */}
        <div className="grid grid-cols-1 gap-4 mb-4 md:grid-cols-2">
          <div>
            <label className="block mb-2 font-medium text-gray-700">
              Category *
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="women">Women</option>
              <option value="men">Men</option>
              <option value="kids">Kids</option>
            </select>
          </div>
          <div>
            <label className="block mb-2 font-medium text-gray-700">
              Stock *
            </label>
            <input
              type="number"
              name="stock"
              value={formData.stock}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="0"
              required
            />
          </div>
        </div>

        {/* Image Upload Section */}
        <div className="mb-6">
          <label className="block mb-2 font-medium text-gray-700">
            Product Images *
          </label>
          
          {/* Upload Controls */}
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={() => fileInputRef.current.click()}
              className="px-4 py-2 text-gray-700 transition-colors bg-gray-100 rounded-lg hover:bg-gray-200"
              disabled={isSubmitting}
            >
              Select Images
            </button>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              multiple
              accept="image/jpeg, image/png, image/webp"
              disabled={isSubmitting}
            />
            <span className="text-sm text-gray-500">
              {fileInputRef.current?.files?.length || 0} images selected
            </span>
          </div>
          <p className="mt-2 text-xs text-gray-500">
            Supported formats: JPG, PNG, WEBP (Max 5MB each)
          </p>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end gap-4 pt-4 border-t">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="px-6 py-2 text-gray-700 transition-colors bg-gray-200 rounded-lg hover:bg-gray-300"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2 text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Adding...' : 'Add Product'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductAdd;